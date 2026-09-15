import { Clock, Image } from 'lucide-react';
import { memo } from 'react';
import type { Conversation, Message } from '@/domain/types';
import { formatRelative } from '@/domain/calendar';
import { useDemo } from '@/state/store';
import { LANGUAGE_TAG, staffInitials } from '@/lib/labels';
import { cn } from '@/lib/cn';
import { ChannelGlyph, NodeGlyph } from '@/components/icons/channels';
import { Avatar } from '@/components/ui/avatar';
import { Badge, Count, Dot } from '@/components/ui/badge';

function previewOf(m: Message | undefined): { text: string; icon?: 'photo' } {
  if (!m) return { text: 'No messages yet' };
  switch (m.kind) {
    case 'photo':
      return { text: m.text || 'Photo', icon: 'photo' };
    case 'customer_attachment':
      return { text: 'Attachment', icon: 'photo' };
    case 'slot_offer':
      return { text: m.text || 'Offered consultation times' };
    case 'booking_card':
      return { text: m.text || 'Booking confirmation' };
    default:
      return { text: m.text ?? '' };
  }
}

const AUTHOR_PREFIX: Record<Message['author'], string> = { customer: '', assistant: 'Assistant: ', staff: 'You: ', system: '' };

export const ConversationRow = memo(function ConversationRow({
  conversation: conv,
  selected,
  onSelect,
}: {
  conversation: Conversation;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const { state } = useDemo();
  const customer = state.customers[conv.customerId];
  const order = state.messageOrder[conv.id] ?? [];
  const last = state.messages[order[order.length - 1]];
  const preview = previewOf(last);
  const unread = conv.unread > 0;
  const lastHuman = conv.ownership === 'human';

  return (
    <div
      id={`row-${conv.id}`}
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      className={cn('row', selected && 'is-selected', unread && 'is-unread')}
      data-testid="conversation-row"
      data-conversation-id={conv.id}
      onClick={() => onSelect(conv.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(conv.id);
        }
      }}
    >
      <Avatar monogram={customer?.monogram ?? '??'} glyph={<ChannelGlyph channel={conv.channel} />} />
      <div className="row__body">
        <div className="row__top">
          <span className="row__name" lang={customer?.language}>
            {customer?.name ?? conv.customerId}
          </span>
          {customer?.readingKo ? (
            <span className="row__reading" lang="ko">
              {customer.readingKo}
            </span>
          ) : null}
          <span className="row__time">{formatRelative(conv.lastActivityAt, state.clock)}</span>
        </div>
        <div className="row__bottom">
          {customer ? (
            <Badge tone="outline" mono>
              {LANGUAGE_TAG[customer.language]}
            </Badge>
          ) : null}
          <span className="row__preview" lang={last?.author === 'customer' ? customer?.language : undefined}>
            {preview.icon === 'photo' ? <Image size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} /> : null}
            {last ? <em>{AUTHOR_PREFIX[last.author]}</em> : null}
            {preview.text}
          </span>
          <span className="row__meta">
            {conv.afterHoursQueued ? (
              <span className="row__queued" title="Received after hours · queued for staff">
                <Clock />
                Queued
              </span>
            ) : null}
            {conv.ownership === 'ai' ? (
              <span className="row__own row__own--ai" title="AI assistant is handling this conversation">
                <NodeGlyph size={12} />
                AI
              </span>
            ) : conv.ownership === 'needs_human' ? (
              <span className="row__own row__own--needs" title="Waiting for a person">
                <Dot tone="warning" />
                Needs human
              </span>
            ) : (
              <span className="row__own row__own--human" title="A staff member is handling this conversation">
                {staffInitials(lastHuman ? state.role === 'manager' ? 'manager-jihoon' : 'staff-seoyeon' : '')}
              </span>
            )}
            <Count value={conv.unread} />
          </span>
        </div>
      </div>
    </div>
  );
});
