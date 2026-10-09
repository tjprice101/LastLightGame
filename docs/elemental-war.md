# Elemental War

## Status: all three characters and trials implemented (D-152/D-156)

After the original design-first request (D-145), the owner supplied both
six-form portrait/icon sets and explicitly approved implementing their playable
characters and Elemental War activities using the baseline below.
**Nerithe is implemented** after the owner supplied her artwork and approved
playable registration/trial using the same baseline and developer-tuned aquatic
kit. All three activity headers and arenas are installed. No War character
is in either summon pool. The family header, standalone weapons and Nerithe's
Normal Attack/Defense icons remain pending; no missing PNG URLs or substitutions.

## Confirmed requirements

- Elemental War is an endgame activity family with separate character-themed
  sub-modes, each with its own banner and presentation.
- Each sub-mode pits the squad against one new Element-Bearer across that
  character's six evolution forms, distributed over **10 stages**.
- Stage1 begins at **Lv.90**; stage10 ends at **Lv.140**.
- Defeating the final, highest boss grants a **1% chance** to acquire that
  Element-Bearer's **base form as a playable character**.
- Every boss victory grants Prismatica; Null-Prismatica has a separate chance,
  as selected by the owner. No materials, creatures, Conduits, components,
  event tokens or extra clear rewards.
- A successful final-boss recruitment roll for an already-owned Element-Bearer
  converts into **existing currency**, as selected by the owner.
- Banners are **activity-header artwork only**, as confirmed by the owner;
  character recruitment comes through the final boss, not a summon banner.
- Design three original Element-Bearers: **two female, one male**, each tied to
  a canonical element, uniquely imposing through all six forms.
- Use the established compact anime/cel renderer, eyes-only faces, actual
  approved style references and complete-design edge clearance. Late forms
  emphasize immense elemental architecture around the same small human.

## Character roster

All three names, six-star ratings, forms and kit identities are
approved and registered, bringing the playable registry to16 Element-Bearers.
The original design descriptions below
are retained as prompt concepts, not instructions to repaint supplied artwork.
Actual Nerithe uses the supplied dark coat/armor, long blue-violet hair,
red accents and surveyor trident. Actual Orvella uses the supplied crystal mace and long dark hair; actual
Vaelor uses the supplied resonance blade. Canonical elements do not change
to match incidental source-art effects.

| Element-Bearer | Identity | Canonical element | Sub-mode | Design signature |
| --- | --- | --- | --- | --- |
| Nerithe | Female; approved6-star tactical attacker | Aquatic / Water | The Sea Without a Shore | Supplied surveyor trident, dark naval armor and layered currents; original cartographer concept retained below |
| Orvella | Female; approved6-star tank/support | Tectonic / Earth | The Throne Beneath the World | Supplied crystal mace, stone/geode architecture; original scepter concept retained below |
| Vaelor | Male; approved6-star burst attacker | Voltaic / Electricity | The Sky's Final Chord | Supplied resonance blade, capacitors and thunder architecture; original polearm concept retained below |

No rose motifs, reused starter silhouettes, generic angel wings or new affinity
types. All three remain recognizably human at every form. Their boss and eventual
playable illustrations share one six-form line; no separate monster mutation.

### Nerithe: water as pressure, geometry and navigation

**Identity:** ink-blue hair gathered into a side coil, amber eyes, ivory survey
coat and brass tide-compass motifs. She maps lost currents rather than ruling
a conventional underwater kingdom. Weapon: one connected surveyor's trident
with a circular measuring guard, three clear tines and a functional grip.
Palette: ink blue, turquoise, ivory, brass and restrained coral.

| Evo. | Rarity | Proposed canonical name | Transformation |
| --- | --- | --- | --- |
| 1 | Common | Uncharted Tide, Nerithe | Survey coat, small compass disk, simple trident; determined maritime scout |
| 2 | Uncommon | Current Surveyor, Nerithe | Fitted tide plates, asymmetrical chart cape, paired opaque current arcs |
| 3 | Rare | Keeper of the Spiral Sea, Nerithe | Nautilus shoulder shell, fin greaves, layered spiral tide fan |
| 4 | Epic | Admiral of the Folded Ocean, Nerithe | Broad articulated chart armor, folding sea-map wings and pressure-dial arches |
| 5 | Legendary | Sovereign of the Abyssal Meridian, Nerithe | Monumental nautilus vaults, interlocked tide terraces, chromatic survey weapon |
| 6 | Omnic | The Sea Without a Shore, Nerithe | Retains Legendary regalia inside multiple immense folded-ocean crowns and interwoven tide walls; body is a small focal anchor |

