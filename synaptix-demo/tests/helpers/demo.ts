/**
 * Shared helpers for the browser (e2e) tests.
 *
 * Every test loads the app with `?speed=instant` unless it explicitly needs scripted
 * delays (presenter Play/Pause tests, the recording). State assertions go through the
 * `window.__synaptix` test hooks installed by `DemoProvider`.
 */
import { expect, type Page, type Request } from '@playwright/test';
import type { DemoAction, DemoMode, DemoState, ScenarioId } from '@/domain/types';
import type { PlaybackStatus } from '@/domain/types';
// Pull in the global `Window.__synaptix` declaration (type-only import; nothing runs).
import type {} from '@/state/testHooks';

export const BASE_URL = 'http://127.0.0.1:5173';

export interface GotoOptions {
  scenario?: ScenarioId;
  mode?: DemoMode;
  /** 'instant' (default) removes scripted delays; 'normal' keeps them. */
  speed?: 'instant' | 'normal';
}

/** Builds the demo URL for the given options. */
export function demoUrl({ scenario, mode, speed = 'instant' }: GotoOptions = {}): string {
  const params = new URLSearchParams();
  if (speed === 'instant') params.set('speed', 'instant');
  if (scenario) params.set('scenario', scenario);
  if (mode) params.set('mode', mode);
  const qs = params.toString();
  return `/${qs ? `?${qs}` : ''}`;
}

/**
 * Navigates to the demo and waits until the test hooks are installed and the URL
 * options (scenario / mode) have been applied.
 */
export async function gotoDemo(page: Page, options: GotoOptions = {}): Promise<void> {
  await page.goto(demoUrl(options));
  await page.waitForFunction(() => !!window.__synaptix);
  if (options.scenario) {
    const id = options.scenario;
    await page.waitForFunction((sid) => window.__synaptix?.getState().guided.scenarioId === sid, id);
  }
  if (options.mode) {
    const mode = options.mode;
    await page.waitForFunction((m) => window.__synaptix?.getState().mode === m, mode);
  }
  await expect(page.getByTestId('presenter-bar')).toBeVisible();
}

/** Latest committed DemoState (structured-cloned across the bridge). */
export async function state(page: Page): Promise<DemoState> {
  return page.evaluate(() => window.__synaptix!.getState());
}

/** Dispatches an action through the store. Re-render happens asynchronously; poll afterwards. */
export async function dispatch(page: Page, action: DemoAction): Promise<void> {
  await page.evaluate((a) => window.__synaptix!.dispatch(a), action);
}

export async function playerStatus(page: Page): Promise<PlaybackStatus> {
  return page.evaluate(() => window.__synaptix!.getState().guided.status);
}

export async function stepIndex(page: Page): Promise<number> {
  return page.evaluate(() => window.__synaptix!.getState().guided.stepIndex);
}

/** Applies the next scenario step and waits for the reducer to record it. */
export async function playerNext(page: Page): Promise<void> {
  const before = await stepIndex(page);
  await page.evaluate(() => window.__synaptix!.player.next());
  await expect.poll(() => stepIndex(page), { message: 'stepIndex should advance after next()' }).toBe(before + 1);
}

/** Calls `player.play()` (no waiting — combine with expect.poll). */
export async function playerPlay(page: Page): Promise<void> {
  await page.evaluate(() => window.__synaptix!.player.play());
}

export async function playerPause(page: Page): Promise<void> {
  await page.evaluate(() => window.__synaptix!.player.pause());
}

/** Applies steps until the scenario is complete (or the cap is hit — which fails the test). */
export async function playToEnd(page: Page, cap = 80): Promise<void> {
  for (let i = 0; i < cap; i++) {
    if ((await playerStatus(page)) === 'complete') return;
    await playerNext(page);
  }
  expect((await playerStatus(page)), `scenario did not complete within ${cap} steps`).toBe('complete');
}

