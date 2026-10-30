import { describe, expect, it, vi } from 'vitest';
import { isValidEmail, MailError, sendMail } from '@/lib/mail/graph';

const env = {
  MS_TENANT_ID: 'tenant-1',
  MS_CLIENT_ID: 'client-1',
  MS_CLIENT_SECRET: 'secret-1',
  MAIL_SENDER: 'm@thiasbv.com',
  MAIL_TO: 'm@thiasbv.com',
} as unknown as NodeJS.ProcessEnv;

function makeFetch(sendStatus = 202) {
  return vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'tok-123' }), { status: 200 })
    )
    .mockResolvedValueOnce(new Response(null, { status: sendStatus }));
}

const msg = { subject: 'Hallo', text: 'Body', replyTo: 'bezoeker@example.com' };

describe('sendMail', () => {
  it('requests token with client credentials', async () => {
    const fetch = makeFetch();
    await sendMail(msg, { fetch: fetch as unknown as typeof globalThis.fetch, env });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token');
    expect(init.method).toBe('POST');
    const params = new URLSearchParams(init.body as string);
    expect(params.get('grant_type')).toBe('client_credentials');
    expect(params.get('scope')).toBe('https://graph.microsoft.com/.default');
    expect(params.get('client_id')).toBe('client-1');
    expect(params.get('client_secret')).toBe('secret-1');
  });

  it('sends text mail via Graph', async () => {
    const fetch = makeFetch();
    await sendMail(msg, { fetch: fetch as unknown as typeof globalThis.fetch, env });
    const [url, init] = fetch.mock.calls[1];
    expect(url).toBe('https://graph.microsoft.com/v1.0/users/m%40thiasbv.com/sendMail');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok-123');
    const body = JSON.parse(init.body as string);
    expect(body.message.body.contentType).toBe('Text');
    expect(body.message.body.content).toBe('Body');
    expect(body.message.toRecipients[0].emailAddress.address).toBe('m@thiasbv.com');
    expect(body.message.replyTo[0].emailAddress.address).toBe(msg.replyTo);
    expect(body.saveToSentItems).toBe(false);
  });

  it('omits replyTo when not given', async () => {
    const fetch = makeFetch();
    await sendMail({ subject: 's', text: 't' }, { fetch: fetch as unknown as typeof globalThis.fetch, env });
    const body = JSON.parse(fetch.mock.calls[1][1].body as string);
    expect(body.message.replyTo).toBeUndefined();
  });

  it('strips newlines from subject', async () => {
    const fetch = makeFetch();
    await sendMail({ subject: 'a\r\nBcc: x', text: 't' }, { fetch: fetch as unknown as typeof globalThis.fetch, env });
    const body = JSON.parse(fetch.mock.calls[1][1].body as string);
    expect(body.message.subject).toBe('a Bcc: x');
  });

  it('throws config_missing when env incomplete', async () => {
    const fetch = vi.fn();
    const bad = { ...env, MS_CLIENT_SECRET: '' } as NodeJS.ProcessEnv;
    await expect(
      sendMail(msg, { fetch: fetch as unknown as typeof globalThis.fetch, env: bad })
    ).rejects.toMatchObject({ code: 'config_missing' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws token_failed when the token request fails', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('no', { status: 401 }));
    const error = await sendMail(msg, {
      fetch: fetch as unknown as typeof globalThis.fetch,
      env,
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(MailError);
    expect(error).toMatchObject({ code: 'token_failed' });
  });

  it('throws send_failed on non-202', async () => {
    const fetch = makeFetch(403);
    await expect(
      sendMail(msg, { fetch: fetch as unknown as typeof globalThis.fetch, env })
    ).rejects.toMatchObject({ code: 'send_failed' });
  });
});

describe('isValidEmail', () => {
  it('accepts a simple address', () => {
    expect(isValidEmail('a@b.be')).toBe(true);
  });
  it.each(['a@b', 'a b@c.be', 'x'.repeat(250) + '@b.be', 'a@b.be\n', ''])(
    'rejects %j',
    (v) => {
      expect(isValidEmail(v)).toBe(false);
    }
  );
});
