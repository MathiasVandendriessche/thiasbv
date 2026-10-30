# SecureScan snelle check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SecureScan as the fourth project on `/[lang]/ai-projecten`. It includes a public quick check (HTTPS/certificate, security headers, homepage cookies, SPF/DMARC) that shows its result right away, plus an optional request for a full scan that is sent by email. The contact form also starts sending email, and the PII in `console.log` disappears.

**Architecture:** All logic runs inside the Next.js site as Node.js API routes (`runtime = 'nodejs'`). Network access goes through one guarded layer: DNS lookup, an IP check, a connection pinned to the checked IP, ports 80/443 only, GET/HEAD only, and a timeout plus byte limit. Each redirect hop passes through that layer again. Scoring is a set of pure functions over the collected data. Mail goes through Microsoft Graph `sendMail` with an app registration (client credentials). Nothing is stored. Rate limits live in process memory.

**Tech Stack:** Next.js 15 (app router), React 19, TypeScript strict, Tailwind, lucide-react, Node `dns/promises`, `tls`, `http`/`https`. New devDependencies: `vitest` (unit) and `@playwright/test` (E2E). No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-30-securescan-snelle-check-design.md`

## Global Constraints

- Nothing is stored: no database, no files. Domains, results, email addresses and IP addresses never appear in logs (`console.*`), analytics or error messages. Errors are logged only as a fixed code (e.g. `quick-check: dns_failed`).
- Input is a domain name only. A pasted URL is reduced to its host. No IP addresses, ports, paths, `localhost`, or single-label or internal names. Server-side validation, max length 253.
- Only ports 443 and 80, only GET/HEAD, at most 3 redirects, a 4 s timeout per request, 12 s total per check, and 256 KB max per response.
- SSRF: resolve every host first, and refuse if **any** IP is private, internal or reserved (fail-closed). Re-check every redirect hop. The connection uses the checked IP (no second DNS lookup).
- Rate limit per IP: 5 checks per 10 minutes and 20 per day. Global: 60 per hour and 300 per day. The scan-request route has its own counters: 3 per hour per IP.
- User-Agent of every outgoing request: `ThiasSecureScanQuickCheck/1.0 (+https://www.thiasbv.com/nl/ai-projecten)`.
- Mail through Microsoft Graph, sender and recipient both `m@thiasbv.com`. Secrets live only in env vars `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MAIL_SENDER`, `MAIL_TO`. Never in code or the repo.
- The client IP comes only from the header set by Combell's own proxy (last entry), configured via `CLIENT_IP_HEADER`. Never use a value the visitor can choose.
- All copy in NL, EN and FR, in the tone of the existing page. Statuses are good / let op / probleem, each with one sentence. Below every result: "this is a limited public check, not a full scan".
- No client names (e.g. Fluvius) in copy. Use anonymized wording.
- Build and test in a copy outside iCloud (`node_modules` in the project folder is "dataless"): rsync to `$SCRATCH/site` without `node_modules .next .git .superpowers .claude`, then `npm ci`. All `npx` commands below run there. Edit and commit in the project folder itself.
- Do not commit `.claude/` or the existing change to `package-lock.json`, except for lockfile changes caused by the new devDependencies in Task 1.

## Review Focus

1. **Internationalized domain names** (`müller.be`, `café.fr`): a visitor expects them to work. `normalizeDomain` converts to punycode with `url.domainToASCII` (test in Task 3).
2. **Pasted variants** (`HTTPS://WWW.Voorbeeld.be/contact?x=1`, `voorbeeld.be.`, ` voorbeeld.be `, `voorbeeld.be:8443`): the host is extracted and lowercased, and the trailing dot is stripped. An explicit port is refused (test in Task 3).
3. **Redirect to another host** (`voorbeeld.be` → `https://www.voorbeeld.be/`): the check follows it and re-checks the new host. A redirect to `http://127.0.0.1/` or to port 8080 stops with `blocked`, and its result is not shown as "site insecure" (test in Task 4).
4. **Site without port 80, or without HTTPS**: one part becomes `unavailable` (grey, "could not be checked") and the other parts still work. The whole check does not crash (test in Task 7).
5. **Domain without a web server but with mail** (MX/SPF/DMARC only): the email part still shows a result and the web parts are `unavailable` (test in Task 7).

---

### Task 1: Microsoft Graph mail transport and contact form fix

**Files:**
- Create: `lib/mail/graph.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts `test: "vitest run"`, `test:e2e: "playwright test"`; devDependencies `vitest`, `@playwright/test`)
- Modify: `app/api/contact/route.ts` (complete rewrite)
- Modify: `components/ContactForm.tsx:43-46` (`info@thiasbv.com` → `m@thiasbv.com`)
- Modify: `DEPLOYMENT_COMBELL.md` (new section "E-mail via Microsoft Graph")
- Test: `tests/unit/mail/graph.test.ts`, `tests/unit/api/contact.test.ts`

**Interfaces:**
- Produces:
  - `interface MailMessage { subject: string; text: string; replyTo?: string }`
  - `sendMail(msg: MailMessage, deps?: { fetch?: typeof fetch; env?: NodeJS.ProcessEnv }): Promise<void>`. Throws `MailError` (with `code: 'config_missing' | 'token_failed' | 'send_failed'`) on failure.
  - `isValidEmail(value: string): boolean`. Max 254 characters and one simple `local@domain.tld` pattern.

- [ ] **Step 1: Install test tooling.** In the scratch copy: `npm i -D vitest @playwright/test`. Copy `package.json` and `package-lock.json` back. `vitest.config.ts` uses `environment: 'node'`, `include: ['tests/unit/**/*.test.ts']`, and alias `@` → project root.

- [ ] **Step 2: Write failing tests** in `tests/unit/mail/graph.test.ts`, with a mocked `fetch`:
  - `requests token with client credentials`: first call is POST to `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token` with `grant_type=client_credentials` and `scope=https://graph.microsoft.com/.default`.
  - `sends text mail via Graph`: second call is POST to `https://graph.microsoft.com/v1.0/users/m%40thiasbv.com/sendMail` with `Authorization: Bearer <token>`, `message.body.contentType === 'Text'`, `toRecipients[0].emailAddress.address === 'm@thiasbv.com'`, and `replyTo[0]` equal to `msg.replyTo`, with `saveToSentItems: false`.
  - `strips newlines from subject`: `'a\r\nBcc: x'` becomes `'a Bcc: x'`.
  - `throws config_missing when env incomplete`, `throws send_failed on non-202`.
  - `isValidEmail`: `'a@b.be'` is true, while `'a@b'`, `'a b@c.be'`, `'x'.repeat(250)+'@b.be'` and `'a@b.be\n'` are false.

- [ ] **Step 3: Run** `npx vitest run tests/unit/mail`. Expected: FAIL (module missing).

- [ ] **Step 4: Implement `lib/mail/graph.ts`.** Do not cache the token (low volume). No logging of the message content.

- [ ] **Step 5: Write failing tests** in `tests/unit/api/contact.test.ts`. Call `POST` from the route with a `NextRequest`, and mock `sendMail` via `vi.mock('@/lib/mail/graph')`:
  - Valid body → 200, and `sendMail` is called with `replyTo === email` and text containing name, phone and message.
  - Missing name/email/message or an invalid email → 400, and `sendMail` is not called.
  - Fields above max length (name 200, phone 50, message 5000) → 400.
  - `sendMail` throws → 502 with a generic message, and `console.log`/`console.error` are never called with the email or name (spy on both and check the arguments).
  - Non-JSON body → 400.

- [ ] **Step 6: Rewrite `app/api/contact/route.ts`** (`export const runtime = 'nodejs'`). Keep the existing Dutch error strings for 400/500 and the success message. On a mail error, log only `contact: <code>`.

- [ ] **Step 7: Run** `npx vitest run`. Expected: PASS. Then run `npx tsc --noEmit -p .`. Expected: no errors.

- [ ] **Step 8: Update `ContactForm.tsx` and `DEPLOYMENT_COMBELL.md`.** The doc gets these steps:
  1. Entra → App registrations → New (single tenant).
  2. API permissions → Microsoft Graph → Application → `Mail.Send` → Grant admin consent.
  3. Certificates & secrets → client secret (note the expiry date).
  4. Exchange Online PowerShell: `New-ApplicationAccessPolicy -AppId <client-id> -PolicyScopeGroupId m@thiasbv.com -AccessRight RestrictAccess -Description "Website mail"`, then check it with `Test-ApplicationAccessPolicy`.
  5. Set the env vars in the Combell control panel: `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MAIL_SENDER=m@thiasbv.com`, `MAIL_TO=m@thiasbv.com`, `CLIENT_IP_HEADER` (see Task 2).

- [ ] **Step 9: Commit**
```bash
git add lib/mail tests/unit/mail tests/unit/api/contact.test.ts vitest.config.ts package.json package-lock.json app/api/contact/route.ts components/ContactForm.tsx DEPLOYMENT_COMBELL.md
git commit -m "fix: send contact form via Microsoft Graph and stop logging PII"
```

---

### Task 2: Check Combell (gate)

The rest depends on this. If Combell blocks outbound connections, **stop** and ask Mathias where the check should run instead.

**Files:**
- Create (temporary): `app/api/diag-outbound/route.ts`
- Modify: `DEPLOYMENT_COMBELL.md` (record the result: client IP header name)

- [ ] **Step 1: Read the Combell Node.js docs** (WebFetch/WebSearch: "Combell Node.js outbound connections", "Combell X-Forwarded-For") and note what they say about outbound traffic and proxy headers.

- [ ] **Step 2: Temporary route** `GET /api/diag-outbound`. It does only fixed requests, never to a target the visitor chooses:
  - `dns.resolve4('example.com')`
  - HTTPS HEAD `https://example.com/`
  - HTTP HEAD `http://example.com/`
  - `dns.resolveTxt('_dmarc.thiasbv.com')`

  It returns per item `ok`/`error code`, plus the **names** of all request headers and the values of `x-forwarded-for`, `x-real-ip`, `forwarded` and `x-client-ip`. The route returns 404 unless `?k=` equals env `DIAG_KEY`.

- [ ] **Step 3: Have Mathias deploy and open the route** with his own IP. Determine which header ends in his real IP, and whether it is the last entry. Record the name in `DEPLOYMENT_COMBELL.md` and as `CLIENT_IP_HEADER`.

- [ ] **Step 4: Delete the route and commit**
```bash
git rm app/api/diag-outbound/route.ts
git add DEPLOYMENT_COMBELL.md
git commit -m "docs: record Combell outbound and client IP header findings"
```

---

### Task 3: Domain validation

**Files:**
- Create: `lib/quick-check/domain.ts`
- Test: `tests/unit/quick-check/domain.test.ts`

**Interfaces:**
- Produces: `type DomainResult = { ok: true; domain: string } | { ok: false; reason: 'empty' | 'too_long' | 'invalid' | 'ip_not_allowed' | 'port_not_allowed' | 'internal_name' }` and `normalizeDomain(input: unknown): DomainResult`.

- [ ] **Step 1: Write failing tests:**
  - `'voorbeeld.be'` → `voorbeeld.be`
  - `' HTTPS://WWW.Voorbeeld.be/contact?x=1 '` → `www.voorbeeld.be`
  - `'voorbeeld.be.'` → `voorbeeld.be`
  - `'müller.be'` → `xn--mller-kva.be`
  - `'voorbeeld.be:8443'` and `'https://voorbeeld.be:443'` → `port_not_allowed`
  - `'1.2.3.4'`, `'[::1]'`, `'0x7f000001'` → `ip_not_allowed`
  - `'localhost'`, `'intranet'`, `'printer.local'`, `'x.internal'`, `'a.lan'`, `'b.home.arpa'`, `'c.localhost'` → `internal_name`
  - `'user:pw@voorbeeld.be'` → `invalid`
  - `''` and `null` → `empty`
  - 254 characters → `too_long`
  - Label of 64 characters, `'-a.be'`, `'a_b.be'` → `invalid`
  - TLD of digits only (`'a.123'`) → `invalid`

- [ ] **Step 2: Run** `npx vitest run tests/unit/quick-check/domain.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement.** If there is a `://`, parse with `new URL`. Otherwise use `new URL('http://' + input)`. Refuse when `username`/`password` is present. Run `domainToASCII` from `node:url`, then apply the label rules (1–63, `[a-z0-9-]`, no leading or trailing hyphen) and require at least 2 labels.

- [ ] **Step 4: Run tests.** Expected: PASS.

- [ ] **Step 5: Commit** `feat: add domain validation for quick check`

---

### Task 4: SSRF guard and safe request

**Files:**
- Create: `lib/quick-check/net/ssrf-guard.ts` (port of `~/Documents/SecureScan/engine/utils/ssrf-guard.js`, without `ALLOW_PRIVATE_TARGETS`)
- Create: `lib/quick-check/net/safe-request.ts` (simplified port of `safe-fetch.js`)
- Create: `lib/quick-check/constants.ts` (all limits from Global Constraints, the User-Agent)
- Test: `tests/unit/quick-check/ssrf-guard.test.ts`, `tests/unit/quick-check/safe-request.test.ts`

**Interfaces:**
- Produces:
  - `isPrivateAddress(ip: string): boolean`
  - `class BlockedTargetError extends Error`
  - `assertPublicHost(host: string, resolve?: (h: string) => Promise<string[]>): Promise<string[]>`. Returns the checked IPs. Throws `BlockedTargetError` if any IP is private, or if there are 0 IPs.
  - `interface SafeResponse { status: number; headers: Record<string, string | string[]>; body: string; url: string; ip: string; tlsInfo?: { protocol: string; validTo: string; authorized: boolean; authError?: string } }`
  - `safeRequest(url: string, opts?: { method?: 'GET' | 'HEAD'; deadline?: number; deps?: NetDeps }): Promise<SafeResponse>`. A single request, with no redirects.
  - `followRedirects(url: string, opts?: same): Promise<SafeResponse & { redirects: string[] }>`
  - `NetDeps` = `{ resolve, request }` for injection in tests.

- [ ] **Step 1: Write failing tests** for `isPrivateAddress`.
  - true for: `127.0.0.1`, `10.1.2.3`, `172.16.0.1`, `172.31.255.255`, `192.168.1.1`, `169.254.169.254`, `100.64.0.1`, `0.0.0.0`, `224.0.0.1`, `255.255.255.255`, `198.18.0.1`, `::1`, `::`, `fe80::1`, `fc00::1`, `fd12::1`, `::ffff:127.0.0.1`, `::ffff:7f00:1`, `64:ff9b::a00:1`, `2001:db8::1`.
  - false for: `8.8.8.8`, `172.32.0.1`, `2a00:1450::1`.
  - Unparseable input → true (fail-closed).

  For `assertPublicHost`, with a fake resolver:
  - `['93.184.216.34']` → ok
  - `['93.184.216.34','10.0.0.1']` → BlockedTargetError
  - `[]` → BlockedTargetError

- [ ] **Step 2: Write failing tests** for `safeRequest`/`followRedirects`, with fake `NetDeps`:
  - Port other than 80/443 → BlockedTargetError, before any DNS lookup.
  - Method `POST` → TypeScript error (compile check) and runtime refusal.
  - The connection receives exactly the IP from `assertPublicHost` (pinned lookup).
  - Body is truncated at 256 KB.
  - The deadline is exceeded → `TimeoutError`.
  - Redirect `voorbeeld.be` → `https://www.voorbeeld.be/` is followed, and the resolver is called for `www.voorbeeld.be`.
  - Redirect to `http://127.0.0.1/` → BlockedTargetError.
  - Redirect to `https://x.be:8080/` → BlockedTargetError.
  - Redirect to `file:///etc/passwd` → BlockedTargetError.
  - A 4th redirect → `TooManyRedirectsError`.
  - The `User-Agent` header equals the constant.

- [ ] **Step 3: Run** `npx vitest run tests/unit/quick-check`. Expected: FAIL.

- [ ] **Step 4: Implement.** The default `request` uses `https.request`/`http.request` with `lookup` that returns only the pinned IP, and `servername: host` for SNI. Use `rejectUnauthorized: false` **only** to read cert info. Record `authorized`/`authError` in `tlsInfo` and never follow anything for a site whose cert is invalid. Each hop computes the remaining time from the shared `deadline`.

- [ ] **Step 5: Run tests.** Expected: PASS.

- [ ] **Step 6: Commit** `feat: add SSRF-guarded request layer for quick check`

---

### Task 5: Rate limiter and client IP

**Files:**
- Create: `lib/quick-check/rate-limit.ts`
- Test: `tests/unit/quick-check/rate-limit.test.ts`

**Interfaces:**
- Produces:
  - `interface Window { limit: number; ms: number }`
  - `createRateLimiter(windows: Window[], opts?: { maxKeys?: number }): { hit(key: string, now?: number): boolean }`. Returns `true` when allowed, and counts only allowed hits.
  - `getClientIp(headers: Headers, headerName = process.env.CLIENT_IP_HEADER): string | null`. Takes the last comma-separated item, trimmed. Returns `null` if the header is missing.
  - `quickCheckLimiter`, `globalLimiter`, `scanRequestLimiter`: singletons with the values from Global Constraints.

- [ ] **Step 1: Write failing tests:**
  - 5 hits within 10 min are allowed and the 6th is refused.
  - After 10 min + 1 ms it is allowed again, until there are 20 in one day.
  - Different keys are independent.
  - Expired keys are cleaned up (internal map size after `now` + 1 day = 0).
  - `maxKeys` is exceeded → the oldest key is dropped (no unbounded memory).
  - `getClientIp`: `'1.1.1.1, 2.2.2.2'` → `'2.2.2.2'`. Missing header → `null`.

- [ ] **Step 2: Run** the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** Use a `Map<string, number[]>` with timestamps, and prune on every `hit`. Default `maxKeys` is 10 000. The API routes treat a `null` IP as one shared key `'unknown'`.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add in-memory rate limiter for quick check`

---

### Task 6: The four checks (scoring)

**Files:**
- Create: `lib/quick-check/types.ts`, `lib/quick-check/checks/{tls,headers,cookies,email}.ts`
- Test: `tests/unit/quick-check/checks/*.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  ```ts
  export type Status = 'good' | 'warn' | 'bad' | 'unavailable';
  export type CheckId = 'tls' | 'headers' | 'cookies' | 'email';
  export interface CheckResult { id: CheckId; status: Status; messageKey: string; params?: Record<string, string | number> }
  ```
  `messageKey` is a key into the copy from Task 8 (for example `tls.good`, `tls.expiresSoon`, `headers.missing`). It never contains HTML or text from the scanned site, except `params` with numbers or header names from a fixed list.
- `gradeTls(input: { https: SafeResponse | null; httpRedirectsToHttps: boolean | null; now: Date }): CheckResult`
- `gradeHeaders(headers: SafeResponse['headers'] | null): CheckResult`
- `gradeCookies(setCookie: string[] | null): CheckResult`
- `checkEmail(domain: string, resolveTxt?: typeof dns.resolveTxt): Promise<CheckResult>`. Grading happens in a pure `gradeEmail(spf: string | null, dmarc: string | null): CheckResult`.

Rules (my call, within the spec):
- **tls**:
  - `bad` when the cert is invalid or expired, or when the TLS version is below 1.2.
  - `warn` when there are < 21 days left, or when HTTP does not redirect to HTTPS.
  - `good` otherwise.
  - `unavailable` when HTTPS is unreachable. `params.days` holds the days left.
- **headers**: Check HSTS, CSP, (X-Frame-Options or CSP `frame-ancestors`), `X-Content-Type-Options: nosniff`, Referrer-Policy and Permissions-Policy, and count the missing ones. 0 missing is `good`, 1–2 is `warn` and 3+ is `bad`, with `params.missing` as a comma-separated list of the fixed names.
- **cookies**:
  - No cookies → `good` (key `cookies.none`).
  - Any cookie without `Secure` or `HttpOnly` → `warn`, with `params.count`. Missing `SameSite` alone also counts as `warn`.
  - Never show cookie names or values.
- **email**:
  - `bad` when SPF and DMARC are both missing.
  - `warn` when one is missing, or when DMARC has `p=none`, or when SPF ends in `+all`/`?all`.
  - `good` when SPF is present (`-all`/`~all`) and DMARC is `quarantine`/`reject`.

- [ ] **Step 1: Write failing tests**, one per rule above, using concrete input. Examples:
  - The cert's `validTo` is 10 days after `now` → `warn` with `days: 10`.
  - The `thiasbv.com` records (`v=spf1 include:spf.protection.outlook.com -all` + `v=DMARC1; p=none`) → `warn`.
  - Header names are case-insensitive.
  - An array of multiple `Set-Cookie` values is handled.
- [ ] **Step 2: Run** `npx vitest run tests/unit/quick-check/checks`. Expected: FAIL.
- [ ] **Step 3: Implement.** Use the SecureScan modules (`header-scan.js`, `ssl-check.js`, `cookie-scan.js`, `email-check.js`) only as reference for parsing. Do not copy crawl or DKIM logic.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: add quick check scoring for TLS, headers, cookies and email`

---

### Task 7: Orchestrator and API route `/api/quick-check`

**Files:**
- Create: `lib/quick-check/run.ts`
- Create: `app/api/quick-check/route.ts`
- Test: `tests/unit/quick-check/run.test.ts`, `tests/unit/api/quick-check.test.ts`

**Interfaces:**
- Consumes: Tasks 3–6.
- Produces:
  - `interface QuickCheckReport { domain: string; checkedAt: string; results: CheckResult[]; summary: { ok: number; total: number } }`. `total` counts only results that are not `unavailable`. `ok` counts `good`.
  - `runQuickCheck(domain: string, deps?: { net?: NetDeps; resolveTxt?; now?: () => Date }): Promise<QuickCheckReport>`.
  - API: `POST /api/quick-check` with body `{ domain: string }` → 200 `{ success: true, data: QuickCheckReport }` or `{ success: false, error: 'invalid_domain' | 'rate_limited' | 'blocked' | 'unavailable' }` with status 400/429/400/503.

- [ ] **Step 1: Write failing tests** for `runQuickCheck`, with fake deps:
  - HTTPS, HTTP and DNS run in parallel (total duration ≈ the slowest, measured with fake timers).
  - Port 80 refused → tls is still graded, without a redirect penalty but with `warn`. Port 443 refused → tls/headers/cookies `unavailable`, and email still has a result (Review Focus 4 and 5).
  - Total deadline 12 s → unfinished parts become `unavailable`.
  - The redirect `voorbeeld.be` → `www.voorbeeld.be` is followed, and headers come from the final response.
  - `BlockedTargetError` on the first host → throws `BlockedTargetError` (no partial report).
- [ ] **Step 2: Write failing tests** for the route, with `runQuickCheck` mocked:
  - Invalid domain → 400 `invalid_domain`, and `runQuickCheck` is not called.
  - 6th call from the same IP → 429.
  - Global limit reached → 429.
  - `BlockedTargetError` → 400 `blocked`.
  - Unexpected error → 503 `unavailable`, with no stack trace or domain in the body.
  - Spy on `console.*`: never called with the domain or the IP.
  - Body above 1 KB, or not JSON → 400.
  - Only `POST` is exported.
  - The response has `Cache-Control: no-store`.
- [ ] **Step 3: Run.** Expected: FAIL.
- [ ] **Step 4: Implement.** In the route: `export const runtime = 'nodejs'`, `export const dynamic = 'force-dynamic'`. Order: size/JSON → `normalizeDomain` → per-IP limit → global limit → `runQuickCheck`.
- [ ] **Step 5: Run** `npx vitest run`. Expected: everything PASSES. Then run `npx tsc --noEmit -p .`. Expected: clean.
- [ ] **Step 6: Commit** `feat: add quick check API route`

---

### Task 8: API route `/api/scan-request`

**Files:**
- Create: `app/api/scan-request/route.ts`
- Test: `tests/unit/api/scan-request.test.ts`

**Interfaces:**
- Consumes: `sendMail`, `isValidEmail` (Task 1), `normalizeDomain` (Task 3), `scanRequestLimiter`, `getClientIp` (Task 5).
- Produces: `POST /api/scan-request` with body `{ email: string; name?: string; company?: string; domain: string; consent: true; website?: string /* honeypot */; lang: 'nl'|'en'|'fr' }` → `{ success: true }` or `{ success: false, error: 'invalid' | 'rate_limited' | 'unavailable' }`.

- [ ] **Step 1: Write failing tests:**
  - Valid → `sendMail` with subject `Aanvraag volledige scan: <domain>`, text containing email/name/company/domain/language/timestamp, and `replyTo` set to the email.
  - `consent` is not `true` → 400.
  - Invalid email or domain → 400.
  - Name/company > 200 → 400.
  - Honeypot `website` filled in → 200 `{ success: true }`, but `sendMail` is **not** called.
  - 4th request in one hour → 429.
  - `sendMail` throws → 503, and no PII in `console.*`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: add full scan request API route`

