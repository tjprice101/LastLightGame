import { describe, expect, it } from 'vitest';
import { creatures, getCreature, creatureLoot } from './creatures';
import { createBattle, createDungeonBattle, createInfusionBattle, act, endTurn } from '../game/battle';
import { loadAccount, emptyAccount, saveAccount, saveAccountRewards, ACCOUNT_KEY, validateAccount } from '../game/account';
import { type ProfileStorage } from '../game/profile';
import { playableDungeons, materialLoot } from './dungeons';
import { creatureGlossary } from '../presentation/creature-glossary';
import { sanctuaryHeader, isMenuPage } from '../presentation/sanctuary';
import { starters } from './starters';
import { elements } from './activities';
import { nextWave, nextStage } from '../game/battle';

function storage(): ProfileStorage {
  const data = new Map<string, string>();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); }, removeItem: (key) => { data.delete(key); } };
}

describe('saved creature discoveries and glossary', () => {
  it('assigns confirmed combat elements to every enemy and preserves them across runs', () => {
    const adventure = createBattle();
    expect(adventure.enemies.map((enemy) => enemy.element)).toEqual(['efflorescent', 'infernic', 'tectonic']);
    expect(adventure.allies[0].element).toBe('infernic');
    adventure.phase = 'cleared';
    expect(nextWave(adventure).state.enemies.map((enemy) => enemy.element)).toEqual(['efflorescent', 'infernic', 'tectonic']);
    for (const element of playableDungeons) for (let stage = 1; stage <= 35; stage++) {
      const state = createDungeonBattle(element, stage, 1729, 'ember', { level: 0, evolution: 1 });
      for (const enemy of state.enemies) {
        expect(enemy.element).toBe(element);
        expect(getCreature(enemy.creatureId!).element).toBe(enemy.element);
      }
    }
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= 35; stage++) {
      const state = createInfusionBattle(mode, stage, 1729, 'ember', { level: 0, evolution: 1 });
      for (const enemy of state.enemies) {
        expect(enemy.element).toBe(mode === 'heavens' ? 'tranquilitic' : 'chaotic');
        expect(getCreature(enemy.creatureId!).element).toBe(enemy.element);
        expect(getCreature(enemy.creatureId!).dungeonElement).toBeUndefined();
      }
      if (stage < 35) {
        state.phase = 'cleared';
        expect(nextStage(state, { level: 0, evolution: 1 }).state.enemies[0].element).toBe(state.enemies[0].element);
      }
    }
    for (const creature of creatures) expect(elements.some((element) => element.id === creature.element)).toBe(true);
    expect(creatureLoot(getCreature('adventure:imp'), 120)).toEqual([{ id: 'fractalis', minimum: 15, maximum: 30, chance: 1 }]);
  });

  it('catalogs every Adventure enemy and every authored dungeon/infusion form with stable identities', () => {
    expect(new Set(creatures.map((entry) => entry.id)).size).toBe(creatures.length);
    for (const enemy of createBattle().enemies) expect(getCreature(enemy.creatureId!).name).toBe(enemy.name);
    for (const element of playableDungeons) for (let stage = 1; stage <= 35; stage++) {
      const state = createDungeonBattle(element, stage, 1729, 'ember', { level: 0, evolution: 1 });
      expect(getCreature(state.enemies[0].creatureId!).stages).toContain(stage);
      expect(getCreature(state.enemies[0].creatureId!).name).toBe(state.enemies[0].name);
    }
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= 35; stage++) {
      const state = createInfusionBattle(mode, stage, 1729, 'ember', { level: 0, evolution: 1 });
      expect(getCreature(state.enemies[0].creatureId!).stages).toContain(stage);
    }
  });

  it('records seen on entry, retains discoveries on quit/reload, and reveals loot only after a kill', () => {
    const saved = storage();
    const state = createDungeonBattle('infernic', 1, 1729, 'ember', { level: 0, evolution: 1 });
    const id = state.enemies[0].creatureId!;
    const seen = saveAccountRewards(saved, { state, events: [] }, 'run');
    expect(seen.creatures[id]).toEqual({ defeated: false });
    expect(seen.fractalis).toBe(0);
    expect(seen.materials).toEqual({});
    expect(loadAccount(saved).creatures).toEqual(seen.creatures);
    const seenHtml = creatureGlossary(seen);
    expect(seenHtml).toContain('<strong>Encountered</strong>');
    expect(seenHtml).not.toContain('Loot locked');
    expect(seenHtml).not.toContain('Drop pool and chances');
    state.enemies[0].hp = 1;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    const beaten = saveAccountRewards(saved, result, 'run');
    expect(beaten.creatures[id]).toEqual({ defeated: true });
    expect(result.state.phase).toBe('player');
    const beatenHtml = creatureGlossary(beaten);
    expect(beatenHtml).toContain('Drop pool and chances');
    expect(beatenHtml).toContain('<strong>Defeated</strong>');
    expect(beatenHtml).not.toContain('Loot revealed');
    expect(saveAccountRewards(saved, result, 'run')).toEqual(beaten);
    expect(saveAccountRewards(saved, { state, events: [] }, 'replay').creatures[id].defeated).toBe(true);
  });

  it('records burn kills and keeps discoveries/rewards atomic when storage fails', () => {
    const saved = storage();
    const state = createInfusionBattle('abyss', 1, 1729, 'ember', { level: 105, evolution: 6 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.burn = { damage: 8, turns: 1 }; });
    const result = endTurn(state);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => saveAccountRewards(saved, result, 'burn')).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    saved.setItem = write;
    const committed = saveAccountRewards(saved, result, 'burn');
    expect(committed.creatures['infusion:abyss:0']).toEqual({ defeated: true });
    expect(saveAccountRewards(saved, result, 'burn')).toEqual(committed);
  });

  it('loads legacy wallets without inventing discoveries or rewriting the save', () => {
    const saved = storage();
    const old = { ...emptyAccount(), creatures: undefined };
    const raw = JSON.stringify(old);
    saved.setItem(ACCOUNT_KEY, raw);
    expect(loadAccount(saved).creatures).toEqual({});
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(() => validateAccount({ ...emptyAccount(), creatures: { 'fake:id': { defeated: true } } })).toThrow('Unknown glossary');
    expect(() => validateAccount({ ...emptyAccount(), creatures: { 'adventure:goblin': { defeated: 'yes' } } })).toThrow('Invalid saved creature');
    saveAccount(saved, emptyAccount());
  });

  it('hides undiscovered names/art color and unrevealed loot while exposing the glossary button', () => {
    const html = creatureGlossary(emptyAccount());
    expect(html).toContain('undiscovered');
    expect(html).not.toContain('<h2>Goblin</h2>');
    expect(html).not.toContain('Drop pool and chances');
    expect(html).not.toContain('Per-enemy loot');
    expect(html).not.toContain('Not encountered');
    expect(isMenuPage('glossary')).toBe(true);
    expect(sanctuaryHeader('glossary', 0, 0)).toContain('Archives');
    expect(sanctuaryHeader('home', 0, 0)).toContain('data-page="collections"');
    expect(creatureGlossary(null)).toContain('discoveries unavailable');
    const account = emptyAccount();
    account.creatures['dungeon:ominous:0'] = { defeated: false };
    expect(creatureGlossary(account)).toContain('enemies/duskmote.png');
  });

  it('reports real stage gates and per-item probabilities, including uniform infusion elements', () => {
    const adventure = creatureLoot(getCreature('adventure:goblin'));
    expect(adventure).toEqual([{ id: 'fractalis', minimum: 5, maximum: 10, chance: 1 }]);
    for (const creature of creatures.filter((entry) => entry.dungeonElement)) for (const stage of creature.stages) {
      const pool = creatureLoot(creature, stage);
      expect(pool.slice(1)).toEqual(materialLoot(creature.dungeonElement!, stage));
    }
    const final = creatureLoot(getCreature('infusion:heavens:5'), 35);
    expect(final.find((entry) => entry.id === 'heavens-level')).toMatchObject({ minimum: 3, maximum: 6, chance: 1 });
    expect(final.find((entry) => entry.id === 'infernic-epic')?.chance).toBeCloseTo(.17);
    expect(final.find((entry) => entry.id === 'aquatic-legendary')?.chance).toBeCloseTo(.13);
    expect(final.find((entry) => entry.id === 'atmospheric-omnic')?.chance).toBeCloseTo(.08);
    expect(final.find((entry) => entry.id === 'chaotic-omnic')).toBeUndefined();
    for (const creature of creatures.filter((entry) => entry.mode === 'heavens' || entry.mode === 'abyss')) for (const stage of creature.stages) {
      const bonuses = creatureLoot(creature, stage).filter((drop) => /-(epic|legendary|omnic)$/.test(drop.id));
      for (const drop of bonuses) {
        expect(elements.find((element) => drop.id.startsWith(`${element.id}-`))?.infusion).toBe(creature.mode);
      }
    }
    expect(creatureLoot(getCreature('adventure:goblin'), 120)[0]).toEqual({ id: 'fractalis', minimum: 15, maximum: 30, chance: 1 });
    expect(() => creatureLoot(getCreature('infusion:heavens:5'), 1)).toThrow('Choose a stage');
  });
});
