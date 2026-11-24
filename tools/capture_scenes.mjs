// Dev-only review of the living scene backdrop (D-496). Opens the game from the dev server on this
// machine's real GPU, shows each scene with its palette and saves stills, with and without the menus.
// Reports any scene that failed to compile. Touches no save and makes no game call.
//
//   node tools/capture_scenes.mjs --out <dir> [--url http://127.0.0.1:5173/LastLightGame/]
//        [--width 1280] [--height 720] [--scene <id>]... [--settle 1800] [--low] [--reduced] [--ui]
//
// --ui keeps the menus visible over the scene (default hides them to judge the scene alone).
// --low reports a 4-core device (low quality). --reduced turns on Reduce motion (one still frame).
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const opts = { url: 'http://127.0.0.1:5173/LastLightGame/', out: null, width: 1280, height: 720, scenes: [], settle: 1800,
  low: false, reduced: false, ui: false };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const key = argv[i], next = () => argv[++i];
  if (key === '--url') opts.url = next();
  else if (key === '--out') opts.out = resolve(next());
  else if (key === '--width') opts.width = Number(next());
  else if (key === '--height') opts.height = Number(next());
  else if (key === '--scene') opts.scenes.push(next());
  else if (key === '--settle') opts.settle = Number(next());
  else if (key === '--low') opts.low = true;
  else if (key === '--reduced') opts.reduced = true;
  else if (key === '--ui') opts.ui = true;
  else throw new Error(`Unknown option ${key}`);
}
if (!opts.out) throw new Error('--out <dir> is required');
mkdirSync(opts.out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-gpu-rasterization', '--use-angle=d3d11',
  '--ignore-gpu-blocklist', '--enable-gpu'] });
const context = await browser.newContext({ viewport: { width: opts.width, height: opts.height } });
if (opts.low) await context.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 }));
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
await page.goto(opts.url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => 'lastLightScene' in window, null, { timeout: 15000 }).catch(() => {});
const live = await page.evaluate(() => !!window.lastLightScene && document.documentElement.classList.contains('scene-live'));
if (!live) {
  console.error('The living backdrop is not running (no WebGL, software rendering, or a production build).', errors);
  await browser.close();
  process.exit(1);
}
if (opts.reduced) await page.evaluate(() => {
  document.documentElement.dataset.motion = 'reduced';
  window.dispatchEvent(new Event('last-light-motion-change'));
});
if (!opts.ui) await page.addStyleTag({ content: '#app, .bubble-effects, .radiant-gpu-layer { visibility: hidden !important; }' });

const base = new URL(opts.url).pathname;
const plan = await page.evaluate(async ({ base, wanted }) => {
  const { sceneIds } = await import(`${base}src/scene/scene-glsl.ts`);
  const { elementScenes, screenScenes } = await import(`${base}src/scene/scene-palettes.ts`);
  const entries = [...Object.values(screenScenes), ...Object.values(elementScenes)];
  window.__scenePlan = Object.fromEntries(sceneIds.map(id => [id, entries.find(entry => entry.scene === id)]));
  return sceneIds.filter(id => !wanted.length || wanted.includes(id));
}, { base, wanted: opts.scenes });

const report = [];
for (const id of plan) {
  await page.evaluate(id => {
    const entry = window.__scenePlan[id], engine = window.lastLightScene;
    engine.setScene(id, entry.palette);
    engine.setIntensity(entry.intensity ?? .35);
    engine.setActive(true);
  }, id);
  // Past the 1.4 s crossfade, then two stills a moment apart to judge motion.
  await page.waitForTimeout(opts.settle);
  await page.screenshot({ path: join(opts.out, `${id}-a.png`) });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(opts.out, `${id}-b.png`) });
  report.push(await page.evaluate(id => {
    const engine = window.lastLightScene;
    return { id, shown: engine.sceneId, failed: engine.failed.has(id), scale: engine.resolutionScale, still: engine.still };
  }, id));
}
const renderer = await page.evaluate(() => window.lastLightScene.renderer);
await browser.close();
console.log(JSON.stringify({ renderer, scenes: report, errors }, null, 2));
if (report.some(scene => scene.failed || scene.shown !== scene.id) || errors.length) process.exit(1);
