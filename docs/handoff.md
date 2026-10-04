# Current state and handoff

**Last updated:** supplied Infernis icons integrated into battle and character panels.

## Project state

- Phase: browser prototype; opening flow implemented.
- Confirmed goal: a cinematic gacha game inspired by Brave Frontier.
- Existing design asset: [character and weapon prompt guide](../Art/midjourney-character-style-prompt.md).
- Documentation entry points: [root README](../README.md),
  [documentation hub](README.md), and [AI instructions](../AGENTS.md).
- Stack: TypeScript, Phaser 3.90, Vite 7, Vitest 4; Node 22.12+.
- Implemented: animated title, fire/water/grass starter choice, explicit confirmation,
  local starter save, opening menu, saved-session continuation, save-error handling.
- Starter selection now includes bounded elemental reveals and original lore;
  first confirmation plays a companion awakening. Lore stays readable in the menu.
- Implemented primary screens: Home, Character Upgrades, Events. Home shows the
  companion and coming-later Squad/Summon buttons. Inventory is inside upgrades;
  Adventure and Story are Home subactivities. Settings opens in a modal side drawer.
  Story displays the saved starter's lore/prologue; Events is a future placeholder. Motion settings
  save separately and update both canvas/CSS motion. Fractalis shows a persistent
  local balance; Lycalis is a label only. Upgrades and equipment remain previews.
- Home now follows the supplied mock-up's utility rail / central character /
  right stat-passive panel / bottom character dock and Adventure launch.
  Character Upgrades has an area rail, central companion, and focused detail panel
  for Overview, seven upgrade paths, and Inventory / Equipment. Home shortcuts
  select these directly; Settings preserves the selected area. All content uses
  the saved starter. Tizu's effective defense is 24, not base 16.
  Render helpers live in `src/presentation/hub.ts`; no external fonts/dependencies
  or mock-up scripts were imported. Provided mock-up files remain untouched.
- Home now uses tighter spacing, a 240px desktop / 220px mobile square portrait,
  and a wider dock. Adventure is above utility shortcuts on mobile. Within
  Character Upgrades, tabs replace only the detail panel, preserving the exact
  showcase/image/rail/dialog DOM nodes without replaying entry animation.
  Detail focus uses preventScroll; a desktop minimum panel height limits jumps.
- All valid version-1 starter saves continue unchanged, including water/grass.
  The earlier forced fire re-selection policy is superseded.
- Implemented: solo Adventure using only the saved Infernis/Tizu/Flores, enemy waves,
  health/defense/damage/crit, one action per turn, ultimate-only recovery, all
  passives/skills/Last Flares, elemental effects, and persistent remappable hotkeys.
  See [rules and kit values](free-battle.md).
- Battle text now has opaque dark backing, stats/gauge/details at least 14px,
  instructions/logs 16px, readable disabled controls and defeated labels, and
  prominent keyboard focus. Only defeated artwork fades.
- Adventure uses a dedicated full-viewport field screen, without sanctuary
  chrome/nav. Unit sprites have no enclosing blue cards; name/stat readouts remain
  dark and readable. The compact HUD retains actions/hotkeys, end turn, restart,
  disclosures for full descriptions/log, and Settings. Quit Battle returns Home
  while retaining Fractalis but ending the run. Every entry starts at wave 1;
  Settings preserves the active run. Small screens scroll vertically as needed.
- Adventure supersedes Free Battle's name/session-resume policy. Enemies display
  level = wave. HP/attack add 12% of base per wave (rounded), defense adds 1 each
  wave; growth is linear, never compounded. Starter levels remain untracked.
- Owner chose documentation/art first for Flaming Depths: one separate future
  dungeon with higher-level waves, wave-end reports, and chance-based captures.
  Captures are separate weaker/squishier fodder with Normal/Heavy only and level
  upgrades only, never evolution. No dungeon/capture/team behavior is implemented.
  [Ten ascending-power art prompts](../Art/Flaming%20Depths.md) are ready to generate;
  [dungeon/capture contract](dungeons-and-captures.md) lists open balance/storage rules.
