import { test, expect } from '@playwright/test';
import { dispatch, gotoDemo, openBookingPanel, playToEnd, row, state } from '../helpers/demo';

const CID = 'conv-wa-emily';
const APT = 'apt-emily';
const OLD_SLOT = '2026-09-18T15:00';
const NEW_SLOT = '2026-09-21T16:00';

test.describe('scenario 4 · reschedule / cancel', () => {
  test('rescheduling mutates the same appointment: MD-24811 moves to Mon 21 Sep 16:00', async ({ page }) => {
    await gotoDemo(page, { scenario: 'reschedule-cancel' });
    let s = await state(page);
    expect(Object.keys(s.crm.appointments)).toEqual([APT]);
    expect(s.crm.appointments[APT]).toMatchObject({ reference: 'MD-24811', slotId: OLD_SLOT, status: 'confirmed' });
    expect(s.slots[OLD_SLOT].available).toBe(false);
    expect(s.slots[NEW_SLOT].available).toBe(true);
    expect(s.bookingPanelOpen).toBe(true);
    expect(s.selectedConversationId).toBe(CID);
    const panel = page.getByTestId('booking-panel');
    await expect(panel.getByTestId('appointment')).toHaveAttribute('data-reference', 'MD-24811');
    await expect(panel.getByTestId('appointment')).toContainText('Fri 18 Sep · 15:00');

    await playToEnd(page);
    s = await state(page);
    expect(Object.keys(s.crm.appointments)).toEqual([APT]);
    const apt = s.crm.appointments[APT];
    expect(apt.reference).toBe('MD-24811');
    expect(apt.slotId).toBe(NEW_SLOT);
    expect(apt.status).toBe('rescheduled');
    expect(apt.history.map((h) => h.change)).toEqual(['created', 'rescheduled']);
    expect(apt.history[1]).toMatchObject({ fromSlotId: OLD_SLOT, toSlotId: NEW_SLOT });
    expect(s.slots[OLD_SLOT].available).toBe(true);
    expect(s.slots[NEW_SLOT].available).toBe(false);
    expect(s.crm.nextReferenceNumber).toBe(24817);
    expect(s.crm.requests['req-emily-resched-1']).toMatchObject({ status: 'success', intent: 'reschedule', appointmentId: APT, resultAppointmentId: APT });
    expect(s.conversations[CID].booking).toMatchObject({ stage: 'confirmation_sent', intent: 'reschedule', appointmentId: APT, confirmationDelivery: 'delivered' });
    const order = s.messageOrder[CID];
    expect(s.messages[order[order.length - 1]]).toMatchObject({ id: 'm-emily-13', kind: 'booking_card', delivery: 'delivered', appointmentId: APT });

    const card = page.locator('[data-message-id="m-emily-13"]');
    await expect(card.getByTestId('booking-card')).toHaveAttribute('data-reference', 'MD-24811');
    await expect(card.getByTestId('booking-card')).toContainText('Mon 21 Sep · 16:00');
    await expect(card.getByTestId('booking-card')).toContainText('Rescheduled');
    await expect(card.getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');
    await expect(panel.getByTestId('appointment')).toContainText('Mon 21 Sep · 16:00');
    await expect(panel.getByTestId('appointment')).toContainText('rescheduled');
    await expect(panel.locator('.appt__history li')).toHaveCount(2);
    await expect(panel.getByTestId('crm-state')).toHaveText(/Success · MD-24811/);
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Delivered');
  });

  test('explore mode: cancel dialog can be dismissed, confirming cancels MD-24811 and sends a card', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await row(page, CID).click();
    await openBookingPanel(page);
    const panel = page.getByTestId('booking-panel');
    await expect(panel.getByTestId('appointment')).toHaveAttribute('data-reference', 'MD-24811');

    await panel.getByTestId('btn-cancel-appointment').click();
    const dialog = page.getByTestId('dialog-confirm');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Cancel this appointment?');
    await expect(dialog).toContainText('MD-24811');
    await expect(dialog).toContainText('Fri 18 Sep · 15:00');

    await dialog.getByRole('button', { name: 'Keep appointment' }).click();
    await expect(dialog).toBeHidden();
    let s = await state(page);
    expect(s.crm.appointments[APT].status).toBe('confirmed');
    expect(Object.keys(s.crm.requests)).toEqual([]);
    expect(s.conversations[CID].booking.stage).toBe('confirmation_sent');
    expect(s.conversations[CID].booking.intent).toBe('book');

    await panel.getByTestId('btn-cancel-appointment').click();
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('dialog-confirm-accept').click();
    await expect(dialog).toBeHidden();

    // The simulated CRM resolves the auto request; the appointment is cancelled, slot released.
    await expect.poll(() => state(page).then((st) => st.crm.appointments[APT].status)).toBe('cancelled');
    s = await state(page);
    expect(Object.keys(s.crm.appointments)).toEqual([APT]);
    expect(s.slots[OLD_SLOT].available).toBe(true);
    const requests = Object.values(s.crm.requests).filter((r) => r.conversationId === CID);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ intent: 'cancel', status: 'success', appointmentId: APT, resolution: 'auto' });
    expect(s.conversations[CID].booking).toMatchObject({ stage: 'crm_success', intent: 'cancel' });
    await expect(panel.getByTestId('appointment')).toContainText('cancelled');
    await expect(panel.getByTestId('crm-state')).toHaveText(/Success · MD-24811/);
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Not sent');

    await panel.getByTestId('btn-send-confirmation').click();
    const card = page.locator('[data-testid="message"][data-message-kind="booking_card"]').last();
    await expect(card).toContainText('has been cancelled');
    await expect(card.getByTestId('booking-card')).toContainText('Cancelled');
    await expect(card.getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');
    await expect.poll(() => state(page).then((st) => st.conversations[CID].booking.stage)).toBe('confirmation_sent');
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Delivered');
    expect(Object.keys((await state(page)).crm.appointments)).toEqual([APT]);
  });

  test('a second submit while a request is pending is ignored (UI double click and double dispatch)', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    const CHIAYING = 'conv-line-chiaying';
    await row(page, CHIAYING).click();
    await openBookingPanel(page);
    const panel = page.getByTestId('booking-panel');

    await panel.getByTestId('btn-offer-slots').click();
    await expect(panel.getByTestId('slot-option')).toHaveCount(3);
    await panel.getByTestId('slot-option').first().click();
    await expect(panel.getByTestId('slot-option').first()).toHaveAttribute('aria-pressed', 'true');
    await panel.getByTestId('btn-mark-confirmed').click();
    await page.getByTestId('dialog-confirm-accept').click();
    await expect(panel.getByTestId('booking-stage')).toHaveAttribute('data-stage', 'customer_confirmed');

    await panel.getByTestId('btn-submit-booking').dblclick();
    await expect.poll(() => state(page).then((s) => s.conversations[CHIAYING].booking.stage)).toBe('crm_success');
    let s = await state(page);
    expect(Object.values(s.crm.requests).filter((r) => r.conversationId === CHIAYING)).toHaveLength(1);
    expect(Object.values(s.crm.appointments).filter((a) => a.conversationId === CHIAYING)).toHaveLength(1);
    expect(s.crm.nextReferenceNumber).toBe(24818);

    // Reducer-level: two different request ids in the same tick while the first is still pending.
    const WEI = 'conv-wechat-wei';
    await dispatch(page, { type: 'OFFER_SLOTS', conversationId: WEI, slotIds: ['2026-09-22T11:00', '2026-09-22T14:00'], intent: 'book' });
    await dispatch(page, { type: 'SELECT_SLOT', conversationId: WEI, slotId: '2026-09-22T11:00' });
    await dispatch(page, { type: 'CUSTOMER_CONFIRMED', conversationId: WEI });
    await expect.poll(() => state(page).then((st) => st.conversations[WEI].booking.stage)).toBe('customer_confirmed');
    await page.evaluate((cid) => {
      window.__synaptix!.dispatch({ type: 'SUBMIT_BOOKING', conversationId: cid, requestId: 'req-wei-a' });
      window.__synaptix!.dispatch({ type: 'SUBMIT_BOOKING', conversationId: cid, requestId: 'req-wei-b' });
      window.__synaptix!.dispatch({ type: 'SUBMIT_BOOKING', conversationId: cid, requestId: 'req-wei-a' });
    }, WEI);
    await expect.poll(() => state(page).then((st) => st.conversations[WEI].booking.stage)).toBe('crm_success');
    s = await state(page);
    expect(Object.values(s.crm.requests).filter((r) => r.conversationId === WEI).map((r) => r.id)).toEqual(['req-wei-a']);
    expect(s.crm.requests['req-wei-b']).toBeUndefined();
    expect(Object.values(s.crm.appointments).filter((a) => a.conversationId === WEI)).toHaveLength(1);
    expect(s.crm.nextReferenceNumber).toBe(24819);
  });
});