---

### Task 9: Project block and quick check UI

**Files:**
- Modify: `lib/ai-projects.ts`
  - Add `securescan: AiProject` to `projects`.
  - Add a new `quickCheck: QuickCheckCopy` to `AiProjectsContent`, in nl/en/fr.
  - Add the project ids `securescan`.
- Create: `components/ai-projects/QuickCheck.tsx` (client), `components/ai-projects/QuickCheckResult.tsx`, `components/ai-projects/ScanRequestForm.tsx` (client)
- Modify: `app/[lang]/ai-projecten/page.tsx`. After the energy manager: `<ProjectShowcase project={c.projects.securescan} reversed media={<QuickCheck lang={lang} copy={c.quickCheck} />} />`.

**Interfaces:**
- Consumes: the API contracts from Tasks 7 and 8, plus `CheckResult` and `QuickCheckReport` (type-only import from `lib/quick-check/types.ts`; no server code in the client bundle).
- Produces: `interface QuickCheckCopy`. It contains:
  - form labels and placeholder (`voorbeeld.be` / `example.com` / `exemple.be`), button, loading text;
  - `checkTitles: Record<CheckId,string>`;
  - `messages: Record<string,string>` with `{days}`/`{missing}`/`{count}` placeholders, covering every `messageKey` from Task 6;
  - `statusLabels: Record<Status,string>` (good / let op / probleem / niet gecontroleerd);
  - `summary` ("{ok} van {total} onderdelen in orde");
  - `disclaimer`;
  - `errors: Record<'invalid_domain'|'rate_limited'|'blocked'|'unavailable'|'network', string>`;
  - `request` form texts, plus the consent label with a link to `/${lang}/privacy`, plus success text.

