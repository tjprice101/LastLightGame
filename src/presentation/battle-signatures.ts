import { radiantBeat, radiantShurikenCount, radiantSignatureCaps, radiantTokenRules, type RadiantCombatState, type RadiantToken } from '../game/combat-engine';
import { getConduit } from '../content/conduits';
import { characterName } from '../content/character-art';
import { escapeDialogText as escape } from './game-dialog';

/**
 * Battle Flurry Phase 3 Step 3 (D-479): signature counters on screen.
 * Owner chips sit on the owner's card; holder tags sit beside the status rows of the unit that holds the mark.
 * Labels use the kit text's names so a chip reads the same as its tooltip.
 */
export interface RadiantSignatureView {
  /** Chips per owning bearer id (their own counters and boosts). */
  owners: Record<string, string[]>;
  /** Tags per holding unit id (enemy or ally) for marks other bearers placed on it. */
  holders: Record<string, string[]>;
  /** D-493 B3b: next-action bonuses per holding bearer id. */
  bonuses: Record<string, string[]>;
}

const counterLabels = {
  heat: 'Heat', stillness: 'Stillness', current: 'Current', tension: 'Tension', cadence: 'Cadence', crosscut: 'Crosscut',
  load: 'Load', severance: 'Severance', interval: 'Interval',
} as const;
const seasons = ['Sprout', 'Bloom', 'Harvest'] as const;
const beats = ['Tune', 'Rise', 'Crescendo'] as const;
const pct = (value: number) => `${Number((value * 100).toFixed(1))}%`;
const whole = (value: number) => Math.round(value).toLocaleString('en-US');
const turns = (value: number) => `${value} ${value === 1 ? 'turn' : 'turns'}`;
/** D-493 B3b next-action bonus labels: which action spends it, then the exact bonus. */
const tokenScopes = { 'damaging-action': 'Next damaging action', skill: 'Next skill', skill12: 'Next Skill 1 or 2',
  'damaging-skill': 'Next damaging skill', flare: 'Next Convergent Light', 'restore-skill': 'Next heal or Shield' } as const;
export function radiantTokenLabel(token: RadiantToken): string {
  const rule = radiantTokenRules[token.kind];
  const bonus = rule.stat === 'crit-rate' ? `+${Number((token.value * 100).toFixed(1))} Critical Rate`
    : `+${pct(token.value)} ${{ power: 'Skill Power', 'restore-power': 'Skill Power', efficiency: 'Skill Efficiency', attack: 'Attack',
      'crit-damage': 'Critical Damage', direct: 'direct damage' }[rule.stat]}`;
  const life = rule.life === 'spent' ? ' · until used' : rule.life === 'timed' ? ' · through next turn' : '';
  return `${getConduit(token.conduitId).name} · ${tokenScopes[rule.scope]} ${bonus}${rule.target ? ' vs marked enemy' : ''}${life}`;
}

