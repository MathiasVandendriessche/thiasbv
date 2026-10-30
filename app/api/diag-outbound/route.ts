// TIJDELIJK: diagnose van uitgaand verkeer en client-IP-header op Combell.
// Verwijderen na gebruik (zie DEPLOYMENT_COMBELL.md, "Diag-route").
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { promises as dns } from 'node:dns';
import http from 'node:http';
import https from 'node:https';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROBE_TIMEOUT_MS = 4000;
const IP_HEADERS = ['x-forwarded-for', 'x-real-ip', 'forwarded', 'x-client-ip'] as const;

type ProbeResult = { ok: true } | { ok: false; error: string };

function errorCode(e: unknown): string {
  const code = (e as { code?: unknown } | null)?.code;
  return typeof code === 'string' && /^[A-Z0-9_]{2,40}$/.test(code) ? code : 'ERROR';
}

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject({ code: 'ETIMEDOUT' }), PROBE_TIMEOUT_MS);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

async function probe(fn: () => Promise<unknown>): Promise<ProbeResult> {
  try {
    await withTimeout(fn());
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorCode(e) };
  }
}

function head(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(url, { method: 'HEAD', timeout: PROBE_TIMEOUT_MS }, (res) => {
      res.resume();
      resolve();
    });
    req.on('timeout', () => req.destroy(Object.assign(new Error('t'), { code: 'ETIMEDOUT' })));
    req.on('error', reject);
    req.end();
  });
}

const probes = {
  dnsResolve4: () => dns.resolve4('example.com'),
  httpsHead: () => head('https://example.com/'),
  httpHead: () => head('http://example.com/'),
  dnsTxtDmarc: () => dns.resolveTxt('_dmarc.thiasbv.com'),
};

function keyMatches(given: string | null, expected: string | undefined): boolean {
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const notFound = () =>
  new NextResponse('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: NextRequest) {
  if (!keyMatches(request.nextUrl.searchParams.get('k'), process.env.DIAG_KEY)) {
    return notFound();
  }

  const [dnsResolve4, httpsHead, httpHead, dnsTxtDmarc] = await Promise.all([
    probe(probes.dnsResolve4),
    probe(probes.httpsHead),
    probe(probes.httpHead),
    probe(probes.dnsTxtDmarc),
  ]);

  const headerNames = Array.from(request.headers.keys()).sort();
  const ipHeaders: Record<string, string | null> = {};
  for (const h of IP_HEADERS) ipHeaders[h] = request.headers.get(h);

  return NextResponse.json(
    { probes: { dnsResolve4, httpsHead, httpHead, dnsTxtDmarc }, headerNames, ipHeaders },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
