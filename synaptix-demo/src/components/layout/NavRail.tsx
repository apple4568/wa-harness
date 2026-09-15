import { BookOpen, Inbox, Settings } from 'lucide-react';
import type { View } from '@/domain/types';
import { STAFF_BY_ROLE } from '@/data/staff';
import { useDemo } from '@/lib/store';
import { selectNeedsHumanCount } from '@/state/selectors';
import { CHANNEL_LABEL, CHANNEL_ORDER, CONNECTION_LABEL } from '@/lib/labels';
import { cn } from '@/lib/cn';
import { ChannelGlyph } from '@/components/icons/channels';
import { Avatar } from '@/components/ui/avatar';
import { Count, Dot } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';

const NAV: Array<{ view: View; label: string; icon: typeof Inbox }> = [
  { view: 'inbox', label: 'Inbox', icon: Inbox },
  { view: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { view: 'settings', label: 'Settings', icon: Settings },
];

const STATUS_TONE = { connected: 'success', degraded: 'warning', disconnected: 'error' } as const;

export function NavRail() {
  const { state, dispatch } = useDemo();
  const needsHuman = selectNeedsHumanCount(state);
  const me = STAFF_BY_ROLE[state.role];

  return (
    <nav className="rail" aria-label="Primary">
      <div className="rail__section">
        {NAV.map(({ view, label, icon: Icon }) => (
          <Tooltip key={view} content={label} side="right">
            <button
              type="button"
              className={cn('rail__item', state.view === view && 'is-active')}
              aria-current={state.view === view ? 'page' : undefined}
              data-testid={`nav-${view}`}
              onClick={() => dispatch({ type: 'SET_VIEW', view })}
            >
              <Icon />
              <span className="rail__item-label">{label}</span>
              {view === 'inbox' ? <Count value={needsHuman} tone="warning" /> : null}
            </button>
          </Tooltip>
        ))}
      </div>

      <div className="rail__section">
        <div className="rail__heading label">Account</div>
        <div className="rail__account">Midam Clinic</div>
        {CHANNEL_ORDER.map((ch) => {
          const c = state.settings.channels[ch];
          return (
            <Tooltip key={ch} content={`${CHANNEL_LABEL[ch]} · ${c.account} · ${CONNECTION_LABEL[c.status]} (simulated)`} side="right">
              <div className="rail__channel">
                <ChannelGlyph channel={ch} size={14} />
                <span className="rail__channel-name">{CHANNEL_LABEL[ch]}</span>
                <Dot tone={STATUS_TONE[c.status]} />
              </div>
            </Tooltip>
          );
        })}
        <Tooltip content={`CRM · ${CONNECTION_LABEL[state.settings.crmStatus]} (simulated)`} side="right">
          <div className="rail__channel">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <ellipse cx="8" cy="4" rx="5" ry="2" />
              <path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" />
            </svg>
            <span className="rail__channel-name">CRM</span>
            <Dot tone={STATUS_TONE[state.settings.crmStatus]} />
          </div>
        </Tooltip>
      </div>

      <div className="rail__spacer" />

      <div className="rail__identity" title={`${me.name} (${me.nameKo}) · ${me.title} · simulated login`}>
        <Avatar monogram={me.monogram} size="sm" tone="ink" />
        <div className="rail__identity-text" style={{ minWidth: 0 }}>
          <div className="rail__identity-name">{me.name}</div>
          <div className="rail__identity-role">
            {me.title} · {state.role === 'manager' ? 'Manager' : 'Staff'}
          </div>
        </div>
      </div>
    </nav>
  );
}
