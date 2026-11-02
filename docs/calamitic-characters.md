# Phase 0: Everything Calamity (D-435)

Status: D-435 Sections 1-4 are implemented: Calamitic progression/acquisition,
Gates of Oblivion, saved-victory Shard drops, Ascension/ability Imbues, and all
fourteen Calamitic Conduits. Cost quantities for character evolution remain a
developer proposal pending owner review. New Conduit art is still pending; the
nine designs use neutral placeholders and no art URLs. This document remains the
approved design contract; update it first if the owner revises the phase.

## Confirmed by the owner

- New **Calamitic** character rarity above Omnic: black and white with a deep
  crimson shimmer. (Calamitic already exists as a Conduit rarity in
  `src/content/rarity.ts`; this phase extends it to characters and materials.)
- Three 7-star Element-Bearers: one DPS (Attacker), one Tank, one Support.
- Each has six forms, starting at **Uncommon** (Evo 2) and ending at
  **Calamitic** (Evo 7): Uncommon → Rare → Epic → Legendary → Omnic → Calamitic.
- They keep normal elements.
- They should be very strong, but not stupidly broken.
- Each EX+1 / EX+2 / EX+3 tier awards its own character. Clearing any EX+Y
  stage has a 10% chance to award that tier's character at Evo 2 (Uncommon).
- Art theme: cosmic Calamitic angels in fully prismatic pearlescent armor from
  head to toe, shattering reality like glass with their elemental powers and
  denying fate. Very detailed and extremely ornate.
- Palette: black and white as primary and secondary colors, with sharp,
  saturated, sparkling crimson accents.

## Power budget

The current 6-star references are Nerithe, Orvella and Vaelor (Last Flare
260–330%, base HP 210–300).

The proposal gives these three about **+12–15% base stats** over that line.
Each kit is self-contained (owner removed the shared Fateglass counter) and uses one bounded signature mechanic, built on systems the game
already has: Weaken, Mark, shields, healing and Gauge.

Bounds:
- No infinite scaling, revives or extra turns.
- No Recover bypass and no new RNG.
- Every stack cap and once-per-battle rule is explicit.

## 1. Kaelith — DPS (EX+3)

| | |
|---|---|
| Element | Chaotic |
| Weapon | Shatterglass greatscythe with a crescent blade of cracked pearl-glass |
| Theme | The blade that cuts the thread of fate |
| Vow | "Whatever was written for us, I'll unwrite it." |
| Base stats | HP 240, DEF 13, ATK 50, Crit 22%, Crit Damage ×1.70, Elemental 10 |

**Kit**
- **Passive: Reality Fault.** +75% Skill Power and +5% Skill Critical Rate. Kaelith's direct hits add 1 **Fractalized Incision** to the target (cap 3). Each Fractalized Incision makes that enemy take +10% more damage from Kaelith and Squad Members (max +30%).
- **Skill 1: Shatterfall.** 456% direct damage to all enemies. Each hit adds one Fractalized Incision stack through Reality Fault, not a second application.
- **Skill 2: Glass Meridian.** 365% direct damage to one enemy, increased by 20% per existing Fractalized Incision stack (max +60%). After the hit, removes all of that target's stacks, including its own direct-hit application.
- **Last Flare: Denial of Fate.** 360% direct damage to all enemies. Each hit adds one Fractalized Incision stack (cap 3) without consuming existing stacks. Recover next turn.

D-445 renames the debuff from Fault to **Fractalized Incision** across ability
copy, status badges, logs, native readouts and Master effects. `faults`, `fault`
and `calamitic-fault` remain internal state/icon IDs; delivered source
`Fault.png` and provenance remain unchanged. No mechanics or migration changed.

**Form titles:** Hairline Fracture → Glass-Edged Herald → Reaper of Written Endings → Seraph of the Broken Thread → Sovereign of Shattered Fate → The Fate That Was Never Written

## 2. Ozriel — Tank (EX+1)

| | |
|---|---|
| Element | Tranquilitic |
| Weapon | Pearlescent cathedral tower shield and a glass halberd |
| Theme | The wall that refuses the ending |
| Vow | "The world ends when I allow it. Not before." |
| Base stats | HP 345, DEF 24, ATK 34, Crit 10%, Crit Damage ×1.50, Elemental 0 |

**Kit**
- **Passive: Refusal.** +65% Defense and +65% Health. Once per encounter **for each squad member**, a hit that would defeat Ozriel or another squad member leaves them at 1 HP instead. It is not a revive and never restores a defeated unit.
- **Skill 1: Pane of Absolution.** 240% direct damage to one enemy; Weaken reduces its direct damage by 50% for the next two Enemy Turns.
- **Skill 2: Cathedral of Shards.** A base 90-strength Shield to every living ally, increased by Skill Power. Absorbs damage before HP, lasts until broken and stacks (D-434).
- **Last Flare: The World Refuses.** 455% damage to all enemies and shield 140 to every living ally. Recover next turn.

