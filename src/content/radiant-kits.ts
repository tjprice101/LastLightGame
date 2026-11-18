/**
 * Battle Flurry Phase 3 kits (D-473): Skill 1 / Skill 2 / Flare data for every released
 * Element-Bearer, transcribed from docs/Future Plans/battle-flurry-reference/phase3-kit-drafts.md.
 *
 * Values are fractions (2.6 = 260%). Flares hold the Ultimate tier values; the engine applies
 * the N3 tier scaling. Generic clauses run in the shared resolver. Bearer-specific clauses use
 * `signature` effects, `when` conditions, `perStack` adds and `alt` powers; they are interpreted
 * by the signature handlers (Phase 3 Step 2b) and are inert until then.
 */
export type KitEnemyTarget = 'target' | 'all-enemies';
export type KitAllyTarget = 'self' | 'all-allies' | 'other-allies' | 'lowest';
export type KitSkillTarget = 'one-enemy' | 'all-enemies' | 'none';
export type RadiantKitEffect = (
  | { kind: 'burn' | 'weaken' | 'expose'; to: KitEnemyTarget; value: number; turns: number }
  | { kind: 'attack-up' | 'defense-up' | 'reduction' | 'gain-up' | 'hot'; to: KitAllyTarget; value: number; turns: number }
  | { kind: 'heal' | 'shield' | 'fill'; to: KitAllyTarget; value: number }
  | { kind: 'cleanse'; to: KitAllyTarget }
  | { kind: 'ignore-defense' | 'damage-bonus'; value: number }
  | { kind: 'signature'; op: string; to?: KitAllyTarget | KitEnemyTarget; value?: number; turns?: number; charges?: number }
) & {
  /** Signature condition; the effect applies only while it holds (Step 2b). */
  when?: string;
  /** Added to `value` once per signature stack (Step 2b). */
  perStack?: number;
};
export interface RadiantSkillDef {
  name: string;
  hits: number;
  target: KitSkillTarget;
  /** Total damage coefficient split across `hits` (N8). */
  power: number;
  /** Added to `power` once per signature stack (Step 2b). */
  perStack?: number;
  /** Replacement power while a signature condition holds (Step 2b). */
  alt?: { when: string; power: number };
  effects: readonly RadiantKitEffect[];
}
export interface RadiantKitDef {
  signature: string | null;
  passive: { name: string; description: string };
  skill1: RadiantSkillDef;
  skill2: RadiantSkillDef;
  flare: RadiantSkillDef;
}
export type RadiantSkillSlot = 1 | 2;
/** Skills that take a selected enemy: single-enemy skills, and Fold the Sea, which moves Survey to the current target. */
export function radiantSkillAcceptsTarget(def: RadiantSkillDef): boolean {
  return def.target === 'one-enemy' || def.effects.some(effect => effect.kind === 'signature' && effect.op === 'move-survey');
}
/** N2 base Luminosity costs. */
export const radiantSkillCosts: Record<RadiantSkillSlot, number> = { 1: 25, 2: 40 };

const one = (hits: number, power: number) => ({ hits, target: 'one-enemy' as const, power });
const all = (hits: number, power: number) => ({ hits, target: 'all-enemies' as const, power });
const none = { hits: 0, target: 'none' as const, power: 0 };
function skill(name: string, base: { hits: number; target: KitSkillTarget; power: number },
  effects: readonly RadiantKitEffect[] = [], extra: Partial<Pick<RadiantSkillDef, 'perStack' | 'alt'>> = {}): RadiantSkillDef {
  return { name, ...base, ...extra, effects };
}
type Extra = { when?: string; perStack?: number };
const burn = (to: KitEnemyTarget, value: number, turns: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'burn', to, value, turns, ...extra });
const weaken = (to: KitEnemyTarget, value: number, turns: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'weaken', to, value, turns, ...extra });
const expose = (to: KitEnemyTarget, value: number, turns: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'expose', to, value, turns, ...extra });
const attackUp = (to: KitAllyTarget, value: number, turns: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'attack-up', to, value, turns, ...extra });
const defenseUp = (to: KitAllyTarget, value: number, turns: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'defense-up', to, value, turns, ...extra });
const reduction = (to: KitAllyTarget, value: number, turns: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'reduction', to, value, turns, ...extra });
const gainUp = (to: KitAllyTarget, value: number, turns: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'gain-up', to, value, turns, ...extra });
const heal = (to: KitAllyTarget, value: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'heal', to, value, ...extra });
const shield = (to: KitAllyTarget, value: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'shield', to, value, ...extra });
const fill = (to: KitAllyTarget, value: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'fill', to, value, ...extra });
const cleanse = (to: KitAllyTarget): RadiantKitEffect => ({ kind: 'cleanse', to });
const ignore = (value: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'ignore-defense', value, ...extra });
const bonus = (value: number, extra: Extra = {}): RadiantKitEffect => ({ kind: 'damage-bonus', value, ...extra });
const sig = (op: string, fields: { to?: KitAllyTarget | KitEnemyTarget; value?: number; turns?: number; charges?: number;
  perStack?: number } = {}): RadiantKitEffect => ({ kind: 'signature', op, ...fields });

