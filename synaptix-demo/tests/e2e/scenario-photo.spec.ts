import { test, expect, type Page } from '@playwright/test';
import { TINY_PNG, dispatch, gotoDemo, playToEnd, playUntilStep, playerNext, row, state } from '../helpers/demo';

const PHOTO = 'ph-recovery-lounge';
const SRC = '/photos/recovery-lounge.svg';
const SOPHIE = 'conv-wa-sophie';

const item = (page: Page, id: string) => page.locator(`[data-testid="knowledge-item"][data-knowledge-id="${id}"]`);

test.describe('scenario 5 · manager-approved photo', () => {
  test('draft → manager approves → assistant sends it → withdrawn (history preserved, not selectable)', async ({ page }) => {
    await gotoDemo(page, { scenario: 'manager-approved-photo' });
    let s = await state(page);
    expect(s.view).toBe('knowledge');
    expect(s.role).toBe('staff');
    expect(s.knowledge[PHOTO]).toBeUndefined();
    await expect(page.getByTestId('knowledge-view')).toBeVisible();
    await expect(item(page, PHOTO)).toHaveCount(0);

    await playUntilStep(page, 'add-draft');
    s = await state(page);
    expect(s.knowledge[PHOTO]).toMatchObject({ state: 'draft', origin: 'session', kind: 'photo', createdBy: 'staff-seoyeon' });
    expect(s.knowledgeOrder).toContain(PHOTO);
    const draft = item(page, PHOTO);
    await expect(draft).toHaveAttribute('data-state', 'draft');
    await expect(draft).toContainText('Recovery lounge');
    await expect(draft).toContainText('Added this session');
    await expect(draft.getByTestId('hint-waiting-approval')).toBeVisible();
    await expect(draft.getByTestId('btn-approve')).toHaveCount(0);
    await expect(page.getByTestId('btn-approve')).toHaveCount(0); // staff never sees Approve anywhere
    await expect(page.getByTestId('knowledge-role')).toContainText('Staff');

    // Manager signs in → Approve becomes available on the draft only.
    await playerNext(page);
    await expect.poll(() => state(page).then((st) => st.role)).toBe('manager');
    await expect(page.getByTestId('knowledge-role')).toContainText('Manager');
    await expect(draft.getByTestId('btn-approve')).toBeVisible();
    await expect(draft.getByTestId('hint-waiting-approval')).toHaveCount(0);
    // The seeded draft (treatment room) gets an Approve button too; approved items get Withdraw.
    await expect(item(page, 'ph-treatment-room').getByTestId('btn-approve')).toBeVisible();
    await expect(item(page, 'ph-reception').getByTestId('btn-withdraw')).toBeVisible();

    await playerNext(page); // approve
    s = await state(page);
    expect(s.knowledge[PHOTO]).toMatchObject({ state: 'approved', approvedBy: 'manager-jihoon', approvedAt: '2026-09-15T10:24:00' });
    const approvedPhotos = s.knowledgeOrder.map((id) => s.knowledge[id]).filter((k) => k.kind === 'photo' && k.state === 'approved');
    expect(approvedPhotos.map((k) => k.id)).toEqual(['ph-reception', 'ph-consultation-room', 'ph-entrance', PHOTO]);
    expect(s.notifications.find((n) => n.id === 'ntf-recovery-lounge-approved')).toMatchObject({ kind: 'knowledge_approval', knowledgeId: PHOTO });
    await expect(draft).toHaveAttribute('data-state', 'approved');
    await expect(draft.getByTestId('btn-withdraw')).toBeVisible();
    await expect(draft).toContainText('Approved by Park Ji-hoon');

    // Assistant uses the newly approved photo with Sophie.
    await playUntilStep(page, 'send-lounge-photo');
    s = await state(page);
    expect(s.view).toBe('inbox');
    expect(s.selectedConversationId).toBe(SOPHIE);
    expect(s.messages['m-sophie-05']).toMatchObject({ kind: 'photo', photoId: PHOTO, author: 'assistant' });
    const photoMsg = page.locator('[data-message-id="m-sophie-05"]');
    await expect(photoMsg.locator('img')).toHaveAttribute('src', SRC);
    await expect.poll(() => photoMsg.locator('img').evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(photoMsg.locator('figcaption')).toHaveText('Recovery lounge');
    await expect(photoMsg.getByTestId('sources-chip')).toHaveText(/Sources · 1/);

    // Withdraw → no longer selectable, but the message history stays.
    await playToEnd(page);
    s = await state(page);
    expect(s.knowledge[PHOTO]).toMatchObject({ state: 'withdrawn', withdrawnAt: '2026-09-15T10:33:00' });
    expect(s.view).toBe('knowledge');
    expect(s.messages['m-sophie-05']).toMatchObject({ kind: 'photo', photoId: PHOTO });
    await expect(item(page, PHOTO)).toHaveAttribute('data-state', 'withdrawn');
    await expect(item(page, PHOTO).getByTestId('btn-withdraw')).toHaveCount(0);
    await expect(item(page, PHOTO).getByTestId('btn-approve')).toHaveCount(0);

    // Explore: take over Sophie and open the photo picker — the withdrawn photo is not offered.
    await page.getByTestId('mode-toggle').getByRole('tab', { name: 'Explore' }).click();
    await expect.poll(() => state(page).then((st) => st.mode)).toBe('explore');
    await page.getByTestId('nav-inbox').click();
    await row(page, SOPHIE).click();
    await expect(page.locator('[data-message-id="m-sophie-05"] img')).toHaveAttribute('src', SRC);
    await page.getByTestId('btn-take-over').click();
    await expect(page.getByTestId('composer-input')).toBeVisible();
    await page.getByTestId('btn-photo').click();
    const options = page.getByTestId('photo-option');
    await expect(options).toHaveCount(3);
    await expect(page.locator(`[data-testid="photo-option"][data-photo-id="${PHOTO}"]`)).toHaveCount(0);
    await expect(page.locator('[data-testid="photo-option"][data-photo-id="ph-treatment-room"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="photo-option"][data-photo-id="ph-lounge"]')).toHaveCount(0);
    const offered = await options.evaluateAll((els) => els.map((el) => el.getAttribute('data-photo-id')));
    expect(offered).toEqual(['ph-reception', 'ph-consultation-room', 'ph-entrance']);
    await page.keyboard.press('Escape');

    // Sending a withdrawn photo by id is rejected by the reducer; an approved one goes through.
    const before = (await state(page)).messageOrder[SOPHIE].length;
    await dispatch(page, { type: 'SEND_STAFF_MESSAGE', conversationId: SOPHIE, text: 'Here is the lounge', photoId: PHOTO });
    await page.waitForTimeout(50);
    expect((await state(page)).messageOrder[SOPHIE].length).toBe(before);
    await page.getByTestId('btn-photo').click();
    await page.locator('[data-testid="photo-option"][data-photo-id="ph-entrance"]').click();
    const sent = page.locator('[data-testid="message"][data-author="staff"][data-message-kind="photo"]').last();
    await expect(sent.locator('img')).toHaveAttribute('src', '/photos/entrance.svg');
    await expect(sent.getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');
    // The earlier assistant photo is still rendered.
    await expect(page.locator('[data-message-id="m-sophie-05"] img')).toHaveAttribute('src', SRC);
  });

  test('explore: staff adds drafts (bundled sample + uploaded file), manager approves via dialog, staff cannot approve', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await page.getByTestId('nav-knowledge').click();
    await expect(page.getByTestId('knowledge-view')).toBeVisible();
    await expect(page.getByTestId('knowledge-item')).toHaveCount(14);

    // Bundled sample → draft with the reserved id.
    await page.getByTestId('btn-add-knowledge').click();
    await page.getByTestId('btn-add-photo').click();
    const dialog = page.getByTestId('dialog-add-photo');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('btn-create-draft')).toBeDisabled();
    await dialog.locator(`[data-testid="sample-asset"][data-src="${SRC}"]`).click();
    await expect(dialog.getByTestId('input-title')).toHaveValue('Recovery lounge');
    await expect(dialog.getByTestId('input-usage')).not.toHaveValue('');
    await expect(dialog.getByTestId('btn-create-draft')).toBeEnabled();
    await dialog.getByTestId('btn-create-draft').click();
    await expect(dialog).toBeHidden();

    let s = await state(page);
    expect(s.knowledge[PHOTO]).toMatchObject({ state: 'draft', origin: 'session', kind: 'photo', createdBy: 'staff-seoyeon', createdAt: s.clock });
    expect(s.knowledge[PHOTO].photo?.src).toBe(SRC);
    const sample = item(page, PHOTO);
    await expect(sample).toHaveAttribute('data-state', 'draft');
    await expect(sample.getByTestId('hint-waiting-approval')).toBeVisible();
    await expect(sample.getByTestId('btn-approve')).toHaveCount(0);
    await expect(page.getByTestId('knowledge-item')).toHaveCount(15);

    // Uploaded file → draft with a blob: src whose preview decodes.
    await page.getByTestId('btn-add-knowledge').click();
    await page.getByTestId('btn-add-photo').click();
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('file-input').setInputFiles({ name: 'lobby-view.png', mimeType: 'image/png', buffer: TINY_PNG });
    await expect(dialog.getByTestId('input-title')).toHaveValue('lobby view');
    const preview = dialog.locator('.kb-preview__img img');
    await expect(preview).toHaveAttribute('src', /^blob:/);
    await expect.poll(() => preview.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await dialog.getByTestId('input-usage').fill('Send when a customer asks about the lobby.');
    await dialog.getByTestId('btn-create-draft').click();
    await expect(dialog).toBeHidden();

    s = await state(page);
    const uploaded = Object.values(s.knowledge).find((k) => k.title === 'lobby view');
    expect(uploaded).toBeDefined();
    expect(uploaded!.state).toBe('draft');
    expect(uploaded!.photo?.src).toMatch(/^blob:/);
    expect(uploaded!.photo?.provenance).toContain('Uploaded by staff');
    const uploadedItem = item(page, uploaded!.id);
    await expect(uploadedItem).toHaveAttribute('data-state', 'draft');
    await expect.poll(() => uploadedItem.locator('.kb-photo__img img').evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByTestId('knowledge-item')).toHaveCount(16);

    // Staff cannot approve, not even through the reducer.
    await dispatch(page, { type: 'APPROVE_KNOWLEDGE', knowledgeId: PHOTO, by: 'staff-seoyeon' });
    await dispatch(page, { type: 'APPROVE_KNOWLEDGE', knowledgeId: PHOTO, by: 'manager-jihoon' });
    await page.waitForTimeout(50);
    expect((await state(page)).knowledge[PHOTO].state).toBe('draft');
    await expect(page.getByTestId('btn-approve')).toHaveCount(0);

    // Manager approves through the confirmation dialog.
    await page.getByTestId('role-switch').getByRole('tab', { name: 'Manager' }).click();
    await expect.poll(() => state(page).then((st) => st.role)).toBe('manager');
    await expect(page.getByTestId('knowledge-role')).toContainText('Manager');
    await sample.getByTestId('btn-approve').click();
    const confirm = page.getByTestId('dialog-confirm-knowledge');
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText('Approve this item?');
    await expect(confirm).toContainText('Approve "Recovery lounge"');
    await confirm.getByRole('button', { name: 'Back' }).click();
    await expect(confirm).toBeHidden();
    expect((await state(page)).knowledge[PHOTO].state).toBe('draft');

    await sample.getByTestId('btn-approve').click();
    await confirm.getByTestId('btn-confirm-knowledge').click();
    await expect(confirm).toBeHidden();
    await expect(sample).toHaveAttribute('data-state', 'approved');
    await expect(sample.getByTestId('btn-withdraw')).toBeVisible();
    s = await state(page);
    expect(s.knowledge[PHOTO]).toMatchObject({ state: 'approved', approvedBy: 'manager-jihoon' });
    expect(s.notifications.some((n) => n.kind === 'knowledge_approval' && n.knowledgeId === PHOTO)).toBe(true);
    expect(s.knowledge[uploaded!.id].state).toBe('draft');

    // Back to staff: the approved item shows no action, the draft shows the waiting hint.
    await page.getByTestId('role-switch').getByRole('tab', { name: 'Staff' }).click();
    await expect.poll(() => state(page).then((st) => st.role)).toBe('staff');
    await expect(page.getByTestId('btn-approve')).toHaveCount(0);
    await expect(page.getByTestId('btn-withdraw')).toHaveCount(0);
    await expect(uploadedItem.getByTestId('hint-waiting-approval')).toBeVisible();
  });
});
