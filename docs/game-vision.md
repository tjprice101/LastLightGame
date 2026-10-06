# Game vision

## Character terminology

Characters are **Element-Bearers**, not companions. Use **Owned Element-Bearers**
for the player's character collection and **starter Element-Bearer** for the initial
selection. Enemies/creatures remain enemies/creatures; owned captured units are
**captured creatures**, not Element-Bearers. Mixed teams use **squad members**.
This naming applies to
menus, instructions, accessible labels, errors, lore references and art prompts.
It does not change ownership, progression, combat or persistent save identities.

## Confirmed direction

- Project name: **Last Light**.
- A gacha game very similar in broad direction to **Brave Frontier**.
- Documentation should begin early and support owner customization and AI handoffs.
- A more cinematic presentation with many eventual animations and attack systems.
- First implemented scope: title -> first Element-Bearer choice -> basic opening menu;
  see [opening flow](opening-flow.md). Browser prototype stack selection was delegated.
- Existing character and weapon visual guidance lives in the
  [art prompt guide](../Art/midjourney-character-style-prompt.md).

Brave Frontier is a genre and experience reference, not a specification to copy.
Specific combat mechanics, story, native platforms, and commercial plans have not
been approved. The initial distribution is a browser page on GitHub Pages.

## Proposed design pillars

1. **Collectible identity:** units stay recognizable as their appearance and
   abilities develop.
2. **Squad-building choices:** team composition matters beyond raw rarity.
3. **Readable battles:** players can understand actions, damage, and effects.
4. **Expandable content:** new units and encounters use documented data contracts.
5. **Transparent progression:** costs, summon rules, and rewards are visible.

## Proposed core loop

Obtain units -> build a squad -> complete encounters -> receive rewards ->
improve units -> unlock harder encounters.

Summoning is one acquisition path. Starter and earned-unit paths are proposed
so the prototype can demonstrate the loop without purchases.

## Proposed first playable scope

- A small curated roster using placeholder or approved original assets.
- One configurable squad and a short sequence of battles.
- Basic attacks, at least one special skill, victory and defeat.
- One earned reward and one progression action.
- A simulated banner using test currency only.
- Save/load sufficient to retain roster and progress.

Roster count, party size, combat controls, and progression formulas remain open.
This is a candidate vertical slice, not an approved production scope.

## Deferred unless separately approved

Real-money purchases, PvP, guilds, multiplayer, live events, competitive rankings,
daily obligations, and large-scale content production.

## Owner decisions needed

See [open decisions](decisions.md#open-decisions) before committing to an engine,
combat model, monetization model, or service architecture.

## Success criteria to define

Before tuning, choose target session length, supported devices, performance
budget, accessibility requirements, and what makes squad choices meaningful.
Set measurable targets with the owner; do not invent launch metrics.