**Form titles:** Unbroken Pane → Warden of the Glass Nave → Bastion of Refused Endings → Seraph of the Shattered Cathedral → Sovereign of the Unfallen Wall → The Ending That Was Denied

## 3. Ilvaris — Support (EX+2)

| | |
|---|---|
| Element | Atmospheric |
| Weapon | Glass halo-lyre with a ring of suspended crystal panes; no blade |
| Theme | The choir that sings a different tomorrow |
| Vow | "Prophecy is only a song no one has answered yet." |
| Base stats | HP 265, DEF 16, ATK 40, Crit 15%, Crit Damage ×1.55, Elemental 5 |

**Kit**
- **Passive: Severed Prophecy.** +200% Health and +100% Defense. Squad members deal +45% more damage to enemies carrying Ilvaris's **Fate-seared Mark**.
- **Skill 1: Unwritten Verse.** 225% damage to one enemy and a Fate-seared Mark for 2 enemy phases: it takes +10% damage from all sources per stack, up to 5 stacks (+50%). Recasting adds a stack and refreshes the duration. 
- **Skill 2: Hymn of Broken Glass.** Heals every living ally for 35% of their max HP. Base buffs increase their existing Critical Damage multiplier by 45% and Skill Power by 50 percentage points through the next Player Turn. Recasting heals again and refreshes the buffs without stacking them. Healing and buff strength scale with Skill Power.
- **Last Flare: Tomorrow, Unwritten.** 440% direct damage to all enemies. Heals every living ally for 50% of their max HP and restores 10% of each ally's Gauge capacity. Recover next turn.

**Form titles:** First Unsung Note → Cantor of Cracked Heavens → Choir-Seraph of the Glass Vault → Herald of the Unwritten Hymn → Sovereign of the Severed Prophecy → The Song That Defied Fate

## Art direction (Midjourney-ready wording)

[Pending reproducible art pack](../Art/characters/Calamitic%20Element-Bearers.md): 53 prompts for portraits, abilities/statuses, materials, Rise-blessed emblem and nine Conduits; no artwork delivered.

Shared clause for every form:

> compact chibi anime proportions, 2.5–3 heads tall, crisp cel shading,
> cosmic celestial angel, full-body prismatic pearlescent armor from head to
> toe, black and white armor plates, sharp saturated crimson accents and
> sparkling crimson shards, reality cracking like shattered glass around the
> figure, floating glass fragments and fractured halo, defiant heroic pose,
> extremely ornate, highly detailed

Shared negatives:
- no glow, no light bloom, no blur
- no text, no letters
- no gold, no blue, no green
- complete silhouette inside the margin; nothing touches the image edges

Each form also needs a contrasting solid key background, per the project's
cutout background contract.

Form escalation follows the existing ensemble ladder: 50/60/72/84/94/96%
spread with 25/20/14/8/3/2% margins.
- **Uncommon base:** simple pearlescent armor, one small cracked halo.
- **Omnic and Calamitic:** layered shattered-glass wings, crowned halos and
  dense crimson fracture lattices.
- The body stays the same compact size in every form.

## Level caps and Calamitic Ascension levels

- Element-Bearers today cap at 30/45/60/75/90/105 across their six forms.
- Calamitic Element-Bearers use 30/45/60/75/90 for Uncommon through Omnic
  and **110** at their Calamitic form.
- **Calamitic Ascension** (below) raises the level cap to **Lv.115**:
  - ordinary Element-****** can then level from Omnic Lv.105 through 115;
  - Calamitic Element-****** can then level from Calamitic Lv.110 through 115.
  Each added level uses the normal late-level cost formula; Calamitic Element-******
  continue to use their Calamity chain and Fragment of Rise.

## Acquisition

- Each EX tier owns one character: EX+1 Ozriel, EX+2 Ilvaris, EX+3 Kaelith.
- Every saved victory at that EX tier, in any of the 12 Calamity activities,
  has an independent **10%** chance to award that tier's character at Evo 2
  (Uncommon, Lv.0).
- **Stop rolling once owned:** an owned character is never re-rolled and
  gives no duplicate conversion.
- Implemented with a dedicated `calamityRecruitmentSeed`; existing chest,
  combat and reward RNG streams are unchanged. A new copy and chest/clear
  receipt are saved in one atomic victory write. Failed writes grant neither,
  and an idempotent retry cannot award twice. The saved reward event is annotated
  only after persistence, then shown with the shared Calamitic rarity feedback.

