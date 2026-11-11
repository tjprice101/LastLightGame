# Future Plans: unfinished work and restart guide

## Live Radiant follow-through (2026-11-10)

Radiant runs in the real online and local game across activities; the older
preview-only release description below is historical. The
[current handoff](../handoff.md#live-radiant-and-team-release-follow-through-2026-11-10)
and [Radiant specification](combat-system-specification.md#live-implementation-and-continuation-compatibility-2026-11-10)
record remaining artwork, physical desktop/owner review, conditional economy
findings and the compatible client/authority release procedure.

## Current Radiant work and art scope (2026-11-09)

The [handoff](../handoff.md) and [Radiant specification](combat-system-specification.md)
record the Radiant foundation, deployed to production on 2026-11-09 as a
signed-in Home preview entry, and its remaining open work. The [consolidated art brief](../../Art/ui/Combat%20Overhaul.md)
records implemented staggered battle staging and six text-based shop/service
hosts, plus six pending portrait prompts and two optional environments.
The portraits are not delivered. The separate historical
147-source seasonal/War queue is not automatically part of the Radiant order.

**Audited 2026-11-06. Filing is not approval to resume, launch or spend.**

This is the canonical home for standalone unfinished plans and experiments.
Live contracts stay in the main documentation library. Delivered originals,
provenance, runtime assets and save IDs have not moved. Historical paragraphs
inside older plans remain delivery history; current status below takes priority.

## Start here

1. Read [current handoff](../handoff.md), then this register.
2. Choose one workstream and read its full plan, dependencies and owner gates.
3. Recheck workspace/runtime/authority against the recorded baseline.
4. Obtain outstanding approvals; implement and validate the actual requirement.
5. Update the plan, this register, handoff and associated live contract together.
6. Publish matching client/authority when applicable and verify the hosted build.

## Audited work register

**Latest scope clarification2026-11-08:** the prior alternate menu mock-up is
rejected/retired, not the design authority for resumed work. Historical rows
below retain its old review evidence only; no further rollout of that concept.
Necessary Home/Team/Battle UI belongs to the
[six-bearer combat overhaul](combat-system-specification.md#expanded-scope-six-bearer-progression-and-integrated-ui-2026-11-08),
including full Conduit/Master and all-activity enemy calibration. No named
preset feature selected; existing squad/equipment editing is reworked.

**Historical character combat refresh draft (2026-11-07):**
[Detailed comparison,32 released-kit audit and phased proposal](character-combat-refresh-audit.md).
Owner-selected four stats, bearer-only squads, single evolved Flare, two-step
shared/personal final charge, Equinox default with Master-selected subtype,
and bounded damage-based Prismatica. [Exact system/starter review draft](combat-system-specification.md)
contained proposed formulas, three kits and nine Master remaps at that time.
The Radiant branch has since implemented and tested substantially more; see
the current specification and handoff instead of treating this historical
draft as the implementation status.

| Workstream | Current status / what is done | Where to resume / next gate |
|---|---|---|
| Radiant battlefield staging and vendor hosts | Staggered field templates, target-impact readouts and six text hosts implemented; vendor portraits remain pending. Existing 192 face crops are derivatives; two environments are optional. | [Consolidated brief](../../Art/ui/Combat%20Overhaul.md); review source anchors and host likenesses, then complete the [release gates](combat-system-specification.md#remaining-coherent-release-gates-supersedes-the-lists-below). |
| Living-world UI and menus | First shared-foundation tranche implemented2026-11-07: ordinary control/panel tokens, leading labels/44px targets, explicit outcome tones, neutral press feedback and motion cleanup. Not a completed global UI overhaul. | [Current evidence and rollout](living-world-ui-audit-plan.md#first-shared-foundation-tranche-2026-11-07). Finish populated/visible-temporal/device Phase0 evidence, extend measured Phase1/2 gaps, then Phase3 Home/navigation journeys. Preserve saved-success timing, Reduce motion, focus/history/Skip; phases3-10 still unfinished. |
| Four artwork-led Elemental War characters | Owner approves integration2026-11-06;24 reviewed portraits installed and duplicate roots removed after hash checks; current kit contract replaces proposal-only scope | [Designs/lore/kits](phase-2-war-designs.md), [44 pending-art prompts](Elemental%20War%20Phase%202.md), [intake](../../Art/provenance/phase2-war-art-intake.json), [live War rules](../elemental-war.md), [handoff](../handoff.md). Finish/review undelivered icons/Masters/status/header/arena art later; current shared neutral presentation supports gameplay. All ten trials use5% final-boss recruitment, not guaranteed or1%. Release/validation evidence comes from the handoff, not this plan alone. |
| Moon and Sunshade artwork/intake | Twelve bearers,36 Masters and signature activity mechanics implemented;104 Moon images installed,103 Sunshade required images pending; event availability follows the authority schedule | [Current seasonal checklist](remaining-expansion-art.md), [Moon intake](../art-workflow.md#delivered-moon-artwork-2026-11-07), [original phase plan](remaining-expansion-phases.md), [live appearances](../moon-sunshade-character-design.md), [kits](../moon-sunshade-kit-specification.md), [events](../moon-sunshade-events.md). Sunshade intake and any launch window remain separate gates. Do not repeat released mailbox/calendar/shop/QoL implementation. |
| Story Chapters2-3 and pursuit/core puzzle | D-451 region foundations and D-452 scenes/core/replay/reward baseline approved; implementation explicitly paused | [Chapter design](chapters-2-3-design.md), [75 art concepts](Chapters%202-3%20Draft.md), [long-term narrative](story-roadmap.md). Resume only on owner instruction. Preserve125/75/75 future stages and875 NP budget; author unresolved reactions/placement before schema/migration/content integration. No creator recruitment or full-soul discovery is currently implemented. |
| Chapters4-7 / creator kits | Narrative direction only; encounters, counts, creator combat/acquisition unspecified | [Story roadmap](story-roadmap.md). Requires author interview and approval. Images are **unquantified**, not zero and not a fabricated total. |
| Real-money purchases | PayPal/provider/fulfillment proposal only; no checkout, grants or live charges | [Microtransactions design](microtransactions-design.md). Resolve provider eligibility/platform/tax/age/prices; approve scope, then sandbox verified receipts/refunds/idempotent authority. No paid service or live credentials authorized by filing. |
| Machine's Master Chest replacement | One replacement prompt, current chest installed and retained | [Current chest prompt](../../Art/conduits/Master%20Conduits.md), [replacement contract](../art-workflow.md#machines-master-chest-replacement-prompt-d-408). Generate/review only if wanted; never overwrite the installed source on prompt changes alone. |
| Optional War family/equipment concepts | Four old unused concepts: family banner and Nerithe/Orvella/Vaelor weapons; actual trial headers/arenas/actions already installed | [War art](../../Art/ui/Elemental%20War.md), [Nerithe](../../Art/characters/Nerithe%20Art.md), [Orvella](../../Art/characters/Orvella%20Art.md), [Vaelor](../../Art/characters/Vaelor%20Art.md). Optional illustration, not required gameplay slots. |
| Alternate starter skins | Three appearance experiments; no skin system or production replacement | [Three skin prompts](Starter%20Omnic%20Alternate%20Skins.md). Review visual direction first; any acquisition/equip/save system needs separate approval. Preserve signed references; request renewal if expired. |
| Style/palette pilot | Three enemy alternatives plus two Rosetta palette tests; production enemies remain reference-free | [Pilot](Enemy%20Style%20Pilot.md). Five experiments only, not authorization for global repaint or production reference policy changes. |
| Full roster benchmark refresh | Existing paper and bounded pressured checks retained; roadmap still flags full post-D-415 remeasurement | [Roster report](../roster-capability-audit.md), [benchmark contract](../enemy-benchmark-calibration.md), [roadmap](../roadmap.md). Reconcile current mechanics first; damage/healing/Shield/packet survival and pressured encounters are separate experiments. No strongest-outlier ordinary tuning. |
| Production balance/pacing review | Implemented economy/characters/Machines retain developer-tuned values and long-term playtest needs | [Roadmap](../roadmap.md), [Machines](../awaken-the-machines.md), [War](../elemental-war.md), [Calamitic costs](../calamitic-characters.md). Gather actual progression/ownership data and review tuning; do not silently approve proposals. |
| Historical art regression maintenance | Focused current filing/art contracts pass44 tests; broad older art suites contain frozen inventory and outdated literal wording/reference assertions | [Handoff diagnostic](../handoff.md#future-plans-filing-and-image-budget-audit-2026-11-06), [library tests](../../tools/test_art_library.py), [prompt tests](../../tools/test_art_prompts.py), [original War tests](../../tools/test_elemental_war_art.py). Reconcile tests with current authoritative policies in a separate bounded task; preserve genuine renderer/clearance/reference checks instead of repainting approved assets or hiding failures. |

## What moved, and what deliberately did not

Moved intact and relinked: UI audit, four-War design and prompt pack, Story
roadmap/chapter design/prompt pack, microtransactions design, original expansion
phase plan/checklist, and the two unfinished art experiments.

Main [documentation hub](../README.md), [art library](../../Art/README.md),
[workflow](../art-workflow.md), [vision](../game-vision.md), [decisions](../decisions.md)
and [handoff](../handoff.md) point here. Relative links and generator/test output
locations follow the new canonical paths; do not recreate competing old files.
Current Moon/Sunshade live specifications and their production prompt library
stay in place because they govern implemented systems too. Their unfinished
intake/activation tasks are registered here.

Historical completed plans (Phase1 War, six-element migration, old Conduit/kit
reworks, native and Calamity intake) are **not** unfinished work merely because
an old paragraph says "pending." D-441 completed Calamitic/Gates art; D-448
completed the nine Calamitic Masters. Installed original roster/material/action/
Conduit/status assets are not counted again.

## Image audit and budget

[Audited source-image inventory and Midjourney estimate](image-budget-audit.md):
**147 seasonal/War required**, **222 with paused Story concepts**, **239 with
production-related optional concepts**, or **247 including eight experiments**.
Unspecified later chapters/creator designs are additional unquantified scope.
Source counts are not prompt-job counts or guarantees of acceptable output.
