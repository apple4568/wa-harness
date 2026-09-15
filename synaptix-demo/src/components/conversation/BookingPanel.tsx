import { CalendarDays, Check, LoaderCircle, RefreshCw, Send, TriangleAlert, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Appointment, BookingStage, ClinicSlot, Conversation, Customer, Message } from '@/domain/types';
import { formatDate, formatDateTime, formatTime } from '@/domain/calendar';
import { useDemo } from '@/state/store';
import { selectAppointmentForConversation, selectCurrentRequest, selectPendingRequest, selectSlots } from '@/state/selectors';
import { nextAvailableSlots, nextRequestId } from '@/lib/booking';
import { DELIVERY_LABEL, customerName } from '@/lib/labels';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';

const APPT_STATUS_TONE = { confirmed: 'success', rescheduled: 'cobalt', cancelled: 'error' } as const;

/* ---------- Stepper ---------- */

const STEPS: Array<{ key: BookingStage; label: string }> = [
  { key: 'slots_offered', label: 'Time offered' },
  { key: 'customer_confirmed', label: 'Customer confirmed' },
  { key: 'submitting', label: 'Booking submitted' },
  { key: 'crm_success', label: 'CRM success' },
  { key: 'confirmation_sent', label: 'Confirmation sent' },
];

const STAGE_RANK: Record<BookingStage, number> = {
  idle: 0,
  slots_offered: 1,
  customer_confirmed: 2,
  submitting: 3,
  crm_success: 4,
  needs_review: 3,
  confirmation_sent: 5,
};

function Stepper({ stage, intent }: { stage: BookingStage; intent: Conversation['booking']['intent'] }) {
  const rank = STAGE_RANK[stage];
  const rows: ReactNode[] = [];
  STEPS.forEach((s, i) => {
    const n = i + 1;
    if (intent === 'cancel' && s.key === 'slots_offered') return; // cancellations skip time offers
    const done = rank > n || stage === 'confirmation_sent';
    const current = rank === n && stage !== 'needs_review' && stage !== 'confirmation_sent';
    const active = s.key === 'submitting' && stage === 'submitting';
    rows.push(
      <li key={s.key} className={cn('step', done && 'is-done', current && 'is-current', active && 'is-active')} data-testid="booking-step" data-step={s.key} data-state={done ? 'done' : current ? 'current' : 'todo'}>
        <span className="step__marker">
          <span className="step__dot">{done ? <Check /> : null}</span>
        </span>
        <span className="step__label">
          {s.label}
          {active ? <span className="step__sub">Waiting for CRM…</span> : null}
        </span>
      </li>,
    );
    if (s.key === 'submitting' && stage === 'needs_review') {
      rows.push(
        <li key="needs_review" className="step is-warning" data-testid="booking-step" data-step="needs_review" data-state="current">
          <span className="step__marker">
            <span className="step__dot">
              <TriangleAlert />
            </span>
          </span>
          <span className="step__label">
            Needs review
            <span className="step__sub">CRM did not confirm success</span>
          </span>
        </li>,
      );
    }
  });
  return (
    <ol className="stepper" data-testid="booking-stage" data-stage={stage}>
      {rows}
    </ol>
  );
}

/* ---------- Slot row ---------- */

function SlotRow({ slot, selected, disabled, onSelect }: { slot: ClinicSlot; selected: boolean; disabled: boolean; onSelect: () => void }) {
  return (
    <button type="button" className={cn('slot', selected && 'is-selected')} disabled={disabled} aria-pressed={selected} data-testid="slot-option" data-slot-id={slot.id} onClick={onSelect}>
      {selected ? <Check className="slot__check" /> : <span style={{ width: 12 }} />}
      <span>
        {formatDate(slot.startsAt)} · {formatTime(slot.startsAt)}
      </span>
      <span className="slot__room">{slot.room}</span>
    </button>
  );
}

/* ---------- Appointment summary ---------- */

