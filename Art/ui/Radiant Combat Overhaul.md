# Radiant combat overhaul — consolidated art brief

**Consolidated art package, revised 2026-11-09.** This is the single
visual-scope reference for the Radiant overhaul. The owner now requests original
shop hosts, dialogue and a complete delivery brief, using the supplied third
image's portrait format. The six vendor identities and text interactions are
implemented in the existing shops; their portrait artwork has not been
delivered or installed. This revision supersedes the older
zero-new-source description for the newly requested vendor feature only.
It does not approve hidden-content release, paid generation or deployment. Mechanics
and exact bearer/Master assignments belong to the
[system specification](../../docs/Future%20Plans/radiant-combat-system-specification.md).
Count **one accepted original source image** once, regardless of crops, exports,
animation or reuse.

## What is actually requested

| Classification | New owner-delivered source images | Disposition |
| --- | ---: | --- |
| New vendor package | **6 proposed original portraits** | One original knee-up cutout for each shop/service host below. The owner requested the designs; actual likenesses still need review and intake. |
| Optional environments | **2** | One cinematic Home scene and one shared Market scene. Neither is required for functional shops or combat. |
| Existing outstanding queues | **Not added to the overhaul count** | See the existing War and hidden-Sunshade plans below; retain their separate scope and do not duplicate or automatically order them. |
| Derived/engine work | **192 compact portrait derivatives completed; 0 additional original sources** | Formation templates, portrait controls, dialogue, gauges and all 32 bearers' four-tier VFX are implemented. Contact anchors and cinematic presentation still need owner and physical-device review. None requires new source images. |

**Delivery total for this package: six vendor sources; eight sources if both
optional environments are chosen.** No new enemy, playable-bearer, ability-icon,
Flare-tier, currency, frame or status set is added. Generate each source
independently, not a collage of this entire brief. One source serves all of
that vendor's shop appearances; no expression sheets or voice files are required.

The owner explicitly requests **no ability icons**. Do not generate replacement
ability, character, ordinary Conduit or personal Master art simply because
mechanics, effects or attunement change. Existing art remains available for
reuse, while irrelevant or undelivered ability art must not become a blocker.
The implemented 32-bearer study and its status/readout rules are documented in
the system specification and typed content; do not infer further commissions
from historical kit names or the separate pending-art queues.

The personal Gauge is now one procedural flowing-energy track with a brighter
second layer filling over the first; shared Eternal charge uses a matching
single track. Element colors, wave masks and stream highlights are CSS-only,
with static reduced-motion presentation. This adds **zero source images** and
does not expand the commissioning budget or imply owner visual acceptance.

## Screenshot comparison and corrected battle-composition target

The supplied battle reference is useful for **spatial hierarchy**, not a
license to copy Brave Frontier's assets, characters, chrome or proprietary
designs. The third image is a **format reference only**. All new identities,
costumes, props, palettes, dialogue and interface decoration must be original
Last Light work. Do not attach the reference NPC as an identity/style image
or invent a reference URL.

| Surface | Current Last Light screenshot | Difference visible in the battle reference | Last Light target |
| --- | --- | --- | --- |
| Enemy placement | Regular three-column/two-row cells, with large attached stat boxes | Unequal diagonal spacing and depth; sprites occupy the landscape without individual panels | Stable one-to-six-unit formation templates with ground anchors, not a visible card grid |
| Squad placement | Six equally sized, tightly overlapping full-art silhouettes in a rectangular block | An irregular near/far cluster with clear feet, scale and space for action | A staggered full-form squad with deliberate depth, silhouette clearance and a central travel lane |
| Grounding | Art looks arranged over scenery | Units share an implied ground plane | Per-source foot anchors, restrained contact shadows and depth sorting; preserve original art/facing |
| Enemy information | Every enemy gets a large name/Health/Shield card inside the field | The selected opponent has one prominent target bar outside the sprite cluster | One focused target strip with exact Health/Shield/name; lightweight local targeting/status cues, not six opaque field panels |
| Portrait controls | Small faces, long form titles, repeated member labels and dense stat tiles | Faces, Health and charge dominate the lower control deck | Larger face-led cards; keep exact Attack, Defense, Recovery, Health, statuses and flowing Gauge on each card in a compact readable arrangement |
| Overall hierarchy | The upper field competes with the lower dashboard | The battlefield is the scene; the lower deck is its controller | A visually dominant field, compact command deck and restrained shared-Eternal strip |

