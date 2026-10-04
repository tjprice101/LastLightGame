# Current state and handoff

**Last updated:** Shatter Gauge and ultimate-only recovery.

## Project state

- Phase: browser prototype; opening flow implemented.
- Confirmed goal: a cinematic gacha game inspired by Brave Frontier.
- Existing design asset: [character and weapon prompt guide](../Art/midjourney-character-style-prompt.md).
- Documentation entry points: [root README](../README.md),
  [documentation hub](README.md), and [AI instructions](../AGENTS.md).
- Stack: TypeScript, Phaser 3.90, Vite 7, Vitest 4; Node 22.12+.
- Implemented: animated title, fire-only starter choice, explicit confirmation,
  local starter save, opening menu, saved-session continuation, save-error handling.
- Starter selection now includes bounded elemental reveals and original lore;
  first confirmation plays a companion awakening. Lore stays readable in the menu.
- Implemented primary screens: Home, Character Upgrades, Events. Home shows the
  companion and coming-later Squad/Summon buttons. Inventory is inside upgrades;
  Free Battle and Story are Home subactivities. Settings opens in a modal side drawer.
  Story is a readable fire prologue; Events is a future placeholder. Motion settings
  save separately and update both canvas/CSS motion. Fractalis and Lycalis are labels,
  not balances. Upgrades and eight artifact slots plus one master relic are previews.
- Legacy water/grass saves require explicit fire re-selection without automatic
  overwrite. A failed confirmation preserves the old save.
- Implemented: Free Battle practice team (Infernis/Tizu/Flores), enemy waves,
  health/defense/damage/crit, one action per turn, ultimate-only recovery, all
  passives/skills/Last Flares, elemental effects, and persistent remappable hotkeys.
  See [rules and kit values](free-battle.md).
- Each ally has Shatter Gauge: starts 0, caps 100, Light +20, Heavy +30,
  incoming enemy hit +10 (including shields). Skills cost 25/40 and Last Flare
  costs 100; skills no longer generate resource. Battle meters/buttons and the
  character kit show gauge/costs. No persistent-save schema change is needed.
- Six supplied images moved to Art/source; transparent runtime exports are in
  public/assets. Portraits use the new names but retain old save IDs.
- Not implemented: rewarded quests, squad editing, summoning, upgrades/equipping,
  currency balances/transactions, item acquisition,
  accounts, cloud saves, backend, payments.
