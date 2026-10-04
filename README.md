# Last Light

An original cinematic 2D gacha RPG inspired by Brave Frontier.
The browser-playable prelude includes an animated title, fire/water/grass starter selection,
and three sanctuary screens: Home, Character Upgrades, and Events. Home displays
your companion and Squad/Summon buttons, with Adventure and story subactivities.
Inventory lives inside Character Upgrades; Settings opens in a side drawer.
Home features a central companion showcase, live stat panel, shortcut dock, and
Adventure launch. Character Upgrades uses a selectable area rail and detail panel.
Adventure (formerly Free Battle) uses only your saved starter against
endless Goblin/Imp/Rock Golem waves, with skills, passives, Shatter Gauge,
Last Flares, ultimate-only recovery
turns, and configurable hotkeys. Supplied artwork has transparent runtime exports.
Upgrade/equipment previews and currency names are shown; upgrades, equipping,
rewarded quests, summoning, currency spending, and Lycalis balances remain unimplemented.
Each defeated enemy drops 5-10 Fractalis into a persistent browser-local balance.
Every entry starts at wave 1. Enemy level equals the wave, HP/attack grow by a fixed
12% of base per wave, and defense increases by 1. Settings preserves the active run;
quitting ends it without losing currency.
Flaming Depths dungeon, wave reports, and captured fodder teams are
[documented for later implementation](docs/dungeons-and-captures.md).
Ten ascending-power [enemy art prompts](Art/Flaming%20Depths.md) are ready to generate.

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
- [Character and weapon art prompt guide](Art/midjourney-character-style-prompt.md).

Starter choice is saved only in this browser's local storage, not a cloud account.
Illustrations are owner-supplied assets; originals and transparent exports are
documented in the [art workflow](docs/art-workflow.md).
See [Adventure rules and kits](docs/free-battle.md) to customize combat.
Do not interpret the documentation's proposed combat/economy rules as implemented.
