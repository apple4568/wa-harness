import { test, expect } from '@playwright/test';
import { gotoDemo, openBookingPanel, playToEnd, playUntilStep, playerNext, row, state } from '../helpers/demo';

const CID = 'conv-ig-misaki';
const SLOT = '2026-09-17T14:00';

test.describe('scenario 1 · Instagram inquiry → confirmed booking', () => {
  test('explicit confirmation → CRM submit → success → confirmation delivered', async ({ page }) => {
    await gotoDemo(page, { scenario: 'inquiry-to-booking' });
    expect((await state(page)).guided.status).toBe('paused');

    await playUntilStep(page, 'confirms');
    let s = await state(page);
    expect(s.guided.status).toBe('paused');
    expect(s.conversations[CID].booking.stage).toBe('customer_confirmed');
    expect(s.conversations[CID].booking.selectedSlotId).toBe(SLOT);
    expect(Object.keys(s.crm.requests)).toEqual([]);
    expect(Object.keys(s.crm.appointments)).toEqual(['apt-emily']);
    expect(s.slots[SLOT].available).toBe(true);

    await openBookingPanel(page);
    const panel = page.getByTestId('booking-panel');
    await expect(panel.getByTestId('booking-stage')).toHaveAttribute('data-stage', 'customer_confirmed');
    await expect(panel.locator('[data-testid="booking-step"][data-step="customer_confirmed"]')).toHaveAttribute('data-state', 'current');
    await expect(panel.locator('[data-testid="booking-step"][data-step="slots_offered"]')).toHaveAttribute('data-state', 'done');
    await expect(panel.locator('[data-testid="booking-step"][data-step="submitting"]')).toHaveAttribute('data-state', 'todo');
    await expect(panel).toContainText('No appointment yet');
    await expect(panel.getByTestId('appointment')).toHaveCount(0);
    await expect(panel.getByTestId('crm-state')).toHaveText(/No request in flight/);
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Not sent');

    // Submit → pending request (scripted; never auto-resolved).
    await playerNext(page);
    s = await state(page);
    expect(s.conversations[CID].booking.stage).toBe('submitting');
    expect(s.crm.requests['req-misaki-1']).toMatchObject({ status: 'pending', resolution: 'scripted', slotId: SLOT, intent: 'book' });
    await expect(panel.getByTestId('booking-stage')).toHaveAttribute('data-stage', 'submitting');
    await expect(panel.getByTestId('crm-state')).toHaveText(/Waiting for CRM/);
    await expect(panel.getByTestId('btn-submit-booking')).toBeDisabled();

    // CRM success → MD-24817, slot taken, still nothing sent to the customer.
    await playerNext(page);
    s = await state(page);
    expect(s.guided.status).toBe('paused');
    expect(s.conversations[CID].booking.stage).toBe('crm_success');
    const apt = s.crm.appointments['apt-req-misaki-1'];
    expect(apt).toMatchObject({ reference: 'MD-24817', slotId: SLOT, status: 'confirmed', conversationId: CID });
    expect(s.crm.nextReferenceNumber).toBe(24818);
    expect(s.slots[SLOT].available).toBe(false);
    expect(s.conversations[CID].booking.confirmationDelivery).toBeUndefined();
    await expect(panel.getByTestId('appointment')).toHaveAttribute('data-reference', 'MD-24817');
    await expect(panel.getByTestId('crm-state')).toHaveText(/Success · MD-24817/);
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Not sent');
    await expect(page.locator('[data-testid="message"][data-message-kind="booking_card"]')).toHaveCount(0);

    // Compose → send → delivered.
    await playToEnd(page);
    s = await state(page);
    expect(s.guided.status).toBe('complete');
    expect(s.conversations[CID].booking.stage).toBe('confirmation_sent');
    expect(s.conversations[CID].booking.confirmationDelivery).toBe('delivered');
    const order = s.messageOrder[CID];
    const last = s.messages[order[order.length - 1]];
    expect(last).toMatchObject({ id: 'm-misaki-09', kind: 'booking_card', delivery: 'delivered', appointmentId: 'apt-req-misaki-1' });
    expect(Object.values(s.crm.appointments).filter((a) => a.conversationId === CID)).toHaveLength(1);

    const card = page.locator('[data-message-id="m-misaki-09"]');
    await expect(card.getByTestId('booking-card')).toHaveAttribute('data-reference', 'MD-24817');
    await expect(card.getByTestId('booking-card')).toContainText('Thu 17 Sep · 14:00');
    await expect(card.getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');

    // CRM line and confirmation line are distinct states.
    await expect(panel.getByTestId('crm-state')).toHaveText(/Success · MD-24817/);
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Delivered');
    await expect(panel.locator('[data-testid="booking-step"][data-step="confirmation_sent"]')).toHaveAttribute('data-state', 'done');
    await expect(page.getByTestId('step-label')).toContainText('Complete');
  });

  test('the bubble holds only what was sent; the slot chips are staff-side', async ({ page }) => {
    await gotoDemo(page, { scenario: 'inquiry-to-booking' });
    await playUntilStep(page, 'offer-slots');

    const slotMsg = page.locator('[data-message-id="m-misaki-05"]');
    await expect(slotMsg).toBeVisible();

    // The customer received numbered plain text — that is the entire message.
    const bubble = slotMsg.locator('.msg__bubble');
    await expect(bubble).toContainText('① 9月17日(木) 14:00');
    // ...and nothing else. No English date chips inside the bubble.
    await expect(bubble.locator('[data-testid="offered-slot"]')).toHaveCount(0);
    await expect(bubble).not.toContainText('Thu 17 Sep');

    // The chips exist, outside the bubble, as the staff-side view.
    const aside = slotMsg.getByTestId('slot-offer');
    await expect(aside).toBeVisible();
    await expect(aside.locator('[data-testid="offered-slot"]')).toHaveCount(3);
    await expect(aside).toContainText('Thu 17 Sep');

    // Selecting is reflected there, which is why the chips earn their place.
    await playUntilStep(page, 'picks-slot');
    await expect(aside.locator('[data-selected="true"]')).toHaveCount(1);
    await expect(aside.locator('[data-slot-id="2026-09-17T14:00"]')).toHaveAttribute('data-selected', 'true');
  });

  test('the customer arrives as a handle and is identified only when she gives her name', async ({ page }) => {
    await gotoDemo(page, { scenario: 'inquiry-to-booking' });
    await playUntilStep(page, 'inquiry-arrives');

    // Instagram hands us a handle, not a person.
    let s = await state(page);
    expect(s.customers['cust-misaki'].name).toBeUndefined();
    await expect(row(page, CID)).toContainText('@misaki.sato');

    await playUntilStep(page, 'picks-slot');
    await expect(page.getByTestId('workspace')).toHaveAttribute('data-conversation-id', CID);
    await expect(page.getByTestId('unidentified')).toBeVisible();

    // She gives it so the booking can be made.
    await playUntilStep(page, 'confirms');
    s = await state(page);
    expect(s.customers['cust-misaki'].name).toBe('佐藤 美咲');
    await expect(page.getByTestId('unidentified')).toHaveCount(0);
    await expect(page.getByTestId('thread-header')).toContainText('佐藤 美咲');
    await expect(row(page, CID)).toContainText('佐藤 美咲');

    // ...and the booking is made in that name.
    await openBookingPanel(page);
    await expect(page.getByTestId('booking-panel')).toContainText('佐藤 美咲');
  });

  test('sources chip lists 3 approved items; the reception photo is the approved asset', async ({ page }) => {
    await gotoDemo(page, { scenario: 'inquiry-to-booking' });
    await playUntilStep(page, 'send-reception-photo');
    await expect(page.getByTestId('workspace')).toHaveAttribute('data-conversation-id', CID);

    const reply = page.locator('[data-message-id="m-misaki-02"]');
    await expect(reply).toHaveAttribute('data-author', 'assistant');
    const chip = reply.getByTestId('sources-chip');
    await expect(chip).toHaveText(/Sources · 3/);
    await chip.click();
    const popover = page.locator('.popover', { hasText: 'Approved sources used' });
    await expect(popover).toBeVisible();
    await expect(popover.locator('.source-item')).toHaveCount(3);
    await expect(popover).toContainText('Opening hours & location');
    await expect(popover).toContainText('Languages we support');
    await expect(popover).toContainText('How a first consultation works');
    await expect(popover.locator('.source-item__meta').first()).toContainText('Approved by Park Ji-hoon');
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();

    const photo = page.locator('[data-message-id="m-misaki-03"]');
    await expect(photo).toHaveAttribute('data-message-kind', 'photo');
    const img = photo.locator('img');
    await expect(img).toHaveAttribute('src', '/photos/reception.svg');
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(photo.locator('figcaption')).toHaveText('Reception & waiting area');
  });

  test('restart resets the scenario state: Misaki gone, one appointment, counter back to 24817', async ({ page }) => {
    await gotoDemo(page, { scenario: 'inquiry-to-booking' });
    await playToEnd(page);
    let s = await state(page);
    expect(s.crm.nextReferenceNumber).toBe(24818);
    expect(Object.keys(s.crm.appointments)).toHaveLength(2);
    await expect(row(page, CID)).toBeVisible();

    await page.getByTestId('btn-restart').click();
    await expect.poll(() => state(page).then((st) => st.guided.stepIndex)).toBe(0);
    s = await state(page);
    expect(s.guided).toMatchObject({ scenarioId: 'inquiry-to-booking', stepIndex: 0, status: 'paused' });
    expect(s.conversations[CID]).toBeUndefined();
    expect(s.messages['m-misaki-01']).toBeUndefined();
    expect(Object.keys(s.crm.appointments)).toEqual(['apt-emily']);
    expect(s.crm.nextReferenceNumber).toBe(24817);
    expect(s.slots[SLOT].available).toBe(true);
    expect(s.selectedConversationId).toBeNull();
    await expect(row(page, CID)).toHaveCount(0);
    await expect(page.getByTestId('conversation-row')).toHaveCount(8);
    await expect(page.getByTestId('step-label')).toContainText('Step 1 of');
  });
});
