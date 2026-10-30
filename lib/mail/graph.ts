export interface MailMessage {
  subject: string;
  text: string;
  replyTo?: string;
}

export type MailErrorCode = 'config_missing' | 'token_failed' | 'send_failed';

export class MailError extends Error {
  readonly code: MailErrorCode;

  constructor(code: MailErrorCode) {
    super(code);
    this.name = 'MailError';
    this.code = code;
  }
}

interface MailDeps {
  fetch?: typeof fetch;
  env?: NodeJS.ProcessEnv;
  /** Per-request time-out; defaults to GRAPH_TIMEOUT_MS. */
  timeoutMs?: number;
}

/** A stalled Microsoft endpoint must never hang the API route. */
export const GRAPH_TIMEOUT_MS = 10_000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

function requireEnv(env: NodeJS.ProcessEnv) {
  const { MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MAIL_SENDER, MAIL_TO } = env;
  if (!MS_TENANT_ID || !MS_CLIENT_ID || !MS_CLIENT_SECRET || !MAIL_SENDER || !MAIL_TO) {
    throw new MailError('config_missing');
  }
  return {
    tenantId: MS_TENANT_ID,
    clientId: MS_CLIENT_ID,
    clientSecret: MS_CLIENT_SECRET,
    sender: MAIL_SENDER,
    to: MAIL_TO,
  };
}

async function requestToken(
  doFetch: typeof fetch,
  cfg: ReturnType<typeof requireEnv>,
  timeoutMs: number
): Promise<string> {
  let res: Response;
  try {
    res = await doFetch(
      `https://login.microsoftonline.com/${encodeURIComponent(cfg.tenantId)}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'https://graph.microsoft.com/.default',
          client_id: cfg.clientId,
          client_secret: cfg.clientSecret,
        }).toString(),
        signal: AbortSignal.timeout(timeoutMs),
      }
    );
  } catch {
    throw new MailError('token_failed');
  }
  if (!res.ok) throw new MailError('token_failed');
  // A time-out while reading the body rejects here and maps to token_failed too.
  const data = (await res.json().catch(() => null)) as { access_token?: unknown } | null;
  if (!data || typeof data.access_token !== 'string' || !data.access_token) {
    throw new MailError('token_failed');
  }
  return data.access_token;
}

/**
 * Sends a plain-text mail through Microsoft Graph (client credentials).
 * Nothing about the message is ever logged or kept; the token is not cached.
 */
export async function sendMail(msg: MailMessage, deps: MailDeps = {}): Promise<void> {
  const doFetch = deps.fetch ?? fetch;
  const timeoutMs = deps.timeoutMs ?? GRAPH_TIMEOUT_MS;
  const cfg = requireEnv(deps.env ?? process.env);
  const token = await requestToken(doFetch, cfg, timeoutMs);

  const message = {
    subject: msg.subject.replace(/[\r\n]+/g, ' '),
    body: { contentType: 'Text', content: msg.text },
    toRecipients: [{ emailAddress: { address: cfg.to } }],
    ...(msg.replyTo ? { replyTo: [{ emailAddress: { address: msg.replyTo } }] } : {}),
  };

  let res: Response;
  try {
    res = await doFetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(cfg.sender)}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, saveToSentItems: false }),
        signal: AbortSignal.timeout(timeoutMs),
      }
    );
  } catch {
    throw new MailError('send_failed');
  }
  if (res.status !== 202) throw new MailError('send_failed');
}
