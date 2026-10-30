import { Resolver } from 'node:dns/promises';
import { DNS_RESOLVER_OPTIONS } from '@/lib/quick-check/constants';

/**
 * DNS for the quick check. Uses dns.promises.Resolver (c-ares, own sockets)
 * rather than dns.lookup (getaddrinfo on libuv's 4-thread pool), so a
 * nameserver that never answers cannot exhaust the thread pool and stall the
 * rest of the site.
 */

/** The two queries needed to find every address of a host. */
export interface FamilyResolver {
  resolve4(host: string): Promise<string[]>;
  resolve6(host: string): Promise<string[]>;
}

let shared: Resolver | null = null;

/** One shared resolver with a short time-out and no retries. */
export function getDnsResolver(): Resolver {
  shared ??= new Resolver({ ...DNS_RESOLVER_OPTIONS });
  return shared;
}

/** Codes that mean "this name has no records of this type" — not a failure. */
const NO_RECORDS = new Set(['ENODATA', 'ENOTFOUND']);

function isNoRecords(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  return typeof code === 'string' && NO_RECORDS.has(code);
}

/**
 * Resolves A and AAAA in parallel and returns all addresses. One family having
 * no records is fine when the other has addresses. Throws when both have none,
 * or when either query fails for another reason (time-out, SERVFAIL, …):
 * a half-answered lookup is never trusted.
 */
export async function resolveAllAddresses(
  host: string,
  resolver: FamilyResolver = getDnsResolver(),
): Promise<string[]> {
  const settled = await Promise.allSettled([resolver.resolve4(host), resolver.resolve6(host)]);
  const addresses: string[] = [];
  let missing: unknown = null;
  for (const r of settled) {
    if (r.status === 'fulfilled') {
      addresses.push(...r.value);
    } else if (isNoRecords(r.reason)) {
      missing = r.reason;
    } else {
      throw r.reason instanceof Error ? r.reason : new Error('dns_failed');
    }
  }
  if (addresses.length === 0 && missing !== null) {
    throw missing instanceof Error ? missing : new Error('dns_failed');
  }
  return addresses;
}

/**
 * Wraps a resolver so each host is resolved at most once (failures included)
 * for the lifetime of the wrapper — use one wrapper per quick check.
 */
export function memoizeResolver(
  resolve: (host: string) => Promise<string[]>,
): (host: string) => Promise<string[]> {
  const cache = new Map<string, Promise<string[]>>();
  return (host) => {
    const key = host.toLowerCase();
    let pending = cache.get(key);
    if (!pending) {
      pending = resolve(host);
      cache.set(key, pending);
    }
    return pending;
  };
}
