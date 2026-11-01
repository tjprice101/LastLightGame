# Phase 0: Everything Calamity (D-435) — APPROVED DESIGN, NOT IMPLEMENTED

Status: owner answered four question rounds on 2026-11-01. This is the
confirmed design contract. **No runtime code, saves or art exist yet.** The
owner may still rewrite parts of the phase; update this file first.

## Confirmed by the owner

- New **Calamitic** character rarity above Omnic: black and white with a deep
  crimson shimmer. (Calamitic already exists as a Conduit rarity in
  `src/content/rarity.ts`; this phase extends it to characters and materials.)
- Three 7-star Element-Bearers: one DPS (Attacker), one Tank, one Support.
- Each has six forms, starting at **Uncommon** (Evo 1) and ending at
  **Calamitic** (Evo 6): Uncommon → Rare → Epic → Legendary → Omnic → Calamitic.
- They keep normal elements.
- They should be very strong, but not stupidly broken.
- Each EX+1 / EX+2 / EX+3 tier awards its own character. Clearing any EX+Y
  stage has a 10% chance to award that tier's character at Evo 1.
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
- **Passive: Reality Fault.** +75% Skill Power and +5% Skill Critical Rate. Kaelith's direct hits add 1 **Fault** to the target (cap 3). Each Fault makes that enemy take +10% more damage from Kaelith and Squad Members (max +30%).
- **Skill 1: Shatterfall.** 456% damage to all enemies and add 1 Fault on each.
- **Skill 2: Glass Meridian.** 365% damage to one enemy. Consumes the target's Faults for +20% damage each.
- **Last Flare: Denial of Fate.** 360% damage to all enemies. Faults are kept. Recover next turn.

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
- **Skill 1: Pane of Absolution.** 240% damage to one enemy and 50% Weaken for two enemy phases.
- **Skill 2: Cathedral of Shards.** Shield 90 to every living ally. It lasts until broken and stacks (D-434).
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
- **Skill 2: Hymn of Broken Glass.** Heals every living ally 35% of max Health and gives them +45% Critical Damage Multiplier and 50% Skill Power for 2 turns. On multiple casts, the Healing is applied 
multiple times and the Direct Attack buff refreshes. 
- **Last Flare: Tomorrow, Unwritten.** 440% damage to all enemies. Heals all allies 50% of max Health and gives them +10% Elemental Gauge. Recover next turn.

**Form titles:** First Unsung Note → Cantor of Cracked Heavens → Choir-Seraph of the Glass Vault → Herald of the Unwritten Hymn → Sovereign of the Severed Prophecy → The Song That Defied Fate

## Art direction (Midjourney-ready wording)

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
- **Calamitic Ascension** (below) instantly raises a character to **Lv.115**:
  - an ordinary Element-Bearer goes from Omnic Lv.105 to 115;
  - a Calamitic Element-Bearer goes from Calamitic Lv.110 to 115.

## Acquisition

- Each EX tier owns one character: EX+1 Ozriel, EX+2 Ilvaris, EX+3 Kaelith.
- Every saved victory at that EX tier, in any of the 12 Calamity activities,
  has an independent **10%** chance to award that tier's character at Evo 1
  (Uncommon, Lv.0).
- **Stop rolling once owned:** an owned character is never re-rolled and
  gives no duplicate conversion.
- The roll needs its own seeded RNG, so existing chest, combat and reward
  rolls are unchanged. It is saved in the same write as the victory.

## Evolution materials

Every evolution costs the character's normal elemental Prismatica and
material recipe, **plus both** new chest materials:

| Source | Material | EX+1 / EX+2 / EX+3 chest |
|---|---|---|
| Soar to Heaven Calamity chests | Feather of the Severed Dawn | 1 / 2 / 3 |
| Delve into the Abyss Calamity chests | Splinter of the Unmade Night | 1 / 2 / 3 |

- The Omnic → Calamitic step also requires **Fragment of Rise**.
- Per-evolution amounts are developer tuning, still to be proposed.
- Chest specialty reduction: the owner states this has already happened, so
  there is no further 55% cut.

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
1. **Ascend** (25 Shards): all stats +50%, and the character jumps to Lv.115.
2. **Imbue** Skill 1, Skill 2 and Last Flare separately, 25 Shards each. Each
   needs step 1 first and gives that ability +50% base Skill Power and
   +5% Skill Efficiency. The existing 50% Skill Efficiency cap still applies.

Full cost: 100 Shards per character.

**Rise-blessed presentation:** an ascended character's name gains the suffix
", Rise-blessed" (example: "Infernis, Rise-blessed"). An ornate, mechanical
Calamity crown-burst emblem sits beside their Element Medal. The emblem art is
prompt-only until delivered.

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

## Still to decide before implementation

- Exact per-evolution amounts of Feather, Splinter and Fragment of Rise, and
  the Gates chain leveling costs.
- Where Shards are delivered: inside the sealed chest, like Tokens, or
  directly at victory.
- Durations for item 7's buffs, and whether item 6's bonus stacks with Weaken.
- Gates enemy identities and the full art prompt list: 18 character portraits,
  ability icons, Gates enemies/arena, 3 materials, Fragment of Rise, Shard,
  Rise-blessed emblem and 9 Conduits.
