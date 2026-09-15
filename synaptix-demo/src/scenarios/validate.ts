/**
 * Static referential checks for a Scenario against a seed state. It does NOT run the
 * reducer; it tracks the ids a scenario introduces (conversations, messages, knowledge,
 * CRM requests → `apt-<requestId>` appointments) and verifies every reference resolves
 * to something that exists at that point in the script. Returns a list of problems.
 */
import type { DemoState, Scenario } from '../domain/types.ts';

export function validateScenario(scenario: Scenario, seed: DemoState): string[] {
  const problems: string[] = [];
  const conversations = new Set(Object.keys(seed.conversations));
  const messages = new Set(Object.keys(seed.messages));
  const knowledgeState = new Map(Object.values(seed.knowledge).map((k) => [k.id, k.state]));
  const appointments = new Set(Object.keys(seed.crm.appointments));
  const requests = new Set<string>();
  const notifications = new Set(seed.notifications.map((n) => n.id));
  const stepIds = new Set<string>();
  let role = seed.role;

  const approved = (id: string) => knowledgeState.get(id) === 'approved';
  const where = (stepId: string, what: string) => `${scenario.id} · step "${stepId}": ${what}`;

  const check = (stepId: string, action: Scenario['steps'][number]['actions'][number]) => {
    const p = (what: string) => problems.push(where(stepId, what));
    switch (action.type) {
      case 'SET_ROLE':
        role = action.role;
        break;
      case 'SELECT_CONVERSATION':
        if (action.conversationId && !conversations.has(action.conversationId))
          p(`selects unknown conversation "${action.conversationId}"`);
        break;
      case 'UPSERT_CONVERSATION': {
        const c = action.conversation;
        if (!seed.customers[c.customerId]) p(`conversation ${c.id} has unknown customer "${c.customerId}"`);
        if (c.account !== seed.settings.channels[c.channel].account) p(`conversation ${c.id} account label mismatch`);
        conversations.add(c.id);
        break;
      }
      case 'SET_CUSTOMER_TYPING':
      case 'SET_ASSISTANT_ACTIVITY':
      case 'MARK_READ':
      case 'CUSTOMER_CONFIRMED':
      case 'QUEUE_AFTER_HOURS':
      case 'DEQUEUE_AFTER_HOURS':
      case 'CANCEL_BOOKING_FLOW':
      case 'TAKE_OVER':
      case 'RETURN_TO_AI':
      case 'HANDOVER':
        if (!conversations.has(action.conversationId)) p(`${action.type} on unknown conversation "${action.conversationId}"`);
        if (action.type === 'SET_ASSISTANT_ACTIVITY' && action.activity.kind === 'retrieving')
          for (const id of action.activity.sourceIds) if (!approved(id)) p(`retrieving non-approved knowledge "${id}"`);
        if (action.type === 'HANDOVER' && action.summary.points.length < 2) p('handover summary needs at least 2 points');
        break;
      case 'SEND_STAFF_MESSAGE':
        if (!conversations.has(action.conversationId)) p(`staff message to unknown conversation "${action.conversationId}"`);
        if (action.photoId && !approved(action.photoId)) p(`staff photo "${action.photoId}" is not approved`);
        break;
      case 'ADD_MESSAGE':
      case 'SEND_BOOKING_CONFIRMATION': {
        const m = action.message;
        if (!conversations.has(m.conversationId)) p(`message ${m.id} targets unknown conversation "${m.conversationId}"`);
        if (messages.has(m.id)) p(`duplicate message id "${m.id}"`);
        messages.add(m.id);
        for (const id of m.sourceIds ?? []) if (!approved(id)) p(`message ${m.id} cites non-approved knowledge "${id}"`);
        if (m.kind === 'photo' && (!m.photoId || !approved(m.photoId))) p(`message ${m.id} uses a non-approved photo`);
        for (const sid of m.slotIds ?? []) if (!seed.slots[sid]) p(`message ${m.id} offers unknown slot "${sid}"`);
        if (m.kind === 'booking_card' && (!m.appointmentId || !appointments.has(m.appointmentId)))
          p(`message ${m.id} references appointment "${m.appointmentId}" that does not exist yet`);
        if (m.author === 'assistant' && m.sourceIds === undefined) p(`assistant message ${m.id} has no sourceIds`);
        if (action.type === 'SEND_BOOKING_CONFIRMATION' && m.kind !== 'booking_card')
          p(`confirmation ${m.id} should be a booking_card`);
        break;
      }
      case 'SET_DELIVERY':
        if (!messages.has(action.messageId)) p(`SET_DELIVERY on unknown message "${action.messageId}"`);
        break;
      case 'OFFER_SLOTS':
        if (!conversations.has(action.conversationId)) p(`OFFER_SLOTS on unknown conversation`);
        for (const sid of action.slotIds) if (!seed.slots[sid]) p(`offers unknown slot "${sid}"`);
        if (action.appointmentId && !appointments.has(action.appointmentId))
          p(`OFFER_SLOTS references unknown appointment "${action.appointmentId}"`);
        break;
      case 'SELECT_SLOT':
        if (!seed.slots[action.slotId]) p(`selects unknown slot "${action.slotId}"`);
        break;
      case 'START_CHANGE':
        if (!appointments.has(action.appointmentId)) p(`START_CHANGE on unknown appointment "${action.appointmentId}"`);
        break;
      case 'SUBMIT_BOOKING':
        if (!conversations.has(action.conversationId)) p(`SUBMIT_BOOKING on unknown conversation`);
        if (requests.has(action.requestId)) p(`duplicate requestId "${action.requestId}"`);
        requests.add(action.requestId);
        break;
      case 'CRM_RESULT':
      case 'RECONCILE_BOOKING':
        if (!requests.has(action.requestId)) p(`${action.type} for unknown request "${action.requestId}"`);
        if (action.type === 'CRM_RESULT' && action.result === 'success') appointments.add(`apt-${action.requestId}`);
        if (action.type === 'RECONCILE_BOOKING' && action.outcome === 'was_created')
          appointments.add(`apt-${action.requestId}`);
        break;
      case 'ADD_KNOWLEDGE':
        if (knowledgeState.has(action.item.id)) p(`knowledge "${action.item.id}" already exists`);
        if (action.item.state !== 'draft') p(`new knowledge "${action.item.id}" should start as a draft`);
        if (action.item.kind === 'photo' && !action.item.photo?.src.startsWith('/photos/'))
          p(`photo "${action.item.id}" src must live under /photos/`);
        knowledgeState.set(action.item.id, action.item.state);
        break;
      case 'APPROVE_KNOWLEDGE':
        if (!knowledgeState.has(action.knowledgeId)) p(`approves unknown knowledge "${action.knowledgeId}"`);
        if (role !== 'manager') p(`APPROVE_KNOWLEDGE while role is "${role}" (manager required)`);
        knowledgeState.set(action.knowledgeId, 'approved');
        break;
      case 'WITHDRAW_KNOWLEDGE':
        if (!knowledgeState.has(action.knowledgeId)) p(`withdraws unknown knowledge "${action.knowledgeId}"`);
        knowledgeState.set(action.knowledgeId, 'withdrawn');
        break;
      case 'PUSH_NOTIFICATION': {
        const n = action.notification;
        if (notifications.has(n.id)) p(`duplicate notification id "${n.id}"`);
        notifications.add(n.id);
        if (n.conversationId && !conversations.has(n.conversationId))
          p(`notification ${n.id} points at unknown conversation "${n.conversationId}"`);
        if (n.knowledgeId && !knowledgeState.has(n.knowledgeId))
          p(`notification ${n.id} points at unknown knowledge "${n.knowledgeId}"`);
        break;
      }
      case 'MARK_NOTIFICATION_READ':
        if (!notifications.has(action.notificationId)) p(`marks unknown notification "${action.notificationId}" read`);
        break;
      default:
        break;
    }
  };

  for (const a of scenario.setup) check('(setup)', a);
  for (const s of scenario.steps) {
    if (stepIds.has(s.id)) problems.push(where(s.id, 'duplicate step id'));
    stepIds.add(s.id);
    if (!s.title.trim()) problems.push(where(s.id, 'empty title'));
    if (s.actions.length === 0) problems.push(where(s.id, 'no actions'));
    if (s.delayMs !== undefined && (s.delayMs < 0 || s.delayMs > 5000)) problems.push(where(s.id, `odd delay ${s.delayMs}ms`));
    for (const a of s.actions) check(s.id, a);
  }
  if (scenario.steps.length === 0) problems.push(`${scenario.id}: no steps`);
  if (!scenario.steps.some((s) => s.pauseAfter)) problems.push(`${scenario.id}: no pause points`);

  return problems;
}
