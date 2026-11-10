import { expect, test, type Page } from '@playwright/test';

const JSON_TYPE = /^application\/json/i;

async function mockContact(page: Page, status = 200) {
  const bodies: unknown[] = [];
  await page.route('**/api/contact', (route) => {
    // The real route answers 415 to anything but JSON.
    if (!JSON_TYPE.test(route.request().headers()['content-type'] ?? '')) {
      return route.fulfill({ status: 415, contentType: 'application/json', body: '{}' });
    }
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ status, contentType: 'application/json', body: '{"success":true}' });
  });
  return bodies;
}

async function fillContactForm(page: Page) {
  await page.goto('/nl/contact');
  await page.getByLabel('Naam').fill('Jan Peeters');
  await page.getByLabel('E-mail').fill('jan@example.com');
  await page.getByRole('textbox', { name: 'Bericht' }).fill('Graag meer info.');
  await page.getByRole('button', { name: 'Verstuur bericht' }).click();
}

test('contact page sends a message through the form', async ({ page }) => {
  const bodies = await mockContact(page);
  await fillContactForm(page);

  await expect(page.getByText('Bedankt, je bericht is verzonden.')).toBeVisible();
  expect(bodies).toEqual([
    { name: 'Jan Peeters', email: 'jan@example.com', phone: '', message: 'Graag meer info.', website: '' },
  ]);
});

test('contact form shows an inline error and keeps the message when sending fails', async ({ page }) => {
  await mockContact(page, 502);
  await fillContactForm(page);

  await expect(page.locator('form').getByRole('alert')).toContainText('m@thiasbv.com');
  await expect(page.getByRole('textbox', { name: 'Bericht' })).toHaveValue('Graag meer info.');
});

test('homepage offers the quick check', async ({ page }) => {
  await page.goto('/nl');

  await page.getByRole('link', { name: 'Test je website gratis' }).click();
  await expect(page).toHaveURL(/#snelle-check$/);
  await expect(page.getByLabel('Je domeinnaam')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check mijn site' })).toBeVisible();
});

test('hero leads with the offer and a contact call to action', async ({ page }) => {
  await page.goto('/nl');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Haal meer uit ServiceNow/);
  await page.getByRole('link', { name: 'Plan een kennismaking' }).first().click();
  await expect(page).toHaveURL(/\/nl\/contact$/);
});

for (const lang of ['en', 'fr'] as const) {
  test(`homepage and contact form render in ${lang}`, async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(page.locator('#snelle-check')).toBeVisible();
    await page.goto(`/${lang}/contact`);
    await expect(page.locator('form')).toBeVisible();
  });
}
