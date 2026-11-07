import type { Ability } from './combat';
import type { StarterId } from './starters';
import { nativeBalance } from './native-balance';
import { calamiticFighters, isCalamiticCharacter, type CalamiticCharacterId } from './calamitic-characters';
import { moonSunshadeNativeIdentities } from './moon-sunshade-native-identities';
import { isNewEventCharacter } from './moon-sunshade-events';

export interface NativeIdentityDefinition {
  selfStats?: { health?: number; defense?: number; skillPower?: number };
  role: string;
  playLoop: string;
  passive: { name: string; description: string };
  abilities: Record<'skill1' | 'skill2' | 'ultimate', Ability>;
}

function ability(name: string, description: string, damageMultiplier?: number, targets?: Ability['targets'], excludeSelf?: boolean): Ability {
  return {
    name, description, cooldown: 0,
    strength: damageMultiplier === undefined ? {} : { damageMultiplier },
    ...(targets ? { targets } : {}),
    ...(excludeSelf ? { excludeSelf } : {}),
  };
}

function calamiticIdentity(id: CalamiticCharacterId, role: string, playLoop: string,
  selfStats: NativeIdentityDefinition['selfStats']): NativeIdentityDefinition {
  const kit = calamiticFighters[id];
  const abilities = structuredClone(kit.abilities);
  abilities.ultimate.description = abilities.ultimate.description.replace(' Recover next turn.', '');
  return { role, playLoop, selfStats, passive: { name: kit.passive.name, description: kit.passive.description },
    abilities };
}