## Materials and progression costs (D-435 Section 1)

All ten materials are registered, strictly validated on load/save, visible in
Inventory and loot, and art-pending with named neutral tiles (no missing PNGs
or image URLs): Seed / Bud / Bloom / Crest / Heart / Soul of Calamity
(Common → Omnic), Fragment of Rise, Feather of the Severed Dawn, Splinter of
the Unmade Night, and Shard of Calamity (awarded on saved Calamity victories for Ascension).
Feather is sourced from Soar to Heaven Calamity chests; Splinter is sourced
from Delve into the Abyss Calamity chests. These materials are not exchangeable.

Every Calamitic level costs the usual Prismatica formula, but uses the Calamity
chain in place of its elemental chain. Common quantity remains `ceil(destination
level / 30)`; each higher rarity unlocks at the standard destination threshold.
Destinations Lv.91–110 also cost one Fragment of Rise. Material costs at
destinations Lv.61+ follow the existing late-cost doubling; Prismatica is not
doubled.

Calamitic evolution costs retain the normal elemental Prismatica and material
recipe, plus both chest materials and one Calamity-chain material. The following
quantities are the **developer proposal currently implemented for review**;
late-step material doubling follows the existing rule (Evo.5→6 and Evo.6→7):

| Evolution | Added Calamity material | Feather | Splinter | Effective late-step additions |
|---|---|---:|---:|---|
| Evo.2→3 | Bloom of Calamity ×5 | 1 | 1 | unchanged |
| Evo.3→4 | Crest of Calamity ×5 | 2 | 2 | unchanged |
| Evo.4→5 | Heart of Calamity ×5 | 3 | 3 | unchanged |
| Evo.5→6 | Soul of Calamity ×5 | 5 | 5 | Soul ×10, Feather ×10, Splinter ×10 |
| Evo.6→7 | Fragment of Rise ×5 | 8 | 8 | Fragment ×10, Feather ×16, Splinter ×16 |

The Heaven and Abyss chests add fixed Feather / Splinter stacks of **1 / 2 / 3**
at EX+1/2/3 respectively. These additions do not consume random draws; all
existing randomized contents and their order remain unchanged. No further 55%
chest-material reduction is applied.

## Gates of Oblivion

- A new activity built like the Elemental Dungeons: 25 floors, enemy Lv.125 → 170,
  a boss every fifth floor.
- **Unlock:** owning any Calamitic Element-Bearer.
- **Enemies:** original Rise-made Calamity constructs in six-form lines. Art is
  pending, so they use named neutral placeholders; never substitute other art.
- **Drops:** one shared chain, used only to **level and evolve Calamitic
  Element-Bearers**:
  - Seed / Bud / Bloom / Crest / Heart / Soul **of Calamity** (Common → Omnic);
  - **Fragment of Rise** (Calamitic tier, above Soul of Calamity).
- Unlock levels, odds and stack sizes follow the Elemental Dungeon structure,
  rescaled to Lv.125–170.
- No captures and no Null-Prismatica.

## Calamitic Ascension

**Shard of Calamity**
- Each saved Calamity boss victory rolls for Shards:
  - EX+1: 5% chance;
  - EX+2: 8% chance;
  - EX+3: 12% chance.
- A successful roll gives 2–4 Shards, using its own RNG.

**Eligibility:** every Element-Bearer at final form and maximum level:
- ordinary characters at Omnic Lv.105;
- Calamitic characters at Calamitic Lv.110.

**Steps**, all on the same Calamitic Ascension screen:
1. **Ascend** (25 Shards): all stats +50% and raises the level cap to Lv.115; added levels still require their normal level-up costs.
2. **Imbue** Skill 1, Skill 2 and Last Flare separately, 25 Shards each. Each
   needs step 1 first and gives that ability +50% base Skill Power and
   +5 percentage points Skill Efficiency. The existing 50% Skill Efficiency cap still applies.

Full cost: 100 Shards per character.

**Rise-blessed presentation:** an ascended character's name gains the suffix
", Rise-blessed" (example: "Infernis, Rise-blessed"). An ornate, mechanical
Calamity crown-burst emblem sits beside their Element Medal. The emblem art is
prompt-only until delivered.

### Calamitic Ascension implementation (D-435 Section 3)

- Calamity EX+1/EX+2/EX+3 saved boss victories roll 5%/8%/12% for 2 to 4 Shards
  using an independent `calamityShardSeed`. Balance, seed, chest, clear and
  receipt are committed atomically; the result receives its Shard annotation
  only after persistence, so the shared loot reveal never presents a failed save.
