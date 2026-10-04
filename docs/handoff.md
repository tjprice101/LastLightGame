# Current state and handoff

**Last updated:** 2026-10-03, playable opening implementation.

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
- Implemented menu surfaces: Character, Inventory, Story mode, Events, Settings.
  Story is a readable fire prologue; Events is a future placeholder. Motion settings
  save separately and update both canvas/CSS motion. Fractalis and Lycalis are labels,
  not balances. Upgrades and eight artifact slots plus one master relic are previews.
- Legacy water/grass saves require explicit fire re-selection without automatic
  overwrite. A failed confirmation preserves the old save.
- Not implemented: combat, quests, squad editing, summoning, upgrades/equipping,
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
The original art guide is preserved; SVG illustrations are temporary original
placeholders. Broader design documents still label unapproved mechanics as proposed.

## Next recommended action

Approve a small first battle scope and combat model (O-003/O-004 in the
[decision log](decisions.md)), then implement/test a combat resolver independently
of animations. Obtain approved art references before production asset work.

## Known gaps

- No approved numerical formulas, rates, prices, squad size, or balance tables.
- No supplied approved reference-image files/URLs in the workspace.
- No confirmed story, target devices, runtime asset pipeline, or commercial plan.
- Phaser contributes most of the 1.2 MB uncompressed production bundle; Vite
  reports a chunk-size warning. Target-device performance has not been profiled.

## Verification

- `npm test`: 20 passing tests for fire-only transitions, legacy re-selection,
  failed storage writes, lore/reveal budget, currency/slot/upgrade definitions,
  and independent motion settings persistence.
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
- Current menu checks: fire-only entry, preserved legacy save until confirmation,
  Fractalis/Lycalis labels, all five menu pages, exactly eight artifacts plus one
  master relic, seven upgrade paths, readable story, future events, settings
  persistence and 390px layouts. DOM-triggered input was used for the hidden tab.

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