Implemented first-pass kit (developer tuning): **Uncharted Current** adds
5 Gauge to her own Normal Attack only, fixed at every level/form and capped by
ordinary Gauge capacity. **Meridian Break** deals170% single-target damage and
20% Weaken for two enemy phases (cooldown2); **Fold the Sea** deals130% area
damage and15% Weaken for two enemy phases (cooldown3); **Ocean Beyond the Map**
deals300% area damage and30% Weaken for two enemy phases, with ordinary Last
Flare recovery. Damage/Weaken follow existing growth/potency bounds.
Normal: **Surveyor's Thrust**. Defense: **Charted Shelter**. Both actions
remain fully playable but text-only until their icons arrive. Her passive is
part of the run kit snapshot; no ally/enemy Gauge bonus or free turn advance.

### Orvella: earth as architecture, compression and precision

**Identity:** cropped obsidian hair, copper eyes, slate builder's mantle,
ivory foundation plates and red-jasper seam motifs. She hears stresses within
stone and assembles impossible vaults without becoming a rock creature.
Weapon: one connected plumbline scepter with a physical hanging keystone
inside its open triangular head, no giant hammer or extra weapon.
Palette: slate, ivory, copper, jasper red and violet geode facets.

| Evo. | Rarity | Proposed canonical name | Transformation |
| --- | --- | --- | --- |
| 1 | Common | First Foundation, Orvella | Builder's mantle, stone wrist guard, modest triangular keystone scepter |
| 2 | Uncommon | Mason of the Faultline, Orvella | Fitted segmented plates, wedge shoulder, two suspended masonry slabs |
| 3 | Rare | Keeper of the Buried Vault, Orvella | Geode pauldrons, tessellated apron armor, interlocking stone fan |
| 4 | Epic | Architect of the Moving Citadel, Orvella | Layered buttress armor, split vault arches and ordered keystone satellites |
| 5 | Legendary | Sovereign of the Deep Foundations, Orvella | Monumental geode vault, stepped fault columns and monumental suspended scepter |
| 6 | Omnic | The Throne Beneath the World, Orvella | Retains Legendary vault/weapon within immense nested foundation crowns and tessellated plate walls; human sits at the structural heart |

Proposed kit: **Load-Bearing Will** passive rewards sustained defense;
**Keystone Reversal** is a guarded retaliation; **Raise the Faultline** protects
the squad while striking a target; **Worldweight Citadel** is a protective area
Last Flare. Normal: **Plumbline Strike**. Defense: **Foundation Brace**.
Implemented first-pass tuning uses existing damage, Weaken and squad-shield
effects: +10 base Defense passive; Skill1 160% damage/25% Weaken for two
enemy phases (cooldown2); Skill2 40 squad shield (cooldown3); Last Flare
260% area damage/65 squad shield plus the ordinary recovery turn.
No new counter, taunt or retaliation engine. Potency/growth follow shared rules.

### Vaelor: electricity as resonance, rhythm and stored force

**Identity:** swept silver hair with a single navy streak, violet eyes, cobalt
conductor's coat, copper braces and repeated fork-shaped clasps. He conducts
thunder through tuned machinery rather than wielding a conventional lightning
sword. Weapon: one connected long tuning-fork polearm with two equal prongs,
a clear crossbrace and visible grip. Palette: cobalt, ivory, copper, violet
and sharply bounded electric-cyan zigzags.

| Evo. | Rarity | Proposed canonical name | Transformation |
| --- | --- | --- | --- |
| 1 | Common | Quiet Voltage, Vaelor | Short conductor's coat, simple fork polearm and one small resonator disk |
| 2 | Uncommon | Keeper of the Stormbeat, Vaelor | Fitted capacitor cuffs, split coat tails and paired angular lightning strokes |
| 3 | Rare | Marshal of the Thunder Choir, Vaelor | Resonator pauldrons, armored boots and a broad fork-comb rear fan |
| 4 | Epic | Conductor of the Broken Sky, Vaelor | Layered capacitor armor, giant resonator braces and staggered lightning staves |
| 5 | Legendary | Sovereign of the Final Frequency, Vaelor | Towering fork arrays, drum capacitors and diagonal electric-cyan stave lattice |
| 6 | Omnic | The Sky's Final Chord, Vaelor | Retains Legendary arrays/polearm amid massive overlapping resonator crowns, capacitor drums and jagged thunder architecture |

