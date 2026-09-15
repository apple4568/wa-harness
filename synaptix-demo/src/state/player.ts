/**
 * Scenario player: owns every guided-playback timer. The reducer only tracks
 * position/status (`state.guided`); this hook decides *when* to apply the next step.
 *
 * Timer safety: every scheduled callback captures `guided.runId` (and the step index)
 * at scheduling time and re-reads the latest state through a ref before acting. Any
 * reset / scenario switch / mode switch bumps runId, which makes stale callbacks no-ops.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { DemoAction, DemoMode, DemoState, PlaybackStatus, Scenario, ScenarioId, ScenarioStep } from '@/domain/types';
import { SCENARIOS, SCENARIO_LIST } from '@/scenarios';

export type PlaybackSpeed = 'normal' | 'instant';

export const DEFAULT_STEP_DELAY_MS = 900;

/** Scales a scripted delay for the requested playback speed. */
export function scaleDelay(ms: number, speed: PlaybackSpeed): number {
  if (speed === 'instant') return Math.min(5, Math.max(0, ms));
  return Math.max(0, ms);
}

export interface Player {
  scenarios: Scenario[];
  scenario: Scenario | null;
  stepIndex: number;
  /** The step that will be applied next (undefined when complete / no scenario). */
  nextStep: ScenarioStep | undefined;
  /** The step applied most recently (undefined before the first step). */
  lastStep: ScenarioStep | undefined;
  status: PlaybackStatus;
  start: (id: ScenarioId) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  restart: () => void;
  setMode: (mode: DemoMode) => void;
  resetAll: () => void;
}

export function scenarioById(id: ScenarioId | null | undefined): Scenario | null {
  if (!id) return null;
  return (SCENARIOS as Record<string, Scenario | undefined>)[id] ?? null;
}

export function usePlayerController(
  state: DemoState,
  dispatch: (action: DemoAction) => void,
  speed: PlaybackSpeed = 'normal',
): Player {
  // Latest committed state/speed for timer callbacks and handlers (synced before any effect runs).
  const stateRef = useRef(state);
  const speedRef = useRef(speed);
  useLayoutEffect(() => {
    stateRef.current = state;
    speedRef.current = speed;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Guards `next()` against applying the same step twice before React re-renders. */
  const appliedRef = useRef<{ runId: number; stepIndex: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const applyStep = useCallback(
    (scenario: Scenario, stepIndex: number, runId: number) => {
      const step = scenario.steps[stepIndex];
      if (!step) return;
      const already = appliedRef.current;
      if (already && already.runId === runId && already.stepIndex === stepIndex) return;
      appliedRef.current = { runId, stepIndex };
      for (const action of step.actions) dispatch(action);
      dispatch({ type: 'STEP_APPLIED', stepId: step.id, pauseAfter: !!step.pauseAfter, isLast: stepIndex === scenario.steps.length - 1 });
    },
    [dispatch],
  );

  const schedule = useCallback(() => {
    clearTimer();
    const s = stateRef.current;
    const { runId, stepIndex, status } = s.guided;
    const scenario = scenarioById(s.guided.scenarioId);
    if (!scenario || status !== 'playing') return;
    const step = scenario.steps[stepIndex];
    if (!step) return;
    const delay = scaleDelay(step.delayMs ?? DEFAULT_STEP_DELAY_MS, speedRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const cur = stateRef.current.guided;
      if (cur.runId !== runId || cur.status !== 'playing' || cur.stepIndex !== stepIndex || cur.scenarioId !== scenario.id) return;
      applyStep(scenario, stepIndex, runId);
    }, delay);
  }, [applyStep, clearTimer]);

  const { status, stepIndex, runId, scenarioId } = state.guided;

  // Schedule whenever playback is (or becomes) 'playing' at a new position; the cleanup
  // clears the pending timer when anything about the position changes.
  useEffect(() => {
    if (status === 'playing') schedule();
    return clearTimer;
  }, [status, stepIndex, runId, scenarioId, schedule, clearTimer]);

  // Clear on unmount.
  useEffect(() => clearTimer, [clearTimer]);

  const runSetup = useCallback(
    (scenario: Scenario) => {
      for (const action of scenario.setup) dispatch(action);
    },
    [dispatch],
  );

  const start = useCallback(
    (id: ScenarioId) => {
      clearTimer();
      const scenario = scenarioById(id);
      if (!scenario) return;
      appliedRef.current = null;
      dispatch({ type: 'RESET_ALL' });
      dispatch({ type: 'START_SCENARIO', scenarioId: id });
      runSetup(scenario);
    },
    [clearTimer, dispatch, runSetup],
  );

  const play = useCallback(() => {
    const g = stateRef.current.guided;
    if (!g.scenarioId || g.status === 'complete') return;
    dispatch({ type: 'PLAY' });
  }, [dispatch]);

  const pause = useCallback(() => {
    clearTimer();
    dispatch({ type: 'PAUSE' });
  }, [clearTimer, dispatch]);

  const next = useCallback(() => {
    clearTimer();
    const s = stateRef.current;
    const scenario = scenarioById(s.guided.scenarioId);
    if (!scenario || s.guided.status === 'complete') return;
    // If playing, the effect re-schedules the following step once stepIndex changes.
    applyStep(scenario, s.guided.stepIndex, s.guided.runId);
  }, [applyStep, clearTimer]);

  const restart = useCallback(() => {
    clearTimer();
    const scenario = scenarioById(stateRef.current.guided.scenarioId);
    if (!scenario) return;
    appliedRef.current = null;
    dispatch({ type: 'RESTART_SCENARIO' });
    runSetup(scenario);
  }, [clearTimer, dispatch, runSetup]);

  const setMode = useCallback(
    (mode: DemoMode) => {
      clearTimer();
      dispatch({ type: 'SET_MODE', mode });
    },
    [clearTimer, dispatch],
  );

  const resetAll = useCallback(() => {
    clearTimer();
    appliedRef.current = null;
    dispatch({ type: 'RESET_ALL' });
  }, [clearTimer, dispatch]);

  const scenario = scenarioById(scenarioId);

  return useMemo<Player>(
    () => ({
      scenarios: SCENARIO_LIST,
      scenario,
      stepIndex,
      nextStep: scenario?.steps[stepIndex],
      lastStep: stepIndex > 0 ? scenario?.steps[stepIndex - 1] : undefined,
      status,
      start,
      play,
      pause,
      next,
      restart,
      setMode,
      resetAll,
    }),
    [scenario, stepIndex, status, start, play, pause, next, restart, setMode, resetAll],
  );
}
