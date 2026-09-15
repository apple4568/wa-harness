import { Database, Info, TriangleAlert } from 'lucide-react';
import { useId } from 'react';
import type { Channel, ConnectionStatus } from '@/domain/types';
import { useDemo } from '@/lib/store';
import { CHANNEL_LABEL, CHANNEL_ORDER, CONNECTION_LABEL } from '@/lib/labels';
import { ChannelGlyph } from '@/components/icons/channels';
import { Dot } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const STATUS_TONE = { connected: 'success', degraded: 'warning', disconnected: 'error' } as const;
const STATUSES: ConnectionStatus[] = ['connected', 'degraded', 'disconnected'];

/* ---------- Escalation ---------- */

export function EscalationSection() {
  const { state, dispatch } = useDemo();
  const ids = useId();
  return (
    <section className="st-panel" aria-labelledby={`${ids}-title`} data-testid="settings-escalation">
      <div className="st-panel__head">
        <div>
          <h2 className="st-panel__title" id={`${ids}-title`}>
            Escalation recipients
          </h2>
          <p className="st-panel__caption">Who is notified when a conversation needs a person or is queued after hours.</p>
        </div>
      </div>
      <div className="st-panel__body st-panel__body--flush">
        {state.settings.escalation.map((r) => {
          const switchId = `${ids}-${r.id}`;
          return (
            <div key={r.id} className="st-row st-row--esc" data-testid="escalation-row" data-recipient-id={r.id} data-enabled={r.enabled ? 'true' : 'false'}>
              <label className="st-row__name" htmlFor={switchId} lang="ko">
                {r.name}
              </label>
              <span className="st-row__sub st-row__cell--role">{r.role}</span>
              <span className="st-row__via st-row__cell--via" title={r.via}>
                {r.via}
              </span>
              <Switch id={switchId} checked={r.enabled} aria-label={`Notify ${r.name}`} data-testid="escalation-switch" onCheckedChange={(enabled) => dispatch({ type: 'SET_ESCALATION_ENABLED', recipientId: r.id, enabled })} />
            </div>
          );
        })}
      </div>
      <p className="st-panel__foot">
        <Info aria-hidden="true" />
        <span>Notifications in this demo are in-app only; no messages are sent to anyone.</span>
      </p>
    </section>
  );
}

/* ---------- Connections ---------- */

function StatusSelect({ id, value, label, onChange }: { id: string; value: ConnectionStatus; label: string; onChange: (s: ConnectionStatus) => void }) {
  return (
    <span className="st-row__status">
      <Dot tone={STATUS_TONE[value]} />
      <Select value={value} onValueChange={(v) => onChange(v as ConnectionStatus)}>
        <SelectTrigger id={id} aria-label={`${label} status (simulated)`} data-testid="connection-status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {CONNECTION_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </span>
  );
}

export function ConnectionsSection() {
  const { state, dispatch } = useDemo();
  const ids = useId();
  const set = (target: Channel | 'crm', status: ConnectionStatus) => dispatch({ type: 'SET_CONNECTION_STATUS', target, status });
  return (
    <section className="st-panel" aria-labelledby={`${ids}-title`} data-testid="settings-connections">
      <div className="st-panel__head">
        <div>
          <h2 className="st-panel__title" id={`${ids}-title`}>
            Connections (simulated)
          </h2>
          <p className="st-panel__caption">Messaging channels and the clinic CRM as the demo presents them.</p>
        </div>
      </div>
      <div className="st-panel__body st-panel__body--flush">
        {CHANNEL_ORDER.map((ch) => {
          const c = state.settings.channels[ch];
          return (
            <div key={ch} className="st-row st-row--conn" data-testid="connection-row" data-target={ch} data-status={c.status}>
              <span className="st-row__conn">
                <ChannelGlyph channel={ch} size={15} />
                <span className="st-row__name">{CHANNEL_LABEL[ch]}</span>
              </span>
              <span className="st-row__via" title={c.account}>
                {c.account}
              </span>
              <StatusSelect id={`${ids}-${ch}`} value={c.status} label={CHANNEL_LABEL[ch]} onChange={(s) => set(ch, s)} />
            </div>
          );
        })}
        <div className="st-row st-row--conn" data-testid="connection-row" data-target="crm" data-status={state.settings.crmStatus}>
          <span className="st-row__conn">
            <Database size={15} aria-hidden="true" />
            <span className="st-row__name">Clinic CRM</span>
          </span>
          <span className="st-row__via">Booking records · simulated in-process</span>
          <StatusSelect id={`${ids}-crm`} value={state.settings.crmStatus} label="Clinic CRM" onChange={(s) => set('crm', s)} />
        </div>
      </div>
      <p className="st-panel__foot">
        <Info aria-hidden="true" />
        <span>Statuses are simulated for demonstration — no account access or CRM integration has been verified.</span>
      </p>
    </section>
  );
}

/* ---------- Assistant ---------- */

export function AssistantSection() {
  const { state, dispatch } = useDemo();
  const ids = useId();
  const paused = state.settings.aiPaused;
  return (
    <section className="st-panel" aria-labelledby={`${ids}-title`} data-testid="settings-assistant">
      <div className="st-panel__head">
        <div>
          <h2 className="st-panel__title" id={`${ids}-title`}>
            Assistant
          </h2>
          <p className="st-panel__caption">The assistant only replies in conversations it owns, using approved knowledge.</p>
        </div>
      </div>
      <div className="st-ai">
        <div className="st-ai__text">
          <label className="st-ai__label" htmlFor={`${ids}-paused`}>
            Pause assistant for all conversations
          </label>
          <p className="st-ai__desc">Staff can still read and reply. Nothing is sent automatically while paused.</p>
        </div>
        <Switch id={`${ids}-paused`} checked={paused} data-testid="switch-ai-paused" onCheckedChange={(p) => dispatch({ type: 'SET_AI_PAUSED', paused: p })} />
      </div>
      {paused ? (
        <p className="st-warning" role="status" data-testid="ai-paused-warning">
          <TriangleAlert aria-hidden="true" />
          <span>
            <strong>Assistant paused</strong> — it will not reply in any conversation until resumed.
          </span>
        </p>
      ) : null}
    </section>
  );
}
