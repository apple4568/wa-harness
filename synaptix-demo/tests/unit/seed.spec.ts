import { test, expect } from '@playwright/test';
import { createInitialState } from '@/data/seed';
import { validateSeed } from '@/data/validate';
import { selectAppointmentForConversation, selectClinicOpen } from '@/state/selectors';

test.describe('seed', () => {
  test('validateSeed(createInitialState()) reports no problems', () => {
    expect(validateSeed(createInitialState())).toEqual([]);
  });

  test('two calls return structurally equal but non-identical objects', () => {
    const a = createInitialState();
    const b = createInitialState();
    expect(a).not.toBe(b);
    expect(a.conversations).not.toBe(b.conversations);
    expect(a.messages).not.toBe(b.messages);
    expect(a.crm.appointments).not.toBe(b.crm.appointments);
    expect(a).toEqual(b);
  });

  test('fixed demo facts from the brief', () => {
    const s = createInitialState();
    expect(s.clock).toBe('2026-09-15T10:20:00');
    expect(selectClinicOpen(s)).toBe(true);
    expect(s.crm.nextReferenceNumber).toBe(24817);
    expect(s.settings.workingHours.holidays.map((h) => h.date)).toEqual(
      expect.arrayContaining(['2026-09-24', '2026-09-25', '2026-09-26', '2026-10-03', '2026-10-09']),
    );

    for (const id of [
      'conv-line-chiaying',
      'conv-wechat-wei',
      'conv-wa-emily',
      'conv-ig-hina',
      'conv-line-ken',
      'conv-wa-sophie',
      'conv-wechat-meiling',
      'conv-wa-daniel',
    ]) {
      expect(s.conversations[id], id).toBeDefined();
      expect(s.messageOrder[id], `messageOrder ${id}`).toBeDefined();
    }
    expect(s.conversations['conv-ig-misaki']).toBeUndefined();

    const emily = selectAppointmentForConversation(s, 'conv-wa-emily');
    expect(emily?.reference).toBe('MD-24811');
    expect(emily?.slotId).toBe('2026-09-18T15:00');
    expect(s.slots['2026-09-18T15:00']?.available).toBe(false);

    const hina = s.conversations['conv-ig-hina'];
    expect(hina.booking.stage).toBe('customer_confirmed');
    expect(hina.booking.selectedSlotId).toBe('2026-09-21T14:00');
    expect(hina.crmBehavior).toBe('timeout');

    expect(s.conversations['conv-wechat-meiling'].ownership).toBe('human');
    expect(s.conversations['conv-wa-daniel'].ownership).toBe('needs_human');

    expect(s.knowledge['kb-medication-questions']?.state).toBe('draft');
    expect(s.knowledge['ph-treatment-room']?.state).toBe('draft');
    expect(s.knowledge['ph-lounge']?.state).toBe('withdrawn');
    expect(s.knowledge['ph-reception']?.state).toBe('approved');

    for (const slotId of ['2026-09-17T14:00', '2026-09-18T11:00', '2026-09-19T11:00', '2026-09-21T16:00']) {
      expect(s.slots[slotId]?.available, slotId).toBe(true);
    }
  });
});
