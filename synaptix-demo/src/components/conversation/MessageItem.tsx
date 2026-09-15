import { Check, CheckCheck, CircleAlert, Clock, Languages } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { memo } from 'react';
import type { Customer, DeliveryState, Message } from '@/domain/types';
import { formatDate, formatTime } from '@/domain/calendar';
import { STAFF_BY_ROLE } from '@/data/staff';
import { useDemo } from '@/lib/store';
import { DELIVERY_LABEL } from '@/lib/labels';
import { cn } from '@/lib/cn';
import { NodeGlyph } from '@/components/icons/channels';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { SourcesChip } from './SourcesChip';
import { useTranslationToggle } from './translationToggle';

const DELIVERY_ICON: Record<DeliveryState, typeof Check> = { sending: Clock, sent: Check, delivered: CheckCheck, failed: CircleAlert };

function DeliveryTick({ delivery }: { delivery: DeliveryState }) {
  const Icon = DELIVERY_ICON[delivery];
  return (
    <span className={cn('msg__delivery', `msg__delivery--${delivery}`)} data-testid="delivery-state" data-delivery={delivery}>
      <Icon />
      {DELIVERY_LABEL[delivery]}
    </span>
  );
}

const APPT_STATUS_TONE = { confirmed: 'success', rescheduled: 'cobalt', cancelled: 'error' } as const;

export const MessageItem = memo(function MessageItem({ message: m, customer, isNew }: { message: Message; customer: Customer; isNew: boolean }) {
  const { state } = useDemo();
  const [showKo] = useTranslationToggle();
  const reduced = useReducedMotion();
  const out = m.author === 'assistant' || m.author === 'staff';
  const staff = STAFF_BY_ROLE[state.role];

  if (m.author === 'system' || m.kind === 'system') {
    return (
      <div className="msg msg--system" data-testid="message" data-message-kind={m.kind} data-author={m.author} data-message-id={m.id}>
        <span className="msg__system">{m.text}</span>
      </div>
    );
  }

  const lang = m.author === 'customer' ? customer.language : m.author === 'assistant' ? customer.language : undefined;
  const translation = (m.author === 'customer' || m.author === 'assistant') && m.translationKo && showKo ? m.translationKo : undefined;

  let body: React.ReactNode = null;
  switch (m.kind) {
    case 'photo': {
      const k = m.photoId ? state.knowledge[m.photoId] : undefined;
      body = (
        <>
          {m.text ? (
            <div className="msg__bubble" lang={lang}>
              {m.text}
            </div>
          ) : null}
          {k?.photo ? (
            <figure className="msg__photo">
              <img src={k.photo.src} alt={k.photo.alt} width={280} />
              <figcaption>{k.title}</figcaption>
            </figure>
          ) : (
            <div className="msg__bubble">Photo unavailable</div>
          )}
        </>
      );
      break;
    }
    case 'customer_attachment':
      body = (
        <>
          <figure className="msg__photo">
            {m.attachmentSrc ? <img src={m.attachmentSrc} alt="Customer attachment" width={280} /> : null}
            <figcaption>
              Customer attachment · <span className="msg__attachment-note">not assessed by the assistant</span>
            </figcaption>
          </figure>
          {m.text ? (
            <div className="msg__bubble" lang={lang}>
              {m.text}
            </div>
          ) : null}
        </>
      );
      break;
    case 'slot_offer': {
      const conv = state.conversations[m.conversationId];
      const selected = conv?.booking.selectedSlotId;
      body = (
        <div className="msg__bubble" lang={lang}>
          {m.text}
          <div className="slot-offer" lang="en">
            {(m.slotIds ?? []).map((id) => {
              const s = state.slots[id];
              if (!s) return null;
              const isSel = id === selected;
              return (
                <div key={id} className={cn('slot-offer__item', isSel && 'is-selected')} data-testid="offered-slot" data-slot-id={id} data-selected={isSel}>
                  {isSel ? <Check /> : <Clock />}
                  <span>
                    {formatDate(s.startsAt)} · {formatTime(s.startsAt)}
                  </span>
                  <span className="slot-offer__room">{s.durationMin} min</span>
                </div>
              );
            })}
          </div>
        </div>
      );
      break;
    }
    case 'booking_card': {
      const apt = m.appointmentId ? state.crm.appointments[m.appointmentId] : undefined;
      const slot = apt ? state.slots[apt.slotId] : undefined;
      body = (
        <div className="msg__bubble" lang={lang}>
          {m.text}
          {apt ? (
            <div className="booking-card" lang="en" data-testid="booking-card" data-reference={apt.reference}>
              <div className="booking-card__head">
                <span className="booking-card__ref">{apt.reference}</span>
                <Badge tone={APPT_STATUS_TONE[apt.status]}>{apt.status}</Badge>
              </div>
              <div className="booking-card__body">
                <dl className="kv">
                  <dt>Date</dt>
                  <dd className="mono">{slot ? `${formatDate(slot.startsAt)} · ${formatTime(slot.startsAt)}` : apt.slotId}</dd>
                  <dt>Duration</dt>
                  <dd>{slot ? `${slot.durationMin} min` : '—'}</dd>
                  <dt>Room</dt>
                  <dd>{slot?.room ?? '—'}</dd>
                  <dt>Status</dt>
                  <dd>{apt.status === 'confirmed' ? 'Confirmed' : apt.status === 'rescheduled' ? 'Rescheduled' : 'Cancelled'}</dd>
                </dl>
              </div>
            </div>
          ) : (
            <div className="meta">Booking details unavailable</div>
          )}
        </div>
      );
      break;
    }
    default:
      body = (
        <div className="msg__bubble" lang={lang}>
          {m.text}
        </div>
      );
  }

  const Wrapper = reduced || !isNew ? 'div' : motion.div;
  const motionProps = reduced || !isNew ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.18, ease: [0.2, 0, 0, 1] as const } };

  return (
    <Wrapper
      className={cn('msg', out && 'msg--out', `msg--${m.author}`, m.kind === 'handover' && 'msg--handover')}
      data-testid="message"
      data-message-kind={m.kind}
      data-author={m.author}
      data-message-id={m.id}
      {...motionProps}
    >
      {m.author === 'assistant' ? (
        <span className="msg__label msg__label--assistant">
          <NodeGlyph size={12} />
          Assistant{m.kind === 'handover' ? ' · handover' : ''}
        </span>
      ) : m.author === 'staff' ? (
        <span className="msg__label">{staff.name}</span>
      ) : null}
      {body}
      {translation ? (
        <div className="msg__translation" lang="ko" data-testid="translation">
          <span className="msg__translation-tag">KO</span>
          <span>{translation}</span>
        </div>
      ) : null}
      <div className={cn('msg__foot', out && 'msg__foot--out')}>
        <span>{formatTime(m.at)}</span>
        {out ? <DeliveryTick delivery={m.delivery} /> : null}
        {m.needsLanguageReview ? (
          <Tooltip content="Copy flagged for review by a fluent speaker — the fixed translation may not capture nuance.">
            <span className="msg__review" data-testid="review-marker" tabIndex={0}>
              <Languages />
              review
            </span>
          </Tooltip>
        ) : null}
        {m.author === 'assistant' && m.sourceIds && m.sourceIds.length > 0 ? <SourcesChip sourceIds={m.sourceIds} /> : null}
      </div>
    </Wrapper>
  );
});
