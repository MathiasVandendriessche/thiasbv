export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: 'too_large' | 'invalid_json' };

const TOO_LARGE = { ok: false, reason: 'too_large' } as const;
const INVALID = { ok: false, reason: 'invalid_json' } as const;

/**
 * Reads a JSON body without ever buffering more than `maxBytes`.
 * Rejects early on a too-large content-length, and aborts a streamed
 * (e.g. chunked) body as soon as the running total exceeds the cap.
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  const declared = request.headers.get('content-length');
  if (declared !== null) {
    const n = Number(declared);
    if (Number.isFinite(n) && n > maxBytes) return TOO_LARGE;
  }
  if (!request.body) return INVALID;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return TOO_LARGE;
      }
      chunks.push(value);
    }
  } catch {
    return INVALID;
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return INVALID;
  }
}