- Optional per-Element-Bearer Ascension progress is strictly validated and
  defaults absent on old saves without a read-time write. Captured Elemental-
  Devourers cannot ascend. The 25-Shard Ascend step requires the final evolution
  and unascended cap (Lv.105 ordinary, Lv.110 Calamitic), increases all resolved
  stats by 50%, and raises the cap to Lv.115 without skipping the newly paid
  levels. Lv.106-115 / Lv.111-115 use normal late-level costs; Calamitic
  leveling keeps the Calamity chain and Fragment of Rise.
- Skill 1, Skill 2 and Last Flare Imbues each cost 25 Shards after Ascend. Their
  +50% base Skill Power and +5 percentage-point Skill Efficiency apply only to
  that action; the global 50% Skill Efficiency cap remains in force.
- The Character evolution area opens a styled four-step panel; each confirmed
  step rereads current state, validates ordering/ownership/funds, deducts Shards
  and saves once. Online uses the authoritative `ascendCharacter` operation.
  The finite black/white/crimson celebration and accessible static reduced-motion
  feedback run only after successful persistence. `Rise-blessed` names and a
  CSS/SVG crown-burst badge appear on owned surfaces and battle snapshots; no
  emblem PNG URL is referenced.
- Regression coverage: `src/game/calamitic-ascension.test.ts` checks eligibility,
  costs/order, paid level caps, stat/action effects, efficiency cap, shard odds
  and RNG separation, atomic failures, server request/reward validation and
  Rise-blessed names. See the handoff for exact validation outcomes.

## New Calamitic Conduits

- Nine new Calamitic Conduits, bought from the Calamitic Token shop for 100
  Tokens each, like the existing five.
- **New limit:** at most **5 Calamitic Conduits** per character, counting all
  14 together.
- Effects below are at **+5**. The +0 value is the +5 value ÷ 1.5, growing
  10% of base per upgrade.

| # | Name | Effect at +5 |
|---|---|---|
| 1 | Bulwark of the Last Horizon | +300% Health, +300% Defense, +25% Damage Reduction to any shields on this character |
| 2 | Reliquary of Unending Mercy | Skills that heal or create shields gain +125% Skill Power and +35% Skill Efficiency |
| 3 | Aegis-Engine of Severed Fate | All shields on this character gain +55% Damage Reduction; +75% Skill Power |
| 4 | Monolith of the Unmoved Star | +500% Defense, +15% Skill Efficiency |
| 5 | Heartforge of the Sunless Dawn | +500% Health, +25% Skill Power |
| 6 | Ruinmark Censer | Enemies this character Weakens take +15% damage from all sources; +75% Defense, +60% Skill Power |
| 7 | Choir-Array of Branded Stars | When this character applies any Mark, all squad members gain +50% Skill Power and +10% Elemental Gauge; +70% Health, +70% Defense |
| 8 | Throne of the Lone Apostate | If this Element-Bearer is the only member of the squad: +250% Defense, +250% Health, +125% Skill Power |
| 9 | Worldbreaker Cannonade | This character's damaging Skills that hit all enemies gain +250% Skill Power |

## Calamitic Master Conduits (D-442)

Three personal Masters each for Ozriel, Ilvaris and Kaelith (57 Masters total).
They follow the existing Master rules: Omnic (Master) rarity, chosen from a
Machine's Master Chest, equipped only by their named bearer, never upgraded.
These designs are a developer proposal; numbers are open to owner tuning.

| Bearer | Master | Effect |
|---|---|---|
| Ozriel | Refusal Sovereign Heartdrive | When Refusal keeps a squad member at 1 HP, they also gain a Shield of 20% max Health. +75% Health, +65% Defense |
| Ozriel | Absolution Planetary Suppressor | Pane of Absolution also applies 25% Weaken to every other enemy until the end of the next Enemy Turn. +55% Defense, +45% Skill Power |
| Ozriel | Unfallen Continuum Worldengine | The World Refuses restores Refusal for living squad members who already used it. +55% Health, +45% Skill Efficiency |
| Ilvaris | Unsung Verse Harmonic Supercharger | Unwritten Verse adds 2 Fate-seared Mark stacks instead of 1. +45% Skill Power, +45% Skill Efficiency |
| Ilvaris | Hymnwind Imperial Turbine | Hymn of Broken Glass also grants every living squad member 8% Elemental Gauge. +65% Health, +45% Skill Efficiency |
| Ilvaris | Severed Prophecy Chronodrive | Tomorrow, Unwritten adds 1 Fate-seared Mark to every enemy. +55% Skill Power, +55% Gauge Gain |
| Kaelith | Glass Meridian Singularity Harvester | Glass Meridian ignores 40% Defense when it consumes 3 Fractalized Incision stacks. +55% Skill Power, +45% Direct Attack |
| Kaelith | Thousand-Fault Rupture Accelerator | Shatterfall adds 1 extra Fractalized Incision to every enemy it damages. +40% Skill Efficiency, +30% Critical Rate |
| Kaelith | Denied Fate Eclipse Annihilator | Denial of Fate sets every enemy it damages to 3 Fractalized Incision stacks. +45% Skill Power, +45% Gauge Gain |

