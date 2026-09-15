import { Search, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, type KeyboardEvent } from 'react';
import type { ChannelFilter } from '@/domain/types';
import { useDemo } from '@/state/store';
import { selectNeedsHumanCount, selectVisibleConversations } from '@/state/selectors';
import { CHANNEL_LABEL, CHANNEL_ORDER } from '@/lib/labels';
import { cn } from '@/lib/cn';
import { ChannelGlyph } from '@/components/icons/channels';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { Count } from '@/components/ui/badge';
import { ConversationRow } from './ConversationRow';
import { NotificationsPopover } from './NotificationsPopover';

export function ConversationList() {
  const { state, dispatch } = useDemo();
  const conversations = useMemo(() => selectVisibleConversations(state), [state]);
  const needsHuman = selectNeedsHumanCount(state);
  const scrollRef = useRef<HTMLDivElement>(null);

  const setChannel = (channel: ChannelFilter) => dispatch({ type: 'SET_FILTERS', filters: { channel } });

  const select = useCallback((id: string) => dispatch({ type: 'SELECT_CONVERSATION', conversationId: id }), [dispatch]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    if (conversations.length === 0) return;
    e.preventDefault();
    const idx = conversations.findIndex((c) => c.id === state.selectedConversationId);
    let next = idx;
    if (e.key === 'ArrowDown') next = Math.min(conversations.length - 1, idx + 1);
    if (e.key === 'ArrowUp') next = Math.max(0, idx - 1);
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = conversations.length - 1;
    if (next !== idx) select(conversations[next].id);
  };

  // Keep the selected row in view when it changes (keyboard navigation, notification click).
  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-conversation-id="${state.selectedConversationId}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [state.selectedConversationId]);

  return (
    <section className="list" aria-label="Conversations">
      <div className="list__header">
        <h2 className="list__title">Inbox</h2>
        <NotificationsPopover />
      </div>
      <div className="list__search">
        <Input
          type="search"
          placeholder="Search name, handle or message"
          aria-label="Search conversations"
          data-testid="search-input"
          value={state.filters.search}
          leading={<Search />}
          onChange={(e) => dispatch({ type: 'SET_FILTERS', filters: { search: e.target.value } })}
        />
      </div>
      <div className="list__filters" role="group" aria-label="Filter by channel">
        <button type="button" className="filter-btn" aria-pressed={state.filters.channel === 'all'} data-testid="filter-all" onClick={() => setChannel('all')}>
          All
        </button>
        {CHANNEL_ORDER.map((ch) => (
          <Tooltip key={ch} content={CHANNEL_LABEL[ch]}>
            <button
              type="button"
              className="filter-btn filter-btn--icon"
              aria-label={CHANNEL_LABEL[ch]}
              aria-pressed={state.filters.channel === ch}
              data-testid={`filter-${ch}`}
              onClick={() => setChannel(ch)}
            >
              <ChannelGlyph channel={ch} />
            </button>
          </Tooltip>
        ))}
        <button
          type="button"
          className="filter-btn filter-btn--needs"
          aria-pressed={state.filters.needsHumanOnly}
          data-testid="filter-needs-human"
          onClick={() => dispatch({ type: 'SET_FILTERS', filters: { needsHumanOnly: !state.filters.needsHumanOnly } })}
        >
          <UserRound />
          Needs human
          <Count value={needsHuman} tone={state.filters.needsHumanOnly ? 'warning' : 'neutral'} />
        </button>
      </div>

      <div ref={scrollRef} className={cn('list__scroll')} role="listbox" aria-label="Conversation list" tabIndex={0} onKeyDown={onKeyDown} aria-activedescendant={state.selectedConversationId ? `row-${state.selectedConversationId}` : undefined}>
        {conversations.length === 0 ? (
          <div className="list__empty">
            <strong>No conversations match</strong>
            {state.filters.search ? `Nothing found for “${state.filters.search}”.` : 'Try another channel or clear the Needs human filter.'}
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationRow key={conv.id} conversation={conv} selected={conv.id === state.selectedConversationId} onSelect={select} />
          ))
        )}
      </div>
    </section>
  );
}
