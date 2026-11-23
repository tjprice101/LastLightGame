import type { RadiantKitId } from './radiant-kits';

/**
 * Battle Flurry Phase 3 Step 3 (D-479): approved kit text from
 * docs/Future Plans/battle-flurry-reference/phase3-kit-drafts.md, at base (form 1, rank 1, no Master or
 * Conduits). Skill Power, Imbues and Flare rank are shown in the Skill stats panel, not folded in here.
 *
 * Flare and Leader templates mark every number that scales, matching the engine's scaling class:
 * - `{h}`: Flare hits for the tier (12 / 8 / 4).
 * - `{d:900}`: damage-scaled percent (Flare tier damage scale).
 * - `{e:50}`: effect-scaled percent (Flare tier effect scale).
 * - `{f:25}`: effect-scaled Luminosity fill, rounded like the engine.
 * - `{m:3}` / `{mw:3}`: damage-scaled multiplier ("3 times" / "triple").
 * - `{l:20}`: Leader percent; `{ln:2}`: Leader Luminosity (both scale with form and Leader equipment).
 * Every other number is fixed (durations, charges, counts, thresholds, ignore-Defense and Opening bonuses).
 * Texts start lowercase as in the drafts; the presenter capitalizes the first letter.
 */
export interface RadiantKitText {
  skill1: string;
  skill2: string;
  flare: string;
  leader: string;
}

