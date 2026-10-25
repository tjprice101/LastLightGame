import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { writeFile } from 'node:fs/promises';

const [baselinePath, currentPath, optimizedPath, accessPath, capabilityPath, output] = process.argv.slice(2);
if (!output) throw new Error('Usage: node tools\\render_progression_balance.mjs <baseline.jsonl> <current.jsonl> <optimized.jsonl> <access.jsonl> <capabilities.jsonl> <report.md>');
async function read(path) {
  const rows = [];
  for await (const line of createInterface({ input: createReadStream(path), crlfDelay: Infinity })) rows.push(JSON.parse(line));
  if (!rows.at(-1)?.completed) throw new Error(`Incomplete evidence: ${path}`);
  return rows;
}
const [before, after, optimized, access, capability] = await Promise.all(
  [baselinePath, currentPath, optimizedPath, accessPath, capabilityPath].map(read));
if (before[0].metadata.mode !== 'baseline' || after[0].metadata.mode !== 'verify' ||
    before[0].metadata.sourceHash !== after[0].metadata.sourceHash ||
    optimized[0].metadata.sourceHash !== after[0].metadata.sourceHash ||
    access[0].metadata.sourceHash !== after[0].metadata.sourceHash ||
    before.at(-1).completed !== 12348 || after.at(-1).completed !== 12348 ||
    optimized.at(-1).completed !== 1296 || access.at(-1).completed !== 405 ||
    capability.at(-1).mainRuns !== 175392) throw new Error('Evidence coverage or paired source identity mismatch.');
const measurements = records => records.filter(row => row.outcome);
const old = measurements(before), current = measurements(after), best = measurements(optimized);
const identity = row => JSON.stringify([row.encounter, row.roster, row.seed]);
if (old.length !== 12348 || current.length !== 12348 ||
    new Set(old.map(identity)).size !== 12348 || new Set(current.map(identity)).size !== 12348 ||
    JSON.stringify(old.map(identity).sort()) !== JSON.stringify(current.map(identity).sort()))
  throw new Error('Paired measurement keys are incomplete or duplicated.');
for (const row of [...old, ...current, ...best, ...measurements(access)])
  if (![row.rounds, row.healthFraction, row.enemyRemaining].every(Number.isFinite))
    throw new Error('Non-finite encounter evidence.');
const fmt = value => Number(value.toFixed(1)).toLocaleString('en-US', { maximumFractionDigits: 1 });
const mean = values => values.reduce((a, b) => a + b, 0) / values.length;
const percentile = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b), position = (values.length - 1) * p;
  const index = Math.floor(position), fraction = position - index;
  return sorted[index] + (sorted[Math.min(index + 1, sorted.length - 1)] - sorted[index]) * fraction;
};
const wins = rows => rows.filter(row => row.outcome === 'win').length;
const group = row => row.encounter.kind === 'calamity' ? `Calamity EX+${row.encounter.tier}`
  : `${row.encounter.kind} Lv.${Math.ceil(row.enemyLevel / 20) * 20 - 19}-${Math.ceil(row.enemyLevel / 20) * 20}`;
const previous = new Map(old.map(row => [identity(row), row]));
for (const row of current.filter(row => row.enemyLevel <= 80)) {
  const reference = previous.get(identity(row));
  if (row.outcome !== reference.outcome || row.rounds !== reference.rounds ||
      Math.abs(row.healthFraction - reference.healthFraction) > 1e-9)
    throw new Error('Opening pressure changed below the preserved level80 boundary.');
}
for (const key of new Set(current.filter(row => row.encounter.kind !== 'calamity').map(group))) {
  const rows = current.filter(row => group(row) === key);
  if (wins(rows) / rows.length < .95 || rows.some(row => row.outcome === 'timeout'))
    throw new Error(`Standard progression band failed practical-build acceptance: ${key}`);
}
const rates = [1, 2, 3].map(tier => {
  const rows = current.filter(row => row.encounter.kind === 'calamity' && row.encounter.tier === tier);
  return wins(rows) / rows.length;
});
if (rates[0] < .8 || rates[1] < .5 || rates[2] < .3 || !(rates[0] > rates[1] && rates[1] > rates[2]))
  throw new Error('Practical Calamity preparation or tier ordering failed.');
