import { describe, expect, it } from 'vitest';
import { readJsonBody } from '@/lib/http/read-json-body';

const post = (body: BodyInit, headers: Record<string, string> = {}) =>
  new Request('http://localhost/x', { method: 'POST', body, headers, ...(typeof body === 'object' && !(body instanceof Uint8Array) ? { duplex: 'half' } : {}) } as RequestInit);

describe('readJsonBody', () => {
  it('parses a small JSON body', async () => {
    expect(await readJsonBody(post('{"a":1}'), 1024)).toEqual({ ok: true, value: { a: 1 } });
  });

  it('accepts a body of exactly maxBytes', async () => {
    const body = JSON.stringify({ a: 'x'.repeat(10) });
    const r = await readJsonBody(post(body), Buffer.byteLength(body));
    expect(r.ok).toBe(true);
  });

  it('rejects invalid JSON, empty and invalid UTF-8', async () => {
    expect(await readJsonBody(post('nope'), 1024)).toEqual({ ok: false, reason: 'invalid_json' });
    expect(await readJsonBody(post(''), 1024)).toEqual({ ok: false, reason: 'invalid_json' });
    expect(await readJsonBody(post(new Uint8Array([0x22, 0xff, 0x22])), 1024)).toEqual({ ok: false, reason: 'invalid_json' });
  });

  it('rejects early on a large content-length without reading', async () => {
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({ pull() {}, cancel() { cancelled = true; } });
    const r = await readJsonBody(post(stream, { 'content-length': '5000' }), 1024);
    expect(r).toEqual({ ok: false, reason: 'too_large' });
    expect(cancelled).toBe(false); // rejected from the header alone; body never consumed
  });

  it('aborts a streamed body once it exceeds the cap and cancels the stream', async () => {
    let cancelled = false;
    let pulls = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(c) { pulls++; c.enqueue(new Uint8Array(400)); },
      cancel() { cancelled = true; },
    });
    const r = await readJsonBody(post(stream), 1024);
    expect(r).toEqual({ ok: false, reason: 'too_large' });
    expect(cancelled).toBe(true);
    expect(pulls).toBeLessThan(10);
  });

  it('lets a lying content-length not bypass the cap', async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(c) { c.enqueue(new Uint8Array(600)); },
    });
    expect(await readJsonBody(post(stream, { 'content-length': '10' }), 1024)).toEqual({ ok: false, reason: 'too_large' });
  });
});
