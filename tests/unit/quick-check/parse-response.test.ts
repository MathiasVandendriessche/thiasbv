import { describe, expect, it } from 'vitest';
import { parseQuickCheckResponse, parseScanRequestResponse } from '@/lib/quick-check/parse-response';

const report = {
  domain: 'voorbeeld.be',
  checkedAt: '2026-10-30T10:00:00.000Z',
  results: [
    { id: 'tls', status: 'good', messageKey: 'tls.good', params: { days: 60 } },
    { id: 'headers', status: 'bad', messageKey: 'headers.missing', params: { missing: 'CSP', count: 1 } },
    { id: 'cookies', status: 'good', messageKey: 'cookies.none' },
    { id: 'email', status: 'unavailable', messageKey: 'email.unavailable' },
  ],
  summary: { ok: 2, total: 3 },
};

describe('parseQuickCheckResponse', () => {
  it('accepts a valid report', () => {
    expect(parseQuickCheckResponse({ success: true, data: report })).toEqual({ ok: true, report });
  });

  it.each(['invalid_domain', 'rate_limited', 'blocked', 'unavailable'])('maps error %s', (error) => {
    expect(parseQuickCheckResponse({ success: false, error })).toEqual({ ok: false, error });
  });

  it('maps an unknown error code to unavailable', () => {
    expect(parseQuickCheckResponse({ success: false, error: 'boom' })).toEqual({ ok: false, error: 'unavailable' });
  });

  it.each([
    ['null', null],
    ['a string', 'x'],
    ['no results', { success: true, data: { ...report, results: 'x' } }],
    ['unknown status', { success: true, data: { ...report, results: [{ ...report.results[0], status: 'great' }] } }],
    ['unknown id', { success: true, data: { ...report, results: [{ ...report.results[0], id: 'dns' }] } }],
    ['non-scalar param', { success: true, data: { ...report, results: [{ ...report.results[0], params: { days: {} } }] } }],
    ['bad summary', { success: true, data: { ...report, summary: { ok: '2', total: 3 } } }],
    ['missing domain', { success: true, data: { ...report, domain: 5 } }],
  ])('rejects a malformed body (%s) as unavailable', (_, body) => {
    expect(parseQuickCheckResponse(body)).toEqual({ ok: false, error: 'unavailable' });
  });
});

describe('parseScanRequestResponse', () => {
  it('accepts success', () => {
    expect(parseScanRequestResponse({ success: true })).toEqual({ ok: true });
  });
  it.each(['invalid', 'rate_limited', 'unavailable'])('maps error %s', (error) => {
    expect(parseScanRequestResponse({ success: false, error })).toEqual({ ok: false, error });
  });
  it('maps anything else to unavailable', () => {
    expect(parseScanRequestResponse({ nope: 1 })).toEqual({ ok: false, error: 'unavailable' });
  });
});