export const nativeIdentities: Record<StarterId, NativeIdentityDefinition> = {
  ...moonSunshadeNativeIdentities,
  ozriel: calamiticIdentity('ozriel', 'Shield tank',
    '[Ozriel] protects every living squad member with stacking shields and one [Refusal] per encounter while he lives.',
    { health: .65, defense: .65 }),
  ilvaris: calamiticIdentity('ilvaris', 'Mark and healing support',
    '[Ilvaris] builds [Fate-seared Mark] to five stacks and refreshes [Hymn of Broken Glass] while healing the squad.',
    { health: 2, defense: 1 }),
  kaelith: calamiticIdentity('kaelith', 'Fractalized Incision attacker',
    '[Kaelith] builds three [Fractalized Incision] stacks through direct hits; [Glass Meridian] spends them for a stronger strike.',
    { skillPower: .75 }),
  ember: {
    role: 'Persistent fire specialist',
    playLoop: '[Infernis] applies [Burn] that lasts across enemy phases; [Flame Arc] can deal its remaining damage at once.',
    passive: {
      name: 'Unbroken Ember',
      description: 'Allied damage-over-time gains +100% damage per 30 levels of its source, fixed when applied.',
    },
    abilities: {
      skill1: ability('Cinder Cleave', '160% direct damage to one enemy, then apply [Burn] dealing 25% of [Infernis]’s Attack per enemy phase for three enemy phases.', 1.6),
      skill2: ability('Flame Arc', '110% direct damage to all enemies. Each surviving enemy carrying [Infernis]’s [Burn] immediately takes the damage of up to two of its remaining [Burn] phases, and those phases are removed. [Burn] applied by other characters is unaffected.', 1.1, 'all-enemies'),
      ultimate: ability('Last Flare: Dawnfire', '200% direct damage to all enemies, then apply [Burn] dealing 135% of [Infernis]’s Attack per enemy phase for three enemy phases.', 2, 'all-enemies'),
    },
  },
  tide: {
    role: 'Precise barrier protector',
    playLoop: '[Tizu] places a stacking shield on one chosen ally before the next enemy attack.',
    passive: {
      name: 'Stillwater Guard',
      description: 'When a shield from [Tizu]’s abilities fully absorbs an enemy’s direct hit so that no HP is lost, the shielded ally gains 8 [Elemental Gauge].',
    },
    abilities: {
      skill1: { ...ability('Undertow Thrust', '150% direct damage to one enemy and apply 25% [Weaken] for the next enemy phase.', 1.5), strength: { damageMultiplier: 1.5, weakenFraction: .25 } },
      skill2: ability('Tidal Shelter', `Grant one living ally a Shield equal to ${nativeBalance.tizu.shelter * 100}% of its maximum Health.`, undefined, 'one-ally'),
      ultimate: ability('Last Flare: Ocean Memory', `Grant all living allies a Shield equal to ${nativeBalance.tizu.oceanMemory * 100}% of their maximum Health. Reduce the first direct hit each ally takes while this Shield remains by 45%.`, undefined, 'all-allies'),
    },
  },
  sprout: {
    role: 'Delayed recovery gardener',
    playLoop: '[Flora] plants [Seed] healing that restores HP at the start of the next player turn, or harvests it immediately with [Verdant Renewal].',
    passive: {
      name: 'Root of Hope',
      description: `Each living ally can hold one [Seed]. At the start of the next player turn, it restores ${nativeBalance.flora.seed * 100}% of its holder’s maximum Health while [Flora] is alive, then disappears. Planting another replaces the previous [Seed].`,
    },
    abilities: {
      skill1: ability('Briar Shot', '140% direct damage to one enemy, then plant a [Seed] on the living ally with the lowest Health percentage.', 1.4),
      skill2: ability('Verdant Renewal', `Harvest existing [Seeds], healing their holders for ${nativeBalance.flora.seed * 100}% maximum Health (${nativeBalance.flora.empoweredSeed * 100}% for [Empowered Seeds]). Then plant a [Seed] on each living ally, preserving any pending [Empowered Seed].`, undefined, 'all-allies'),
      ultimate: ability('Last Flare: Worldseed', `Every living ally immediately heals ${nativeBalance.flora.immediateHeal * 100}% of its maximum HP, then receives an [Empowered Seed] that restores ${nativeBalance.flora.empoweredSeed * 100}% at the start of the next player turn while [Flora] is alive.`, undefined, 'all-allies'),
    },
  },
  atmoso: {
    role: 'Delayed wind-field attacker',
    playLoop: '[Cyclone Weave] creates a [Cyclone] that grows as allies act and later releases on all enemies; [Razor Gale] can release it early.',
    passive: {
      name: 'Gale Cadence',
      description: 'While a [Cyclone] is active, the first action each other living ally takes in a player turn ([Normal Attack] or any skill) adds one [Gust].',
    },
    abilities: {
      skill1: ability('Razor Gale', '180% direct damage to one enemy. If a [Cyclone] exists, it releases immediately on all living enemies and ends.', 1.8),
      skill2: ability('Cyclone Weave', 'Release any existing [Cyclone], then create one with 0 [Gust]. After two enemy phases, it releases on all living enemies for 70% of [Atmoso]’s Attack plus 30% per [Gust]. [Atmoso] must be alive for a release.', undefined, 'all-enemies'),
      ultimate: ability('Last Flare: Sky Without End', 'Release any active [Cyclone] at its current [Gust] count for three times its normal release damage, then deal 200% direct damage to all enemies.', 2, 'all-enemies'),
    },
  },
  elise: {
    role: 'Two-shuriken placement duelist',
    playLoop: '[Elise] lodges two [Shuriken] in enemies, then recalls them for extra strikes.',
    passive: {
      name: 'Stormwheel Rhythm',
      description: '[Elise] has exactly two [Shuriken], both held at the start of battle. Each is either held or lodged in one living enemy. A lodged [Shuriken] returns to her when its enemy is defeated, without dealing damage.',
    },
    abilities: {
      skill1: ability('Voltstar Cut', 'Throw one held [Shuriken] for 110% direct damage to the selected enemy; it lodges in that enemy. With no [Shuriken] held, deal 140% direct damage instead and neither [Shuriken] moves. Both [Shuriken] can lodge in the same enemy.', 1.1),
      skill2: ability('Crosscurrent Volley', 'Recall every lodged [Shuriken]: each strikes its enemy for 90% of [Elise]’s Attack. If both were in the same enemy, it takes one extra 60% strike. If both [Shuriken] are already held, deal 140% direct damage to the selected enemy instead. Recalled strikes generate no Gauge.', 1.4),
      ultimate: ability('Last Flare: Infinite Thunderwheel', 'Recall every lodged [Shuriken] with 270% strikes and a 180% same-enemy strike, then deal 260% direct damage to the selected enemy.', 2.6),
    },
  },
  bliss: {
    role: 'Action-order dancer',
    playLoop: '[Bliss]’s skills change with when she acts in the player turn: acting first adds offense, acting last adds healing and shields. When she is the only living ally, she always counts as acting first.',
    passive: {
      name: 'Stillfeather Tempo',
      description: 'Each action is [Opening] if no other living ally has acted this player turn, [Closing] if every other living ally has acted, and [Passing] otherwise. When [Bliss] is the only living ally, every action is [Opening].',
    },
    abilities: {
      skill1: ability('Warfeather Cut', '170% direct damage to one enemy. [Opening]: +25 percentage points Critical Rate for this attack. [Closing]: heal the most injured other living ally for 6% of its maximum HP. [Passing]: no bonus.', 1.7),
      skill2: ability('Quietstorm Flourish', '120% direct damage to all enemies. [Opening]: living allies deal 10% more direct damage this player turn. [Closing]: grant all living allies a Shield equal to 6% of their maximum Health.', 1.2, 'all-enemies'),
      ultimate: ability('Last Flare: Thousandfeather Stillness', '250% direct damage to all enemies. [Opening]: +45 percentage points Critical Rate for this attack. [Closing]: heal other living allies for 15% of their maximum HP. [Passing]: no bonus.', 2.5, 'all-enemies'),
    },
  },
  bruno: {
    role: 'Deliberate damage interceptor',
    playLoop: '[Bruno] places [Cover] on allies and takes part of the damage they receive.',
    passive: {
      name: 'Faultbound Resolve',
      description: 'Damage redirected to [Bruno] by [Cover] is reduced by 25%.',
    },
    abilities: {
      skill1: ability('Seismic Hammerfall', '190% direct damage to one enemy.', 1.9),
      skill2: ability('Citadel Mantle', 'Place [Cover] on another living ally until the next enemy phase ends: 50% of the direct damage it takes, after Defense, is redirected to [Bruno]. Only one ally can hold this [Cover]; recasting moves it. If [Bruno] is the only living ally, he instead takes 20% less direct damage for that phase. Redirected damage cannot be redirected again.', undefined, 'one-ally', true),
      ultimate: ability('Last Flare: Worldwall Ascendant', 'Place [Cover] on every other living ally for two enemy phases, redirecting 60% of each direct hit to [Bruno]; this replaces single-ally [Cover]. Grant [Bruno] a Shield equal to 30% of his maximum Health.', undefined, 'all-allies'),
    },
  },
  disciple: {
    role: 'Conditional ally instructor',
    playLoop: '[Disciple] gives one ally an [Instruction] ([Strike], [Shelter] or [Resolve]) that strengthens its next matching action.',
    passive: {
      name: 'Shared Mindflame',
      description: '[Disciple] maintains one [Instruction] on one living ally, which can be [Disciple]. The ally’s next action of any kind ([Normal Attack] or a skill) uses it up; otherwise it expires at the end of the next player turn. Giving a new [Instruction] replaces the old one. A new [Instruction] takes effect after the action that granted it.',
    },
    abilities: {
      skill1: ability('Thoughtspark Benediction', 'Give one living ally [Strike]: its next action deals 30% more direct damage.', undefined, 'one-ally'),
      skill2: ability('Concord of Chaos', 'Give one living ally [Shelter]: its next action heals and Shields for 35% more. Does not increase Conduit-generated healing or Shields.', undefined, 'one-ally'),
      ultimate: ability('Last Flare: Unbound Mindcrown', 'Give [Resolve] to all living allies, replacing their current [Instruction]. Each ally’s next action gains [Strike] (45% more direct damage), [Shelter] (52.5% more healing and shields) or both, matching what that action does. [Resolve] expires at the end of the next player turn.', undefined, 'all-allies'),
    },
  },
  aurora: {
    role: 'Hostile skill forecaster',
    playLoop: '[Aurora] reveals when each enemy’s next special skill is due; [Seal] and [Last Flare: Final Dawn Verdict] reduce its damage.',
    passive: {
      name: 'Lens of Diminishment',
      description: 'The battle menu shows each living enemy’s next scheduled special skill or ultimate and the enemy phase it is due, or states that none is scheduled.',
    },
    abilities: {
      skill1: ability('Gleamseal', 'Place a [Seal] on one enemy for three enemy phases. Its next scheduled special skill or ultimate deals 40% less direct damage and consumes the [Seal]. Recasting refreshes it and keeps the stronger reduction.'),
      skill2: ability('Eclipse Mandate', '100% direct damage to all enemies, then place a 25% [Seal] on each survivor, following the same rules as [Gleamseal].', 1, 'all-enemies'),
      ultimate: ability('Last Flare: Final Dawn Verdict', 'For two enemy phases, all living allies take 75% less direct damage from enemy ultimates. Enemy [Normal Attack] and other skills are unaffected.', undefined, 'all-allies'),
    },
  },
  razor: {
    role: 'Wounds-powered revenge duelist',
    playLoop: '[Razor] stores HP lost to enemy attacks as [Wounds], then spends them for extra damage.',
    passive: {
      name: 'Unbroken Night',
      description: 'HP [Razor] loses to direct enemy hits is stored as [Wounds]. Damage absorbed by shields, damage redirected to him, [Burn], HP he pays himself and Conduit effects add no [Wounds]. Healing does not remove [Wounds].',
    },
    abilities: {
      skill1: ability('Nightcleave', '160% direct damage to one enemy, then spend all [Wounds] for an extra strike that uses the spent amount as its Attack.', 1.6),
      skill2: ability('Eclipse Bastion', '[Razor] takes 30% less direct damage during the next enemy phase, then gains a Shield equal to the Health he lost to direct hits during that phase.'),
      ultimate: ability('Last Flare: Unbroken Midnight', '220% direct damage to one enemy, then spend all [Wounds] for an extra strike dealing three times the damage of a strike using twice the spent amount as its Attack, reduced by Defense.', 2.2),
    },
  },
  rosetta: {
    role: 'Coordinated quarry hunter',
    playLoop: '[Rosetta] marks a [Quarry]; when different allies hit it in the same player turn, her abilities gain bonuses.',
    passive: {
      name: 'Virtuous Bloom',
      description: '[Rosetta] can have one [Quarry]. Each player turn, the different living allies whose attacks hit it directly are counted. Each direct hit on it after two different allies have hit it that player turn gives each of those allies a shield worth 8% of their maximum HP.',
    },
    abilities: {
      skill1: ability('Golden Thorn Volley', '160% direct damage to one enemy and mark it as [Quarry] until it is defeated or [Rosetta] marks another enemy. This hit counts as her contribution. Marking the same enemy again keeps this turn’s count; marking a different enemy resets it.', 1.6),
      skill2: ability('Crimson Skyfall', '200% direct damage to a living [Quarry], plus 25% for each other ally who hit it this player turn. With no living [Quarry], deal 160% direct damage to the selected enemy.', 2),
      ultimate: ability('Last Flare: Rose Beyond the Sun', '300% direct damage to the [Quarry], or to the selected enemy if there is none. If at least two different allies hit the [Quarry] this player turn, heal those allies for 15% of their maximum Health.', 3),
    },
  },
  thornia: {
    role: 'Enemy-action thorn trapper',
    playLoop: '[Thornia] places a [Thorn Trap] that strikes an enemy whenever it attacks; [Shadow Rose Cleave] can spend a charge for immediate damage.',
    passive: {
      name: 'Forbidden Garden',
      description: 'Each enemy can hold one [Thorn Trap] from [Thornia], with up to three charges. When that enemy finishes an action that deals direct damage to any ally, one charge is spent for a strike of 60% of [Thornia]’s Attack. This happens once per enemy action, however many allies it hits. Damage absorbed by shields still counts; actions that deal no damage do not.',
    },
    abilities: {
      skill1: ability('Gilded Thorn Guard', 'Place a [Thorn Trap] with three charges on the selected enemy for three enemy phases. Recasting refreshes its charges and duration, preserving an [Empowered Thorn Trap].'),
      skill2: ability('Shadow Rose Cleave', '170% direct damage to one enemy. If it has a [Thorn Trap], spend one charge for an extra strike of 80% of [Thornia]’s Attack.', 1.7),
      ultimate: ability('Last Flare: Thousand-Rose Dominion', '140% direct damage to all enemies, then place an [Empowered Thorn Trap] with three charges on each survivor for three enemy phases. Its strikes deal 270% of [Thornia]’s Attack.', 1.4, 'all-enemies'),
    },
  },
  crinso: {
    role: 'Alternating-edge combo duelist',
    playLoop: 'Alternating [Golden Edge] and [Crimson Rupture] builds [Combo]; [Last Flare: Blossoming Cataclysm] spends it.',
    passive: {
      name: 'Rose Duality',
      description: 'Alternating [Golden Edge] and [Crimson Rupture] adds 1 [Combo]. Repeating either skill resets [Combo] to 0. The first use after battle starts or [Last Flare: Blossoming Cataclysm] begins a new chain at 0. [Normal Attack] does not affect the chain.',
    },
    abilities: {
      skill1: ability('Golden Edge', '160% direct damage to one enemy. If [Crinso]’s previous skill was [Crimson Rupture], this attack ignores 20% of the target’s Defense. Then updates [Combo] as described in [Rose Duality].', 1.6),
      skill2: ability('Crimson Rupture', '200% direct damage to one enemy, increased by 40% (240% total) if [Crinso]’s previous skill was [Golden Edge]. Then updates [Combo] as described in [Rose Duality].', 2),
      ultimate: ability('Last Flare: Blossoming Cataclysm', '260% direct damage to one enemy plus 45% per [Combo]. At 3 or more [Combo], the attack also ignores 30% of the target’s Defense. Uses up all [Combo] and ends the chain, so the next [Golden Edge] or [Crimson Rupture] starts a new one.', 2.6),
    },
  },
  nerithe: {
    role: 'Survey and precision-pierce attacker',
    playLoop: '[Nerithe]’s [Normal Attack] adds [Survey] points to an enemy; her skills spend them to ignore part of its Defense.',
    passive: {
      name: 'Uncharted Current',
      description: '[Nerithe]’s [Normal Attack] gains 5 extra [Elemental Gauge] and adds 1 [Survey] point to its target. Only one enemy can hold [Survey]; surveying another enemy removes the old points. [Survey] disappears when its enemy is defeated.',
    },
    abilities: {
      skill1: ability('Meridian Break', '180% direct damage to the enemy holding [Survey], or the selected enemy if none does. Spends 1 [Survey] point, if any, to ignore 25% of the target’s Defense.', 1.8),
      skill2: ability('Fold the Sea', 'If an enemy holds [Survey], move it and all its points to the selected living enemy. Then deal 130% direct damage to all enemies.', 1.3, 'all-enemies'),
      ultimate: ability('Ocean Beyond the Map', '280% direct damage to the enemy holding [Survey], or the selected enemy if none does. Uses up all [Survey] points; each ignores 15% of the target’s Defense.', 2.8),
    },
  },
  orvella: {
    role: 'Squad barrier support',
    playLoop: '[Orvella] raises a shared [Foundation] that absorbs damage for the squad until its durability runs out; it can be repaired or spent for damage.',
    passive: {
      name: 'Load-Bearing Will',
      description: 'Only one [Foundation] can exist. While it has durability, it absorbs up to 20% of each direct hit on a living ally (after Defense), before that ally’s shields, and loses durability equal to the amount absorbed. When one attack hits several allies at once, the absorbed amount is shared proportionally.',
    },
    abilities: {
      skill1: ability('Keystone Reversal', '140% direct damage to one enemy, then repair the [Foundation] by 8% of [Orvella]’s maximum Health. With no [Foundation], deal 180% direct damage instead.', 1.4),
      skill2: ability('Raise the Faultline', 'Create a [Foundation] with durability equal to 30% of [Orvella]’s maximum HP for three enemy phases. Recasting replaces it at full durability; it never stacks.', undefined, 'all-allies'),
      ultimate: ability('Worldweight Citadel', '200% direct damage to all enemies. An existing [Foundation] is used up for an extra strike on each enemy that uses its remaining durability as Attack, reduced by Defense.', 2, 'all-enemies'),
    },
  },
  vaelor: {
    role: 'Three-beat attacker',
    playLoop: '[Vaelor]’s skills change with a repeating three-step [Beat]; [Crescendo] strengthens [Last Chord of the Sky].',
    passive: {
      name: 'Standing Thunder',
      description: 'The [Beat] cycles [Tune] → [Rise] → [Crescendo] → [Tune], moving one step every player turn, even when [Vaelor] is recovering or cannot act. Each battle starts on [Tune].',
    },
    abilities: {
      skill1: ability('Forked Cadence', '170% direct damage to one enemy. On [Tune], +30 percentage points Critical Rate for this attack.', 1.7),
      skill2: ability('Resonance Cascade', '120% direct damage to all enemies. On [Rise], [Vaelor] deals 20% more direct damage until the end of his next player turn; recasting refreshes it and it never stacks.', 1.2, 'all-enemies'),
      ultimate: ability('Last Chord of the Sky', '260% direct damage to all enemies, or 340% on [Crescendo].', 2.6, 'all-enemies'),
    },
  },
  caldrex: {
    role: 'Heat-banking tank',
    playLoop: '[Caldrex] banks [Heat] when enemies hit him, shields and taunts random single-target attacks, then spends [Heat] for [Burn] strikes or a gate-wide shield.',
    passive: {
      name: 'Banked Heat',
      description: 'Gain 1 [Heat] (maximum 3) when an enemy direct attack damages [Caldrex]’s Health or Shield, once per enemy phase. Redirected damage and damage over time never grant [Heat]. [Heat] resets with each new encounter.',
    },
    abilities: {
      skill1: ability('Close the Kiln', 'Shield every living squad member for 12% of their maximum HP, scaled by Skill Power. Taunt: during the next enemy phase, enemy attacks that would pick a random single target are directed at [Caldrex]; area-of-effect and scripted attacks are not overridden.', undefined, 'all-allies'),
      skill2: ability('Cinder Discharge', 'Spend all [Heat]: 255% direct damage to all enemies plus 24% per [Heat] spent, and apply [Burn] to each enemy hit.', 2.55, 'all-enemies'),
      ultimate: ability('Nothing Beyond These Gates', 'Spend all [Heat]. Shield every living squad member for 65% of their maximum HP plus 12% Defense per [Heat] spent for 2 turns (both scaled by Skill Power) and taunt for the next enemy phase (random single-target attacks only; area-of-effect and scripted attacks are not overridden). For the next 2 enemy phases, ability-applied [Burn] from allies deals 25% more while [Caldrex] lives; [Burn] detonations and Conduit damage are unchanged.', undefined, 'all-allies'),
    },
  },
  solenne: {
    role: 'Stillness tank',
    playLoop: '[Solenne] holds [Stillness] charges that soften each hit, then spends them for a bell-toll strike and squad shield.',
    passive: {
      name: 'Held Stillness',
      description: 'Hold up to 4 [Stillness]. When [Solenne] takes direct or periodic damage, she consumes 1 [Stillness] to reduce that damage by 20% before shields. [Stillness] resets with each new encounter.',
    },
    abilities: {
      skill1: ability('Answer the Bell', '240% direct damage to one enemy, apply [Weaken], and taunt for the next enemy phase (random single-target attacks only; area-of-effect and scripted attacks are not overridden).', 2.4),
      skill2: ability('Circle of Repose', 'Gain 2 [Stillness] and shield every living squad member for 16% of their maximum HP, scaled by Skill Power.', undefined, 'all-allies'),
      ultimate: ability('The Last Reverberation', 'Spend all [Stillness]: 720% direct damage plus 45% per [Stillness] spent to all enemies, and shield every living squad member for 24% of their maximum HP plus 4.5% per [Stillness] spent, scaled by Skill Power.', 7.2, 'all-enemies'),
    },
  },
  myrthen: {
    role: 'Seasonal reaper',
    playLoop: '[Myrthen] turns through [Sprout], [Bloom] and [Harvest] with Skills; [Harvest] empowers her next Skill or Last Flare.',
    passive: {
      name: 'Turning Season',
      description: 'Each battle starts in [Sprout]. Using a Skill advances [Sprout] to [Bloom] to [Harvest]. In [Harvest], the next Skill or Last Flare deals 35% more direct damage, then returns to [Sprout]. Normal Attacks never advance the season; a Last Flare outside [Harvest] preserves it.',
    },
    abilities: {
      skill1: ability('Reaper’s Claim', '272% direct damage to one enemy, then mark it with [Reaper’s Claim] for 2 enemy phases: it takes 12% more native direct damage from squad attacks and abilities, not Conduit-generated damage or periodic damage. Only one enemy is marked at a time. In [Harvest], ignores 20% of the target’s Defense.', 2.72),
      skill2: ability('Turn the Bough', '192% direct damage to all enemies. In [Harvest], ignores 20% of their Defense.', 1.92, 'all-enemies'),
      ultimate: ability('All That Ripens', '1,248% direct damage to one enemy. In [Harvest], ignores 30% of its Defense.', 12.48),
    },
  },
  neralis: {
    role: 'Oceanic healer and support',
    playLoop: 'Attack to build [Current], rescue one wounded ally, or spend [Current] to heal the squad.',
    passive: { name: 'Returning Current',
      description: 'Gain 1 [Current], up to 3, when Neralis’s Normal Attack damages an enemy or his ability restores missing Health. Gain at most 1 per action, even when healing several allies. Healing after spending [Current] can earn 1 back; healing full Health, the Support role perk and Conduit healing do not count. With [Amber-Station Return Manifold], the cap is 4.' },
    abilities: {
      skill1: ability('Light the Next Station', 'Restore 35% maximum Health to one living squad member, scaled by Skill Power. Grant +30% Defense for 2 turns.', undefined, 'one-ally'),
      skill2: ability('Carry Them Back', 'Spend all [Current]. Restore 18% maximum Health to each living squad member, plus 6% per [Current] spent, scaled by Skill Power. [Amber-Station Return Manifold] increases the per-Current heal to 9%.', undefined, 'all-allies'),
      ultimate: ability('No Crossing Left Empty', 'Spend all [Current]. Deal 720% direct Attack to all enemies and restore 30% maximum Health to each living squad member, plus 5% per [Current] spent, scaled by Skill Power.', 7.2, 'all-enemies'),
    },
  },
  varkhel: {
    role: 'Infernic tension tank',
    playLoop: 'Shield and Taunt to build [Tension] from incoming hits, then spend it on a piercing strike or a squad-shielding Last Flare.',
    passive: { name: 'Tension Held',
      description: 'Gain 1 [Tension], up to 4, when an enemy direct attack effectively damages Varkhel’s Health or Shield, once per enemy phase. His damaging Normal Attack also grants 1 [Tension]. [Faultstar Chain Accumulator] raises the cap to 5.' },
    abilities: {
      skill1: ability('Set the Warning Chain', 'Grant Varkhel a Shield equal to 25% maximum Health, scaled by Skill Power. Gain +40% Defense for 2 turns and Taunt for the next enemy phase. [Scarlet-Hinge Load Distributor] also shields each other living ally for 16% maximum Health, scaled by Skill Power.', undefined, 'all-allies'),
      skill2: ability('Return the Strain', 'Spend all [Tension]. Deal 285% of Direct Attack to one enemy, plus 45% per [Tension] spent. Ignore 20% of its Defense; [Recoil-Star Compression Turbine] raises this to 35% and refunds 15% maximum Gauge when at least 3 [Tension] were spent.', 2.85),
      ultimate: ability('The Bridge Holds Behind Me', 'Spend all [Tension]. Deal 690% of Direct Attack to all enemies, plus 55% per [Tension] spent. Shield each living squad member for 30% maximum Health, scaled by Skill Power.', 6.9, 'all-enemies'),
    },
  },
  seravelle: {
    role: 'Infernic convoy support',
    playLoop: 'Squad Normal Attacks build [Cadence]. Spend it to strengthen the squad; Last Flare gives other allies Gauge and Skill Power.',
    passive: { name: 'Convoy Cadence',
      description: 'The first squad Normal Attack that damages an enemy each round grants 1 [Cadence], up to 3, while Seravelle is alive. Seravelle’s own Normal Attack counts. The whole squad can earn only 1 per round; triggered attacks do not count. With [Ashroad Cadence Transmission], the cap is 4.' },
    abilities: {
      skill1: ability('Send the Ember Ahead', 'Deal 245% direct Attack to one enemy. Apply [Burn] for 2 enemy phases, dealing 12% of Seravelle’s Direct Attack per phase, scaled by her Skill Power.', 2.45),
      skill2: ability('Move as One', 'Spend all [Cadence]. Grant each living squad member +30% Direct Attack for 2 turns, plus 10% per [Cadence] spent. This fixed buff is not scaled by Skill Power. [Ashroad Cadence Transmission] raises its base bonus to 40%.', undefined, 'all-allies'),
      ultimate: ability('The Road Belongs to Everyone', 'Deal 620% direct Attack to all enemies. Grant each other living squad member 20% maximum Gauge and +30 percentage points Skill Power for 2 turns; these buffs do not strengthen this attack.', 6.2, 'all-enemies'),
    },
  },
  velmira: {
    role: 'Chaotic alternating-edge attacker',
    playLoop: 'Alternate [Open the Seam] and [Turn the Other Edge] to build [Crosscut]. Keep it for area Defense-piercing or spend it on Last Flare.',
    passive: { name: 'Alternating Edge',
      description: 'After using a different Skill from Velmira’s previous Skill, gain 1 [Crosscut], up to 3. The first Skill grants no stack. Repeating a Skill keeps existing stacks but grants none. Normal Attacks and Last Flare do not change which Skill comes next in the sequence. With [Twin-Edge Sequence Orrery], the cap is 4 and the first Skill grants 1 [Crosscut] after resolving.' },
    abilities: {
      skill1: ability('Open the Seam', 'Deal 280% direct Attack to one enemy. Apply [Weaken] for 2 enemy phases, reducing its direct damage by 25%. [Goldseam Precision Fracturer] deals 35% more direct damage against a Weakened enemy.', 2.8),
      skill2: ability('Turn the Other Edge', 'Deal 205% direct Attack to all enemies. With at least 2 [Crosscut] before this attack, ignore 20% of their Defense; [Goldseam Precision Fracturer] raises this to 35%. Keep your stacks; any new [Crosscut] is gained after the attack.', 2.05, 'all-enemies'),
      ultimate: ability('Leave the Doorway Standing', 'Spend all [Crosscut]. Deal 1,050% direct Attack to one enemy, plus 90% per [Crosscut] spent. Ignore 30% of its Defense. [Open-Threshold Return Drive] refunds 25% maximum Gauge and heals Velmira for 18% maximum Health when at least 3 [Crosscut] were spent; Recovery still applies.', 10.5),
    },
  },
};

