import { useEffect, useMemo, useRef } from 'react';
import type { Conversation, Customer } from '@/domain/types';
import { dateKey, formatDate } from '@/domain/calendar';
import { useDemo } from '@/lib/store';
import { selectMessages } from '@/state/selectors';
import { MessageItem } from './MessageItem';
import { AssistantActivityIndicator, TypingIndicator } from './Indicators';

export function MessageList({ conversation: conv, customer }: { conversation: Conversation; customer: Customer }) {
  const { state } = useDemo();
  const messages = useMemo(() => selectMessages(state, conv.id), [state, conv.id]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Messages present at first render of this conversation don't animate; later ones do.
  const seenRef = useRef<{ convId: string; ids: Set<string> }>({ convId: '', ids: new Set() });
  if (seenRef.current.convId !== conv.id) {
    seenRef.current = { convId: conv.id, ids: new Set(messages.map((m) => m.id)) };
  }
  const initialIds = seenRef.current.ids;

  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lastId, conv.id, conv.assistant.kind, conv.customerTyping]);

  let lastDay = '';
  return (
    <div ref={scrollRef} className="thread" data-testid="message-list" role="log" aria-live="polite" aria-relevant="additions">
      <div className="thread__col">
        {messages.map((m) => {
          const day = dateKey(m.at);
          const divider = day !== lastDay ? <div className="thread__day" key={`day-${day}`}>{formatDate(m.at)}</div> : null;
          lastDay = day;
          return (
            <FragmentWithKey key={m.id}>
              {divider}
              <MessageItem message={m} customer={customer} isNew={!initialIds.has(m.id)} />
            </FragmentWithKey>
          );
        })}
        {conv.ownership === 'ai' ? <AssistantActivityIndicator activity={conv.assistant} /> : null}
        {conv.customerTyping ? <TypingIndicator name={customer.name} /> : null}
      </div>
    </div>
  );
}

function FragmentWithKey({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