export function radiantSignatureView(state: RadiantCombatState): RadiantSignatureView {
  const owners: Record<string, string[]> = {}, holders: Record<string, string[]> = {}, bonuses: Record<string, string[]> = {};
  for (const unit of [...state.bearers, ...state.enemies]) holders['loadout' in unit ? unit.loadout.id : unit.id] = [];
  const tag = (id: string, text: string) => { holders[id]?.push(text); };
  const living = (id: string) => [...state.bearers, ...state.enemies].some(unit =>
    ('loadout' in unit ? unit.loadout.id : unit.id) === id && unit.hp > 0);
  const nameOf = (id: string) => {
    const member = state.bearers.find(unit => unit.loadout.id === id);
    return member ? characterName(member.loadout.starter) : id;
  };
  for (const member of state.bearers) {
    const id = member.loadout.id, chips: string[] = [];
    owners[id] = chips;
    if (member.hp === 0) continue;
    if (member.seed && living(id)) tag(id, `Seed · heals ${pct(member.seed.value)} next turn`);
    if (member.cover) tag(id, `Cover · ${nameOf(member.cover.casterId)} takes ${pct(member.cover.share)} · ${turns(member.cover.remaining)}`);
    if (member.burnUp) chips.push(`Burn boost +${pct(member.burnUp.value)} · ${turns(member.burnUp.remaining)}`);
    // D-493 B3b: next-action bonuses this bearer holds; a target-bound bonus also tags its enemy.
    bonuses[id] = [];
    for (const token of member.tokens ?? []) {
      bonuses[id].push(radiantTokenLabel(token));
      if (token.targetId) tag(token.targetId, `${getConduit(token.conduitId).name} target (${nameOf(id)})`);
    }
    // D-493 B3c: Accord held (gold bonus tag), a used Conduit rescue, and Atlas Bastion's taunt.
    if (member.accord) bonuses[id].push(`${getConduit('tranquilitic-accord-bastion').name} · survives one fatal hit (${nameOf(member.accord)})`);
    if (state.rescued?.includes(id)) tag(id, 'Conduit rescue used');
    if (state.taunt === id) chips.push(`${getConduit('tectonic-atlas-bastion').name} · taunting all enemies`);
    const starter = member.loadout.starter;
    if (starter === 'vaelor') chips.push(`Beat · ${beats[radiantBeat(state.round)]}`);
    if (starter === 'bliss' && state.phase === 'player' && !state.acted.includes(id)) {
      const others = state.bearers.filter(unit => unit !== member && unit.hp > 0).map(unit => unit.loadout.id);
      const acted = others.filter(other => state.acted.includes(other)).length;
      chips.push(`Tempo · ${acted === 0 ? 'Opening' : acted === others.length ? 'Closing' : 'Neither'}`);
    }
    const own = member.signature;
    if (!own) continue;
    switch (own.kind) {
      case 'cyclone':
        chips.push(`Gusts ${own.gusts}/5`);
        if (own.cyclone) chips.push(`Cyclone · releases in ${turns(own.cyclone.remaining)}`);
        break;
      case 'shuriken':
        chips.push(`Shuriken ${own.held}/${radiantShurikenCount} held`);
        for (const enemyId of new Set(own.lodged)) {
          const count = own.lodged.filter(entry => entry === enemyId).length;
          tag(enemyId, `Shuriken ×${count}`);
        }
        break;
      case 'wounds': chips.push(`Wounds ${whole(own.wounds)}`); break;
      case 'quarry':
        if (own.targetId) { tag(own.targetId, 'Quarry'); chips.push(`Quarry · ${own.contributors.length} ${own.contributors.length === 1 ? 'contributor' : 'contributors'}`); }
        else chips.push('No Quarry');
        break;
      case 'thorns':
        for (const trap of own.traps) tag(trap.enemyId, `Thorn Trap · ${trap.charges} ${trap.charges === 1 ? 'charge' : 'charges'} · ${turns(trap.remaining)}`);
        chips.push(`Thorn Traps ${own.traps.length}`);
        break;
      case 'combo': chips.push(`Combo ${own.combo}/${radiantSignatureCaps.combo}`); break;
      case 'refusal':
        for (const spent of own.spent) tag(spent, 'Refusal used');
        chips.push(`Refusal · ${state.bearers.filter(unit => unit.hp > 0 && !own.spent.includes(unit.loadout.id)).length} protected`);
        break;
      case 'marks':
        for (const mark of own.marks) tag(mark.enemyId, `Fate-seared Mark ×${mark.stacks} · ${turns(mark.remaining)}`);
        chips.push(`Marks on ${own.marks.length} ${own.marks.length === 1 ? 'enemy' : 'enemies'}`);
        break;
      case 'incisions':
        for (const entry of own.incisions) tag(entry.enemyId, `Incision ×${entry.stacks}`);
        chips.push(`Incisions on ${own.incisions.length} ${own.incisions.length === 1 ? 'enemy' : 'enemies'}`);
        break;
      case 'survey':
        if (own.targetId && own.count > 0) tag(own.targetId, `Survey ${own.count}`);
        chips.push(`Survey ${own.count}/${radiantSignatureCaps.survey}`);
        break;
      case 'foundation':
        chips.push(own.foundation ? `Foundation ${whole(own.foundation.durability)}/${whole(own.foundation.max)} · ${turns(own.foundation.remaining)}` : 'No Foundation');
        break;
      case 'season': chips.push(`Season · ${seasons[own.count]}`); break;
      case 'unreturned': chips.push(`Unreturned ${whole(own.stored)}`); break;
      case 'signal':
        for (const signal of own.signals) tag(signal.holderId, `Signal +${pct(signal.value)} · ${turns(signal.remaining)}`);
        chips.push(`Signals ${own.signals.length}`);
        break;
      case 'path':
        chips.push(`Promise ${own.count}/${radiantSignatureCaps.promise} · ${own.path === 'shelter' ? 'Shelter' : own.path === 'flourish' ? 'Flourish' : 'No path'}`);
        break;
      default:
        chips.push(`${counterLabels[own.kind]} ${own.count}/${radiantSignatureCaps[own.kind]}`);
    }
  }
  // D-493 B3a: Conduit marks and Burn bonuses carried by enemies.
  for (const target of state.enemies) {
    if (target.hp === 0) continue;
    for (const mark of target.marks ?? []) tag(target.id, `Nightglass Mark (${nameOf(mark.casterId)}) · ${turns(mark.remaining)}`);
    const amp = target.debuffs.find(effect => effect.category === 'burn')?.amp;
    if (amp) tag(target.id, `Cinder Testament · Burn +${pct(amp)}`);
    if (state.taunt && living(state.taunt)) tag(target.id, `Taunted · attacks ${nameOf(state.taunt)}`);
  }
  return { owners, holders, bonuses };
}

export function radiantSignatureChips(chips: readonly string[]): string {
  return chips.map(chip => `<span class="radiant-signature-chip">${escape(chip)}</span>`).join('');
}
export function radiantSignatureTags(tags: readonly string[]): string {
  return tags.map(text => `<span class="radiant-signature-tag">${escape(text)}</span>`).join('');
}
/** D-493 B3b: next-action bonus tags; `fresh` ones were just granted and play one finite sheen (static under Reduce motion). */
export function radiantBonusTags(tags: readonly string[], fresh: ReadonlySet<string> = new Set()): string {
  return tags.map(text => `<span class="radiant-signature-tag radiant-bonus-tag${fresh.has(text) ? ' is-fresh' : ''}">${escape(text)}</span>`).join('');
}
