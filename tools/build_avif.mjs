// Encodes every runtime PNG in public/assets into a visually lossless AVIF
// sibling (full 4:4:4 chroma, quality 90) plus smaller thumbnails for the large
// portrait sets. PNG originals stay canonical; the manifest records the PNG hash
// each AVIF was encoded from so stale outputs are re-encoded incrementally.
//   node tools/build_avif.mjs           encode new/changed PNGs, remove orphans
//   node tools/build_avif.mjs --check   fail if anything is missing or stale
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const AVIF_SETTINGS = { quality: 90, chromaSubsampling: '4:4:4', effort: 6 };
export const THUMB_WIDTH = 384;
export const THUMB_FOLDERS = ['characters', 'enemies', 'profile-pictures'];
export const MANIFEST_VERSION = 1;

const root = fileURLToPath(new URL('..', import.meta.url));
const assets = join(root, 'public', 'assets');
const manifestPath = join(root, 'Art', 'provenance', 'runtime-avif.json');

export const avifPath = (png) => png.replace(/\.png$/, '.avif');
export const thumbPath = (png) => png.replace(/\.png$/, '.thumb.avif');
export const wantsThumb = (rel) => THUMB_FOLDERS.includes(rel.split('/')[0]);

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const toRel = (file) => relative(assets, file).split(sep).join('/');

function loadManifest() {
  if (!existsSync(manifestPath)) return { version: MANIFEST_VERSION, settings: AVIF_SETTINGS, thumbWidth: THUMB_WIDTH, files: {} };
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function settingsMatch(manifest) {
  return manifest.version === MANIFEST_VERSION && manifest.thumbWidth === THUMB_WIDTH &&
    JSON.stringify(manifest.settings) === JSON.stringify(AVIF_SETTINGS);
}

export function staleEntries() {
  const manifest = loadManifest();
  const same = settingsMatch(manifest);
  const files = walk(assets);
  const pngs = files.filter(f => f.endsWith('.png'));
  const stale = [];
  for (const png of pngs) {
    const rel = toRel(png);
    const entry = manifest.files[rel];
    const hash = sha256(png);
    if (!same || !entry || entry.source !== hash || !existsSync(avifPath(png)) ||
      (wantsThumb(rel) && !existsSync(thumbPath(png)))) stale.push({ png, rel, hash });
  }
  const sources = new Set(pngs.map(avifPath).concat(pngs.filter(p => wantsThumb(toRel(p))).map(thumbPath)));
  const orphans = files.filter(f => f.endsWith('.avif') && !sources.has(f));
  const removed = Object.keys(manifest.files).filter(rel => !existsSync(join(assets, rel)));
  return { manifest: same ? manifest : { ...manifest, version: MANIFEST_VERSION, settings: AVIF_SETTINGS, thumbWidth: THUMB_WIDTH }, stale, orphans, removed, total: pngs.length };
}

async function encode({ png, rel, hash }, sharp) {
  const full = await sharp(png).avif(AVIF_SETTINGS).toBuffer();
  writeFileSync(avifPath(png), full);
  const entry = { source: hash, bytes: statSync(png).size, avif: full.length };
  if (wantsThumb(rel)) {
    const thumb = await sharp(png).resize({ width: THUMB_WIDTH, withoutEnlargement: true }).avif(AVIF_SETTINGS).toBuffer();
    writeFileSync(thumbPath(png), thumb);
    entry.thumb = thumb.length;
  }
  return [rel, entry];
}

async function main() {
  const check = process.argv.includes('--check');
  const { manifest, stale, orphans, removed, total } = staleEntries();
  if (check) {
    if (stale.length || orphans.length || removed.length) {
      console.error(`Runtime AVIF outputs are out of date (${stale.length} stale, ${orphans.length} orphaned, ${removed.length} removed). Run: node tools/build_avif.mjs`);
      process.exit(1);
    }
    console.log(`Runtime AVIF outputs are current for ${total} PNGs.`);
    return;
  }
  for (const file of orphans) rmSync(file);
  for (const rel of removed) delete manifest.files[rel];
  if (stale.length) {
    const { default: sharp } = await import('sharp');
    sharp.concurrency(1);
    const queue = [...stale];
    let done = 0;
    const worker = async () => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        const [rel, entry] = await encode(item, sharp);
        manifest.files[rel] = entry;
        if (++done % 50 === 0) console.log(`Encoded ${done}/${stale.length}`);
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, availableParallelism() - 1) }, worker));
  }
  if (stale.length || orphans.length || removed.length || !existsSync(manifestPath)) {
    manifest.files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);
  }
  const sum = (key) => Object.values(manifest.files).reduce((n, e) => n + (e[key] ?? 0), 0);
  console.log(`AVIF: ${stale.length} encoded, ${orphans.length} orphans removed; ${total} PNGs ${(sum('bytes') / 2 ** 20).toFixed(1)} MB -> ${(sum('avif') / 2 ** 20).toFixed(1)} MB AVIF (+${(sum('thumb') / 2 ** 20).toFixed(1)} MB thumbnails).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