The repeated enemies in the first screenshot came from the earlier **six-card
DOM layout fixture**, not an authored live six-enemy encounter. That check
proved column capacity only. It did not prove formation choreography,
grounding, targeting or multi-enemy combat presentation.

### Formation and control specification for implementation

- Keep enemies on the left and the saved squad on the right, facing each
  other through the canonical facing helper. Do not mirror whole panels.
  Preserve full current-form artwork; the portrait controls are separate.
- Author templates for one through six occupants on either side: solo focal
  anchor; diagonal pair; triangle; broken diamond; offset crescent; staggered
  six-unit chevron. Avoid equal rectangular rows. Pair front/back placements
  with modest depth scaling rather than shrinking every unit into a thumbnail.
- Place **ground/contact anchors**, not image-box centers. Measure each
  source's visible body and effect envelope separately: giant Omnic wings are
  not a foot anchor. Preserve authored hovering poses with an appropriate
  hover anchor. Keep complete silhouettes inside the field. Own-side overlap
  is intentional only when faces, signature equipment and targets remain clear.
- Leave an attack/impact lane between formations. Sort stationary units by
  ground depth; keep finite attack effects in the presentation layer.
  Never change stats, range, accuracy or targeting because a sprite is nearer.
- Use roster order and deterministic templates, not gameplay RNG. Vacated
  positions remain stable until the next encounter; defeat must not rearrange
  the surviving units under the pointer. The actual saved squad controls the
  allied formation, independently of opponent count. Bosses stay solo.
- The target strip describes the selected enemy, not the attacker. Clicking
  an enemy changes the target; clicking a squad portrait attacks immediately.
  Keep right-click Defense, 350ms hold plus 32px upward release for the highest
  ready Flare, and their existing keyboard alternatives. No member-selection,
  Kit or Actions button is reintroduced.
- On the desktop battle surface, aim for approximately 60% field, 28% portrait
  deck and 12% combined header/target/shared-Gauge chrome. These are composition
  targets, not a fixed-height clipping rule. Six shallow cards across suit
  landscape; wrap at narrower widths before reducing controls below 44px.
  Keep exact Attack, Defense and Recovery values on each portrait card,
  alongside Health, effects and Gauge; compress their layout rather than
  removing them. Long titles and stat tiles must not make faces unreadable.
- Attacks from another eligible member remain available after the preceding
  action's save, without waiting for its animation. Presentation may overlap;
  authoritative outcomes, resource spending and impacts remain ordered.
- The reference's Items and Auto areas do **not** establish those mechanics
  for Last Light. Retain the current Normal/Defense/Flare turn rules, shared
  Eternal charge, one-to-six enemies and saved reward receipts. A screenshot
  is not evidence about another game's hidden timing, RNG or transaction rules.

**Status:** the isolated Radiant field now uses deterministic staggered
templates and a focused target strip, with a temporary labeled impact readout
when the selected target changes before its saved hit plays. Authored one-,
three- and six-enemy browser fixtures, including a solo boss, have been checked;
those are local visual checks, not owner or physical-device acceptance.
The image-bottom anchor is shared, not a per-source foot/hover review. Continue
that review, final cinematic polish, cadence/GPU and touch validation without
ordering new formation artwork.

## Original shop hosts: cast, dialogue and six copy-ready portraits

The third supplied image is a **400 x 600 transparent, vertical 2:3 anime
portrait**: one expressive person, head through the upper legs, with costume
and hands visible rather than a tiny battlefield sprite. Use that presentation
format, not the pictured person's face, hair, uniform, pose or identity.
These are adult non-combatant NPCs; their natural portrait proportions are a
deliberate exception to the compact full-body Element-Bearer sprite format.
Each design below is original and proposed for owner review.

Generate **one image per prompt**, not a six-person collage. Keep the whole
head, hair, hands and props inside a clear background margin; an intentional
lower-leg crop near the knees is part of this portrait format. No scenery,
painted speech bubble, frame, writing or interface belongs in the cutout.
Illustrated powers and materials must be opaque and crisp, with painted
highlights rather than glow. A flat contrasting background fills exterior
and interior gaps for reviewed offline keying. If a delivered PNG already
has transparency, its alpha is authoritative. Inspect the actual output;
prompt wording cannot guarantee framing or a clean key.

Recommended delivery is one high-resolution 2:3 PNG per proposed filename,
ideally at least 1024 x 1536 if available. Preserve source bytes and review
the result before any runtime export. The filenames below are proposals, not
existing asset IDs or URLs. Portraits, voice acting and alternate expressions have **not** been supplied.
The shop hosts use neutral named portrait-pending tiles and text dialogue.