Project copy: SecureScan as their own product. It is an automated web pentest with 23 modules and a report in plain language for SMEs. The full scan always happens with written consent. Tags such as `Node.js`, `23 modules`, `Rapport voor KMO's`. No client names.

- [ ] **Step 1: Copy and types in `lib/ai-projects.ts`.** Run `npx tsc --noEmit -p .`. Expected: clean. If a `messageKey` from Task 6 is missing in a language, add a unit test `tests/unit/quick-check/copy.test.ts` that compares every key in all three languages with the list of keys exported from `checks/*` (`export const MESSAGE_KEYS`).
- [ ] **Step 2: Build `QuickCheck`.** It has states `idle | loading | done | error`. The domain field uses `inputMode="url"`, `autoComplete="off"` and `maxLength=253`. The button is disabled while loading. The result is in a region with `aria-live="polite"`. Focus moves to the result heading.
- [ ] **Step 3: Build `QuickCheckResult`.** One card per part, using the status color tokens:
  - sage for good
  - accent-yellow for let op
  - a red-tone for probleem
  - gray for unavailable

  Each card has an icon and text for every status (do not rely on color alone). The summary is at the top and the disclaimer is always at the bottom. The "Volledige scan aanvragen" button opens `ScanRequestForm` with the domain pre-filled.
