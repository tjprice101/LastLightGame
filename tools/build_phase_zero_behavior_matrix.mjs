import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, sep } from 'node:path';

const reportPath = process.argv[2];
if (!reportPath) throw new Error('Pass a passing full Vitest JSON report path.');
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
if (!report.success || report.numFailedTests || report.numPendingTests)
  throw new Error('The behavior matrix requires a complete passing test report without pending cases.');
const root = resolve(import.meta.dirname, '..');
const text = path => readFileSync(resolve(root, ...path.split('/')), 'utf8');
const catalogText = text('src/content/phase-zero-conduit-catalog.ts');
const catalog = JSON.parse(catalogText.slice(catalogText.indexOf('= {') + 2, catalogText.lastIndexOf('};') + 1));
const files = {
  replacement: 'src/game/phase-zero-replacement-effects.test.ts',
  remaining: 'src/game/phase-zero-remaining-effects.test.ts',
  static: 'src/content/phase-zero-conduit-stats.test.ts',
  master: 'src/game/phase-zero-master-matrix.test.ts',
};
const executed = path => {
  const file = report.testResults.find(result => resolve(result.name) === resolve(root, ...path.split('/')));
  if (!file || file.status !== 'passed') throw new Error(`Missing passing test file: ${path}.`);
  return file.assertionResults;
};
const evidence = new Map();
for (const path of [files.replacement, files.remaining]) {
  let source = text(path);
  if (path === files.replacement) source = source.slice(source.indexOf('describe.each(variants)'),
    source.indexOf("describe('Phase 0 Calamitic replacement safety'"));
  const cases = [...source.matchAll(/  it\('([^']+)', \(\) => \{/g)];
  for (let index = 0; index < cases.length; index++) {
    const match = cases[index];
    const body = source.slice(match.index, cases[index + 1]?.index ?? source.length);
    const id = body.match(/(?:setup|fixture)\('([^']+)', level/)?.[1];
    if (!id) throw new Error(`Missing explicit equipped/absent fixture: ${match[1]}.`);
    const results = executed(path).filter(test => test.title === match[1]);
    const variants = results.map(test => test.ancestorTitles.find(title => title.includes('absent/+')));
    if (results.length !== 7 || results.some(test => test.status !== 'passed') ||
        new Set(variants).size !== 7 || !variants.some(title => title.endsWith('+null')))
      throw new Error(`Missing passing absence/+0..+5 behavior evidence: ${id}.`);
    evidence.set(id, { path, title: match[1], count: 7, coverage: 'Absent; +0..+5' });
  }
}
for (const [id] of Object.entries(catalog).filter(([id]) => !id.startsWith('master-'))) {
  if (evidence.has(id)) continue;
  const results = executed(files.static).filter(test =>
    test.title === `${id} scales its approved benefit once` || test.title === `${id} has no benefit when absent`);
  if (results.length !== 7 || results.some(test => test.status !== 'passed'))
    throw new Error(`Missing numerical static behavior evidence: ${id}.`);
  evidence.set(id, { path: files.static, title: `${id} scales its approved benefit once`, count: 7, coverage: 'Absent; +0..+5' });
}
for (const [id] of Object.entries(catalog).filter(([id]) => id.startsWith('master-'))) {
  const results = executed(files.master).filter(test => test.ancestorTitles.includes(id));
  if (results.length !== 2 || results.some(test => test.status !== 'passed') ||
      !results.some(test => test.title.includes('equipped=false')) || !results.some(test => test.title.includes('equipped=true')))
    throw new Error(`Missing concrete Master equipped/absent evidence: ${id}.`);
  evidence.set(id, { path: files.master, title: id, count: 2, coverage: 'Absent; equipped (fixed)' });
}
if (evidence.size !== 138) throw new Error(`Expected 138 behavior entries, found ${evidence.size}.`);
const digestPaths = [
  'src/content/omnic-conduit-stats.ts', 'src/game/omnic-refresh.test.ts',
  'docs/conduit-catalog.txt', ...Object.values(files), 'src/game/phase-zero-interactions.test.ts',
  'src/game/conduit-rework.test.ts', 'src/presentation/conduit-status.ts',
  'src/content/phase-zero-conduit-upgrades.test.ts', 'src/content/phase-zero-conduit-upgrades.ts',
  'src/content/phase-zero-conduit-stats.ts', 'src/game/conduit-runtime.ts', 'src/game/native-kits.ts',
  'src/game/battle.ts', 'src/game/calamitic-conduits.ts',
  'src/content/native-balance.ts', 'src/content/native-identities.ts',
  'src/game/last-flare-balance.test.ts', 'src/online/native-identities-server.test.ts',
  'src/online/phase-zero-authority.test.ts', 'src/presentation/phase-zero-battle-controls.test.ts',
  'supabase/functions/game-operation/engine.ts', 'src/content/phase-zero-stats.ts',
  'src/presentation/phase-zero-release-gate.test.ts', 'src/content/phase-zero-stats.test.ts',
  'src/presentation/conduit-loadout.ts', 'src/presentation/conduit-upgrade.ts', 'src/presentation/archives.ts',
  'src/game/native-kits.test.ts', 'src/presentation/conduit-keywords.test.ts',
  'src/presentation/reference-text.ts', 'src/presentation/reference-text.test.ts',
  'src/ui/master-choice-dialog.tsx', 'src/ui/master-choice-dialog.test.tsx',
];
const digest = createHash('sha256');
for (const path of digestPaths) digest.update(path).update('\0').update(text(path).replace(/\r\n/g, '\n'));
const escape = value => value.replace(/\|/g, '\\|');
const rows = Object.entries(catalog).map(([id, entry], index) => {
  const item = evidence.get(id);
  return `| ${index + 1} | ${escape(entry.name)} | \`${id}\` | ${item.coverage} | [${escape(item.title)}](../${item.path}) | ${item.count} passed |`;
});
const count = [...evidence.values()].reduce((sum, item) => sum + item.count, 0);
const output = [
  '# Phase 0 Conduit behavior matrix', '',
  'This is executed numerical behavior evidence, not a count of source references or nonempty ability strings.',
  'The approved ability contract remains [conduit-catalog.txt](conduit-catalog.txt).',
  'The release gate is enabled for coordinated client/authority publication (D-415, rules13). This report certifies tested behavior, not hosted deployment or balance quality.', '',
  `- Roster: **138/138** entries, **${count}** passing baseline/equipment/upgrade scenarios.`,
  '- Ordinary-slot entries: 90, each with an absent baseline and all six +0..+5 upgrade levels.',
  '- Named Masters: 48, each with a concrete equipped and absent numerical behavior scenario.',
  `- Full regression: **${report.numPassedTests} tests / ${report.testResults.length} files passed**; zero failed or pending.`,
  '- Description parity: all 138 defaults against the complete owner-authored catalog; all 90 ordinary entries at +0..+5; Masters reject upgrades.',
  '- Separate interaction tests cover generated Master Shield provenance, manual native packets, stored-packet scaling, duplicate auras, additive stat pools and Defense caps.',
  '- UI and authority suites additionally exercise target-dependent costs, frozen equipment and Throne controls.',
  '- D-382 regressions cover all45 replacements, complete-Health conversion thresholds, cast-level seeded randomness, conditional Health, sole-owner Shield provenance, routed protection and persisted Stasis clocks.',
  '- D-383 additionally checks all93 Omnic/Master personal and squad stat packages, fixed Master/ordinary additive pools, duplicate living-source stacking, Health clamping, revival, Glassroot, Training snapshots, focused Last Flare, every-two-impact Quarry payouts, native-only Phoenix healing and Seed settlement parity after persistent JSON key reordering.',
  '- D-415 additionally checks canonical descriptions and Master selector formatting, native critical damage, explicit trap empowerment/refresh, Cinder20% stacking and Rosegarden Skill2 activation with a Last Flare negative case.',
  '- Passing tests do not establish subjective usefulness or mathematically exhaustive balance across every possible squad.', '',
  `Evidence source SHA-256 (LF-normalized): \`${digest.digest('hex')}\`.`,
  'Regenerate only from a complete passing full-suite JSON report:', '',
  '```powershell',
  'node tools\\build_phase_zero_behavior_matrix.mjs "<passing-report.json>"',
  '```', '',
  '| # | Conduit | Stable ID | Variants | Numerical behavior test | Result |',
  '|---|---|---|---|---|---|',
  ...rows, '',
].join('\n');
const destination = resolve(root, 'docs', 'conduit-behavior-matrix.md');
writeFileSync(destination, output);
console.log(`Wrote ${relative(root, destination).split(sep).join('/')} with 138 entries and ${count} passing behavior scenarios.`);
