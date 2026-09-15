/**
 * Records docs/recording/walkthrough.webm — scenarios 1 and 2 at normal speed with real clicks.
 * Skipped unless RECORD=1:
 *   RECORD=1 npx playwright test tests/e2e/recording.spec.ts --project=e2e
 */
import { test, expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { demoUrl, playerStatus, state } from '../helpers/demo';

test.describe.configure({ mode: 'serial' });
test.skip(!process.env.RECORD, 'set RECORD=1 to record the walkthrough video');

const DIR = fileURLToPath(new URL('../../docs/recording/', import.meta.url));
const SIZE = { width: 1440, height: 900 };
const BEAT = 1500;

const lastStepId = (page: Page) => page.evaluate(() => window.__synaptix!.player.lastStep?.id ?? null);

/** Waits until playback pauses (decision point) or completes. */
async function waitForPause(page: Page) {
  await expect.poll(() => playerStatus(page), { timeout: 60_000 }).toMatch(/paused|complete/);
}

async function chooseScenario(page: Page, label: RegExp) {
  await page.getByTestId('scenario-select').click();
  await page.getByRole('option', { name: label }).click();
  await page.waitForTimeout(800);
}

test('record the walkthrough (scenario 1 + scenario 2)', async ({ browser }) => {
  test.setTimeout(300_000);
  const context = await browser.newContext({
    viewport: SIZE,
    recordVideo: { dir: DIR, size: SIZE },
    locale: 'en-GB',
    timezoneId: 'Asia/Seoul',
  });
  const page = await context.newPage();
  const video = page.video();
  expect(video).not.toBeNull();

  await page.goto(demoUrl({ speed: 'normal' }));
  await page.waitForFunction(() => !!window.__synaptix);
  await page.waitForTimeout(BEAT);

  /* ---- Scenario 1: play through every pause ---- */
  await chooseScenario(page, /1\. Instagram inquiry/);
  await page.getByTestId('btn-play').click();
  for (let i = 0; i < 12; i++) {
    await waitForPause(page);
    if ((await playerStatus(page)) === 'complete') break;
    const last = await lastStepId(page);
    await page.waitForTimeout(BEAT);
    if (last === 'confirms') {
      await page.getByTestId('btn-booking-panel').click();
      await page.waitForTimeout(BEAT);
    }
    await page.getByTestId('btn-play').click();
  }
  expect(await playerStatus(page)).toBe('complete');
  await page.waitForTimeout(BEAT * 2);

  /* ---- Scenario 2: notification, Take over and a typed reply ---- */
  await chooseScenario(page, /2\. Human takeover/);
  await page.getByTestId('btn-play').click();
  await waitForPause(page);
  expect(await lastStepId(page)).toBe('handover');
  await page.waitForTimeout(BEAT);
  await page.getByTestId('notifications-button').click();
  await page.waitForTimeout(800);
  await page.locator('[data-testid="notification-item"][data-notification-id="ntf-chiaying-handover"]').click();
  await page.waitForTimeout(BEAT);
  await page.evaluate(() => window.__synaptix!.player.next()); // 'staff-opens' (already done by the click; keeps the step counter honest)
  await waitForPause(page);
  await page.waitForTimeout(BEAT);
  await page.getByTestId('btn-take-over').click();
  await expect(page.getByTestId('composer-input')).toBeVisible();
  await page.evaluate(() => window.__synaptix!.player.next()); // 'take-over' (no-op: already human)
  await page.waitForTimeout(BEAT);
  const input = page.getByTestId('composer-input');
  await input.click();
  await input.pressSequentially("Hi Chia-ying, this is Seo-yeon from the front desk. Our consultant assesses suitability in person — I can book a consultation for early October and note your sensitivity.", { delay: 12 });
  await page.waitForTimeout(500);
  await input.press('Enter');
  await expect(page.locator('[data-testid="message"][data-author="staff"]').last().getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');
  await page.waitForTimeout(BEAT * 2);
  await page.getByTestId('btn-return-ai').click();
  await expect.poll(() => state(page).then((s) => s.conversations['conv-line-chiaying'].ownership)).toBe('ai');
  await page.waitForTimeout(BEAT * 2);

  await context.close();
  await video!.saveAs(`${DIR}walkthrough.webm`);
  await video!.delete();
});