// Owner-approved final percentages are authored directly, so the shared skill/Last Flare multipliers must not be applied again.
export const exactDirectDamageIds: readonly StarterId[] = ['caldrex', 'solenne', 'myrthen',
  'maerion', 'caevren', 'vespera', 'ilyss', 'asteriel', 'serapha', 'rhaziel', 'oryn', 'thessara', 'elaris', 'veyr', 'aureth',
  'neralis', 'varkhel', 'seravelle', 'velmira'];

const directDescriptionCoefficients: Record<StarterId, readonly (readonly number[])[]> = {
  ozriel: [[240], [], [455]],
  ilvaris: [[225], [], [440]],
  kaelith: [[456], [365], [360]],
  ember: [[160], [110], [200]],
  tide: [[150], [], []],
  sprout: [[140], [], []],
  atmoso: [[180], [], [200]],
  elise: [[110, 140], [140], [260]],
  bliss: [[170], [120], [250]],
  bruno: [[190], [], []],
  disciple: [[], [], []],
  aurora: [[], [100], []],
  razor: [[160], [], [220]],
  rosetta: [[160], [200, 25, 250, 160], [300]],
  thornia: [[], [170], [140]],
  crinso: [[160], [200, 40, 240], [260, 45, 395]],
  nerithe: [[180], [130], [280]],
  orvella: [[140, 180], [], [200]],
  vaelor: [[170], [120], [260, 340]],
  caldrex: [[], [], []],
  solenne: [[], [], []],
  myrthen: [[], [], []],
  maerion: [[200], [], []],
  caevren: [[280], [], []],
  vespera: [[220], [], [480]],
  ilyss: [[220], [], []],
  asteriel: [[], [], []],
  serapha: [[240], [], []],
  rhaziel: [[], [], []],
  oryn: [[240], [], []],
  thessara: [[240], [], []],
  elaris: [[280], [240], [1050]],
  veyr: [[320], [240], [1050]],
  aureth: [[], [240], []],
  neralis: [[], [], [720]],
  varkhel: [[], [285], [690]],
  seravelle: [[245], [], [620]],
  velmira: [[280], [205], [1050]],
};