export const radiantKits = {
  // Batch 1: Opening and Flagships.
  ember: { signature: 'Burn detonation',
    passive: { name: 'Unbroken Ember', description: 'Boosts Burn damage of all allies (+30%).' },
    skill1: skill('Cinder Cleave', one(4, 2.6), [burn('target', .25, 3)]),
    skill2: skill('Flame Arc', all(6, 1.8), [sig('detonate', { to: 'all-enemies', value: 2 })]),
    flare: skill('Dawnfire', all(12, 9), [burn('all-enemies', 1, 3), attackUp('all-allies', .5, 3)]) },
  tide: { signature: 'full-block refunds',
    passive: { name: 'Stillwater Guard', description: 'When a Shield from Tizu fully blocks a hit, that ally gains 8 Luminosity.' },
    skill1: skill('Undertow Thrust', one(4, 2.4), [weaken('target', .25, 2)]),
    skill2: skill('Tidal Shelter', none, [defenseUp('all-allies', .3, 2), shield('all-allies', .25)]),
    flare: skill('Ocean Memory', none, [reduction('all-allies', .3, 2), shield('all-allies', .5)]) },
  sprout: { signature: 'Seeds',
    passive: { name: 'Root of Hope', description: 'A Seed heals its holder (30% of max Health) at the start of the next player turn while Flora lives. One Seed per ally.' },
    skill1: skill('Briar Shot', one(4, 2.2), [sig('seed', { to: 'lowest', value: .3 })]),
    skill2: skill('Verdant Renewal', none, [heal('all-allies', .25), sig('seed', { to: 'all-allies', value: .3 })]),
    flare: skill('Worldseed', none, [gainUp('all-allies', .3, 3), heal('all-allies', .6), sig('seed', { to: 'all-allies', value: .6 })]) },
  atmoso: { signature: 'Cyclone',
    passive: { name: 'Gale Cadence', description: 'Each Normal Attack by another ally adds 1 Gust to Atmoso\'s Cyclone (max 5 Gusts).' },
    skill1: skill('Razor Gale', one(3, 2.5), [sig('cyclone-release', { value: 1 })]),
    skill2: skill('Cyclone Weave', all(5, 1.5), [sig('cyclone', { value: .6, perStack: .2, turns: 2 })]),
    flare: skill('Sky Without End', all(12, 8.5), [weaken('all-enemies', .15, 2), sig('cyclone-release', { value: 3 })]) },
  aurora: { signature: null,
    passive: { name: 'Lens of Diminishment', description: 'Weaken from all allies lasts 1 more turn.' },
    skill1: skill('Gleamseal', one(3, 2), [weaken('target', .3, 2)]),
    skill2: skill('Eclipse Mandate', all(4, 1.4), [weaken('all-enemies', .2, 2)]),
    flare: skill('Final Dawn Verdict', all(8, 4), [weaken('all-enemies', .35, 3), reduction('all-allies', .3, 2)]) },
  bliss: { signature: 'Tempo',
    passive: { name: 'Stillfeather Tempo', description: 'A skill or Convergent Light gets its Opening bonus if Bliss acts before every other living ally this turn, and its Closing bonus if she acts after all of them. When alone, every action is Opening.' },
    skill1: skill('Warfeather Cut', one(4, 2.6), [bonus(.3, { when: 'opening' }), heal('lowest', .15, { when: 'closing' })]),
    skill2: skill('Quietstorm Flourish', all(6, 1.7), [attackUp('all-allies', .2, 1, { when: 'opening' }), shield('all-allies', .1, { when: 'closing' })]),
    flare: skill('Thousandfeather Stillness', all(12, 9.5), [bonus(.4, { when: 'opening' }), heal('all-allies', .25, { when: 'closing' })]) },
  bruno: { signature: 'Cover',
    passive: { name: 'Faultbound Resolve', description: 'Damage redirected to Bruno by Cover is reduced by 25%.' },
    skill1: skill('Seismic Hammerfall', one(3, 2.4), [defenseUp('self', .3, 2)]),
    skill2: skill('Citadel Mantle', none, [sig('cover', { to: 'other-allies', value: .4, turns: 1 }), shield('self', .2)]),
    flare: skill('Worldwall Ascendant', none, [sig('cover', { to: 'other-allies', value: .6, turns: 2 }), defenseUp('all-allies', .4, 2), shield('self', .4)]) },
  disciple: { signature: null,
    passive: { name: 'Shared Mindflame', description: 'Attack Up from Disciple also fills Luminosity of each ally it reaches (+5).' },
    skill1: skill('Thoughtspark Benediction', none, [attackUp('all-allies', .3, 2)]),
    skill2: skill('Concord of Chaos', all(4, 1.4), [fill('other-allies', 12)]),
    flare: skill('Unbound Mindcrown', none, [attackUp('all-allies', .6, 3), fill('other-allies', 25)]) },
  elise: { signature: 'Shuriken',
    passive: { name: 'Stormwheel Rhythm', description: 'Elise holds 2 Shuriken. A lodged Shuriken returns to her, without damage, when its enemy is defeated.' },
    skill1: skill('Voltstar Cut', one(3, 2.2), [sig('lodge-shuriken')], { alt: { when: 'no-shuriken-held', power: 2.8 } }),
    skill2: skill('Crosscurrent Volley', one(2, 1.8), [sig('recall-shuriken', { value: 1.5 })]),
    flare: skill('Infinite Thunderwheel', one(12, 13), [sig('recall-shuriken', { value: 4 })]) },
  razor: { signature: 'Wounds',
    passive: { name: 'Unbroken Night', description: 'Health Razor loses to enemy hits is stored as Wounds. Shield-absorbed damage, redirected damage and Burn add none; healing does not remove Wounds.' },
    skill1: skill('Nightcleave', one(3, 2.2), [sig('spend-wounds', { value: 1 })]),
    skill2: skill('Eclipse Bastion', none, [reduction('self', .3, 1), shield('self', .2)]),
    flare: skill('Unbroken Midnight', one(12, 11), [sig('spend-wounds', { value: 3 })]) },
  // Batch 2: Rose and Calamitic.
  rosetta: { signature: 'Quarry',
    passive: { name: 'Virtuous Bloom', description: 'Rosetta marks one enemy as her Quarry. Each other ally whose attack hits the Quarry this turn counts as a contributor.' },
    skill1: skill('Golden Thorn Volley', one(4, 2.5), [expose('target', .15, 2), sig('quarry')]),
    skill2: skill('Crimson Skyfall', one(5, 3), [sig('quarry-target')], { perStack: .4 }),
    flare: skill('Rose Beyond the Sun', one(12, 13.5), [sig('quarry-target'), expose('target', .3, 3), sig('heal-contributors', { value: .2 })]) },
  thornia: { signature: 'Thorn Trap',
    passive: { name: 'Forbidden Garden', description: 'When an enemy with Thornia\'s Thorn Trap damages an ally, the trap spends 1 charge to strike it (60% Attack), once per enemy action. Each enemy holds one trap.' },
    skill1: skill('Gilded Thorn Guard', one(2, 1.6), [sig('thorn-trap', { to: 'target', value: .6, charges: 3, turns: 3 })]),
    skill2: skill('Shadow Rose Cleave', one(4, 2.5), [sig('spend-trap', { to: 'target', value: 1 }), shield('all-allies', .15)]),
    flare: skill('Thousand-Rose Dominion', all(12, 6.5), [sig('thorn-trap', { to: 'all-enemies', value: 2, charges: 3, turns: 3 }), shield('all-allies', .3)]) },
  crinso: { signature: 'Combo',
    passive: { name: 'Rose Duality', description: 'Using Skill 1 and Skill 2 alternately adds 1 Combo (max 5). Repeating the same skill resets Combo to 0. Normal Attack does not affect it.' },
    skill1: skill('Golden Edge', one(4, 2.5), [ignore(.2, { when: 'after-rupture' })]),
    skill2: skill('Crimson Rupture', one(5, 3.1), [burn('target', .2, 2)], { alt: { when: 'after-edge', power: 3.7 } }),
    flare: skill('Blossoming Cataclysm', one(12, 12), [ignore(.45, { when: 'combo-3' }), sig('spend')], { perStack: 2 }) },
  ozriel: { signature: 'Refusal',
    passive: { name: 'Refusal', description: 'While Ozriel lives, each ally survives one lethal hit per encounter with 1 Health.' },
    skill1: skill('Pane of Absolution', one(3, 2.3), [weaken('target', .4, 2)]),
    skill2: skill('Cathedral of Shards', none, [shield('all-allies', .3)]),
    flare: skill('The World Refuses', all(12, 5), [reduction('all-allies', .25, 2), shield('all-allies', .55)]) },
  ilvaris: { signature: 'Fate-seared Mark',
    passive: { name: 'Severed Prophecy', description: 'Each Fate-seared Mark stack makes its enemy take +10% damage from all allies (max 5 stacks, 2 turns; a new stack refreshes the duration).' },
    skill1: skill('Unwritten Verse', one(3, 2.2), [sig('fate-mark', { to: 'target', value: 1 })]),
    skill2: skill('Glasschoir Hymn', none, [attackUp('all-allies', .3, 2), heal('all-allies', .3)]),
    flare: skill('Tomorrow, Unwritten', all(12, 5), [sig('fate-mark', { to: 'all-enemies', value: 2 }), heal('all-allies', .5), fill('all-allies', 15)]) },
  kaelith: { signature: 'Fractalized Incision',
    passive: { name: 'Reality Fault', description: 'Each skill or Convergent Light from Kaelith adds 1 Incision to every enemy it hits (max 3). Each Incision makes that enemy take +10% damage from all allies until consumed.' },
    skill1: skill('Shatterfall', all(5, 2)),
    skill2: skill('Glass Meridian', one(6, 3.6), [sig('consume-incisions', { to: 'target' })], { perStack: .2 }),
    flare: skill('Denial of Fate', all(12, 10), [expose('all-enemies', .25, 2)]) },
  // Batch 3: Elemental War.
  nerithe: { signature: 'Survey',
    passive: { name: 'Uncharted Current', description: 'Nerithe\'s Normal Attack fills 5 extra Luminosity and adds 1 Survey to its target (max 3). Only one enemy holds Survey; surveying another enemy removes it from the old one.' },
    skill1: skill('Meridian Break', one(4, 2.6), [sig('survey-target'), sig('spend-survey', { value: .25 })]),
    skill2: skill('Fold the Sea', all(6, 1.8), [sig('move-survey')]),
    flare: skill('Ocean Beyond the Map', one(12, 12.5), [sig('survey-target'), sig('spend-all-survey', { value: .2 })]) },
  orvella: { signature: 'Foundation',
    passive: { name: 'Load-Bearing Will', description: 'While Orvella\'s Foundation has durability, it absorbs 20% of each direct hit on an ally (before Shields) and loses that much durability. Only one Foundation exists.' },
    skill1: skill('Keystone Reversal', one(3, 2.1), [sig('repair-foundation', { value: .08 })], { alt: { when: 'no-foundation', power: 2.7 } }),
    skill2: skill('Raise the Faultline', none, [defenseUp('all-allies', .25, 2), sig('foundation', { value: .35, turns: 3 })]),
    flare: skill('Worldweight Citadel', all(12, 9), [sig('spend-foundation', { to: 'all-enemies', value: 3 }), sig('foundation', { value: .5, turns: 3 })]) },
  vaelor: { signature: 'Beat',
    passive: { name: 'Standing Thunder', description: 'The Beat cycles Tune, Rise, Crescendo, one step each player turn, starting on Tune.' },
    skill1: skill('Forked Cadence', one(4, 2.5), [bonus(.3, { when: 'tune' })]),
    skill2: skill('Resonance Cascade', all(6, 1.7), [attackUp('self', .25, 2, { when: 'rise' })]),
    flare: skill('Last Chord of the Sky', all(12, 11.5), [], { alt: { when: 'crescendo', power: 15 } }) },
  caldrex: { signature: 'Heat',
    passive: { name: 'Banked Heat', description: 'Caldrex gains 1 Heat (max 3) when an enemy damages his Health or Shield, once per enemy phase. Heat resets each encounter.' },
    skill1: skill('Close the Kiln', none, [defenseUp('self', .3, 2), shield('all-allies', .15)]),
    skill2: skill('Cinder Discharge', all(5, 2.2), [burn('all-enemies', .2, 3), sig('spend')], { perStack: .25 }),
    flare: skill('Nothing Beyond These Gates', none, [sig('burn-up', { to: 'all-allies', value: .25, turns: 2 }), shield('all-allies', .5, { perStack: .05 }), sig('spend')]) },
  solenne: { signature: 'Stillness',
    passive: { name: 'Held Stillness', description: 'Solenne holds up to 4 Stillness. Each hit she takes spends 1 Stillness to reduce that damage by 20% before Shields. Stillness resets each encounter.' },
    skill1: skill('Answer the Bell', one(3, 2.2), [weaken('target', .25, 2)]),
    skill2: skill('Circle of Repose', none, [shield('all-allies', .18), sig('gain', { value: 2 })]),
    flare: skill('The Last Reverberation', all(12, 7), [shield('all-allies', .25, { perStack: .05 }), sig('spend')], { perStack: .45 }) },
  myrthen: { signature: 'Season',
    passive: { name: 'Turning Season', description: 'Each skill advances the Season from Sprout to Bloom to Harvest. In Harvest, the next skill or Convergent Light deals +35% and ignores 20% of Defense, then the Season returns to Sprout. Battles start in Sprout.' },
    skill1: skill('Reaper\'s Claim', one(4, 2.5), [expose('target', .12, 2)]),
    skill2: skill('Turn the Bough', all(6, 1.7)),
    flare: skill('All That Ripens', one(12, 12.5)) },
  neralis: { signature: 'Current',
    passive: { name: 'Returning Current', description: 'Neralis gains 1 Current (max 3) once per action when his Normal Attack hits or his skill restores Health.' },
    skill1: skill('Light the Next Station', none, [defenseUp('lowest', .3, 2), heal('lowest', .35)]),
    skill2: skill('Carry Them Back', none, [heal('all-allies', .18, { perStack: .06 }), sig('spend')]),
    flare: skill('No Crossing Left Empty', all(12, 6.5), [heal('all-allies', .3, { perStack: .05 }), sig('spend')]) },
  varkhel: { signature: 'Tension',
    passive: { name: 'Tension Held', description: 'Varkhel gains 1 Tension (max 4) when an enemy damages his Health or Shield (once per enemy phase) and when his Normal Attack hits.' },
    skill1: skill('Set the Warning Chain', none, [defenseUp('self', .4, 2), shield('self', .25)]),
    skill2: skill('Return the Strain', one(4, 2.6), [ignore(.2), sig('spend')], { perStack: .45 }),
    flare: skill('The Bridge Holds Behind Me', all(12, 6.5), [shield('all-allies', .3), sig('spend')], { perStack: .55 }) },
  seravelle: { signature: 'Cadence',
    passive: { name: 'Convoy Cadence', description: 'While Seravelle lives, the first ally Normal Attack that hits each turn adds 1 Cadence (max 3).' },
    skill1: skill('Send the Ember Ahead', one(4, 2.3), [burn('target', .15, 2)]),
    skill2: skill('Move as One', none, [attackUp('all-allies', .3, 2, { perStack: .1 }), sig('spend')]),
    flare: skill('The Road Belongs to Everyone', all(12, 6), [gainUp('all-allies', .3, 2), fill('other-allies', 20)]) },
  velmira: { signature: 'Crosscut',
    passive: { name: 'Alternating Edge', description: 'Each skill Velmira lands on a Weakened enemy adds 1 Crosscut (max 3).' },
    skill1: skill('Open the Seam', one(4, 2.6), [weaken('target', .25, 2)]),
    skill2: skill('Turn the Other Edge', all(6, 1.8), [ignore(.2, { when: 'crosscut-2' })]),
    flare: skill('Leave the Doorway Standing', one(12, 10), [ignore(.3), sig('spend')], { perStack: .9 }) },
  // Batch 4: Moon (banners and events stay inactive until launch approval).
  maerion: { signature: 'Unreturned',
    passive: { name: 'Names Still Carried', description: 'While Maerion lives, Health allies lose to direct enemy hits is stored as Unreturned (max 45% of Maerion\'s max Health). Burn and redirected damage add none.' },
    skill1: skill('Crescent Triage', one(3, 2), [heal('lowest', .25)]),
    skill2: skill('A Place on the Ferry', none, [heal('lowest', .45), sig('spend-unreturned', { to: 'lowest' })]),
    flare: skill('Bring Every Name Home', none, [heal('all-allies', .65), sig('spend-unreturned', { to: 'all-allies' })]) },
  caevren: { signature: 'Load',
    passive: { name: 'Weight of the Watch', description: 'Caevren gains 1 Load (max 3) when an enemy damages his Health or Shield, once per enemy phase. Redirected hits count.' },
    skill1: skill('Hold the Meridian', one(4, 2.5), [defenseUp('self', .3, 2)]),
    skill2: skill('Counterweight Covenant', none, [shield('lowest', .3), sig('cover', { to: 'other-allies', value: .3, turns: 2 })]),
    flare: skill('The Night Shall Not Fall', none, [reduction('all-allies', .2, 2), shield('self', .6, { perStack: .12 }), sig('cover', { to: 'other-allies', value: .3, turns: 2 }), sig('spend')]) },
  vespera: { signature: 'Signal',
    passive: { name: 'Someone Still Beyond the Walls', description: 'Signal makes an ally\'s next damaging skill or Convergent Light deal +35%, until the end of the next player turn. Reapplying refreshes it rather than stacking.' },
    skill1: skill('Whitefire Dispatch', one(3, 2.1), [burn('target', .25, 3)]),
    skill2: skill('Keep the Last Beacon', none, [sig('signal', { to: 'other-allies', value: .35 })]),
    flare: skill('None Left in the Dark', all(12, 6), [sig('burn-up', { to: 'all-allies', value: .2, turns: 2 }), sig('signal', { to: 'other-allies', value: .5 })]) },
  ilyss: { signature: 'Severance',
    passive: { name: 'What Need Not Remain', description: 'When Ilyss removes a Weaken from an ally, she gains 1 Severance (max 3), once per player turn.' },
    skill1: skill('Cut the Harmful Thread', one(3, 2.1), [weaken('target', .25, 2)]),
    skill2: skill('Unbind the Living', none, [heal('lowest', .45), cleanse('lowest')]),
    flare: skill('No Promise of Resurrection', none, [heal('all-allies', .6, { perStack: .1 }), cleanse('all-allies'), sig('spend')]) },
  asteriel: { signature: 'Path',
    passive: { name: 'Futures Given Freely', description: 'Skill 1 enters Shelter and Skill 2 enters Flourish. Switching between them grants 1 Promise (max 3). Battles start with no path.' },
    skill1: skill('Lend the Quiet Seed', none, [shield('all-allies', .22), sig('path', { value: 1 })]),
    skill2: skill('Open the Night Library', none, [attackUp('all-allies', .3, 1), sig('path', { value: 2 })]),
    flare: skill('Every Orbit Bears a Future', none, [
      shield('all-allies', .45, { when: 'shelter-or-no-path', perStack: .08 }),
      attackUp('all-allies', .5, 2, { when: 'flourish', perStack: .1 }), sig('spend')]) },
  serapha: { signature: 'Interval',
    passive: { name: 'An Interval Without Surrender', description: 'When an enemy Weakened by Serapha attacks, she gains 1 Interval (max 3), once per enemy phase.' },
    skill1: skill('Terms of Mercy', one(3, 2.3), [weaken('target', .2, 2)]),
    skill2: skill('A Passage Left Open', none, [reduction('all-allies', .2, 1), heal('all-allies', .28)]),
    flare: skill('Let Them Leave Alive', none, [reduction('all-allies', .2, 2, { perStack: .05 }), heal('all-allies', .65), sig('spend')]) },
} as const satisfies Record<string, RadiantKitDef>;
export type RadiantKitId = keyof typeof radiantKits;

/** N3: Glimmering and Sparkling Flares scale damage and effect values; durations do not change. */
export const radiantFlareTierScale = {
  sparkling: { damage: .5, effect: .7, hits: 4 },
  glimmering: { damage: .75, effect: .85, hits: 8 },
  ultimate: { damage: 1, effect: 1, hits: 12 },
} as const;