- Owner supplied all ten dungeon illustrations and explicitly selected a
  design-first pass through Stage 50. Originals moved byte-for-byte into
  `Art/source/enemies`; 960x960 transparent exports are in `public/assets/enemies`.
  All ten were reviewed together over dark backing; enclosed pale regions remain
  intentionally preserved by the existing matte algorithm, not manually retouched.
  `tools/prepare_art.py --assets <ids>` now supports targeted regeneration; default
  all-asset behavior remains unchanged.
- [Full 50-stage proposal](flaming-depths-stages.md): ten five-stage regions,
  three-enemy regular waves and solo elite milestones every fifth stage;
  increasing levels 6-55, base-relative HP/DEF/ATK growth, five skill ranks,
  exact hostile skill effects/schedules, report boundaries and final completion.
  Numbers remain proposed; hostile skills never transfer to captured fodder.
  No runtime dungeon definitions, scene, captures, reports, rewards, team edits
  or progression transactions have been enabled.
- Each ally has Shatter Gauge: starts 0, caps 100, Light +20, Heavy +30,
  incoming enemy hit +10 (including shields). Skills cost 25/40 and Last Flare
  costs 100; skills no longer generate resource. Battle meters/buttons and the
  character kit show gauge/costs. No persistent-save schema change is needed.
- Six supplied images moved to Art/source; transparent runtime exports are in
  public/assets. Portraits use the new names but retain old save IDs.
- Six Infernis icons are preserved under `Art/source/abilities/infernis`, with
  separate 256px RGBA / 224px content exports in `public/assets/abilities`.
  `tools/prepare_icons.py` reuses matte removal without applying unit dimensions.
  Adventure buttons use Light/Heavy/Ability 1/2/Last Flare icons; Home passive,
  Character overview/individual passive-skill areas and battle passive help use
  the matching art. Text/hotkeys/costs remain visible; water/grass remain text-only.
  Browser checks confirm all mappings, decoded icons, 32px square battle sizing,
  stable character portraits through skill tabs, working Light gauge gain, and
  all five controls/no horizontal overflow at narrow widths for every starter.
  Five Python tests now cover both unit and independent ability-icon exports.
- Grassy Field moved to `Art/source/backgrounds`, with a byte-identical landscape
  PNG in `public/assets/backgrounds`. It is wired behind the Adventure arena;
  no unit-art alpha removal or square normalization is applied.
- Not implemented: rewarded quests, squad editing, summoning, upgrades/equipping,
  currency spending, Lycalis balances, item acquisition,
  accounts, cloud saves, backend, payments.
- Character Upgrades now previews the confirmed Tier 1 level-30 cap and Fracture
  into Tier 2: major stat improvements (values pending), reset to 0, +10 Lycalis.
  Tier 2 levels to 30 using different resources. Owner selected previews only
  until materials/stat bonuses are defined. Saves remain version 1, with no
  invented current level/tier, Lycalis balance, materials, or Fracture transactions.
- Every newly defeated enemy grants 5-10 Fractalis, including burn kills.
  `last-light.wallet` version 1 stores a zero-start nonnegative integer balance.
  Wallet writes precede battle-state commit; failures visibly reject the action.
  Currency survives exit/restart/reload; corrupt wallets are never overwritten.