export const radiantKitText: Record<RadiantKitId, RadiantKitText> = {
  // Batch 1: Opening and Flagships.
  ember: {
    skill1: '4-hit Infernic attack on one enemy (260%), adds Burn (25% Attack per turn, 3 turns).',
    skill2: '6-hit Infernic attack on all enemies (180%), detonates Infernis\'s Burn on each target (deals up to 2 remaining turns at once).',
    flare: '{h}-hit Infernic attack on all enemies ({d:900}), adds Burn ({e:100} Attack per turn, 3 turns), boosts Attack of all allies (+{e:50}, 3 turns).',
    leader: 'boosts Normal Attack damage of Infernic allies (+{l:20}), boosts Burn damage of Infernic allies (+{l:15}).',
  },
  tide: {
    skill1: '4-hit Oceanic attack on one enemy (240%), Weakens target (-25% Attack, 2 turns).',
    skill2: 'grants all allies a Shield (25% of max Health), boosts Defense of all allies (+30%, 2 turns).',
    flare: 'grants all allies a Shield ({e:50} of max Health), reduces damage taken by all allies (-{e:30}, 2 turns).',
    leader: 'boosts Defense of Oceanic allies (+{l:20}); an Oceanic ally that uses a skill gains a Shield ({l:40} of its Defense).',
  },
  sprout: {
    skill1: '4-hit Botanic attack on one enemy (220%), plants a Seed on the ally with the lowest Health.',
    skill2: 'heals all allies (25% of max Health), plants a Seed on all allies.',
    flare: 'heals all allies ({e:60} of max Health), plants an Empowered Seed on all allies (heals {e:60}), boosts Luminosity gained by all allies (+{e:30}, 3 turns).',
    leader: 'boosts healing done by Botanic allies (+{l:20}); at the start of each player turn, each Botanic ally heals the ally with the lowest Health ({l:10} of its Recovery).',
  },
  atmoso: {
    skill1: '3-hit Atmospheric attack on one enemy (250%), releases Atmoso\'s Cyclone now.',
    skill2: '5-hit Atmospheric attack on all enemies (150%), creates a Cyclone (after 2 turns, deals 60% Attack + 20% per Gust to all enemies). A new Cyclone releases the old one first.',
    flare: '{h}-hit Atmospheric attack on all enemies ({d:850}), releases the Cyclone at {mw:3} damage, Weakens all enemies (-{e:15} Attack, 2 turns).',
    leader: 'boosts damage of Atmospheric allies after another ally has acted this turn (+{l:20}); an Atmospheric ally\'s Normal Attack hit fills {ln:2} extra Luminosity.',
  },
  aurora: {
    skill1: '3-hit Tranquilitic attack on one enemy (200%), Weakens target (-30% Attack, 2 turns).',
    skill2: '4-hit Tranquilitic attack on all enemies (140%), Weakens all enemies (-20% Attack, 2 turns).',
    flare: '{h}-hit Tranquilitic attack on all enemies ({d:400}), Weakens all enemies (-{e:35} Attack, 3 turns), reduces damage taken by all allies (-{e:30}, 2 turns).',
    leader: 'boosts damage of Tranquilitic allies against Weakened enemies (+{l:20}); reduces Weaken on Tranquilitic allies (-{l:20} of its strength).',
  },
  bliss: {
    skill1: '4-hit Tranquilitic attack on one enemy (260%). Opening: this attack deals +30%. Closing: heals the ally with the lowest Health (15% of max Health).',
    skill2: '6-hit Tranquilitic attack on all enemies (170%). Opening: boosts Attack of all allies (+20%, 1 turn). Closing: grants all allies a Shield (10% of max Health).',
    flare: '{h}-hit Tranquilitic attack on all enemies ({d:950}). Opening: this attack deals +40%. Closing: heals all allies ({e:25} of max Health).',
    leader: 'a Tranquilitic ally\'s Normal Attack hit boosts Attack of the next ally who has not acted (+{l:10}, this turn), and heals the ally with the lowest Health ({l:12} of its Recovery).',
  },
  bruno: {
    skill1: '3-hit Botanic attack on one enemy (240%), boosts Defense of Bruno (+30%, 2 turns).',
    skill2: 'places Cover on all other allies (Bruno takes 40% of their direct damage, 1 turn), grants Bruno a Shield (20% of max Health).',
    flare: 'places Cover on all other allies (Bruno takes 60%, 2 turns), boosts Defense of all allies (+{e:40}, 2 turns), grants Bruno a Shield ({e:40} of max Health).',
    leader: 'a Botanic ally that uses a skill takes {l:12} less direct damage until the next player turn and grants all allies a Shield ({l:20} of its Defense).',
  },
  disciple: {
    skill1: 'boosts Attack of all allies (+30%, 2 turns).',
    skill2: '4-hit Chaotic attack on all enemies (140%), fills Luminosity of all other allies (+12).',
    flare: 'boosts Attack of all allies (+{e:60}, 3 turns), fills Luminosity of all other allies (+{f:25}).',
    leader: 'boosts Convergent Light damage of Chaotic allies (+{l:20}); a Chaotic ally\'s Convergent Light fills Luminosity of each other ally (+{ln:3}).',
  },
  elise: {
    skill1: '3-hit Atmospheric attack on one enemy (220%), lodges a held Shuriken in the target. With no Shuriken held: 280% instead.',
    skill2: '2-hit Atmospheric attack on one enemy (180%), recalls all lodged Shuriken (each strikes its enemy for 150% Attack).',
    flare: '{h}-hit Atmospheric attack on one enemy ({d:1300}), recalls all lodged Shuriken (each strikes its enemy for {d:400} Attack).',
    leader: 'boosts damage of Atmospheric allies that act before every other ally this turn (+{l:25}); attacks by Atmospheric allies ignore enemy Defense ({l:10}).',
  },
  razor: {
    skill1: '3-hit Chaotic attack on one enemy (220%), spends all Wounds for an extra strike (deals damage equal to the Wounds spent).',
    skill2: 'reduces damage taken by Razor (-30%, 1 turn), grants Razor a Shield (20% of max Health).',
    flare: '{h}-hit Chaotic attack on one enemy ({d:1100}), spends all Wounds for an extra strike ({m:3} the Wounds spent).',
    leader: 'boosts damage of Chaotic allies while they have a Shield (+{l:25}); after a Chaotic ally\'s Normal Attack hit, it takes {l:8} less direct damage until the next player turn.',
  },
  // Batch 2: Rose and Calamitic.
  rosetta: {
    skill1: '4-hit Tranquilitic attack on one enemy (250%), marks it as Quarry, gives target Critical Up (+30% Critical Rate, 2 turns).',
    skill2: '5-hit Tranquilitic attack on the Quarry, or on the current target if there is none (300%, +40% per contributor this turn).',
    flare: '{h}-hit Tranquilitic attack on the Quarry, or on the current target if there is none ({d:1350}), gives target Critical Up (+{e:60} Critical Rate, 3 turns), heals each contributor this turn ({e:20} of max Health).',
    leader: 'boosts damage of Tranquilitic allies against enemies with Critical Up (+{l:25}); a Tranquilitic ally\'s Normal Attack hit gives the target Critical Up (+{l:16} Critical Rate, this turn).',
  },
  thornia: {
    skill1: '2-hit Chaotic attack on one enemy (160%), places a Thorn Trap on the target (3 charges, 3 turns).',
    skill2: '4-hit Chaotic attack on one enemy (250%), spends 1 Thorn Trap charge on the target for an extra strike (100% Attack), grants all allies a Shield (15% of max Health).',
    flare: '{h}-hit Chaotic attack on all enemies ({d:650}), places an Empowered Thorn Trap on each enemy (3 charges, strikes for {d:200} Attack, 3 turns), grants all allies a Shield ({e:30} of max Health).',
    leader: 'boosts Shields from Chaotic allies\' skills (+{l:20}); when an enemy hits a Shield from a Chaotic ally, reflects {l:20} of that damage (once per turn, up to that ally\'s Attack).',
  },
  crinso: {
    skill1: '4-hit Chaotic attack on one enemy (250%). After Crimson Rupture, it ignores 20% of the target\'s Defense.',
    skill2: '5-hit Chaotic attack on one enemy (310%; 370% after Golden Edge), adds Burn (20% Attack per turn, 2 turns).',
    flare: '{h}-hit Chaotic attack on one enemy ({d:1200}, +{d:200} per Combo), ignores 45% of the target\'s Defense at 3+ Combo, spends all Combo.',
    leader: 'boosts damage of Chaotic allies against Burning enemies (+{l:25}); attacks by Chaotic allies restore their Health ({l:4} of Health damage dealt).',
  },
  ozriel: {
    skill1: '3-hit Tranquilitic attack on one enemy (230%), Weakens target (-40% Attack, 2 turns).',
    skill2: 'grants all allies a Shield (30% of max Health).',
    flare: '{h}-hit Tranquilitic attack on all enemies ({d:500}), grants all allies a Shield ({e:55} of max Health), reduces damage taken by all allies (-{e:25}, 2 turns).',
    leader: 'Tranquilitic allies above 75% Health take {l:12} less direct damage; a Tranquilitic ally whose Health an enemy damages gains a Shield ({l:3} of max Health, once per turn).',
  },
  ilvaris: {
    skill1: '3-hit Atmospheric attack on one enemy (220%), adds 1 Fate-seared Mark.',
    skill2: 'heals all allies (30% of max Health), boosts Attack of all allies (+30%, 2 turns).',
    flare: '{h}-hit Atmospheric attack on all enemies ({d:500}), adds 2 Fate-seared Marks to each enemy, heals all allies ({e:50} of max Health), fills Luminosity of all allies (+{f:15}).',
    leader: 'each ally healed by an Atmospheric ally gains Attack (+{l:10}, this turn); Atmospheric allies gain {ln:2} Luminosity at the start of each player turn.',
  },
  kaelith: {
    skill1: '5-hit Chaotic attack on all enemies (200%).',
    skill2: '6-hit Chaotic attack on one enemy (360%, +20% per Incision on it), then consumes its Incisions.',
    flare: '{h}-hit Chaotic attack on all enemies ({d:1000}), gives all enemies Critical Up (+{e:50} Critical Rate, 2 turns).',
    leader: 'boosts damage of Chaotic allies against enemies at full Health (+{l:25}) and against enemies with Critical Up (+{l:20}).',
  },
  // Batch 3: Elemental War.
  nerithe: {
    skill1: '4-hit Oceanic attack on the Surveyed enemy, or on the current target if there is none (260%), spends 1 Survey to ignore 25% of its Defense.',
    skill2: '6-hit Oceanic attack on all enemies (180%), moves all Survey to the current target.',
    flare: '{h}-hit Oceanic attack on the Surveyed enemy, or on the current target if there is none ({d:1250}), spends all Survey (each ignores 20% of its Defense).',
    leader: 'an Oceanic ally\'s Normal Attack hit gives the target Critical Up (+{l:20} Critical Rate, this turn) and fills each other ally\'s Luminosity (+{ln:1}).',
  },
  orvella: {
    skill1: '3-hit Botanic attack on one enemy (210%), repairs the Foundation (8% of Orvella\'s max Health). With no Foundation: 270% instead.',
    skill2: 'creates a Foundation (durability 35% of Orvella\'s max Health, 3 turns), boosts Defense of all allies (+25%, 2 turns). Recasting replaces it at full durability.',
    flare: '{h}-hit Botanic attack on all enemies ({d:900}), spends the Foundation for an extra strike on each enemy ({m:3} its remaining durability), then creates a new Foundation (durability {e:50} of Orvella\'s max Health, 3 turns).',
    leader: 'a Botanic ally that uses a skill gains a Shield ({l:35} of its Defense); when an enemy damages a Botanic ally\'s Health, that ally heals the other ally with the lowest Health ({l:12} of its Recovery, once per turn).',
  },
  vaelor: {
    skill1: '4-hit Atmospheric attack on one enemy (250%). On Tune: this attack deals +30%.',
    skill2: '6-hit Atmospheric attack on all enemies (170%). On Rise: boosts Attack of Vaelor (+25%, 2 turns).',
    flare: '{h}-hit Atmospheric attack on all enemies ({d:1150}; {d:1500} on Crescendo).',
    leader: 'boosts damage of Atmospheric allies after another ally has acted this turn (+{l:20}); an Atmospheric ally\'s Normal Attack hit also strikes the healthiest other enemy ({l:12} of that damage).',
  },
  caldrex: {
    skill1: 'grants all allies a Shield (15% of max Health), boosts Defense of Caldrex (+30%, 2 turns).',
    skill2: '5-hit Infernic attack on all enemies (220%, +25% per Heat spent), adds Burn (20% Attack per turn, 3 turns), spends all Heat.',
    flare: 'grants all allies a Shield ({e:50} of max Health, +{e:5} per Heat spent), boosts Burn damage of all allies (+{e:25}, 2 turns), spends all Heat.',
    leader: 'Infernic allies heal {l:10} of the Health damage their Burn deals; when an enemy damages an Infernic ally\'s Health, that ally gains a Shield ({l:2.5} of max Health, once per turn).',
  },
  solenne: {
    skill1: '3-hit Tranquilitic attack on one enemy (220%), Weakens target (-25% Attack, 2 turns).',
    skill2: 'grants all allies a Shield (18% of max Health), Solenne gains 2 Stillness.',
    flare: '{h}-hit Tranquilitic attack on all enemies ({d:700}, +{d:45} per Stillness spent), grants all allies a Shield ({e:25} of max Health, +{e:5} per Stillness spent), spends all Stillness.',
    leader: 'a Tranquilitic ally that uses a skill takes {l:10} less direct damage until the next player turn; when an enemy breaks a Tranquilitic ally\'s last Shield, that ally heals ({l:20} of its Recovery, once per turn).',
  },
  myrthen: {
    skill1: '4-hit Botanic attack on one enemy (250%), gives target Critical Up (+24% Critical Rate, 2 turns).',
    skill2: '6-hit Botanic attack on all enemies (170%).',
    flare: '{h}-hit Botanic attack on one enemy ({d:1250}).',
    leader: 'boosts damage of Botanic allies against enemies at or below 25% Health (+{l:30}); a Botanic ally\'s defeat of an enemy heals the ally with the lowest Health ({l:3} of its max Health, once per action).',
  },
  neralis: {
    skill1: 'heals the ally with the lowest Health (35% of max Health), boosts Defense of that ally (+30%, 2 turns).',
    skill2: 'heals all allies (18% of max Health, +6% per Current spent), spends all Current.',
    flare: '{h}-hit Oceanic attack on all enemies ({d:650}), heals all allies ({e:30} of max Health, +{e:5} per Current spent), spends all Current.',
    leader: 'when an Oceanic ally\'s skill restores Health, each other ally gains {ln:2} Luminosity (once per action); boosts Shields from Oceanic allies\' skills (+{l:15}).',
  },
  varkhel: {
    skill1: 'grants Varkhel a Shield (25% of max Health), boosts Defense of Varkhel (+40%, 2 turns).',
    skill2: '4-hit Infernic attack on one enemy (260%, +45% per Tension spent), ignores 20% of its Defense, spends all Tension.',
    flare: '{h}-hit Infernic attack on all enemies ({d:650}, +{d:55} per Tension spent), grants all allies a Shield ({e:30} of max Health), spends all Tension.',
    leader: 'boosts damage of Infernic allies at or below half Health (+{l:25}); an Infernic ally\'s Normal Attack hit on Health grants it a Shield ({l:25} of its Defense).',
  },
  seravelle: {
    skill1: '4-hit Infernic attack on one enemy (230%), adds Burn (15% Attack per turn, 2 turns).',
    skill2: 'boosts Attack of all allies (+30%, +10% per Cadence spent, 2 turns), spends all Cadence.',
    flare: '{h}-hit Infernic attack on all enemies ({d:600}), fills Luminosity of all other allies (+{f:20}), boosts Luminosity gained by all allies (+{e:30}, 2 turns).',
    leader: 'an Infernic ally\'s Normal Attack hit on Health heals the ally with the lowest Health ({l:15} of its Recovery); an Infernic ally\'s Convergent Light fills each other ally\'s Luminosity (+{ln:3}).',
  },
  velmira: {
    skill1: '4-hit Chaotic attack on one enemy (260%), Weakens target (-25% Attack, 2 turns).',
    skill2: '6-hit Chaotic attack on all enemies (180%), ignores 20% of Defense with 2+ Crosscut (keeps Crosscut).',
    flare: '{h}-hit Chaotic attack on one enemy ({d:1000}, +{d:90} per Crosscut spent), ignores 30% of its Defense, spends all Crosscut.',
    leader: 'boosts damage of Chaotic allies against Weakened enemies (+{l:20}); a Chaotic ally\'s Normal Attack hit on Health Weakens the target (-{l:8} Attack, 1 turn).',
  },
  // Batch 4: Moon.
  maerion: {
    skill1: '3-hit Oceanic attack on one enemy (200%), heals the ally with the lowest Health (25% of max Health).',
    skill2: 'heals the ally with the lowest Health (45% of max Health, plus all Unreturned), spends all Unreturned.',
    flare: 'heals all allies ({e:65} of max Health, plus Unreturned split evenly), spends all Unreturned.',
    leader: 'boosts Recovery of Oceanic allies (+{l:20}); once per action, an Oceanic ally whose skill restores Health gains {ln:2} Luminosity.',
  },
  caevren: {
    skill1: '4-hit Atmospheric attack on one enemy (250%), boosts Defense of Caevren (+30%, 2 turns).',
    skill2: 'grants the ally with the lowest Health a Shield (30% of max Health), places Cover on all other allies (Caevren takes 30% of their direct damage, 2 turns).',
    flare: 'grants Caevren a Shield ({e:60} of max Health, +{e:12} per Load spent), places Cover on all other allies (Caevren takes 30%, 2 turns), reduces damage taken by all allies (-{e:20}, 2 turns), spends all Load.',
    leader: 'enemy attacks dealing more than 20% of an Atmospheric ally\'s max Health deal {l:10} less damage to it; once per turn, when an enemy hits a Shield from an Atmospheric ally, that ally gains {ln:3} Luminosity.',
  },
  vespera: {
    skill1: '3-hit Infernic attack on one enemy (210%), adds Burn (25% Attack per turn, 3 turns).',
    skill2: 'gives Signal to all other allies.',
    flare: '{h}-hit Infernic attack on all enemies ({d:600}), gives an Empowered Signal to all other allies (+{e:50}), boosts Burn damage of all allies (+{e:20}, 2 turns).',
    leader: 'boosts Burn damage of Infernic allies (+{l:20}); an Infernic ally\'s Normal Attack hit on Health boosts Attack of the next ally who has not acted (+{l:10}, this turn).',
  },
  ilyss: {
    skill1: '3-hit Chaotic attack on one enemy (210%), Weakens target (-25% Attack, 2 turns).',
    skill2: 'heals the ally with the lowest Health (45% of max Health), removes Weaken from that ally.',
    flare: 'heals all allies ({e:60} of max Health, +{e:10} per Severance spent), removes Weaken from all allies, spends all Severance.',
    leader: 'reduces Weaken on Chaotic allies (-{l:25} of its strength); each ally a Chaotic ally heals gains a Shield ({l:20} of the healer\'s Defense, once per action).',
  },
  asteriel: {
    skill1: 'grants all allies a Shield (22% of max Health), enters Shelter.',
    skill2: 'boosts Attack of all allies (+30%, 1 turn), enters Flourish.',
    flare: 'in Shelter or with no path, grants all allies a Shield ({e:45} of max Health, +{e:8} per Promise spent). In Flourish, boosts Attack of all allies (+{e:50}, +{e:10} per Promise spent, 2 turns). Spends all Promise and keeps the current path.',
    leader: 'at the start of each player turn, each Botanic ally heals all allies ({l:6} of its Recovery); each ally a Botanic ally heals gains Attack (+{l:8}, this turn).',
  },
  serapha: {
    skill1: '3-hit Tranquilitic attack on one enemy (230%), Weakens target (-20% Attack, 2 turns).',
    skill2: 'heals all allies (28% of max Health), reduces damage taken by all allies (-20%, 1 turn).',
    flare: 'heals all allies ({e:65} of max Health), reduces damage taken by all allies (-{e:20}, +{e:5} per Interval spent, 2 turns), spends all Interval.',
    leader: 'Tranquilitic allies above 75% Health take {l:10} less direct damage; a Tranquilitic ally that uses a skill heals itself ({l:20} of its Recovery).',
  },
};
