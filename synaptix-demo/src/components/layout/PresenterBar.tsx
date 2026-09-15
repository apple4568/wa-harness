import { Pause, Play, RotateCcw, SkipForward, Undo2 } from 'lucide-react';
import type { DemoMode, Role, ScenarioId } from '@/domain/types';
import { formatDate, formatDateTime, formatTime } from '@/domain/calendar';
import { useDemo, usePlayer } from '@/state/store';
import { selectClinicOpen } from '@/state/selectors';
import { SynaptixSymbol } from '@/components/icons/channels';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import { Dot } from '@/components/ui/badge';

export function PresenterBar() {
  const { state, dispatch } = useDemo();
  const player = usePlayer();
  const open = selectClinicOpen(state);
  const total = player.scenario?.steps.length ?? 0;
  const done = player.stepIndex;
  const guided = state.mode === 'guided';

  const stepText = (() => {
    if (!player.scenario) return guided ? 'Select a scenario to begin' : 'Explore mode · free interaction';
    if (!guided) return `Explore mode · scenario paused at step ${done} of ${total}`;
    if (player.status === 'complete') return `Complete · ${total} of ${total}`;
    const step = player.nextStep;
    return step ? `Step ${done + 1} of ${total} · ${step.title}` : `Step ${done} of ${total}`;
  })();

  return (
    <header className="presenter" data-testid="presenter-bar">
      <div className="presenter__left">
        <div className="presenter__brand">
          <SynaptixSymbol size={18} />
          <span className="presenter__wordmark">Synaptix</span>
        </div>
        <span className="presenter__account">Midam Clinic</span>
      </div>

      <div className="presenter__center">
        <Tabs value={state.mode} onValueChange={(v) => player.setMode(v as DemoMode)} onInk data-testid="mode-toggle">
          <TabsList aria-label="Demo mode">
            <TabsTrigger value="guided">Guided</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={player.scenario?.id ?? ''} onValueChange={(id) => player.start(id as ScenarioId)}>
          <SelectTrigger onInk aria-label="Scenario" data-testid="scenario-select" style={{ width: 176 }}>
            <SelectValue placeholder="Choose a scenario" />
          </SelectTrigger>
          <SelectContent>
            {player.scenarios.map((s, i) => (
              <SelectItem key={s.id} value={s.id} description={s.summary}>
                {i + 1}. {s.title}
                {s.optional ? ' (optional)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="presenter__group">
          {player.status === 'playing' ? (
            <Tooltip content="Pause">
              <Button variant="on-ink" size="sm" icon aria-label="Pause" data-testid="btn-pause" onClick={player.pause}>
                <Pause />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip content="Play">
              <Button variant="on-ink" size="sm" icon aria-label="Play" data-testid="btn-play" onClick={player.play} disabled={!player.scenario || player.status === 'complete'}>
                <Play />
              </Button>
            </Tooltip>
          )}
          <Tooltip content="Next step">
            <Button variant="on-ink" size="sm" icon aria-label="Next step" data-testid="btn-next" onClick={player.next} disabled={!player.scenario || player.status === 'complete'}>
              <SkipForward />
            </Button>
          </Tooltip>
          <Tooltip content="Restart scenario">
            <Button variant="on-ink" size="sm" icon aria-label="Restart scenario" data-testid="btn-restart" onClick={player.restart} disabled={!player.scenario}>
              <RotateCcw />
            </Button>
          </Tooltip>
          <Tooltip content="Reset all demo data">
            <Button variant="on-ink" size="sm" aria-label="Reset all" data-testid="btn-reset" onClick={player.resetAll}>
              <Undo2 />
              <span className="presenter__reset-text">Reset all</span>
            </Button>
          </Tooltip>
        </div>

        <span className="presenter__divider" aria-hidden="true" />

        <div className="presenter__step" aria-live="polite">
          <span className="presenter__step-label" data-testid="step-label" title={stepText}>
            {player.scenario && player.status !== 'complete' ? (
              <>
                <strong>
                  Step {Math.min(done + 1, total)} of {total}
                </strong>
                {player.nextStep ? ` · ${player.nextStep.title}` : ''}
              </>
            ) : (
              stepText
            )}
          </span>
          {total > 0 ? (
            <span className="presenter__progress" aria-hidden="true">
              {Array.from({ length: total }, (_, i) => (
                <i key={i} className={i < done ? 'is-done' : undefined} />
              ))}
            </span>
          ) : null}
        </div>
      </div>

      <div className="presenter__right">
        <div className="presenter__stack" title={`Clinic time (Asia/Seoul) · ${formatDateTime(state.clock)} · ${open ? 'Open' : 'Closed'}`}>
          <span className="presenter__stack-label">Clinic time</span>
          <span className="presenter__clock" data-testid="clock-label">
            <Dot tone={open ? 'mint' : 'neutral'} />
            <span className="presenter__clock-text">
              <strong>
                {formatDate(state.clock)} {formatTime(state.clock)}
              </strong>{' '}
              · {open ? 'Open' : 'Closed'}
            </span>
          </span>
        </div>

        <span className="presenter__divider" aria-hidden="true" />

        <div className="presenter__stack presenter__role">
          <span className="presenter__stack-label">Simulated role</span>
          <Tabs value={state.role} onValueChange={(v) => dispatch({ type: 'SET_ROLE', role: v as Role })} onInk data-testid="role-switch">
            <TabsList aria-label="Simulated role">
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="manager">Manager</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <span className="demo-chip" data-testid="demo-chip" title="Every integration in this demo (channels, CRM, assistant) is simulated in-process.">
          <Dot tone="mint" />
          <span>
            Demo<span className="demo-chip__more"> · simulated integrations</span>
          </span>
        </span>
      </div>
    </header>
  );
}
