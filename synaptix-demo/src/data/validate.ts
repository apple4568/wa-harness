/**
 * Referential-integrity checks for a DemoState (seed or mid-scenario). Returns a list of
 * human-readable problems; an empty array means the state is consistent. Not called by
 * the seed itself — unit tests and the scenario validator use it.
 */
import type { DemoState } from '../domain/types.ts';

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

export function validateSeed(state: DemoState): string[] {
  const problems: string[] = [];
  const push = (p: string) => problems.push(p);

  const approvedKnowledge = (id: string) => {
    const item = state.knowledge[id];
    if (!item) return `unknown knowledge "${id}"`;
    if (item.state !== 'approved') return `knowledge "${id}" is ${item.state}, not approved`;
    return null;
  };

  if (!ISO_RE.test(state.clock)) push(`clock "${state.clock}" is not a local ISO timestamp`);

  /* --- conversations --- */
  for (const conv of Object.values(state.conversations)) {
    const where = `conversation ${conv.id}`;
    if (!state.customers[conv.customerId]) push(`${where}: unknown customer "${conv.customerId}"`);
    if (conv.account !== state.settings.channels[conv.channel].account)
      push(`${where}: account label does not match settings for ${conv.channel}`);
    if (conv.ownership === 'needs_human' && !conv.handover) push(`${where}: needs_human without a handover summary`);
    if (conv.ownership !== 'ai' && conv.assistant.kind !== 'idle')
      push(`${where}: assistant is ${conv.assistant.kind} while ownership is ${conv.ownership}`);
    if (conv.assistant.kind === 'retrieving') {
      for (const id of conv.assistant.sourceIds) {
        const err = approvedKnowledge(id);
        if (err) push(`${where}: retrieving ${err}`);
      }
    }
    if (conv.assistant.kind === 'composing' && !conv.assistant.draftMessageId)
      push(`${where}: composing without draftMessageId`);

    const order = state.messageOrder[conv.id];
    if (!order) {
      push(`${where}: no messageOrder entry`);
    } else {
      let prevAt = '';
      for (const mid of order) {
        const m = state.messages[mid];
        if (!m) {
          push(`${where}: messageOrder references unknown message "${mid}"`);
          continue;
        }
        if (m.conversationId !== conv.id) push(`${where}: message ${mid} belongs to ${m.conversationId}`);
        if (m.at < prevAt) push(`${where}: message ${mid} is out of chronological order`);
        prevAt = m.at;
      }
      const last = order.length ? state.messages[order[order.length - 1]!] : undefined;
      if (last && conv.lastActivityAt < last.at)
        push(`${where}: lastActivityAt (${conv.lastActivityAt}) is before the last message (${last.at})`);
    }

    const b = conv.booking;
    for (const sid of b.offeredSlotIds) if (!state.slots[sid]) push(`${where}: offered slot "${sid}" does not exist`);
    if (b.selectedSlotId) {
      if (!state.slots[b.selectedSlotId]) push(`${where}: selected slot "${b.selectedSlotId}" does not exist`);
      else if (!b.offeredSlotIds.includes(b.selectedSlotId))
        push(`${where}: selected slot "${b.selectedSlotId}" was not among the offered slots`);
    }
    if (b.appointmentId && !state.crm.appointments[b.appointmentId])
      push(`${where}: booking.appointmentId "${b.appointmentId}" does not exist in the CRM`);
    if (b.confirmationMessageId && !state.messages[b.confirmationMessageId])
      push(`${where}: confirmationMessageId "${b.confirmationMessageId}" does not exist`);
    if (b.stage === 'customer_confirmed' && !b.selectedSlotId && b.intent !== 'cancel')
      push(`${where}: customer_confirmed without a selected slot`);
    if (b.stage === 'slots_offered' && b.offeredSlotIds.length === 0) push(`${where}: slots_offered with no slots`);
    if (b.requestId && !state.crm.requests[b.requestId])
      push(`${where}: booking.requestId "${b.requestId}" has no CRM request record`);
  }

  /* --- messages --- */
  for (const m of Object.values(state.messages)) {
    const where = `message ${m.id}`;
    if (!state.conversations[m.conversationId]) push(`${where}: unknown conversation "${m.conversationId}"`);
    else if (!state.messageOrder[m.conversationId]?.includes(m.id)) push(`${where}: missing from messageOrder`);
    if (!ISO_RE.test(m.at)) push(`${where}: "at" is not a local ISO timestamp`);
    if (m.kind === 'photo') {
      if (!m.photoId) push(`${where}: photo message without photoId`);
      else {
        const err = approvedKnowledge(m.photoId);
        if (err) push(`${where}: photoId ${err}`);
        else if (state.knowledge[m.photoId]!.kind !== 'photo') push(`${where}: photoId "${m.photoId}" is not a photo`);
      }
    }
    if (m.kind === 'customer_attachment' && !m.attachmentSrc) push(`${where}: customer_attachment without attachmentSrc`);
    if (m.kind === 'slot_offer') {
      if (!m.slotIds?.length) push(`${where}: slot_offer without slotIds`);
      for (const sid of m.slotIds ?? []) if (!state.slots[sid]) push(`${where}: slot "${sid}" does not exist`);
    }
    if (m.kind === 'booking_card') {
      if (!m.appointmentId) push(`${where}: booking_card without appointmentId`);
      else if (!state.crm.appointments[m.appointmentId])
        push(`${where}: appointmentId "${m.appointmentId}" does not exist in the CRM`);
    }
    for (const sid of m.sourceIds ?? []) {
      const err = approvedKnowledge(sid);
      if (err) push(`${where}: sourceIds ${err}`);
    }
    if (m.author === 'assistant' && m.kind !== 'system' && m.sourceIds === undefined)
      push(`${where}: assistant message without sourceIds (use [] when nothing was retrieved)`);
    if ((m.author === 'customer' || m.author === 'assistant') && m.kind !== 'customer_attachment' && !m.text)
      push(`${where}: ${m.author} message without text`);
    if (m.author === 'system' && m.translationKo) push(`${where}: system line should not carry a translation`);
  }

  /* --- CRM --- */
  for (const apt of Object.values(state.crm.appointments)) {
    const where = `appointment ${apt.id}`;
    if (!state.slots[apt.slotId]) push(`${where}: slot "${apt.slotId}" does not exist`);
    if (!state.conversations[apt.conversationId]) push(`${where}: unknown conversation "${apt.conversationId}"`);
    if (!state.customers[apt.customerId]) push(`${where}: unknown customer "${apt.customerId}"`);
    if (!/^MD-\d{5}$/.test(apt.reference)) push(`${where}: reference "${apt.reference}" is not MD-#####`);
    if (apt.status !== 'cancelled' && state.slots[apt.slotId]?.available)
      push(`${where}: slot "${apt.slotId}" is still marked available`);
    if (apt.history.length === 0) push(`${where}: empty history`);
  }
  for (const req of Object.values(state.crm.requests)) {
    const where = `crm request ${req.id}`;
    if (!state.conversations[req.conversationId]) push(`${where}: unknown conversation "${req.conversationId}"`);
    if (req.slotId && !state.slots[req.slotId]) push(`${where}: slot "${req.slotId}" does not exist`);
    if (req.appointmentId && !state.crm.appointments[req.appointmentId])
      push(`${where}: appointmentId "${req.appointmentId}" does not exist`);
  }
  const usedRefs = Object.values(state.crm.appointments).map((a) => Number(a.reference.slice(3)));
  for (const n of usedRefs)
    if (n >= state.crm.nextReferenceNumber)
      push(`crm: reference MD-${n} is not below nextReferenceNumber ${state.crm.nextReferenceNumber}`);

  /* --- knowledge --- */
  for (const k of Object.values(state.knowledge)) {
    const where = `knowledge ${k.id}`;
    if (!state.knowledgeOrder.includes(k.id)) push(`${where}: missing from knowledgeOrder`);
    if (k.kind === 'text' && !k.body) push(`${where}: text item without body`);
    if (k.kind === 'text' && k.body && (!k.body.en || !k.body.ko)) push(`${where}: body needs at least en + ko`);
    if (k.kind === 'photo') {
      if (!k.photo) push(`${where}: photo item without photo`);
      else {
        if (!k.photo.src.startsWith('/photos/')) push(`${where}: photo.src must live under /photos/`);
        if (!k.photo.provenance) push(`${where}: photo without provenance`);
        if (!k.photo.usage) push(`${where}: photo without usage guidance`);
      }
    }
    if (k.state === 'approved' && (!k.approvedBy || !k.approvedAt)) push(`${where}: approved without approvedBy/approvedAt`);
    if (k.state === 'withdrawn' && !k.withdrawnAt) push(`${where}: withdrawn without withdrawnAt`);
    if (k.state === 'draft' && (k.approvedAt || k.withdrawnAt)) push(`${where}: draft carries approval/withdrawal dates`);
    if (k.approvedAt && k.approvedAt < k.createdAt) push(`${where}: approvedAt is before createdAt`);
  }
  for (const id of state.knowledgeOrder) if (!state.knowledge[id]) push(`knowledgeOrder references unknown "${id}"`);

  /* --- notifications & selection --- */
  for (const n of state.notifications) {
    if (n.conversationId && !state.conversations[n.conversationId])
      push(`notification ${n.id}: unknown conversation "${n.conversationId}"`);
    if (n.knowledgeId && !state.knowledge[n.knowledgeId]) push(`notification ${n.id}: unknown knowledge "${n.knowledgeId}"`);
  }
  if (state.selectedConversationId && !state.conversations[state.selectedConversationId])
    push(`selectedConversationId "${state.selectedConversationId}" does not exist`);

  /* --- settings --- */
  for (const h of state.settings.workingHours.holidays)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(h.date)) push(`holiday "${h.date}" is not YYYY-MM-DD`);

  return problems;
}