Runtime hooks live in `src/game/native-kits.ts`; behaviour is covered by
`src/game/phase-zero-master-matrix.test.ts` and `conduit-roster.test.ts`.
Art is pending: prompts are in
[Calamitic Master Conduits](../Art/conduits/Calamitic%20Master%20Conduits.md)
(generated by `tools/build_calamitic_art.py`). Until delivery every surface
shows a neutral "Artwork pending" tile, never a missing PNG URL.

D-444 replaces the architectural and household-object names/designs with the
machines listed above. Ozriel uses preservation/suppression/regeneration engines;
Ilvaris uses a supercharger, turbine and timing drive; Kaelith uses a rotary
harvester, rail accelerator and containment engine. All are luxurious integrated
machines with visible workings, saturated crimson crystals and pearlescent armor.
Stable IDs, Master eligibility, ownership, bonuses and native effects are unchanged.

## Follow-up answers

- **Shards of Calamity** are granted directly at victory, separately from the
  sealed chest, and saved in the same write as the chest.
- **Choir-Array of Branded Stars:** the +50% Skill Power lasts until the end of
  the current turn. The trigger can fire at most 4 times per encounter.
- **Evolution amounts:** developer proposes Feather, Splinter and Fragment of
  Rise amounts in line with Soar/Delve costs; the owner will review them.
- Section 4 is implemented: all nine entries cost 100 Calamitic Tokens in the
  existing shop, have the approved +0..+5 values, and retain neutral placeholders
  pending delivery. Equip, transaction, account validation and fighter boundaries
  enforce no more than five Calamitic Conduits per character across all fourteen.
  Legacy equipment normalizes in memory by preserving the first five occupied
  Calamitic slots; loading never writes. The first successful account transaction
  persists schema v11. Shield reduction from Calamitic and other Shield effects
  combines additively and is capped at 80%. Choir triggers at most four times per
  encounter, stacks its Skill Power through the current turn, and grants Gauge.
  Rules14 restarts historical battles through the existing snapshot-preserving
  compatibility path. See [Conduits](conduits.md) and [Conduit catalog](conduit-catalog.txt).
- The owner asked for implementation in sections, with questions along the way.

### Gates of Oblivion roster (owner-approved)

- Elemental Dungeon structure: 10 single-form original Rise constructs across 25 floors, Lv.125->170, boss every 5th floor: Shardling Acolyte, Glassbound Sentry, Oblivion Lantern-Wraith, Fracture Hound, Unmade Choir Drone, Crimson Gearwyrm, Husk-Seraph of Rise, Annihilation Colossus Fragment, Fatebreaker Warden, Gatekeeper of Oblivion (final boss, floor 25).
- Mixed combat elements: each enemy gets one of the six elements.
- Each enemy has a named Calamity-style skill; floors 20+ add a second skill.
- Drops: Prismatica plus the Calamity chain (Seed/Bud floor 1, Bloom 4, Crest 9, Heart 14, Soul 19), level-scaled stacks like dungeons.
- Fragment of Rise: floors 20-25, about 10% per enemy; boss floors guarantee 1.
- No captures and no Null-Prismatica. Unlocks when the account owns any Calamitic Element-Bearer.

### Gates of Oblivion implementation (D-435 Section 2)

The activity is live as a 25-floor Calamitic-owned progression mode. `src/content/gates-of-oblivion.ts` defines the approved ten construct roster, mixed element assignments, unique lore and named skills, floor curve, and runtime loot table. It reuses shared enemy-stat growth, dungeon material ranges and Prismatica rules. Fragment rolls use their own persisted encounter stream; per-kill rewards, discovery and receipts commit atomically. Wallets without `oblivionStage` begin at Floor 1 without a read-time write. No art, capture or premium-currency assets or rewards are wired. Full behavior and validation are documented in [Gates of Oblivion](gates-of-oblivion.md). Calamitic Ascension/Shards are implemented in Section 3; the nine new Conduits are implemented in Section 4.
