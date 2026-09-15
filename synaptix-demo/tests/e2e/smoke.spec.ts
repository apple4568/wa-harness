import { test, expect } from '@playwright/test';
import { BASE_URL, brokenImages, collectConsoleErrors, expectNoExternalRequests, gotoDemo, playToEnd, state } from '../helpers/demo';

const FONT_FAMILIES = ['IBM Plex Sans KR', 'Noto Sans JP', 'Noto Sans SC', 'IBM Plex Mono'] as const;

/**
 * `document.fonts.check` per family after `fonts.ready`, plus whether at least one face of that
 * family finished loading. The @fontsource packages split every family into unicode-range subsets
 * that load lazily, so `check()` for the default text (a space) can be false even while the family
 * is rendering CJK text; `fonts.load()` first fetches the Latin subset from the dev server, which
 * fails if the font files are not bundled locally (see the offline test).
 */
async function fontReport(page: Parameters<typeof state>[0]) {
  return page.evaluate(async (families) => {
    await document.fonts.ready;
    const out: Array<{ family: string; check: boolean; loaded: boolean }> = [];
    for (const family of families) {
      await document.fonts.load(`14px "${family}"`);
      let loaded = false;
      document.fonts.forEach((face) => {
        if (face.status === 'loaded' && face.family.replace(/^["']|["']$/g, '') === family) loaded = true;
      });
      out.push({ family, check: document.fonts.check(`14px "${family}"`), loaded });
    }
    return out;
  }, FONT_FAMILIES);
}

test.describe('smoke', () => {
  test('loads the shell: presenter bar, demo chip, navigation and 8 seeded conversations', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const net = expectNoExternalRequests(page);

    await gotoDemo(page);

    await expect(page.getByTestId('presenter-bar')).toBeVisible();
    const chip = page.getByTestId('demo-chip');
    await expect(chip).toBeVisible();
    await expect(chip).toHaveText(/Demo\s*·\s*simulated integrations/);

    for (const view of ['inbox', 'knowledge', 'settings']) {
      await expect(page.getByTestId(`nav-${view}`)).toBeVisible();
    }
    await expect(page.getByTestId('nav-inbox')).toHaveAttribute('aria-current', 'page');

    await expect(page.getByTestId('conversation-row')).toHaveCount(8);
    const s = await state(page);
    expect(Object.keys(s.conversations)).toHaveLength(8);
    expect(s.conversations['conv-ig-misaki']).toBeUndefined();
    expect(s.clock).toBe('2026-09-15T10:20:00');

    await expect(page.getByTestId('clock-label')).toHaveText(/Tue 15 Sep 10:20\s*·\s*Open/);

    errors.assertNone();
    net.assertNone();
  });

  test('bundled fonts are loaded and every image decodes after scenarios 1 and 5', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const net = expectNoExternalRequests(page);

    await gotoDemo(page, { scenario: 'inquiry-to-booking' });
    await playToEnd(page);
    await expect(page.locator('[data-message-id="m-misaki-03"] img')).toHaveAttribute('src', '/photos/reception.svg');
    expect(await brokenImages(page), 'images that failed to decode after scenario 1').toEqual([]);

    const fonts = await fontReport(page);
    for (const f of fonts) {
      expect(f.check, `document.fonts.check for ${f.family}`).toBe(true);
      expect(f.loaded, `a loaded FontFace for ${f.family}`).toBe(true);
    }

    // Scenario 5 renders the knowledge library (all photo items) and a new photo message.
    await page.evaluate(() => window.__synaptix!.player.start('manager-approved-photo'));
    await expect.poll(() => state(page).then((s) => s.guided.scenarioId)).toBe('manager-approved-photo');
    await playToEnd(page);
    await expect(page.locator('[data-testid="knowledge-item"][data-knowledge-id="ph-recovery-lounge"] img')).toBeVisible();
    expect(await brokenImages(page), 'images that failed to decode after scenario 5').toEqual([]);

    // Back in the inbox: the photo Sophie received still renders.
    await page.getByTestId('nav-inbox').click();
    await expect(page.locator('[data-message-id="m-sophie-05"] img')).toHaveAttribute('src', '/photos/recovery-lounge.svg');
    expect(await brokenImages(page)).toEqual([]);

    errors.assertNone();
    net.assertNone();
  });

  test('offline: only dev-server requests are needed — nothing outside 127.0.0.1:5173 is ever requested', async ({ page }) => {
    const aborted: string[] = [];
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(BASE_URL)) return route.continue();
      aborted.push(url);
      return route.abort();
    });
    const errors = collectConsoleErrors(page);

    await gotoDemo(page, { scenario: 'inquiry-to-booking' });
    await playToEnd(page);

    await expect(page.getByTestId('booking-card')).toHaveAttribute('data-reference', 'MD-24817');
    expect(await brokenImages(page)).toEqual([]);
    const fonts = await fontReport(page);
    for (const f of fonts) expect(f.check && f.loaded, `${f.family} available offline`).toBe(true);

    expect(aborted, 'requests that would have left the machine').toEqual([]);
    errors.assertNone();
  });
});
