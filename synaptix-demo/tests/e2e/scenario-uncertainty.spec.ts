import { test, expect } from '@playwright/test';
import { dispatch, gotoDemo, playToEnd, playUntilStep, state } from '../helpers/demo';

const CID = 'conv-ig-hina';
const REQ = 'req-hina-1';

const hinaAppointments = async (page: Parameters<typeof state>[0]) => Object.values((await state(page)).crm.appointments).filter((a) => a.conversationId === CID);

test.describe('scenario 6 · booking uncertainty (CRM timeout)', () => {
  test('timeout → needs review (no success claimed) → reconcile once → one appointment → confirmation only then', async ({ page }) => {
    await gotoDemo(page, { scenario: 'booking-uncertainty' });
    let s = await state(page);
    expect(s.conversations[CID].booking.stage).toBe('customer_confirmed');
    expect(s.conversations[CID].crmBehavior).toBe('timeout');
    expect(s.bookingPanelOpen).toBe(true);
    const panel = page.getByTestId('booking-panel');

    await playUntilStep(page, 'submit');
    await expect(panel.getByTestId('crm-state')).toHaveText(/Waiting for CRM/);

    await playUntilStep(page, 'timeout');
    s = await state(page);
    expect(s.guided.status).toBe('paused');
    expect(s.conversations[CID].booking.stage).toBe('needs_review');
    expect(s.crm.requests[REQ].status).toBe('timeout');
    expect(await hinaAppointments(page)).toHaveLength(0);
    expect(s.conversations[CID].booking.confirmationMessageId).toBeUndefined();
    expect(s.notifications.find((n) => n.id === 'ntf-hina-review')).toMatchObject({ kind: 'booking_review', read: false, conversationId: CID });
    expect(s.messages['m-hina-06'].text).toContain('needs review');

    await expect(panel.getByTestId('booking-review')).toBeVisible();
    await expect(panel.getByTestId('booking-review')).toContainText(/needs review/i);
    await expect(panel.locator('[data-testid="booking-step"][data-step="needs_review"]')).toHaveAttribute('data-state', 'current');
    await expect(panel.locator('[data-testid="booking-step"][data-step="crm_success"]')).toHaveAttribute('data-state', 'todo');
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Not sent');
    await expect(panel.getByTestId('appointment')).toHaveCount(0);
    await expect(page.getByTestId('btn-booking-panel')).toContainText('Review');
    await expect(page.locator('[data-testid="message"][data-message-kind="booking_card"]')).toHaveCount(0);

    // The CRM line must not read as a success: no "Success", no bare "confirmed".
    const crmText = (await panel.getByTestId('crm-state').innerText()).trim();
    expect(crmText).toMatch(/Timed out/);
    expect(crmText).not.toMatch(/\bSuccess\b/);
    expect(crmText.replace(/not confirmed/i, '')).not.toMatch(/\bconfirmed\b/i);

    // Reconcile via the UI, then dispatch it again (and again) — still exactly one appointment.
    await panel.getByTestId('btn-reconcile').click();
    await expect.poll(() => state(page).then((st) => st.conversations[CID].booking.stage)).toBe('crm_success');
    await dispatch(page, { type: 'RECONCILE_BOOKING', requestId: REQ, outcome: 'was_created' });
    await dispatch(page, { type: 'RECONCILE_BOOKING', requestId: REQ, outcome: 'was_created' });
    await dispatch(page, { type: 'CRM_RESULT', requestId: REQ, result: 'success' });
    await page.waitForTimeout(50);
    s = await state(page);
    expect(s.crm.requests[REQ]).toMatchObject({ status: 'reconciled', reconciledOutcome: 'was_created', resultAppointmentId: `apt-${REQ}` });
    let apts = await hinaAppointments(page);
    expect(apts).toHaveLength(1);
    expect(apts[0]).toMatchObject({ reference: 'MD-24817', slotId: '2026-09-21T14:00', status: 'confirmed' });
    expect(s.crm.nextReferenceNumber).toBe(24818);
    expect(s.slots['2026-09-21T14:00'].available).toBe(false);
    await expect(panel.getByTestId('btn-reconcile')).toHaveCount(0);
    await expect(panel.getByTestId('crm-state')).toHaveText(/Reconciled · booking existed \(MD-24817\)/);
    await expect(panel.getByTestId('booking-review')).toHaveCount(0);
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Not sent');

    // The scripted reconcile step is a no-op on the request; the confirmation is sent only now.
    await playToEnd(page);
    s = await state(page);
    apts = await hinaAppointments(page);
    expect(apts).toHaveLength(1);
    expect(s.conversations[CID].booking).toMatchObject({ stage: 'confirmation_sent', confirmationDelivery: 'delivered', appointmentId: `apt-${REQ}` });
    const order = s.messageOrder[CID];
    expect(s.messages[order[order.length - 1]]).toMatchObject({ id: 'm-hina-08', kind: 'booking_card', delivery: 'delivered' });
    expect(s.notifications.find((n) => n.id === 'ntf-hina-review')?.read).toBe(true);
    await expect(page.locator('[data-message-id="m-hina-08"]').getByTestId('booking-card')).toHaveAttribute('data-reference', 'MD-24817');
    await expect(panel.getByTestId('confirmation-state')).toHaveText('Delivered');
  });

  test('reconciled as "not created" → back to customer confirmed, retry creates a single appointment', async ({ page }) => {
    await gotoDemo(page, { scenario: 'booking-uncertainty' });
    await playUntilStep(page, 'timeout');
    await dispatch(page, { type: 'RECONCILE_BOOKING', requestId: REQ, outcome: 'not_created' });
    await expect.poll(() => state(page).then((s) => s.conversations[CID].booking.stage)).toBe('customer_confirmed');
    expect(await hinaAppointments(page)).toHaveLength(0);
    const panel = page.getByTestId('booking-panel');
    // The reducer keeps `booking.requestId` on a not-created reconciliation so the panel can show
    // the outcome and offer a retry. It must never read as a success.
    await expect(panel.getByTestId('crm-state')).toHaveText(/Reconciled · not created/);
    await expect(panel.getByTestId('crm-state')).not.toHaveText(/Success|confirmed/);
    await expect(panel.getByTestId('btn-submit-booking')).toBeEnabled();
    await expect(panel.getByTestId('btn-submit-booking')).toHaveText(/Retry with new request/);

    // Retry through the UI; Hina's CRM behaviour is "timeout", so flip it to success first.
    const hina = (await state(page)).conversations[CID];
    await dispatch(page, { type: 'UPSERT_CONVERSATION', conversation: { ...hina, crmBehavior: 'success' } });
    await expect(panel.getByTestId('btn-submit-booking')).toHaveText(/Submit booking|Retry/);
    await panel.getByTestId('btn-submit-booking').click();
    await expect.poll(() => state(page).then((s) => s.conversations[CID].booking.stage)).toBe('crm_success');
    const apts = await hinaAppointments(page);
    expect(apts).toHaveLength(1);
    expect(apts[0].reference).toBe('MD-24817');
    expect(Object.values((await state(page)).crm.requests).filter((r) => r.conversationId === CID)).toHaveLength(2);
  });
});
