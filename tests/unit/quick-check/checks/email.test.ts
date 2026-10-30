import { describe, expect, it, vi } from 'vitest';
import { checkEmail, gradeEmail, type ResolveTxt } from '@/lib/quick-check/checks/email';
import { MESSAGE_KEYS } from '@/lib/quick-check/messages';

const SPF = 'v=spf1 include:spf.protection.outlook.com -all';

describe('gradeEmail', () => {
  it('is bad when both are missing', () => {
    expect(gradeEmail(null, null)).toMatchObject({ id: 'email', status: 'bad', messageKey: 'email.missingBoth' });
  });

  it('warns when one is missing', () => {
    expect(gradeEmail(SPF, null)).toMatchObject({ status: 'warn', messageKey: 'email.noDmarc' });
    expect(gradeEmail(null, 'v=DMARC1; p=reject')).toMatchObject({ status: 'warn', messageKey: 'email.noSpf' });
  });

  it('warns for the thiasbv.com records (p=none)', () => {
    expect(gradeEmail(SPF, 'v=DMARC1; p=none')).toMatchObject({ status: 'warn', messageKey: 'email.dmarcNone' });
  });

  it('warns for +all, ?all and bare all', () => {
    for (const all of ['+all', '?all', 'all']) {
      expect(gradeEmail(`v=spf1 include:a.example ${all}`, 'v=DMARC1; p=reject').messageKey).toBe('email.spfWeak');
    }
  });

  it('is good for ~all or -all with quarantine/reject, case-insensitively', () => {
    expect(gradeEmail('v=spf1 a ~all', 'v=DMARC1; p=quarantine').status).toBe('good');
    expect(gradeEmail('V=SPF1 a -ALL', 'v=dmarc1; P=REJECT; rua=mailto:x@y.z').status).toBe('good');
  });

  it('treats a missing p= as none', () => {
    expect(gradeEmail(SPF, 'v=DMARC1; rua=mailto:x@y.z').messageKey).toBe('email.dmarcNone');
  });

  it('warns on multiple SPF records', () => {
    expect(gradeEmail(SPF, 'v=DMARC1; p=reject', 2)).toMatchObject({ status: 'warn', messageKey: 'email.spfMultiple' });
  });
});

function resolver(map: Record<string, string[][] | { code: string }>): ResolveTxt {
  return (async (name: string) => {
    const v = map[name];
    if (!v) throw Object.assign(new Error('x'), { code: 'ENOTFOUND' });
    if (!Array.isArray(v)) throw Object.assign(new Error('x'), { code: v.code });
    return v;
  }) as unknown as ResolveTxt;
}

describe('checkEmail', () => {
  it('reads SPF and DMARC for the domain (thiasbv.com records -> warn)', async () => {
    const r = await checkEmail(
      'thiasbv.com',
      resolver({
        'thiasbv.com': [['google-site-verification=abc'], [SPF]],
        '_dmarc.thiasbv.com': [['v=DMARC1; p=none']],
      }),
    );
    expect(r).toMatchObject({ status: 'warn', messageKey: 'email.dmarcNone' });
  });

  it('joins chunked TXT strings', async () => {
    const r = await checkEmail(
      'a.example',
      resolver({
        'a.example': [['v=spf1 include:a.example ', '-all']],
        '_dmarc.a.example': [['v=DMARC1; p=rej', 'ect']],
      }),
    );
    expect(r.status).toBe('good');
  });

  it('treats ENOTFOUND and ENODATA as missing records', async () => {
    const r = await checkEmail('a.example', resolver({ 'a.example': { code: 'ENODATA' } }));
    expect(r).toMatchObject({ status: 'bad', messageKey: 'email.missingBoth' });
  });

  it('warns on multiple SPF records', async () => {
    const r = await checkEmail(
      'a.example',
      resolver({ 'a.example': [[SPF], ['v=spf1 -all']], '_dmarc.a.example': [['v=DMARC1; p=reject']] }),
    );
    expect(r.messageKey).toBe('email.spfMultiple');
  });

  it('is unavailable on other DNS errors', async () => {
    const r = await checkEmail('a.example', resolver({ 'a.example': { code: 'ESERVFAIL' } }));
    expect(r).toMatchObject({ status: 'unavailable', messageKey: 'email.unavailable' });
  });

  it('is unavailable after the 4 s timeout', async () => {
    const never = (() => new Promise(() => {})) as unknown as ResolveTxt;
    vi.useFakeTimers();
    try {
      const p = checkEmail('a.example', never);
      await vi.advanceTimersByTimeAsync(4001);
      expect((await p).status).toBe('unavailable');
    } finally {
      vi.useRealTimers();
    }
  });

  it('only returns known message keys', async () => {
    const rs = [
      gradeEmail(null, null),
      gradeEmail(SPF, null),
      gradeEmail(null, 'v=DMARC1; p=reject'),
      gradeEmail(SPF, 'v=DMARC1; p=none'),
      gradeEmail('v=spf1 +all', 'v=DMARC1; p=reject'),
      gradeEmail(SPF, 'v=DMARC1; p=reject', 2),
      gradeEmail(SPF, 'v=DMARC1; p=reject'),
      await checkEmail('a.example', resolver({ 'a.example': { code: 'ESERVFAIL' } })),
    ];
    for (const r of rs) expect(MESSAGE_KEYS).toContain(r.messageKey);
  });
});
