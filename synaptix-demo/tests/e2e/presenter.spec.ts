import { test, expect, type Page } from '@playwright/test';
import { gotoDemo, playToEnd, playerNext, row, seedProjection, state, stepIndex } from '../helpers/demo';

const totalMessages = async (page: Page) => Object.keys((await state(page)).messages).length;

test.describe('presenter bar', () => {
  test('scenario select lists the six scenarios in presentation order', async ({ page }) => {
    await gotoDemo(page);
    await expect(page.getByTestId('step-label')).toHaveText('Select a scenario to begin');
    await expect(page.getByTestId('btn-play')).toBeDisabled();
    await expect(page.getByTestId('btn-next')).toBeDisabled();
    await expect(page.getByTestId('btn-restart')).toBeDisabled();

    await page.getByTestId('scenario-select').click();
    const options = page.getByRole('option');
    await expect(options).toHaveCount(6);
    const labels = await options.allInnerTexts();
    expect(labels.map((l) => l.split('\n')[0].trim())).toEqual([
      '1. Instagram inquiry → confirmed booking',
      '2. Human takeover',
      '3. After hours · queued for staff',
      '4. Reschedule an existing booking',
      '5. Manager-approved photo',
      '6. Booking uncertainty · CRM timeout (optional)',
    ]);
    await options.nth(2).click();
    await expect.poll(() => state(page).then((s) => s.guided.scenarioId)).toBe('after-hours');
    await expect(page.getByTestId('scenario-select')).toContainText('After hours');
    await expect(page.getByTestId('step-label')).toContainText('Step 1 of');
    await expect(page.getByTestId('btn-play')).toBeEnabled();
  });

  test('Play then Pause stops advancing (normal speed)', async ({ page }) => {
    await gotoDemo(page, { scenario: 'inquiry-to-booking', speed: 'normal' });
    await page.getByTestId('btn-play').click();
    await expect.poll(() => state(page).then((s) => s.guided.status)).toBe('playing');
    await expect(page.getByTestId('btn-pause')).toBeVisible();
    // First step pauses after it lands (~900 ms); press Play again to continue past it.
    await expect.poll(() => stepIndex(page), { timeout: 10_000 }).toBeGreaterThanOrEqual(1);
    await expect.poll(() => state(page).then((s) => s.guided.status)).toBe('paused');
    await page.getByTestId('btn-play').click();
    await expect.poll(() => stepIndex(page), { timeout: 10_000 }).toBeGreaterThanOrEqual(2);

    await page.getByTestId('btn-pause').click();
    await expect.poll(() => state(page).then((s) => s.guided.status)).toBe('paused');
    const frozen = await stepIndex(page);
    const messages = await totalMessages(page);
    await page.waitForTimeout(1500);
    expect(await stepIndex(page)).toBe(frozen);
    expect(await totalMessages(page)).toBe(messages);
    expect((await state(page)).guided.status).toBe('paused');
    await expect(page.getByTestId('btn-play')).toBeVisible();
  });

  test('switching to Explore mid-play cancels playback', async ({ page }) => {
    await gotoDemo(page, { scenario: 'inquiry-to-booking', speed: 'normal' });
    await page.getByTestId('btn-play').click();
    await expect.poll(() => stepIndex(page), { timeout: 10_000 }).toBeGreaterThanOrEqual(1);
    await page.getByTestId('btn-play').click();
    await expect.poll(() => state(page).then((s) => s.guided.status)).toBe('playing');
    const runBefore = (await state(page)).guided.runId;

    await page.getByTestId('mode-toggle').getByRole('tab', { name: 'Explore' }).click();
    await expect.poll(() => state(page).then((s) => s.mode)).toBe('explore');
    let s = await state(page);
    expect(s.guided.status).toBe('paused');
    expect(s.guided.runId).toBe(runBefore + 1);
    const frozen = s.guided.stepIndex;
    const messages = Object.keys(s.messages).length;
    // The scenario stays selected in explore mode (the label keeps "Step N of M"); only playback stops.
    await expect(page.getByTestId('mode-toggle').getByRole('tab', { name: 'Explore' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('btn-play')).toBeVisible();
    await page.waitForTimeout(1500);
    s = await state(page);
    expect(s.guided.stepIndex).toBe(frozen);
    expect(Object.keys(s.messages).length).toBe(messages);
    expect(s.guided.status).toBe('paused');
  });

  test('switching scenarios mid-play leaves nothing from the previous scenario behind', async ({ page }) => {
    await gotoDemo(page, { scenario: 'inquiry-to-booking', speed: 'normal' });
    await page.getByTestId('btn-play').click();
    await expect.poll(() => state(page).then((s) => !!s.conversations['conv-ig-misaki']), { timeout: 10_000 }).toBe(true);
    await page.getByTestId('btn-play').click();
    await expect.poll(() => state(page).then((s) => s.guided.status)).toBe('playing');

    await page.getByTestId('scenario-select').click();
    await page.getByRole('option', { name: /2\. Human takeover/ }).click();
    await expect.poll(() => state(page).then((s) => s.guided.scenarioId)).toBe('human-takeover');
    let s = await state(page);
    expect(s.guided).toMatchObject({ stepIndex: 0, status: 'paused' });
    expect(s.conversations['conv-ig-misaki']).toBeUndefined();
    expect(s.messages['m-misaki-01']).toBeUndefined();
    expect(Object.keys(s.conversations)).toHaveLength(8);
    await expect(row(page, 'conv-ig-misaki')).toHaveCount(0);

    await page.waitForTimeout(2000); // any stale timer from scenario 1 must be a no-op
    s = await state(page);
    expect(s.guided).toMatchObject({ scenarioId: 'human-takeover', stepIndex: 0, status: 'paused' });
    expect(s.conversations['conv-ig-misaki']).toBeUndefined();
    expect(s.conversations['conv-line-chiaying'].ownership).toBe('ai');
    expect(s.messages['m-chiaying-04']).toBeUndefined();
  });

  test('Reset all restores the seed exactly and closes the notification popover', async ({ page }) => {
    await gotoDemo(page);
    const seed = seedProjection(await state(page));
    expect(seed.notifications).toHaveLength(1);

    await page.evaluate(() => window.__synaptix!.player.start('inquiry-to-booking'));
    await expect.poll(() => state(page).then((s) => s.guided.scenarioId)).toBe('inquiry-to-booking');
    await playToEnd(page);
    await page.getByTestId('role-switch').getByRole('tab', { name: 'Manager' }).click();
    await page.getByTestId('filter-instagram').click();
    await page.getByTestId('notifications-button').click();
    await expect(page.getByTestId('notification-item').first()).toBeVisible();
    expect(seedProjection(await state(page))).not.toEqual(seed);

    await page.getByTestId('btn-reset').click();
    await expect.poll(() => state(page).then((s) => s.guided.scenarioId)).toBeNull();
    const s = await state(page);
    expect(seedProjection(s)).toEqual(seed);
    expect(s.notifications).toHaveLength(1);
    expect(s.role).toBe('staff');
    expect(s.mode).toBe('guided');
    expect(s.guided).toMatchObject({ scenarioId: null, stepIndex: 0, status: 'idle' });
    expect(s.notificationsOpen).toBe(false);
    expect(s.filters).toEqual({ channel: 'all', needsHumanOnly: false, search: '' });
    await expect(page.getByTestId('notification-item')).toHaveCount(0);
    await expect(page.getByTestId('notifications-count')).toHaveText('1');
    await expect(page.getByTestId('conversation-row')).toHaveCount(8);
    await expect(page.getByTestId('step-label')).toHaveText('Select a scenario to begin');
    await expect(page.getByTestId('clock-label')).toHaveText(/Tue 15 Sep 10:20\s*·\s*Open/);
  });

  test('Restart mid-scenario returns to step 0 with the setup applied', async ({ page }) => {
    await gotoDemo(page, { scenario: 'reschedule-cancel' });
    for (let i = 0; i < 6; i++) await playerNext(page);
    let s = await state(page);
    expect(s.guided.stepIndex).toBe(6);
    expect(s.messageOrder['conv-wa-emily'].length).toBeGreaterThan(7);
    // Perturb the presentation state so we can see the setup being re-applied.
    await page.getByTestId('btn-booking-panel').click();
    await expect.poll(() => state(page).then((st) => st.bookingPanelOpen)).toBe(false);
    await row(page, 'conv-wa-sophie').click();
    await expect.poll(() => state(page).then((st) => st.selectedConversationId)).toBe('conv-wa-sophie');

    await page.getByTestId('btn-restart').click();
    await expect.poll(() => state(page).then((st) => st.guided.stepIndex)).toBe(0);
    s = await state(page);
    expect(s.guided).toMatchObject({ scenarioId: 'reschedule-cancel', stepIndex: 0, status: 'paused' });
    expect(s.selectedConversationId).toBe('conv-wa-emily');
    expect(s.bookingPanelOpen).toBe(true);
    expect(s.messageOrder['conv-wa-emily']).toHaveLength(7);
    expect(s.conversations['conv-wa-emily'].booking.intent).toBe('book');
    expect(s.crm.appointments['apt-emily'].slotId).toBe('2026-09-18T15:00');
    await expect(page.getByTestId('booking-panel')).toBeVisible();
    await expect(page.getByTestId('workspace')).toHaveAttribute('data-conversation-id', 'conv-wa-emily');
    await expect(page.getByTestId('step-label')).toContainText('Step 1 of');
  });
});
