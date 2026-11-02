# Phase 1 proposal: new Elemental War Element-Bearers and role perks

**Status: PROPOSAL, not approved, nothing implemented.** Numbers below are
first-pass developer tuning for owner review. Owner questions are listed at the
end; implementation starts only after they are answered.

## Owner brief (confirmed requirements)

- Three new Elemental War Element-Bearers, each with six-form art, ability kit
  and Conduits that are unique and different from every existing character.
- Each fills a role (Tank / Attacker / Support) that its element lacks.
- Clearly stronger visual identity than the existing roster.
- Each helps teammates of its own element (same-element team synergy).
- New intrinsic role perks for **every** character of that role:
  - Tank: enemies are 25% more likely to target this character; innate +50% Defense.
  - Support: every Skill or Last Flare cast heals all squad members for 4% of
    their max Health; innate +50% Health and +25% Skill Power.
  - Damage (Attacker): innate +100% Direct Damage and +50% Skill Power.

## Role gaps (current roster; Calamitic in brackets)

| Element | Tank | Attacker | Support |
| --- | --- | --- | --- |
| Infernic | none | Infernis | none |
| Oceanic | Tizu | Nerithe | none |
| Botanic | Bruno, Orvella | none | Flora |
| Tranquilitic | [Ozriel] | Rosetta, Bliss | Aurora |
| Atmospheric | none | Atmoso, Elise, Vaelor | [Ilvaris] |
| Chaotic | Thornia, Razor | Crinso, [Kaelith] | Disciple |

There are seven open slots. This proposal fills one per role, choosing the
elements with the fewest options: **Infernic Tank** (Infernic has only one
character), **Oceanic Support** and **Botanic Attacker**. Remaining future gaps:
Infernic Support, Tranquilitic Tank, Atmospheric Tank and Support.

## Shared rules (mirrors Nerithe / Orvella / Vaelor)

- 6-star, six forms Common to Omnic, same level caps and material costs as the
  existing War characters.
- Each gets its own Elemental War trial: 10 stages Lv.90 to 140 against that
  character's six forms; stage 10 guarantees recruitment (D-414); owned results
  convert to 100 Null-Prismatica. Free sequential entry, no pity, not in banners.
- **Kinship** (new shared rule): each new character's kinship bonus applies
  only to living allies whose combat element matches theirs. It never applies
  to the character itself, so one copy cannot self-stack.
- Shields last until broken and stack (D-434). Existing caps, recovery and
  separate RNG streams unchanged; no account writes outside existing transactions.

## 1. Caldrex, Kiln Warden (Infernic Tank)

**Visual identity:** a walking forge-cathedral. Obsidian and blackened-brass
plate with molten-glass window panels, a back-mounted organ of chimney spires
that grows into a furnace cathedral by Omnic, a mantle of hanging forge chains,
and **two colossal forge gauntlets that lock together into a furnace-gate
shield** (no other character uses gauntlets). Palette: obsidian, brass, molten
orange, white-hot gold, ash white.

Base stats: Health 320, Defense 22, Attack 30, Crit 8%, Crit damage 1.5x.

| Slot | Name | Effect (proposed) |
| --- | --- | --- |
| Passive | Kiln Heart | Each enemy hit on Caldrex grants 1 Heat (max 3, one per enemy action). **Kinship:** Infernic allies gain +5% Skill Power per Heat. |
| Skill 1 | Forgegate Bulwark | Caldrex gains 55 shield; other allies gain 30 (Infernic allies 45). Enemies target Caldrex during the next enemy phase. |
| Skill 2 | Slag Toll | 140% damage to all enemies and applies Burn. Spends all Heat for +15% damage each. |
| Last Flare | Cathedral of the Kiln | 240% damage to all enemies with Burn; 80 shield to every ally. **Kinship:** Infernic allies' Burn deals +50% for two enemy phases. Recover next turn. |

**Master Conduits (Omnic, Caldrex only):**

- **Kilnheart Reliquary:** Heat max 3 to 5; each Heat also gives Caldrex +8% Defense. +60% Defense.
- **Forgegate Siege Engine:** while an enemy is forced to target Caldrex, he returns 30% of the damage he takes as Infernic damage and Burns the attacker. +50% Health.
- **Ember Covenant Furnace:** each Burn tick from an Infernic ally restores 1% of Caldrex's max Health to the lowest-Health ally. +40% Skill Power.

## 2. Selvaine, Tidebell Cantor (Oceanic Support)

**Visual identity:** a lighthouse choir-priestess of the deep. Pearl and coral
armor with sea-glass inlays, a huge rotating lighthouse-lens halo, a waterfall
cloak of opaque layered water ribbons, and a **chained tidebell censer** she
swings like a pendulum (unique weapon). Palette: pearl white, deep navy,
seafoam teal, coral pink, silver.

Base stats: Health 250, Defense 14, Attack 34, Crit 12%, Crit damage 1.5x.

