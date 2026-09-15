/**
 * Reference screenshots for docs/screenshots (viewport 1440×900, animations disabled, instant speed).
 * Serial so the images are produced in a predictable order.
 */
import { test, expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { brokenImages, gotoDemo, openBookingPanel, playToEnd, playUntilStep, row, state } from '../helpers/demo';

test.describe.configure({ mode: 'serial' });
test.use({ viewport: { width: 1440, height: 900 } });

const DIR = fileURLToPath(new URL('../../docs/screenshots/', import.meta.url));

async function snap(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  expect(await brokenImages(page)).toEqual([]);
  await page.screenshot({ path: `${DIR}${name}`, animations: 'disabled', caret: 'hide' });
}

test('01-inbox.png — explore mode, seed data', async ({ page }) => {
  await gotoDemo(page, { mode: 'explore' });
  await row(page, 'conv-wa-emily').click();
  await expect(page.getByTestId('workspace')).toHaveAttribute('data-conversation-id', 'conv-wa-emily');
  await snap(page, '01-inbox.png');
});

test('02-inquiry-photo.png — scenario 1 after the reception photo', async ({ page }) => {
  await gotoDemo(page, { scenario: 'inquiry-to-booking' });
  await playUntilStep(page, 'send-reception-photo');
  await expect(page.locator('[data-message-id="m-misaki-03"] img')).toBeVisible();
  await snap(page, '02-inquiry-photo.png');
});

test('03-booking-confirmed.png — scenario 1 complete, booking panel open', async ({ page }) => {
  await gotoDemo(page, { scenario: 'inquiry-to-booking' });
  await playToEnd(page);
  await openBookingPanel(page);
  await expect(page.getByTestId('confirmation-state')).toHaveText('Delivered');
  await snap(page, '03-booking-confirmed.png');
});

test('04-takeover.png — scenario 2 after Take over', async ({ page }) => {
  await gotoDemo(page, { scenario: 'human-takeover' });
  await playUntilStep(page, 'take-over');
  await expect(page.getByTestId('banner-human')).toBeVisible();
  await expect(page.getByTestId('composer-input')).toBeVisible();
  await snap(page, '04-takeover.png');
});

test('05-knowledge-approval.png — scenario 5 at the approve pause (manager)', async ({ page }) => {
  await gotoDemo(page, { scenario: 'manager-approved-photo' });
  await playUntilStep(page, 'manager-signs-in');
  expect((await state(page)).role).toBe('manager');
  // Show the photo grid (the draft sits below the text answers otherwise).
  await page.getByTestId('knowledge-filter-photo').click();
  const draft = page.locator('[data-testid="knowledge-item"][data-knowledge-id="ph-recovery-lounge"]');
  await expect(draft.getByTestId('btn-approve')).toBeVisible();
  await draft.scrollIntoViewIfNeeded();
  await expect(draft.getByTestId('btn-approve')).toBeInViewport();
  await snap(page, '05-knowledge-approval.png');
});

test('06-after-hours.png — scenario 3 queued for the next opening', async ({ page }) => {
  await gotoDemo(page, { scenario: 'after-hours' });
  await playUntilStep(page, 'queue');
  await expect(page.getByTestId('banner-after-hours')).toBeVisible();
  await snap(page, '06-after-hours.png');
});

test('07-needs-review.png — scenario 6 CRM timeout flagged for review', async ({ page }) => {
  await gotoDemo(page, { scenario: 'booking-uncertainty' });
  await playUntilStep(page, 'timeout');
  await expect(page.getByTestId('booking-review')).toBeVisible();
  await snap(page, '07-needs-review.png');
});
