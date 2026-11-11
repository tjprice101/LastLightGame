import { characterLevelCap } from '../src/content/progression';
import { conduits, type ConduitId } from '../src/content/conduits';
import { radiantMasters, type RadiantBearerId, type RadiantLoadout, type RadiantMasterId } from '../src/content/combat-kits';
import { authoredRadiantCalibration, pressureRadiantCalibration } from '../src/content/enemy-calibration';
import { emptyAccount } from '../src/game/account';
import { adaptRadiantLoadouts } from '../src/game/combat-loadout';
import { radiantPressureAnchors, adaptRadiantPressureEncounter, assertRadiantPressureAccess,
  type RadiantPressureAnchor } from '../src/game/enemy-pressure-encounters';
import { runRadiantPressure, type RadiantPressurePolicy } from '../src/game/enemy-pressure';

export const pressureStudySeeds = [1, 1729, 104729] as const;
export const pressureStudyNow = Date.parse('2026-11-08T19:13:07.317Z');
export function pressureStudyLoadouts(ids: RadiantBearerId[], level: number, profile: 'empty' | 'common' | 'farmed' | 'calamitic') {
  const account = emptyAccount();
  const members: RadiantLoadout[] = ids.map(id => {
    const form = Math.max(1, Array.from({ length: 6 }, (_, index) => index + 1).find(form => characterLevelCap(form, id) >= level) ?? 6);
    account.characters[id] = { level, evolution: form, weaponRank: 0 };
    return { id, starter: id, level, form, masterId: null, weaponRank: 0,
      ascension: { stats: false, skill1: false, skill2: false, lastFlare: false } };
  });
  const common: ConduitId[] = ['vigil-core', 'siegebound-drive', 'bastion-lock', 'parallax-relay',
    'fracture-reservoir', 'precision-escapement', 'fieldbrace-coupler', 'crosspin-governor'];
  const farmed: ConduitId[] = ['immortal-vessel', 'citadel-spine', 'execution-orrery', 'judgment-lens',
    'astral-prism', 'duplex-heart', 'wardglass-transformer', 'lifeline-flywheel'];
  const calamitic: ConduitId[] = ['calamitic-world-eater-orrery', 'calamitic-bulwark-of-the-last-horizon',
    'calamitic-reliquary-of-unending-mercy', 'calamitic-monolith-of-the-unmoved-star',
    'calamitic-heartforge-of-the-sunless-dawn', 'astral-prism', 'duplex-heart', 'lifeline-flywheel'];
  const slots = profile === 'empty' ? [] : profile === 'common' ? common : profile === 'farmed' ? farmed : calamitic;
  account.conduits = Object.fromEntries(slots.map(id => [id, 1]));
  account.conduitUpgrades = Object.fromEntries(slots.map(id => [id, profile === 'calamitic' ? 5 : 0]));
  account.conduitEquipment = Object.fromEntries(ids.map(id => [id, [...slots, ...Array<null>(8 - slots.length).fill(null)]]));
  if (profile === 'farmed' || profile === 'calamitic') for (const member of members) {
    const [masterId] = Object.entries(radiantMasters).find(([, master]) =>
      master.starter === member.starter && master.enhancement === 'signature')!;
    member.masterId = masterId as RadiantMasterId;
    account.masterConduits = { ...account.masterConduits, [masterId]: 1 };
  }
  if (profile !== 'calamitic' && (ids.some(id => ['ozriel', 'ilvaris', 'kaelith'].includes(id)) ||
    slots.some(id => conduits.find(conduit => conduit.id === id)!.rarity === 'Calamitic'))) throw new Error('Ordinary study includes Calamitic assets.');
  const result = adaptRadiantLoadouts(members, ids, { conduits: account.conduits, conduitUpgrades: account.conduitUpgrades,
    conduitEquipment: account.conduitEquipment, masterConduits: account.masterConduits });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return { account, loadouts: result.loadouts };
}
function prerequisites(anchor: RadiantPressureAnchor, account: ReturnType<typeof emptyAccount>): void {
  const a = anchor.activity;
  if (a.kind === 'story') account.storyCompleted = a.stage - 1;
  if (a.kind === 'dungeon') account.dungeonStages[a.element] = a.stage;
  if (a.kind === 'infusion') {
    account.infusionStages[a.mode] = a.stage;
    if (a.mode === 'machines') account.storyCompleted = 20;
  }
  if (a.kind === 'war') account.warStages = { [a.character]: a.stage };
  if (a.kind === 'oblivion') account.oblivionStage = a.stage;
  if (a.kind === 'calamity') {
    account.normalFinalClears = { [a.activity]: true }; account.calamityClears = { [a.activity]: a.tier - 1 };
  }
}
export function executeRadiantPressureStudy(emit: (row: unknown) => void, tunedOnly = false): void {
  const anchors = radiantPressureAnchors();
  const calibrations = tunedOnly ? [pressureRadiantCalibration] : [authoredRadiantCalibration, pressureRadiantCalibration];
  const calamityTeam: RadiantBearerId[] = ['ozriel', 'ilvaris', 'kaelith', 'tide', 'sprout', 'disciple'];
  const optimized = pressureStudyLoadouts(calamityTeam, 105, 'calamitic').loadouts;
  emit({ metadata: { schema: 1, now: pressureStudyNow, seeds: pressureStudySeeds, maximumRounds: 100,
    stalemateRounds: 20, anchors, families: [...new Set(anchors.map(anchor => anchor.family))],
    calibrations, speciesSeeds: [1],
    ownership: 'One starter free. Every trio/six and all gear/Masters/progress/clears conditional acquired laboratory assumptions.',
    restrictions: ['No live account writes, acquisition grants, reward RNG or migration.',
      'Budgets use fixed minimum ordinary Prismatica; Calamity budget zero, no chest/recruitment simulation.',
      'Three seeds are a small reproducible sample, not population clear rates or confidence intervals.',
      'Inactive/locked studies retained with explicit access errors, never certified playable.',
      'Single-target authored enemy schedule, deterministic noncritical damage; legacy critical/taunt omitted in new model.',
      'All authored species/forms are exercised; anchors do not cover every floor or every acquired roster/gear permutation.',
      'Species-completion anchors use one seed; early/mid/final/boss and controls use three.',
      'Calamitic six uses bounded greedy personal-Master screening against Machines EX+3, seed1; not a global optimum.'] } });
  const screeningAnchor = anchors.find(anchor => anchor.id === 'calamity:machines:3')!;
  const screeningEnemies = adaptRadiantPressureEncounter(screeningAnchor, 1, pressureRadiantCalibration);
  const measure = (loadouts: RadiantLoadout[]) => runRadiantPressure(loadouts, screeningEnemies,
    { chargeSeed: 1, targetSeed: (1 ^ 0x85ebca6b) >>> 0 });
  const score = (result: ReturnType<typeof measure>) => result.outcome === 'victory'
    ? 1e9 - result.roundsExecuted * 1e6 + result.surviving * 10000 + result.finalHP
    : result.surviving * 1e6 + result.metrics.outgoingHPDamage;
  let best = measure(optimized);
  let screeningSamples = 1;
  emit({ screening: { anchor: screeningAnchor.id, seed: 1, ids: calamityTeam, step: 'baseline',
    loadouts: structuredClone(optimized), result: best } });
  for (let i = 0; i < optimized.length; i++) {
    const member = optimized[i];
    for (const masterId of Object.keys(radiantMasters).filter(id =>
      radiantMasters[id as RadiantMasterId].starter === member.starter) as RadiantMasterId[]) {
      if (member.masterId === masterId) continue;
      const candidate = structuredClone(optimized);
      candidate[i].masterId = masterId;
      const result = measure(candidate);
      screeningSamples++;
      emit({ screening: { anchor: screeningAnchor.id, seed: 1, memberId: member.id, masterId, result } });
      if (score(result) > score(best)) { optimized[i] = candidate[i]; best = result; }
    }
  }
  emit({ optimization: { selected: optimized, result: best, screeningSamples,
    ownership: 'All three personal Masters per selected bearer are conditionally acquired, fixed ranks; no account operation.' } });
  const totals: Record<string, Record<string, number>> = {};
  let samples = 0;
  const identities = new Set<string>();
  const run = (anchor: RadiantPressureAnchor, ids: RadiantBearerId[], level: number,
    profile: 'empty' | 'common' | 'farmed' | 'calamitic', policy: RadiantPressurePolicy, scenario: string) => {
    const frozen = pressureStudyLoadouts(ids, level, profile);
    if (profile === 'calamitic') for (let i = 0; i < frozen.loadouts.length; i++) {
      const chosen = optimized.find(member => member.starter === frozen.loadouts[i].starter)!;
      frozen.loadouts[i].masterId = chosen.masterId;
      frozen.account.masterConduits = { ...frozen.account.masterConduits, [chosen.masterId!]: 1 };
    }
    const eligible = adaptRadiantLoadouts(frozen.loadouts, ids, {
      conduits: frozen.account.conduits, conduitUpgrades: frozen.account.conduitUpgrades,
      conduitEquipment: frozen.account.conduitEquipment, masterConduits: frozen.account.masterConduits,
    });
    if (!eligible.ok) throw new Error(JSON.stringify(eligible.errors));
    frozen.loadouts = eligible.loadouts;
    prerequisites(anchor, frozen.account);
    let accessError: string | null = null;
    try { assertRadiantPressureAccess(anchor, frozen.account, pressureStudyNow); }
    catch (error) { accessError = (error as Error).message; }
    for (const calibration of calibrations) for (const seed of anchor.position === 'species' ? [1] : pressureStudySeeds) {
      const enemies = adaptRadiantPressureEncounter(anchor, seed, calibration);
      const result = runRadiantPressure(frozen.loadouts, enemies, {
        chargeSeed: seed, targetSeed: (seed ^ 0x85ebca6b) >>> 0, policy,
      });
      const key = `${calibration.id}:${scenario}`;
      totals[key] ??= { victory: 0, defeat: 0, timeout: 0, stalemate: 0 };
      totals[key][result.outcome]++;
      samples++; enemies.forEach(enemy => identities.add(enemy.identity));
      emit({ measurement: { anchor: anchor.id, family: anchor.family, scenario, policy, level, profile, ids,
        conditionalAccessError: accessError, calibration: calibration.id, seed,
        encounterSeed: seed, targetSeed: (seed ^ 0x85ebca6b) >>> 0, chargeSeed: seed,
        loadouts: frozen.loadouts, enemies, ...result } });
    }
  };
  for (const anchor of anchors) {
    const level = adaptRadiantPressureEncounter(anchor, 1, authoredRadiantCalibration)[0].level;
    const a = anchor.activity;
    const gate = a.kind === 'dungeon' ? 30 : a.kind === 'war' ? 85 : a.kind === 'infusion'
      ? a.mode === 'machines' ? 10 : a.mode === 'treasury' || a.mode === 'sanctuary' ? 60 :
        ['roses', 'moon', 'sunshade'].includes(a.mode) ? 75 : 30 : 0;
    const playerLevel = Math.min(105, Math.max(gate, level - 5));
    run(anchor, ['ember'], playerLevel, playerLevel < 10 ? 'empty' : 'common', 'balanced', 'solo-conditional-progression');
    run(anchor, ['ember', 'tide', 'sprout'], playerLevel, 'common', 'balanced', 'trio-conditional-common');
    run(anchor, ['ember', 'tide', 'sprout', 'atmoso', 'bruno', 'elise'], playerLevel,
      playerLevel >= 80 ? 'farmed' : 'common', 'balanced', 'six-conditional-developed');
    if (a.kind === 'calamity')
      run(anchor, calamityTeam, 105, 'calamitic', 'balanced', 'six-separate-calamitic');
    if (a.kind === 'calamity' && a.tier === 3 || anchor.id === 'oblivion:final')
      run(anchor, ['ember', 'tide', 'sprout', 'atmoso', 'bruno', 'elise'], 105,
        'common', 'balanced', 'six-common-late-wall-control');
  }
  const opening = anchors.find(anchor => anchor.id === 'story:infernic:early')!;
  for (const id of ['ember', 'tide', 'sprout'] as const)
    run(opening, [id], 0, 'empty', 'balanced', `free-starter-${id}`);
  const late = anchors.find(anchor => anchor.id === 'training:120')!;
  run(late, ['tide', 'sprout', 'bruno'], 105, 'farmed', 'support-only', 'support-only-loop-control');
  emit({ completed: { samples, screeningSamples, anchors: anchors.length, families: new Set(anchors.map(a => a.family)).size,
    identities: identities.size, totals } });
}
