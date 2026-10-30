import { describe, expect, it } from 'vitest';
import { isJsonRequest } from '@/lib/http/is-json-request';

function req(type: string) {
  return new Request('http://localhost/api/x', {
    method: 'POST',
    headers: { 'content-type': type },
    body: '{}',
  });
}

describe('isJsonRequest', () => {
  it.each([
    'application/json',
    'Application/JSON',
    'application/json; charset=utf-8',
    'application/json;charset=UTF-8',
    '  application/json  ',
  ])('accepts %s', (type) => {
    expect(isJsonRequest(req(type))).toBe(true);
  });

  it.each([
    'text/plain',
    'text/plain;charset=UTF-8',
    'application/x-www-form-urlencoded',
    'multipart/form-data; boundary=x',
    'application/jsonp',
    'application/json-patch+json',
    'text/plain; application/json',
    '',
  ])('rejects %s', (type) => {
    expect(isJsonRequest(req(type))).toBe(false);
  });

  it('rejects a request without content-type', () => {
    const r = new Request('http://localhost/api/x', { method: 'POST' });
    expect(isJsonRequest(r)).toBe(false);
  });
});