/** Applies steps until the step with `stepId` has just been applied (lastStep.id === stepId). */
export async function playUntilStep(page: Page, stepId: string, cap = 80): Promise<void> {
  for (let i = 0; i < cap; i++) {
    const applied = await page.evaluate(() => window.__synaptix!.player.lastStep?.id ?? null);
    if (applied === stepId) return;
    if ((await playerStatus(page)) === 'complete') break;
    await playerNext(page);
  }
  const last = await page.evaluate(() => window.__synaptix!.player.lastStep?.id ?? null);
  expect(last, `step "${stepId}" was never reached`).toBe(stepId);
}

/** Steps until the player pauses after `stepId` (i.e. the pause point of that step). Same as playUntilStep. */
export const playToPause = playUntilStep;

/** Ids of the steps of the active scenario, in order. */
export async function scenarioStepIds(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__synaptix!.player.scenario?.steps.map((s) => s.id) ?? []);
}

/* ---------------------------------------------------------------------- */
/* Network / console guards                                                */
/* ---------------------------------------------------------------------- */

export interface ExternalRequestGuard {
  /** URLs of requests that did not target the local dev server. */
  external: string[];
  /** Fails the test if any external request was observed. */
  assertNone: () => void;
}

/**
 * Records every request the page makes and asserts that they all target the dev server.
 * Attach BEFORE navigating.
 */
export function expectNoExternalRequests(page: Page, base = BASE_URL): ExternalRequestGuard {
  const external: string[] = [];
  const onRequest = (req: Request) => {
    const url = req.url();
    if (!url.startsWith(base)) external.push(url);
  };
  page.on('request', onRequest);
  return {
    external,
    assertNone: () => {
      expect(external, `external requests observed:\n${external.join('\n')}`).toEqual([]);
    },
  };
}

export interface ConsoleErrorGuard {
  errors: string[];
  /** Fails the test if any console.error / pageerror was observed. Nothing is filtered. */
  assertNone: () => void;
}

/** Collects `console.error` output and uncaught page errors. Attach BEFORE navigating. */
export function collectConsoleErrors(page: Page): ConsoleErrorGuard {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    errors.push(`pageerror: ${err.message}`);
  });
  return {
    errors,
    assertNone: () => {
      expect(errors, `console errors observed:\n${errors.join('\n')}`).toEqual([]);
    },
  };
}

/* ---------------------------------------------------------------------- */
/* Small UI conveniences                                                    */
/* ---------------------------------------------------------------------- */

export const row = (page: Page, conversationId: string) => page.locator(`[data-testid="conversation-row"][data-conversation-id="${conversationId}"]`);

export const workspace = (page: Page) => page.getByTestId('workspace');

export async function openBookingPanel(page: Page): Promise<void> {
  const panel = page.getByTestId('booking-panel');
  if (await panel.count()) return;
  await page.getByTestId('btn-booking-panel').click();
  await expect(panel).toBeVisible();
}

/** Every `<img>` on the page decoded with a real width. */
export async function brokenImages(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
      ),
    );
    return imgs.filter((img) => !(img.naturalWidth > 0)).map((img) => img.getAttribute('src') ?? '(no src)');
  });
}

/** Stable projection of the state used to compare "reset" results against the seed. */
export function seedProjection(s: DemoState) {
  return {
    clock: s.clock,
    role: s.role,
    view: s.view,
    selected: s.selectedConversationId,
    conversationIds: Object.keys(s.conversations).sort(),
    messageCounts: Object.fromEntries(Object.keys(s.messageOrder).sort().map((id) => [id, s.messageOrder[id].length])),
    knowledgeStates: Object.fromEntries(s.knowledgeOrder.map((id) => [id, s.knowledge[id]?.state])),
    appointments: Object.values(s.crm.appointments).map((a) => ({ id: a.id, reference: a.reference, slotId: a.slotId, status: a.status })),
    requests: Object.keys(s.crm.requests).sort(),
    nextReferenceNumber: s.crm.nextReferenceNumber,
    notifications: s.notifications.map((n) => ({ id: n.id, read: n.read })),
    ownership: Object.fromEntries(Object.values(s.conversations).map((c) => [c.id, c.ownership])),
    aiPaused: s.settings.aiPaused,
  };
}

/** A minimal 1×1 white PNG for upload tests. */
export const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