| Host | Existing destination | Character and visual signature | Proposed source |
| --- | --- | --- | --- |
| Mirel | Material Exchange | Patient, observant stockkeeper; sage apron, dark bob, ledger and jar | `vendor-mirel.png` |
| Veylin | Cosmetic Store | Playful, exacting designer; plum tailoring, silver braid and hand mirror | `vendor-veylin.png` |
| Torven | Ordinary Conduit Store | Enthusiastic, candid dealer; navy work coat and articulated mechanism | `vendor-torven.png` |
| Edda | Conduit Upgrade service | Experienced, dry-witted engineer; orange apron, high silver knot and wrench | `vendor-edda.png` |
| Sarev | Calamitic Conduits | Measured, reflective curator; ivory hair, black/ivory coat and crimson-seamed case | `vendor-sarev.png` |
| Nimra | Event Elemental-Devourers | Curious, gentle field guide; blue jacket, pale scarf and field notes | `vendor-nimra.png` |

These six hosts cover the five current shop destinations and the existing
upgrade service; they do not create six new shops. Sarev is a proposed
custodian, **not Rise** or a claim that either creator's soul has been found.
Nimra's dialogue does not imply a purchase automatically equips a creature.

### Mirel — Material Exchange

Mirel remembers what people came looking for, but never assumes what they own.
She is calm, practical and gently amused by overambitious packing lists.

- **Welcome:** "Welcome in. Tell me what you need, and we'll make a little room in your pack."
- **Idle 1:** "I sort these shelves by destination. The jars have other opinions."
- **Idle 2:** "Every label faces forward. The books refuse to cooperate."
- **Idle 3:** "A spare compartment is the closest thing to a good luck charm."
- **Inspect:** "Check the quantity as well as the material. The total is right beside it."
- **Event-material warning:** "This material belongs to an event family. Check whether you own an associated Element-Bearer before buying."
- **Saved purchase:** "Packed and accounted for. May it help on the road ahead."
- **Confirmed insufficient Prismatica:** "We're short of Prismatica for that order. Nothing was spent."
- **Cancel:** "No rush. I'll keep the shelves exactly as they are."

```text
Single adult woman merchant portrait, head to knees, warm deep-brown skin, hazel eyes and a neat dark moss-brown bob with one copper hairpin. She wears an ivory cross-neck blouse, a sage wrap apron with deep-teal quilted pockets, an umber belt and small copper clasps; she holds an open unlettered ledger and a small opaque frosted jar, with a patient, knowing smile. Refined anime linework, crisp cel shading, richly painted fabric folds, original fantasy game NPC illustration. Head, hair, hands and props fully visible with clear side and top margins; intentionally crop the legs near the knees. Plain flat saturated magenta background filling every gap --no scene, other people, text, lettering, logo, watermark, frame, extra arms, glow, photorealism, 3d render --ar 2:3 --niji 6 --s 100 --q 1
```

### Veylin — Cosmetic Store

Veylin sees presentation as a way to make someone's story recognizable, not a
way to make them stronger. Their dry little jokes soften a perfectionist streak.

- **Welcome:** "A good frame should introduce you, not shout over you."
- **Idle 1:** "I keep every offcut. Someday one of them will become the perfect finishing touch."
- **Idle 2:** "A frame doesn't need to be loud to be unforgettable."
- **Idle 3:** "I once spent an afternoon choosing one corner. It was time well spent."
- **Inspect:** "This decorates your profile. It won't change anyone's combat strength."
- **Offline:** "You're welcome to browse. Sign in when you're ready to buy or equip a frame."
- **Saved purchase:** "It's yours to keep. Try it on your profile whenever you like."
- **Saved equip:** "There. Your name has just the right company."
- **Cancel:** "An excellent decision can wait until you're certain."

```text
Single adult nonbinary fashion artisan portrait, head to knees, rich brown skin, violet eyes, short silver hair with one long asymmetrical braid, a mischievous thoughtful smile. Tailored deep-plum coat with an off-center pearl-white lapel, fine silver geometric stitching, a long lilac sash and fitted dark trousers; one hand holds a small oval pewter hand mirror while the other adjusts the sash. Refined anime linework, crisp cel shading, elegant painted textiles, original fantasy game NPC illustration. Head, braid, hands and mirror fully visible with clear side and top margins; intentionally crop the legs near the knees. Plain flat bright green background filling every gap --no scene, other people, text, lettering, logo, watermark, frame, extra arms, glow, photorealism, 3d render --ar 2:3 --niji 6 --s 100 --q 1
```

