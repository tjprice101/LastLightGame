import { describe, expect, it } from 'vitest';
import {
  radiantCriticalStats, radiantMasters, type RadiantBearerId, type RadiantLoadout, type RadiantMasterId,
} from '../content/combat-kits';
import {
  applyRadiantCombatAction, createRadiantCombat, radiantActionEfficiency, radiantCriticalRate, radiantMaximumHealth,
  radiantPendingActors, radiantSkillStats, validateRadiantCombat, type RadiantCombatState,
} from './combat-engine';
import { chooseRadiantPressureAction } from './enemy-pressure';
import { emptyAccount, saveAccount, type Account } from './account';
import { LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** D-493 batch B5a: the restored always-on stat packages of the live Masters (owner split 2026-11-21: B5a stats, B5b kit
 * modifiers, B5c player-turn triggers, B5d enemy-phase effects). C1 x0.2 on always-on Health/Defense/Attack; Skill stats,
 * capacity and crit stats verbatim; "while <bearer> lives" packages are squad auras. */
const approved: Record<string, string> = {
  'master-ember-1': 'skill-power .55, squad-hp .12, squad-defense .04',
  'master-ember-2': 'hp .11, defense .13, skill-power .4',
  'master-ember-3': 'attack .17, gauge-gain .35',
  'master-tide-1': 'skill-efficiency .35, skill-power .45, defense .16',
  'master-tide-2': 'defense .09, gauge-gain .25',
  'master-tide-3': 'defense .19, skill-power .35',
  'master-sprout-1': 'skill-power .65, capacity .5',
  'master-sprout-3': 'hp .198, gauge-gain .65',
  'master-atmoso-1': 'skill-power .5, capacity .6',
  'master-atmoso-2': 'squad-hp .11, squad-defense .09',
  'master-atmoso-3': 'skill-power .45, attack .09',
  'master-aurora-1': 'squad-hp .15, squad-defense .13',
  'master-aurora-2': 'defense .05, skill-power .65',
  'master-aurora-3': 'skill-power .45, hp .05',
  'master-bliss-1': 'skill-power .7, defense .09',
  'master-bliss-2': 'attack .17, crit-rate .25',
  'master-bliss-3': 'skill-efficiency .25, gauge-gain .35',
  'master-bruno-1': 'defense .11, skill-power .45',
  'master-bruno-2': 'hp .13, defense .13',
  'master-bruno-3': 'attack .12, defense .17',
  'master-disciple-1': 'hp .15, skill-efficiency .35',
  'master-disciple-3': 'skill-power .6, crit-damage .45',
  'master-elise-1': 'skill-power .55, hp .09, defense .07',
  'master-elise-2': 'attack .16, skill-power .4',
  'master-elise-3': 'crit-damage .65, gauge-gain .4',
  'master-razor-1': 'hp .2, gauge-gain .3',
  'master-razor-2': 'squad-hp .11, squad-skill-efficiency .35',
  'master-razor-3': 'skill-power .55, skill-efficiency .35',
  'master-rosetta-1': 'skill-efficiency .35, skill-power .55',
  'master-rosetta-2': 'hp .16, skill-efficiency .3',
  'master-rosetta-3': 'skill-power .6, capacity .35',
  'master-thornia-1': 'skill-power .75, defense .04',
  'master-thornia-2': 'hp .18, defense .12',
  'master-thornia-3': 'skill-power .45, gauge-gain .35',
  'master-crinso-1': 'crit-damage .75, capacity .5',
  'master-crinso-2': 'defense .11, skill-efficiency .45',
  'master-crinso-3': 'skill-power .65, skill-efficiency .45',
  'master-nerithe-1': 'attack .15, capacity .5',
  'master-nerithe-2': 'skill-power .55, defense .11',
  'master-orvella-1': 'hp .22, capacity .4',
  'master-orvella-2': 'squad-hp .11, squad-skill-power .35',
  'master-orvella-3': 'hp .07, skill-efficiency .15',
  'master-vaelor-1': 'skill-power .35, attack .21',
  'master-vaelor-2': 'attack .18, skill-efficiency .3',
  'master-vaelor-3': 'crit-rate .3, gauge-gain .45',
  'master-caldrex-1': 'hp .12, defense .1',
  'master-caldrex-2': 'hp .1, attack .08, skill-power .25',
  'master-caldrex-3': 'hp .15, skill-power .3',
  'master-solenne-1': 'hp .1, defense .15',
  'master-solenne-2': 'hp .15, skill-power .25',
  'master-solenne-3': 'hp .08, skill-power .3, skill-efficiency .15',
  'master-myrthen-1': 'attack .12, skill-power .35',
  'master-myrthen-2': 'attack .09, crit-rate .25',
  'master-myrthen-3': 'attack .08, hp .1, skill-power .2',
  'master-neralis-1': 'hp .12, skill-power .35',
  'master-neralis-2': 'hp .1, defense .12',
  'master-neralis-3': 'hp .08, attack .08, skill-power .25',
  'master-varkhel-1': 'hp .14, defense .1',
  'master-varkhel-2': 'hp .1, skill-power .35',
  'master-varkhel-3': 'hp .1, attack .09',
  'master-seravelle-1': 'hp .1, skill-power .35',
  'master-seravelle-2': 'attack .09, skill-power .3',
  'master-seravelle-3': 'hp .12, defense .08',
  'master-velmira-1': 'attack .12, skill-power .3',
  'master-velmira-2': 'attack .09, crit-rate .25',
  'master-velmira-3': 'hp .1, attack .07, skill-power .2',
  'master-maerion-1': 'hp .15, skill-power .25',
  'master-maerion-2': 'hp .1, skill-power .35',
  'master-maerion-3': 'hp .08, skill-efficiency .2',
  'master-caevren-1': 'hp .12, defense .12',
  'master-caevren-2': 'hp .15, skill-power .25',
  'master-caevren-3': 'defense .1, attack .08',
  'master-vespera-1': 'hp .1, skill-power .3',
  'master-vespera-2': 'attack .08, skill-power .3',
  'master-vespera-3': 'hp .12, skill-efficiency .2',
  'master-ilyss-1': 'hp .1, skill-power .35',
  'master-ilyss-2': 'hp .15, skill-power .2',
  'master-ilyss-3': 'hp .08, skill-efficiency .2',
  'master-asteriel-1': 'hp .12, skill-power .3',
  'master-asteriel-2': 'hp .15, skill-power .25',
  'master-asteriel-3': 'hp .08, skill-efficiency .2',
  'master-serapha-1': 'hp .12, skill-power .35',
  'master-serapha-2': 'hp .1, defense .08',
  'master-serapha-3': 'hp .08, skill-efficiency .2',
  'master-ozriel-1': 'hp .15, defense .13',
  'master-ozriel-2': 'defense .11, skill-power .45',
  'master-ozriel-3': 'hp .11, skill-efficiency .45',
  'master-ilvaris-1': 'skill-power .45, skill-efficiency .45',
  'master-ilvaris-2': 'hp .13, skill-efficiency .45',
  'master-ilvaris-3': 'skill-power .55, gauge-gain .55',
  'master-kaelith-1': 'skill-power .55, attack .09',
  'master-kaelith-2': 'skill-efficiency .4, crit-rate .3',
  'master-kaelith-3': 'skill-power .45, gauge-gain .45',
};
/** Restored effect is only a kit clause: these keep their Radiant-era design until their part ships. */
const pending = ['master-sprout-2', 'master-disciple-2', 'master-nerithe-3'];
const parse = (text: string) => text.split(', ').map(part => { const [kind, amount] = part.split(' '); return [kind, Number(amount)]; });

function member(starter: RadiantBearerId, masterId: RadiantMasterId | null = null): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId, ascension: {}, gear: Array(8).fill(null) };
}
function fixture(squad: [RadiantBearerId, RadiantMasterId?][]): RadiantCombatState {
  return createRadiantCombat(squad.map(([starter, masterId]) => member(starter, masterId ?? null)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 1000000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })),
    0, false);
}
function defeat(state: RadiantCombatState, index: number): void {
  state.bearers[index].hp = 0;
  state.gauge.members[index].living = false;
}

