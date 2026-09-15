/**
 * Browser test hooks. `DemoProvider` installs `window.__synaptix` so E2E tests (and the
 * presenter, in a pinch) can read state, dispatch actions and drive the scenario player.
 */
import type { DemoAction, DemoState } from '@/domain/types';
import type { Player } from './player';

export interface SynaptixTestHooks {
  getState: () => DemoState;
  dispatch: (action: DemoAction) => void;
  player: Player;
}

declare global {
  interface Window {
    __synaptix?: SynaptixTestHooks;
  }
}

export function installTestHooks(hooks: SynaptixTestHooks): void {
  if (typeof window === 'undefined') return;
  window.__synaptix = hooks;
}

export {};