- [ ] **Step 4: Build `ScanRequestForm`.** Fields: email (required, `type=email`), name, company, the domain (read-only), a required consent checkbox, and a honeypot `website` field (visually hidden with `sr-only`-like positioning, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`). Show the success and error states.
- [ ] **Step 5: Check visually** in the scratch build (`npx next build`, then preview "website-scratch"):
  - 375 and 1440 wide, NL/EN/FR, no horizontal overflow
  - keyboard: Tab through the form, Enter submits
  - `prefers-reduced-motion` respected
- [ ] **Step 6: Commit** `feat: add SecureScan project and quick check UI`

---

### Task 10: Privacy text

**Files:**
- Modify: the `privacy` translations in `lib/i18n.ts` (where the existing sections live) and `app/[lang]/privacy/page.tsx` (one new section after the contact form section, in the same markup).

- [ ] **Step 1: Add the section "Snelle beveiligingscheck en scanaanvraag"** in NL/EN/FR:
  - The check processes the entered domain only to perform the check, and nothing is stored on the website.
  - The IP address is kept briefly in working memory to prevent abuse (max. 1 day).
  - A scan request (email, optional name/company, domain) is sent only by email to `m@thiasbv.com`. It is kept as long as needed for follow-up, max. 12 months.
  - The legal basis is consent via the checkbox.
  - Deletion can be requested via `m@thiasbv.com`.
  - The contact form works the same way (email only, no storage on the website).
- [ ] **Step 2: Run** `npx tsc --noEmit -p .` and `npx next build`. Expected: clean. Check `/nl/privacy` in the preview.
- [ ] **Step 3: Commit** `docs: describe quick check and scan request in privacy policy`

---

### Task 11: End-to-end test

**Files:**
- Create: `playwright.config.ts` (webServer `npx next start -p 3125`, baseURL `http://localhost:3125`, Chromium only by default)
- Create: `tests/e2e/quick-check.spec.ts`

- [ ] **Step 1: Write the tests.** Mock `/api/quick-check` and `/api/scan-request` with `page.route` (no real outgoing traffic):
  - `shows result for a domain`: fill in `voorbeeld.be` on `/nl/ai-projecten`, click the button. Expect 4 cards, the text `3 van 4 onderdelen in orde`, and the disclaimer visible.
  - `shows rate limit message`: mock 429. The NL message is visible.
  - `requests a full scan`: after the result, open the form. Submitting without the checkbox is blocked by the browser. With the checkbox, the success text appears, and the request body contains `consent: true` and `domain: 'voorbeeld.be'`.
  - `works in English`: `/en/ai-projecten` shows the EN button text.
- [ ] **Step 2: Run** `npx playwright install chromium && npx next build && npx playwright test`. Expected: 4 passed.
- [ ] **Step 3: Run the full verification:** `npx vitest run`, `npx tsc --noEmit -p .`, `npx next build`, and `grep -rn "console\.log" app lib components`. Expected: no hits in new code.
- [ ] **Step 4: Commit** `test: add e2e test for quick check flow`

---

## After the plan (not code)

- Mathias creates the Entra app registration and sets the env vars in Combell (Task 1, step 8).
- After deploy: run one real check on `thiasbv.com` and one test request, and confirm the email arrives in `m@thiasbv.com`.