- Repository: [tjprice101/LastLightGame](https://github.com/tjprice101/LastLightGame).
- Deployment: [GitHub Pages](https://tjprice101.github.io/LastLightGame/),
  configured for the [Actions workflow](../.github/workflows/deploy.yml).
- Local Git preserves the remote's initial `main` commit.

Inspect the workspace again when resuming; this snapshot is not proof that
later contributors have made no changes.

## What this handoff delivers

See [opening flow](opening-flow.md) for behavior and source references.
The original art guide is preserved; supplied PNG art replaces SVG placeholders.
Adventure grants Fractalis enemy drops but no permanent roster grants. Broader design documents
still label unapproved production mechanics as proposed.

## Next recommended action

Approve the Flaming Depths stage balance and define captured-unit/team progression,
capture odds, dungeon rewards and scenery before implementing the dungeon.
Solo starter selection/battles and supplied grassy scenery are now implemented.
Playtest solo balance for each of the three starter kits, then approve upgrade costs,
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

- Dungeon intake: SHA-256 checks preserve all ten originals, Python's four
  image-processing tests pass across all 16 registered unit assets, and runtime
  PNG contract tests cover the new exports. A stage-table arithmetic check verifies
  exactly 50 sequential rows, ten known archetypes, levels 6-55, five rank bands,
  three-enemy regular lineups and exact stats for all ten elite milestones.
- Immersive field checks passed at 1280x720, 390x844, 320x640, and 844x390:
  scenery fills the viewport, sanctuary chrome/cards are absent, all five actions
  and full descriptions remain available, no horizontal overflow, and quit/re-entry
  retains earnings without leaking hotkeys. The old session-resume policy is
  superseded: Adventure re-entry starts a new run. Settings suspends input.
  Water/grass defeat screens retain the selected character and allow restart.
  Desktop/mobile screenshots reviewed; narrow/short screens scroll as needed.
- `npm test`: 89 passing tests for all three starter transitions and saved continuations,
  failed storage writes, lore/reveal budget, currency/slot/upgrade definitions,
  motion settings, combat formulas, all kits/passives, exact recovery/cooldown
  boundaries, status durations,   shield/heal caps, waves/defeat, hotkey validation, and every runtime unit PNG's
  960 x 960 RGBA export contract.
- Adventure tests verify wave-1 starts, enemy levels, and exact base-relative HP/
  attack and +1 defense across 20 waves; no compounded growth or invented ally level.
- Browser checks cleared wave 1 through real actions and reached wave 2 with Goblin
  HP 123, DEF 6, DMG 26 and every enemy showing level 2. Settings kept that wave/
  enemy state; quit/re-entry reset to wave 1/full HP while retaining three enemy
  payouts. All three starters retained their identities, spent actions through
  Settings, and reset actions/gauges on re-entry. Test storage was restored.
- Hub content tests cover all three real character kits, all nine areas, exact
  ability costs, effective defense, Fracture preview, and eight artifacts/master
  relic. Browser checks for each starter verify dock/rail selection, focus,
  unavailable upgrades, Settings tab preservation, battle/quit entry, and unchanged
  profile/wallet. Home/Character layout checks pass at 1280x900, 390x844, 320x640,
  and 844x390 with square contain-fit art and no horizontal overflow.
- Compact Home checks: at 1425x768 the full page fits without scrolling; at
  1280x720 Adventure and the dock are visible, with only a small footer scroll.
  Browser tab checks preserve exact image/showcase/rail/root/dialog nodes across
  all nine areas, with no showcase mutations and correct focus/selected state.
  Independent detail-render tests cover every starter/area with no portrait/nav markup.
- Reward tests cover all six integer payouts 5-10, repeatable independent reward
  randomness, ultimate multi-kills, burn kills, no repeated dead-enemy/ally payouts,
  wallet persistence, corrupt-save preservation, overflow and write failures.
  Headless Edge verified immediate payout/display, failed-write rollback/retry,
  no duplicate after navigation/Settings, restart/reload retention, and visible
  unavailable/error state for corrupt wallets.
- Solo browser checks passed for each starter: new selection/confirmation, saved
  reload, matching lore, exactly one ally, Heavy/skill resource changes, Settings
  state preservation, and restart retaining the chosen character. Existing saves
  continue without replacement. Desktop 1280px and mobile 320px text checks
  measured at least 14px for battle details and >=4.5:1 contrast, including
  unavailable controls; no overflow or overlapping battle sides. Screenshots reviewed.
- Fracture content tests verify the exact Tier 1 -> Tier 2, level-30 cap, reset-0,
  +10 Lycalis rule and pending materials/stats. Production-preview headless Edge
  checks verify visible rules, seven upgrade areas, no enabled transactions,
  unchanged version-1 save, and 320px layout without overflow.
- Scenery tests verify the runtime PNG equals the preserved source and retains
  1456 x 816 RGB dimensions. Headless Edge decoded the image at 1280px and 320px,
  checked full arena coverage, aspect-preserving cover sizing, enemy-left/ally-right
  layout, and working attacks; screenshots were reviewed for readable battle cards.
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
