// Regenerates the app screenshots shown on the landing page (public/landing/*.png).
// Usage: start the dev server (npm run dev), then run: npm run screenshots
// Optional: BASE_URL=http://localhost:3000 npm run screenshots
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = 'public/landing';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
// Tall viewport so every panel is on screen (the app scrolls inside .main-content, not the page).
const page = await browser.newPage({ viewport: { width: 1280, height: 1700 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));

const open = async (query) => {
  await page.goto(`${BASE}/algorithm?${query}`);
  await page.waitForSelector('.stage, .practice');
  await page.waitForTimeout(400);
};
const click = (name) => page.getByRole('button', { name, exact: typeof name === 'string' }).first().click();
const seek = async (fraction) => {
  const scrubber = page.locator('.playback__scrubber input');
  const max = Number(await scrubber.getAttribute('max'));
  await scrubber.fill(String(Math.floor(max * fraction)));
  await page.waitForTimeout(250);
};
// Step through watch mode until the status message matches (e.g. a "Comparing" step).
const seekToMessage = async (pattern, fromFraction) => {
  const scrubber = page.locator('.playback__scrubber input');
  const max = Number(await scrubber.getAttribute('max'));
  for (let i = Math.floor(max * fromFraction); i <= max; i++) {
    await scrubber.fill(String(i));
    if (pattern.test(await page.locator('.status-pill').first().textContent())) break;
  }
  await page.waitForTimeout(250);
};
const barValues = () => page.locator('.practice .bar-value').allTextContents().then(v => v.map(Number));

// Screenshot the union of the given elements, capped at maxHeight, with a small margin.
const capture = async (file, selectors, { maxHeight = 900, pad = 12 } = {}) => {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  const boxes = [];
  for (const s of selectors) {
    const loc = page.locator(s).first();
    if (await loc.count()) boxes.push(await loc.boundingBox());
  }
  const x = Math.min(...boxes.map(b => b.x)) - pad;
  const y = Math.min(...boxes.map(b => b.y)) - pad;
  const right = Math.max(...boxes.map(b => b.x + b.width)) + pad;
  const bottom = Math.max(...boxes.map(b => b.y + b.height)) + pad;
  await page.screenshot({ path: `${OUT}/${file}.png`, clip: { x, y, width: right - x, height: Math.min(bottom - y, maxHeight) } });
  console.log('saved', file);
};

// --- How it works ------------------------------------------------------------
await open('algo=quickSort');
await seekToMessage(/compar/i, 0.3);
await capture('step-watch', ['.stage', '.playback']);

await open('algo=bubbleSort&mode=practice');
await click(/^Hint$/);
await click(/^Show where$/);
await capture('step-practice', ['.practice'], { maxHeight: 700 });

await open('algo=bubbleSort');
await page.locator('.custom-array-input').fill('42, 17, 93, 8, 61, 25, 70, 34');
await page.locator('.btn-use-this').click();
await click(/practice it yourself/i);
await click(/^Check$/); // pressing Check without swapping is one honest mistake
for (let pass = 0; pass < 10 && !(await page.locator('.practice-summary').count()); pass++) {
  const values = await barValues();
  const target = [...values];
  for (let j = 0; j < target.length - 1 - pass; j++) if (target[j] > target[j + 1]) [target[j], target[j + 1]] = [target[j + 1], target[j]];
  const work = [...values];
  for (let i = 0; i < work.length; i++) {
    if (work[i] === target[i]) continue;
    const j = work.findIndex((v, k) => k > i && v === target[i]);
    await page.locator('.practice .bar-slot').nth(i).click();
    await page.locator('.practice .bar-slot').nth(j).click();
    [work[i], work[j]] = [work[j], work[i]];
  }
  await click(/^Check$/);
}
await capture('step-check', ['.practice'], { maxHeight: 700 });

// --- Topics (watch mode, mid-run) ---------------------------------------------
await open('algo=mergeSort');
await seek(0.55);
await capture('topic-sorting', ['.stage']);

await open('algo=astar');
await click(/random walls/i);
await page.waitForTimeout(400);
await seek(0.6);
await capture('topic-pathfinding', ['.stage']);

await open('algo=dijkstraGraph');
await seek(0.5);
await capture('topic-graph', ['.stage']);

await open('algo=nQueens');
await seek(0.35);
await capture('topic-backtracking', ['.stage']);

// --- Practice spotlight ---------------------------------------------------------
await open('algo=astar&mode=practice');
await click(/Skip 5/);
await click(/^Hint$/);
await capture('practice-astar', ['.practice'], { maxHeight: 820 });

await open('algo=dijkstraGraph&mode=practice');
const clickNode = (label) => page.locator('.practice .graph-node')
  .filter({ has: page.locator('.graph-node__label', { hasText: new RegExp(`^${label}$`) }) }).first().click();
for (let move = 0; move < 3; move++) {
  const rows = await page.locator('.practice tbody tr:not(.is-done)').evaluateAll(trs => trs.map(tr => [...tr.children].map(td => td.textContent.trim())));
  const open = rows.filter(r => r[1] !== '∞' && r[1] !== '').sort((a, b) => Number(a[1]) - Number(b[1]));
  await clickNode(open[0][0]);
  await page.waitForTimeout(150);
}
await click(/^Hint$/);
await click(/^Show where$/);
await capture('practice-dijkstra', ['.practice'], { maxHeight: 820 });

await open('algo=nQueens&mode=practice');
await page.getByRole('button', { name: 'row 0, column 0' }).click();
await page.getByRole('button', { name: 'row 1, column 1' }).click();
await capture('practice-queens', ['.practice'], { maxHeight: 820 });

if (errors.length) console.log('Page errors:', errors);
await browser.close();
