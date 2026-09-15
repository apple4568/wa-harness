/**
 * Store: `DemoProvider` (useReducer + scenario player + simulated services),
 * `useDemo()` and `usePlayer()`.
 *
 * URL parameters read once at mount:
 *   ?speed=instant     → player / service delays ~0 ms
 *   ?scenario=<id>     → start that scenario (paused) after mount
 *   ?mode=explore      → switch to explore mode after mount
 */
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { DemoAction, DemoState, Dispatch, ScenarioId } from '@/domain/types';
import { createInitialState } from '@/data/seed';
import { reducer } from './reducer';
import { usePlayerController, scenarioById, type Player, type PlaybackSpeed } from './player';
import { useSimulatedServices } from './services';
import { installTestHooks } from './testHooks';

export type { Player, PlaybackSpeed } from './player';

interface DemoContextValue {
  state: DemoState;
  dispatch: Dispatch;
}

const DemoContext = createContext<DemoContextValue | null>(null);
const PlayerContext = createContext<Player | null>(null);

export interface UrlOptions {
  speed?: PlaybackSpeed;
  scenario?: ScenarioId;
  mode?: 'guided' | 'explore';
}

/** Reads the demo's URL parameters; safe to call outside a browser (returns {}). */
export function readUrlOptions(search?: string): UrlOptions {
  try {
    const source = search ?? (typeof window !== 'undefined' ? window.location.search : '');
    const params = new URLSearchParams(source);
    const out: UrlOptions = {};
    if (params.get('speed') === 'instant') out.speed = 'instant';
    const scenario = params.get('scenario');
    if (scenario && scenarioById(scenario as ScenarioId)) out.scenario = scenario as ScenarioId;
    const mode = params.get('mode');
    if (mode === 'explore' || mode === 'guided') out.mode = mode;
    return out;
  } catch {
    return {};
  }
}

export interface DemoProviderProps {
  children: ReactNode;
  initialState?: DemoState;
  playbackSpeed?: PlaybackSpeed;
}

export function DemoProvider({ children, initialState, playbackSpeed }: DemoProviderProps) {
  const urlOptions = useMemo(() => readUrlOptions(), []);
  const speed: PlaybackSpeed = playbackSpeed ?? urlOptions.speed ?? 'normal';

  const [state, dispatch] = useReducer(reducer, initialState, (given) => given ?? createInitialState());
  const player = usePlayerController(state, dispatch, speed);
  useSimulatedServices(state, dispatch, speed);

  const stateRef = useRef(state);
  const playerRef = useRef(player);
  useLayoutEffect(() => {
    stateRef.current = state;
    playerRef.current = player;
  });

  // Test hooks — `getState` always reads the latest state; `player` is refreshed whenever it changes.
  useEffect(() => {
    installTestHooks({
      getState: () => stateRef.current,
      dispatch: (action: DemoAction) => dispatch(action),
      player,
    });
  }, [player]);

  // Apply URL options once after mount (guarded against StrictMode double effects).
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    if (urlOptions.mode === 'explore') dispatch({ type: 'SET_MODE', mode: 'explore' });
    if (urlOptions.scenario) playerRef.current.start(urlOptions.scenario);
  }, [urlOptions]);

  const demoValue = useMemo<DemoContextValue>(() => ({ state, dispatch }), [state]);

  return (
    <DemoContext.Provider value={demoValue}>
      <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>');
  return ctx;
}

export function usePlayer(): Player {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside <DemoProvider>');
  return ctx;
}
