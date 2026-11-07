import { afterEach, describe, expect, it, vi } from 'vitest';
import { warEncounter, warLoot, rollWarRewards, elementalWars } from '../content/elemental-war';
import { warCharacters, warFighters } from '../content/war-characters';
import { availableStarters, getStarter } from '../content/starters';
import { characterArt, characterName } from '../content/character-art';
import { characterLevelCap, characterEvolutionCost, characterLevelCost } from '../content/progression';
import { enemyCombatStats } from '../content/stat-growth';
import { standardBannerPool } from '../content/standard-banner';
import { roseBannerPool } from '../content/rose-banner';
import { createWarBattle, act, endTurn, nextStage, nextWave, type BattleResult } from './battle';
import { emptyAccount, ACCOUNT_KEY, saveAccount, loadAccount, validateAccount, saveAccountRewards, unlockedWarStage } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy } from './character-instances';
import { lootItems, lootArt } from '../presentation/battle-loot';
import { battleResults } from '../presentation/battle-results';
import { gameplayHub } from '../presentation/gameplay';
import { archives } from '../presentation/archives';
import { abilityIcon } from '../presentation/ability-icon';
import { createSession } from '../presentation/battle-view';
import { portraitCue, portraitCutin } from '../presentation/battle-cutin';
import { type WarCharacterId } from '../content/elemental-war';

afterEach(() => vi.unstubAllGlobals());

function storage() {
  const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const saved: ProfileStorage = { getItem: (key) => map.get(key) ?? null,
    setItem: vi.fn((key, value) => { map.set(key, value); }), removeItem: (key) => { map.delete(key); } };
  const account = emptyAccount();
  account.characters.ember = { level: 105, evolution: 6, weaponRank: 2 };
  account.warStages = { nerithe: 10, orvella: 10, vaelor: 10, caldrex: 10, solenne: 10, myrthen: 10 };
  account.squad = ['ember'];
  saveAccount(saved, account);
  vi.mocked(saved.setItem).mockClear();
  return { saved, map };
}

function unlockWar(saved: ProfileStorage, character: WarCharacterId): void {
  const account = loadAccount(saved);
  account.warStages = { ...account.warStages, [character]: 10 };
  saveAccount(saved, account);
  vi.mocked(saved.setItem).mockClear();
}

function recruitmentSeedForFailure(): number {
  for (let seed = 1; seed < 1000; seed++) {
    let value = seed;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    if ((value >>> 0) / 0x100000000 >= .05) return seed;
  }
  throw new Error('Unable to find a deterministic failed recruitment seed.');
}

function defeat(character: WarCharacterId = 'orvella', stage = 10, burn = false, recruitmentSeed = 1): BattleResult {
  const state = createWarBattle(character, stage, 1, 'ember', { level: 105, evolution: 6 });
  state.enemies[0].hp = 1;
  state.allies[0].shatter = 100;
  state.recruitmentSeed = recruitmentSeed;
  if (burn) {
    state.enemies[0].burn = { damage: 1, turns: 1, sourceId: 'ember' };
    return endTurn(state);
  }
  return act(state, 'ember', 'skill1', state.enemies[0].id);
}

