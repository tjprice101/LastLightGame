// Dev-only motion review: open the game in headless Chromium, optionally click
// through a path, then save a timed frame sequence so animation can be judged
// over time (not a single still). Never touches saves beyond what the clicks do.
//
//   node tools/capture_frames.mjs --out <dir> [--url http://127.0.0.1:5173/LastLightGame/]
//        [--click "<css or text=...>"]... [--wait 1500] [--frames 24] [--every 80]
//        [--width 1280] [--height 720] [--sheet]
//
// --click may repeat; each target is clicked in order (waits for it first).
// --sheet also writes contact-sheet.html that tiles the frames for quick review.
//
// Battle motion review (Spectacle step 1) uses the in-memory dev preview
// (battle-preview.html: no sign-in, no saves) and starts capturing at the input:
//   node tools/capture_frames.mjs --out <dir> --battle attack|skill1|skill2|flare
//        [--leader <bearer id>] [--encounter story-20] [--member 0] [--frames 40] [--every 50] [--sheet]
//        [--flare-tier sparkling|glimmering|ultimate] [--speed 1|2|3] [--reduced]
// flare first selects the Eternal charge fixture so Convergent Light is ready.
// enemy presses End Turn so the enemy phase plays at once.
// --stream records Chrome's screencast instead of screenshotting (screenshots stall rendering,
// which slows GPU-timed effects) and keeps, for every --every ms after the input, the latest
// streamed frame (JPEG). Timing follows the browser clock.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

function parse(argv) {
  const opts = { url: 'http://127.0.0.1:5173/LastLightGame/', clicks: [], wait: 1500, frames: 24,
    every: 80, width: 1280, height: 720, sheet: false, out: null, battle: null, leader: null, encounter: null, member: 0,
    flareTier: null, speed: null, reduced: false, stream: false };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const next = () => argv[++i];
    if (key === '--url') opts.url = next();
    else if (key === '--click') opts.clicks.push(next());
    else if (key === '--wait') opts.wait = Number(next());
    else if (key === '--frames') opts.frames = Number(next());
    else if (key === '--every') opts.every = Number(next());
    else if (key === '--width') opts.width = Number(next());
    else if (key === '--height') opts.height = Number(next());
    else if (key === '--out') opts.out = resolve(next());
    else if (key === '--sheet') opts.sheet = true;
    else if (key === '--battle') opts.battle = next();
    else if (key === '--leader') opts.leader = next();
    else if (key === '--encounter') opts.encounter = next();
    else if (key === '--member') opts.member = Number(next());
    else if (key === '--flare-tier') opts.flareTier = next();
    else if (key === '--speed') opts.speed = next();
    else if (key === '--reduced') opts.reduced = true;
    else if (key === '--stream') opts.stream = true;
    else throw new Error(`Unknown option ${key}`);
  }
  if (!opts.out) throw new Error('--out <dir> is required');
  if (opts.battle && !['attack', 'skill1', 'skill2', 'flare', 'enemy'].includes(opts.battle))
    throw new Error('--battle must be attack, skill1, skill2, flare or enemy');
  if (opts.battle && opts.clicks.length) throw new Error('--battle and --click cannot be combined');
  return opts;
}

const opts = parse(process.argv.slice(2));
mkdirSync(opts.out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-gpu-rasterization'] });
const context = await browser.newContext({ viewport: { width: opts.width, height: opts.height } });
const page = await context.newPage();
const shots = [];
let actionAt = 0;
let cdp = null;
/** Browser-clock time of the input; with --stream, starts the screencast first. */
async function markAction() {
  if (opts.stream) {
    cdp = await context.newCDPSession(page);
    cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
      // The screencast clock differs from Date.now(); calibrate with the fastest delivery seen.
      shots.push({ stamp: metadata.timestamp * 1000, received: Date.now(), data });
      cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, everyNthFrame: 1 });
    await page.waitForTimeout(150);
  }
  // Frames count from the input event itself (Playwright's click waits before dispatching).
  await page.evaluate(() => {
    const mark = () => { window.__captureAt ??= Date.now(); };
    for (const type of ['pointerdown', 'keydown', 'click']) document.addEventListener(type, mark, { capture: true, once: true });
  });
  actionAt = 0;
}
async function inputTime() {
  if (!actionAt) actionAt = await page.evaluate(() => window.__captureAt ?? Date.now());
}
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

