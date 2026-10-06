# Development roadmap

## Active owner-requested expansion phases

Implement and verify one phase at a time. Ask about each blocking design choice
before implementing it. Art prompts accompany their phase and retain the
established clean chibi/cel-shaded rendering and contrasting cutout backgrounds.

| Phase | Scope | Gate / remaining decisions |
| --- | --- | --- |
| 1 (complete) | Remove weapon upgrade menus/transactions; preserve saved bonuses. Fixed5-star starter ratings; Evo1-6 rarity Common through Omnic. |470 tests and production build passed; isolated browser verified evolution updates, no weapon controls and unchanged saved rank. |
| 2 (complete) | Five Common Conduits and a Fractalis Conduit Store; ancient-war mechanisms, some powered by Elemental Light, saved ownership, atomic purchases, icon/store prompts. |501 tests/build and art prompt checks passed. Isolated browser verified six purchases, cancellation, reload/inventory and320/390/1280px containment. |
| 3 (complete) | Individual Conduit equip/unequip, shared derived stats and run equipment snapshots. | One name per character, one owned copy unlocking all characters, ordinary slots only; Master reserved. All-mode tests and isolated browser verify effective stats, reload, sharing, Settings/replay and mobile containment. |
| 4 (complete) | Unified Archives with Character, Conduit and existing Creature galleries; banner headers, enemy elements and ten elemental medallion prompts. | Confirmed Adventure Nature/Fire/Earth, Dawnthorn Tranquilitic and Wraththorn Chaotic; dungeon typing matches its element. Loot routing stays separate. 524 tests,5 art checks and build passed; isolated browser verified galleries/filter/focus/store routes, discovery locks and responsive geometry. |
| 5 (complete) | Duplicate-instance ownership/protection foundation; owner moved playable mixed squads to Phase6 with retained enemy kits. | Uncapped storage, separately saved IDs/locks, unlocked by default and automatic squad protection. Existing starter identities/saves preserved. Tests/build and isolated browser verified independent locks/reload, protections and unchanged progression. |
| 6 (complete) |20% per-kill Heaven/Abyss captures, retained playable kits, independent levels/Conduits and instance-based mixed/all-captured squads. Rewards/captures atomic. | Defeated level retained; cap120, no evolution, ordinary stat growth with fixed form-strength multiplier. Manual shared-Gauge skills/cooldowns.30 Archive forms. Tests/build and isolated real-capture/mobile/replay/Settings checks passed. Currency-mode captures extend this path in Phases9/10 once definitions exist. |
| 7 (complete) | Consume explicitly selected Heaven/Abyss captured creatures alongside existing Evo3->4 onward costs. |1/2/3 copies of form3+/4+/5+, matching the element's mode. Locked/squad/Conduit-equipped copies protected. Atomic validation/write, permanent confirmation, cancellation/failure/retry and responsive selector verified. [Rules](evolution-fodder.md). |
| 8 (complete) | Heaven/Abyss exact linear1-3 Lycalis drops; Standard catalog/rates and200/500 pity. | Initial preview gate resolved by Phase9's real duplicate reward and active atomic draws. [Economy](summoning-and-economy.md). |
| 9 (complete) | Crownfall Treasury:25 floors65-120, currency-only100-200 to1,000-2,000, six Luminous crowned slime forms,20% captures and protected-safe rarity-priced sales; full art prompts. | Standard activated with12 real outcomes, independent pity and Lv50 Omnic duplicate-EB copy. Captures retain defeated level; ordinary banner creatures use first form stage. [Rules/tests](crownfall-treasury.md). |
| 10 (complete) | Rosethorn Sanctuary:25 floors65-120, six Tranquilitic divine/regal flaming wisps, chance-based1-5 Lycalis,20% captures and dual-currency protected sales. | First three forms expand Standard to15 entries; shared capture/equipment/Archive/art surfaces wired. [Rules](rosethorn-sanctuary.md). |
| 11 (complete) | Integrated save/economy/combat testing, responsive consistent UI, full art prompt review and handoff. | `npm test`:590 tests /59 files; `npm run build` succeeds (existing large-chunk warning); `python -m unittest discover -s tools -p test_art_prompts.py`:9 checks. Integrated tests exercise economy/save behavior and mixed-copy snapshots across all15 activity destinations. Browser smoke check confirmed Home has no horizontal overflow at available400/488/1600px viewports; the browser harness clamps requested320/390/1280 widths to those values. |
| 12 (complete) | Intake and integrate the36 owner-supplied root images: key backgrounds only for27 RGB cutouts/icons, preserve nine scenery images byte-for-byte, archive/hash sources and wire runtime images. | Explicit36-file mapping and hash manifest; no changes to existing supplied-alpha art. Intake-specific and affected-surface tests plus full validation documented in [handoff](handoff.md) and [art workflow](art-workflow.md). |