### Torven — Conduit Store

Torven loves a beautiful mechanism, but he would rather explain its real job
than sell someone the shiniest thing. He is welcoming, direct and animated.

- **Welcome:** "Come in! Let's find a Conduit that actually earns its place."
- **Idle 1:** "Hear that little click? That's a mechanism admitting it's happy."
- **Idle 2:** "Sometimes a tiny gear does the biggest job. Don't tell the big ones."
- **Idle 3:** "If it rattles, ask why before you tighten everything."
- **Inspect:** "Read the effect first. The best machine is the one your squad can use."
- **Already owned:** "You've already unlocked this one. Another copy won't improve its effect."
- **Saved purchase:** "It's yours. You can equip it when you're ready; I won't do that for you."
- **Confirmed insufficient Prismatica:** "Not enough Prismatica for this one. Nothing was spent."
- **Cancel:** "Fair enough. A machine worth choosing is worth thinking about."

```text
Single adult man Conduit dealer portrait, head to knees, broad build, warm bronze skin, amber eyes and short swept-back chestnut hair with one gray streak. He wears a midnight-navy work coat with one blue-gray padded shoulder, rolled sleeves and precise bronze fasteners; he presents a palm-sized mechanical sculpture with an armored housing, visible interlocking gears, articulated pivots and a faceted amber crystal. Open, confident grin. Refined anime linework, crisp cel shading, polished painted metal, original fantasy game NPC illustration. Head, hands and the complete mechanism inside clear side and top margins; intentionally crop the legs near the knees. Plain flat bright green background filling every gap --no scene, other people, text, lettering, logo, watermark, frame, extra arms, glow, photorealism, 3d render --ar 2:3 --niji 6 --s 100 --q 1
```

### Edda — Conduit Upgrade service

Edda is an experienced engineer who finds satisfaction in small adjustments.
She teases gently, explains costs plainly and never pretends an upgrade happened
before it is saved.

- **Welcome:** "Let's see what your machine can become."
- **Idle 1:** "The quietest gear usually has the most interesting job."
- **Idle 2:** "A careful turn of the wrench can be worth a dramatic overhaul."
- **Idle 3:** "I save the odd-shaped screws. They usually know where they belong."
- **Inspect:** "The current level and required Broken Mechanical Components are right here."
- **Maximum level:** "This one's as far as the workshop can take it."
- **Saved upgrade:** "Adjustment saved. That mechanism should run beautifully."
- **Confirmed insufficient components:** "We need more Broken Mechanical Components first. Nothing was spent."
- **Cancel:** "Tools down, then. We can come back to it."

```text
Single older adult woman engineer portrait, head to knees, warm olive-brown skin, keen dark eyes and silver hair arranged in a high braided knot, protective goggles resting above her forehead. She wears rolled indigo sleeves, a burnt-orange asymmetrical work apron, silver tool straps and sturdy gloves; one hand holds a slender wrench and the other steadies a compact steel-blue gear. Relaxed stance and dry, friendly grin. Refined anime linework, crisp cel shading, carefully painted cloth and metal, original fantasy game NPC illustration. Head, knot, hands, wrench and gear fully visible with clear side and top margins; intentionally crop the legs near the knees. Plain flat saturated magenta background filling every gap --no scene, other people, text, lettering, logo, watermark, frame, extra arms, glow, photorealism, 3d render --ar 2:3 --niji 6 --s 100 --q 1
```

### Sarev — Calamitic Conduits

Sarev is a quiet custodian of dangerous mechanisms, not a prophet or creator.
He treats power as a responsibility and speaks without threats or pressure.

- **Welcome:** "Some mechanisms deserve a moment of thought before they are opened."
- **Idle 1:** "The old world left questions behind as carefully as it left machines."
- **Idle 2:** "I catalog the questions as well as the mechanisms."
- **Idle 3:** "A warning isn't a judgment. It's a way to leave choices open."
- **Locked:** "The seal opens after a Calamity tier has been cleared. The requirement is shown here."
- **Inspect:** "Study the effect. Strength is easier to carry when you understand it."
- **Saved purchase:** "The mechanism is yours. Use it with care."
- **Confirmed insufficient Calamitic Tokens:** "You need more Calamitic Tokens for this. Nothing was spent."
- **Cancel:** "A closed case can wait."