async function startBattleAction() {
  const url = new URL('battle-preview.html', opts.url.endsWith('/') ? opts.url : `${opts.url}/`).href;
  await page.goto(url, { waitUntil: 'networkidle' });
  if (opts.leader) await page.selectOption('[data-preview-leader]', opts.leader);
  if (opts.encounter) await page.selectOption('[data-preview-encounter]', opts.encounter);
  if (opts.flareTier) await page.selectOption('[data-preview-flare-tier]', opts.flareTier);
  if (opts.speed) await page.selectOption('[data-preview-speed]', opts.speed);
  if (opts.reduced) await page.check('[data-preview-motion]');
  // Charge fixture: skills need Luminosity (Glowing is enough); flare needs Eternal.
  const charges = opts.battle === 'flare' ? 3 : opts.battle === 'attack' || opts.battle === 'enemy' ? 0 : 1;
  for (let i = 0; i < charges; i += 1) await page.click('[data-preview-cycle]');
  const actor = page.locator('[data-radiant-actor]:not([disabled])').nth(opts.member);
  await actor.waitFor({ timeout: 15000 });
  await actor.scrollIntoViewIfNeeded();
  await page.waitForTimeout(opts.wait);
  if (opts.battle === 'attack') { await markAction(); await actor.click(); }
  else if (opts.battle === 'enemy') { await markAction(); await page.click('[data-radiant-end-turn]'); }
  else if (opts.battle === 'flare') { await actor.focus(); await markAction(); await page.keyboard.press('f'); }
  else {
    await actor.focus(); await page.keyboard.press('d');
    const choice = page.locator(`[data-radiant-skill="${opts.battle === 'skill1' ? 1 : 2}"]`).first();
    await choice.waitFor({ timeout: 5000 });
    await markAction();
    await choice.click();
  }
}

if (opts.battle) { await startBattleAction(); await inputTime(); }
else {
  await page.goto(opts.url, { waitUntil: 'networkidle' });
  for (const target of opts.clicks) {
    await page.locator(target).first().click({ timeout: 15000 });
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(opts.wait);
  await markAction(); await inputTime();
}

const names = [];
if (opts.stream) {
  await page.waitForTimeout(opts.frames * opts.every + 200);
  await cdp.send('Page.stopScreencast').catch(() => {});
  const offset = Math.min(...shots.map(entry => entry.received - entry.stamp));
  for (const entry of shots) entry.at = entry.stamp + offset;
  for (let frame = 0; frame < opts.frames; frame += 1) {
    const due = actionAt + frame * opts.every;
    const shot = shots.filter(entry => entry.at <= due).at(-1) ?? shots[0];
    if (!shot) throw new Error('The screencast produced no frames.');
    const name = `frame-${String(frame).padStart(3, '0')}.jpg`;
    writeFileSync(join(opts.out, name), Buffer.from(shot.data, 'base64'));
    names.push(name);
  }
} else {
  for (let frame = 0; frame < opts.frames; frame += 1) {
    const name = `frame-${String(frame).padStart(3, '0')}.png`;
    await page.screenshot({ path: join(opts.out, name) });
    names.push(name);
    if (frame < opts.frames - 1) await page.waitForTimeout(opts.every);
  }
}
await browser.close();

if (opts.sheet) {
  const tiles = names.map((n, i) => `<figure><img src="${n}"><figcaption>${i} - ~${i * opts.every} ms</figcaption></figure>`).join('');
  writeFileSync(join(opts.out, 'contact-sheet.html'), `<!doctype html><meta charset="utf-8"><style>body{background:#111;color:#ccc;font:12px sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}img{width:100%}figure{margin:0}</style>${tiles}`);
}
console.log(`Saved ${names.length} frames to ${opts.out}`);
if (errors.length) console.log(`Page errors (${errors.length}):\n${errors.slice(0, 10).join('\n')}`);
