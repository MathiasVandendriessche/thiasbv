import { describe, expect, it, vi } from 'vitest';
import {
  BlockedTargetError,
  DnsLookupError,
  assertPublicHost,
  isPrivateAddress,
} from '@/lib/quick-check/net/ssrf-guard';

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '255.255.255.255',
    '198.18.0.1',
    '::1',
    '::',
    'fe80::1',
    'fc00::1',
    'fd12::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '64:ff9b::a00:1',
    '2001:db8::1',
  ])('blocks %s', (ip) => {
    expect(isPrivateAddress(ip)).toBe(true);
  });

  it.each(['8.8.8.8', '172.32.0.1', '2a00:1450::1'])('allows %s', (ip) => {
    expect(isPrivateAddress(ip)).toBe(false);
  });

  it.each([
    '',
    'not-an-ip',
    '256.1.1.1',
    '1.2.3',
    '1.2.3.4.5',
    '::ffff:999.0.0.1',
    'gggg::1',
    ' 8.8.8.8',
  ])('fails closed on unparseable input %j', (ip) => {
    expect(isPrivateAddress(ip)).toBe(true);
  });

  describe('extra reserved ranges', () => {
    it.each([
      '192.0.2.1', // TEST-NET-1
      '198.51.100.1', // TEST-NET-2
      '203.0.113.1', // TEST-NET-3
      '192.0.0.8', // IETF protocol assignments
      '192.88.99.1', // 6to4 relay anycast
      '240.0.0.1', // reserved
      'fe80::1%eth0', // link-local with zone id
      'fec0::1', // site-local (deprecated)
      'ff02::1', // multicast
      '::7f00:1', // IPv4-compatible
      '::ffff:10.0.0.1', // mapped private
      '::ffff:a9fe:a9fe', // mapped metadata, hex form
      '0:0:0:0:0:ffff:7f00:1', // mapped loopback, full form
      '64:ff9b::127.0.0.1', // NAT64 loopback
      '64:ff9b:1::1', // local-use NAT64
      '2002:a00:1::1', // 6to4 embedding 10.0.0.1
      '2002:7f00:1::1', // 6to4 embedding 127.0.0.1
      '2001::1', // Teredo
      '2001:10::1', // ORCHID
      '3fff::1', // documentation (RFC 9637)
      '100::1', // discard
      '4000::1', // outside global unicast
    ])('blocks %s', (ip) => {
      expect(isPrivateAddress(ip)).toBe(true);
    });

    it.each([
      '::ffff:8.8.8.8', // mapped public
      '64:ff9b::808:808', // NAT64 of a public address
      '2002:808:808::1', // 6to4 of a public address
      '2606:4700:4700::1111',
      '1.1.1.1',
      '93.184.216.34',
    ])('allows %s', (ip) => {
      expect(isPrivateAddress(ip)).toBe(false);
    });
  });
});

describe('assertPublicHost', () => {
  const resolver = (ips: string[]) => vi.fn(async () => ips);

  it('returns the checked IPs of a public host', async () => {
    const resolve = resolver(['93.184.216.34']);
    await expect(assertPublicHost('voorbeeld.be', resolve)).resolves.toEqual(['93.184.216.34']);
    expect(resolve).toHaveBeenCalledWith('voorbeeld.be');
  });

  it('blocks when one of the IPs is private', async () => {
    await expect(
      assertPublicHost('voorbeeld.be', resolver(['93.184.216.34', '10.0.0.1'])),
    ).rejects.toBeInstanceOf(BlockedTargetError);
  });

  it('blocks when there are no IPs', async () => {
    await expect(assertPublicHost('voorbeeld.be', resolver([]))).rejects.toBeInstanceOf(
      BlockedTargetError,
    );
  });

  it('blocks when the resolver returns garbage', async () => {
    await expect(
      assertPublicHost('voorbeeld.be', resolver(['93.184.216.34', 'garbage'])),
    ).rejects.toBeInstanceOf(BlockedTargetError);
  });

  it('checks an IP literal without DNS', async () => {
    const resolve = resolver(['93.184.216.34']);
    await expect(assertPublicHost('127.0.0.1', resolve)).rejects.toBeInstanceOf(BlockedTargetError);
    await expect(assertPublicHost('[::1]', resolve)).rejects.toBeInstanceOf(BlockedTargetError);
    await expect(assertPublicHost('8.8.8.8', resolve)).resolves.toEqual(['8.8.8.8']);
    expect(resolve).not.toHaveBeenCalled();
  });

  it('wraps resolver failures in a DnsLookupError without the hostname', async () => {
    const resolve = vi.fn(async () => {
      throw new Error('getaddrinfo ENOTFOUND geheim.voorbeeld.be');
    });
    const error = await assertPublicHost('geheim.voorbeeld.be', resolve).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DnsLookupError);
    expect(String((error as Error).message)).not.toContain('voorbeeld');
  });

  it('never puts the host or IP in the error message', async () => {
    const error = await assertPublicHost('geheim.voorbeeld.be', resolver(['10.9.8.7'])).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(BlockedTargetError);
    expect((error as BlockedTargetError).message).not.toMatch(/voorbeeld|10\.9\.8\.7/);
    expect((error as BlockedTargetError).code).toBe('private_address');
  });
});
