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
    playLoop: 'Personal Burn persists across enemy phases; its remaining ticks can instead detonate at once.',
    passive: {
      name: 'Unbroken Ember',
      description: 'Infernis Burn lasts three enemy phases. Reapplying refreshes to three phases and retains the stronger tick; it never stacks or ticks immediately.',
    },
    abilities: {
      skill1: ability('Cinder Cleave', '160% direct damage to one enemy; apply personal Burn at 25% of caster Attack per enemy phase for three enemy phases.', 1.6),
      skill2: ability('Flame Arc', '110% direct damage to all enemies. On each survivor, consume up to two remaining phases of Infernis Burn and immediately deal their exact stored tick damage. Other owners’ Burn is untouched.', 1.1, 'all-enemies'),
      ultimate: ability('Last Flare: Dawnfire', '200% direct damage to all enemies; refresh personal Burn at 45% of caster Attack per phase for three enemy phases, retaining stronger ticks. Burn continues during recovery while Infernis lives.', 2, 'all-enemies'),
    },
  },
  tide: {
    role: 'Precise barrier protector',
    playLoop: 'Places a short-lived barrier on one chosen ally ahead of the next enemy attack.',
    passive: {
      name: 'Stillwater Guard',
      description: 'When Tizu’s own ability shield fully absorbs an enemy direct hit with zero HP loss, its recipient gains 8 Gauge, once per recipient per enemy phase.',
    },
    abilities: {
      skill1: { ...ability('Undertow Thrust', '150% direct damage to one enemy; apply 25% Weaken to its next one enemy-phase attack window. Weaken reduces outgoing direct damage.', 1.5), strength: { damageMultiplier: 1.5, weakenFraction: .25 } },
      skill2: ability('Tidal Shelter', `Select one living ally; refresh a shield worth ${nativeBalance.tizu.shelter * 100}% of recipient maximum HP, expiring after the next enemy phase.`, undefined, 'one-ally'),
      ultimate: ability('Last Flare: Ocean Memory', `Shield all living allies for ${nativeBalance.tizu.oceanMemory * 100}% of recipient maximum HP through the next two enemy phases. Their first direct hit while this shield remains receives 30% damage reduction before shield absorption.`, undefined, 'all-allies'),
    },
  },
  sprout: {
    role: 'Delayed recovery gardener',
    playLoop: 'Plants delayed recovery that is delivered later or harvested immediately.',
    passive: {
      name: 'Root of Hope',
      description: `Each living ally can hold one Flora Seed. At next player-turn start it restores ${nativeBalance.flora.seed * 100}% of recipient maximum HP and disappears, requiring Flora alive. Seeds never stack or revive; replacement resets delivery time.`,
    },
    abilities: {
      skill1: ability('Briar Shot', '140% direct damage to one enemy; plant a Seed on the living ally with the lowest HP fraction, breaking ties by squad order.', 1.4),
      skill2: ability('Verdant Renewal', `Immediately harvest all existing Seeds for their stored healing (${nativeBalance.flora.seed * 100}% recipient maximum HP normally; ${nativeBalance.flora.empoweredSeed * 100}% for empowered Seeds), then plant a new Seed on every living ally. Empty harvest heals nothing. A normal Seed never overwrites an empowered pending Seed.`, undefined, 'all-allies'),
      ultimate: ability('Last Flare: Worldseed', `Immediately heal every living ally by ${nativeBalance.flora.immediateHeal * 100}% of recipient maximum HP, then plant an empowered Seed restoring ${nativeBalance.flora.empoweredSeed * 100}% at next player-turn start while Flora lives.`, undefined, 'all-allies'),
    },
  },
  atmoso: {
    role: 'Delayed wind-field attacker',
    playLoop: 'Cyclone placed before allies act releases later for a larger effect, or immediately for a smaller one.',
    passive: {
      name: 'Gale Cadence',
      description: 'While Cyclone is active, each other living ally’s completed native action adds one Gust, once per ally per player turn, cap 4.',
    },
    abilities: {
      skill1: ability('Razor Gale', '180% direct damage to one enemy; release an existing Cyclone early against all living enemies and end the field.', 1.8),
      skill2: ability('Cyclone Weave', 'Release an existing Cyclone first, then create a fresh empty Cyclone lasting two enemy phases. At the second phase end, release 70% caster Attack plus 30% per Gust, cap 190%, against all living enemies as fixed noncritical native damage. Gusts never carry over; Atmoso must live to release.', undefined, 'all-enemies'),
      ultimate: ability('Last Flare: Sky Without End', 'Release any active Cyclone at its actual Gust value, then deal 200% direct damage to all enemies.', 2, 'all-enemies'),
    },
  },
  elise: {
    role: 'Two-shuriken placement duelist',
    playLoop: 'Lodges two shuriken across enemies or both in one target, then recalls them.',
    passive: {
      name: 'Stormwheel Rhythm',
      description: 'Exactly two native shuriken begin held. Each is held or lodged in one living enemy; blades return harmlessly when their target dies.',
    },
    abilities: {
      skill1: ability('Voltstar Cut', 'Throw one held blade for 110% direct damage to the selected enemy and lodge it. With none held, deal a 140% direct strike without moving blades. Both may lodge in one target.', 1.1),
      skill2: ability('Crosscurrent Volley', 'Recall all lodged blades: each deals a 90% caster Attack fixed noncritical strike to its target; two on the same target add one 60% convergence strike. With both held, instead deal one 140% direct strike to the selected enemy. Recalled strikes generate no Gauge.', 1.4),
      ultimate: ability('Last Flare: Infinite Thunderwheel', 'Recall lodged blades with the same 90% per blade and single 60% convergence rule, then deal one 260% direct strike to the selected enemy. Both blades end held regardless of survival.', 2.6),
    },
  },
  bliss: {
    role: 'Action-order dancer',
    playLoop: 'Acting first adds offense; acting last adds modest recovery and shielding. A solo Disciple always acts first.',
    passive: {
      name: 'Stillfeather Tempo',
      description: 'Each native action is Opening if no other living ally has acted this player turn, Closing if all have, or Passing otherwise. Solo is always Opening, never both.',
    },
    abilities: {
      skill1: ability('Warfeather Cut', '170% direct damage to one enemy. Opening adds 25 percentage points Critical Rate to this attack; Closing heals the most injured other living ally for 6% of recipient maximum HP. Passing adds neither.', 1.7),
      skill2: ability('Quietstorm Flourish', '120% direct damage to all enemies. Opening grants living allies 10% outgoing direct damage until this player turn ends; Closing refreshes a 6% recipient maximum HP team shield through the next enemy phase. Passing adds neither.', 1.2, 'all-enemies'),
      ultimate: ability('Last Flare: Thousandfeather Stillness', '250% direct damage to all enemies. Opening adds 30 percentage points Critical Rate to this attack; Closing heals other living allies for 10% of recipient maximum HP. Passing has no bonus.', 2.5, 'all-enemies'),
    },
  },
  bruno: {
    role: 'Deliberate damage interceptor',
    playLoop: 'Covers an ally; Bruno takes the damage redirected from them.',
    passive: {
      name: 'Faultbound Resolve',
      description: 'Reduce damage redirected to Bruno by 25%, only for his interception.',
    },
    abilities: {
      skill1: ability('Seismic Hammerfall', '190% direct damage to one enemy.', 1.9),
      skill2: ability('Citadel Mantle', 'Choose another living ally to Cover through the next enemy phase: redirect 50% of its post-mitigation direct incoming damage to Bruno. Only one covered ally; recasting replaces it. Solo fallback gives Bruno 20% direct-damage reduction for that phase. Redirected damage cannot redirect again.', undefined, 'one-ally', true),
      ultimate: ability('Last Flare: Worldwall Ascendant', 'Cover every other living ally for two enemy phases, redirecting 40% per hit; replace single-target Cover. Bruno receives a personal shield worth 20% of caster maximum HP for that duration.', undefined, 'all-allies'),
    },
  },
  disciple: {
    role: 'Conditional ally instructor',
    playLoop: 'Sets Strike, Shelter or Resolve for a chosen ally; the bonus applies when that ally’s next action matches.',
    passive: {
      name: 'Shared Mindflame',
      description: 'Maintain one Instruction on one chosen living ally, including self. It expires after that ally’s next native action or at the end of the next player turn. Replacement discards the old one. New Instructions activate after the granting action finishes, never amplifying or consuming themselves.',
    },
    abilities: {
      skill1: ability('Thoughtspark Benediction', 'Give one living ally Strike: its next native damaging action gains 30% outgoing direct damage. A support action consumes it without benefit.', undefined, 'one-ally'),
      skill2: ability('Concord of Chaos', 'Give one living ally Shelter: its next native heal or shield action gains 35% native healing/shield amount. A purely damaging action consumes it without benefit. Does not amplify Conduit-generated outcomes.', undefined, 'one-ally'),
      ultimate: ability('Last Flare: Unbound Mindcrown', 'Give Resolve to all living allies: their next native action receives Strike and/or Shelter according to its actual effects (30% outgoing direct damage and 35% native healing/shields). Replace current Instructions, expiring by the end of the next player turn. Hybrid actions use both parts once.', undefined, 'all-allies'),
    },
  },
  aurora: {
    role: 'Hostile skill forecaster',
    playLoop: 'Shows scheduled enemy specials, which a Seal or ultimate-specific protection can answer.',
    passive: {
      name: 'Lens of Diminishment',
      description: 'Battle reference always shows each living enemy’s next scheduled special/ultimate and due enemy-phase number, or explicitly states none is scheduled.',
    },
    abilities: {
      skill1: ability('Gleamseal', 'Seal one enemy: its next scheduled special/ultimate within three enemy phases deals 40% less direct damage. Only that activation consumes the Seal; Normal Attacks are unaffected. Refresh duration while retaining the stronger personal Seal; never stack.'),
      skill2: ability('Eclipse Mandate', '100% direct damage to all enemies; Seal each survivor for 25% less direct damage from its next scheduled special/ultimate within three enemy phases. Refresh duration and retain the stronger personal reduction; never stack.', 1, 'all-enemies'),
      ultimate: ability('Last Flare: Final Dawn Verdict', 'For two enemy phases, all living allies take 50% less direct damage from hostile ultimates specifically. Normal Attacks and ordinary skills are unaffected.', undefined, 'all-allies'),
    },
  },
  razor: {
    role: 'Wounds-powered revenge duelist',
    playLoop: 'Banks HP lost to enemy attacks, spent on a small cashout or a larger finisher.',
    passive: {
      name: 'Unbroken Night',
      description: 'Bank actual direct enemy HP loss suffered by Razor as Wounds, cap 30% of caster maximum HP. Shields, redirected damage, Burn, self-costs and generated effects add nothing. Healing does not erase Wounds.',
    },
    abilities: {
      skill1: ability('Nightcleave', '160% direct damage to one enemy; spend up to 10% caster maximum HP of Wounds for a fixed noncritical Defense-mitigated strike whose Attack power equals the amount spent. No Wounds still permits the ordinary attack.', 1.6),
      skill2: ability('Eclipse Bastion', 'Reduce Razor’s direct incoming damage by 30% for the next enemy phase. At phase end, if he lost direct HP, refresh a personal shield equal to that loss, capped at 12% caster maximum HP, through the following enemy phase.'),
      ultimate: ability('Last Flare: Unbroken Midnight', '220% direct damage to one enemy; spend all Wounds before a fixed noncritical Defense-mitigated strike using twice the amount spent as Attack power, cap 60% caster maximum HP.', 2.2),
    },
  },
  rosetta: {
    role: 'Coordinated quarry hunter',
    playLoop: 'Marks a Quarry; hits from different allies add to it, and it cashes out after they act.',
    passive: {
      name: 'Virtuous Bloom',
      description: 'Maintain one personal Quarry. Track distinct living allies landing native direct hits on it this player turn. Once two different allies hit, refresh an 8% recipient maximum HP shield on those contributors, once per player turn total.',
    },
    abilities: {
      skill1: ability('Golden Thorn Volley', '160% direct damage to one enemy and designate it Quarry until it dies or Rosetta marks another. This hit counts as her contribution. Re-marking preserves current-turn history; changing targets clears it.', 1.6),
      skill2: ability('Crimson Skyfall', '200% direct damage to a living Quarry, plus 25% coefficient per distinct other ally who hit it this turn, cap 250%. Without a living Quarry, deal 160% to the selected enemy. Does not mark.', 2),
      ultimate: ability('Last Flare: Rose Beyond the Sun', '300% direct damage to the Quarry or selected fallback. With at least two distinct Quarry contributors this turn, heal living contributors for 10% of recipient maximum HP; never heal nonparticipants.', 3),
    },
  },
  thornia: {
    role: 'Enemy-action thorn trapper',
    playLoop: 'Traps an enemy to retaliate when it attacks; a charge can instead deal damage immediately.',
    passive: {
      name: 'Forbidden Garden',
      description: 'One personal trap per enemy, up to three charges. When it completes a direct damaging action against any ally, spend one charge for a 60% caster Attack fixed noncritical strike. Once per activation, not hit or target; shielded damage counts, fully prevented/no-damage actions do not.',
    },
    abilities: {
      skill1: ability('Gilded Thorn Guard', 'Place three personal trap charges on the selected enemy for three enemy phases. Refresh to three, never add. Stronger traps cannot be downgraded.'),
      skill2: ability('Shadow Rose Cleave', '170% direct damage to one enemy. If it has a personal trap, consume one charge for an additional 80% caster Attack fixed noncritical strike, sacrificing a future retaliation.', 1.7),
      ultimate: ability('Last Flare: Thousand-Rose Dominion', '140% direct damage to all enemies; place an empowered three-charge personal trap on each survivor for three enemy phases, with 90% caster Attack fixed noncritical retaliation.', 1.4, 'all-enemies'),
    },
  },
  crinso: {
    role: 'Alternating-edge combo duelist',
    playLoop: 'Alternating Gold and Crimson ordinary skills builds Combo, which is spent separately.',
    passive: {
      name: 'Rose Duality',
      description: 'Ordinary skills use Gold or Crimson edge. Switching advances Combo by 1, cap 3; repeating resets to 0. The first edge establishes stance at Combo 0. Normal Attack and Defense neither build nor break it.',
    },
    abilities: {
      skill1: ability('Golden Edge', '160% direct damage to one enemy; if the previous ordinary skill was Crimson, ignore 20% of effective Defense for this attack. Resolve the attack, then update edge/Combo to Gold.', 1.6),
      skill2: ability('Crimson Rupture', '200% direct damage to one enemy; if the previous ordinary skill was Gold, add 40% coefficient (240% total). Resolve, then update edge/Combo to Crimson.', 2),
      ultimate: ability('Last Flare: Blossoming Cataclysm', '260% direct damage to one enemy plus 45% coefficient per stored Combo, cap 395%. At Combo 3 ignore 30% effective Defense. Consume Combo and clear previous edge before damage.', 2.6),
    },
  },
  nerithe: {
    role: 'Survey and precision-pierce attacker',
    playLoop: 'Normal Attacks earn Survey points. One point is spent or moves the map; three power a finisher.',
    passive: {
      name: 'Uncharted Current',
      description: 'Normal Attack gains exactly 5 additional Gauge and adds one personal Survey point to its target, cap 3. Only one surveyed target; surveying another removes old points. Survey disappears when its target dies.',
    },
    abilities: {
      skill1: ability('Meridian Break', '180% direct damage to the surveyed target or selected fallback. Spend up to one Survey point to ignore 25% effective Defense.', 1.8),
      skill2: ability('Fold the Sea', 'Move the current Survey designation and points to the selected living enemy, then deal 130% direct damage to all enemies.', 1.3, 'all-enemies'),
      ultimate: ability('Ocean Beyond the Map', '280% direct damage to the surveyed target or selected fallback; consume all Survey points for 15% effective Defense ignore each, cap 45%.', 2.8),
    },
  },
  orvella: {
    role: 'Finite-durability team architect',
    playLoop: 'Builds a shared Foundation with finite durability that can be repaired or spent for damage.',
    passive: {
      name: 'Load-Bearing Will',
      description: 'One Foundation may exist with finite durability. Before personal shields, it absorbs up to 20% of each direct hit’s post-mitigation damage on living allies, limited by remaining durability. Simultaneous area shares are allocated proportionally.',
    },
    abilities: {
      skill1: ability('Keystone Reversal', '140% direct damage to one enemy; repair an existing Foundation by 8% caster maximum HP up to its original maximum. Without a Foundation deal 180% instead. Never creates one.', 1.4),
      skill2: ability('Raise the Faultline', 'Create a Foundation with 30% caster maximum HP durability for three enemy phases. Recasting replaces it at full durability; never stacks.', undefined, 'all-allies'),
      ultimate: ability('Worldweight Citadel', '200% direct damage to all enemies. Consume an existing Foundation for an extra fixed noncritical Defense-mitigated strike against each enemy using remaining durability as Attack power, cap 30% caster maximum HP.', 2, 'all-enemies'),
    },
  },
  vaelor: {
    role: 'Deterministic three-beat burst attacker',
    playLoop: 'Rise prepares a Crescendo finisher from a global beat and available Gauge.',
    passive: {
      name: 'Standing Thunder',
      description: 'Beat follows each global player turn: Tune → Rise → Crescendo → Tune, starting Tune at encounter entry. Advance once even during recovery or inability to act.',
    },
    abilities: {
      skill1: ability('Forked Cadence', '170% direct damage to one enemy; on Tune add 30 percentage points Critical Rate to this attack.', 1.7),
      skill2: ability('Resonance Cascade', '120% direct damage to all enemies; on Rise refresh 20% outgoing direct damage on Vaelor through the end of his next player turn. Refreshes, never stacks.', 1.2, 'all-enemies'),
      ultimate: ability('Last Chord of the Sky', '260% direct damage to all enemies, or 340% on Crescendo. Usable on every beat; normal recovery spends the following Tune turn after a Crescendo cast.', 2.6, 'all-enemies'),
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
