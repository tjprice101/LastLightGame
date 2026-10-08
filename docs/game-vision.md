# Game vision

## Character terminology

Character form display names use **Prefix, Character name**, with each
evolution's existing title as its prefix (D-098). For example **Gale Wayfarer,
Atmoso** then **Crosswind Adept, Atmoso**. Short names remain identity references
in prose/lore; creature names and stable save IDs are unchanged.

Characters are **Element-Bearers**, not companions. Use **Owned Element-Bearers**
for the player's character collection and **starter Element-Bearer** for the initial
selection. Enemies/creatures remain enemies/creatures; owned captured units are
**captured creatures**, not Element-Bearers. Mixed teams use **squad members**.
This naming applies to
menus, instructions, accessible labels, errors, lore references and art prompts.
It does not change ownership, progression, combat or persistent save identities.

## Confirmed direction

- D-149 installs the18 newly supplied Infernis/Tizu/Flora portraits, Beginner
  through Omnic, with reviewed offline background cleanup and shared facing/
  cache revisions. Original and previous generations remain preserved.
  Ownership, forms, names and gameplay are unchanged.
  [Starter intake](art-workflow.md#replacement-starter-portraits-d-149).

- D-147: style references are exclusive to character/enemy portraits, retaining
  approved evolution mapping and weight400. Items, weapons, ability icons,
  banners, arenas and all other art use no `--sref` or `--sw`; keep the written
  renderer and designs unchanged. Supersedes non-portrait reference exceptions.

- D-145: Elemental War design-first, not implemented. Each character-themed
  activity has10 stages90-140, six forms and1% final-boss base-form EB recruitment.
  Guaranteed Prismatica, separate chance of Null-Prismatica, no other loot;
  successful owned recruitment converts to existing currency. Activity-header
  banners only, not summon banners. Two female/one male original design
  proposals and complete art packs are in [Elemental War](elemental-war.md);
  their names/kits/6-star values/balance/mapping are not owner-approved yet.

- D-135: future prompts must keep the entire character/enemy design clear of
  every frame edge and corner at every form. Uniformly pull back composition
  when needed; do not sacrifice armor, equipment, powers or layered detail.
  Late forms retain dense intimidating presence. Complete containment takes
  priority over historical near-edge occupancy targets; scenery stays full-bleed.
  [Framing contract](../Art/cutout-background-contract.md#complete-silhouettes-and-edge-clearance-d-135).
- Current art status: D-129/D-131/D-132 establish exact style references and
  portrait/enemy prompt quality; D-134 installs60 replacement portraits for
  ten non-starter Element-Bearers, preserving both generations and saves.
  D-133 renames visible currencies Prismatica/Null-Prismatica; their prism
  replacement prompts are reference-free under D-147; D-142 installs both supplied crystal icons.
  [Art workflow](art-workflow.md) distinguishes prompts from installed art.

- D-124 sets Thornia/Crinso's final compact anime/cel progression as the shared
  future art standard: increasingly wild but elegant armor/wing/mechanical
  architecture and opaque powers, not realistic anatomy. Machine creatures
  restore from broken black/white futuristic forms to majestic mythic creations.
  [Machine expansion](awaken-the-machines.md) supplies28 generation prompts;
  Rosetta remains unchanged after the owner withdrew the requested revert.
- Project name: **Last Light**.
- A gacha game very similar in broad direction to **Brave Frontier**.
- Documentation should begin early and support owner customization and AI handoffs.
- A more cinematic presentation with many eventual animations and attack systems.
- First implemented scope: title -> first Element-Bearer choice -> basic opening menu;
  see [opening flow](opening-flow.md). Browser prototype stack selection was delegated.
- Existing character and weapon visual guidance lives in the
  [art prompt guide](../Art/midjourney-character-style-prompt.md).
- D-109 restores compact character anatomy throughout evolution. Owner rejected
  Bruno's D-107/D-108 transformation directions and prefers the current Bliss
  approach: epic armor, equipment, wings and regalia around the same compact
  character, not changed divine bodies/world scale. No supplied assets changed.
- D-114 withdraws D-113's Roses-only less-chibi anatomy direction: restore
  compact Bliss/Bruno-style anatomy throughout, with amplified armor, weapons,
  wings and elemental splendor around the same body. Eyes-only anime/cel/
  painted rendering, identities and vibrant palettes remain.
  D-113's three6-star rose EBs,1.1% equally split and pity remain approved.

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
