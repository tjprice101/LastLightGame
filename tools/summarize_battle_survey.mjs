import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [output, ...inputs] = process.argv.slice(2);
if (!output || !inputs.length) throw new Error('Usage: node tools\\summarize_battle_survey.mjs <summary.json> <survey.jsonl> [...]');
const rows = [], evidence = [];
for (const path of inputs) {
  const bytes = readFileSync(path), records = bytes.toString('utf8').trim().split('\n').map(line => JSON.parse(line));
  const metadata = records.shift(), footer = records.pop();
  if (!metadata.metadata || footer.completed !== records.length || records.some(row => !row.category))
    throw new Error(`Incomplete or malformed survey: ${path}`);
  rows.push(...records);
  evidence.push({ path, sha256: createHash('sha256').update(bytes).digest('hex'),
    ...metadata, ...footer });
}
const median = values => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
function summarize(group) {
  const wins = group.filter(row => row.outcome === 'win');
  return {
    battles: group.length, wins: wins.length, defeats: group.filter(row => row.outcome === 'defeat').length,
    timeouts: group.filter(row => row.outcome === 'timeout').length,
    winRate: group.length ? wins.length / group.length : null,
    medianWinRounds: median(wins.map(row => row.rounds)), medianWinHealth: median(wins.map(row => row.healthFraction)),
    medianEnemyRemainingOnFailure: median(group.filter(row => row.outcome !== 'win').map(row => row.enemyRemaining)),
  };
}
function grouped(source, key) {
  const groups = new Map();
  for (const row of source) {
    const id = key(row);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(row);
  }
  return Object.fromEntries([...groups].map(([id, group]) => [id, summarize(group)]));
}
const family = row => row.encounter.startsWith('Calamity') ? `EX+${row.encounter.at(-1)}` :
  row.encounter.startsWith('War') ? 'War140' : row.encounter.startsWith('roses') ? 'Roses140' :
    row.encounter.includes('dungeon') ? 'Dungeons120' : 'Other120';
const endgame = rows.filter(row => row.category === 'endgame');
const story = rows.filter(row => row.category === 'story-progression'), frontiers = {};
for (const level of [...new Set(story.map(row => row.level))]) {
  frontiers[level] = {};
  for (const build of [...new Set(story.map(row => row.build))]) {
    const stages = grouped(story.filter(row => row.level === level && row.build === build), row => row.encounter.split(' ')[1]);
    let consecutive = 0;
    while (stages[consecutive + 1]?.winRate === 1) consecutive++;
    frontiers[level][build] = {
      consecutive, highestAllSeeds: Math.max(0, ...Object.entries(stages).filter(([, result]) => result.winRate === 1).map(([stage]) => Number(stage))),
      overall: summarize(story.filter(row => row.level === level && row.build === build)),
    };
  }
}
const characters = rows.filter(row => row.category === 'character-masters'), characterSummary = {};
for (const name of [...new Set(characters.map(row => row.squad))]) {
  const group = characters.filter(row => row.squad === name);
  const masterChoices = grouped(group, row => `${row.policy}/${row.master === 'none' ? 'none' : row.master.slice(row.master.lastIndexOf('-') + 1)}`);
  const primary = group.filter(row => row.policy === 'native' && row.master.endsWith('-1'));
  const actor = primary[0]?.roster[0];
  const rounds = primary.reduce((sum, row) => sum + row.rounds, 0);
  const contributions = primary.map(row => row.contribution[actor]);
  characterSummary[name] = {
    roster: primary[0]?.roster, masters: masterChoices,
    byEncounter: grouped(group, row => `${row.policy}/${row.master}/${row.encounter}`),
    master1Contribution: {
      damagePerRound: contributions.reduce((sum, value) => sum + value.damage, 0) / rounds,
      healingPerRound: contributions.reduce((sum, value) => sum + value.healing, 0) / rounds,
      shieldsCreatedPerRound: contributions.reduce((sum, value) => sum + value.shieldsCreated, 0) / rounds,
      periodicDamageShare: contributions.reduce((sum, value) => sum + value.periodicDamage, 0) /
        Math.max(1, contributions.reduce((sum, value) => sum + value.damage, 0)),
      meanLastFlareCasts: mean(contributions.map(value => value.actions.ultimate ?? 0)),
    },
  };
}
const training = rows.filter(row => row.category === 'training-continuous'), trainingFrontiers = {};
for (const row of training) {
  const key = `${row.squad}/${row.build}/${row.seed}`, wave = Number(row.encounter.split(' ')[1]);
  trainingFrontiers[key] ??= { highestCleared: 0, stoppedAt: 0, stopOutcome: '', enemyLevel: 0 };
  const value = trainingFrontiers[key];
  if (row.outcome === 'win') value.highestCleared = Math.max(value.highestCleared, wave);
  if (wave >= value.stoppedAt) Object.assign(value, { stoppedAt: wave, stopOutcome: row.outcome, enemyLevel: row.enemyLevel });
}
const summary = {
  evidence, total: summarize(rows), categories: grouped(rows, row => row.category), storyFrontiers: frontiers,
  endgameByBuildFamily: grouped(endgame, row => `${row.build}/${family(row)}`),
  endgameBySquadBuild: grouped(endgame, row => `${row.squad}/${row.build}`),
  endgameBySquadBuildFamily: grouped(endgame, row => `${row.squad}/${row.build}/${family(row)}`),
  endgameByExactEncounter: grouped(endgame, row => `${row.squad}/${row.build}/${row.encounter}`),
  characters: characterSummary,
  solo: grouped(rows.filter(row => row.category === 'solo'), row => `${row.squad}/${row.build}/${row.encounter}`),
  trainingFrontiers,
  lateCurve: grouped(rows.filter(row => row.category === 'late-curve'), row => `${row.squad}/${row.level}/${row.build}/${row.encounter}/Lv${row.enemyLevel}`),
  balancedCharacters: grouped(rows.filter(row => row.category === 'character-balanced'), row => `${row.squad}/${row.master}/${row.policy}/${row.encounter}`),
  enemyWhatIf: grouped(rows.filter(row => row.category === 'enemy-what-if'), row => `${row.scenario}/${row.build}/${row.encounter}`),
  enemyWhatIfSquads: grouped(rows.filter(row => row.category === 'enemy-what-if'), row => `${row.scenario}/${row.squad}/${row.build}/${row.encounter}`),
  timeoutFollowups: rows.filter(row => row.category === 'timeout-followup').map(({ contribution, ...row }) => row),
  levelSweep: grouped(rows.filter(row => row.category === 'level-sweep-calamity'), row => `${row.enemyLevel}/${row.build}`),
  levelSweepSquads: grouped(rows.filter(row => row.category === 'level-sweep-calamity'), row => `${row.squad}/${row.enemyLevel}/${row.build}`),
  levelSweepPatterns: grouped(rows.filter(row => row.category === 'level-sweep-calamity'), row => `${row.encounter}/${row.build}`),
  levelSweepStandard: grouped(rows.filter(row => row.category === 'level-sweep-standard'), row => `${row.enemyLevel}/${row.build}`),
  levelSweepCharacters: grouped(rows.filter(row => row.category === 'level-sweep-character'), row => `${row.squad}/${row.enemyLevel}/${row.master}`),
  timeouts: grouped(rows.filter(row => row.outcome === 'timeout'), row => `${row.category}/${row.squad}/${row.build}/${row.encounter}`),
};
writeFileSync(output, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ evidence: evidence.map(({ sha256, completed, seconds }) => ({ sha256, completed, seconds })),
  total: summary.total, categories: summary.categories }, null, 2));
