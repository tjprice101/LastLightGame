import { build } from 'esbuild';
import { mkdtemp, rm, open, writeFile } from 'node:fs/promises';
import { writeSync, readFileSync, createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [output, report, mode] = process.argv.slice(2);
if (!output || !report || (mode && mode !== '--render'))
  throw new Error('Usage: node tools\\run_roster_capability.mjs <results.jsonl> <report.md> [--render]');
const temporary = await mkdtemp(join(tmpdir(), 'last-light-roster-audit-'));
let file;
try {
  const bundle = join(temporary, 'audit.mjs');
  await build({ entryPoints: ['tools/roster-capability.ts'], outfile: bundle, bundle: true,
    platform: 'node', format: 'esm', target: 'node22', legalComments: 'none' });
  const api = await import(pathToFileURL(bundle).href);
  const { auditLevels: levels, auditProfiles: profiles, auditSeeds: seeds, auditRounds: rounds,
    auditRoster: roster, auditGear, auditState, measureCapability, rosterCombinations, screenMasters,
    statSnapshot, resourceCost, tankProbe, chargedBurst, gearBudget, gearNames } = api;
  const hash = createHash('sha256').update(readFileSync(bundle)).digest('hex');
  const combinations = rosterCombinations(), rows = [], solo = [], screens = [];
  let metadata, done;
  if (mode === '--render') {
    for await (const line of createInterface({ input: createReadStream(resolve(output)), crlfDelay: Infinity })) {
      const record = JSON.parse(line);
      if (record.metadata) metadata = record.metadata;
      if (record.measurement) rows.push(record.measurement);
      if (record.solo && typeof record.solo === 'object') solo.push(record.solo);
      if (record.screening) screens.push(record.screening);
      if (record.completed) done = record;
    }
    if (!metadata || metadata.sourceHash !== hash || !done || done.mainRuns !== 175392 ||
        rows.length !== 58464 || solo.length !== 672 || done.rows !== rows.length)
      throw new Error('Rendering requires a complete, source-matching audit result.');
  } else {
  file = await open(resolve(output), 'wx');
  metadata = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    sourceHash: hash, levels, profiles, seeds, rounds, startedAt: new Date().toISOString() };
  const emit = row => writeSync(file.fd, JSON.stringify(row) + '\n');
  emit({ metadata });
  const started = Date.now();
  let runs = 0;
  const aggregate = (team, level, profile, mode, gear) => {
    const samples = seeds.map(seed => {
      runs++;
      return measureCapability(auditState(team, level, profile, seed, gear), profile, mode);
    });
    const numeric = ['damage', 'healing', 'shields', 'peakShield', 'opening', 'bestRound', 'sustained', 'actions', 'normal', 'skills', 'flares', 'hp', 'defense'];
    const row = { level, profile, mode, roster: team, size: team.length,
      ...Object.fromEntries(numeric.map(key => [key, samples.reduce((sum, sample) => sum + sample[key], 0) / samples.length])),
      minSustained: Math.min(...samples.map(sample => sample.sustained)),
      maxSustained: Math.max(...samples.map(sample => sample.sustained)),
      exhausted: samples.some(sample => sample.exhausted),
      contributions: Object.fromEntries(team.map(id => [id, Object.fromEntries(['damage', 'healing', 'shields'].map(key =>
        [key, samples.reduce((sum, sample) => sum + sample.contributions[id][key], 0) / samples.length]))])) };
    emit({ measurement: row });
    rows.push(row);
    return row;
  };
  for (const level of levels) for (const profile of profiles) {
    const selected = new Map();
    if (profile === 'lucky' || profile === 'ceiling') for (const unit of roster) {
      const screened = screenMasters(unit.id, level, profile);
      selected.set(unit.id, screened.best.gear);
      screens.push({ level, profile, id: unit.id, ...screened });
      emit({ screening: { level, profile, id: unit.id, ...screened } });
    }
    const mergeGear = team => {
      const gear = auditGear(team, profile);
      for (const id of team) if (selected.has(id)) {
        const choice = selected.get(id);
        gear.equipment[id] = choice.equipment[id];
        gear.masters[id] = choice.masters[id];
        Object.assign(gear.upgrades, choice.upgrades);
      }
      return gear;
    };
    for (const team of combinations) {
      const gear = mergeGear(team);
      const offensive = aggregate(team, level, profile, 'output', gear);
      const support = aggregate(team, level, profile, 'support', gear);
      if (team.length === 1) {
        const id = team[0];
        const details = { id, level, profile, stats: statSnapshot(id, level, profile, gear),
          offensive, support, burst: chargedBurst(id, level, profile, gear),
          tank: tankProbe(id, level, profile, gear), gear, budget: gearBudget(gear) };
        solo.push(details); emit({ solo: details });
      }
    }
    console.log(`Completed Lv.${level} ${profile}: ${runs} main runs; ${((Date.now() - started) / 1000).toFixed(1)}s`);
  }
  done = { completed: true, mainRuns: runs, rows: rows.length, solo: solo.length,
    screeningCandidates: screens.reduce((sum, screen) => sum + screen.candidates.length, 0),
    seconds: (Date.now() - started) / 1000 };
  emit(done);
  }
  const name = id => roster.find(unit => unit.id === id).name;
  const fmt = n => Number(n.toFixed(1)).toLocaleString('en-US', { maximumFractionDigits: 1 });
  const names = ids => ids.map(name).join(' / ');
  const rank = (level, profile, size, mode = 'output', metric = 'sustained') =>
    rows.filter(row => row.level === level && row.profile === profile && row.size === size && row.mode === mode)
      .sort((a, b) => b[metric] - a[metric]);
  const selectedGear = (team, level, profile) => {
    const gear = auditGear(team, profile);
    for (const id of team) {
      const measured = solo.find(row => row.id === id && row.level === level && row.profile === profile);
      gear.equipment[id] = measured.gear.equipment[id];
      gear.masters[id] = measured.gear.masters[id];
      Object.assign(gear.upgrades, measured.gear.upgrades);
    }
    return gear;
  };
  const followupSeeds = [1, 1729, 12345, 54321, 104729, 65537, 314159, 271828, 8675309, 4294967295];
  let followupRuns = 0;
  const longMeasure = (team, profile, gear) => {
    const samples = followupSeeds.map(seed => {
      followupRuns++;
      return measureCapability(auditState(team, 105, profile, seed, gear), profile, 'output', 90).sustained;
    });
    return { mean: samples.reduce((a, b) => a + b, 0) / samples.length, low: Math.min(...samples), high: Math.max(...samples) };
  };
  const longRows = ['planned', 'ceiling'].flatMap(profile => [1, 2, 3].map(size => {
    const candidate = rank(105, profile, size)[0];
    return { ...candidate, long: longMeasure(candidate.roster, profile, selectedGear(candidate.roster, 105, profile)) };
  }));
  const ablations = [];
  for (const size of [1, 3]) {
    const original = longRows.find(row => row.profile === 'ceiling' && row.size === size);
    const gear = selectedGear(original.roster, 105, 'ceiling');
    for (const removed of ['glassroot-gimbal', 'immortal-vessel', 'horizon-heartcase',
      'calamitic-cathedral-final-equation', 'calamitic-causality-funeral-engine',
      'calamitic-throne-borrowed-tomorrows', 'infernic-cinder-testament', 'firstlight-cam', 'masters',
      ...(size === 3 ? Object.values(gear.masters).filter(Boolean) : [])]) {
      const personal = Object.values(gear.masters).includes(removed);
      if (removed !== 'masters' && !personal && !Object.values(gear.equipment).some(slots => slots.includes(removed))) continue;
      const reduced = structuredClone(gear);
      for (const id of original.roster) {
        if (removed === 'masters' || reduced.masters[id] === removed) delete reduced.masters[id];
        else reduced.equipment[id] = reduced.equipment[id].map(piece => piece === removed ? null : piece);
      }
      const result = longMeasure(original.roster, 'ceiling', reduced);
      ablations.push({ team: original.roster, removed, baseline: original.long.mean, ...result });
    }
  }
  const lines = [
    '# Roster capability audit: levels 0-105',
    '',
    'Read-only paper/laboratory audit, not an enemy-clear, progression-time or balance-change claim.',
    '',
    '## At a glance',
    '',
    'The table contrasts learnable Common +0 play with developed-account equipment ceilings. The teams are conditional on ownership, not a claim that every account can field them at that level. DPR means damage per complete round against zero Defense, including delayed damage; it is not real-time DPS.',
    '',
    '| Level | Planned best solo DPR | Planned best duo DPR | Planned best trio DPR | Ceiling best trio DPR |',
    '|---:|---|---|---|---|',
    ...levels.map(level => `| ${level} | ${[1, 2, 3].map(size => {
      const best = rank(level, 'planned', size)[0];
      return `${names(best.roster)}: ${fmt(best.sustained)}`;
    }).join(' | ')} | ${names(rank(level, 'ceiling', 3)[0].roster)}: ${fmt(rank(level, 'ceiling', 3)[0].sustained)} |`),
    '',
    '### Starting with an ordinary roster',
    '',
    'Only ONE starter is guaranteed. The table below restricts candidates to the six Standard five-stars and therefore excludes rare six-star and War dependencies, but the additional bearers still require pulls. It is a roster-restricted output sample, not a guaranteed free team or an enemy-safe team. A useful healer/protector can be preferable to the top damage-only combination.',
    '',
    '| Level | Best five-star-only Common solo / duo / trio | Free-starter options: Infernis / Tizu / Flora DPR |',
    '|---:|---|---|',
    ...levels.map(level => {
      const candidates = rows.filter(row => row.level === level && row.profile === 'planned' && row.mode === 'output' &&
        row.roster.every(id => roster.find(unit => unit.id === id).stars === 5));
      return `| ${level} | ${[1, 2, 3].map(size => {
        const best = candidates.filter(row => row.size === size).sort((a, b) => b.sustained - a.sustained)[0];
        return `${names(best.roster)}: ${fmt(best.sustained)}`;
      }).join('<br>')} | ${['ember', 'tide', 'sprout'].map(id =>
        fmt(solo.find(row => row.id === id && row.level === level && row.profile === 'planned').offensive.sustained)).join(' / ')} |`;
    }),
    '',
    '## Reproduction and scope',
    '',
    `- Source base commit: \`${metadata.commit}\`; bundled simulation SHA-256: \`${hash}\`.`,
    `- Levels: ${levels.join(', ')}. All16 Element-Bearers; all16 solos,120 duos and560 trios at every checkpoint/profile.`,
    `- ${done.mainRuns.toLocaleString('en-US')} main seeded measurements; ${done.rows.toLocaleString('en-US')} aggregates; ${done.screeningCandidates} gear/Master candidates screened.`,
    `- ${rounds} complete player/phase cycles; discard first9 and average last9 for the main sustained-output window. This is not a guarantee every loop has reached steady state; see the90-cycle checks. Seeds: ${seeds.join(', ')}.`,
    `- ${followupRuns} additional seeded90-cycle output measurements validate selected Lv.105 leaders and controlled item removal; ten seeds, final45 cycles measured.`,
    '- Fresh runs start at zero Gauge. Precharged burst and defensive capacity are separate explicitly funded probes.',
    '- Real `act` resolves costs, cooldowns, recovery, crits, native and Conduit effects. The tool-only boundary calls production Burn/phase/turn/shield hooks without hostile actions.',
    '- One effectively inexhaustible zero-Defense, unshielded neutral measuring target. No elemental matchup multiplier, foe levels, boss kit, loot, incoming Gauge or damage-fed resources.',
    '- This measures damage per action/round, NOT seconds-based DPS. Speed settings are presentation only.',
    '- All targets remain alive; execute/on-defeat benefits are absent. AoE is measured per one target; three-target results are NOT safely obtained by multiplying every effect by three.',
    '- Output mode starts healthy, with no artificial damage. Support mode resets living HP to10% before actions and phase healing to expose actual effective-heal throughput; these deficits are NOT damage suffered, and do not feed damage-taken resources.',
    '- Healing is actual restored HP, not offered healing or overheal. Shields count newly granted layers/refresh increments, NOT absorbed damage or stackable permanent EHP. No fabricated shield consumption.',
    '- Recovery/extra actions and delayed damage continue through full cycles. Incoming-trigger tanks/counters are deliberately underrepresented. Do not call a tank weak from this damage leaderboard.',
    '- Three crit seeds are a spread, not an exact expectation or95% confidence interval. Rankings are best MEASURED within this bounded candidate/pilot search, not a proof of global optimal play.',
    '- Distinct team sets are exhaustive; actor-order permutations, all90-Conduit combinations, all mixed per-character level distributions and every rotation are not. Masters are screened solo; a team-specific Master can beat the selected one.',
    '- No game mechanics, rewards, saves, balance values or online accounts were changed. Report/tooling only.',
    '',
    '## Progression and luck assumptions',
    '',
    '| Profile | Equipment and play | Interpretation |',
    '|---|---|---|',
    '| floor | Empty slots; Normal only | Deliberately bottom-of-barrel control; not a recommendation. |',
    '| unlucky | Eight Store Commons +0; Normal only | Farmable gear without rare drops; separates poor play from empty slots. |',
    '| planned | Same Commons +0; native-aware skills | Learnable no-rare-luck baseline; Store resources still have to be earned. |',
    '| farmed | Fixed eight-piece Rare/Legendary package +0 | Long-farm target, not an average inventory guaranteed by level. Focus reduces name lottery. |',
    '| lucky | Four matching Omnics, four ordinary stat pieces +0 and screened personal Master | Conditional high-roll/late-account package, NOT a realistic fresh Lv.0/20 expectation. |',
    '| ceiling | Best sampled Calamitic, HP/Glassroot/Stasis or hybrid package +5; four matching Omnics; screened Master | Legal equipment ceiling on a developed account; no legacy weapon ranks, no claim it is obtainable at that level on a fresh account. |',
    '',
    'Main progression uses the least evolved form that admits the checkpoint: Evo1/1/2/3/5/6/6. Ceiling can evolve immediately at the current cap: Evo1/1/2/4/5/6/6. An early alternate bearer can use account-wide gear only if a stronger account already earned it.',
    '',
    '| Same-account highest level | Actual access facts, not assumed clears |',
    '|---|---|',
    '| 0 | One chosen Infernis/Tizu/Flora is free. The other two are NOT free teammates. Lucky banner pulls may recruit other bearers, but gear remains acquisition-limited. |',
    '| 20 | Machines gate is highest Lv.10 AND Story region1 clear. Gate access does not prove final-boss or stage26 farming. Dungeons are still locked below30. |',
    '| 40 | Material dungeons open30; Heaven/Abyss remain locked until50. No assumed Master/Omnic pipeline merely from being40. |',
    '| 60 | Heaven/Abyss50, Treasury/Sanctuary60. Evo3->4 needs explicit form3+ fodder. Build/mat farming now matters; level alone grants nothing. |',
    '| 80 | Rose event opens75; War still locked until85. Evo4->5 also consumes two form4+ fodder copies; gear/roster can dominate20 extra levels. |',
    '| 100 / 105 | All level gates met, not all clears. Evo5->6 consumes three form5+ copies. Calamitics require a Normal final clear, Calamity EX+1 clear,100 tokens per name, then upgrades. |',
    '',
    'All roster combinations below are conditional on ownership. For a fresh account whose highest bearer is below85, War bearers are unavailable; low-level War rows are developed-account alternate-character ceilings, not early progression suggestions. Captured Elemental-Devourers cap60 and are outside this16-bearer audit.',
    '',
    '## Acquisition/work, using current live rates',
    '',
    '- Focused unowned Rare/Legendary/Omnic name:12.5 /18.18 /33.33 eligible kills on average. Omnic requires Machines stage26+. These are geometric means per selected name, NOT a guarantee or proof of clearability.',
    '- Master Chest:5% at final stage35 only; mean20 final clears, median14,90th percentile45 for one chest. You choose an unowned Master; additional same-character alternatives require additional chests. No random Master-name lottery.',
    '- Rare15 / Legendary15 / Omnic45 full pools. Independent tiers can succeed together. Name unlocks and upgrades are account-wide: one copy can serve several bearers; four-Omnic cap and element matching still apply per member.',
    '- A named5-star Standard bearer has1% divided across six names:0.1667% natural rate (mean600 pulls without pity). A named6-star Standard bearer has0.1% divided across four:0.025% natural (mean4000 without pity). Highest-tier pity changes those means drastically; the no-pity numbers must NOT be used as real six-star expected cost.',
    '- Current pity is80 highest-star /150 unowned-highest-star. From a fresh roster, at most600 Standard pulls guarantee all four highest6-stars, at most450 Rose pulls all three highest Roses (ignoring other income/availability). No target5-star guarantee: unlucky tails remain. Costs are10 Null-Prismatica per pull.',
    '- Do not equate lower stars with easier targeted acquisition: a specific five-star lacks the highest-tier ownership guarantee. A five-star-only lineup can still be harder to finish than a lucky/pity-built six-star lineup. The free chosen starter is the only guaranteed no-pull bearer.',
    '- Rose natural character tier1.1% split three:0.3667% per name. War recruitment1% per final clear, no pity: mean100 /median69 /90th percentile230 eligible clears per name. Those are acquisition odds only, not simulated battle wins.',
    '- No paid spending, session length, income-per-hour, capture fodder grind or activity clear feasibility is invented here.',
    '',
    '### Gear acquisition bills for leading Lv.105 configurations',
    '',
    'Counts deduplicate account-wide ordinary names. Per-tier means are focused eligible kills for those names; independent rarity rolls can overlap, so do NOT add the three columns as a total kill requirement. Master means count final-boss clears for the required chosen chests. Store prices, upgrades and Calamitic tokens are separate bills; neither entry access nor these averages establishes clearability.',
    '',
    '| Profile / slots | Team | Store Prismatica | Components | Calamitic tokens | Rare / Legendary / Omnic eligible-kill means | Masters / mean final clears |',
    '|---|---|---:|---:|---:|---|---|',
    ...profiles.flatMap(profile => [1, 2, 3].map(size => {
      const best = rank(105, profile, size)[0], budget = gearBudget(selectedGear(best.roster, 105, profile));
      return `| ${profile} /${size} | ${names(best.roster)} | ${fmt(budget.prismatica)} | ${fmt(budget.components)} | ${fmt(budget.calamiticTokens)} | ${fmt((budget.rarities.Rare ?? 0) / .08)} /${fmt((budget.rarities.Legendary ?? 0) / .055)} /${fmt((budget.rarities.Omnic ?? 0) / .03)} | ${budget.masters} /${fmt(budget.masters / .05)} |`;
    })),
    '',
    '| Bearer | Role | Source / natural chance per attempt |',
    '|---|---|---|',
    ...roster.map(unit => `| ${unit.name} | ${unit.role} | ${unit.naturalPullChance
      ? `${['ember', 'tide', 'sprout'].includes(unit.id) ? 'One may be your free starter; otherwise ' : ''}${['rosetta', 'thornia', 'crinso'].includes(unit.id) ? 'Rose' : 'Standard'} ${fmt(unit.naturalPullChance * 10000)}/10,000 pulls`
      : 'War final recruitment:1% per eligible clear; highest account Lv.85 gate'} |`),
    '',
    '## Exact cumulative leveling/evolution spending',
    '',
    'Costs below are per bearer from Lv.0/Evo1, minimum evolution. They exclude separately consumed evolution fodder, ownership recruitment and gear. The ordinary and Rose paths use their actual cost APIs; material IDs/quantities are preserved in the result data.',
    '',
    '| Level | Evo | Prismatica per bearer | Ordinary materials (Infernis example) | Rose materials |',
    '|---:|---:|---:|---|---|',
    ...levels.map(level => {
      const ordinary = resourceCost('ember', level), rose = resourceCost('rosetta', level);
      const materialText = cost => Object.entries(cost.materials).map(([id, count]) => `${id}:${count}`).join('; ') || 'None';
      return `| ${level} | ${ordinary.progress.evolution} | ${fmt(ordinary.fractalis)} | ${materialText(ordinary)} | ${materialText(rose)} |`;
    }),
    '',
    '## All-character numerical checkpoints',
    '',
    'Naked core stats; minimum evolution; no legacy weapon ranks. Crit is percentage points, crit multiplier is a multiplier. Planned/lucky/ceiling columns are damage per sustained round from fresh zero-Gauge starts after ramp-up.',
  ];
  for (const level of levels) {
    lines.push('', `### Level ${level}`, '', '| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |',
      '|---|---:|---:|---:|---|---:|---:|---:|---:|---|');
    for (const unit of roster) {
      const details = profile => solo.find(row => row.level === level && row.profile === profile && row.id === unit.id);
      const base = details('floor').stats, best = details('ceiling');
      lines.push(`| ${unit.name} | ${fmt(base.health)} | ${fmt(base.damage)} | ${fmt(base.defense)} | ${fmt(base.crit * 100)}% /${fmt(base.critMultiplier)}x | ${fmt(base.shatterCapacity)} | ${fmt(details('planned').offensive.sustained)} | ${fmt(details('lucky').offensive.sustained)} | ${fmt(best.offensive.sustained)} | ${best.burst.action}: ${fmt(best.burst.mean)} /${fmt(best.burst.maximum)} |`);
    }
  }
  lines.push('', '## Ranked solo, duo and trio configurations at every checkpoint', '',
    'Each cell lists the top3 measured configurations for its metric within that profile. DPR is the final9-round mean. HPR is effective healing per complete cycle under reset deficits; SPR is newly created shielding per complete cycle, not absorption. The support rotation may differ from the damage rotation: these maxima are NOT simultaneously available.',
    'Roster ownership/source remains a separate constraint; read the acquisition table before treating any trio as practical.');
  for (const level of levels) for (const profile of profiles) {
    lines.push('', `### Lv.${level} - ${profile}`, '', '| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |', '|---:|---|---|---|');
    for (const size of [1, 2, 3]) {
      const select = (mode, key) => rows.filter(row => row.level === level && row.profile === profile && row.mode === mode && row.size === size)
        .sort((a, b) => b[key] - a[key]).slice(0, 3);
      const damage = select('output', 'sustained').map(row => `${names(row.roster)}: **${fmt(row.sustained)}** (${fmt(row.minSustained)}-${fmt(row.maxSustained)})`).join('<br>');
      const healing = select('support', 'healing').map(row => `${names(row.roster)}: ${fmt(row.healing / rounds)}`).join('<br>');
      const shields = select('support', 'shields').map(row => `${names(row.roster)}: ${fmt(row.shields / rounds)}`).join('<br>');
      lines.push(`| ${size} | ${damage} | ${healing} | ${shields} |`);
    }
    const budget = solo.filter(row => row.level === level && row.profile === profile)
      .sort((a, b) => b.offensive.sustained - a.offensive.sustained)[0].budget;
    lines.push('', `Top solo gear budget (distinct account unlocks): ${JSON.stringify(budget)}. Does not include leveling, fodder or recruitment.`);
  }
  lines.push('', '## Additional equipped stats at level105', '',
      'Core stat tables above are naked. These are the actual sampled ceiling loadouts, before situational combat buffs. The four additional Phase0 stats start at Skill Power100%, Duration0 extra turns, Efficiency0%, Gauge Gain100% and do not scale with level; equipment changes them. Efficiency remains subject to the live50% cap and action-specific Gauge floors.',
      '', '| Element-Bearer | Equipped HP / ATK / DEF | Skill Power | Duration | Efficiency | Gauge gain |',
      '|---|---|---:|---:|---:|---:|',
      ...roster.map(unit => {
        const stats = solo.find(row => row.level === 105 && row.profile === 'ceiling' && row.id === unit.id).stats;
        return `| ${unit.name} | ${fmt(stats.health)} /${fmt(stats.damage)} /${fmt(stats.defense)} | ${fmt(stats.skillPower * 100)}% | ${fmt(stats.skillDuration)} | ${fmt(stats.skillEfficiency * 100)}% | ${fmt(stats.gaugeGain * 100)}% |`;
      }));
  const roleTeams = [
      { ids: ['ember', 'tide', 'sprout'], purpose: 'Damage / barrier / delayed healing; two additional starter pulls required.' },
      { ids: ['ember', 'atmoso', 'elise'], purpose: 'Five-star damage-and-delayed-output squad; little native sustain.' },
      { ids: ['tide', 'sprout', 'razor'], purpose: 'Barrier / delayed healing / revenge tank; Wounds are NOT fed in this lab.' },
      { ids: ['ember', 'bliss', 'disciple'], purpose: 'Persistent damage / action-order hybrid / next-action amplification.' },
      { ids: ['rosetta', 'thornia', 'crinso'], purpose: 'Rose coordination / traps / alternating combo; trap pressure absent.' },
      { ids: ['rosetta', 'bliss', 'disciple'], purpose: 'Quarry hit/Gauge feedback plus order-sensitive offense/support.' },
  ];
  lines.push('', '## Role-composed squads, not only damage winners', '',
      'These are contrasting team designs to inspect on paper, not validated enemy-clear recommendations. Team slots matter: support provides action economy or mitigation that a zero-pressure damage ranking does not value. HPR/SPR use the separate support rotation and cannot be promised alongside the listed output DPR.',
      '',
      ...roleTeams.map(team => `- **${names(team.ids)}:** ${team.purpose}`),
      '',
      '| Level / build | Team | Output DPR | Support HPR / SPR | Combined maximum HP |',
      '|---|---|---:|---|---:|',
      ...levels.flatMap(level => ['planned', 'ceiling'].flatMap(profile => roleTeams.map(team => {
        const lookup = mode => rows.find(row => row.level === level && row.profile === profile && row.mode === mode &&
          row.size === 3 && team.ids.every(id => row.roster.includes(id)));
        const output = lookup('output'), support = lookup('support');
        return `| ${level} /${profile} | ${names(team.ids)} | ${fmt(output.sustained)} | ${fmt(support.healing / rounds)} /${fmt(support.shields / rounds)} | ${fmt(output.hp)} |`;
      }))));
  lines.push('', '## Tanking and support capacity by character', '',
    'Tank probe: full HP before a fully funded single action (or none), choosing the action that survives the largest scheduled noncritical post-Defense packet through real incoming hooks. Live stat changes do not grant free healing. No opponent Attack/level is selected. Defense is listed separately; do NOT add it as HP or compare these packets with pre-Defense damage. It is not sustained tanking, and cooldown-based rescue/deferral can inflate one-hit results. Equipment is the sampled output build, not an exhaustive defensive-build search.',
    'The packet uses a fixed non-proc first roll (0.7769), so Stasis is not credited with a lucky save. No test of sustained incoming pressure, enemy Normal evasion or incoming-crit support is implied.',
    '', '| Lv | Bearer | Planned HPR / SPR | Ceiling HPR / SPR | Ceiling HP / DEF | Precharged shield | One-hit post-DEF packet survived |', '|---:|---|---|---|---|---:|---:|');
  for (const level of levels) for (const unit of roster) {
    const planned = solo.find(row => row.level === level && row.id === unit.id && row.profile === 'planned');
    const best = solo.find(row => row.level === level && row.id === unit.id && row.profile === 'ceiling');
    lines.push(`| ${level} | ${unit.name} | ${fmt(planned.support.healing / rounds)} /${fmt(planned.support.shields / rounds)} | ${fmt(best.support.healing / rounds)} /${fmt(best.support.shields / rounds)} | ${fmt(best.tank.hp)} /${fmt(best.tank.defense)} | ${fmt(best.tank.shield)} | ${best.tank.action}: ${best.tank.censored ? '>=' : ''}${fmt(best.tank.packet)} |`);
  }
  lines.push('', '## Exact sampled loadouts and alternatives', '',
    'Every member has eight ordinary slots. Upgrades are +0 except ceiling (+5); Masters never upgrade. For lucky/ceiling, all three personal Masters were screened, plus three ceiling ordinary packages. Screening is solo sustained offense, not a global team optimum. Other-role alternatives appear below.');
  for (const profile of profiles) {
    lines.push('', `### ${profile} gear`);
    for (const unit of roster) {
      const details = solo.find(row => row.level === 105 && row.profile === profile && row.id === unit.id);
      lines.push(`- **${unit.name}:** ${gearNames(details.gear.equipment[unit.id]).join('; ') || 'Empty'}${details.gear.masters[unit.id] ? `; Master: ${details.gear.masters[unit.id]}` : ''}.`);
    }
  }
  lines.push('', '### Ceiling Master/package selection at each level', '',
    '| Lv | Bearer | Output choice (variant / Master) | Highest measured healing alternative | Largest-HP alternative |',
    '|---:|---|---|---|---|');
  for (const screen of screens.filter(row => row.profile === 'ceiling')) {
    const healer = [...screen.candidates].sort((a, b) => b.healing - a.healing)[0];
    const tank = [...screen.candidates].sort((a, b) => b.hp - a.hp)[0];
    lines.push(`| ${screen.level} | ${name(screen.id)} | ${screen.best.variant} /${screen.best.master} | ${healer.variant} /${healer.master}: ${fmt(healer.healing)} HPR | ${tank.variant} /${tank.master}: ${fmt(tank.hp)} HP |`);
  }
  lines.push('', '## Automated outlier flags (investigate, not nerf verdicts)', '',
    'Ratios compare real sampled builds, not isolated causal effects. Shared gear, native loops, Gauge costs and role/pilot can all change together. A large ratio is a reason for a controlled follow-up, not proof of a bug.');
  for (const level of levels) {
    const ranked = solo.filter(row => row.level === level && row.profile === 'ceiling').sort((a, b) => b.offensive.sustained - a.offensive.sustained);
    const best = ranked[0], median = (ranked[7].offensive.sustained + ranked[8].offensive.sustained) / 2;
    const planned = solo.find(row => row.level === level && row.profile === 'planned' && row.id === best.id);
    lines.push(`- Lv.${level}: ${name(best.id)} leads sampled ceiling solo output at **${fmt(best.offensive.sustained)} DPR**, ${fmt(best.offensive.sustained / median)}x roster ceiling median and ${fmt(best.offensive.sustained / planned.offensive.sustained)}x its own planned build. Seed spread ${fmt(best.offensive.minSustained)}-${fmt(best.offensive.maxSustained)}. ${best.offensive.actions} mean actions/${rounds} cycles; ${best.offensive.flares} mean Last Flares.`);
  }
  lines.push('', '### Longer-run consistency checks', '',
    'The leading measured solo, duo and trio in each of planned/ceiling were rerun for90 cycles across ten seeds. These test duration/crit consistency, not all possible rotations. The90-cycle metric uses only the final45 cycles.',
    '', '| Profile | Team | 18-cycle DPR | 90-cycle DPR mean / seed range |',
    '|---|---|---:|---|',
    ...longRows.map(row => `| ${row.profile} | ${names(row.roster)} | ${fmt(row.sustained)} | ${fmt(row.long.mean)} /${fmt(row.long.low)}-${fmt(row.long.high)} |`),
    '', '### Controlled item-removal checks', '',
    'Same selected Lv.105 solo/trio, pilot, ninety cycles and ten seeds. Remove the named item from every wearer (or every Master); leave those slots empty, do not substitute gear. Negative loss means the removal improved this particular rotation. This is a marginal effect in the tested package, not a universal item tier list.',
    '', '| Team | Removed | Full-build DPR | Without DPR | Output lost |',
    '|---|---|---:|---:|---:|',
    ...ablations.map(row => `| ${names(row.team)} | ${row.removed} | ${fmt(row.baseline)} | ${fmt(row.mean)} | ${fmt((1 - row.mean / row.baseline) * 100)}% |`));
  const strongest = longRows.find(row => row.profile === 'ceiling' && row.size === 3);
  const common = longRows.find(row => row.profile === 'planned' && row.size === 3);
  const investment = gearBudget(selectedGear(strongest.roster, 105, 'ceiling'));
  const standout = ablations.filter(row => row.team.length === 3)
    .sort((a, b) => (a.mean / a.baseline) - (b.mean / b.baseline)).slice(0, 3);
  lines.push('', '### Assessment: what is actually worth reviewing', '',
    `- **High-priority package outlier:** ${names(strongest.roster)} reaches ${fmt(strongest.long.mean)} DPR over the final45 of90 cycles, versus ${fmt(common.long.mean)} for the selected Common-build trio: ${fmt(strongest.long.mean / common.long.mean)}x. This is not a like-for-like character comparison, but the magnitude warrants a focused balance review rather than dismissing it as merely a lucky crit.`,
    `- **Measured levers:** ${standout.map(row => `${row.removed}: ${fmt((1 - row.mean / row.baseline) * 100)}% output lost on removal`).join('; ')}. Removing shared Health-to-Skill-Power scaling or the Quarry Master/Gauge loop is more informative than blindly reducing every member's base stats. These marginal losses overlap and must not be added.`,
    `- **Not free or casually guaranteed:** the selected package requires ${investment.calamiticTokens} Calamitic tokens, ${fmt(investment.components)} upgrade components, ${investment.masters} chosen Masters and the listed unique Omnics, plus roster recruitment/leveling. The ordinary names/upgrades are shared account unlocks, not three separate copies. A large grind is a real access restriction, but not by itself evidence that a >1000x output gap is healthy.`,
    '- **Nerf recommendation:** prioritize reviewing this equipment/Gauge feedback package if comparable late-account builds are intended to compete. Do not apply a blanket Rosetta, Crinso, Disciple or Infernis nerf from this opponent-free chart. No balance adjustment is implemented or approved here.',
    '- **Ramp matters:** the Rosetta/Disciple duo changes materially between the18- and90-cycle windows. The full matrix is a finite-window comparison, not an exhaustive steady-state ranking. No infinite action loop was found; very high finite damage is a separate concern.',
    '- **Lower-cost progression:** Infernis leads every sampled Common solo checkpoint. That is meaningful offensive value, but this zero-pressure test favors persistent Burn and cannot price tanking, enemy control or rescue. Flora/Tizu/Razor/Bruno require their healing/mitigation columns and role mechanics, not a damage-only verdict.');
  lines.push('', '### Interpretation safeguards and next-stage questions', '',
    '- No result here establishes an automatic game break, invulnerability, an infinite action loop or a necessary nerf. Per-round action guards and finite-value checks passed for the completed matrix; expensive ceilings are conditional account power.',
    '- Zero incoming damage removes Razor Wounds, Bruno interception, Orvella hit resistance, Thornia attack-trigger traps, Tizu absorption Gauge, Seal prevention, incoming-driven Omnics and Stasis value. Those need later standardized pressure/matchup tests; do not nerf or buff them from this chart alone.',
    '- Glassroot/HP packages, Calamitic extra actions and cost reduction are candidate systemic outliers. Inspect the measured multipliers/rotation frequency and account-wide acquisition cost before touching individual characters.',
    '- A three-member squad adds independent actions, targets for support and coordinated native triggers, but also three recruitment/progression bills. Solo is cheaper, not automatically stronger per account-hour; no account-hour model was run.',
    '- Flora delayed healing and Bliss Closing bonuses need ordering/headroom; a solo Bliss cannot use Closing. Rosetta needs distinct allied direct hitters; Disciple buffs can waste an action if the recipient uses a mismatched next action.',
    '- Precharged bursts, artificial healing headroom, shield creation and one-hit packet survival are separate experiments and cannot be added into a single sustainable “DPS+tank+heal” score.',
    '- Investigate suspected nerfs with an ablation (remove one item), longer horizons, more seeds and realistic acquisition restrictions, then actual pressure/encounters only if the owner requests that phase.',
    '',
    'Full aggregate rows, per-source contribution, Master candidates, exact gear and budgets are in the companion JSONL result file produced by the reproduction command. This report is generated by the checked-in runner, not manually transcribed numbers. The longer-run checks are deterministically recomputed when rendering; `--render` requires the original complete, source-matching JSONL.',
    '',
    'Reproduce: `node tools\\run_roster_capability.mjs <new-results.jsonl> docs\\roster-capability-audit.md`.',
  );
  await writeFile(resolve(report), lines.join('\n') + '\n', 'utf8');
  console.log(JSON.stringify(done));
} finally {
  await file?.close();
  await rm(temporary, { recursive: true });
}
