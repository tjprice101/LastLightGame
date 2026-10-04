# Decision log

Use this document for durable product and technical decisions. The system
specifications own detailed rules; link them here rather than duplicating them.

## Confirmed direction

| ID | Decision | Basis |
| --- | --- | --- |
| D-001 | Last Light is a gacha game inspired by Brave Frontier | Owner request at documentation bootstrap |
| D-002 | Maintain early documentation for owner customization and AI handoffs | Owner request at documentation bootstrap |
| D-003 | Preserve the existing character/weapon art guidance as the visual baseline | Existing [art guide](../Art/midjourney-character-style-prompt.md); revisions remain possible |
| D-004 | TypeScript + Phaser 3 + Vite for a browser-first 2D prototype; Vitest for rule tests | Owner delegated language choice, 2026-10-03; supports animated 2D scenes and static deployment |
| D-005 | Implement title -> starter choice -> opening menu first | Owner request, 2026-10-03; see [opening flow](opening-flow.md) |
| D-006 | Publish to `tjprice101/LastLightGame` and deploy through GitHub Pages Actions | Owner-supplied repository and deployment request, 2026-10-03 |
| D-007 | Original fire-only selection and legacy re-selection policy, superseded by D-019 | Owner request and follow-up selection, 2026-10-03 |
| D-008 | Fractalis main currency; Lycalis premium currency | Owner request, 2026-10-03 |
| D-009 | Evolution, level, weapon, passive, ability 1/2, and Last Flare upgrades; eight unique artifacts plus one special master relic | Owner request, 2026-10-03; [progression](units-and-progression.md) |
| D-010 | Inventory, settings, story mode, and a future events tab | Owner request, 2026-10-03; [menu surfaces](menus-and-inventory.md) |
| D-011 | Main activity is Free Battle: endlessly fight Goblin/Imp/Rock Golem waves with enemies left and allies right | Owner request, 2026-10-04 |
| D-012 | Every character gets at most one light/heavy/skill/ultimate action per turn; original heavy/ultimate recovery rule superseded by D-017 | Owner request and follow-up approval, 2026-10-04 |
| D-013 | Design editable prototype stats/kits for all three starters; expose configurable displayed battle hotkeys | Owner request and delegated initial balance, 2026-10-04; [rules](free-battle.md) |
| D-014 | Organize supplied character/enemy art, preserve originals, remove white matte from runtime copies, wire to UI/battle | Owner request, 2026-10-04; [art](art-workflow.md) |
| D-015 | The starting experience is solo, not a team; combat needs cutesy grassy-field scenery | Owner correction, 2026-10-04; [scenery prompt](../Art/Battle%20Scenery.md). Scenery and solo battle now implemented |
| D-016 | Three primary sanctuary screens: Home with character and Squad/Summon buttons, Character Upgrades, and Events; Settings off to the side | Owner navigation request; [menu surfaces](menus-and-inventory.md). Inventory is integrated into upgrades; Story and Free Battle remain Home subactivities |
| D-017 | Each character uses Shatter Gauge for abilities; only Last Flare blocks all actions next turn. Heavy attacks no longer cause recovery | Owner correction and prototype-value approval, 2026-10-04. Start 0, cap 100; Light +20, Heavy +30, incoming hit +10; Ability 1 costs 25, Ability 2 costs 40, Last Flare costs 100. [Exact rules](free-battle.md#actions-and-recovery) |
| D-018 | Tier 1 caps at level 30, then Fractures into Tier 2 with major stat improvements, resets to level 0, and grants +10 Lycalis. Tier 2 levels to 30 with different resources | Owner request, 2026-10-04. Owner selected previews only until materials and exact stats are defined; no upgrade or reward transaction yet. [Progression rules](units-and-progression.md#confirmed-level-and-fracture-rules) |
| D-019 | Offer fire, grass, or water at the beginning; Free Battle uses only the saved character. Make all battle text easier to read | Owner request, 2026-10-04. Supersedes D-007; preserve all valid starter saves. Opaque backing, larger text, and readable unavailable-action feedback |
| D-020 | Each defeated enemy drops an integer 5-10 Fractalis immediately into a persistent browser-local balance starting at 0 | Owner request and persistence approval, 2026-10-04. Includes burn kills; keep earnings across exit/restart/reload. [Economy](summoning-and-economy.md) |
| D-021 | Adapt the supplied gacha-hub mock-up for both Home and Character Upgrades using Last Light's actual data | Owner request and scope selection, 2026-10-04. Keep three primary screens and Settings drawer; use saved starter, stats/passive, Shatter Gauge, Fracture rules and wallet. No fake roster or working upgrade operations. [Menus](menus-and-inventory.md) |

D-003 records existing guidance, not approval of generated assets or gameplay rules.

## Open decisions

| ID | Question | Affected documents |
| --- | --- | --- |
| O-001 | Resolved for the prototype by D-004; native/mobile-store targets remain open | [Architecture](technical-architecture.md), [development](development-guide.md) |
| O-002 | Offline prototype, online-first, or offline prototype with later online production? | [Architecture](technical-architecture.md), [economy](summoning-and-economy.md) |
| O-003 | Free Battle rules resolved by D-011/D-012/D-013; production squads/advanced controls remain open | [Combat](combat.md), [units](units-and-progression.md) |
| O-004 | Prototype stats/formulas specified in Free Battle; elemental advantage and production balance remain open | [Combat](combat.md), [content](content-guide.md) |
| O-005 | How do rarity, level, evolution, and duplicates work? | [Units](units-and-progression.md), [economy](summoning-and-economy.md) |
| O-006 | What summon rates, guarantees, pity, and currency rules are desired? | [Economy](summoning-and-economy.md) |
| O-007 | Is monetization planned, and for which markets/audiences? | [Economy](summoning-and-economy.md), [architecture](technical-architecture.md) |
| O-008 | Opening-screen scope resolved by D-005; story and battle slice remain open | [Vision](game-vision.md), [roadmap](roadmap.md) |
| O-009 | What runtime art formats, dimensions, animations, and reference assets are approved? | [Art](art-workflow.md) |
| O-010 | What device budgets, accessibility, and localization requirements apply? | [Vision](game-vision.md), [development](development-guide.md) |
| O-011 | Are unique artifacts distinct by instance or definition, and can characters share items? | [Equipment](menus-and-inventory.md#equipment-implementation-requirements) |
| O-012 | Prototype abilities/Last Flare names implemented; upgrade costs/caps and starting currency balances remain open | [Units](units-and-progression.md), [economy](summoning-and-economy.md) |

## Decision record template

```text
ID and title:
Status: proposed / accepted / superseded
Date:
Decision owner:
Context:
Options considered:
Selected rule:
Reason:
Consequences and trade-offs:
Affected documents/code/tests:
Supersedes / superseded by:
```

Keep accepted records when direction changes; mark them superseded and link the
replacement. Promote an open question only after the owner approves an answer.
Create a separate detailed decision document only when the rationale outgrows
this log, then link it from here and the index.
