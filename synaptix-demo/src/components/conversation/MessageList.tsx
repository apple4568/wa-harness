import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Conversation, Customer } from '@/domain/types';
import { dateKey, formatDate } from '@/domain/calendar';
import { useDemo } from '@/state/store';
import { selectMessages } from '@/state/selectors';
import { MessageItem } from './MessageItem';
import { AssistantActivityIndicator, TypingIndicator } from './Indicators';

export function MessageList({ conversation: conv, customer }: { conversation: Conversation; customer: Customer }) {
  const { state } = useDemo();
  const messages = useMemo(() => selectMessages(state, conv.id), [state, conv.id]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Messages present when a conversation is first shown don't animate in; later ones do.
  // (Derived state keyed by conversation id — reset during render on switch.)
  const [seen, setSeen] = useState<{ convId: string; ids: Set<string> }>(() => ({ convId: conv.id, ids: new Set(messages.map((m) => m.id)) }));
  if (seen.convId !== conv.id) {
    setSeen({ convId: conv.id, ids: new Set(messages.map((m) => m.id)) });
  }
  const initialIds = seen.convId === conv.id ? seen.ids : new Set(messages.map((m) => m.id));

  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lastId, conv.id, conv.assistant.kind, conv.customerTyping]);

  const items: ReactNode[] = [];
  let lastDay = '';
  for (const m of messages) {
    const day = dateKey(m.at);
    if (day !== lastDay) {
      items.push(
        <div className="thread__day" key={`day-${day}`}>
          {formatDate(m.at)}
        </div>,
      );
      lastDay = day;
    }
    items.push(<MessageItem key={m.id} message={m} customer={customer} isNew={!initialIds.has(m.id)} />);
  }

  return (
    <div ref={scrollRef} className="thread" data-testid="message-list" role="log" aria-live="polite" aria-relevant="additions">
      <div className="thread__col">
        {items}
        {conv.ownership === 'ai' ? <AssistantActivityIndicator activity={conv.assistant} /> : null}
        {conv.customerTyping ? <TypingIndicator name={customer.name} /> : null}
      </div>
    </div>
  );
}