Proposed kit: **Standing Thunder** passive represents stored resonance;
**Forked Cadence** is a focused double impact; **Resonance Cascade** is an area
electrical sequence; **Last Chord of the Sky** is the burst Last Flare.
Normal: **Tuning Strike**. Defense: **Insulated Stance**.
Implemented first-pass tuning: +25% low-health damage passive; Skill1 180%
damage/+20 percentage-point critical chance (cooldown2); Skill2 140% area
damage (cooldown3); Last Flare 330% area damage plus ordinary recovery.
No extra turns, stun or stored-charge mechanic. Numbers are developer tuning
within the approved kit identities, not additional owner-defined mechanics.

## Approved encounter schedule

One boss and no ordinary adds per stage; same schedule in each sub-mode.
Level interpolation: `round(90 + 50 * (stage - 1) / 9)`.
Repeated forms get stronger levels/kit pressure, not duplicate art generations.
Stages are not six phases in a single encounter.

| Stage | Level | Form | Rarity | Recruitment |
| --- | --- | --- | --- | --- |
| 1 | 90 | Evo.1 | Common | None |
| 2 | 96 | Evo.1 | Common | None |
| 3 | 101 | Evo.2 | Uncommon | None |
| 4 | 107 | Evo.2 | Uncommon | None |
| 5 | 112 | Evo.3 | Rare | None |
| 6 | 118 | Evo.3 | Rare | None |
| 7 | 123 | Evo.4 | Epic | None |
| 8 | 129 | Evo.4 | Epic | None |
| 9 | 134 | Evo.5 | Legendary | None |
| 10 | 140 | Evo.6 | Omnic | Independent1% base-form recruitment |

Approved entry: saved1-3-member squad, sequential per-sub-mode unlocks, no entry
currency fee, stage10 replayable. Continue remains manual. Bosses should reuse
the approved Lv.140 curve extension, not arbitrary account-scaled stats.
Their playable versions retain existing character caps/cost rules unless
explicitly approved otherwise; boss level140 never implies playable level140.
All three characters use ordinary matching-element progression recipes and the
element's associated Heaven/Abyss specialties and explicit evolution fodder.
Caps remain30/45/60/75/90/105. No retroactive costs or auto-granted materials.
Every boss uses its authored Skill1 every2 turns and ultimate every6 turns;
the ultimate replaces a due primary attack. Boss140 HP is1,183,360.

## Approved currency tuning

With `t = (stage - 1) / 9`:

- Guaranteed Prismatica, uniform integer quantity from
  `round(1500 + 3500*t*t)` to `round(2500 + 5500*t*t)`.
  Stage1:1500-2500; stage10:5000-8000.
- Independent Null-Prismatica chance `0.30 + 0.30*t`.
  A success grants `round(1 + 4*t)`.
  Stage1:30% for1; stage10:60% for5.
- Final boss alone separately rolls `0.01` recruitment, regardless of currency
  outcomes. No recruitment pity; the chance never rises after failed attempts.
- Approved owned-result conversion: **100 Null-Prismatica**, only on a successful
 1% roll, instead of another character/copy.
- No first-clear bonus, bonus currency roll, materials, captures of creatures,
  Conduits, BMC, tokens, equipment or auto-equip.

The two currencies and recruitment/duplicate conversion must be one validated,
receipt-deduplicated reward transaction. Separate RNG streams prevent a new
recruitment roll from shifting combat/currency results. A stage10 defeat,
quit before victory, failed save or replayed receipt grants no extra recruitment.
New ownership is the canonical EB record at **Lv.0/Evo.1/weapon0, unequipped**
(implemented acquisition behavior), not a Lv.140 captured-creature UUID.
Owned-result resolution rereads ownership before the transaction commits.
Reject balance overflow/storage errors atomically; never grant only part.

## Banners, artwork and discovery

Here **banner** means the sub-mode's activity header/artpiece, not a new paid
or Null-Prismatica summon banner, as explicitly confirmed by the owner.
Do not add any summon pool/pity/price from this design.

- One family3:1 banner; each sub-mode gets its own3:1 header and16:9 arena.
- Each character pack has six4:3 full-body portraits, six1:1 action/ability
  icons and one3:2 signature weapon. Same portraits serve enemy bosses and
  eventual playable forms with reviewed side-facing metadata.