```text
Single adult man curator portrait, head to knees, deep-brown skin, silver eyes and short ivory hair swept behind one ear. He wears a charcoal and ivory high-collared coat with one draped shoulder, a narrow wine-red sash and fine crimson seams; both hands hold a closed palm-sized black mechanical case with restrained red inlays. Composed expression with a subtle kind smile. Refined anime linework, crisp cel shading, polished matte cloth and painted metal, original fantasy game NPC illustration. Head, hair, hands and complete case fully visible with clear side and top margins; intentionally crop the legs near the knees. Plain flat bright green background filling every gap --no scene, other people, text, lettering, logo, watermark, frame, extra arms, glow, photorealism, 3d render --ar 2:3 --niji 6 --s 100 --q 1
```

### Nimra — Event Elemental-Devourers

Nimra records encounters with lively curiosity and treats every
Elemental-Devourer with respect. Her field notes are full of weather, tracks
and small observations, not promises about an event's schedule.

- **Welcome:** "Hello! I've been making notes on the travelers passing through."
- **Idle 1:** "This page was a map yesterday. Then it rained."
- **Idle 2:** "I never leave the trail without writing down the weather."
- **Idle 3:** "A quiet footprint can tell you more than a loud story."
- **Inspect:** "The listing shows this form's level and skills. Take a look before deciding."
- **Not yet available:** "This family isn't available for purchase yet. The listing explains when it may become available."
- **Offline:** "You can browse here, but purchases need an online sign-in."
- **Saved purchase:** "The copy is safely in your collection. You decide what to do next."
- **Cancel:** "All right. There's always more to learn while you decide."

```text
Single adult woman field guide portrait, head to knees, warm freckled skin, brown eyes and lively cinnamon-brown curls held with one pale-blue hairclip. She wears a fitted dusk-blue field jacket, an ivory scarf, a tan crossbody satchel and a small brass compass; she holds a folded unmarked field map in one hand and gestures openly with the other, smiling with curious warmth. Refined anime linework, crisp cel shading, detailed painted cloth and leather, original fantasy game NPC illustration. Head, curls, hands and map fully visible with clear side and top margins; intentionally crop the legs near the knees. Plain flat bright green background filling every gap --no scene, creatures, other people, text, lettering, logo, watermark, frame, extra arms, glow, photorealism, 3d render --ar 2:3 --niji 6 --s 100 --q 1
```

### Dialogue and shop integration requirements

These lines are the text-only host script, not a new social-chat service. The
implemented interface shows a greeting and offers a
keyboard-accessible **Talk** control for optional idle lines; advancing lines
must not block browsing, purchase confirmations, Back or Escape. Rotate idle
lines deterministically in transient presentation state, without gameplay RNG
or account writes. Use the actual host's distinct dialogue and keep text
readable without animation; do not make a portrait or a speech bubble the
only source of a price, warning, lock or transaction error.

The current interface reacts to selection, offline/locked state, cancellation
and confirmed saved outcomes; the actual catalog and transaction messages own
availability, balances and errors. The additional warning, owned and
insufficient-funds lines above remain optional script variants, not claims that
every variant is automatically selected. Success dialogue and any celebration appear only
after a confirmed save. A lost or ambiguous response must instead say the
outcome is unconfirmed and expose the existing exact-request retry; never
claim that nothing was spent until rejection is confirmed. Cancellation must
not submit a transaction. Preserve mandatory event-material warnings, actual
event windows and rerun restrictions, currencies, unlock gates, quantities,
receipts, ownership and existing confirmation flows. No portrait implies a
new grant, discount, stock limit, event launch, auto-equip or combat effect.

Fit the host into the existing desktop shop hierarchy without obscuring
catalogs or product details; allow a compact nonblocking layout on narrow
screens. Pending artwork uses an honest neutral named presentation, never a
missing URL or another character's art. Retain focus, Escape/Back, explicit
in-game Reduce motion, saved-success timing and finite/disposable feedback.

## Verified catalog and existing artwork

This snapshot was checked against the actual content catalogs, release gate and
PNG files, not counts of AVIF copies or a historical art-library list.
[`art_library.py`](../../tools/art_library.py) establishes canonical Art filing
for older packages; its historical character tuple is **not** the live roster.

