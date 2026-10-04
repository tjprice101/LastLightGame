# Documentation hub

This folder is the shared reference for the owner, developers, and AI agents.
It is intended to make features easy to locate, extend, and hand off.

## Status vocabulary

- **Confirmed:** explicitly requested by the owner or present in existing source material.
- **Proposed:** a starting design for review; not approval to implement it.
- **Open:** a decision is still needed.
- **Implemented:** present in code and verified; include implementation and test links.

The opening title, starter selection, local starter save, and opening menu are
implemented. Combat, summoning, and broader progression remain design scaffolding.

## Find the right document

| Document | Use it for |
| --- | --- |
| [Game vision](game-vision.md) | Product direction, design pillars, scope boundaries |
| [Opening flow](opening-flow.md) | Title, starter selection, menu, local save, placeholder art |
| [Combat](combat.md) | Battle flow, actions, damage, effects, combat tests |
| [Units and progression](units-and-progression.md) | Unit identity, roster, leveling, evolution, duplicates |
| [Summoning and economy](summoning-and-economy.md) | Banners, odds, pity, currencies, reward transactions |
| [Content guide](content-guide.md) | Adding units, skills, enemies, quests, and banners |
| [Technical architecture](technical-architecture.md) | Stack decisions, module boundaries, saves, online services |
| [Art workflow](art-workflow.md) | Existing visual direction, asset intake, provenance |
| [Development guide](development-guide.md) | Setup status, feature workflow, testing, definition of done |
| [Roadmap](roadmap.md) | Proposed implementation sequence and completion gates |
| [Decisions](decisions.md) | Confirmed direction, pending choices, decision template |
| [Handoff](handoff.md) | Current workspace state, next action, contributor handoff |

Also see the root [AI instructions](../AGENTS.md) and the existing
[art prompt guide](../Art/midjourney-character-style-prompt.md).

## Common tasks

- **Add a character:** [content guide](content-guide.md#adding-a-unit) ->
  [units](units-and-progression.md) -> [art](art-workflow.md).
- **Add a skill or combat mechanic:** [combat](combat.md) ->
  [content guide](content-guide.md#adding-a-skill-or-effect).
- **Add a summon banner:** [economy](summoning-and-economy.md) ->
  [content guide](content-guide.md#adding-a-banner).
- **Pick up development:** [handoff](handoff.md) ->
  [roadmap](roadmap.md) -> [development guide](development-guide.md).
- **Change an important rule:** [decisions](decisions.md), then the affected
  system specification and its tests.

## Documentation maintenance

Keep each rule in one owning document and link to it elsewhere. Update documents
in the same change as related implementation. Replace open questions with approved
rules and decision references rather than leaving conflicting alternatives.
When code exists, add exact file, symbol, schema, and test links to these pages.
Do not invent those links ahead of implementation.
