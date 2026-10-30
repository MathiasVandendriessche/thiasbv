import { lookup } from 'node:dns/promises';
import { isIP, isIPv4, isIPv6 } from 'node:net';

/**
 * Protection against Server-Side Request Forgery for the public quick check.
 *
 * Every host is resolved first. If any of its addresses is private, internal or
 * reserved, the host is refused (fail-closed). Anything that cannot be parsed
 * is treated as private. There is deliberately no switch to turn this off.
 *
 * Error messages are fixed codes: they never contain a host name or IP.
 */

export type BlockedReason =
  | 'invalid_url'
  | 'scheme_not_allowed'
  | 'port_not_allowed'
  | 'credentials_not_allowed'
  | 'ip_literal_not_allowed'
  | 'method_not_allowed'
  | 'no_addresses'
  | 'private_address';

/** A deliberate refusal to connect — never a network failure. */
export class BlockedTargetError extends Error {
  readonly code: BlockedReason;

  constructor(code: BlockedReason) {
    super(`quick-check: blocked_${code}`);
    this.name = 'BlockedTargetError';
    this.code = code;
  }
}

/** DNS resolution failed; no connection was attempted. */
export class DnsLookupError extends Error {
  constructor() {
    super('quick-check: dns_failed');
    this.name = 'DnsLookupError';
  }
}

export type Resolver = (host: string) => Promise<string[]>;

/** IPv4 ranges that are private, internal or reserved, as [base, prefix length]. */
const IPV4_BLOCKED: ReadonlyArray<readonly [string, number]> = [
  ['0.0.0.0', 8], // "this network"
  ['10.0.0.0', 8], // private (RFC 1918)
  ['100.64.0.0', 10], // CGNAT (RFC 6598)
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local + cloud metadata
  ['172.16.0.0', 12], // private (RFC 1918)
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.0.2.0', 24], // TEST-NET-1
  ['192.88.99.0', 24], // 6to4 relay anycast (deprecated)
  ['192.168.0.0', 16], // private (RFC 1918)
  ['198.18.0.0', 15], // benchmarking
  ['198.51.100.0', 24], // TEST-NET-2
  ['203.0.113.0', 24], // TEST-NET-3
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved + broadcast
];

/** "a.b.c.d" → 32-bit unsigned integer, or null when it is not strict dotted decimal. */
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }
  return value >>> 0;
}

const IPV4_BLOCKED_INT = IPV4_BLOCKED.map(([base, bits]) => {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return { base: ((ipv4ToInt(base) ?? 0) & mask) >>> 0, mask };
});

function isBlockedIPv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  if (value === null) return true;
  return IPV4_BLOCKED_INT.some(({ base, mask }) => ((value & mask) >>> 0) === base);
}

/** IPv6 text → 8 hextets, or null when it cannot be parsed. Zone ids are refused. */
function parseIPv6(ip: string): number[] | null {
  if (ip.includes('%')) return null;
  let addr = ip.toLowerCase();

  const lastColon = addr.lastIndexOf(':');
  const tail = addr.slice(lastColon + 1);
  if (tail.includes('.')) {
    const v4 = ipv4ToInt(tail);
    if (v4 === null) return null;
    addr = `${addr.slice(0, lastColon + 1)}${(v4 >>> 16).toString(16)}:${(v4 & 0xffff).toString(16)}`;
  }

  const halves = addr.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;

  const groups = halves.length === 2 ? [...head, ...Array<string>(missing).fill('0'), ...rest] : head;
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.map((g) => parseInt(g, 16));
}

/** The IPv4 address carried in hextets i and i+1. */
function embeddedIPv4(h: number[], i: number): string {
  return [h[i] >> 8, h[i] & 0xff, h[i + 1] >> 8, h[i + 1] & 0xff].join('.');
}

function isBlockedIPv6(ip: string): boolean {
  const h = parseIPv6(ip);
  if (h === null) return true;

  const zeroUntil = (end: number) => h.slice(0, end).every((x) => x === 0);

  // ::ffff:0:0/96 IPv4-mapped → judge the IPv4 address.
  if (zeroUntil(5) && h[5] === 0xffff) return isBlockedIPv4(embeddedIPv4(h, 6));
  // 64:ff9b::/96 NAT64 well-known prefix → judge the IPv4 address.
  if (h[0] === 0x64 && h[1] === 0xff9b && h.slice(2, 6).every((x) => x === 0)) {
    return isBlockedIPv4(embeddedIPv4(h, 6));
  }
  // 2002::/16 6to4 → judge the IPv4 address.
  if (h[0] === 0x2002) return isBlockedIPv4(embeddedIPv4(h, 1));

  // Only 2000::/3 is global unicast. This also covers ::, ::1, IPv4-compatible,
  // 64:ff9b:1::/48, 100::/64, fc00::/7, fe80::/10, fec0::/10 and ff00::/8.
  if ((h[0] & 0xe000) !== 0x2000) return true;
  if (h[0] === 0x2001 && h[1] < 0x0200) return true; // 2001::/23 IETF (Teredo, ORCHID, …)
  if (h[0] === 0x2001 && h[1] === 0x0db8) return true; // 2001:db8::/32 documentation
  if (h[0] === 0x3fff && h[1] < 0x1000) return true; // 3fff::/20 documentation
  return false;
}

/** True when the IP is private, internal, reserved — or not a valid IP at all. */
export function isPrivateAddress(ip: string): boolean {
  if (isIPv4(ip)) return isBlockedIPv4(ip);
  if (isIPv6(ip)) return isBlockedIPv6(ip);
  return true;
}

/** Default resolver: the system resolver, all A/AAAA records. */
export async function resolveHost(host: string): Promise<string[]> {
  const records = await lookup(host, { all: true });
  return records.map((r) => r.address);
}

function stripBrackets(host: string): string {
  return host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
}

/**
 * Resolves `host` and returns its IPs, but only if every one of them is public.
 * Throws BlockedTargetError when any IP is private or there are none, and
 * DnsLookupError when resolution itself fails.
 */
export async function assertPublicHost(
  host: string,
  resolve: Resolver = resolveHost,
): Promise<string[]> {
  const literal = stripBrackets(host);
  if (isIP(literal)) {
    if (isPrivateAddress(literal)) throw new BlockedTargetError('private_address');
    return [literal];
  }

  let ips: unknown;
  try {
    ips = await resolve(host);
  } catch {
    throw new DnsLookupError();
  }

  if (!Array.isArray(ips) || ips.length === 0) throw new BlockedTargetError('no_addresses');
  if (ips.some((ip) => typeof ip !== 'string' || isPrivateAddress(ip))) {
    throw new BlockedTargetError('private_address');
  }
  return [...(ips as string[])];
}
