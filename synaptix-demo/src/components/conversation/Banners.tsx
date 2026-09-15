import { Clock, Hand, TriangleAlert, UserRound } from 'lucide-react';
import type { Conversation } from '@/domain/types';
import { formatDateTime, formatTime } from '@/domain/calendar';
import { STAFF_BY_ROLE } from '@/data/staff';
import { useDemo } from '@/state/store';
import { selectClinicOpen, selectNextOpening } from '@/state/selectors';
import { Button } from '@/components/ui/button';

export function OwnershipBanner({ conversation: conv }: { conversation: Conversation }) {
  const { state, dispatch } = useDemo();
  const me = STAFF_BY_ROLE[state.role];

  if (conv.ownership === 'needs_human') {
    const h = conv.handover;
    return (
      <div className="banner banner--warning" role="status" data-testid="banner-needs-human">
        <TriangleAlert />
        <div className="banner__body">
          <div className="banner__title">
            Needs human · {h?.reason ?? 'The assistant handed this conversation over'}
            {h ? <span className="meta mono"> · {formatTime(h.at)}</span> : null}
          </div>
          {h && h.points.length > 0 ? (
            <ul className="banner__points">
              {h.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="banner__actions">
          <Button variant="primary" size="sm" data-testid="btn-take-over-banner" onClick={() => dispatch({ type: 'TAKE_OVER', conversationId: conv.id, by: me.name })}>
            <Hand />
            Take over
          </Button>
        </div>
      </div>
    );
  }

  if (conv.ownership === 'human') {
    return (
      <div className="banner banner--neutral" role="status" data-testid="banner-human">
        <UserRound />
        <div className="banner__body">
          <span className="banner__title">You are handling this conversation</span>
          <span className="meta"> · AI paused for this conversation</span>
        </div>
        <div className="banner__actions">
          <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'RETURN_TO_AI', conversationId: conv.id, by: me.name })}>
            Return to AI
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

export function AfterHoursBanner() {
  const { state } = useDemo();
  const open = selectClinicOpen(state);
  const next = selectNextOpening(state);
  return (
    <div className="banner banner--queued" role="status" data-testid="banner-after-hours">
      <Clock />
      <div className="banner__body">
        <span className="banner__title">Received after hours · queued for staff</span>
        <span className="meta">
          {' '}
          · The customer was told when to expect a reply. {open ? 'The clinic is open now.' : `Next opening ${formatDateTime(next.at)}`}
          {next.skipped.length > 0 && !open ? ` (skips ${next.skipped.map((s) => s.reason).join(', ')})` : ''}
        </span>
      </div>
    </div>
  );
}
