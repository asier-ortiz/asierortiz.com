import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// axe on every page the build publishes, as it loads and with its folded content open, plus the
// states only a click reaches. Only WCAG 2.0, 2.1 and 2.2 A/AA rules fail the run: axe's best
// practices are advice, not requirements. Automated rules catch only part of WCAG; keyboard,
// screen reader and motion checks stay manual.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const DIST = 'dist';
if (!existsSync(DIST)) {
  throw new Error('No dist/ to test: build the site first (npm run test:a11y).');
}

// One URL per built page, so new posts and tags are covered without listing them here.
const pages = readdirSync(DIST, { recursive: true })
  .map((file) => file.split(sep).join('/'))
  .filter((file) => file === 'index.html' || file.endsWith('/index.html'))
  .map((file) => '/' + file.slice(0, -'index.html'.length))
  .sort();
const html = (url) => readFileSync(join(DIST, url, 'index.html'), 'utf8');
const firstPageWith = (pattern) => pages.find((url) => pattern.test(html(url)));

// One entry per rule broken, with the elements, so a failure reads as a to-do list.
const report = (violations) =>
  violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help}. ${v.helpUrl}\n` +
      v.nodes.map((node) => `      ${node.target.join(' ')}`).join('\n')
  );

async function expectNoViolations(page, testInfo, state, { disableRules = [] } = {}) {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .disableRules(disableRules)
    .analyze();
  if (results.violations.length) {
    await testInfo.attach(`axe, ${state}`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
  }
  expect(report(results.violations), `WCAG A/AA rules broken, ${state}`).toEqual([]);
}

// Waits until nothing is half-way: AOS reveals (anime.js, so their opacity is the tell), CSS
// transitions such as a panel opening, and one-off CSS animations. Endless ones run on.
const settle = (page) =>
  page.waitForFunction(
    () =>
      [...document.querySelectorAll('[data-aos].aos-animate')].every(
        (el) => getComputedStyle(el).opacity === '1'
      ) &&
      document
        .getAnimations()
        .every(
          (a) => a.playState === 'finished' || a.effect?.getComputedTiming().iterations === Infinity
        )
  );

// AOS keeps content hidden until it scrolls into view: go down the page in half-screen steps
// (which also hydrates the client:visible islands), back to the top, then let it all settle.
async function reveal(page) {
  await page.evaluate(async () => {
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    for (let y = 0; y < root.scrollHeight; y += innerHeight / 2) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    scrollTo(0, 0);
    root.style.scrollBehavior = '';
  });
  await settle(page);
}

const urls = existsSync(join(DIST, '404.html')) ? [...pages, '/this-page-does-not-exist/'] : pages;

for (const url of urls) {
  test(url, async ({ page }, testInfo) => {
    await page.goto(url);
    await reveal(page);
    await expectNoViolations(page, testInfo, 'as loaded');

    // Folded content open: the <details> in posts.
    const details = await page.locator('details:not([open])').count();
    if (!details) return;
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    await settle(page);
    await expectNoViolations(page, testInfo, 'with folded content open');
  });
}

test('search with results, one picked by the arrows', async ({ page }, testInfo) => {
  await page.goto('/blog/');
  await page.getByRole('button', { name: /^Search posts/ }).click();
  const field = page.getByRole('combobox', { name: 'Search posts' });
  await field.fill('data');
  await field.press('ArrowDown');
  await expect(field).toHaveAttribute('aria-activedescendant', /.+/);
  await settle(page);
  // The results scroll on phones, and nothing in them takes focus: as in the APG combobox, the
  // arrows move aria-activedescendant and SearchModal.vue scrolls the picked row into view. axe
  // cannot see that, so this one rule stays off here; /blog/ itself is checked with it on.
  await expectNoViolations(page, testInfo, 'search open', {
    disableRules: ['scrollable-region-focusable'],
  });
});

test('mobile menu open', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'The menu button shows on small screens only.');
  await page.goto('/');
  const burger = page.locator('#mobile-nav__burger');
  await burger.click();
  await expect(burger).toHaveAttribute('aria-expanded', 'true');
  await settle(page);
  await expectNoViolations(page, testInfo, 'mobile menu open');
});

test('table of contents open', async ({ page }, testInfo) => {
  const post = firstPageWith(/id="?toc-toggle\b/);
  test.skip(testInfo.project.name !== 'desktop', 'The contents panel shows on large screens only.');
  test.skip(!post, 'No post has a table of contents.');
  await page.goto(post);
  const toggle = page.locator('#toc-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await settle(page);
  await expectNoViolations(page, testInfo, 'table of contents open');
});

test('figure viewer open', async ({ page }, testInfo) => {
  const post = firstPageWith(/data-zoomable/);
  test.skip(!post, 'No post has a zoomable figure.');
  await page.goto(post);
  await page.locator('.figure-viewer-trigger').first().click();
  await expect(page.getByRole('dialog', { name: 'Figure viewer' })).toBeVisible();
  await settle(page);
  await expectNoViolations(page, testInfo, 'figure viewer open');
});
