# Phase 1 proposal: new Elemental War Element-Bearers and role perks

**Status: PROPOSAL (outline stage), nothing implemented.** Owner answered the
first question round on 2026-11-01; this revision shows design outlines and the
role-perk/Resonance approach for review before any code or numbers are final.

## Confirmed by the owner

- Slots: **Infernic Tank, Tranquilitic Tank, Botanic Attacker.**
- Three Master Conduits (Omnic) per character, like existing characters.
- No hidden same-element bonuses inside kits. Instead, a visible squad-wide
  **Element Resonance** shown in the Squad/Team menu (below).
- Implementation order: role perks, then characters, Conduits, art.
- Balance: if the new perks make the roster far too strong, retune enemies
  slightly; otherwise let players feel stronger.
- Role perks for Calamitic characters only if they fit smoothly; show the idea first.

## Role gaps (current roster; Calamitic in brackets)

| Element | Tank | Attacker | Support |
| --- | --- | --- | --- |
| Infernic | **Caldrex (new)** | Infernis | none |
| Oceanic | Tizu | Nerithe | none |
| Botanic | Bruno, Orvella | **Myrthen (new)** | Flora |
| Tranquilitic | **Solenne (new)**, [Ozriel] | Rosetta, Bliss | Aurora |
| Atmospheric | none | Atmoso, Elise, Vaelor | [Ilvaris] |
| Chaotic | Thornia, Razor | Crinso, [Kaelith] | Disciple |

Note: Tizu is currently a **Tank** in game data (shields and Weaken). The owner
described him as Oceanic support; see the open question below.

## Shared rules (same as Nerithe / Orvella / Vaelor)

6-star, six forms Common to Omnic, same caps and material costs. Each has its
own Elemental War trial: 10 stages Lv.90 to 140 against that character's six
forms, stage 10 guarantees recruitment, owned results convert to 100
Null-Prismatica. Shields last until broken and stack.

## Character outlines

Visual direction for all three: compact gacha anime renderer, completely solid
backgrounds with ample edge margins, base form simply equipped, then
escalating into very detailed, ornate full prismatic armor and a large
signature structure that no existing character has. Each has a weapon type no
other character uses.

### Caldrex, Kiln Warden (Infernic Tank)

- **Look:** a walking forge-cathedral. Obsidian and brass plate with
  molten-glass window panels, hanging forge-chain mantle, back-mounted chimney
  spires that grow into a full furnace cathedral by Omnic. Palette: obsidian,
  brass, molten orange, white-hot gold, ash white.
- **Weapon:** two colossal forge gauntlets that lock together into a
  furnace-gate shield.
- **Play pattern:** gets stronger the more he is hit. Hits on him build Heat
  (max 3). He shields the squad, draws enemy attacks, and spends Heat on a
  Burning area strike. His Last Flare shields everyone and boosts Burn damage
  from every ally.
- **Master Conduits:** more Heat and Defense per Heat; returning damage and
  Burn to attackers forced to target him; Burn ticks from any ally healing the
  weakest ally.

### Solenne, Moonbell Abbess (Tranquilitic Tank)

- **Look:** a meditative temple guardian. Lotus-petal armor in moon silver and
  rose pearl, floating circular moon-gate halos, a mantle of layered cloud
  ribbons; by Omnic a full floating temple of moon-gates and lotus tiers
  behind her. Palette: moon silver, lilac, rose pearl, ink black, gold leaf.
- **Weapon:** a large bronze-and-pearl temple bell carried on chains, used as
  her shield; she rings it to call enemies to her. (Distinct from Ozriel's
  tower shield and halberd.)
- **Play pattern:** rewards patience. Using Defense builds Stillness (max 4);
  while she has Stillness, hits against her are reduced and spend it. Her
  Skills ring the bell to pull enemy attacks onto her, shield the whole squad
  and Weaken enemies. Her Last Flare cashes in all Stillness for squad shields
  and area damage.
- **Master Conduits:** larger Stillness reduction; bell rings also shield the
  lowest-Health ally; spending Stillness grants squad Gauge.

### Myrthen, Season Reaper (Botanic Attacker)

- **Look:** a harvest duelist with wings made of the four seasons (spring
  blossom, summer leaf, autumn amber, winter frost), bark-and-jade armor with
  growth-ring engraving; by Omnic a rotating orchard crown and a seasonal leaf
  storm. Palette: jade, bark brown, blossom pink, amber, frost white.
- **Weapon:** twin chained sickles.
- **Play pattern:** a three-step damage cycle. Each Skill advances the season
  (Sprout, Bloom, Harvest). At Harvest the next Skill or Last Flare hits much
  harder and ignores part of the target's Defense, then the cycle restarts.
  Her single-target Skill marks the enemy so the whole squad deals more damage
  to it (counts as a Mark for Calamitic Conduits).
- **Master Conduits:** stronger Harvest that keeps one season; the mark jumps
  to a new enemy when the marked enemy dies; kills heal the squad and grant Gauge.

Exact numbers and ability names are drafted after outline approval.

## Element Resonance (replaces Kinship)

- Count the squad's **Element-Bearers** by combat element (captured
  Elemental-Devourers do not count).
- Two Element-Bearers of the same element: every squad member gets **+25%
  Skill Power**. Three of the same element: **+75% Skill Power**.
- Applies in every battle mode, uses the frozen run snapshot, and is shown in
  the Squad/Team menu as a labeled badge (e.g. "Infernic Resonance: +25%
  Skill Power") and in the Battle menu status list.

## Role perks: how they slot in

Each role perk is a fixed innate bonus shown as its own row under the passive
in Character details and Battle menu (e.g. "Tank: enemies target this
character more often; +50% Defense"), plus a small role badge on character
cards. It is applied in the shared stat resolver, so every mode and saved
battle snapshot uses the same values.

| Role | Characters | Perk |
| --- | --- | --- |
| Tank | Tizu, Bruno, Razor, Thornia, Orvella, Caldrex, Solenne, [Ozriel] | 25% more likely to be targeted; +50% Defense |
| Attacker | Infernis, Rosetta, Crinso, Atmoso, Bliss, Elise, Nerithe, Vaelor, Myrthen, [Kaelith] | +100% Direct Damage; +50% Skill Power |
| Support | Flora, Aurora, Disciple, [Ilvaris] | Each Skill / Last Flare heals all squad members 4% max Health; +50% Health; +25% Skill Power |

- **Targeting:** enemies keep one random target roll; a Tank simply counts as
  1.25 entries in that roll. Taunts and Calamity targeting patterns still win.
- **Calamitic characters:** they get the same perks with no special case.
  This is the smoothest option because the perk is attached to the role, not
  the rarity; Calamitic power stays distinct through their stats, kits,
  Ascension and Calamitic Conduits.
- **Balance check:** after implementing, rerun the D-404 benchmark experiments.
  If clear rates jump far beyond target, apply a small shared enemy Health
  increase rather than per-mode edits.

## Art (prompt-only until delivery)

Per character: 6 portraits, 4 ability icons, 3 Master Conduit icons. Per
trial: 3:1 header and 16:9 arena. 45 prompts total, reproducible tool and tests.

## Open owner questions

1. Tizu: keep him as a Tank, or reclassify him as Support (he would then get
   the Support perk instead of the Tank perk)?
2. Approve the three outlines and the role-perk/Resonance approach above?
