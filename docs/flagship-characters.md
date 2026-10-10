# Playable flagship Element-Bearers

## Replacement portrait intake (D-134)

All42 portraits for these seven lines now use the new owner delivery, with
reviewed background removal and per-form facing. Canonical runtime IDs still
serve all menus, archives, showcases, battle and cut-ins. Original D-121 sources
and previous exports remain preserved; new originals/hashes/settings live in
[replacement provenance](../Art/provenance/character-refresh-intake.json).
[Workflow and tests](art-workflow.md#replacement-character-portraits-d-134)
cover regeneration and transparent margins. Owner confirms the unnamed
hammer-wielder image is Bruno's base. No gameplay/ownership/save changes.

## Confirmed scope (D-121/D-122)

The seven supplied flagship lines are playable, with six Common-to-Omnic
forms each. Fixed stars remain independent of form rarity:

| Element-Bearer | Combat element | Role | Stars | Standard tier |
| --- | --- | --- | --- | --- |
| Atmoso | Atmospheric | DPS, wind staff | 5 | 1% total five-star tier |
| Bruno | Tectonic | Tank, stone hammer | 5 | 1% total five-star tier |
| Elise | Voltaic | DPS, two four-point shuriken | 5 | 1% total five-star tier |
| Aurora | Luminous | Enemy-debuff Support, empty-hand casting | 6 | 0.1% total six-star tier |
| Bliss | Tranquilitic | DPS, paired feather fans | 6 | 0.1% total six-star tier |
| Disciple | Chaotic | Ally-buff Support, empty-hand casting | 6 | 0.1% total six-star tier |
| Razor | Ominous | Tank, one night sword | 6 | 0.1% total six-star tier |

The original Infernis/Tizu/Flora opening choices are unchanged. No automatic
ownership, free summon income, save migration, retroactive spending or equipment.
Roses characters remain in their separate banner. Standard now has22 outcomes:
six five-star EBs sharing1%, four six-stars sharing0.1%, and twelve creatures
sharing98.9% with the existing50:30:17 tier weights. See
[exact economy and pity](summoning-and-economy.md).

Existing Standard pity counters are preserved without load writes or resets.
Its highest authored tier is now six-star, so five-star awards advance both
counters; natural six-stars reset200 and newly owned six-stars reset both.
Draw price, atomic transaction and Lv.50 Treasury duplicate conversion remain.

## Intrinsic dynamic kits (D-170)

The owner resumes all seven Standard flagships in the full-roster phased redesign.
Atmoso banks Gale Cadence, Aurora chooses Precision versus per-target Verdict
detonation, Bliss chooses charge-fueled damage versus her existing shield payoff,
Bruno converts effective protection into Bedrock, Disciple builds Concord through
sourced team-buff damage, Elise alternates ordinary skills for Storm Rhythm and
Razor banks Night Resolve from Defense.
[Exact stack triggers, bounded choices and tests](character-kit-rework.md#standard-flagship-loops-d-170).
Original skill names, targets, stats, costs, cooldowns and Last Flare recovery
remain. The following first-pass coefficients are preserved; D-170 adds fixed
resource payoffs around them, with total Disciple attack buff bounded at65%.

## Implemented content and first-pass tuning

[Flagship catalog](../src/content/flagships.ts) owns identities, six title
prefixes, original narrative flavor, base stats, three skills and six icon IDs.
[Shared roster](../src/content/starters.ts) expands the canonical owned-ID
validation; opening availability remains separate.

Numerical kits and narrative flavor are developer-authored first-pass tuning,
not owner-specified balance or approved final lore. DPS lines emphasize single-
target and area attacks; Bliss/Elise add bounded critical bonuses. Bruno/Razor
refresh team shields and weaken foes. Aurora applies real two-enemy-phase
weakening, capped at50% by shared potency growth. Their named visual symbols
do not introduce new equipment or unimplemented mechanics.

Disciple's three skills empower every living ally, including captured squad
members, with20%/30%/40% base outgoing attack damage and optional20/40 shield.
Thoughtspark also delivers a150% single-target psychic attack, so the Support
can contribute damage as well as empower allies. The attack increase scales
with bounded potency, capped at50%. It affects
normal/skill/ultimate attack damage, not burns, healing or shields. It is
multiplicative with the existing low-health passive and occurs before defense
and combat rounding. Buffs refresh through the current and next player turns;
the stronger existing value wins, they never stack, and dead allies get neither
buff nor shield. Last Flare still costs100 Gauge and forces next-turn recovery.

Optional per-combatant `attackBoost` snapshots fraction/expiry round and D-170
source provenance in the
resolved battle state. Cloning and Settings preserve it; new player turns expire
it, Adventure Continue advances its lifetime, and separate dungeon stages reset
it with health/cooldowns. Structured status events retain the actual application;
the Battle menu displays the current increase and expiry. No account buff save,
new RNG, reward change or stage auto-advance.

All seven reuse ordinary elemental leveling/evolution costs, six caps
30/45/60/75/90/105, fractional growth, matching Heaven/Abyss fodder and existing
Conduit unlocks. Ownership, squads, Archives, Character, field art and portrait
cut-ins use shared resolvers. Current Archive size is78 EB evolution cards plus
30 fixed captured forms,108 total. Unowned/unreached portraits stay silhouettes.

## Artwork and preservation

Each12-image phase archives original bytes beneath
`Art/source/roster-intake/<character>` and installs six960px portraits plus
six256px action icons. Seven `Art/<character>-art-intake.json` manifests record
hashes, reviewed keys/opening seeds/frame cleanup and42 facing directions.
All sources stay unflipped; presentation mirrors images only.

Warm/overlapping palettes use border-connected RGB-distance keys and reviewed
enclosed-background seeds, preserving skin, basalt, gold and pale wings.
Disciple/Razor use individually reviewed hue keys. Thin accidental exterior
source frames are removed only in reviewed assets; decorative passive frames,
Bliss's skill2 teal backplate and painted shadows remain. Transparent supplied
alpha always bypasses all key/frame removal. No runtime keying.

Together with Roses, the intake covers135 assets. Root originals are removed
only after archival hashes, runtime registration, visual review and validation.
[Art workflow](art-workflow.md#phased-rosterevent-delivery-d-121) owns commands.
Prompt bodies and standalone weapon concepts are unchanged; no weapon images
were supplied, so no missing weapon PNG requests are added.

## Validation and remaining review

- [Flagship integration tests](../src/game/flagships.test.ts): authored stars,
  opening restrictions, all art/actions, atomic acquisition/failure/duplicates,
  existing progress preservation, progression, squads, gear, every activity
  snapshot/Continue and actual buff damage/expiry/refresh/dead-ally protection.
- [Pity tests](../src/game/banner-pity.test.ts): equal four-entry guarantees,
  natural resets,500 priority/unowned/all-owned fallback, five-star advancement,
  preserved counters and independent five-star-only pure resolver fixtures.
- [Art intake tests](../tools/test_roster_art_intake.py): all135 source/runtime
  hashes, alpha/padding, warm skin/stone and pale-wing retention thresholds,
  exterior outline scope, authoritative-alpha bypass and facing registration.

Run `npm test` and the existing Build Last Light task. Run
`python -m unittest discover -s tools -p test_roster_art_intake.py`.
Browser previews must not replace or write the player's save; verify actual
asset loading and mobile layouts with synthetic account/session data.
Production balance playtests and owner review of first-pass narrative/kits
remain; no payments, backend, signature-weapon equipment or new upgrade tracks.