| Inventory | Verified scope | Treatment |
| --- | --- | --- |
| Bearers and forms | 38 authored; **32 released**, six hidden Sunshade. All **192 released form PNGs** exist, six per bearer. | Use the released gate and saved form identity; no new portrait generation. Calamitic displayed Evo.2–7 maps to six saved forms. |
| Personal Masters | **114 authored**, three per bearer, including 18 hidden Sunshade. **96 released** entries: **84** have installed PNGs and **12** reclaimed-War entries have no installed art. | Reuse existing Master art; do not claim all released Masters have images. Missing War Masters remain neutral pending separate review, not new overhaul requests. |
| Mapped status art | **54** typed entries: **50 installed PNG mappings** and **four** neutral inline placeholders for reclaimed War. | Reuse only where the finalized state still matches its meaning. No inferred mapping or replacement request. |
| Installed status groups | Nine shared family/Rose, 27 native, 11 Moon and three Calamitic symbols; 9 + 27 + 11 + 3 = 50. | Keep provenance, character-specific colors and accurate text. Typed mappings determine active use; historical icon appearance does not define a mechanic. |
| Reclaimed War | Neralis, Varkhel, Seravelle and Velmira have **24 installed form portraits**; existing plan lists 44 other undelivered sources. | See below; do not mistake their older source filenames for Moon identities. |
| Moon | Six released Moon bearers have their **36 portraits**, 18 Masters and 11 status images in the installed 104-source Moon intake. | Reuse installed sources. Availability and release gating are separate from an event's timed schedule. |

Released names at this snapshot: Infernis, Tizu, Flora, Rosetta, Thornia,
Crinso, Maerion, Caevren, Vespera, Ilyss, Asteriel, Serapha, Atmoso, Aurora,
Bliss, Bruno, Disciple, Elise, Razor, Nerithe, Orvella, Vaelor, Caldrex,
Solenne, Myrthen, Neralis, Varkhel, Seravelle, Velmira, Ozriel, Ilvaris and
Kaelith. Rhaziel, Oryn, Thessara, Elaris, Veyr and Aureth are **hidden
Sunshade**, not part of the 32 or the 192 release-facing crops. Source
authorities: [roster](../../src/content/starters.ts),
[release gate](../../src/content/release-visibility.ts),
[form resolver](../../src/content/character-art.ts),
[Masters](../../src/content/master-conduits.ts) and
[status mapping](../../src/content/status-art.ts).

## Visual system — derived and procedural, not owner commissions

The owner-selected combat vocabulary is one progressively expressed
**Glowing Flare**, **Lustrous Flare**, **Eternal Radiant Flare** per bearer;
not three unrelated new ability images. Four displayed core stats are HP,
Attack, Defense and Recovery. The unequipped Master default is Equinox;
personal Masters select an attunement from Corona, Aegis, Solstice and Prism
where specified. Do not imply that Equinox, attunement or a Master changes a
bearer's element, original image or form. Exact assignments and mechanics are
owned by the system specification and typed content, not this visual brief.

- **Personal and shared meters:** render two clearly labeled personal layers
  for Glowing/Lustrous and a separate shared Eternal Gauge for a squad of up to
  six. Present actual unlock/readiness/values in accessible text, not color
  alone; the team gauge appears under the rules in the system specification.
  Never invent a third personal meter or draw readiness before it exists.
- **Enemy Gauge drops:** use procedural colored orbs from the actual enemy to
  every living recipient of a saved gain; no new source image is required.
  Show exact personal values, including tenths, and retain static saved
  feedback when Reduce motion or Skip removes the flights. The attacker's
  full drop and each teammate's additional 10% are gameplay values, not
  separate visual reward claims.
- **Stats and attunement:** use HTML text and procedural geometry or existing
  suitable art for the four stats and five subtype labels. Preserve text,
  numeric values, focus, contrast and readable layout at phone sizes; no image
  is needed for Equinox or any Master profile.
- **Home:** compose the actual saved equipped squad, one to six, from each
  member's existing **full-body current evolution** art. Respect source
  facing, layering, silhouette and screen bounds; do not substitute a demo
  lineup or compact head crops. Existing scenery or a generated backdrop and
  procedural ground light suffice. The current Home composition has
  been visually checked with a six-member saved-squad fixture at
  desktop and narrow browser sizes; this is not physical-device acceptance.
  Do not copy the rejected alternate mock-up.
- **Flare presentation:** build finite, layered light effects procedurally:
  an identifiable elemental charge, clear travel/impact and dispersal;
  Lustrous and Eternal can escalate scale, density and orchestration without
  obscuring the bearer, enemy, damage, HP, controls or exact state. The same
  character's tiers should feel like a progression, not palette swaps or
  completely unrelated signatures. No sprite sheets or rendered videos are
  requested. The current Radiant-only identity pass adds a distinct progressive
  motif sequence for each released bearer, nine larger animated motion
  structures, and the authored Moon, reclaimed-War, Calamitic or silver-lilac
  energy colors where needed. It reuses existing base archetypes and remains
  subject to final cinematic and owner review; it does not change installed
  artwork.
