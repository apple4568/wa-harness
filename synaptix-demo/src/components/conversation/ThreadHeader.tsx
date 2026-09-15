import { CalendarDays, Hand, MapPin, Undo2, UserRound } from 'lucide-react';
import type { Conversation, Customer } from '@/domain/types';
import { STAFF_BY_ROLE } from '@/data/staff';
import { useDemo } from '@/state/store';
import { CHANNEL_LABEL, LANGUAGE_LABEL, LANGUAGE_TAG, OWNERSHIP_LABEL } from '@/lib/labels';
import { cn } from '@/lib/cn';
import { ChannelGlyph, NodeGlyph } from '@/components/icons/channels';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SwitchField } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { useTranslationToggle } from './translationContext';

export function OwnershipPill({ ownership }: { ownership: Conversation['ownership'] }) {
  return (
    <span className={cn('own-pill', `own-pill--${ownership}`)} data-testid="ownership-pill" data-ownership={ownership}>
      {ownership === 'ai' ? <NodeGlyph /> : ownership === 'needs_human' ? <Hand /> : <UserRound />}
      {OWNERSHIP_LABEL[ownership]}
    </span>
  );
}

export function ThreadHeader({ conversation: conv, customer }: { conversation: Conversation; customer: Customer }) {
  const { state, dispatch } = useDemo();
  const me = STAFF_BY_ROLE[state.role];
  const [showKo, setShowKo] = useTranslationToggle();

  return (
    <header className="thread-header">
      <div className="thread-header__who">
        <Avatar monogram={customer.monogram} size="lg" glyph={<ChannelGlyph channel={conv.channel} />} />
        <div className="thread-header__names">
          <div className="thread-header__name">
            <span lang={customer.language}>{customer.name}</span>
            {customer.readingKo ? (
              <span className="meta truncate" lang="ko">
                {customer.readingKo}
              </span>
            ) : null}
          </div>
          <div className="thread-header__sub" title={`${CHANNEL_LABEL[conv.channel]} · ${conv.account} · ${customer.handle} · ${LANGUAGE_LABEL[customer.language]}${customer.location ? ` · ${customer.location}` : ''}`}>
            <ChannelGlyph channel={conv.channel} size={12} />
            <span className="truncate">
              {CHANNEL_LABEL[conv.channel]} · {conv.account} · {customer.handle} ·{' '}
              <Tooltip content={LANGUAGE_LABEL[customer.language]}>
                <span className="mono">{LANGUAGE_TAG[customer.language]}</span>
              </Tooltip>
              {customer.location ? (
                <>
                  {' · '}
                  <MapPin style={{ display: 'inline', verticalAlign: '-1px' }} />
                  {customer.location}
                </>
              ) : null}
            </span>
          </div>
        </div>
      </div>

      <div className="thread-header__actions">
        <OwnershipPill ownership={conv.ownership} />
        {conv.ownership === 'human' ? (
          <Button variant="secondary" size="sm" data-testid="btn-return-ai" onClick={() => dispatch({ type: 'RETURN_TO_AI', conversationId: conv.id, by: me.name })}>
            <Undo2 />
            Return to AI
          </Button>
        ) : (
          <Button variant={conv.ownership === 'needs_human' ? 'primary' : 'secondary'} size="sm" data-testid="btn-take-over" onClick={() => dispatch({ type: 'TAKE_OVER', conversationId: conv.id, by: me.name })}>
            <Hand />
            Take over
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          aria-pressed={state.bookingPanelOpen}
          data-testid="btn-booking-panel"
          className={cn(state.bookingPanelOpen && 'is-active')}
          onClick={() => dispatch({ type: 'TOGGLE_BOOKING_PANEL' })}
        >
          <CalendarDays />
          Consultation
          {conv.booking.stage === 'needs_review' ? (
            <Badge tone="warning">Review</Badge>
          ) : conv.booking.stage !== 'idle' && conv.booking.stage !== 'confirmation_sent' ? (
            <Badge tone="cobalt">In progress</Badge>
          ) : null}
        </Button>
        <SwitchField label="Korean translation" labelPosition="left" checked={showKo} onCheckedChange={setShowKo} testId="translation-toggle" />
      </div>
    </header>
  );
}
