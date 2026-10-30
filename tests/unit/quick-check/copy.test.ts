import { describe, expect, it } from 'vitest';
import { fillTemplate, getQuickCheckCopy } from '@/lib/quick-check/copy';
import {
  COOKIES_MESSAGES,
  MESSAGE_KEYS,
  TLS_MESSAGES,
  HEADERS_MESSAGES,
} from '@/lib/quick-check/messages';
import type { CheckId, Status } from '@/lib/quick-check/types';

const LANGS = ['nl', 'en', 'fr'] as const;
const STATUSES: Status[] = ['good', 'warn', 'bad', 'unavailable'];
const CHECK_IDS: CheckId[] = ['tls', 'headers', 'cookies', 'email'];

/** The params each grader can send with a key (backend contract). Keys not listed get none. */
const PARAMS_BY_KEY: Record<string, readonly string[]> = {
  [TLS_MESSAGES.good]: ['days'],
  [TLS_MESSAGES.expiresSoon]: ['days'],
  [TLS_MESSAGES.noHttpsRedirect]: ['days'],
  [HEADERS_MESSAGES.missing]: ['missing', 'count'],
  [COOKIES_MESSAGES.insecure]: ['count'],
  [COOKIES_MESSAGES.sameSite]: ['count'],
};

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);

describe.each(LANGS)('quick check copy (%s)', (lang) => {
  const copy = getQuickCheckCopy(lang);

  it('has a non-empty message for every messageKey', () => {
    for (const key of MESSAGE_KEYS) {
      expect(copy.messages[key], key).toBeTypeOf('string');
      expect(copy.messages[key].trim(), key).not.toBe('');
    }
  });

  it('has no messages for unknown keys', () => {
    expect(Object.keys(copy.messages).sort()).toEqual([...MESSAGE_KEYS].sort());
  });

  it('only uses placeholders the key can receive', () => {
    for (const key of MESSAGE_KEYS) {
      const allowed = PARAMS_BY_KEY[key] ?? [];
      for (const name of placeholders(copy.messages[key])) {
        expect(allowed, `${key} uses {${name}}`).toContain(name);
      }
    }
  });

  it('has a label for every status and a title for every part', () => {
    for (const status of STATUSES) expect(copy.statusLabels[status].trim()).not.toBe('');
    for (const id of CHECK_IDS) expect(copy.checkTitles[id].trim()).not.toBe('');
  });

  it('summary uses exactly {ok} and {total}', () => {
    expect(placeholders(copy.summary).sort()).toEqual(['ok', 'total']);
  });

  it('has a non-empty text for every error', () => {
    for (const text of Object.values(copy.errors)) expect(text.trim()).not.toBe('');
    for (const text of Object.values(copy.request.errors)) expect(text.trim()).not.toBe('');
  });
});

describe('getQuickCheckCopy', () => {
  it('falls back to Dutch for an unknown language', () => {
    expect(getQuickCheckCopy('xx' as never)).toBe(getQuickCheckCopy('nl'));
  });
});

describe('fillTemplate', () => {
  it('replaces known placeholders', () => {
    expect(fillTemplate('{ok} van {total}', { ok: 3, total: 4 })).toBe('3 van 4');
  });
  it('leaves unknown placeholders untouched', () => {
    expect(fillTemplate('nog {days} dagen', {})).toBe('nog {days} dagen');
  });
});
