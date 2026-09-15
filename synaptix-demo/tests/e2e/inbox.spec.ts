import { test, expect, type Page } from '@playwright/test';
import { gotoDemo, playUntilStep, row, state } from '../helpers/demo';

const ROWS = '[data-testid="conversation-row"]';

async function visibleIds(page: Page): Promise<string[]> {
  const ids = await page.locator(ROWS).evaluateAll((els) => els.map((el) => el.getAttribute('data-conversation-id') ?? ''));
  return ids.sort();
}

test.describe('inbox', () => {
  test('channel filters show only conversations on that channel', async ({ page }) => {
    await gotoDemo(page);
    await expect(page.locator(ROWS)).toHaveCount(8);

    await page.getByTestId('filter-instagram').click();
    await expect(page.getByTestId('filter-instagram')).toHaveAttribute('aria-pressed', 'true');
    expect(await visibleIds(page)).toEqual(['conv-ig-hina']);

    await page.getByTestId('filter-whatsapp').click();
    expect(await visibleIds(page)).toEqual(['conv-wa-daniel', 'conv-wa-emily', 'conv-wa-sophie']);

    await page.getByTestId('filter-line').click();
    expect(await visibleIds(page)).toEqual(['conv-line-chiaying', 'conv-line-ken']);

    await page.getByTestId('filter-wechat').click();
    expect(await visibleIds(page)).toEqual(['conv-wechat-meiling', 'conv-wechat-wei']);

    await page.getByTestId('filter-all').click();
    await expect(page.locator(ROWS)).toHaveCount(8);
  });

  test('Needs human filter shows Daniel only, then also the queued after-hours conversation', async ({ page }) => {
    await gotoDemo(page);
    const needs = page.getByTestId('filter-needs-human');
    await expect(needs).toContainText('1');
    await needs.click();
    await expect(needs).toHaveAttribute('aria-pressed', 'true');
    expect(await visibleIds(page)).toEqual(['conv-wa-daniel']);
    await expect(row(page, 'conv-wa-daniel')).toContainText('Needs human');
    await needs.click();
    await expect(page.locator(ROWS)).toHaveCount(8);

    // Scenario 3 queues Wang Wei after hours — he must appear under Needs human too.
    await page.evaluate(() => window.__synaptix!.player.start('after-hours'));
    await expect.poll(() => state(page).then((s) => s.guided.scenarioId)).toBe('after-hours');
    await playUntilStep(page, 'queue');
    await expect.poll(() => state(page).then((s) => s.conversations['conv-wechat-wei'].afterHoursQueued)).toBe(true);
    await page.getByTestId('filter-needs-human').click();
    expect(await visibleIds(page)).toEqual(['conv-wa-daniel', 'conv-wechat-wei']);
    await expect(row(page, 'conv-wechat-wei')).toContainText('Queued');
  });

  test('search matches message text, Korean reading, and shows an empty state', async ({ page }) => {
    await gotoDemo(page);
    const search = page.getByTestId('search-input');

    await search.fill('airport');
    expect(await visibleIds(page)).toEqual(['conv-wa-sophie']);

    await search.fill('zzzz-no-such-customer');
    await expect(page.locator(ROWS)).toHaveCount(0);
    await expect(page.locator('.list__empty')).toContainText('No conversations match');
    await expect(page.locator('.list__empty')).toContainText('zzzz-no-such-customer');

    // Misaki only exists once scenario 1 has created her conversation.
    await search.fill('미사키');
    await expect(page.locator(ROWS)).toHaveCount(0);
    await page.evaluate(() => window.__synaptix!.player.start('inquiry-to-booking'));
    await expect.poll(() => state(page).then((s) => s.guided.scenarioId)).toBe('inquiry-to-booking');
    // START_SCENARIO resets the filters — type the search again.
    await search.fill('미사키');
    await expect(page.locator(ROWS)).toHaveCount(0);
    await playUntilStep(page, 'inquiry-arrives');

    // She arrives unidentified: Instagram gives us a handle, not a name. The Korean
    // reading cannot match yet, but the handle can.
    await expect(page.locator(ROWS)).toHaveCount(0);
    await search.fill('misaki.sato');
    expect(await visibleIds(page)).toEqual(['conv-ig-misaki']);
    await expect(row(page, 'conv-ig-misaki')).toContainText('@misaki.sato');
    await expect(row(page, 'conv-ig-misaki')).not.toContainText('佐藤 美咲');

    // She gives her name to complete the booking; the contact fills in from there.
    await playUntilStep(page, 'confirms');
    await search.fill('미사키');
    expect(await visibleIds(page)).toEqual(['conv-ig-misaki']);
    await expect(row(page, 'conv-ig-misaki')).toContainText('佐藤 美咲');
  });

  test('clicking a row selects it and clears its unread badge', async ({ page }) => {
    await gotoDemo(page);
    const sophie = row(page, 'conv-wa-sophie');
    await expect(sophie.locator('.count')).toHaveText('1');
    expect((await state(page)).conversations['conv-wa-sophie'].unread).toBe(1);

    await sophie.click();
    await expect(sophie).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('workspace')).toHaveAttribute('data-conversation-id', 'conv-wa-sophie');
    await expect(page.locator('.thread-header__name')).toContainText('Sophie Müller');
    await expect(sophie.locator('.count')).toHaveCount(0);
    await expect.poll(() => state(page).then((s) => s.conversations['conv-wa-sophie'].unread)).toBe(0);
    await expect.poll(() => state(page).then((s) => s.selectedConversationId)).toBe('conv-wa-sophie');
  });

  test('keyboard: ArrowDown moves the selection, Enter selects a focused row', async ({ page }) => {
    await gotoDemo(page);
    const listbox = page.getByRole('listbox', { name: 'Conversation list' });
    await listbox.focus();
    await page.keyboard.press('ArrowDown');
    // Newest activity first: Hina (10:14) is the first row.
    await expect.poll(() => state(page).then((s) => s.selectedConversationId)).toBe('conv-ig-hina');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => state(page).then((s) => s.selectedConversationId)).toBe('conv-wa-daniel');
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => state(page).then((s) => s.selectedConversationId)).toBe('conv-ig-hina');

    const emily = row(page, 'conv-wa-emily');
    await emily.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => state(page).then((s) => s.selectedConversationId)).toBe('conv-wa-emily');
    await expect(page.getByTestId('workspace')).toHaveAttribute('data-conversation-id', 'conv-wa-emily');
  });

  test('notification bell shows the seeded count; opening a notification selects Daniel and marks it read', async ({ page }) => {
    await gotoDemo(page);
    const bell = page.getByTestId('notifications-button');
    await expect(page.getByTestId('notifications-count')).toHaveText('1');
    await expect(bell).toHaveAttribute('aria-label', /1 unread/);

    await bell.click();
    const item = page.locator('[data-testid="notification-item"][data-notification-id="ntf-seed-daniel"]');
    await expect(item).toBeVisible();
    await expect(item).toContainText('Daniel Reyes');
    await item.click();

    await expect(page.getByTestId('workspace')).toHaveAttribute('data-conversation-id', 'conv-wa-daniel');
    await expect(page.getByTestId('banner-needs-human')).toBeVisible();
    await expect(page.getByTestId('notifications-count')).toHaveCount(0);
    await expect(page.getByTestId('notification-item')).toHaveCount(0); // popover closed
    const s = await state(page);
    expect(s.notifications.find((n) => n.id === 'ntf-seed-daniel')?.read).toBe(true);
    expect(s.notificationsOpen).toBe(false);
    expect(s.conversations['conv-wa-daniel'].unread).toBe(0);
  });
});
