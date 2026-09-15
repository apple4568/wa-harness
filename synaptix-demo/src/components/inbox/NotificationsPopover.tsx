import { Bell } from 'lucide-react';
import { useMemo } from 'react';
import type { AppNotification } from '@/domain/types';
import { formatRelative } from '@/domain/calendar';
import { useDemo } from '@/lib/store';
import { selectUnreadNotificationCount } from '@/state/selectors';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dot } from '@/components/ui/badge';

const KIND_TONE: Record<AppNotification['kind'], 'warning' | 'cobalt' | 'success' | 'neutral' | 'error'> = {
  needs_human: 'warning',
  after_hours_queue: 'neutral',
  booking_review: 'warning',
  booking_confirmed: 'success',
  knowledge_approval: 'cobalt',
  info: 'neutral',
};

export function NotificationsPopover() {
  const { state, dispatch } = useDemo();
  const unread = selectUnreadNotificationCount(state);
  const items = useMemo(() => [...state.notifications].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)), [state.notifications]);

  const open = (n: AppNotification) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: n.id });
    if (n.conversationId) {
      if (state.view !== 'inbox') dispatch({ type: 'SET_VIEW', view: 'inbox' });
      dispatch({ type: 'SELECT_CONVERSATION', conversationId: n.conversationId });
    } else if (n.knowledgeId) {
      dispatch({ type: 'SET_VIEW', view: 'knowledge' });
    }
    dispatch({ type: 'TOGGLE_NOTIFICATIONS', open: false });
  };

  return (
    <Popover open={state.notificationsOpen} onOpenChange={(o) => dispatch({ type: 'TOGGLE_NOTIFICATIONS', open: o })}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" icon aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`} data-testid="notifications-button" style={{ position: 'relative' }}>
          <Bell />
          {unread > 0 ? (
            <span className="count" data-testid="notifications-count" style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, fontSize: 10 }}>
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" style={{ width: 340 }}>
        <div className="popover__header">
          <span>Notifications</span>
          {unread > 0 ? <span className="meta">{unread} unread</span> : null}
        </div>
        <div className="popover__list">
          {items.length === 0 ? (
            <div className="notif__empty">No notifications</div>
          ) : (
            items.map((n) => (
              <button key={n.id} type="button" className={cn('notif', n.read && 'is-read')} data-testid="notification-item" data-notification-id={n.id} onClick={() => open(n)}>
                <Dot tone={n.read ? 'neutral' : KIND_TONE[n.kind]} className="notif__dot" />
                <span className="notif__body">
                  <span className="notif__title">{n.title}</span>
                  <span className="notif__text">{n.body}</span>
                </span>
                <span className="notif__time">{formatRelative(n.at, state.clock)}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
