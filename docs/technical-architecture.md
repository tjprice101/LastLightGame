# Technical architecture

**Status:** browser opening implemented; broader gameplay boundaries below remain proposed.

## Selected prototype stack

The owner delegated the choice: TypeScript + Phaser 3 + Vite for a cinematic
2D browser prototype, with Vitest tests and GitHub Pages distribution.
TypeScript adds strict content/state contracts; Phaser provides WebGL rendering,
scenes, tweens, sprites, and particle tooling for future attacks.
HTML menus preserve native keyboard/touch/accessibility behavior.

This is not a promise of unlimited animation throughput. GPU fill rate, texture
sizes, particle counts, and simultaneous effects must be profiled on target devices.
Use bounded effects, reusable textures, and pooled combat objects when needed.
Keep game resolution independent of display resolution.
If the owner later requires cinematic 3D or native console deployment, revisit
the engine before production; Phaser is a 2D browser engine, not a 3D engine.

## Current source map

See [opening-flow implementation references](opening-flow.md#where-to-customize).
The opening state machine and persistence are independent of Phaser/DOM rendering.
Only starter identity is persisted. There is no combat resolver, backend,
authoritative economy, asset loader pipeline, or save migration framework yet.

An offline prototype can validate gameplay, but its locally editable balances and
draws cannot be treated as authoritative for purchases or competitive features.

## Proposed logical boundaries

| Boundary | Responsibility |
| --- | --- |
| Content | Load and validate authored definitions and versions |
| Combat | State transitions, formulas, effects, ordered battle events |
| Roster/progression | Owned instances, squads, progression operations |
| Economy | Balances, summon rules, rewards, transaction consistency |
| Persistence | Save versions, atomic writes, migrations, recovery |
| Presentation | Screens, input, animation, audio, accessibility |
| Platform/services | Optional authentication, cloud saves, payments, telemetry |

Names are conceptual, not planned source directories. Prefer a small modular
implementation over premature microservices.

## Dependency direction

Presentation calls gameplay operations and renders results. Gameplay depends on
validated content and explicit state, not screen objects or animation timing.
Platform integrations sit behind narrow boundaries so a prototype can omit them.
Inject controllable time/randomness into tests rather than relying on globals.

## Persistence contract

A candidate save includes schema version, content version, owned-unit instances,
squads, balances, progression, and committed operation results where needed.
Definitions should not be duplicated wholesale into every save.

Specify atomic write/recovery behavior, backups, migration sequencing, unknown
content handling, and corruption reporting before implementing persistence.
Never silently replace a failed load with an empty successful save.

## Online production requirements, if approved

Server authority for account balances, purchases, draws, rewards, and ownership;
authenticated operations; replay protection; concurrency control; audited
transactions; deployment and rollback procedures; privacy/retention rules.
These are requirements to design, not claims of existing services.
Keep credentials out of source and client assets.

## Implementation documentation to add as systems grow

- Exact source map, public APIs, state types, and schemas.
- Setup/build/test commands with supported tool versions.
- Save format examples and migration tests.
- Service contracts and environment-variable names, never secret values.
- Performance targets and measurements on the approved target devices.

See [development workflow](development-guide.md) and [decisions](decisions.md).
