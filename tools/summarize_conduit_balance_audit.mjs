import { createReadStream, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';

const [input, output, stasisInput, synergyInput] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node tools\\summarize_conduit_balance_audit.mjs <matrix.jsonl> <summary.json> [stasis.jsonl] [synergy.jsonl]');
const empty = () => ({ n: 0, on: { win: 0, defeat: 0, timeout: 0 }, off: { win: 0, defeat: 0, timeout: 0 },
  gained: 0, lost: 0, bothWin: 0, roundsSaved: 0, enemyImprovement: 0 });
function add(a, row) {
  a.n++; a.on[row.on.outcome]++; a.off[row.off.outcome]++;
  if (row.on.outcome === 'win' && row.off.outcome !== 'win') a.gained++;
  if (row.off.outcome === 'win' && row.on.outcome !== 'win') a.lost++;
  if (row.on.outcome === 'win' && row.off.outcome === 'win') {
    a.bothWin++; a.roundsSaved += row.off.rounds - row.on.rounds;
  }
  a.enemyImprovement += row.off.enemyRemaining - row.on.enemyRemaining;
}
let metadata, completion;
const ids = {}, strata = {}, totals = empty(), keys = new Set(), tier3Wins = [], reversals = [], patterns = new Set();
const hash = createHash('sha256');
for await (const line of createInterface({ input: createReadStream(input), crlfDelay: Infinity })) {
  hash.update(line + '\n');
  const row = JSON.parse(line);
  if (row.metadata) { metadata = row.metadata; continue; }
  if (row.completed) { completion = row; continue; }
  const key = [row.category, row.id, row.wearer, row.level, row.context, row.encounter, row.seed].join('|');
  if (keys.has(key)) throw new Error(`Duplicate fixture: ${key}`);
  keys.add(key);
  add(totals, row);
  add(ids[row.id] ??= empty(), row);
  add(strata[[row.id, row.category, row.context, row.level].join('|')] ??= empty(), row);
  if (row.category === 'all-calamity-patterns') patterns.add(row.encounter);
  if (row.encounter.endsWith('EX+3') && row.on.outcome === 'win') tier3Wins.push(row);
  if (row.on.outcome === 'win' && row.off.outcome !== 'win' && row.context === 'supported' && row.level === 5)
    reversals.push(row);
}
if (!metadata || !completion || completion.completed !== totals.n) throw new Error('Incomplete matrix output.');
if (metadata.catalog.length !== 138 || Object.keys(ids).length !== 138) throw new Error('Not all138 catalog IDs covered.');
for (const piece of metadata.catalog) {
  const expected = piece.eligible.length * piece.levels.length * 2 * 6 * 3 + piece.levels.length * 12 * 3 * 3;
  if (ids[piece.id]?.n !== expected) throw new Error(`Coverage mismatch: ${piece.id}: ${ids[piece.id]?.n}/${expected}`);
}
if (patterns.size !== 36) throw new Error('Incomplete Calamity patterns.');
const primaryEncounters = ['machines 35', 'roses 35', 'War vaelor 10', 'Calamity machines EX+1',
  'Calamity machines EX+2', 'Calamity machines EX+3'];
let expectedCount = 0;
function requireFixture(category, piece, wearer, level, context, encounter, seed) {
  const key = [category, piece.id, wearer, level, context, encounter, seed].join('|');
  if (!keys.has(key)) throw new Error(`Missing expected fixture: ${key}`);
  expectedCount++;
}
for (const piece of metadata.catalog) {
  for (const wearer of piece.eligible) for (const level of piece.levels) for (const context of ['isolated', 'supported'])
    for (const encounter of primaryEncounters) for (const seed of metadata.seeds)
      requireFixture('wearer-matrix', piece, wearer, level, context, encounter, seed);
  for (const level of piece.levels) for (const encounter of patterns) for (const seed of metadata.seeds)
    requireFixture('all-calamity-patterns', piece, piece.eligible[0], level, 'supported', encounter, seed);
}
if (expectedCount !== keys.size) throw new Error('Unexpected additional matrix fixtures.');
const ranked = Object.entries(strata).filter(([key]) => key.includes('|wearer-matrix|supported|'))
  .map(([key, value]) => ({ key, ...value, liftPP: 100 * (value.on.win - value.off.win) / value.n }))
  .sort((a, b) => b.liftPP - a.liftPP || b.gained - a.gained);
const result = { metadata, completion, sha256: hash.digest('hex'), totals, ids, strata, ranked,
  tier3Wins, reversals, coverage: { ids: Object.keys(ids).length,
    eligibleWearerPairs: metadata.catalog.reduce((sum, piece) => sum + piece.eligible.length, 0),
    ineligibleWearerPairs: metadata.catalog.reduce((sum, piece) => sum + piece.skipped.length, 0),
    calamityEncounters: patterns.size, uniqueFixtures: keys.size } };
if (stasisInput) {
  const aggregate = empty(), groups = {}, packets = [], repeats = [], stasisHash = createHash('sha256');
  let completed;
  for await (const line of createInterface({ input: createReadStream(stasisInput), crlfDelay: Infinity })) {
    stasisHash.update(line + '\n');
    const row = JSON.parse(line);
    if (row.metadata) continue;
    if (row.completed) { completed = row; continue; }
    if (row.category === 'stasis-packets') { packets.push(row); continue; }
    add(aggregate, row);
    add(groups[[row.context, row.policy, row.level, row.extra.join('+') || 'none'].join('|')] ??= empty(), row);
    const activations = Math.max(0, ...Object.values(row.on.protectedTurns).map(turns => turns.length));
    if (activations >= 2) repeats.push({ ...row, activations });
  }
  result.stasis = { completed, sha256: stasisHash.digest('hex'), aggregate, groups, packets,
    repeatCount: repeats.length, repeats: repeats.sort((a, b) => b.activations - a.activations).slice(0, 12) };
  if (aggregate.n !== 6912 || completed?.completed !== 6914 || packets.length !== 2)
    throw new Error('Incomplete enhanced Stasis fixture set.');
}
if (synergyInput) {
  const groups = {}, synergyHash = createHash('sha256');
  let count = 0, completed;
  for await (const line of createInterface({ input: createReadStream(synergyInput), crlfDelay: Infinity })) {
    synergyHash.update(line + '\n');
    const row = JSON.parse(line);
    if (row.metadata) continue;
    if (row.completed) { completed = row; continue; }
    add(groups[[row.id, row.stacks, row.encounter.split('EX+')[1]].join('|')] ??= empty(), row);
    count++;
  }
  if (count !== 864 || completed?.completed !== count) throw new Error('Incomplete stacked synergy fixture set.');
  result.synergy = { completed, sha256: synergyHash.digest('hex'), groups };
}
writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ totals, coverage: result.coverage, top: ranked.slice(0, 15), tier3Wins: tier3Wins.length,
  stasis: result.stasis && { aggregate: result.stasis.aggregate, repeatCount: result.stasis.repeatCount } }, null, 2));
