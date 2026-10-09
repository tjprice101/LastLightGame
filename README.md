# Last Light

An original cinematic 2D gacha RPG inspired by Brave Frontier.

## Current state and art direction

Use the [documentation index](docs/README.md) and
[current handoff](docs/handoff.md) for implemented behavior and verification.
The original prototype overview below is a superseded historical snapshot,
not the current feature checklist.

- D-129/D-131/D-132: evolution-matched style references, upgraded character
  prompt construction and enemy references with complete silhouette containment.
- D-133: visible currencies are **Prismatica** and **Null-Prismatica**;
  legacy save/asset IDs and economics remain unchanged. Bright/dark crystal
  prompts use Evo.3, but replacement currency images are still pending.
- D-134:60 new portraits for the ten non-starter Element-Bearers are installed,
  background-removed and shared across menus, galleries, banners and battles.
  New originals and previous portraits are preserved with verified hashes.
- D-135: future prompts emphasize visible safety margins on all sides/corners
  for every evolution. Pull back the complete composition rather than remove
  details or diminish armor/powers; late forms retain dense intimidating art.

See the [art workflow](docs/art-workflow.md),
[prompt guide](Art/guides/midjourney-character-style-prompt.md) and
[edge-clearance contract](Art/guides/cutout-background-contract.md#complete-silhouettes-and-edge-clearance-d-135).

## Historical prototype overview (superseded)

The browser-playable prelude includes an animated title, fire/water/grass starter selection,
and seven sanctuary destinations: Home, Character Upgrades, Gameplay, Events,
Inventory, Squad and Summon. Squad and Summon are coming-soon previews.
Settings opens in a side drawer. The full-concept UI uses colored angled menus,
neutral black/white panels, element-associated accents, bottom navigation and a central Element-Bearer showcase with
hexagonal upgrade shortcuts. Home retains real stats and Adventure launch.
Character Upgrades uses a stable selectable area rail and detail panel.
All 15 supplied evolved portraits are integrated across Home, Character, Squad
and battle. Six forms cap at 30/45/60/75/90/105; the final evolution uses Epic
Crests and Legendary Hearts. [Tizu](Art/characters/Tizu%20Art.md) and
[Flora](Art/characters/Flora%20Art.md) now have six ability/action icon prompts each.
Those icons are prompts only until generated art is supplied.
Inventory is available independently and within Character Upgrades.
Adventure (formerly Free Battle) uses only your saved starter against
endless Goblin/Imp/Rock Golem waves, with skills, passives, Shatter Gauge,
Last Flares, directional drag controls, right-click Defense, ultimate-only recovery
turns, and configurable hotkeys. Supplied artwork has transparent runtime exports.
Character leveling and evolution now spend Prismatica and own-element materials,
persist progress and scale the combat kit everywhere. First account Fracture grants
10 Null-Prismatica. Equipment, separate skill/weapon upgrades, rewarded quests and summoning
remain unimplemented. See [editable upgrade costs](docs/units-and-progression.md).
Each defeated enemy drops 5-10 Prismatica into a persistent browser-local balance.
Every entry starts at wave 1. Enemy level equals the wave, HP/attack grow by a fixed
12% of base per wave, and defense increases by 1. Settings preserves the active run;
quitting ends it without losing currency.
Gameplay organizes Adventure, ten elemental material dungeons, the Heavens/Abyss
infusion modes, Story and Events. The shared
[element/material framework](docs/gameplay-and-elements.md) includes dungeon levels
10-120 and six-form evolution requirements. Flaming Depths, Oceanic Valley and
Garden of Beauty are playable across 50 progressively unlocked/replayable stages.
Defeats grant saved materials; stage-clear reports precede advancement.
The other seven dungeons, infusion modes and captured fodder remain unavailable.
Ten ascending-power [enemy art prompts](Art/creatures/Flaming%20Depths.md) remain available as references.
All ten dungeon illustrations are now organized with transparent exports; the
[Stage 1-50 draft](docs/flaming-depths-stages.md) proposes encounters, hostile abilities
and elite milestones; its old level/stat numbers are superseded by the new framework.
Garden of Beauty now uses its supplied eight enemies, banner, arena and six
materials. Dungeon balance is a first-pass tuning baseline.
Flaming Depths and Oceanic Valley show supplied banners and concise elemental
material descriptions, without enemy/reward art catalogs. Evolution shows only
required materials and real owned/needed quantities. Creature infusion costs are
explicitly deferred for this pass. All progress is local; play in one browser tab.

## Play and develop

- Deployment: [Last Light on GitHub Pages](https://tjprice101.github.io/LastLightGame/).
- Repository: [tjprice101/LastLightGame](https://github.com/tjprice101/LastLightGame).
- Stack: TypeScript, Phaser 3, Vite, and Vitest.
- Node.js 22.12+ is required (Node 22 LTS recommended).

```sh
npm ci
npm run dev
npm test
npm run build
```

Open the local URL printed by Vite, including `/LastLightGame/`.
See [setup and deployment](docs/development-guide.md) for details.

## Start here

- [Documentation hub](docs/README.md): design, systems, technical planning, and workflows.
- [Game vision](docs/game-vision.md): confirmed direction and proposed scope.
- [Development guide](docs/development-guide.md): how to add your own features.
- [Handoff and current state](docs/handoff.md): what exists and what to do next.
- [AI agent instructions](AGENTS.md): project-specific rules for future agents.
- [Character and weapon art prompt guide](Art/guides/midjourney-character-style-prompt.md).

Starter choice is saved only in this browser's local storage, not a cloud account.
Illustrations are owner-supplied assets; originals and transparent exports are
documented in the [art workflow](docs/art-workflow.md).
See [Adventure rules and kits](docs/free-battle.md) to customize combat.
Do not interpret the documentation's proposed combat/economy rules as implemented.