- **Shader and fallback:** authored runtime shaders/particles may emit light
  and bloom, unlike keyed source artwork. Preserve element and individual
  color identity, establish bounded contrast and performance, dispose effects,
  and provide a legible non-shader fallback. Explicit in-game Reduce motion
  uses static feedback; do not block controls, Skip, dismissal or focus.
  Sample effects over time, including impact and cleanup, not only stills.
  Effects are presentation only: no extra gameplay RNG, premature rewards or
  success animation before a successful save.
- **Status presentation:** retain visible precise label, owner, counts and
  clocks alongside any reused image; an image is not the mechanic. The
  installed [family/Rose symbols](Battle%20Status%20Icons.md) and
  [native symbols](Native%20Identity%20Status%20Icons.md) are actual prior
  artwork, not a mandate to retain retired mechanics. Do not fabricate future
  roster-specific icons, colors or state names while their designs are pending.

The established status palette includes Infernic crimson/orange ember,
Oceanic sapphire/silver ward, Botanic emerald/ivory renewal, Atmospheric
wind/storm, Tranquilitic focus and Chaotic suppression; Rose, native,
Calamitic and Moon symbols retain their particular authored identities. Refer
to the source images and typed mapping, not a single universal white/gold
recolor. The shared light motif unifies the interface; it does not erase
legitimate elemental hues or impose Moon colors on reclaimed War characters.
Use original Last Light visual language, never copy another game's characters,
effects, art or interface.

## Compact evolution portraits: completed derived-art record

These are **not 192 owner commissions** and are not new source portraits.
One canonical, source-bound face/upper-body crop per released bearer/form is
exported from the reviewed full-art assets and serves all compact contexts.
Full art remains in Home, Team/showcases and the battle field.

The offline exporter records individual eye anchors, normalized crop bounds,
source and output hashes, and byte-derived revisions. All192 crops have been
reviewed from contact sheets; the174 new forms were additionally checked at
48px on dark and96px on light backgrounds. The shared resolver applies facing
once and serves compact Team, Profile, saved-loadout, Home-squad and Radiant
portrait contexts. Full-form Home, character detail, collections/showcases and
battlefield artwork remain unchanged. Preserve supplied alpha, original source
bytes, ownership/discovery silhouettes and the hidden-Sunshade release gate;
do not key, recolor, invent detail, reconstruct clipped tips or add per-screen
crop variants. Source/settings/provenance and compact-context tests remain the
reproduction and regression contract.

## Optional owner commission: one cinematic Home environment

**Optional, not approved for generation.** A reusable original setting could
give the actual saved squad a cohesive cinematic stage without a custom
painting of any particular squad. Existing scenery and procedural light remain
the default; this image is not necessary to ship the requested system.

**Delivery:** one opaque, full-bleed 16:9 PNG source, preferably at least
3840 × 2160, proposed filename `radiant-home-environment.png`. No transparent
key, no people, portraits, built-in text, interface, baked-in symbols or
activity-specific lore. Place focal detail away from a broad usable central
formation area; allow responsive crops without relying on information at an
edge. Review on desktop and phone with one and six actual full-art bearers.
Save original bytes and document provenance before generating optimized runtime
derivatives. Scenery may have atmospheric light and bloom; it is not a
cutout and needs no solid key or outer safety margin.

**Copy-ready source prompt, if separately approved:**

```text
An original tranquil celestial sanctuary at dawn, an open circular stone
platform in the foreground with fine pale-silver inlays, distant layered
arches and softly receding cloud-lit architecture, a restrained pearl and
charcoal foundation with subtle cool teal and warm ivory light, a broad
unobstructed central space for a later arrangement of separate game
characters, elegant depth and a low horizon, cinematic full-bleed 16:9
environment art, clean anime-inspired painted surfaces and crisp architectural
shapes, gentle atmospheric light and controlled bloom --no people, creatures,
character silhouettes, emblems, lettering, numbers, logos, watermark,
user interface, frames, photorealism, 3d render --ar 16:9 --niji 6 --s 100 --q 1
```

This is a scene, not a sprite or a request for six bespoke scenes. Inspect
actual output rather than assuming prompt compliance; no style-reference URL
is invented. The optional art must not overwrite installed arenas or sources.

## Optional owner commission: one shared Market environment

