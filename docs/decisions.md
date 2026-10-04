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
| D-007 | Fire-only playable roster; preserve legacy saves until explicit fire re-selection | Owner request and follow-up selection, 2026-10-03 |
| D-008 | Fractalis main currency; Lycalis premium currency | Owner request, 2026-10-03 |
| D-009 | Evolution, level, weapon, passive, ability 1/2, and Last Flare upgrades; eight unique artifacts plus one special master relic | Owner request, 2026-10-03; [progression](units-and-progression.md) |
| D-010 | Inventory, settings, story mode, and a future events tab | Owner request, 2026-10-03; [menu surfaces](menus-and-inventory.md) |
| D-011 | Main activity is Free Battle: endlessly fight Goblin/Imp/Rock Golem waves with enemies left and allies right | Owner request, 2026-10-04 |
| D-012 | Every character gets at most one light/heavy/skill/ultimate action per turn; heavy/ultimate forces a full next-turn recovery | Owner request and follow-up approval, 2026-10-04 |
| D-013 | Design editable prototype stats/kits for all three starters; expose configurable displayed battle hotkeys | Owner request and delegated initial balance, 2026-10-04; [rules](free-battle.md) |
| D-014 | Organize supplied character/enemy art, preserve originals, remove white matte from runtime copies, wire to UI/battle | Owner request, 2026-10-04; [art](art-workflow.md) |

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