describe('D-493 B5a Master stat packages', () => {
  it('matches the approved package for every restored Master and leaves the three clause-only Masters for later parts', () => {
    const ids = Object.keys(radiantMasters);
    expect(ids).toHaveLength(96);
    expect(Object.keys(approved)).toHaveLength(93);
    for (const id of ids) {
      if (pending.includes(id)) { expect(approved[id]).toBeUndefined(); continue; }
      expect(radiantMasters[id as RadiantMasterId].effects.map(entry => [entry.kind, entry.amount]), id).toEqual(parse(approved[id]));
    }
  });
  it('writes a tooltip with exact numbers for every Master', () => {
    for (const master of Object.values(radiantMasters)) {
      expect(master.effect).toMatch(/\d/);
      expect(master.effect).not.toMatch(/undefined|NaN/);
    }
    expect(radiantMasters['master-razor-2'].effect).toContain('Skill Efficiency +35%');
    expect(radiantMasters['master-orvella-2'].effect).toContain('Skill Power +35%');
  });
  it('applies Deep Foundation Planetpress squad Skill Power and Health while Orvella lives', () => {
    const plain = fixture([['orvella'], ['ember']]);
    const aura = fixture([['orvella', 'master-orvella-2'], ['ember']]);
    expect(radiantSkillStats(aura, 'ember', 1).skillPower - radiantSkillStats(plain, 'ember', 1).skillPower).toBeCloseTo(.35);
    expect(radiantSkillStats(aura, 'orvella', 2).skillPower - radiantSkillStats(plain, 'orvella', 2).skillPower).toBeCloseTo(.35);
    expect(radiantMaximumHealth(aura, 'ember') / radiantMaximumHealth(plain, 'ember')).toBeCloseTo(1.11, 2);
    defeat(aura, 0);
    expect(radiantSkillStats(aura, 'ember', 1).skillPower).toBeCloseTo(radiantSkillStats(plain, 'ember', 1).skillPower);
  });
  it('applies Eclipse Planet Watchtower squad Skill Efficiency to skills and Convergent Light while Razor lives', () => {
    const plain = fixture([['razor'], ['ember']]);
    const aura = fixture([['razor', 'master-razor-2'], ['ember']]);
    expect(radiantSkillStats(aura, 'ember', 1).skillEfficiency - radiantSkillStats(plain, 'ember', 1).skillEfficiency).toBeCloseTo(.35);
    expect(radiantActionEfficiency(aura, 'ember', 'flare') - radiantActionEfficiency(plain, 'ember', 'flare')).toBeCloseTo(.35);
    aura.gauge.members[1].charge = 70;
    const cast = applyRadiantCombatAction(aura, { type: 'flare', bearerId: 'ember' });
    const spent = cast.events.find(event => event.type === 'flare');
    expect(spent?.type === 'flare' && spent.cost).toBe(70);
    validateRadiantCombat(cast.state);
    defeat(aura, 0);
    expect(radiantActionEfficiency(aura, 'ember', 'flare')).toBeCloseTo(radiantActionEfficiency(plain, 'ember', 'flare'));
  });
  it('adds Master crit stats to the roll and stores Master capacity on the gauge', () => {
    const bliss = createRadiantCombat([member('bliss', 'master-bliss-2')],
      [{ id: 'enemy', elementId: null, stats: { hp: 1000, attack: 1, defense: 1, recovery: 0 }, currencyBudget: 1 }], 0);
    expect(radiantCriticalRate(bliss, 'bliss', 'enemy')).toBeCloseTo(radiantCriticalStats.bliss.rate + .25);
    expect(fixture([['sprout', 'master-sprout-1']]).gauge.members[0].capacity).toBe(.5);
  });
  it("credits another bearer's squad-aura Master in D-492 boosts", () => {
    const state = fixture([['orvella', 'master-orvella-2'], ['ember']]);
    state.gauge.members[1].charge = 100;
    const cast = applyRadiantCombatAction(state, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' });
    expect(cast.events.some(event => event.type === 'damage' &&
      event.boosts?.some(boost => boost.source.kind === 'master' && boost.source.bearerId === 'orvella'))).toBe(true);
  });
});

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
function play(saved: FrozenRadiantRun): RadiantTurnAction[] {
  const run = structuredClone(saved), actions: RadiantTurnAction[] = [];
  while (run.state.phase === 'player' && actions.length < 2000) {
    const action = chooseRadiantPressureAction(run.state, radiantPendingActors(run.state)[0], 'balanced') as RadiantTurnAction;
    applyRadiantTurn(run, action); actions.push(action);
  }
  return actions;
}
async function send(transport: LocalRadiantTransport, operation: RadiantRunOperation) {
  const checkpoint = await transport.read();
  const request: RadiantRunRequest = { requestId: crypto.randomUUID(), expectedRevision: checkpoint.revision,
    runId: operation.kind === 'start' ? null : checkpoint.run!.id,
    encounter: operation.kind === 'start' ? null : checkpoint.run!.encounter, operation };
  return transport.execute(request);
}
function storageWith(squad: string[], masters: Record<string, RadiantMasterId>): MemoryStorage {
  const storage = new MemoryStorage(), account: Account = emptyAccount();
  account.squad = squad;
  squad.forEach(id => { account.characters[id as keyof Account['characters']] = { level: 0, evolution: 1, weaponRank: 0 }; });
  account.masterConduits = Object.fromEntries(Object.values(masters).map(id => [id, 1]));
  account.masterEquipment = masters;
  saveAccount(storage, account);
  return storage;
}

describe('save compatibility (standing requirement, 2026-11-20)', () => {
  const masters: Record<string, RadiantMasterId> = { ember: 'master-ember-1', razor: 'master-razor-2', sprout: 'master-sprout-2' };
  it('reloads a settled journal with Masters equipped and accepts a Master-sourced revive event', async () => {
    const transport = new LocalRadiantTransport(storageWith(['ember', 'razor', 'sprout'], masters), () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    expect(started.run.state.bearers.map(entry => entry.loadout.masterId)).toEqual(Object.values(masters));
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    const snapshot = (run: FrozenRadiantRun) => ({ revision: 9,
      state: { profile: {}, starterId: 'ember', run: null, account: settled.account, radiantStudy: run } });
    expect(validateRadiantRunSnapshot(snapshot(settled.run)).state.radiantStudy).toEqual(settled.run);
    const id = settled.run.state.bearers[0].loadout.id;
    const revived = structuredClone(settled.run);
    revived.journal.events.push({ type: 'revive', targetId: id, source: { kind: 'master', bearerId: id }, amount: 5 });
    expect(() => validateRadiantRunSnapshot(snapshot(revived))).not.toThrow();
    const forged = structuredClone(settled.run);
    forged.journal.events.push({ type: 'revive', targetId: id, source: { kind: 'leader', bearerId: id }, amount: 5 } as never);
    expect(() => validateRadiantRunSnapshot(snapshot(forged))).toThrow();
  });
  it('loads an encounter with Masters equipped mid-run and settles it', async () => {
    const transport = new LocalRadiantTransport(storageWith(['ember', 'razor', 'sprout'], masters), () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const loaded = await transport.read();
    expect(loaded.notice).toBeUndefined();
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
  });
});
