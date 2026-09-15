/**
 * Simulated CRM seed. One existing appointment (Emily Carter, MD-24811).
 * New references are assigned from `nextReferenceNumber` upward (MD-24817, MD-24818, …).
 */
import type { Appointment, CrmState } from '../domain/types.ts';

export const APPOINTMENT_EMILY: Appointment = {
  id: 'apt-emily',
  reference: 'MD-24811',
  conversationId: 'conv-wa-emily',
  customerId: 'cust-emily',
  slotId: '2026-09-18T15:00',
  status: 'confirmed',
  createdAt: '2026-09-14T10:48:00',
  history: [{ at: '2026-09-14T10:48:00', change: 'created', toSlotId: '2026-09-18T15:00' }],
};

export const CRM: CrmState = {
  connected: true,
  appointments: { [APPOINTMENT_EMILY.id]: APPOINTMENT_EMILY },
  requests: {},
  nextReferenceNumber: 24817,
};
