# Radiant combat overhaul — consolidated art brief

**Consolidated art scope and delivery record, 2026-11-08.** This is the single
visual-scope reference for the implemented Radiant study. It records current
art reuse, completed derived portraits and genuine art-pending assets; it does
not approve hidden-content release, a new commission or deployment. Mechanics
and exact bearer/Master assignments belong to the
[system specification](../../docs/Future%20Plans/radiant-combat-system-specification.md).
Count **one accepted original source image** once, regardless of crops, exports,
animation or reuse.

## What is actually requested

| Classification | New owner-delivered source images | Disposition |
| --- | ---: | --- |
| Mandatory new original source images | **0 currently specified** | Existing artwork plus procedural UI and effects fulfill the current visual scope. No new image order is authorized by this brief. |
| Optional recommendation | **1** | Original neutral cinematic Home scenery below, **only if the owner separately approves it**. Home must work without it. |
| Existing outstanding queues | **Not added to the overhaul count** | See the existing War and hidden-Sunshade plans below; retain their separate scope and do not duplicate or automatically order them. |
| Derived/engine work | **192 compact portrait derivatives completed; 0 original-image commissions** | Procedural gauges, UI and shader VFX use existing artwork; no new original images are required for the current study. |

The owner explicitly requests **no ability icons**. Do not generate replacement
ability, character, ordinary Conduit or personal Master art simply because
mechanics, effects or attunement change. Existing art remains available for
reuse, while irrelevant or undelivered ability art must not become a blocker.
The implemented 32-bearer study and its status/readout rules are documented in
the system specification and typed content; do not infer further commissions
from historical kit names or the separate pending-art queues.

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
  requested.
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
shapes, gentle atmospheric light and controlled bloom, no people or creatures,
no character silhouettes, no emblems, lettering, numbers, logos, watermark,
user interface or frames --ar 16:9 --niji 6 --s 100 --q 1
```

This is a scene, not a sprite or a request for six bespoke scenes. Inspect
actual output rather than assuming prompt compliance; no style-reference URL
is invented. The optional art must not overwrite installed arenas or sources.

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

- [x] The current overhaul has no mandatory original-image order. The optional
      Home environment remains unapproved and is not required for release.
- [x] Record the 32 released-bearer study's current kit, ordinary-Conduit,
      Master, status and readout implementation in the system specification;
      keep historical and independently art-pending queues separate.
- [x] Derive, source-bind and review all192 released-form compact portraits;
      preserve full artwork, facing, discovery/ownership gating and shared
      compact-context use.
- [x] Implement the saved-squad Home, four-stat and attunement readouts,
      personal layers, shared Eternal Gauge and tiered signature VFX with
      accessible static/non-shader fallbacks. Browser fixtures and automated
      checks do not replace final GPU, physical-device, cadence or economy
      validation.
- [ ] If an optional scene is approved, review the actual full-bleed source
      against the composition and delivery requirements before intake.

The optional Home environment remains an owner choice and is not required for
the overhaul. No new ability-icon, character, Conduit, Master or status-image
commission is currently specified. Final GPU/physical-device/cadence/economy
acceptance remains a release gate for the implemented presentation, not an
unresolved image order.

For intake, source preservation, transparency and review follow the
[art workflow](../../docs/art-workflow.md),
[prompt guide](../guides/midjourney-character-style-prompt.md) and
[cutout contract](../guides/cutout-background-contract.md). Never treat a
prompt, derived crop or successful export as visual approval of an unseen
source image.
