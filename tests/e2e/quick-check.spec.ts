import { expect, test, type Page } from '@playwright/test';

const DOMAIN = 'voorbeeld.be';

const REPORT = {
  success: true,
  data: {
    domain: DOMAIN,
    checkedAt: '2026-10-30T12:00:00.000Z',
    results: [
      { id: 'tls', status: 'good', messageKey: 'tls.good', params: { days: 60 } },
      { id: 'headers', status: 'good', messageKey: 'headers.good' },
      { id: 'cookies', status: 'good', messageKey: 'cookies.none' },
      { id: 'email', status: 'warn', messageKey: 'email.dmarcNone' },
    ],
    summary: { ok: 3, total: 4 },
  },
};

async function mockQuickCheck(page: Page, body: unknown, status = 200) {
  await page.route('**/api/quick-check', (route) => {
    // The real route answers 415 to anything but JSON.
    if (!/^application\/json/i.test(route.request().headers()['content-type'] ?? '')) {
      return route.fulfill({ status: 415, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

async function runCheck(page: Page) {
  await page.goto('/nl/ai-projecten');
  await page.getByLabel('Je domeinnaam').fill(DOMAIN);
  await page.getByRole('button', { name: 'Check mijn site' }).click();
}

test('shows result for a domain', async ({ page }) => {
  await mockQuickCheck(page, REPORT);
  await runCheck(page);

  await expect(page.getByText('3 van 4 onderdelen in orde')).toBeVisible();
  for (const title of ['HTTPS en certificaat', 'Beveiligingsheaders', 'Cookies', 'E-mailbeveiliging']) {
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  const cards = page.getByRole('listitem').filter({ hasText: /Goed|Let op|Probleem|Niet gecontroleerd/ });
  await expect(cards).toHaveCount(4);
  await expect(page.getByText('beperkte publieke check, geen volledige scan')).toBeVisible();
});

test('shows rate limit message', async ({ page }) => {
  await mockQuickCheck(page, { success: false, error: 'rate_limited' }, 429);
  await runCheck(page);

  await expect(
    page.getByText('Je hebt het maximum aantal checks bereikt. Probeer het later opnieuw.'),
  ).toBeVisible();
});

test('requests a full scan', async ({ page }) => {
  let scanRequests = 0;
  let scanBody: Record<string, unknown> | null = null;
  let scanType = '';
  await mockQuickCheck(page, REPORT);
  await page.route('**/api/scan-request', (route) => {
    scanRequests += 1;
    scanBody = route.request().postDataJSON();
    scanType = route.request().headers()['content-type'] ?? '';
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await runCheck(page);
  await page.getByRole('button', { name: 'Volledige scan aanvragen' }).click();

  const email = page.getByLabel(/^E-mailadres/);
  const consent = page.getByRole('checkbox');
  await email.fill('test@voorbeeld.be');

  // Without the checkbox the browser blocks submission: no request goes out.
  await page.getByRole('button', { name: 'Aanvraag versturen' }).click();
  await expect.poll(() => consent.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
  expect(scanRequests).toBe(0);

  await consent.check();
  await page.getByRole('button', { name: 'Aanvraag versturen' }).click();

  await expect(page.getByText(/Bedankt! Je aanvraag is verstuurd/)).toBeVisible();
  expect(scanRequests).toBe(1);
  expect(scanBody).toMatchObject({ consent: true, domain: DOMAIN });
  expect(scanType).toMatch(/^application\/json/i);
});

test('works in English', async ({ page }) => {
  await page.goto('/en/ai-projecten');
  await expect(page.getByRole('button', { name: 'Check my site' })).toBeVisible();
});