function AppointmentSummary({ appointment: apt, slots }: { appointment: Appointment; slots: Record<string, ClinicSlot> }) {
  const slot = slots[apt.slotId];
  return (
    <div className="appt" data-testid="appointment" data-reference={apt.reference}>
      <div className="appt__head">
        <span className="appt__ref">{apt.reference}</span>
        <Badge tone={APPT_STATUS_TONE[apt.status]}>{apt.status}</Badge>
      </div>
      <div className="appt__body">
        <dl className="kv">
          <dt>When</dt>
          <dd className="mono">{slot ? `${formatDate(slot.startsAt)} · ${formatTime(slot.startsAt)}` : apt.slotId}</dd>
          <dt>Room</dt>
          <dd>{slot?.room ?? '—'}</dd>
          <dt>Created</dt>
          <dd className="mono">{formatDateTime(apt.createdAt)}</dd>
        </dl>
        {apt.history.length > 1 ? (
          <ul className="appt__history" aria-label="History">
            {apt.history.map((h, i) => (
              <li key={i}>
                <span>{formatDateTime(h.at)}</span>
                <span>
                  {h.change}
                  {h.change === 'rescheduled' && h.fromSlotId && h.toSlotId ? ` ${formatTime(h.fromSlotId)} → ${formatDate(h.toSlotId)} ${formatTime(h.toSlotId)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- Panel ---------- */

type DialogKind = 'confirm' | 'reschedule' | 'cancel' | null;

export function BookingPanel({ conversation: conv, customer }: { conversation: Conversation; customer: Customer }) {
  const { state, dispatch } = useDemo();
  const b = conv.booking;
  const appointment = selectAppointmentForConversation(state, conv.id);
  const pending = selectPendingRequest(state, conv.id);
  const request = selectCurrentRequest(state, conv.id);
  const offered = selectSlots(state, b.offeredSlotIds);
  const selectedSlot = b.selectedSlotId ? state.slots[b.selectedSlotId] : undefined;
  const [dialog, setDialog] = useState<DialogKind>(null);

  const inFlow = b.stage !== 'idle' && b.stage !== 'confirmation_sent';
  const liveAppointment = appointment && appointment.status !== 'cancelled' ? appointment : undefined;
  const canOfferTimes = b.intent !== 'cancel' && (b.stage === 'idle' || b.stage === 'slots_offered');
  const canMarkConfirmed = (b.stage === 'slots_offered' && !!b.selectedSlotId) || (b.intent === 'cancel' && b.stage === 'idle' && !!b.appointmentId);
  const retry = request?.status === 'reconciled' && request.reconciledOutcome === 'not_created';
  const canSubmit = b.stage === 'customer_confirmed' && !pending;
  const canSendConfirmation = b.stage === 'crm_success' && !b.confirmationMessageId;
  const confirmationAuthor: Message['author'] | null = conv.ownership === 'human' ? 'staff' : conv.ownership === 'ai' && !state.settings.aiPaused ? 'assistant' : null;

  const offerTimes = (intent = b.intent, appointmentId = b.appointmentId) => {
    const slots = nextAvailableSlots(state, 3, liveAppointment?.slotId);
    dispatch({ type: 'OFFER_SLOTS', conversationId: conv.id, slotIds: slots.map((s) => s.id), intent, appointmentId });
  };

  const submit = () => {
    dispatch({ type: 'SUBMIT_BOOKING', conversationId: conv.id, requestId: nextRequestId(state, conv.id) });
  };

  const sendConfirmation = () => {
    if (!appointment || !confirmationAuthor) return;
    const slot = state.slots[appointment.slotId];
    const when = slot ? `${formatDate(slot.startsAt)} ${formatTime(slot.startsAt)}` : appointment.slotId;
    const text =
      appointment.status === 'cancelled'
        ? `Your consultation ${appointment.reference} has been cancelled.`
        : appointment.status === 'rescheduled'
          ? `Your consultation has been moved to ${when}. Reference ${appointment.reference}.`
          : `Your consultation is confirmed for ${when}. Reference ${appointment.reference}.`;
    const message: Message = {
      id: `m-confirmation-${b.requestId ?? appointment.reference}-${state.seq}`,
      conversationId: conv.id,
      at: state.clock,
      author: confirmationAuthor,
      kind: 'booking_card',
      text,
      appointmentId: appointment.id,
      delivery: 'sending',
    };
    dispatch({ type: 'SEND_BOOKING_CONFIRMATION', conversationId: conv.id, message });
  };

  const reconcile = () => {
    if (!request) return;
    dispatch({ type: 'RECONCILE_BOOKING', requestId: request.id, outcome: 'was_created' });
  };

  const confirmCustomer = () => {
    dispatch({ type: 'CUSTOMER_CONFIRMED', conversationId: conv.id });
    setDialog(null);
  };

  const confirmReschedule = () => {
    if (!liveAppointment) return;
    dispatch({ type: 'START_CHANGE', conversationId: conv.id, appointmentId: liveAppointment.id, intent: 'reschedule' });
    const slots = nextAvailableSlots(state, 3, liveAppointment.slotId);
    dispatch({ type: 'OFFER_SLOTS', conversationId: conv.id, slotIds: slots.map((s) => s.id), intent: 'reschedule', appointmentId: liveAppointment.id });
    setDialog(null);
  };

  const confirmCancel = () => {
    if (!liveAppointment) return;
    dispatch({ type: 'START_CHANGE', conversationId: conv.id, appointmentId: liveAppointment.id, intent: 'cancel' });
    dispatch({ type: 'CUSTOMER_CONFIRMED', conversationId: conv.id });
    dispatch({ type: 'SUBMIT_BOOKING', conversationId: conv.id, requestId: nextRequestId(state, conv.id) });
    setDialog(null);
  };

  const crmLine = (() => {
    if (pending) return { text: 'Waiting for CRM…', tone: 'pending' as const };
    if (!request) return { text: state.settings.crmStatus === 'connected' ? 'No request in flight' : `CRM ${state.settings.crmStatus}`, tone: 'neutral' as const };
    switch (request.status) {
      case 'success':
        return { text: `Success · ${appointment?.reference ?? 'created'}`, tone: 'success' as const };
      case 'timeout':
        return { text: 'Timed out — success not confirmed', tone: 'warning' as const };
      case 'reconciled':
        return request.reconciledOutcome === 'was_created'
          ? { text: `Reconciled · booking existed (${appointment?.reference ?? ''})`, tone: 'success' as const }
          : { text: 'Reconciled · not created', tone: 'warning' as const };
      default:
        return { text: 'Pending', tone: 'pending' as const };
    }
  })();

  const intentLabel = b.intent === 'reschedule' ? 'Reschedule' : b.intent === 'cancel' ? 'Cancellation' : 'New consultation';

  return (
    <>
      <div className="panel__header">
        <span className="panel__title">Consultation</span>
        <Button variant="ghost" size="sm" icon aria-label="Close booking panel" onClick={() => dispatch({ type: 'TOGGLE_BOOKING_PANEL', open: false })}>
          <X />
        </Button>
      </div>
      <div className="panel__scroll">
        {/* Current appointment */}
        <section className="panel__section">
          <div className="panel__section-title">
            <span className="label">Current appointment</span>
          </div>
          {appointment ? (
            <AppointmentSummary appointment={appointment} slots={state.slots} />
          ) : (
            <p className="panel__empty">No appointment yet for {customerName(customer)}.</p>
          )}
          {liveAppointment && !inFlow ? (
            <div className="panel__actions" style={{ marginTop: 8 }}>
              <Button variant="secondary" size="sm" data-testid="btn-reschedule" onClick={() => setDialog('reschedule')}>
                <CalendarDays />
                Reschedule
              </Button>
              <Button variant="danger" size="sm" data-testid="btn-cancel-appointment" onClick={() => setDialog('cancel')}>
                <X />
                Cancel appointment
              </Button>
            </div>
          ) : null}
        </section>

        {/* Flow */}
        <section className="panel__section">
          <div className="panel__section-title">
            <span className="label">Booking flow</span>
            <Badge tone={b.stage === 'needs_review' ? 'warning' : b.stage === 'idle' ? 'neutral' : 'cobalt'}>{intentLabel}</Badge>
          </div>
          {b.stage === 'needs_review' ? (
            <div className="panel__review" role="status" data-testid="booking-review">
              <TriangleAlert />
              <span>
                <strong>Booking status needs review</strong> — success not confirmed. The CRM did not answer in time; nothing was sent to the customer.
              </span>
            </div>
          ) : null}
          <Stepper stage={b.stage} intent={b.intent} />
          <dl className="panel__status" style={{ marginTop: 8 }}>
            <dt>CRM</dt>
            <dd className={cn(crmLine.tone === 'warning' && 'is-warning', crmLine.tone === 'success' && 'is-success')} data-testid="crm-state">
              {crmLine.tone === 'pending' ? <LoaderCircle className="spinner" /> : crmLine.tone === 'success' ? <Check /> : crmLine.tone === 'warning' ? <TriangleAlert /> : null}
              {crmLine.text}
            </dd>
            <dt>Confirmation</dt>
            <dd className={cn(b.confirmationDelivery === 'delivered' && 'is-success', b.confirmationDelivery === 'failed' && 'is-warning')} data-testid="confirmation-state">
              {b.confirmationDelivery === 'sending' ? <LoaderCircle className="spinner" /> : null}
              {b.confirmationDelivery ? DELIVERY_LABEL[b.confirmationDelivery] : 'Not sent'}
            </dd>
          </dl>
        </section>

        {/* Offered slots */}
        {b.intent !== 'cancel' ? (
          <section className="panel__section">
            <div className="panel__section-title">
              <span className="label">Offered times</span>
              {selectedSlot ? <span className="meta mono">{formatTime(selectedSlot.startsAt)} selected</span> : null}
            </div>
            {offered.length > 0 ? (
              <div className="slots" role="group" aria-label="Offered consultation times">
                {offered.map((s) => (
                  <SlotRow key={s.id} slot={s} selected={s.id === b.selectedSlotId} disabled={b.stage !== 'slots_offered'} onSelect={() => dispatch({ type: 'SELECT_SLOT', conversationId: conv.id, slotId: s.id })} />
                ))}
              </div>
            ) : (
              <p className="panel__empty">No times offered yet.</p>
            )}
            {canOfferTimes ? (
              <div className="panel__actions" style={{ marginTop: 8 }}>
                <Button variant="secondary" size="sm" data-testid="btn-offer-slots" onClick={() => offerTimes()}>
                  <CalendarDays />
                  {offered.length > 0 ? 'Offer other times' : 'Offer times'}
                </Button>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Actions */}
        <section className="panel__section">
          <div className="panel__section-title">
            <span className="label">Actions</span>
          </div>
          <div className="panel__actions">
            {b.stage === 'slots_offered' || (b.intent === 'cancel' && b.stage === 'idle') ? (
              <Button variant="primary" size="sm" data-testid="btn-mark-confirmed" disabled={!canMarkConfirmed} onClick={() => setDialog('confirm')}>
                <Check />
                Mark customer confirmed
              </Button>
            ) : null}
            {b.stage === 'customer_confirmed' || b.stage === 'submitting' ? (
              <Button variant="primary" size="sm" data-testid="btn-submit-booking" disabled={!canSubmit} onClick={submit}>
                {pending ? <LoaderCircle className="spinner" /> : <Send />}
                {pending ? 'Waiting for CRM…' : retry ? 'Retry with new request' : 'Submit booking'}
              </Button>
            ) : null}
            {b.stage === 'needs_review' ? (
              <Button variant="primary" size="sm" data-testid="btn-reconcile" onClick={reconcile}>
                <RefreshCw />
                Reconcile with CRM
              </Button>
            ) : null}
            {b.stage === 'crm_success' ? (
              <Button variant="primary" size="sm" data-testid="btn-send-confirmation" disabled={!canSendConfirmation || !confirmationAuthor} onClick={sendConfirmation}>
                <Send />
                Send confirmation
              </Button>
            ) : null}
            {inFlow && b.stage !== 'submitting' ? (
              <Button variant="ghost" size="sm" data-testid="btn-cancel-flow" onClick={() => dispatch({ type: 'CANCEL_BOOKING_FLOW', conversationId: conv.id })}>
                Discard flow
              </Button>
            ) : null}
          </div>
          {b.stage === 'idle' && !liveAppointment && b.intent !== 'cancel' ? <p className="panel__note">Offer times to start a booking. In guided mode the scenario drives these steps.</p> : null}
          {b.stage === 'slots_offered' && !b.selectedSlotId ? <p className="panel__note">Select the time the customer chose, then mark them confirmed.</p> : null}
          {b.stage === 'crm_success' && !confirmationAuthor ? <p className="panel__note">Take over to send the confirmation while the assistant is paused.</p> : null}
          {b.stage === 'confirmation_sent' ? <p className="panel__note">Done — the customer received the confirmation card.</p> : null}
        </section>
      </div>

      {/* Confirm customer choice */}
      <Dialog open={dialog === 'confirm'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent
          testId="dialog-confirm"
          title={b.intent === 'cancel' ? 'Confirm cancellation request' : b.intent === 'reschedule' ? 'Confirm new time' : 'Confirm customer choice'}
          description="Restate the details before anything is submitted to the CRM."
          footer={
            <>
              <DialogClose asChild>
                <Button variant="secondary">Back</Button>
              </DialogClose>
              <Button variant="primary" data-testid="dialog-confirm-accept" onClick={confirmCustomer}>
                Customer confirmed
              </Button>
            </>
          }
        >
          <dl className="kv kv--boxed">
            <dt>Customer</dt>
            <dd lang={customer.name ? customer.language : undefined}>{customerName(customer)}</dd>
            {b.intent === 'cancel' && appointment ? (
              <>
                <dt>Cancel</dt>
                <dd className="mono">{appointment.reference}</dd>
              </>
            ) : selectedSlot ? (
              <>
                <dt>Time</dt>
                <dd className="mono">
                  {formatDate(selectedSlot.startsAt)} · {formatTime(selectedSlot.startsAt)}
                </dd>
                <dt>Room</dt>
                <dd>{selectedSlot.room}</dd>
              </>
            ) : null}
            <dt>Intent</dt>
            <dd>{intentLabel}</dd>
          </dl>
        </DialogContent>
      </Dialog>

      {/* Reschedule */}
      <Dialog open={dialog === 'reschedule'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent
          testId="dialog-confirm"
          title="Reschedule this appointment?"
          description="The next three available times will be offered. The same reference is kept."
          footer={
            <>
              <DialogClose asChild>
                <Button variant="secondary">Back</Button>
              </DialogClose>
              <Button variant="primary" data-testid="dialog-confirm-accept" onClick={confirmReschedule}>
                Offer new times
              </Button>
            </>
          }
        >
          {liveAppointment ? <AppointmentSummary appointment={liveAppointment} slots={state.slots} /> : null}
        </DialogContent>
      </Dialog>

      {/* Cancel */}
      <Dialog open={dialog === 'cancel'} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent
          testId="dialog-confirm"
          title="Cancel this appointment?"
          description="The cancellation is submitted to the CRM immediately. This cannot be undone in the demo."
          footer={
            <>
              <DialogClose asChild>
                <Button variant="secondary">Keep appointment</Button>
              </DialogClose>
              <Button variant="danger" data-testid="dialog-confirm-accept" onClick={confirmCancel}>
                Cancel appointment
              </Button>
            </>
          }
        >
          {liveAppointment ? <AppointmentSummary appointment={liveAppointment} slots={state.slots} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
