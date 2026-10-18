import type { Ability } from './combat';
import type { StarterId } from './starters';
import { nativeBalance } from './native-balance';

export interface NativeIdentityDefinition {
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

export const nativeIdentities: Record<StarterId, NativeIdentityDefinition> = {
  ember: {
    role: 'Persistent fire specialist',
    playLoop: '[Infernis] applies [Burn] that lasts across enemy phases; [Flame Arc] can deal its remaining damage at once.',
    passive: {
      name: 'Unbroken Ember',
      description: '[Burn] applied by [Infernis] lasts three enemy phases and deals its damage once per enemy phase, starting with the next one. Reapplying it resets the duration to three phases and keeps the higher damage per phase; it never stacks.',
    },
    abilities: {
      skill1: ability('Cinder Cleave', '160% direct damage to one enemy, then apply [Burn] dealing 25% of [Infernis]’s Attack per enemy phase for three enemy phases.', 1.6),
      skill2: ability('Flame Arc', '110% direct damage to all enemies. Each surviving enemy carrying [Infernis]’s [Burn] immediately takes the damage of up to two of its remaining [Burn] phases, and those phases are removed. [Burn] applied by other characters is unaffected.', 1.1, 'all-enemies'),
      ultimate: ability('Last Flare: Dawnfire', '200% direct damage to all enemies, then apply [Burn] dealing 45% of [Infernis]’s Attack per enemy phase for three enemy phases; an existing stronger [Burn] keeps its higher damage. [Burn] continues during the recovery turn while [Infernis] is alive.', 2, 'all-enemies'),
    },
  },
  tide: {
    role: 'Precise barrier protector',
    playLoop: '[Tizu] places a short-lived shield on one chosen ally before the next enemy attack.',
    passive: {
      name: 'Stillwater Guard',
      description: 'When a shield from [Tizu]’s abilities fully absorbs an enemy’s direct hit so that no HP is lost, the shielded ally gains 8 Gauge.',
    },
    abilities: {
      skill1: { ...ability('Undertow Thrust', '150% direct damage to one enemy and apply 25% [Weaken] for the next enemy phase. [Weaken] reduces the direct damage that enemy deals.', 1.5), strength: { damageMultiplier: 1.5, weakenFraction: .25 } },
      skill2: ability('Tidal Shelter', `Choose one living ally. It gains a shield worth ${nativeBalance.tizu.shelter * 100}% of its maximum HP until the next enemy phase ends. Recasting replaces the shield.`, undefined, 'one-ally'),
      ultimate: ability('Last Flare: Ocean Memory', `All living allies gain a shield worth ${nativeBalance.tizu.oceanMemory * 100}% of their maximum HP until the second enemy phase ends. The first direct hit each ally takes while this shield remains is reduced by 30% before the shield absorbs it.`, undefined, 'all-allies'),
    },
  },
  sprout: {
    role: 'Delayed recovery gardener',
    playLoop: '[Flora] plants [Seed] healing that restores HP at the start of the next player turn, or harvests it immediately with [Verdant Renewal].',
    passive: {
      name: 'Root of Hope',
      description: `Each living ally can hold one [Seed]. At the start of the next player turn, a [Seed] restores ${nativeBalance.flora.seed * 100}% of its holder’s maximum HP and disappears, as long as [Flora] is alive. A [Seed] never stacks or revives. Planting a new [Seed] replaces the old one and resets its timing.`,
    },
    abilities: {
      skill1: ability('Briar Shot', '140% direct damage to one enemy, then plant a [Seed] on the living ally with the lowest HP percentage; ties go to the earlier squad position.', 1.4),
      skill2: ability('Verdant Renewal', `Every existing [Seed] immediately heals its holder (${nativeBalance.flora.seed * 100}% of maximum HP, or ${nativeBalance.flora.empoweredSeed * 100}% for an [Empowered Seed]) and is removed. Then every living ally receives a new [Seed]. With no existing [Seed], the harvest heals nothing. A new [Seed] never replaces a pending [Empowered Seed].`, undefined, 'all-allies'),
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
      skill2: ability('Cyclone Weave', 'Release any existing [Cyclone], then create a new [Cyclone] with 0 [Gust] lasting two enemy phases. When the second enemy phase ends, it releases on all living enemies. A [Cyclone] release deals 70% of [Atmoso]’s Attack plus 30% per [Gust] and cannot critically hit. [Gust] never carries over to a new [Cyclone]. [Atmoso] must be alive for a release.', undefined, 'all-enemies'),
      ultimate: ability('Last Flare: Sky Without End', 'Release any active [Cyclone] at its current [Gust] count, then deal 200% direct damage to all enemies.', 2, 'all-enemies'),
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
      skill2: ability('Crosscurrent Volley', 'Recall every lodged [Shuriken]: each strikes its enemy for 90% of [Elise]’s Attack and cannot critically hit. If both were in the same enemy, it takes one extra 60% strike. If both [Shuriken] are already held, deal 140% direct damage to the selected enemy instead. Recalled strikes generate no Gauge.', 1.4),
      ultimate: ability('Last Flare: Infinite Thunderwheel', 'Recall every lodged [Shuriken] using the same 90% strikes and 60% same-enemy strike, then deal 260% direct damage to the selected enemy. Both [Shuriken] return to [Elise] afterward.', 2.6),
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
      skill2: ability('Quietstorm Flourish', '120% direct damage to all enemies. [Opening]: living allies deal 10% more direct damage until this player turn ends. [Closing]: all living allies gain a shield worth 6% of their maximum HP until the next enemy phase ends. [Passing]: no bonus.', 1.2, 'all-enemies'),
      ultimate: ability('Last Flare: Thousandfeather Stillness', '250% direct damage to all enemies. [Opening]: +30 percentage points Critical Rate for this attack. [Closing]: heal other living allies for 10% of their maximum HP. [Passing]: no bonus.', 2.5, 'all-enemies'),
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
      ultimate: ability('Last Flare: Worldwall Ascendant', 'Place [Cover] on every other living ally for two enemy phases, redirecting 40% of each direct hit to [Bruno]; this replaces single-ally [Cover]. [Bruno] gains a shield worth 20% of his maximum HP for the same duration.', undefined, 'all-allies'),
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
      skill1: ability('Thoughtspark Benediction', 'Give one living ally [Strike]: its next action that deals damage deals 30% more direct damage. If its next action deals no damage, [Strike] is used up with no effect.', undefined, 'one-ally'),
      skill2: ability('Concord of Chaos', 'Give one living ally [Shelter]: if its next action heals or shields, that healing or shielding is 35% larger. If its next action only deals damage, [Shelter] is used up with no effect. Healing and shields created by Conduits are not increased.', undefined, 'one-ally'),
      ultimate: ability('Last Flare: Unbound Mindcrown', 'Give [Resolve] to all living allies, replacing their current [Instruction]. Each ally’s next action gains [Strike] (30% more direct damage), [Shelter] (35% more healing and shields) or both, matching what that action does. [Resolve] expires at the end of the next player turn.', undefined, 'all-allies'),
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
      skill1: ability('Gleamseal', 'Place a [Seal] on one enemy: its next scheduled special skill or ultimate within three enemy phases deals 40% less direct damage, then the [Seal] ends. Its [Normal Attack] does not use the [Seal]. Recasting resets the duration and keeps the stronger [Seal]; it never stacks.'),
      skill2: ability('Eclipse Mandate', '100% direct damage to all enemies, then place a 25% [Seal] on each survivor, following the same rules as [Gleamseal].', 1, 'all-enemies'),
      ultimate: ability('Last Flare: Final Dawn Verdict', 'For two enemy phases, all living allies take 50% less direct damage from enemy ultimates. Enemy [Normal Attack] and other skills are unaffected.', undefined, 'all-allies'),
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
      skill1: ability('Nightcleave', '160% direct damage to one enemy, then spend all [Wounds] for an extra strike that uses the spent amount as its Attack, is reduced by Defense and cannot critically hit. With no [Wounds], only the first hit occurs.', 1.6),
      skill2: ability('Eclipse Bastion', '[Razor] takes 30% less direct damage during the next enemy phase. If he lost HP to direct hits during that phase, he then gains a shield equal to that HP through the following enemy phase.'),
      ultimate: ability('Last Flare: Unbroken Midnight', '220% direct damage to one enemy, then spend all [Wounds] for an extra strike that uses twice the spent amount as its Attack, is reduced by Defense and cannot critically hit.', 2.2),
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
      skill2: ability('Crimson Skyfall', '200% direct damage to a living [Quarry], plus 25% for each other ally who hit it this player turn. With no living [Quarry], deal 160% direct damage to the selected enemy. Does not mark a [Quarry].', 2),
      ultimate: ability('Last Flare: Rose Beyond the Sun', '300% direct damage to the [Quarry], or to the selected enemy if there is none. If at least two different allies hit the [Quarry] this player turn, those allies heal 10% of their maximum HP; other allies are not healed.', 3),
    },
  },
  thornia: {
    role: 'Enemy-action thorn trapper',
    playLoop: '[Thornia] places a [Thorn Trap] that strikes an enemy whenever it attacks; [Shadow Rose Cleave] can spend a charge for immediate damage.',
    passive: {
      name: 'Forbidden Garden',
      description: 'Each enemy can hold one [Thorn Trap] from [Thornia], with up to three charges. When that enemy finishes an action that deals direct damage to any ally, one charge is spent for a strike of 60% of [Thornia]’s Attack that cannot critically hit. This happens once per enemy action, however many allies it hits. Damage absorbed by shields still counts; actions that deal no damage do not.',
    },
    abilities: {
      skill1: ability('Gilded Thorn Guard', 'Place a [Thorn Trap] with three charges on the selected enemy for three enemy phases. Recasting resets it to three charges and three enemy phases and never adds more. Recasting on an [Empowered Thorn Trap] keeps it empowered.'),
      skill2: ability('Shadow Rose Cleave', '170% direct damage to one enemy. If it has a [Thorn Trap], spend one charge for an extra strike of 80% of [Thornia]’s Attack that cannot critically hit.', 1.7),
      ultimate: ability('Last Flare: Thousand-Rose Dominion', '140% direct damage to all enemies, then place an [Empowered Thorn Trap] with three charges on each survivor for three enemy phases. Its strikes deal 90% of [Thornia]’s Attack and cannot critically hit.', 1.4, 'all-enemies'),
    },
  },
  crinso: {
    role: 'Alternating-edge combo duelist',
    playLoop: 'Alternating [Golden Edge] and [Crimson Rupture] builds [Combo]; [Last Flare: Blossoming Cataclysm] spends it.',
    passive: {
      name: 'Rose Duality',
      description: 'Using [Golden Edge] after [Crimson Rupture], or [Crimson Rupture] after [Golden Edge], adds 1 [Combo]. Using the same one of these two skills twice in a row resets [Combo] to 0. When there is no previous skill to compare (the first use, or after [Last Flare: Blossoming Cataclysm]), the skill starts a new chain at 0 [Combo]. [Normal Attack] does not affect the chain.',
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
      description: '[Nerithe]’s [Normal Attack] gains 5 extra Gauge and adds 1 [Survey] point to its target. Only one enemy can hold [Survey]; surveying another enemy removes the old points. [Survey] disappears when its enemy is defeated.',
    },
    abilities: {
      skill1: ability('Meridian Break', '180% direct damage to the enemy holding [Survey], or the selected enemy if none does. Spends 1 [Survey] point, if any, to ignore 25% of the target’s Defense.', 1.8),
      skill2: ability('Fold the Sea', 'If an enemy holds [Survey], move it and all its points to the selected living enemy. Then deal 130% direct damage to all enemies.', 1.3, 'all-enemies'),
      ultimate: ability('Ocean Beyond the Map', '280% direct damage to the enemy holding [Survey], or the selected enemy if none does. Uses up all [Survey] points; each ignores 15% of the target’s Defense.', 2.8),
    },
  },
  orvella: {
    role: 'Finite-durability team architect',
    playLoop: '[Orvella] raises a shared [Foundation] that absorbs damage for the squad until its durability runs out; it can be repaired or spent for damage.',
    passive: {
      name: 'Load-Bearing Will',
      description: 'Only one [Foundation] can exist. While it has durability, it absorbs up to 20% of each direct hit on a living ally (after Defense), before that ally’s shields, and loses durability equal to the amount absorbed. When one attack hits several allies at once, the absorbed amount is shared proportionally.',
    },
    abilities: {
      skill1: ability('Keystone Reversal', '140% direct damage to one enemy, then repair the [Foundation] by 8% of [Orvella]’s maximum HP. With no [Foundation], deal 180% direct damage instead. Never creates a [Foundation].', 1.4),
      skill2: ability('Raise the Faultline', 'Create a [Foundation] with durability equal to 30% of [Orvella]’s maximum HP for three enemy phases. Recasting replaces it at full durability; it never stacks.', undefined, 'all-allies'),
      ultimate: ability('Worldweight Citadel', '200% direct damage to all enemies. An existing [Foundation] is used up for an extra strike on each enemy that uses its remaining durability as Attack, is reduced by Defense and cannot critically hit.', 2, 'all-enemies'),
    },
  },
  vaelor: {
    role: 'Deterministic three-beat burst attacker',
    playLoop: '[Vaelor]’s skills change with a repeating three-step [Beat]; [Crescendo] strengthens [Last Chord of the Sky].',
    passive: {
      name: 'Standing Thunder',
      description: 'The [Beat] cycles [Tune] → [Rise] → [Crescendo] → [Tune], moving one step every player turn, even when [Vaelor] is recovering or cannot act. Each battle starts on [Tune].',
    },
    abilities: {
      skill1: ability('Forked Cadence', '170% direct damage to one enemy. On [Tune], +30 percentage points Critical Rate for this attack.', 1.7),
      skill2: ability('Resonance Cascade', '120% direct damage to all enemies. On [Rise], [Vaelor] deals 20% more direct damage until the end of his next player turn; recasting refreshes it and it never stacks.', 1.2, 'all-enemies'),
      ultimate: ability('Last Chord of the Sky', '260% direct damage to all enemies, or 340% on [Crescendo]. Usable on any [Beat]. After a cast on [Crescendo], the recovery turn falls on the following [Tune].', 2.6, 'all-enemies'),
    },
  },
};

const directDescriptionCoefficients: Record<StarterId, readonly (readonly number[])[]> = {
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
};

for (const id of Object.keys(nativeIdentities) as StarterId[]) {
  for (const [index, action] of (['skill1', 'skill2', 'ultimate'] as const).entries()) {
    const definition = nativeIdentities[id].abilities[action];
    if (definition.strength.damageMultiplier !== undefined) definition.strength.damageMultiplier *= nativeBalance.skillDamageScale;
    const coefficients = directDescriptionCoefficients[id][index];
    definition.description = definition.description.replace(/(\d+(?:\.\d+)?)%/g, (text, amount: string) =>
      coefficients.includes(Number(amount)) ? `${Number(amount) * nativeBalance.skillDamageScale}%` : text);
  }
}

export const nativeIdentityIds = Object.keys(nativeIdentities) as StarterId[];
