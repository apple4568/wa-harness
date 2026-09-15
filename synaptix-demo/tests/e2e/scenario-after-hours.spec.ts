import { test, expect } from '@playwright/test';
import { gotoDemo, playToEnd, playUntilStep, playerNext, row, state } from '../helpers/demo';

const CID = 'conv-wechat-wei';

test.describe('scenario 3 · after hours', () => {
  test('closed clock → queued → next opening Mon 28 Sep → staff follow-up dequeues', async ({ page }) => {
    await gotoDemo(page, { scenario: 'after-hours' });
    let s = await state(page);
    expect(s.clock).toBe('2026-09-23T21:40:00');
    expect(s.selectedConversationId).toBe(CID);
    await expect(page.getByTestId('clock-label')).toHaveText(/Wed 23 Sep 21:40\s*·\s*Closed/);
    await expect(page.getByTestId('banner-after-hours')).toHaveCount(0);

    await playUntilStep(page, 'queue');
    s = await state(page);
    expect(s.guided.status).toBe('paused');
    expect(s.conversations[CID].afterHoursQueued).toBe(true);
    expect(s.conversations[CID].ownership).toBe('needs_human');
    expect(s.notifications.some((n) => n.id === 'ntf-wei-queued' && n.kind === 'after_hours_queue')).toBe(true);
    // The assistant told the customer when staff will reply, and stays silent afterwards.
    expect(s.messages['m-wei-05'].text).toContain('9月28日');
    const queuedLine = s.messages['m-wei-06'];
    expect(queuedLine.author).toBe('system');
    expect(queuedLine.text).toContain('Mon 28 Sep 10:00');

    const banner = page.getByTestId('banner-after-hours');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Received after hours');
    await expect(banner).toContainText('Mon 28 Sep');
    await expect(banner).toContainText('Chuseok');
    await expect(row(page, CID)).toContainText('Queued');

    await page.getByTestId('filter-needs-human').click();
    const ids = await page.getByTestId('conversation-row').evaluateAll((els) => els.map((el) => el.getAttribute('data-conversation-id')));
    expect(ids.sort()).toEqual(['conv-wa-daniel', CID]);
    await page.getByTestId('filter-needs-human').click();

    // Clock jumps to the next opening — skipping Chuseok (24–26) and Sunday (27).
    await playerNext(page);
    s = await state(page);
    expect(s.clock).toBe('2026-09-28T10:00:00');
    expect(s.guided.status).toBe('paused');
    expect(s.notifications.find((n) => n.id === 'ntf-wei-waiting')).toMatchObject({ kind: 'needs_human', read: false, conversationId: CID });
    expect(s.conversations[CID].afterHoursQueued).toBe(true);
    expect(s.conversations[CID].ownership).toBe('needs_human');
    await expect(page.getByTestId('clock-label')).toHaveText(/Mon 28 Sep 10:00\s*·\s*Open/);
    await expect(banner).toContainText('The clinic is open now');
    await expect(page.getByTestId('notifications-count')).toHaveText('3');

    // Staff takes over, dequeues and replies.
    await playToEnd(page);
    s = await state(page);
    expect(s.conversations[CID].afterHoursQueued).toBe(false);
    expect(s.conversations[CID].ownership).toBe('human');
    expect(s.notifications.find((n) => n.id === 'ntf-wei-waiting')?.read).toBe(true);
    const order = s.messageOrder[CID];
    const last = s.messages[order[order.length - 1]];
    expect(last.author).toBe('staff');
    expect(last.text).toContain('Good morning Wei');
    await expect(page.getByTestId('banner-after-hours')).toHaveCount(0);
    await expect(page.getByTestId('banner-human')).toBeVisible();
    await expect(row(page, CID)).not.toContainText('Queued');
    await expect(page.locator('[data-testid="message"][data-author="staff"]').last().getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');
  });

  test('the assistant never replies to a queued conversation', async ({ page }) => {
    await gotoDemo(page, { scenario: 'after-hours' });
    await playUntilStep(page, 'queue');
    const before = (await state(page)).messageOrder[CID].length;
    await page.evaluate((cid) =>
      window.__synaptix!.dispatch({
        type: 'ADD_MESSAGE',
        message: { id: 'm-wei-rejected', conversationId: cid, at: '2026-09-23T21:50:00', author: 'assistant', kind: 'text', text: 'nope', delivery: 'delivered' },
      }),
      CID,
    );
    await page.waitForTimeout(50);
    const s = await state(page);
    expect(s.messageOrder[CID].length).toBe(before);
    expect(s.messages['m-wei-rejected']).toBeUndefined();
  });
});