for (const id of Object.keys(nativeIdentities) as StarterId[]) {
  for (const [index, action] of (['skill1', 'skill2', 'ultimate'] as const).entries()) {
    const definition = nativeIdentities[id].abilities[action];
    const scale = isCalamiticCharacter(id) || exactDirectDamageIds.includes(id) || isNewEventCharacter(id)
      ? 1 : nativeBalance.skillDamageScale * (action === 'ultimate' ? nativeBalance.lastFlare.damage : 1);
    if (definition.strength.damageMultiplier !== undefined) definition.strength.damageMultiplier *= scale;
    const coefficients = directDescriptionCoefficients[id]?.[index] ?? [];
    definition.description = definition.description.replace(/(\d+(?:\.\d+)?)%/g, (text, amount: string) =>
      coefficients.includes(Number(amount)) ? `${Number((Number(amount) * scale).toFixed(2))}%` : text);
    if (action === 'ultimate' && id === 'crinso') definition.description = definition.description.replace('ignores 30%', 'ignores 45%');
    if (action === 'ultimate' && id === 'nerithe') definition.description = definition.description.replace('ignores 15%', 'ignores 22.5%');
    if (action === 'ultimate' && id === 'orvella') definition.description = definition.description.replace('uses its remaining durability as Attack',
      'deals three times the damage of a strike using its remaining durability as Attack');
  }
}

export const nativeIdentityIds = Object.keys(nativeIdentities) as StarterId[];