- Character discovery/recruitment must not prematurely reveal unowned
  playable Archive art. Ownership reveals base; subsequent evolution reveals
  reached forms as usual. Human bosses are not registered as creatures, and
  merely fighting them reveals no playable forms or Creature entries.
- No missing PNG requests: eventual runtime registration uses explicit
  art-pending states until delivery/intake. Proposed asset IDs are not URLs.
- Ability icon names/headings remain outside image prose; no text in images.
- Scenery is full-bleed. Cutouts keep all equipment/effect tips clear of every
  edge without reducing design. Only character/enemy portraits use mapped
  references at400; icons, weapons, banners and arenas use no reference flags (D-147).

Art packs:
[family banner](../Art/ui/Elemental%20War.md),
[Nerithe](../Art/characters/Nerithe%20Art.md),
[Orvella](../Art/characters/Orvella%20Art.md),
[Vaelor](../Art/characters/Vaelor%20Art.md).
Each prompt is copy-ready. Only portraits include a real approved reference; signed reference
URLs may expire, so retain the approved source and obtain renewed URLs from
the owner instead of inventing replacements. Style references guide rendering,
not copying the reference character's identity, equipment or palette.

## Implementation and remaining scope

`content/elemental-war.ts` owns encounters/drop tuning; `war-characters.ts`
owns the three definitions, titles and supported kits. Separate BattleState.war
avoids all infusion creature/material reward assumptions. Currency, premium
and recruitment RNG are independent; Continue preserves each stream and
the saved squad/progress/gear/captured-instance snapshots and each Gauge.
Replay uses a new run ID/seed; Settings never rebuilds the encounter.

Optional version3 `wallet.warStages` stores independent1-10 unlocks by
`nerithe`/`orvella`/`vaelor`. Missing legacy values read as1 without writes.
Account reward validation checks the exact dead boss/character/form/level/
stage, unlocked entry, legal currency ranges and final-only recruitment;
rejects unrelated reward fields and forged presentation outcomes.
One atomic write commits balances, ownership/duplicate conversion, next-stage
unlock and receipt. Actual new/duplicate presentation is attached only after
that save succeeds. Failed saves/overflow preserve the encounter and account;
receipt replay cannot grant another reward. Summon prices/odds/pity are unchanged.

All three characters and their activity headers/arenas are installed. The
family header, standalone weapons and Nerithe Normal Attack/Defense icons
remain absent. Supplied sources are byte-preserved under
`Art/source/elemental-war`;40 exports (18 portraits,16 icons,6 scenery) and
source-specific settings/hashes live in the intake manifest. Scenery is
copied byte-for-byte without keying/cropping/resizing. The incoming
`Valor Activity Banner.png` maps to Vaelor; the original filename stays in
provenance, not a character rename.
Future generated replacements still require manual visual review.

## Validation

Design validation:
`python -m unittest discover -s tools -p test_elemental_war_art.py`.
Checks46 prompts (18 portraits,18 icons,3 weapons,3 headers,3 arenas,1 family
header), exact reference mapping/weights, one flag set, renderer/identity,
edge clearance/no-glow cutouts and implemented/proposed status separation.

Review each six-form line at equal body scale, then at thumbnails: silhouette/
armor/weapon/power growth must be clear without increasing anatomical realism.
Inspect all four edges/corners and enclosed gaps; Omnic must retain Legendary
construction and add dense layers, not merely a larger ring. Review ability
icons as compact symbols, scenery as readable battlefields, and mirror stance
for enemy/right and ally/left before intake.

`python -m unittest discover -s tools -p test_elemental_war_intake.py` checks
40 original/export hashes, exact reproduction, transparent960/256 sizing/
padding, individual gaps/preserved foreground, authoritative-alpha bypass,
shared exporters, untouched full-bleed scenery and conflict preflight. Intake:
`python tools\intake_elemental_war_art.py --apply --remove-incoming`.

`npm test -- src\game\elemental-war.test.ts` tests all30 implemented boundaries,
all six forms,
both currencies and exact1% RNG boundary (`roll < .01`), no recruitment
on stages1-9, every failure/retry/receipt/owned-result path, atomic overflow,
legacy ownership, saved squads/gear/Gauge and Archive unlock behavior.
Injected RNG tests must verify actual outcomes, not approximate sampling rates.
Run `npm run build` and the registry/battle/account regression suites.
Browser acceptance: all three Gameplay entries and headers, sequential selectors,
same actual character art in boss fields/cut-ins, matching arena scenery, manual
Continue/final replay, locked Archive forms and all40 fetched/decodeable assets.