| Slot | Name | Effect (proposed) |
| --- | --- | --- |
| Passive | Tidebell Psalm | Healing beyond max Health becomes shield, up to 25% of the target's max Health (once per ally per round). **Kinship:** Oceanic allies gain +8 Elemental Gauge at the start of each round. |
| Skill 1 | Lighthouse Mercy | Heals every living ally 15% of their max Health (Oceanic allies 22%). |
| Skill 2 | Undertow Hymn | 120% damage to all enemies; Weaken 20% for two enemy phases. **Kinship:** Oceanic allies gain 10 Gauge. |
| Last Flare | Flood of Remembrance | Heals every ally 35% max Health, 50 shield to every ally, +30% Skill Power for two turns (Oceanic allies +45%). Recover next turn. |

**Master Conduits (Omnic, Selvaine only):**

- **Lighthouse Canticle Lens:** overflow shield cap 25% to 40%. +40% Skill Power.
- **Tidebell Orrery:** each Skill gives 15 Gauge to the ally with the lowest Gauge (20 if Oceanic). +50% Health.
- **Undertow Choir Engine:** enemies Weakened by Undertow Hymn take +12% damage from Oceanic allies. +40% Defense.

## 3. Myrthen, Season Reaper (Botanic Attacker)

**Visual identity:** a harvest duelist with **orchard wings made of four
seasons** (spring blossom, summer leaf, autumn amber, winter frost-white),
bark and jade armor with growth rings, and **twin chained sickles** (unique
weapon). Late forms grow a rotating orchard crown and seasonal leaf storms.
Palette: jade, bark brown, blossom pink, amber, frost white.

Base stats: Health 205, Defense 10, Attack 47, Crit 20%, Crit damage 1.7x,
Elemental damage 6.

| Slot | Name | Effect (proposed) |
| --- | --- | --- |
| Passive | Turning Seasons | Each Skill advances the season: Sprout, Bloom, Harvest (max 3). At Harvest, Myrthen's next Skill or Last Flare deals +60% damage and ignores 25% Defense, then returns to Sprout. **Kinship:** Botanic allies gain +8% Direct Damage per season. |
| Skill 1 | Reaping Crescent | 190% damage to one enemy and applies the Overgrowth mark (+10% damage taken from Botanic allies for two enemy phases). |
| Skill 2 | Thicket Gale | 145% damage to all enemies. |
| Last Flare | Final Harvest | 340% damage to all enemies; +20% per season consumed. Recover next turn. |

**Master Conduits (Omnic, Myrthen only):**

- **Perennial Scythe Loom:** Harvest ignores 40% Defense instead of 25% and keeps 1 season. +60% Direct Damage.
- **Overgrowth Engine:** when an Overgrowth-marked enemy is defeated, the mark jumps to another enemy. +40% Skill Power.
- **Rootbound Harvest Mill:** when Myrthen defeats an enemy, Botanic allies heal 6% max Health and gain 10 Gauge. +50% Critical Damage.

## 4. Intrinsic role perks (all characters)

Applies by the authored `role` field. Captured Elemental-Devourers have no role
and receive none.

| Role | Characters | Perk |
| --- | --- | --- |
| Tank | Tizu, Bruno, Razor, Thornia, Orvella, Ozriel, Caldrex | Target weight x1.25; +50% Defense |
| Attacker | Infernis, Rosetta, Crinso, Atmoso, Bliss, Elise, Nerithe, Vaelor, Kaelith, Myrthen | +100% Direct Damage; +50% Skill Power |
| Support | Flora ("Healer & Support"), Aurora, Disciple, Ilvaris, Selvaine | Each Skill / Last Flare heals all squad members 4% max Health; +50% Health; +25% Skill Power |

Implementation notes:

- Tank targeting reuses the existing single enemy target roll as a weighted
  pick (no extra RNG draw). Forced targets (taunts) and Calamity targeting
  patterns still override it.
- Perks are innate, shown in the Character/Battle reference as a separate
  role perk, and apply inside the shared stat resolver so battle snapshots stay
  consistent.
- **Balance warning:** +100% Direct Damage for every Attacker roughly doubles
  most team damage. D-404 enemy benchmarks would need re-running and likely
  enemy retuning (see questions).

## 5. Art deliverables (prompt-only until delivery)

Per character: 6 portraits, 4 ability icons (Normal Attack/Defense stay
universal), 3 Master Conduit icons. Per trial: 3:1 header and 16:9 arena.
Total **45 prompts**, generated by a reproducible tool with solid-background
cutouts and D-135 edge margins, plus tests. Art stays neutral-pending until
reviewed delivery.

## Proposed implementation order

1. Role perks (engine, resolver, readouts, tests, benchmark rerun).
2. Characters, kits, kinship and War trials (client, server authority, saves).
3. Nine Master Conduits.
4. Art prompt pack and docs.

Each section: full test suite, build, push, authority deploy (engine change),
hosted Pages verification.

## Open owner questions

See the question form in the chat session; answers will be recorded here and
in the decision log.
