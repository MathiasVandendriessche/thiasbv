import { isIP } from 'node:net';
import { domainToASCII } from 'node:url';

export type DomainFailure =
  | 'empty'
  | 'too_long'
  | 'invalid'
  | 'ip_not_allowed'
  | 'port_not_allowed'
  | 'internal_name';

export type DomainResult =
  | { ok: true; domain: string }
  | { ok: false; reason: DomainFailure };

const MAX_INPUT_LENGTH = 2048;
const MAX_DOMAIN_LENGTH = 253;
const LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const INTERNAL_SUFFIXES = [
  'localhost',
  'local',
  'internal',
  'lan',
  'home.arpa',
  'localdomain',
  'intranet',
  'corp',
  'home',
];

const fail = (reason: DomainFailure): DomainResult => ({ ok: false, reason });

/** Authority part of `scheme://authority/...` (or of a bare `authority/...`). */
function extractAuthority(input: string): string {
  const afterScheme = input.includes('://') ? input.slice(input.indexOf('://') + 3) : input;
  return afterScheme.split(/[/\\?#]/, 1)[0];
}

function hasExplicitPort(authority: string): boolean {
  const host = authority.slice(authority.lastIndexOf('@') + 1);
  if (host.startsWith('[')) return !host.endsWith(']');
  return host.includes(':');
}

function isInternalName(host: string): boolean {
  const labels = host.split('.');
  if (labels.length < 2) return true;
  return INTERNAL_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

export function normalizeDomain(input: unknown): DomainResult {
  if (input === null || input === undefined) return fail('empty');
  if (typeof input !== 'string') return fail('invalid');

  const trimmed = input.trim();
  if (trimmed === '') return fail('empty');
  if (trimmed.length > MAX_INPUT_LENGTH) return fail('too_long');

  const hasScheme = trimmed.includes('://');
  if (hasScheme && !/^https?:\/\//i.test(trimmed)) return fail('invalid');

  const authority = extractAuthority(trimmed);
  if (authority.includes('@')) return fail('invalid');
  if (hasExplicitPort(authority)) return fail('port_not_allowed');

  let url: URL;
  try {
    url = new URL(hasScheme ? trimmed : `http://${trimmed}`);
  } catch {
    return fail('invalid');
  }
  if (url.username || url.password) return fail('invalid');

  const rawHost = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(rawHost) !== 0 || isIP(rawHost.replace(/\.$/, '')) !== 0) return fail('ip_not_allowed');

  const host = domainToASCII(rawHost.replace(/\.$/, '')).toLowerCase();
  if (host === '') return fail('invalid');
  if (host.length > MAX_DOMAIN_LENGTH) return fail('too_long');
  if (isInternalName(host)) return fail('internal_name');

  const labels = host.split('.');
  if (!labels.every((label) => LABEL_PATTERN.test(label))) return fail('invalid');
  if (/^\d+$/.test(labels[labels.length - 1])) return fail('invalid');

  return { ok: true, domain: host };
}
