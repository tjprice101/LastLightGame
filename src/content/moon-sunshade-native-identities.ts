import type { Ability } from './combat';
import type { NativeIdentityDefinition } from './native-identities';

function ability(name: string, description: string, damageMultiplier?: number,
  targets?: Ability['targets'], excludeSelf?: boolean): Ability {
  return {
    name,
    description: description.replace(/ Recover next turn\.$/, ''),
    cooldown: 0,
    strength: damageMultiplier === undefined ? {} : { damageMultiplier },
    ...(targets ? { targets } : {}),
    ...(excludeSelf ? { excludeSelf } : {}),
  };
}

export const moonSunshadeNativeIdentities = {
  maerion: {
    role: 'Measured recovery support',
    playLoop: '[Unreturned] records direct Health loss and converts it into restorative choices.',
    passive: { name: 'Names Still Carried', description: 'While Maerion lives, record direct Health damage taken by allies as [Unreturned], up to 45% of Maerion’s maximum Health. Redirected damage and damage-over-time do not count.' },
    abilities: {
      skill1: ability('Crescent Triage', 'Deal 200% Direct Attack to one enemy. Heal the living ally with the lowest Health percentage for 25% of their maximum Health.', 2),
      skill2: ability('A Place on the Ferry', 'Heal one chosen living ally for 45% of their maximum Health, plus all stored [Unreturned]. Spends [Unreturned].', undefined, 'one-ally'),
      ultimate: ability('Last Flare: Bring Every Name Home', 'Heal all living squad members for 70% of their maximum Health. Divide stored [Unreturned] equally among them as additional healing, then spend it. Recover next turn.', undefined, 'all-allies'),
    },
  },
  caevren: {
    role: 'Counterweight interception tank',
    playLoop: '[Load] is earned from direct enemy attacks, then spent to strengthen Caevren’s self-shield.',
    passive: { name: 'Weight of the Watch', description: 'When an enemy direct attack damages Caevren’s Health or Shield, gain 1 [Load], up to 3, once per enemy phase. Redirected damage qualifies.' },
    abilities: {
      skill1: ability('Hold the Meridian', 'Deal 280% Direct Attack to one enemy and taunt eligible attacks for the next enemy phase.', 2.8),
      skill2: ability('Counterweight Covenant', 'Shield one chosen other living ally for 30% of their maximum Health. For two enemy phases, redirect 30% of that ally’s incoming enemy direct damage to Caevren while he lives.', undefined, 'one-ally'),
      ultimate: ability('Last Flare: The Night Shall Not Fall', 'Spend all [Load]. Shield Caevren for 60% of his maximum Health, plus 12% per [Load] spent. For two enemy phases, redirect 30% of incoming enemy direct damage from every other living ally to Caevren. Recover next turn.'),
    },
  },
  vespera: {
    role: 'Signal and team-offense support',
    playLoop: '[Signal] sets up a teammate; once spent, Vespera earns [Beacon] for a coordinated Last Flare.',
    passive: { name: 'Someone Still Beyond the Walls', description: 'When another living ally spends Vespera’s [Signal], gain 1 [Beacon], up to 3, once per player turn.' },
    abilities: {
      skill1: { ...ability('Whitefire Dispatch', 'Deal 220% Direct Attack to one enemy. Apply [Burn] dealing 25% of Vespera’s Direct Attack per enemy phase for three enemy phases. Burn ignores Defense.', 2.2), strength: { damageMultiplier: 2.2, burnMultiplier: .25 } },
      skill2: ability('Keep the Last Beacon', 'Give one chosen other living ally [Signal]: their next damaging Skill or Last Flare deals 35% more direct damage. Lasts through the next player turn; refreshes rather than stacks.', undefined, 'one-ally', true),
      ultimate: ability('Last Flare: None Left in the Dark', 'Spend all [Beacon]. Deal 480% Direct Attack to all enemies. Give each other living ally [Signal] for 50% more direct damage, plus 10% per [Beacon] spent. Lasts through the next player turn. Recover next turn.', 4.8, 'all-enemies', true),
    },
  },
  ilyss: {
    role: 'Debuff-cleansing healer',
    playLoop: 'Remove a harmful status with [Unbind the Living] or her Last Flare to earn [Severance] for team recovery.',
    passive: { name: 'What Need Not Remain', description: 'When Ilyss removes [Burn] or [Weaken] with a Skill or Last Flare, gain 1 [Severance], up to 3, once per player turn.' },
    abilities: {
      skill1: { ...ability('Cut the Harmful Thread', 'Deal 220% Direct Attack to one enemy. Apply 25% [Weaken] for two enemy phases.', 2.2), strength: { damageMultiplier: 2.2, weakenFraction: .25 } },
      skill2: ability('Unbind the Living', 'Heal one chosen living ally for 45% of their maximum Health. Remove one chosen [Burn] or [Weaken] application from them, if present.', undefined, 'one-ally'),
      ultimate: ability('Last Flare: No Promise of Resurrection', 'Spend all [Severance]. Heal every living squad member for 65% of their maximum Health, plus 10% per [Severance] spent. Remove one [Burn] or [Weaken] application from each healed member, if present. Recover next turn.', undefined, 'all-allies'),
    },
  },
  asteriel: {
    role: 'Path-changing support',
    playLoop: 'Choose [Shelter] or [Flourish]; changing cultivation paths earns [Promise] for a later team payoff.',
    passive: { name: 'Futures Given Freely', description: '[Shelter] and [Flourish] are cultivation paths. Begin without a path. Using Skill1 enters [Shelter]; Skill2 enters [Flourish]. Changing from one path to the other grants 1 [Promise], up to 3.' },
    abilities: {
      skill1: ability('Lend the Quiet Seed', 'Enter [Shelter]. Shield every living squad member for 25% of their maximum Health.', undefined, 'all-allies'),
      skill2: ability('Open the Night Library', 'Enter [Flourish]. Give every living squad member [Moonflower]: their next damaging Skill or Last Flare deals 30% more direct damage. Lasts through the next player turn; refreshes rather than stacks.', undefined, 'all-allies'),
      ultimate: ability('Last Flare: Every Orbit Bears a Future', 'Spend all [Promise]. In [Shelter], shield every living squad member for 45% of their maximum Health, plus 8% per [Promise] spent. In [Flourish], give every living member [Moonflower] for 50% more direct damage, plus 10% per [Promise] spent. Without a path, use [Shelter]. Preserve the current path. Recover next turn.'),
    },
  },
  serapha: {
    role: 'Protective-window healer',
    playLoop: '[Ceasefire] creates a protected interval; enemies attacking through [Weaken] build [Interval] for a stronger Last Flare.',
    passive: { name: 'An Interval Without Surrender', description: 'When an enemy carrying Serapha’s [Weaken] uses a direct attack, gain 1 [Interval], up to 3, once per enemy phase.' },
    abilities: {
      skill1: { ...ability('Terms of Mercy', 'Deal 240% Direct Attack to one enemy. Apply 20% [Weaken] for two enemy phases.', 2.4), strength: { damageMultiplier: 2.4, weakenFraction: .2 } },
      skill2: ability('A Passage Left Open', 'Heal every living squad member for 30% of their maximum Health. Give each [Ceasefire], reducing the next enemy direct hit they take by 20%. Expires after the next enemy phase; refreshes rather than stacks.', undefined, 'all-allies'),
      ultimate: ability('Last Flare: Let Them Leave Alive', 'Spend all [Interval]. Heal every living squad member for 70% of their maximum Health. Give each [Ceasefire] for 20% damage reduction, plus 5% per [Interval] spent, expiring after two enemy phases. Recover next turn.', undefined, 'all-allies'),
    },
  },
  rhaziel: {
    role: 'Shield-and-repair healer',
    playLoop: 'Shield allies before pressure; effective damage absorption becomes delayed [Repair] healing.',
    passive: { name: 'Record the Repaired Join', description: 'The first time each ally’s Shield from Rhaziel’s abilities absorbs enemy direct damage in an enemy phase, store 20% of that absorbed damage as [Repair], up to 20% of that ally’s maximum Health. At the start of the next player turn, spend [Repair] to heal its holder while Rhaziel lives.' },
    abilities: {
      skill1: ability('Mend Before the Break', 'Shield one chosen living ally for 35% of their maximum Health.', undefined, 'one-ally'),
      skill2: ability('Leave the Dents Remembered', 'Heal every living squad member for 20% of their maximum Health and shield each for 20% of their maximum Health.', undefined, 'all-allies'),
      ultimate: ability('Last Flare: A Defense Worth Returning To', 'Heal every living squad member for 45% of their maximum Health and shield each for 55% of their maximum Health. Recover next turn.', undefined, 'all-allies'),
    },
  },
  oryn: {
    role: 'Single-target agreement support',
    playLoop: '[Terms] and [Accord] coordinate one attack each turn; the Last Flare broadens coverage without stacking defense.',
    passive: { name: 'Terms Both Sides Can Leave', description: 'Maintain [Terms] on one enemy and [Accord] on one ally. Once per player turn, an ally carrying Oryn’s [Accord] deals 30% more direct damage with a Normal Attack or ability against his [Terms] target.' },
    abilities: {
      skill1: { ...ability('The Seal Remains Unstruck', 'Deal 240% Direct Attack to one enemy. Apply 25% [Weaken] and [Terms] for two enemy phases, replacing Oryn’s previous [Terms] target.', 2.4), strength: { damageMultiplier: 2.4, weakenFraction: .25 } },
      skill2: ability('An Exit in the Agreement', 'Give one chosen living ally +30% Defense and [Accord] for two player turns, replacing Oryn’s previous [Accord] holder. Refreshes rather than stacks.', undefined, 'one-ally'),
      ultimate: ability('Last Flare: No Victory Requires This', 'Apply 30% [Weaken] to all enemies for two enemy phases. Preserve any existing [Terms] target and refresh its duration. Give every living squad member +20% Defense and [Accord] for two player turns, replacing the single-ally [Accord]. Recover next turn.', undefined, 'all-enemies'),
    },
  },
  thessara: {
    role: 'Gauge-delivery support',
    playLoop: 'Normal Attacks and Skill1 build [Reserve]; spend it to choose focused healing or team Gauge delivery.',
    passive: { name: 'Promises Measured in Water', description: 'Store up to 4 [Reserve]. Each Normal Attack or Skill1 that directly hits an enemy grants 1 [Reserve], once per action.' },
    abilities: {
      skill1: ability('Follow the Empty Channel', 'Deal 240% Direct Attack to one enemy. Gain 1 [Reserve] if it hits.', 2.4),
      skill2: ability('Deliver What Was Promised', 'Spend all [Reserve]. Heal one chosen living ally for 20% of their maximum Health, plus 10% per [Reserve] spent. Grant them 8 Elemental Gauge per [Reserve] spent.', undefined, 'one-ally'),
      ultimate: ability('Last Flare: No Village Omitted', 'Spend all [Reserve]. Heal every living squad member for 50% of their maximum Health, plus 5% per [Reserve] spent. Grant every other living squad member 6 Elemental Gauge per [Reserve] spent. Recover next turn.', undefined, 'all-allies'),
    },
  },
  elaris: {
    role: 'Marked-target setup attacker',
    playLoop: 'Build [Branch] on one enemy, then spend it for focused defense-piercing damage or allied [Open Route] tokens.',
    passive: { name: 'A Way Through the Grove', description: 'Normal Attacks and Skill1 place 1 [Branch] on their surviving target, up to 3. Elaris maintains [Branch] on one enemy; attacking another target replaces the mark.' },
    abilities: {
      skill1: ability('Mark the Firebreak', 'Deal 280% Direct Attack to one enemy, then place 1 [Branch] on a surviving target.', 2.8),
      skill2: ability('Branching Escape', 'Spend all [Branch]. Deal 240% Direct Attack to all enemies. Against the previously marked target, ignore 8% Defense per [Branch] spent.', 2.4, 'all-enemies'),
      ultimate: ability('Last Flare: A Grove Beyond the Burning Walls', 'Spend all [Branch]. Deal 1050% Direct Attack to one enemy, plus 90% per [Branch] spent if it was the marked target. Against that target, ignore 10% Defense per [Branch] spent. Recover next turn.', 10.5),
    },
  },
  veyr: {
    role: 'Defense-fracture attacker',
    playLoop: 'Build [Fault] on one enemy to lower its Defense; spend it for demolition and specialized Master effects.',
    passive: { name: 'Only What Must Fall', description: 'Normal Attacks and Skill1 place 1 [Fault] on their surviving target, up to 3. Veyr maintains [Fault] on one enemy; attacking another target replaces the old mark. Each [Fault] reduces the marked enemy’s Defense by 8%. [Fault] lasts two enemy phases; new applications refresh its duration.' },
    abilities: {
      skill1: ability('Find the Load-Bearing Lie', 'Deal 320% Direct Attack to one enemy, then place 1 [Fault] on a surviving target.', 3.2),
      skill2: ability('Dismantle the Occupied Engine', 'Spend all [Fault]. Deal 240% Direct Attack to all enemies and an additional 200% Direct Attack per [Fault] spent to the previously marked target.', 2.4, 'all-enemies'),
      ultimate: ability('Last Flare: What Remains Standing', 'Spend all [Fault]. Deal 1050% Direct Attack to one enemy, plus 200% per [Fault] spent if it was the marked target. Recover next turn.', 10.5),
    },
  },
  aureth: {
    role: 'Moving-shelter tank',
    playLoop: '[Lead] moves protection across the squad; changing holders earns [Momentum] for a team-wide shelter.',
    passive: { name: 'Carry the Corridor Forward', description: 'Maintain [Lead] on one living ally. Moving it to a different ally grants 1 [Momentum], up to 3, once per player turn. Its holder takes 20% less enemy direct damage for two enemy phases while Aureth lives.' },
    abilities: {
      skill1: ability('Take the Sheltered Route', 'Shield one chosen living ally for 35% of their maximum Health. Move [Lead] to them and refresh its duration.', undefined, 'one-ally'),
      skill2: ability('Turn the Ashwind Aside', 'Deal 240% Direct Attack to all enemies. Move [Lead] to Aureth and taunt eligible attacks for the next enemy phase.', 2.4, 'all-enemies'),
      ultimate: ability('Last Flare: Hold the Burning Sky Open', 'Spend all [Momentum]. Shield every living squad member for 60% of their maximum Health and grant +10% Defense per [Momentum] spent for two player turns. Move [Lead] to Aureth and taunt for the next enemy phase. Recover next turn.', undefined, 'all-allies'),
    },
  },
} as const satisfies Record<string, NativeIdentityDefinition>;