### Standard Banner and star tiers

The current Standard pool contains the three original Element-Bearers plus the
first three enemy forms from each of Heaven, Abyss, Crownfall Treasury and
Rosethorn Sanctuary:15 real outcomes. These first-three creatures use 1/2/3-star
acquisition ratings and are also obtainable through eligible20% captures.

Future4-star characters have shorter evolution lines (typically3-4 evolutions or
fewer); future5-6-star characters are exceptionally rare or banner-specific with
5-6 evolutions. Infernis, Tizu and Flora are explicitly5-star. Stars are fixed
acquisition classifications, distinct from rarity that rises with evolution.
Star tiers alone do not establish numeric odds. There is just one Standard
Banner in scope; two additional banners are deferred.

Owner clarified in Phase6 that captured later forms progress through1-6-star
acquisition ratings. Those forms do not evolve, and leveling never changes stars.
This is an explicit exception to the earlier4-6-star reservation; it does not
add final forms to the planned Standard Banner or invent banner odds.

Phase8 replaced the unowned-only summon; Phase9 activates Standard draws.
Five-star EBs share1% total; current1/2/3-star creatures split99% using
50:30:17, equal within each tier. No current4/6-star entries; future6-star EBs
share another0.1% tier only once authored. Treasury and Sanctuary's first three forms join
Heaven/Abyss for15 real outcomes. Owned EB results grant a final Treasury
Omnic creature at50; ordinary creature rewards use first-authored-form stage
level. Cost, reward and pity commit together. Phase11 integrated validation and
Phase12 owner-supplied art intake are complete; add future expansion phases only
after their scope is approved.
Approved independent pity guarantees highest-star at200 and unowned highest-star
at500 (500 priority; all-owned duplicate fallback). The pure resolver, saved
counter schema and active draw transaction are implemented.

## Historical foundation roadmap

**Status:** proposed sequence, not a delivery commitment. No dates or estimates
have been approved. Later gates may change after prototype feedback.

| Phase | Deliverable | Prerequisite | Completion gate |
| --- | --- | --- | --- |
| 0: Direction | Platform/engine and initial gameplay decisions | Owner review | Consequential choices recorded; slice scope approved |
| 1: Foundation | Runnable project, content validation, test harness | Phase 0 | Clean setup and minimal run/build/test verified |
| 2: Battle prototype | Configurable encounter, legal actions, win/loss | Phase 1; approved combat rules | Exact rule tests and playable battle |
| 3: Collection loop | Roster, squad editing, rewards, one progression action | Phase 2; progression/economy rules | Earn -> improve -> battle works and persists |
| 4: Test summoning | Simulated banner, visible odds/cost, safe transactions | Phase 3; banner rules | Exact draw rules and replay/recovery tests |
| 5: Vertical slice | Cohesive UI, approved assets, short content sequence | Phases 2-4 | Owner playtest; usability and device checks |
| 6: Production planning | Content pipeline, scale/online/commercial plan if desired | Validated slice | Explicit production requirements and launch gates |

## First recommended action

Review [open decisions](decisions.md#open-decisions), starting with target platform
and the combat model. Browser/engine selection and the opening-screen foundation
are now implemented; see [opening flow](opening-flow.md).
The [Adventure prototype](free-battle.md) now covers the initial battle gate with
solo play with any of the three starters. Playtest/tune that slice and approve progression/reward rules
before production roster expansion. Native platforms remain undecided.

## Work that can proceed independently

- Refine original character identities and source-art approval.
- Draft encounter and skill concepts without claiming numeric balance.
- Refine story/world direction with the owner.
- Maintain documentation and record approved decisions.

Runtime export settings depend on the engine. Balance tables depend on approved
combat/progression rules. Production summoning depends on the authority model.

## Track progress

Record the current phase and actual completed work in [handoff](handoff.md).
Do not mark a phase complete because its design document exists.