**Optional, not required for functional shops.** One reusable 16:9 opaque
environment can sit behind the six separately composited vendors, rather than
commissioning a separate shop illustration for each host. Suggested source:
`radiant-market-environment.png`, preferably at least 3840 x 2160 when available.
Keep the center and lower foreground quiet enough for accessible catalog and
vendor overlays; interfaces and readable labels are rendered by the game.
Existing procedural backgrounds remain valid if no image is delivered.

```text
An original fantasy market hall with an open central aisle, layered dark-slate and warm-ivory stone, elegant pale-metal arches, softly lit display alcoves and carefully crafted counters at the far sides; small mechanical details and folded textiles suggest a varied marketplace without depicting specific products. A wide uncluttered central and lower foreground remains available for separately composited game characters and interface panels, cinematic full-bleed environment, clean anime-inspired painted surfaces, gentle atmospheric light and restrained bloom --no people, creatures, portraits, lettering, numbers, logos, watermark, interface, frames, photorealism, 3d render --ar 16:9 --niji 6 --s 100 --q 1
```

This adds **one optional source**, not six store backgrounds. It is not a
replacement for installed activity arenas or the optional Home scene.

## Existing outstanding art — reference, do not duplicate

- The [reclaimed War package](../../docs/Future%20Plans/Elemental%20War%20Phase%202.md)
  separately lists **44** undelivered images: 16 ability icons, 12 Masters,
  eight native/buff symbols, four trial headers and four arenas. Its 24
  portraits are already installed. This historical queue is **not** an
  instruction to order these for the overhaul: the owner explicitly requests
  no ability icons, existing Master effects are being redesigned, and the
  eight status concepts must be reconciled against finalized kits. The four
  mapped neutral status placeholders do not establish eight final new needs.
  Trial scenery is a separate activity need, not part of this commission.
- [Remaining expansion art](../../docs/Future%20Plans/remaining-expansion-art.md)
  and the [image budget snapshot](../../docs/Future%20Plans/image-budget-audit.md)
  record **103** undelivered Sunshade sources, plus optional seasonal equipment
  concepts. Sunshade is hidden and is outside this released-roster scope;
  its future requirements are not automatically approved by this brief.
- [Moon intake](../../docs/art-workflow.md) records 104 delivered sources.
  The nine shared symbols and 27 native symbols in the linked status documents
  are also delivered; do not count them as pending commissions.
- Existing ordinary Conduit, Master, universal action and bearer artwork should
  be preserved and reused where appropriate. Neither new numerical effects
  nor stronger runtime light is evidence that artwork needs replacing.

## Single checklist and unresolved items

- [x] Draft six original vendor identities, dialogue sets and individual
      copy-ready portrait prompts; compare the supplied battle compositions.
- [ ] Obtain owner review of the proposed vendor identities and actual source
      images. No portrait is delivered or installed; both environments remain
      optional. Do not generate or purchase images on the owner's behalf.
- [x] Implement the vendor presentation and contextual dialogue on the
      existing shop and upgrade surfaces. The previously unreachable
      Event Elemental-Devourer purchase button now reaches its existing
      authenticated confirmation and saved-receipt flow.
- [x] Replace the battle grid with deterministic staggered formations and a
      target strip; inspect real authored one-, three- and six-enemy fixtures.
- [ ] Review individual source foot/hover anchors and complete owner visual
      and physical-device acceptance of the staging.
- [x] Record the 32 released-bearer study's current kit, ordinary-Conduit,
      Master, status and readout implementation in the system specification;
      keep historical and independently art-pending queues separate.
- [x] Derive, source-bind and review all192 released-form compact portraits;
      preserve full artwork, facing, discovery/ownership gating and shared
      compact-context use.
- [x] Establish the saved-squad Home, four-stat/attunement readouts, personal
      layers, shared Eternal Gauge and initial tiered signature VFX.
- [ ] Complete final cinematic VFX and physical GPU/device/cadence/economy
      validation. Browser fixtures and automated checks do not establish it.
- [ ] If either optional environment is supplied, review the actual full-bleed
      source against its composition and delivery requirements before intake.

The six proposed vendor portraits are the only new sources in this vendor
package; no additional playable-bearer, ability-icon, Conduit, Master or status
image is requested for the Radiant overhaul. Neither optional environment is
necessary to operate the game. Existing seasonal and War queues remain separate.

For intake, source preservation, transparency and review follow the
[art workflow](../../docs/art-workflow.md),
[prompt guide](../guides/midjourney-character-style-prompt.md) and
[cutout contract](../guides/cutout-background-contract.md). Never treat a
prompt, derived crop or successful export as visual approval of an unseen
source image.
