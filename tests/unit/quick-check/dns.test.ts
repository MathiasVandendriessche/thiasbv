import { describe, expect, it, vi } from 'vitest';
import { Resolver } from 'node:dns/promises';
import {
  getDnsResolver,
  memoizeResolver,
  resolveAllAddresses,
  type FamilyResolver,
} from '@/lib/quick-check/net/dns';
import { assertPublicHost, BlockedTargetError, DnsLookupError } from '@/lib/quick-check/net/ssrf-guard';

const dnsError = (code: string) => Object.assign(new Error(code), { code });

type Answer = string[] | Error;

function fake(v4: Answer, v6: Answer): FamilyResolver & {
  resolve4: ReturnType<typeof vi.fn>;
  resolve6: ReturnType<typeof vi.fn>;
} {
  const answer = (a: Answer) => vi.fn(async () => {
    if (a instanceof Error) throw a;
    return a;
  });
  return { resolve4: answer(v4), resolve6: answer(v6) };
}

describe('resolveAllAddresses', () => {
  it('collects A and AAAA records from parallel queries', async () => {
    const r = fake(['93.184.216.34'], ['2606:2800:220:1::1']);
    await expect(resolveAllAddresses('voorbeeld.be', r)).resolves.toEqual([
      '93.184.216.34',
      '2606:2800:220:1::1',
    ]);
    expect(r.resolve4).toHaveBeenCalledWith('voorbeeld.be');
    expect(r.resolve6).toHaveBeenCalledWith('voorbeeld.be');
  });

  it.each(['ENODATA', 'ENOTFOUND'])('accepts %s on one family when the other has addresses', async (code) => {
    await expect(resolveAllAddresses('a.be', fake(['93.184.216.34'], dnsError(code)))).resolves.toEqual([
      '93.184.216.34',
    ]);
    await expect(resolveAllAddresses('a.be', fake(dnsError(code), ['2606:2800:220:1::1']))).resolves.toEqual([
      '2606:2800:220:1::1',
    ]);
  });

  it('rejects when both families have no records', async () => {
    await expect(
      resolveAllAddresses('a.be', fake(dnsError('ENOTFOUND'), dnsError('ENODATA'))),
    ).rejects.toMatchObject({ code: expect.stringMatching(/ENOTFOUND|ENODATA/) });
  });

  it('rejects when one family fails for another reason, even if the other answered', async () => {
    await expect(
      resolveAllAddresses('a.be', fake(['93.184.216.34'], dnsError('ETIMEOUT'))),
    ).rejects.toMatchObject({ code: 'ETIMEOUT' });
    await expect(
      resolveAllAddresses('a.be', fake(dnsError('ESERVFAIL'), ['2606:2800:220:1::1'])),
    ).rejects.toMatchObject({ code: 'ESERVFAIL' });
  });

  it('returns [] when both queries succeed empty', async () => {
    await expect(resolveAllAddresses('a.be', fake([], []))).resolves.toEqual([]);
  });

  it('keeps assertPublicHost fail-closed for every outcome', async () => {
    const via = (r: FamilyResolver) => (host: string) => resolveAllAddresses(host, r);
    // A private address in either family blocks the host.
    await expect(
      assertPublicHost('a.be', via(fake(['93.184.216.34'], ['fd00::1']))),
    ).rejects.toBeInstanceOf(BlockedTargetError);
    await expect(
      assertPublicHost('a.be', via(fake(['10.0.0.1'], dnsError('ENODATA')))),
    ).rejects.toBeInstanceOf(BlockedTargetError);
    // Nothing found / lookup failure → DnsLookupError; empty answers → blocked.
    await expect(
      assertPublicHost('a.be', via(fake(dnsError('ENOTFOUND'), dnsError('ENOTFOUND')))),
    ).rejects.toBeInstanceOf(DnsLookupError);
    await expect(
      assertPublicHost('a.be', via(fake(['93.184.216.34'], dnsError('ETIMEOUT')))),
    ).rejects.toBeInstanceOf(DnsLookupError);
    await expect(assertPublicHost('a.be', via(fake([], [])))).rejects.toBeInstanceOf(BlockedTargetError);
  });
});

describe('getDnsResolver', () => {
  it('returns one shared c-ares Resolver', () => {
    const r = getDnsResolver();
    expect(r).toBeInstanceOf(Resolver);
    expect(getDnsResolver()).toBe(r);
  });
});

describe('memoizeResolver', () => {
  it('resolves each host once, case-insensitively', async () => {
    const inner = vi.fn(async (host: string) => [host === 'b.be' ? '93.184.216.35' : '93.184.216.34']);
    const resolve = memoizeResolver(inner);
    await Promise.all([resolve('a.be'), resolve('A.be'), resolve('a.be')]);
    await resolve('b.be');
    expect(inner).toHaveBeenCalledTimes(2);
  });

  it('also remembers a failure instead of retrying', async () => {
    const inner = vi.fn(async () => {
      throw dnsError('ETIMEOUT');
    });
    const resolve = memoizeResolver(inner);
    await expect(resolve('a.be')).rejects.toMatchObject({ code: 'ETIMEOUT' });
    await expect(resolve('a.be')).rejects.toMatchObject({ code: 'ETIMEOUT' });
    expect(inner).toHaveBeenCalledTimes(1);
  });
});
