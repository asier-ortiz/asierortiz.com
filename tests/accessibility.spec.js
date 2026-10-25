import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import loadConfig from 'tailwindcss/loadConfig.js';
import resolveConfig from 'tailwindcss/resolveConfig.js';

// axe on every page the build publishes, as it loads and with its folded content open, plus the
// states only a click reaches. Only WCAG 2.0, 2.1 and 2.2 A/AA rules fail the run: axe's best
// practices are advice, not requirements. Automated rules catch only part of WCAG; keyboard,
// screen reader and motion checks stay manual. The last test checks the accent's colour pairs
// in the Tailwind config, for the states axe never reaches.
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

// axe only measures the text it finds on the page, so it never sees hover, pressed or selected
// states, nor the 3:1 that icons and focus rings need (WCAG 1.4.11). Every accent use takes its
// colours from two entries in the Tailwind config, so the pairs are checked there instead; accent
// text, icons and rings on the lightest grey they sit on. A new kind of accent use adds its pair.
const ACCENT_PAIRS = [
  ['primary-content', 'primary-500', 4.5, 'accent fills: buttons, chips, search hits, copy button'],
  ['primary-content', 'primary-400', 4.5, 'the same fills, hovered or pressed'],
  ['primary-content', 'primary-300', 4.5, 'selected text'],
  ['primary-400', 'base-800', 4.5, 'accent text and links, as on tag chips and in diagrams'],
  ['primary-300', 'base-900', 4.5, 'current contents entry, hero highlight, text buttons'],
  ['primary-500', 'base-700', 3, "focus rings, the picked search row's ring"],
  ['primary-600', 'base-950', 3, 'social icons on hover, top of the gradient headings'],
];

// WCAG 2 contrast ratio between two hex colours.
function contrast(first, second) {
  const luminance = (hex) => {
    const six = /^#[0-9a-f]{3}$/i.test(hex) ? hex.replace(/[0-9a-f]/gi, '$&$&') : hex;
    const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(six);
    if (!channels) throw new Error(`Expected a hex colour, got ${hex}`);
    const [r, g, b] = channels.slice(1).map((c) => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

test('accent colours in every state', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Colours are the same at every width.');
  const colours = resolveConfig(loadConfig(resolve('tailwind.config.mjs'))).theme.colors;
  const hex = (name) => {
    const [, family, step] = /^(.+?)(?:-(\d+))?$/.exec(name);
    return step ? colours[family][step] : colours[family];
  };

  const failures = ACCENT_PAIRS.flatMap(([fg, bg, min, use]) => {
    const ratio = contrast(hex(fg), hex(bg));
    return ratio < min ? [`${fg} on ${bg} (${use}): ${ratio.toFixed(2)}:1, needs ${min}:1`] : [];
  });

  // The diagrams are images and cannot read the config: each one declares primary-400 itself.
  const accent = hex('primary-400');
  const diagrams = 'public/assets/blog';
  for (const file of readdirSync(diagrams).filter((name) => name.endsWith('.svg'))) {
    const svg = readFileSync(join(diagrams, file), 'utf8');
    const declared = /svg \{ color: (#[0-9a-f]{6}); \}/i.exec(svg)?.[1] ?? 'no accent';
    if (declared.toLowerCase() !== accent.toLowerCase()) {
      failures.push(`${file} declares ${declared}, primary-400 is ${accent}`);
    }
  }

  expect(failures, 'Accent pairs below their minimum, or a diagram out of step').toEqual([]);
});