- Repository: [tjprice101/LastLightGame](https://github.com/tjprice101/LastLightGame).
- Deployment: [GitHub Pages](https://tjprice101.github.io/LastLightGame/),
  configured for the [Actions workflow](../.github/workflows/deploy.yml).
- Local Git preserves the remote's initial `main` commit.

Inspect the workspace again when resuming; this snapshot is not proof that
later contributors have made no changes.

## What this handoff delivers

See [opening flow](opening-flow.md) for behavior and source references.
The original art guide is preserved; supplied PNG art replaces SVG placeholders.
Free Battle has no rewards or permanent roster grants. Broader design documents
still label unapproved production mechanics as proposed.

## Next recommended action

Owner correction: the game starts with **one player character, not a team**.
The current three-starter Free Battle practice implementation does not yet match
that intended starting experience. [Battle Scenery](../Art/Battle%20Scenery.md)
now provides the requested grassy-field generation prompt. Next, integrate an
approved background and adapt the opening battle to the solo character; do not
interpret the temporary practice team as an approved starting roster.

Playtest the initial three-starter balance and attacks, then approve upgrade costs,
item ownership/uniqueness, and rewarded quest rules before connecting battle to
progression/economy. Add future animation frames without changing resolver results.

## Known gaps

- Prototype combat values were delegated and implemented; production balance,
  summon rates/prices, rewards, and squad editing rules remain open.
- Midjourney style-reference URL is absent; supplied runtime art is available.
- No confirmed story, target devices, runtime asset pipeline, or commercial plan.
- Phaser contributes most of the 1.2 MB uncompressed production bundle; Vite
  reports a chunk-size warning. Target-device performance has not been profiled.

## Verification

- `npm test`: 62 passing tests for fire-only transitions, legacy re-selection,
  failed storage writes, lore/reveal budget, currency/slot/upgrade definitions,
  motion settings, combat formulas, all kits/passives, exact recovery/cooldown
  boundaries, status durations,   shield/heal caps, waves/defeat, hotkey validation, and every runtime unit PNG's
  960 x 960 RGBA export contract.
- Shatter tests cover zero-start/independent gauges, exact costs for every starter
  ability (including support), insufficient-resource rejection without mutation,
  attack/incoming-hit gains and cap, shielded/lethal hits, no passive/burn gain,
  wave carryover, and ultimate-only recovery boundaries.
- Local headless Edge verified real battle UI: zero-start meters and disabled
  skills, Heavy +30, incoming-hit gains, 25/40 skill spending, next-turn availability,
  gauge cap, Last Flare cost/recovery/expiry, and 320px layout without overflow.
  Used a separate browser profile because the shared browser connection was unavailable.
- `npm run build`: strict type-check and production build pass; bundle warning above.
- `npm audit`: zero known dependency vulnerabilities after updating Vitest.
- `npm ci`: clean lockfile restore passes with npm 10 after stopping the
  project's development server to release Windows' esbuild executable lock.
- Earlier browser checks: all three original starters selected/saved/reloaded before
  the fire-only restriction; keyboard title entry; explicit
  selection gate; 390px layout without horizontal overflow; pointer completion;
  corrupt saves preserved with visible errors; failed writes do not advance;
  reduced-motion CSS verified.
- Browser test save changes were restored to the previous local value.
- Development server returned HTTP 200 at `/LastLightGame/`.
- [First deployment workflow](https://github.com/tjprice101/LastLightGame/actions/runs/37174431784)
  completed successfully. The public page returned HTTP 200, and a live browser
  check verified canvas/assets, starter selection, and saved reload with no
  uncaught browser errors.
- npm 10 hit a resolver error when upgrading Vitest; `npx npm@11.6.0 install`
  resolved it. The committed lockfile is used by `npm ci`.
- Reveal browser checks used DOM-triggered clicks because the shared browser tab
  was hidden and native input/animation actionability stalled. Verified all three
  lore/reveal variants, focus preservation, 12-mote limit, no preview save,
  first-arrival-only awakening, saved lore, reduced-motion styles, and 390px layout.
  Visual playback in a visible tab remains a manual check.
- Earlier menu checks: fire-only entry, preserved legacy save until confirmation,
  Fractalis/Lycalis labels, exactly eight artifacts plus one
  master relic, seven upgrade paths, readable story, future events, settings
  persistence and 390px layouts. DOM-triggered input was used for the hidden tab.
- Three-screen browser checks: exactly Home/Character Upgrades/Events navigation,
  Home Squad/Summon buttons, seven upgrade areas and integrated inventory, drawer
  motion persistence/focus return on every screen, battle input suspension/resumption,
  and no horizontal overflow at 320px. Storage and viewport were restored.
- Earlier Free Battle browser checks (before Shatter Gauge): all nine starter
  skills/ultimates, original heavy recovery, all six decoded assets, enemy-left/team-right mobile layout, hotkey
  remap/display/persistence/guards, duplicate rejection, listener cleanup on repeated
  navigation, and first-action-only resolution. Animation tests created all three
  ultimate variants and explicitly finished Web Animations to verify cleanup in the
  hidden shared tab; navigation cancellation preserves the resolved state.
- Alpha exports checked for transparent borders, partial-alpha edges, opaque
  interiors; a dark-background contact sheet was visually reviewed.
- [Free Battle deployment](https://github.com/tjprice101/LastLightGame/actions/runs/37176473879)
  passed. All six public PNGs returned HTTP 200; live browser checks verified
  decoded art, Cinder Cleave, Tidal Shelter, keyed Worldseed, enemy phase, and
  recovery without uncaught errors. Browser test storage was restored afterward.
- All 167 local documentation links/anchors across 19 Markdown documents resolved.
- Unit art standardized to centered 960 x 960 canvases, longest content dimension
  864px and minimum 48px padding. Source originals remain unchanged. Four Python
  image tests check aspect preservation, white-interior preservation, export
  occupancy/centering/padding, and empty-image rejection.
- Browser sizing verified at 1280px, 390px, and 320px across selection, sanctuary,
  character, and battle: equal battle slots, square images, contain fit, correct
  natural sizes, and no horizontal overflow.

For setup and deployment commands, use the [development guide](development-guide.md).

## Handoff update template

Replace the current-state sections with the latest truthful snapshot; preserve
important decision history in the decision log instead of accumulating conflicting
snapshots here.

```text
Updated date and contributor:
Current phase:
Task/goal:
Confirmed requirements used:
Changes made and file links:
Implemented behavior:
Validation: exact commands/checks and outcomes:
Known issues and limitations:
Open decisions/blockers:
Next concrete action and prerequisites:
```
