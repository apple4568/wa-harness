import { test, expect, type Page } from '@playwright/test';
import { gotoDemo, playToEnd, row, state } from '../helpers/demo';

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1100, height: 800 },
  { width: 900, height: 700 },
];

async function overflow(page: Page) {
  return page.evaluate(() => ({
    doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
}

/** Accessible-name approximation for every <button> currently in the DOM. */
async function unnamedButtons(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const text = (el: Element | null) => (el ? (el as HTMLElement).innerText?.trim() || el.textContent?.trim() || '' : '');
    const out: string[] = [];
    for (const btn of Array.from(document.querySelectorAll('button'))) {
      const labelledBy = btn.getAttribute('aria-labelledby');
      const byId = labelledBy ? labelledBy.split(/\s+/).map((id) => text(document.getElementById(id))).join(' ').trim() : '';
      const forLabel = btn.id ? text(document.querySelector(`label[for="${CSS.escape(btn.id)}"]`)) : '';
      const wrapping = text(btn.closest('label'));
      const name = btn.getAttribute('aria-label')?.trim() || byId || text(btn) || btn.getAttribute('title')?.trim() || forLabel || wrapping;
      if (!name) out.push(btn.outerHTML.slice(0, 160));
    }
    return out;
  });
}

test.describe('responsive layout', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.width}×${vp.height}: no horizontal scroll, list + workspace visible, booking panel opens`, async ({ page }) => {
      await page.setViewportSize(vp);
      await gotoDemo(page, { mode: 'explore' });
      expect(await overflow(page)).toEqual({ doc: 0, body: 0 });
      await expect(page.locator('section.list')).toBeVisible();
      await expect(page.getByTestId('workspace')).toBeVisible();
      await expect(page.getByTestId('presenter-bar')).toBeVisible();
      await expect(page.getByTestId('demo-chip')).toBeVisible();

      await row(page, 'conv-wa-emily').click();
      await expect(page.locator('.thread-header')).toBeVisible();
      await expect(page.getByTestId('composer')).toBeVisible();
      await page.getByTestId('btn-booking-panel').click();
      const panel = page.getByTestId('booking-panel');
      await expect(panel).toBeVisible();
      await expect(panel.getByTestId('appointment')).toBeVisible();
      await expect(page.getByTestId('message-list')).toBeVisible();
      expect(await overflow(page)).toEqual({ doc: 0, body: 0 });

      // The panel and the list must both fit inside the viewport (poll: the panel slides in over 160 ms).
      await expect.poll(async () => {
        const box = await panel.boundingBox();
        return box ? box.x + box.width : Number.POSITIVE_INFINITY;
      }).toBeLessThanOrEqual(vp.width + 0.5);
      const list = await page.locator('section.list').boundingBox();
      expect(list!.width).toBeGreaterThan(200);

      // Knowledge and settings views fit as well.
      await page.getByTestId('nav-knowledge').click();
      await expect(page.getByTestId('knowledge-view')).toBeVisible();
      expect(await overflow(page)).toEqual({ doc: 0, body: 0 });
      await page.getByTestId('nav-settings').click();
      await expect(page.getByTestId('settings-view')).toBeVisible();
      expect(await overflow(page)).toEqual({ doc: 0, body: 0 });
    });
  }
});

test.describe('reduced motion', () => {
  test('scenario 1 completes and takeover works with prefers-reduced-motion: reduce', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoDemo(page, { scenario: 'inquiry-to-booking' });
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    await playToEnd(page);
    await expect(page.locator('[data-message-id="m-misaki-09"]').getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');
    await expect(page.locator('[data-testid="message"]')).toHaveCount(9);
    await page.getByTestId('btn-booking-panel').click();
    await expect(page.getByTestId('booking-panel')).toBeVisible();
    await expect(page.getByTestId('booking-stage')).toHaveAttribute('data-stage', 'confirmation_sent');

    await page.getByTestId('btn-take-over').click();
    await expect(page.getByTestId('banner-human')).toBeVisible();
    await expect(page.getByTestId('composer-input')).toBeVisible();
    await expect.poll(() => state(page).then((s) => s.conversations['conv-ig-misaki'].ownership)).toBe('human');
    await page.getByTestId('composer-input').fill('Hello from the front desk');
    await page.getByTestId('btn-send').click();
    await expect(page.locator('[data-testid="message"][data-author="staff"]').last().getByTestId('delivery-state')).toHaveAttribute('data-delivery', 'delivered');
    await page.getByTestId('btn-return-ai').click();
    await expect.poll(() => state(page).then((s) => s.conversations['conv-ig-misaki'].ownership)).toBe('ai');
  });
});

test.describe('keyboard & accessible names', () => {
  test('Tab reaches search, filters, the conversation list and Take over', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await row(page, 'conv-wa-daniel').click();
    await expect(page.getByTestId('btn-take-over')).toBeVisible();
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

    const reached: string[] = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return '(body)';
        return el.dataset.testid || el.getAttribute('aria-label') || el.getAttribute('role') || el.tagName.toLowerCase();
      });
      reached.push(id);
      if (id === 'btn-take-over') break;
    }
    expect(reached, `tab order: ${reached.join(' → ')}`).toEqual(expect.arrayContaining(['search-input', 'filter-all', 'filter-instagram', 'filter-needs-human', 'Conversation list', 'btn-take-over']));
    expect(reached.indexOf('search-input')).toBeLessThan(reached.indexOf('filter-all'));
    expect(reached.indexOf('filter-needs-human')).toBeLessThan(reached.indexOf('Conversation list'));
    expect(reached.indexOf('Conversation list')).toBeLessThan(reached.indexOf('btn-take-over'));

    // Keyboard activation of Take over.
    await page.keyboard.press('Enter');
    await expect.poll(() => state(page).then((s) => s.conversations['conv-wa-daniel'].ownership)).toBe('human');
  });

  test('every button has an accessible name (inbox, booking panel, knowledge, settings)', async ({ page }) => {
    await gotoDemo(page, { mode: 'explore' });
    await row(page, 'conv-wa-daniel').click();
    await page.getByTestId('btn-booking-panel').click();
    await expect(page.getByTestId('booking-panel')).toBeVisible();
    expect(await unnamedButtons(page)).toEqual([]);

    await page.getByTestId('btn-take-over').click();
    await expect(page.getByTestId('composer-input')).toBeVisible();
    expect(await unnamedButtons(page)).toEqual([]);

    await page.getByTestId('notifications-button').click();
    await expect(page.getByTestId('notification-item').first()).toBeVisible();
    expect(await unnamedButtons(page)).toEqual([]);
    await page.keyboard.press('Escape');

    await page.getByTestId('nav-knowledge').click();
    await expect(page.getByTestId('knowledge-view')).toBeVisible();
    expect(await unnamedButtons(page)).toEqual([]);
    await page.getByTestId('role-switch').getByRole('tab', { name: 'Manager' }).click();
    await expect(page.getByTestId('btn-approve').first()).toBeVisible();
    expect(await unnamedButtons(page)).toEqual([]);

    await page.getByTestId('nav-settings').click();
    await expect(page.getByTestId('settings-view')).toBeVisible();
    expect(await unnamedButtons(page)).toEqual([]);
  });
});