const fiveStars = new Set(['ember', 'tide', 'sprout', 'atmoso', 'bruno', 'elise']);
const levels = capability[0].metadata.levels;
const outputRows = capability.filter(row => row.measurement).map(row => row.measurement)
  .filter(row => row.profile === 'planned' && row.mode === 'output' && row.roster.every(id => fiveStars.has(id)));
const lines = [
  '# Global character benchmarks and enemy calibration (D-404)', '',
  '## Usage declaration', '',
  'The [non-Calamitic roster capability audit](roster-capability-audit.md) is the canonical paper-performance reference; this document is its pressured-encounter calibration companion. Together they supersede Calamitic-inclusive historical ceilings as enemy-tuning targets. Personal Masters remain eligible. Calamitic Conduits remain usable in the game but are excluded from every benchmark here.', '',
  '**These are modeled progression bands, not observed player averages.** There is no ownership/play telemetry. Neither character level nor this report grants a roster, equipment, upgrades or a Master. Never scale enemies to the best paper team or assume three recruited bearers are a free starting squad. Paper DPR against zero Defense is not damage against these enemies, a win probability or real-time DPS.', '',
  '### Ordinary performance distribution', '',
  'Common +0 gear, native-aware play, minimum legal evolution, all six Standard five-stars, every distinct owned solo/duo/trio. Cells are P10 / median / P90 damage per round, equally weighting candidate teams, not weighting accounts by recruitment probability. A tank/healer-heavy team can be useful below these offensive medians. Healing, shielding, incoming-dependent passives and burst remain separate tables in the capability report.', '',
  '| Character level | Solo DPR | Duo DPR | Trio DPR |',
  '|---:|---:|---:|---:|',
  ...levels.map(level => `| ${level} | ${[1, 2, 3].map(size => {
    const values = outputRows.filter(row => row.level === level && row.size === size).map(row => row.sustained);
    if (!values.length) throw new Error('Missing capability distribution.');
    return [.1, .5, .9].map(p => fmt(percentile(values, p))).join(' / ');
  }).join(' | ')} |`), '',
  '### Access and preparation assumptions', '',
  '- Only one chosen starter is free. Additional Standard five-stars have 1% total natural probability split six ways (one named bearer: 1/600 per ordinary pull); acquisition is never guaranteed by a level checkpoint. First Story clears supply 240 Null-Prismatica across120 stages:24 draws, not a guaranteed three-bearer roster.',
  '- Captured Elemental-Devourers are a separate accessible filler route after activity access. The access probe uses a single starter plus zero/one/two distinct Common Heaven copies from stage1, retained at their actual capture level. It does not secretly level these copies to105, grant Masters to copies, or credit rare captures. Two successful independent20% capture rolls require10 eligible kills on average, with no fixed kill guarantee.',
  '- Ordinary native-encounter calibration conditionally owns one of six five-star trios: Infernis/Tizu/Flora; Infernis/Atmoso/Flora; Elise/Bruno/Flora; Infernis/Tizu/Atmoso; Atmoso/Bruno/Flora; Elise/Tizu/Flora.',
  '- Player level is max(0, enemy level-1), capped105; minimum legal evolution. Gear bands: through40 Store Common +0;41-80 mixed Rare/Legendary +0;81-105 mixed +5;106-120 four matching Omnics +5;121+ developed matching Omnics +5 with personal Masters. These are preparation targets, not ownership or upgrade-cost forecasts. Exact fixed packages are in `tools/battle-survey.ts:loadout`; optimized endgame replaces two ordinary slots with Glassroot Gimbal and Stasis Reliquary.',
  '- Calamity tests Lv.105/Evo.6 teams: starter trio; Rosetta/Thornia/Flora; Crinso/Rosetta/Disciple; Nerithe/Orvella/Vaelor; Elise/Bruno/Flora; Bliss/Razor/Aurora. Only the starter/Standard trios avoid six-star recruitment; even all three starters require recruitment.',
  '- Balanced pilot preserves actual costs, recovery, shields, healing, Gauge and all boss patterns. It avoids wasting Tizu Gauge on a shield-only Flare while healthy; at below half HP it permits that protection. A second Flare-first pilot tests optimized Calamity. Rotation is bounded rather than globally optimal.', '',
  '## Tuning contract', '',
  'Levels1-80 are unchanged. Above80, apply the following factors to the unrounded D-385 shared hostile curve, then round ONCE. Smoothstep between adjacent authored-level anchors: t²(3-2t). These factors are not applied to playable/captured growth. The existing smooth effective-level approach and resistance ramp remain separate.', '',
  '| Enemy level | Health factor | Attack factor | Defense factor |',
  '|---:|---:|---:|---:|',
  '|80|1|1|1|', '|100|1.2|0.95|1|', '|120|1.4|0.9|0.95|', '|140|1.5|0.82|0.9|',
  '|145|1.5|0.8|0.9|', '|160|1.5|0.7|0.875|', '|170|1.5|0.6|0.85|', '|185|1.5|0.6|0.85|', '',
  'Health buys time for actual healing, protection and boss patterns; reduced Attack burst and Defense avoid requiring Calamitic offense or a lucky survival proc. Absolute Health/Attack/Defense still increase monotonically at every level through185. Post80 adjacent stat growth stays below9%; late adjacent log-growth changes through the approach stay below0.008. EX+1/2/3 retain levels145/160/170 and existing1.03/0.98/1 encounter multipliers. No gates, rewards, drop rates, skills, character stats, Conduit effects or account data change.', '',
  'Combat rules11 restart historical in-progress encounters through existing client/server compatibility logic, retaining frozen squad/equipment and already-saved rewards. No load-time account migration or retroactive grants.', '',
  '## Matched actual encounter measurements', '',
  'Every current Story/dungeon/infusion/War/Calamity stage plus Training levels1-120; three seeds1/1729/104729;12,348 battles per curve. Same teams, gear and balanced pilot before/after. Baseline reconstructs exact D-403 hostile stats before starting a fresh fight, preserving all native boss mechanics. Each encounter starts fresh: this is not a whole-run attrition or economy simulation. Training above120 is deliberately rejected rather than silently mislabeled.', '',
  '| Activity / enemy band | Battles | Before wins | After wins | Before / after mean rounds | After mean remaining allied HP |',
  '|---|---:|---:|---:|---:|---:|',
  ...[...new Set(current.map(group))].map(key => {
    const a = old.filter(row => group(row) === key), b = current.filter(row => group(row) === key);
    return `| ${key} | ${b.length} | ${wins(a)} | ${wins(b)} | ${fmt(mean(a.map(row => row.rounds)))} / ${fmt(mean(b.map(row => row.rounds)))} | ${fmt(mean(b.map(row => row.healthFraction)) * 100)}% |`;
  }), '',
  'Round/HP means include defeats and100-round censored timeouts; they are not means only over winners. A surviving but stalled team does not count as a win. Seeds are a reproducible spread, not a statistical confidence interval. Not every legal team must win, and an optimized high-investment team may still defeat early content quickly.', '',
  'Regression acceptance: every non-Calamity activity/20-level band has at least95% wins with its declared preparation and no timeouts; all sampled outcomes/rounds/remaining HP at levels1-80 match the old curve exactly. The fixed practical Calamity set must reach at least80%/50%/30% for EX+1/2/3 with strictly descending clear rates. Optimized EX+3 additionally needs the per-boss repeatability coverage below. These are modeled-sample guardrails, not player-population success promises.', '',
  '### EX+3 repeatable solutions', '',
  'Six squads ×12 bosses ×three tiers ×three seeds ×two rotations =1,296 optimized non-Calamitic fights. “Repeatable team” below means one fixed rotation wins all three seeds; policies do not count as extra teams. Acceptance requires at least two distinct repeatable teams for EVERY EX+3 boss, not just one favorable Machines example.', '',
  '| EX+3 boss | Repeatable distinct teams | Example team / rotation | Mean rounds |',
  '|---|---:|---|---:|',
];
for (const activity of [...new Set(best.map(row => row.encounter.activity))]) {
  const groups = new Map();
  for (const row of best.filter(row => row.encounter.tier === 3 && row.encounter.activity === activity)) {
    const key = `${row.roster.join('/')} / ${row.policy}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  const robust = [...groups].filter(([, rows]) => rows.length === 3 && wins(rows) === 3);
  const distinct = new Set(robust.map(([, rows]) => rows[0].roster.join('/')));
  if (distinct.size < 2) throw new Error(`Insufficient repeatable EX+3 teams for ${activity}.`);
  lines.push(`| ${activity} | ${distinct.size} | ${robust[0][0]} | ${fmt(mean(robust[0][1].map(row => row.rounds)))} |`);
}
lines.push('', '### Accessible capture-filler control', '',
  '405 fights: three starters ×five Training levels ×one/two/three slots ×three gear bands ×three seeds. Copies are conditional on farming/access, not free. These Common copies are deliberately not an optimized captured roster. This control exposes the gap between a merely filled team and recruited/evolved endgame synergy; it must not be described as the average three-bearer account.', '',
  '| Training enemy level | Slots | Common +0 wins /9 | Mixed +0 wins /9 | Mixed +5 wins /9 |', '|---:|---:|---:|---:|---:|');
for (const level of [50, 60, 80, 100, 120]) for (const slots of [1, 2, 3])
  lines.push(`| ${level} | ${slots} | ${['common0', 'mixed0', 'mixed5'].map(build =>
    wins(measurements(access).filter(row => row.enemyLevel === level && row.slots === slots && row.build === build))).join(' | ')} |`);
lines.push('', 'Each cell has9 attempts (three starters ×three seeds); the whole level/slot group has27. No account-average inference follows from these counts.', '',
  '## Exact shared hostile stats at every level', '',
  'Calamity applies its tier multiplier after these shared boss values. Story and other modes retain their authored level/rank assignment.', '',
  '| Level | Ordinary HP | ATK | DEF | Boss HP | ATK | DEF |', '|---:|---:|---:|---:|---:|---:|---:|',
  ...after[0].stats.map(row => `| ${row.level} | ${[row.ordinary, row.boss].flatMap(stats => [stats.health, stats.damage, stats.defense]).join(' | ')} |`), '',
  '## Reproduction, provenance and limitations', '',
  '`node tools\\run_roster_capability.mjs <new-capabilities.jsonl> docs\\roster-capability-audit.md`', '',
  '`node tools\\run_progression_balance.mjs <new-results.jsonl> baseline` (repeat with `verify`, `optimized`, `access`).', '',
  '`node tools\\render_progression_balance.mjs <baseline.jsonl> <current.jsonl> <optimized.jsonl> <access.jsonl> <capabilities.jsonl> docs\\enemy-benchmark-calibration.md`', '',
  `Paired calibration bundle SHA-256: \`${after[0].metadata.sourceHash}\`. Capability evidence bundle SHA-256: \`${capability[0].metadata.sourceHash}\`. The latter was compiled before the hostile-only tuning/rules increment; its dummy-target experiment does not use hostile stats. These are separate experiments, not a combined measurement source hash.`, '',
  'The capability runner retains complete acquisition costs and separate effective healing/shield/defensive probes. Global balance authority applies only to the measured rules/content; rerun when character kits, gear, caps or enemy mechanics change. No assertion covers all possible builds, actor orders, mixed-level squads, save histories or human strategies. Common capture fillers failing late content is reported rather than hidden; recruiting/evolving a better roster or choosing stronger captures is a progression requirement, not an automatic reward.', '');
await writeFile(output, lines.join('\n'), 'utf8');
console.log(`Wrote ${output}; validated paired coverage, all185 levels and every EX+3 boss.`);
