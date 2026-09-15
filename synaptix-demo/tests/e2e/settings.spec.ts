import { test, expect } from '@playwright/test';
import type { Message } from '@/domain/types';
import { dispatch, gotoDemo, state } from '../helpers/demo';

const CID = 'conv-line-chiaying';
const assistantMessage = (id: string): Message => ({ id, conversationId: CID, at: '2026-09-15T10:40:00', author: 'assistant', kind: 'text', text: 'hello', delivery: 'delivered' });

test.describe('settings', () => {
  test('AI pause switch blocks assistant messages until resumed', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await page.getByTestId('nav-settings').click();
    await expect(page.getByTestId('settings-view')).toBeVisible();
    const sw = page.getByTestId('switch-ai-paused');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('ai-paused-warning')).toHaveCount(0);

    await sw.click();
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('ai-paused-warning')).toBeVisible();
    await expect.poll(() => state(page).then((s) => s.settings.aiPaused)).toBe(true);

    const before = (await state(page)).messageOrder[CID].length;
    await dispatch(page, { type: 'ADD_MESSAGE', message: assistantMessage('m-paused-1') });
    await dispatch(page, { type: 'SET_ASSISTANT_ACTIVITY', conversationId: CID, activity: { kind: 'composing', draftMessageId: 'm-paused-1' } });
    await page.waitForTimeout(50);
    let s = await state(page);
    expect(s.messageOrder[CID].length).toBe(before);
    expect(s.messages['m-paused-1']).toBeUndefined();
    expect(s.conversations[CID].assistant).toEqual({ kind: 'idle' });

    await sw.click();
    await expect.poll(() => state(page).then((st) => st.settings.aiPaused)).toBe(false);
    await dispatch(page, { type: 'ADD_MESSAGE', message: assistantMessage('m-resumed-1') });
    await expect.poll(() => state(page).then((st) => st.messageOrder[CID].length)).toBe(before + 1);
    s = await state(page);
    expect(s.messages['m-resumed-1']).toBeDefined();
  });

  test('escalation recipients can be toggled', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await page.getByTestId('nav-settings').click();
    await expect(page.getByTestId('escalation-row')).toHaveCount(3);
    const onCall = page.locator('[data-testid="escalation-row"][data-recipient-id="esc-on-call"]');
    await expect(onCall).toHaveAttribute('data-enabled', 'false');
    await onCall.getByTestId('escalation-switch').click();
    await expect(onCall).toHaveAttribute('data-enabled', 'true');
    await expect.poll(() => state(page).then((s) => s.settings.escalation.find((r) => r.id === 'esc-on-call')?.enabled)).toBe(true);

    const lead = page.locator('[data-testid="escalation-row"][data-recipient-id="esc-front-desk-lead"]');
    await lead.getByTestId('escalation-switch').click();
    await expect(lead).toHaveAttribute('data-enabled', 'false');
    const s = await state(page);
    expect(s.settings.escalation.map((r) => [r.id, r.enabled])).toEqual([
      ['esc-front-desk-lead', false],
      ['esc-clinic-manager', true],
      ['esc-on-call', true],
    ]);
  });

  test('changing a connection status updates the settings row and the rail dot', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await page.getByTestId('nav-settings').click();
    const rail = page.locator('nav.rail .rail__channel');
    await expect(rail).toHaveCount(5); // 4 channels + CRM
    await expect(rail.nth(0).locator('.dot')).toHaveClass(/dot--success/);

    const ig = page.locator('[data-testid="connection-row"][data-target="instagram"]');
    await ig.getByTestId('connection-status').click();
    await page.getByRole('option', { name: 'Disconnected' }).click();
    await expect(ig).toHaveAttribute('data-status', 'disconnected');
    await expect(ig.locator('.dot')).toHaveClass(/dot--error/);
    await expect(rail.nth(0).locator('.dot')).toHaveClass(/dot--error/);
    await expect(rail.nth(1).locator('.dot')).toHaveClass(/dot--success/);
    await expect.poll(() => state(page).then((s) => s.settings.channels.instagram.status)).toBe('disconnected');

    const crm = page.locator('[data-testid="connection-row"][data-target="crm"]');
    await crm.getByTestId('connection-status').click();
    await page.getByRole('option', { name: 'Degraded' }).click();
    await expect(crm).toHaveAttribute('data-status', 'degraded');
    await expect(rail.nth(4).locator('.dot')).toHaveClass(/dot--warning/);
    let s = await state(page);
    expect(s.settings.crmStatus).toBe('degraded');
    expect(s.crm.connected).toBe(true);

    await crm.getByTestId('connection-status').click();
    await page.getByRole('option', { name: 'Disconnected' }).click();
    await expect(rail.nth(4).locator('.dot')).toHaveClass(/dot--error/);
    s = await state(page);
    expect(s.settings.crmStatus).toBe('disconnected');
    expect(s.crm.connected).toBe(false);

    // The inbox booking panel reflects the CRM status when nothing is in flight.
    await page.getByTestId('nav-inbox').click();
    await page.locator('[data-testid="conversation-row"][data-conversation-id="conv-line-ken"]').click();
    await page.getByTestId('btn-booking-panel').click();
    await expect(page.getByTestId('crm-state')).toHaveText('CRM disconnected');
  });

  test('working-hours edits change whether the clinic is open right now', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await page.getByTestId('nav-settings').click();
    await expect(page.getByTestId('hours-status')).toContainText('Open');
    await expect(page.getByTestId('clock-label')).toHaveText(/Open/);
    await expect(page.getByTestId('hours-row')).toHaveCount(7);

    // Tuesday closes at 10:00 → 10:20 is after hours.
    const tuesday = page.locator('[data-testid="hours-row"][data-weekday="2"]');
    await tuesday.getByTestId('hours-close-time').fill('10:00');
    await expect.poll(() => state(page).then((s) => s.settings.workingHours.byWeekday[2]?.close)).toBe('10:00');
    await expect(page.getByTestId('hours-status')).toContainText('Closed');
    await expect(page.getByTestId('hours-status')).toContainText('Next opening Wed 16 Sep · 10:00');
    await expect(page.getByTestId('clock-label')).toHaveText(/Tue 15 Sep 10:20\s*·\s*Closed/);

    // Reopen Tuesday until 19:00 → open again.
    await tuesday.getByTestId('hours-close-time').fill('19:00');
    await expect(page.getByTestId('hours-status')).toContainText('Open');
    await expect(page.getByTestId('clock-label')).toHaveText(/Open/);

    // Closing the whole day via the switch also closes the clinic.
    await tuesday.getByTestId('hours-open-switch').click();
    await expect(tuesday).toHaveAttribute('data-closed', 'true');
    await expect.poll(() => state(page).then((s) => s.settings.workingHours.byWeekday[2])).toBeNull();
    await expect(page.getByTestId('clock-label')).toHaveText(/Closed/);
    await tuesday.getByTestId('hours-open-switch').click();
    await expect(tuesday).toHaveAttribute('data-closed', 'false');
    await expect(page.getByTestId('clock-label')).toHaveText(/Open/);

    // Adding today as a holiday closes the clinic regardless of the weekday span.
    await expect(page.getByTestId('holiday-row')).toHaveCount(5);
    await page.getByTestId('holiday-date').fill('2026-09-15');
    await page.getByTestId('holiday-label').fill('Staff training day');
    await page.getByTestId('btn-add-holiday').click();
    await expect(page.locator('[data-testid="holiday-row"][data-date="2026-09-15"]')).toContainText('Staff training day');
    await expect(page.getByTestId('holiday-row')).toHaveCount(6);
    await expect(page.getByTestId('clock-label')).toHaveText(/Closed/);
    const s = await state(page);
    expect(s.settings.workingHours.holidays.map((h) => h.date)).toEqual(['2026-09-15', '2026-09-24', '2026-09-25', '2026-09-26', '2026-10-03', '2026-10-09']);
  });
});
