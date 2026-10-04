# Proposed development roadmap

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
