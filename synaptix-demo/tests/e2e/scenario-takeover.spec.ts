import { test, expect } from '@playwright/test';
import type { Message } from '@/domain/types';
import { dispatch, gotoDemo, playUntilStep, row, state } from '../helpers/demo';

const CID = 'conv-line-chiaying';

function assistantMessage(conversationId: string, id: string): Message {
  return { id, conversationId, at: '2026-09-15T10:40:00', author: 'assistant', kind: 'text', text: 'should be rejected', delivery: 'delivered' };
}

test.describe('scenario 2 · human takeover', () => {
  test('handover → notification → take over → staff reply → return to AI', async ({ page }) => {
    await gotoDemo(page, { scenario: 'human-takeover' });
    await playUntilStep(page, 'handover');

    let s = await state(page);
    expect(s.guided.status).toBe('paused');
    expect(s.conversations[CID].ownership).toBe('needs_human');
    expect(s.conversations[CID].handover?.reason).toContain('sensitive skin');
    expect(s.notifications.find((n) => n.id === 'ntf-chiaying-handover')?.read).toBe(false);
    expect(s.selectedConversationId).toBeNull();

    await expect(row(page, CID)).toContainText('Needs human');
    await expect(page.getByTestId('notifications-count')).toHaveText('2'); // seeded Daniel + Chia-ying
    await page.getByTestId('notifications-button').click();
    const item = page.locator('[data-testid="notification-item"][data-notification-id="ntf-chiaying-handover"]');
    await expect(item).toBeVisible();
    await expect(item).toContainText('Needs human · 林佳穎');
    await item.click();

    await expect(page.getByTestId('workspace')).toHaveAttribute('data-conversation-id', CID);
    const banner = page.getByTestId('banner-needs-human');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Customer asked whether a laser programme suits her sensitive skin');
    await expect(banner.locator('.banner__points li')).toHaveCount(3);
    await expect(page.getByTestId('ownership-pill')).toHaveAttribute('data-ownership', 'needs_human');
    await expect(page.getByTestId('composer-input')).toHaveCount(0);
    await expect(page.locator('[data-message-id="m-chiaying-05"]')).toHaveAttribute('data-message-kind', 'handover');
    await expect.poll(() => state(page).then((st) => st.notifications.find((n) => n.id === 'ntf-chiaying-handover')?.read)).toBe(true);

    await page.getByTestId('btn-take-over').click();
    await expect(page.getByTestId('ownership-pill')).toHaveAttribute('data-ownership', 'human');
    await expect(page.getByTestId('banner-human')).toBeVisible();
    await expect(page.getByTestId('banner-needs-human')).toHaveCount(0);
    await expect(page.getByTestId('composer-input')).toBeVisible();
    await expect(page.getByTestId('composer-input')).toBeEnabled();
    s = await state(page);
    expect(s.conversations[CID].ownership).toBe('human');
    expect(s.conversations[CID].assistant).toEqual({ kind: 'idle' });
    const countBefore = s.messageOrder[CID].length;
    const systemLine = s.messages[s.messageOrder[CID][countBefore - 1]];
    expect(systemLine.author).toBe('system');
    expect(systemLine.text).toContain('Kim Seo-yeon took over');

    // While a human owns the conversation the assistant cannot post.
    await dispatch(page, { type: 'ADD_MESSAGE', message: assistantMessage(CID, 'm-rejected-1') });
    await dispatch(page, { type: 'SET_ASSISTANT_ACTIVITY', conversationId: CID, activity: { kind: 'reading' } });
    await expect.poll(() => state(page).then((st) => st.messageOrder[CID].length)).toBe(countBefore);
    s = await state(page);
    expect(s.messages['m-rejected-1']).toBeUndefined();
    expect(s.conversations[CID].assistant.kind).toBe('idle');
    await expect(page.getByTestId('assistant-activity')).toHaveCount(0);

    // Staff reply via the composer.
    const input = page.getByTestId('composer-input');
    await input.fill('Hi Chia-ying, Seo-yeon here — happy to help.');
    await input.press('Enter');
    const staffMsg = page.locator('[data-testid="message"][data-author="staff"]').last();
    await expect(staffMsg).toContainText('Seo-yeon here');
    await expect(staffMsg.getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');
    await expect(input).toHaveValue('');
    s = await state(page);
    expect(s.messageOrder[CID].length).toBe(countBefore + 1);
    const sent = s.messages[s.messageOrder[CID][countBefore]];
    expect(sent).toMatchObject({ author: 'staff', kind: 'text', delivery: 'delivered', text: 'Hi Chia-ying, Seo-yeon here — happy to help.' });

    await page.getByTestId('btn-return-ai').click();
    await expect(page.getByTestId('ownership-pill')).toHaveAttribute('data-ownership', 'ai');
    await expect(page.getByTestId('composer-input')).toHaveCount(0);
    await expect(page.getByTestId('btn-take-over')).toBeVisible();
    s = await state(page);
    expect(s.conversations[CID].ownership).toBe('ai');
    expect(s.conversations[CID].handover).toBeUndefined();
    const lastLine = s.messages[s.messageOrder[CID][s.messageOrder[CID].length - 1]];
    expect(lastLine.author).toBe('system');
    expect(lastLine.text).toContain('Returned to AI');
    await expect(page.locator('[data-testid="message"][data-author="system"]').last()).toContainText('Returned to AI');
  });

  test('explore mode: take over Daniel, return to AI; taking over while composing resets activity', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await row(page, 'conv-wa-daniel').click();
    await expect(page.getByTestId('banner-needs-human')).toBeVisible();
    await page.getByTestId('btn-take-over-banner').click();
    await expect(page.getByTestId('ownership-pill')).toHaveAttribute('data-ownership', 'human');
    await expect.poll(() => state(page).then((s) => s.conversations['conv-wa-daniel'].ownership)).toBe('human');
    await expect(page.getByTestId('composer-input')).toBeVisible();
    await page.getByTestId('btn-return-ai').click();
    await expect.poll(() => state(page).then((s) => s.conversations['conv-wa-daniel'].ownership)).toBe('ai');
    await expect(page.getByTestId('ownership-pill')).toHaveAttribute('data-ownership', 'ai');

    // Sophie: assistant composing → Take over discards the draft activity.
    await row(page, 'conv-wa-sophie').click();
    await dispatch(page, { type: 'SET_ASSISTANT_ACTIVITY', conversationId: 'conv-wa-sophie', activity: { kind: 'composing', draftMessageId: 'draft-x' } });
    await expect(page.getByTestId('assistant-activity')).toHaveAttribute('data-activity', 'composing');
    await expect.poll(() => state(page).then((s) => s.conversations['conv-wa-sophie'].assistant.kind)).toBe('composing');

    await page.getByTestId('btn-take-over-composer').click();
    await expect(page.getByTestId('assistant-activity')).toHaveCount(0);
    await expect.poll(() => state(page).then((s) => s.conversations['conv-wa-sophie'].assistant)).toEqual({ kind: 'idle' });
    expect((await state(page)).conversations['conv-wa-sophie'].ownership).toBe('human');
    // And it stays idle even if a stale activity update arrives.
    await dispatch(page, { type: 'SET_ASSISTANT_ACTIVITY', conversationId: 'conv-wa-sophie', activity: { kind: 'composing', draftMessageId: 'draft-y' } });
    await page.waitForTimeout(50);
    expect((await state(page)).conversations['conv-wa-sophie'].assistant).toEqual({ kind: 'idle' });
  });
});
