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
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

function parse(argv) {
  const opts = { url: 'http://127.0.0.1:5173/LastLightGame/', clicks: [], wait: 1500, frames: 24,
    every: 80, width: 1280, height: 720, sheet: false, out: null };
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
    else throw new Error(`Unknown option ${key}`);
  }
  if (!opts.out) throw new Error('--out <dir> is required');
  return opts;
}

const opts = parse(process.argv.slice(2));
mkdirSync(opts.out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-gpu-rasterization'] });
const page = await browser.newPage({ viewport: { width: opts.width, height: opts.height } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

await page.goto(opts.url, { waitUntil: 'networkidle' });
for (const target of opts.clicks) {
  await page.locator(target).first().click({ timeout: 15000 });
  await page.waitForTimeout(400);
}
await page.waitForTimeout(opts.wait);

const names = [];
for (let frame = 0; frame < opts.frames; frame += 1) {
  const name = `frame-${String(frame).padStart(3, '0')}.png`;
  await page.screenshot({ path: join(opts.out, name) });
  names.push(name);
  if (frame < opts.frames - 1) await page.waitForTimeout(opts.every);
}
await browser.close();

if (opts.sheet) {
  const tiles = names.map((n, i) => `<figure><img src="${n}"><figcaption>${i} · ~${i * opts.every} ms</figcaption></figure>`).join('');
  writeFileSync(join(opts.out, 'contact-sheet.html'), `<!doctype html><meta charset="utf-8"><style>body{background:#111;color:#ccc;font:12px sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}img{width:100%}figure{margin:0}</style>${tiles}`);
}
console.log(`Saved ${names.length} frames to ${opts.out}`);
if (errors.length) console.log(`Page errors (${errors.length}):\n${errors.slice(0, 10).join('\n')}`);
