# Radiant combat overhaul — consolidated art request

**Provisional inventory and art brief, 2026-11-08.** The owner has selected the
overhaul direction, not a finished design for every bearer, status, Master or
ordinary Conduit. This document does not approve mechanics, commission an
image, launch hidden content or claim that the art work below is implemented.
Reconcile it with the [system and starter review](../../docs/Future%20Plans/radiant-combat-system-specification.md)
as roster batches are finalized. Count **one accepted original source image**
once, regardless of crops, exports, animation or reuse.

## What is actually requested

| Classification | New owner-delivered source images | Disposition |
| --- | ---: | --- |
| Confirmed mandatory for this overhaul | **0 currently specified** | Existing artwork plus procedural UI and effects can fulfill the specified visual direction. This is not a promise that later approved kits will require no art. |
| Optional recommendation | **1** | Original neutral cinematic Home scenery below, **only if the owner separately approves it**. Home must work without it. |
| Existing outstanding queues | **Not added to the overhaul count** | See the existing War and Sunshade plans below; their status must be reconciled, not duplicated or automatically ordered. |
| Derived/engine work | **0 commissions** | Up to 192 reviewed compact portrait derivatives, procedural gauges, UI and shader VFX; no new original images. |

The owner explicitly requests **no ability icons**. Do not generate replacement
ability, character, ordinary Conduit or personal Master art simply because
mechanics, effects or attunement change. Existing art remains available for
reuse, while irrelevant or undelivered ability art must not become a blocker.
Unspecified future status designs are not a completed icon list and must not
be guessed from old kit names.

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
| Installed status groups | Nine shared family/Rose, 27 native, 11 Moon and three Calamitic symbols; 9 + 27 + 11 + 3 = 50. | Keep provenance, character-specific colors and accurate text. Some old meanings may change; installed bytes are not proof that future kits are finalized. |
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
bearer's element, original image or form. Exact assignments, figures and
per-bearer effects remain review work.

- **Personal and shared meters:** render two clearly labeled personal layers
  for Glowing/Lustrous and a separate shared Eternal Gauge for a squad of up to
  six. Present actual unlock/readiness/values in accessible text, not color
  alone; the team gauge appears under the rules in the system specification.
  Never invent a third personal meter or draw readiness before it exists.
- **Stats and attunement:** use HTML text and procedural geometry or existing
  suitable art for the four stats and five subtype labels. Preserve text,
  numeric values, focus, contrast and readable layout at phone sizes; no image
  is needed for Equinox or any Master profile.
- **Home:** compose the actual saved equipped squad, one to six, from each
  member's existing **full-body current evolution** art. Respect source
  facing, layering, silhouette and screen bounds; do not substitute a demo
  lineup or compact head crops. Existing scenery or a generated backdrop and
  procedural ground light suffice. Do not copy the rejected alternate mock-up.
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

## Compact evolution portraits: derived-work handoff

These are **not 192 owner commissions**, not complete exports, and not new
source portraits. Derive a reusable face/upper-body view from each available
released form using the [existing form resolver](../../src/content/character-art.ts)
and reviewed full-art assets. One canonical crop per bearer/form serves all
compact contexts; do not improvise a separate crop for each screen. Full art
remains in Home, Team/showcases and the battle field.

1. Inventory the 192 source/form pairs and record original/export hashes.
   The proposed 512px square transparent output is an implementation starting
   point, not an already completed asset or a mandated visual result.
2. Record individual normalized crop rectangles and face anchors on the
   **unmirrored** artwork. Review face/eye scale, hair, head ornaments and
   enough shoulders to identify each form; late forms can have a tiny body
   inside a much larger effect silhouette. Do not blindly center-crop.
3. Keep transparency, palette, facial detail and proportions. Preserve
   original full images and supplied alpha; do not recolor, invent missing
   detail, reconstruct already clipped tips or apply runtime background
   removal. Treat facing once in the shared variant; animate wrappers rather
   than overriding facing or mirroring twice.
4. Record source/crop/output provenance and byte revisions; use deployment-base
   aware URLs and supported format fallback. Do not invent file paths before
   export. Keep silhouettes, discovery and ownership checks, and keep hidden
   Sunshade out of all player-facing views.
5. Review contact sheets at native, 96px and 48px against dark and light
   backgrounds, every form transition, front/directional poses and late-form
   ornaments. Verify consistent face framing across contexts, current
   evolution refresh, accessible names and unmodified full artwork.

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

- [ ] **No mandatory original-image order currently specified.** Obtain explicit
      owner approval before ordering the one optional Home environment.
- [ ] Complete and review the 32 released kits, all relevant ordinary Conduit
      and Master remaps, and their actual status/readout needs. Record any
      genuinely new illustration only after its meaning and reuse are clear;
      no invented final status list or ability icon commission.
- [ ] Reconcile the independent War and hidden Sunshade queues with final
      owner decisions; do not silently delete their existing planning records,
      count them twice, or expose hidden content.
- [ ] Derive and review up to 192 released form crops with provenance, source
      facing, gating and shared consumers; do not replace the original art.
- [ ] Implement and validate the actual-saved-squad Home, four-stat and
      attunement readouts, two personal layers, shared Eternal Gauge and
      tiered VFX as procedural/derived work, with accessible static and
      non-shader fallbacks and time-based motion checks.
- [ ] If an optional scene is approved, review the actual full-bleed source
      against the composition and delivery requirements before intake.

Open decisions include final per-bearer kits/status meanings and Master
assignments, whether any finalized state truly needs distinctive art, the
exact crop/export dimensions after review, shader/fallback implementation,
and whether the optional Home scene is wanted. This brief remains
**provisional until the released roster redesign is finalized**.

For intake, source preservation, transparency and review follow the
[art workflow](../../docs/art-workflow.md),
[prompt guide](../guides/midjourney-character-style-prompt.md) and
[cutout contract](../guides/cutout-background-contract.md). Never treat a
prompt, derived crop or successful export as visual approval of an unseen
source image.