describe('Elemental War', () => {
  it.each([
    ['nerithe', 'Lament of the Spiral Sea', 'The Sea Without a Shore'],
    ['orvella', 'Rise of the Buried Citadel', 'The Throne Beneath the World'],
    ['vaelor', 'Overture of the Broken Sky', "The Sky's Final Chord"],
    ['caldrex', 'Siege of the Unbroken Furnace', 'The Last Kiln'],
    ['solenne', 'Requiem of the Silent Moon', 'The Bell That Stayed'],
    ['myrthen', 'The Orchard Beyond Autumn', 'When All Seasons Meet'],
    ['neralis', 'Passage of the Returning River', 'The River Keeps Its Promise'],
    ['varkhel', 'Trial of the Suspended Chain', 'The Chain Refuses to Break'],
    ['seravelle', 'March of the Ember Convoy', 'The Last Wagon Sees the Dawn'],
    ['velmira', 'Dance of the Unfastened Court', 'What Remains Beyond the Cut'],
  ] as const)('keeps %s trial names separate from preserved Omnic titles', (character, name, title) => {
    expect(elementalWars.find(mode => mode.character === character)?.name).toBe(name);
    const encounter = warEncounter(character, 10);
    expect(encounter.name).toBe(name);
    expect(encounter.enemyName).toBe(characterName(character, 6));
    expect(encounter.enemyName).toBe(`${title}, ${getStarter(character).name}`);
    expect(encounter.name).not.toBe(title);
    const html = gameplayHub(emptyAccount());
    expect(html).toContain(`<h3>${name}</h3>`);
    expect(html).toContain(`aria-label="${name} stage"`);
  });

  it('keeps every War trial name unique and distinct from every Omnic title', () => {
    const names = elementalWars.map(mode => mode.name);
    expect(new Set(names).size).toBe(elementalWars.length);
    for (const { character } of elementalWars) {
      expect(names).not.toContain(characterArt(character, 6).title);
    }
  });

  it('authors all ten War schedules, supplied or honestly pending scenery, portraits and boss skills', () => {
    const levels = [90, 96, 101, 107, 112, 118, 123, 129, 134, 140];
    const forms = [1, 1, 2, 2, 3, 3, 4, 4, 5, 6];
    const pendingArt = new Set(['neralis', 'varkhel', 'seravelle', 'velmira']);
    for (const { character, element } of elementalWars) {
      for (let stage = 1; stage <= 10; stage++) {
        const encounter = warEncounter(character, stage);
        const state = createWarBattle(character, stage, 17, 'ember', { level: 0, evolution: 1 });
        expect(encounter).toMatchObject({ level: levels[stage - 1], evolution: forms[stage - 1], element, boss: true });
        if (pendingArt.has(character)) {
          expect(encounter.banner).toBeUndefined();
          expect(encounter.background).toBeUndefined();
        } else {
          expect(encounter.banner).toBe(`elemental-war-${character}-banner.png`);
          expect(encounter.background).toBe(`elemental-war-${character}-arena.png`);
        }
        expect(state.enemies).toHaveLength(1);
        expect(state.enemies[0]).toMatchObject({ definitionId: character, level: encounter.level,
          evolution: encounter.evolution, element, art: characterArt(character, encounter.evolution).art, boss: true });
        expect(state.enemies[0].creatureId).toBeUndefined();
        expect(encounter.skills).toEqual([
          expect.objectContaining({ name: warFighters[character].abilities.skill1.name, every: 2, action: 'skill1' }),
          expect.objectContaining({ name: warFighters[character].abilities.ultimate.name, every: 6, action: 'ultimate' }),
        ]);
      }
      expect(warEncounter(character, 10).stats.health).toBe(enemyCombatStats(140, true).health);
    }
    for (const stage of [0, 11, NaN, 1.5]) expect(() => warEncounter('orvella', stage)).toThrow();
  });

  it('preserves starter choices, summon pools, six-star registration and existing progression costs', () => {
    expect(availableStarters.map((entry) => entry.id)).toEqual(['ember', 'tide', 'sprout']);
    expect(standardBannerPool()).toHaveLength(28);
    for (const { id } of warCharacters) {
      expect(getStarter(id).stars).toBe(6);
      expect(standardBannerPool().some((entry) => entry.id === id)).toBe(false);
      expect(roseBannerPool().some((entry) => entry.id === id)).toBe(false);
      expect(characterLevelCap(6)).toBe(105);
      expect(characterLevelCost(id, { level: 0, evolution: 1 }).fractalis).toBeGreaterThan(0);
      expect(characterEvolutionCost(id, { level: 30, evolution: 1 }).materials).toBeDefined();
      for (const action of ['passive', 'light', 'skill1', 'skill2', 'ultimate'] as const) {
        if (action === 'light') {
          expect(abilityIcon(id, action)).toContain('abilities/universal-normal-attack.png');
        } else if (['neralis', 'varkhel', 'seravelle', 'velmira'].includes(id)) {
          expect(abilityIcon(id, action)).toContain('data:image/svg+xml');
          expect(abilityIcon(id, action)).not.toContain(`abilities/${id}-${action}.png`);
        } else {
          expect(abilityIcon(id, action)).toContain(`abilities/${id}-${action}.png`);
        }
      }
    }
  });

  it('enforces exact currency ranges, independent premium and final-only 5% recruitment', () => {
    expect(warLoot(1)).toMatchObject({ fractalis: { minimum: 1500, maximum: 2500 }, lycalis: { chance: .3, quantity: 1 } });
    expect(warLoot(10)).toMatchObject({ fractalis: { minimum: 30000, maximum: 45000 }, lycalis: { chance: .6, quantity: 25 } });
    const recruitment = vi.fn(() => 0);
    for (let stage = 1; stage < 10; stage++) {
      expect(rollWarRewards(stage, () => 0, () => .99, recruitment).recruitment).toBe(false);
    }
    expect(recruitment).not.toHaveBeenCalled();
    expect(rollWarRewards(10, () => 0, () => .6, () => .009999)).toEqual({ amount: 30000, lycalis: 0, recruitment: true });
    expect(rollWarRewards(10, () => .999999, () => .599999, () => .999999)).toEqual({ amount: 45000, lycalis: 25, recruitment: false });
    expect(warLoot(10).recruitmentChance).toBe(.05);
    for (const { character } of elementalWars) for (const [roll, success] of [[0, true], [.049999, true], [.05, false]] as const) {
      expect(rollWarRewards(10, () => 0, () => .99, () => roll).recruitment, `${character} roll=${roll}`).toBe(success);
    }
    for (const invalid of [-1, 1, NaN, Infinity]) {
      expect(() => rollWarRewards(10, () => 0, () => 0, () => invalid)).toThrow();
    }
    for (const invalid of [-1, 1, NaN, Infinity]) expect(() => rollWarRewards(10, () => invalid, () => 0, () => 0)).toThrow();
    const source = createWarBattle('vaelor', 10, 20, 'ember', { level: 105, evolution: 6 });
    source.enemies[0].hp = 1;
    source.allies[0].shatter = 100;
    const alternate = structuredClone(source);
    alternate.recruitmentSeed = 1;
    const first = act(source, 'ember', 'skill1', source.enemies[0].id);
    const second = act(alternate, 'ember', 'skill1', source.enemies[0].id);
    expect(second.state.seed).toBe(first.state.seed);
    expect(second.state.rewardSeed).toBe(first.state.rewardSeed);
    expect(second.state.lycalisSeed).toBe(first.state.lycalisSeed);
    expect(second.events.filter((event) => event.kind !== 'reward')).toEqual(first.events.filter((event) => event.kind !== 'reward'));
  });

  it.each(elementalWars.map(({ character }) => character))('saves a deterministic successful final-stage recruit for %s', character => {
    for (const burn of [false, true]) {
      const { saved } = storage();
      if (['neralis', 'varkhel', 'seravelle', 'velmira'].includes(character)) unlockWar(saved, character);
      const result = defeat(character, 10, burn);
      expect(result.events.find(event => event.kind === 'reward')?.recruitment).toBe(character);
      expect(saveAccountRewards(saved, result, `war-${character}-${burn}`).characters[character])
        .toEqual({ level: 0, evolution: 1, weaponRank: 0 });
      expect(saved.setItem).toHaveBeenCalledTimes(1);
    }
  });

  it.each([false, true])('saves recruitment, both currencies and receipt once; burn=%s', (burn) => {
    const { saved } = storage();
    const result = defeat('orvella', 10, burn);
    const reward = result.events.find((event) => event.kind === 'reward')!;
    expect(reward.recruitment).toBe('orvella');
    const account = saveAccountRewards(saved, result, 'war');
    expect(account.characters.orvella).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    expect(account.fractalis).toBe(reward.amount);
    expect(account.lycalis).toBe(reward.lycalis ?? 0);
    expect(account.squad).toEqual(['ember']);
    expect(account.conduitEquipment?.orvella).toBeUndefined();
    expect(account.characters.ember).toEqual({ level: 105, evolution: 6, weaponRank: 2 });
    expect(reward.recruitmentOutcome).toBe('new');
    expect(lootItems(reward).find((item) => item.id === 'recruitment:orvella')).toMatchObject({ amount: 1 });
    expect(lootArt(lootItems(reward).find((item) => item.id === 'recruitment:orvella')!)).toContain('characters/orvella.png');
    expect(saved.setItem).toHaveBeenCalledTimes(1);
    expect(saveAccountRewards(saved, result, 'war')).toEqual(account);
    expect(saved.setItem).toHaveBeenCalledTimes(1);
  });

  it('rereads ownership at commit and converts only an already-owned successful roll', () => {
    const { saved } = storage();
    const result = defeat('vaelor');
    const current = loadAccount(saved);
    current.characters.vaelor = { level: 30, evolution: 2, weaponRank: 3 };
    saveAccount(saved, current);
    vi.mocked(saved.setItem).mockClear();
    const account = saveAccountRewards(saved, result, 'duplicate');
    const reward = result.events.find((event) => event.kind === 'reward')!;
    expect(account.lycalis).toBe((reward.lycalis ?? 0) + 100);
    expect(account.characters.vaelor).toEqual(current.characters.vaelor);
    expect(reward.recruitmentOutcome).toBe('duplicate');
    expect(lootItems(reward).some((item) => item.id.startsWith('recruitment:'))).toBe(false);
    expect(lootItems(reward).find((item) => item.id === 'lycalis')?.amount).toBe(account.lycalis);
    expect(saved.setItem).toHaveBeenCalledTimes(1);
  });

  it('does not convert an owned bearer when the actual final-stage recruitment roll fails', () => {
    const { saved } = storage();
    unlockWar(saved, 'neralis');
    const current = loadAccount(saved);
    current.characters.neralis = { level: 30, evolution: 2, weaponRank: 1 };
    saveAccount(saved, current);
    vi.mocked(saved.setItem).mockClear();
    const result = defeat('neralis', 10, false, recruitmentSeedForFailure());
    const reward = result.events.find(event => event.kind === 'reward')!;
    expect(reward.recruitment).toBeUndefined();
    const before = loadAccount(saved).lycalis;
    const account = saveAccountRewards(saved, result, 'failed-owned-recruitment');
    expect(account.lycalis - before).toBe(reward.lycalis ?? 0);
    expect(reward.recruitmentOutcome).toBeUndefined();
    expect(account.characters.neralis).toEqual({ level: 30, evolution: 2, weaponRank: 1 });
    expect(saved.setItem).toHaveBeenCalledTimes(1);
  });

  it('loads legacy progress without writes and unlocks only the cleared challenger', () => {
    const { saved, map } = storage();
    const legacy = loadAccount(saved);
    delete legacy.warStages;
    map.set(ACCOUNT_KEY, JSON.stringify(legacy));
    expect(unlockedWarStage(loadAccount(saved), 'orvella')).toBe(1);
    expect(saved.setItem).not.toHaveBeenCalled();
    const state = createWarBattle('orvella', 1, 1, 'ember', { level: 105, evolution: 6 });
    saveAccountRewards(saved, { state, events: [] }, 'entry');
    expect(saved.setItem).not.toHaveBeenCalled();
    const account = saveAccountRewards(saved, defeat('orvella', 1), 'stage1');
    expect(account.warStages).toEqual({ orvella: 2 });
    expect(unlockedWarStage(account, 'vaelor')).toBe(1);
    for (const warStages of [{ orvella: 0 }, { vaelor: 11 }, { orvella: 1.5 }, { unknown: 1 }, []]) {
      expect(() => validateAccount({ ...legacy, warStages })).toThrow();
    }
  });

  it('rejects malformed rewards and overflows without partial writes or false presentation', () => {
    const { saved, map } = storage();
    const before = map.get(ACCOUNT_KEY);
    const malformed = [
      (result: BattleResult) => { result.events.find((event) => event.kind === 'reward')!.amount = 1; },
      (result: BattleResult) => { result.events.find((event) => event.kind === 'reward')!.lycalis = 4; },
      (result: BattleResult) => { result.events.find((event) => event.kind === 'reward')!.materials = {}; },
      (result: BattleResult) => { result.events.find((event) => event.kind === 'reward')!.recruitment = 'vaelor'; },
      (result: BattleResult) => { result.events.find((event) => event.kind === 'reward')!.recruitmentOutcome = 'duplicate'; },
      (result: BattleResult) => { result.state.enemies[0].level = 139; },
      (result: BattleResult) => { result.state.enemies[0].hp = 1; },
    ];
    for (const mutate of malformed) {
      const result = defeat();
      mutate(result);
      expect(() => saveAccountRewards(saved, result, crypto.randomUUID())).toThrow('Elemental War');
      expect(map.get(ACCOUNT_KEY)).toBe(before);
    }
    const early = defeat('orvella', 9);
    early.events.find((event) => event.kind === 'reward')!.recruitment = 'orvella';
    expect(() => saveAccountRewards(saved, early, 'early')).toThrow();
    for (const balance of ['fractalis', 'lycalis'] as const) {
      const account = loadAccount(saved);
      account[balance] = Number.MAX_SAFE_INTEGER;
      if (balance === 'lycalis') account.characters.orvella = { level: 0, evolution: 1 };
      map.set(ACCOUNT_KEY, JSON.stringify(account));
      const snapshot = map.get(ACCOUNT_KEY);
      const result = defeat();
      expect(() => saveAccountRewards(saved, result, balance)).toThrow();
      expect(map.get(ACCOUNT_KEY)).toBe(snapshot);
      expect(result.events.find((event) => event.kind === 'reward')!.recruitmentOutcome).toBeUndefined();
    }
    expect(saved.setItem).not.toHaveBeenCalled();
  });

  it('does not advance progression or announce recruitment when storage fails', () => {
    const { saved, map } = storage();
    const before = map.get(ACCOUNT_KEY);
    vi.mocked(saved.setItem).mockImplementation(() => { throw new Error('Storage unavailable'); });
    const result = defeat();
    expect(() => saveAccountRewards(saved, result, 'failed')).toThrow();
    expect(map.get(ACCOUNT_KEY)).toBe(before);
    expect(result.events.find((event) => event.kind === 'reward')!.recruitmentOutcome).toBeUndefined();
  });

  it('continues mixed or all-captured squads with snapshots and Gauge, never advances the final stage', () => {
    const copy = createCreatureCopy('infusion:heavens:0', 1, 80);
    for (const ids of [['ember', copy.instanceId], [copy.instanceId]]) {
      const state = createWarBattle('orvella', 1, 17, 'ember', { level: 105, evolution: 6 }, ids,
        { ember: { level: 105, evolution: 6 } }, {}, [copy]);
      state.phase = 'cleared';
      state.allies.forEach((ally) => { ally.hp = 1; ally.shatter = 67; });
      const next = nextStage(state, { ember: { level: 105, evolution: 6 } }).state;
      expect(next.war).toEqual({ character: 'orvella', stage: 2 });
      expect(next.allies.map((ally) => ally.id)).toEqual(ids);
      expect(next.allies.every((ally) => ally.hp === ally.stats.health && ally.shatter === 67)).toBe(true);
      expect(next.allies.find((ally) => ally.captured)?.captured).toEqual(copy);
      expect(next.lycalisSeed).toBe(state.lycalisSeed);
      expect(next.recruitmentSeed).toBe(state.recruitmentSeed);
      expect(() => nextWave(state)).toThrow();
      const session = createSession('ember', { level: 105, evolution: 6 }, { character: 'orvella', stage: 2 },
        { ids, progress: { ember: { level: 105, evolution: 6 } }, captures: [copy] });
      expect(session.state.allies.map((ally) => ally.id)).toEqual(ids);
      expect(session.state.war?.stage).toBe(2);
    }
    const final = defeat();
    expect(() => nextStage(final.state, { level: 105, evolution: 6 })).toThrow('complete');
    expect(battleResults(final.state, final.events)).not.toContain('data-result-continue');
    expect(battleResults(defeat('orvella', 9).state, [])).toContain('data-result-continue');
  });

  it('adds locked archive forms and each supplied activity header', () => {
    const account = emptyAccount();
    const archive = archives(account);
    for (const { id } of warCharacters) {
      expect(archive.match(new RegExp(`data-archive-character="${id}"`, 'g'))).toHaveLength(6);
      expect(archive).toContain(`archive-form-locked" data-archive-character="${id}"`);
    }
    const gameplay = gameplayHub(account);
    expect(gameplay).toContain('data-war="orvella"');
    expect(gameplay).toContain('data-war="vaelor"');
    expect(gameplay).toContain('data-war="neralis"');
    for (const { character } of elementalWars) {
      if (['neralis', 'varkhel', 'seravelle', 'velmira'].includes(character)) {
        expect(gameplay).not.toContain(`banners/elemental-war-${character}-banner.png`);
      } else {
        expect(gameplay).toContain(`banners/elemental-war-${character}-banner.png`);
      }
    }
  });

  it('saves Nerithe recruitment and duplicate conversion without modifying squad or other trials', () => {
    const { saved } = storage();
    const first = defeat('nerithe');
    const account = saveAccountRewards(saved, first, 'nerithe-first');
    expect(account.characters.nerithe).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    expect(account.squad).toEqual(['ember']);
    expect(account.warStages).toEqual({ nerithe: 10, orvella: 10, vaelor: 10, caldrex: 10, solenne: 10, myrthen: 10 });
    const next = defeat('nerithe');
    const reward = next.events.find((event) => event.kind === 'reward')!;
    const duplicate = saveAccountRewards(saved, next, 'nerithe-second');
    expect(duplicate.lycalis - account.lycalis).toBe((reward.lycalis ?? 0) + 100);
    expect(reward.recruitmentOutcome).toBe('duplicate');
    expect(duplicate.characters.nerithe).toEqual(account.characters.nerithe);
  });

  it('applies the snapshot passive only to Nerithe normal attacks and caps Gauge', () => {
    for (const id of ['nerithe', 'vaelor'] as const) {
      const state = createWarBattle('orvella', 1, 5, id, { level: 0, evolution: 1 });
      expect(state.allies[0].kit?.passive.description).not.toContain('+0%');
      const normal = act(state, id, 'light', state.enemies[0].id);
      expect(normal.state.allies[0].shatter).toBe(id === 'nerithe' ? 25 : 20);
      state.allies[0].shatter = state.allies[0].stats.shatterCapacity - 1;
      expect(act(state, id, 'light', state.enemies[0].id).state.allies[0].shatter).toBe(state.allies[0].stats.shatterCapacity);
      state.allies[0].shatter = 25;
      expect(act(state, id, 'skill1', state.enemies[0].id).state.allies[0].shatter).toBe(0);
    }
  });

  it('uses actual character-form artwork for boss cut-ins and the authored ultimate name', () => {
    const stub = { className: '', setAttribute: vi.fn(), style: { setProperty: vi.fn() },
      innerHTML: '', querySelector: () => ({ textContent: '' }) };
    vi.stubGlobal('document', { createElement: () => stub });
    const unit = createWarBattle('vaelor', 10, 1, 'ember', { level: 0, evolution: 1 }).enemies[0];
    const cue = portraitCue(unit, { kind: 'attack', source: unit.id, target: 'ember', amount: 0,
      critical: false, message: '', action: 'ultimate', abilityName: warFighters.vaelor.abilities.ultimate.name });
    expect(cue?.name).toBe('Last Chord of the Sky');
    const panel = portraitCutin(unit, cue!, unit.art!, unit.color!);
    expect(panel.innerHTML).toContain('characters/vaelor-evo-6.png');
    expect(panel.innerHTML).not.toContain('enemies/vaelor');
  });
});
