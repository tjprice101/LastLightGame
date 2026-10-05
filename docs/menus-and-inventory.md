# Menus and inventory

## Battle result overlays

Completed waves/stages show **Victory!**, combined earned rewards, optional
combat statistics, and Continue/Quit. At the last stage only Return to Gameplay
is offered. Defeat shows saved partial rewards with Retry/Restart and Quit.
The raised nonmodal sheet appears after the final death/loot animation, occupies
its own space without covering readouts, and supports View battlefield/header
reopen. Ordinary turn boundaries show short noninteractive Enemy/Your turn cues,
not Victory/reward dialogs. The old unstructured drop feed is removed.
Totals are actual per-kill awards; opening, dismissing, continuing or quitting
does not grant rewards again. See [battle details](free-battle.md#victory-defeat-and-turn-overlays).

## Creature Glossary

Home has a Creature Glossary rail button. The catalog includes all97 authored
enemy forms across Adventure, elemental dungeons and both infusion modes.
Unseen entries use black silhouettes with no revealed name or loot.
Encountering an enemy saves its color/name; first defeat unlocks its actual
per-enemy pool, quantity range and drop chances. Filter by activity and select
a stage within the form's range to inspect rarity/material gates.
Missing artwork remains an explicitly labeled neutral placeholder.
Discoveries persist in walletv2; old saves start empty, never inventing past kills.
Large late-game stats use the shared two-decimal formatter; combat keeps precision.

## Confirmed requirements

- Fire, water, and grass are available as first companions; choose one.
  Adventure uses only that saved character.
- **Fractalis** is the main currency; **Lycalis** is the premium currency.
- Characters support evolution, levels, weapon upgrades, and independent upgrades
  for the unique passive, ability 1, ability 2, and ultimate.
- Ultimate names always follow `Last Flare: <character-specific name>`.
- Each character has eight unique artifact slots and one separate special
  **Master Artifact** slot: nine equipment slots total. Artifacts buff the
  equipped character's stats; these slots belong to each character, not Inventory.
- Inventory, settings, and story-mode menus are needed; events come later.
- Seven bottom-navigation destinations: Home, Character, Gameplay, Events,
  Inventory, Squad and Summon. The owner approved the expanded navigation from
  the full UI concept, superseding the earlier four-screen limit. Squad and
  Summon are implemented owned-roster systems; Settings stays in a side drawer.
- The starting squad contains just the chosen starter; summon and equip up to two more.
- Character names carry a small neutral medal and readable role label: Infernis
  **Attacker**, Tizu **Tank**, Flora **Healer/Support**, matching their current kits.
  Roles appear in starter selection, Home/team, Character, Squad and ally battle
  labels. These are identity labels, not additional stat bonuses or targeting rules;
  enemies remain name/HP/Defense only. Role metadata lives in `src/content/starters.ts`
  and shared markup in `src/presentation/character-role.ts`.

## Implemented surfaces

Character Upgrades is a cinematic character-first stage: navigation on the left,
large portrait in the central column, and the selected detail panel on the right.
The portrait sits within a restrained elemental aura, halo and stage-light line;
current form title, name, role and saved progress remain visible below it.
Desktop art reaches600px, bounded by viewport height to keep identity visible.
Details scroll independently; costs/actions are never hidden behind disclosures.
Tablet uses portrait/navigation above a full-width panel; phones place the large
portrait first, followed by grouped navigation and details. All nine selectors,
44px targets and portrait-preserving tab/upgrade updates remain.

Battlefield art scales by visual progression: allies grow from1x at Evo1 to2.7x
at Evo6; elemental/specialty enemies grow from1x to2.7x across their authored
form line, with bosses adding0.4x (final3.1x). Adventure golems use1.2x.
Enemy formations use their actual unit count instead of reserving three columns,
so solo bosses occupy a full lane. Sizes remain bounded by the lane on small
screens; mobile enemies stack. Scaling changes neither stats nor source PNGs.
Facing, entrance, idle and attack transforms remain separate from layout sizing.
Unit lanes allow580px art/readout space. Short desktop screens now use a155px
base rather than120px, so evolved artwork does not shrink back to thumbnail size.

### Enemy-death loot

Rewards are generated and atomically saved per defeated enemy, not per wave.
After damage presentation, the defeated enemy fades280ms and disappears while
its exact rolled Fractalis/material stacks burst at its feet. Supplied item icons
use vertical loot beams, colored by rarity or specialty mode; art-pending materials
use explicitly labeled tokens rather than another element's art.
Each stack independently auto-collects over850-1849ms, with randomized scatter
and75-135% visual size. Guaranteed Seeds/specialties independently award their
stage base through double that base; successful higher-rarity rolls award1-2.
Difficulty gates and drop chances remain unchanged.
These are visual receipts for already-saved kills, not a second transaction.
Reduced motion skips enemy movement/fading and shows a static650ms receipt.
Input remains locked until presentation finishes; disposal cancels animations and
removes the burst. Defeat, exit, animation errors and retries never revoke or
duplicate the already-saved loot. Next-stage reports do not award extra items.

Home's main character artwork is an uncluttered centerpiece: up to720px on desktop
and620px on tablet/mobile, bounded by available width. The square contain-fit
keeps complete evolved wings, weapons and effects visible without cropping.
Team thumbnails, facing and idle pulse are unchanged.

Home intentionally omits passive/ability information and combat-icon shortcuts.
It retains identity, all seven current stats, lore and activity links, but removes
the orbit ring, Character caption and all upgrade shortcuts around the art.
Upgrade/equipment systems remain available through the bottom Character tab.
The complete kit remains available in Character and battle.

Every menu character portrait gently pulses in size from 1 to 1.025 and back over
five seconds: starter selection, Home showcase/team, Character, Squad and the
next-form silhouette. A shared inner `character-idle` wrapper separates this
movement from facing and upgrade celebrations, without moving nearby text.
Battle retains its existing equivalent inner pulse; fallen units remain still.
Both device and game reduced-motion preferences disable all idle pulses.
Full character stats remain available in these menus; the battle field displays
only HP, Defense and Shatter Gauge for allies, and HP/Defense for enemies.

Changing sanctuary destinations, entering a dungeon/Adventure, or opening a
character shortcut from Home uses a brief black loading curtain with a small
bottom-right **Loading!** track. Content renders and artwork decodes behind it;
input is inert until the curtain clears and destination heading regains focus.
Same-page taps, character tab updates, and gameplay category filters do not fade.
Unavailable activities remain unavailable and do not pretend to load a fight.
Reduced motion uses a short static loading indicator. See the
[encounter entrance contract](free-battle.md#activity-loading-and-encounter-entrance).

### Character screen organization

Menu icon artwork is deliberately large: ability detail art80px (72px on small
phones), character navigation art52px (48px on small phones), upgrade/inventory
materials64px and glossary drop icons56px. Menu navigation SVGs are32px and
bottom-navigation SVGs34px (30px mobile). Character navigation has a220px desktop
rail and at least68px buttons; small phones group larger buttons into two columns
instead of shrinking art to20px. Stat cells auto-fit to avoid splitting large
numbers when the wider rail reduces detail width. Portrait art and battle icons
are unchanged. Keep these sizes scoped to menus, not global SVG/image rules.

The Character screen uses a cinematic central identity stage with navigation
and details around it. The owned portrait, role medal,
element, weapon and saved level/form stay visible without duplicating the stats.
Navigation is grouped into **Character** (Overview, Artifacts / Equipment),
**Growth** (Evolution, Level, Weapon) and **Combat** (Passive, Ability 1/2,
Last Flare). All nine destinations remain directly accessible.

- Overview separates **Survival**, **Offense** and **Resource** stats, then
  displays the current passive and three abilities in a stacked desktop panel
  (two-column cards on tablets where the detail panel spans the screen).
  Values and descriptions use the selected character's resolved kit and icons.
- Level/evolution place the next-step comparison and all seven stat changes
  followed by **Required resources**, with explicit **Owned / Required** counts,
  missing-resource styling, eligibility reason and the confirmation action.
  General progression rules stay in optional disclosure; costs/requirements
  are never hidden. The next evolution remains a black silhouette.
- Weapon view separates **Current effect** from **Required resources**, with
  rank/Attack previews and a saved purchase. Ability views separate **Current
  effect** from **Upgrade availability**. Unimplemented independent upgrades remain disabled, without
  redundant placeholder comparisons or invented costs.
- Equipment separates the **Master slot** from the eight **Artifact slots**.
  Empty slots and the absence of bonuses remain explicit.

Responsive layouts place the large character portrait and grouped
navigation above the detail panel on phones. Cards stack when needed;
desktop details scroll independently while the character stays visible.
Controls remain at least 44px tall. Neutral surfaces retain each character's
elemental accent. Styles are scoped in `src/character-screen.css`; Home and the
field retain their existing layouts. Switching details preserves portrait DOM,
selected-button state and heading focus; upgrades keep their existing save flow.

Successful saved upgrades now celebrate on the owned portrait: leveling uses a
short elemental ring, six sparks and a gentle portrait lift/pulse; evolution
uses a longer twelve-spark aura and reveal of the newly owned colored form.
A temporary success label names the character and destination level/form.
These effects start only after the transaction and displayed progression update,
never on confirmation cancellation or rejected saves. They do not block controls,
rebuild the portrait, hide costs or replace persistent success feedback.
Repeated upgrades replace the prior effect; decorations clear automatically.
Both device and game reduced-motion preferences use a static label without
particles, scaling or fading. The next-form silhouette remains undisclosed
until it becomes the current owned form. Final-cap upgrades still show success.

The sanctuary navigation opens Home, Character Upgrades, Gameplay, Events,
Inventory, Squad and Summon. Settings is
a modal right-side drawer available from every sanctuary screen, with close/Escape
support and focus returned to its trigger. Matching PNG icons appear in the
existing Home character shortcuts and Character area selectors for Passive,
Ability 1, Ability 2 and Last Flare, as well as their existing detail panels.
There is no extra global ability strip duplicating those details.
Fractalis shows a saved local balance,
starting at 0 and increasing by 5-10 per defeated enemy. Lycalis shows its actual
saved balance, initially zero; first account Fracture grants 10. Fractalis is
spent on leveling/evolution. Lycalis spending and paid purchases remain unavailable.

The full UI concept guides sanctuary layouts, with the owner's newer color rule:
black/white primary chrome, neutral gray surfaces and element-specific accents.
The earlier blue/gold/rainbow theme is superseded. Angled banner-ready buttons,
rounded panels, geometric icons,
currency chips and persistent bottom navigation. No external fonts or new
dependencies are required. Title/selection and immersive battle keep their own
layouts; sanctuary layout is isolated in [the sanctuary stylesheet](../src/sanctuary.css)
and final palette rules in [the neutral theme](../src/neutral-theme.css).
Title ambient art and battle HUD also use neutral chrome. Character affinities,
elemental combat effects and supplied illustrations retain their real colors.
Primary Home/action-category banners have a 76px minimum height and the Adventure
launch a 128px minimum height, leaving room for future banner images. Long utility
rails scroll on desktop rather than shrinking buttons or clipping access.
Home has a left utility rail, a large central unboxed character without decorative
orbit rings or upgrade shortcuts, and a right-side current-team,
seven-stat panel with prominent Adventure launch. The only team entry is
the actual saved squad (one to three members), with the leader's portrait/stats.
Squad/Summon buttons open the implemented team editor and paid unowned-only pool.
Currency chips show actual saved Fractalis and Lycalis balances.
Tizu's displayed effective defense includes his passive.
Home, Character Overview, upgrade previews, weapon detail and battle readouts
share fractional progression values and display up to two decimals. Leveling
Infernis from 0 to 1 shows Defense 10->10.1, Attack 38->38.38 and Elemental Damage
8->8.08 rather than hiding increases behind integer rounding. Zero-base values
remain zero; see [growth and outcome rounding](units-and-progression.md#seven-stats-and-skillpassive-growth).
Desktop keeps the header/nav visible and scrolls long content/panels. Home fits
its Adventure launch accessible beside the character. At narrower widths,
the larger portrait occupies a full-width stage; mobile stacks the portrait,
Adventure, stats and utility shortcuts. Navigation remains visible at the bottom;
content scrolls rather than clipping controls. The concept's body-wide hidden
overflow and placeholder stats/health-slider behavior are not copied.
[Gameplay](gameplay-and-elements.md) groups Adventure, elemental dungeons,
evolution infusion, Story and Events by activity type. A neutral category rail
shows one content group at a time; selected category is exposed with
`aria-current`, remembered in its existing hash and retained through Settings.
Canonical game dungeon names take precedence over differing mock-up names.
Home retains quick entry.
Adventure and Story return to Gameplay rather than Home. Adventure is an endless-wave
mode with the saved starter and supplied scenery/art. It opens in a
full-viewport field state with Quit Adventure rather than sanctuary navigation;
quitting returns Gameplay and ends the run without discarding Fractalis. Each entry
starts at wave 1; Settings preserves the active run.
The battle toolbar's Speed selector persists 1x/2x/3x animation playback across
all activities, including Settings reconstruction and reload. It can change
during attacks without altering combat results. See
[battle animation speed](free-battle.md#battle-animation-speed).
[All ten elemental material dungeons](gameplay-and-elements.md)
have stage selectors and working entry buttons. Stage1 starts unlocked;
clear a stage to unlock its successor and replay any unlocked stage. Both infusion
modes have supplied banners, independent25-stage selectors, encounters and saved
specialty rewards. Character > Weapon now offers ranks0-10 with owned/required
costs, current/next Attack and saved confirmation; passive/ability upgrades remain
unavailable. Inventory includes all six specialty items. Captures are not implemented.
Story is readable and Events empty.
Flaming Depths and Oceanic Valley cards have supplied 3:1 banner art and their
respective orange/blue accents. Cards simply describe materials used for enhancing
characters and other items of the matching element. Enemy/reward art catalogs
and arena disclosures are not displayed; source/runtime artwork remains preserved.
Defeats in playable dungeons grant actual saved elemental materials.
Other dungeons reserve similarly sized banner slots and use their elemental accent.
Their battles use named enemies with neutral art-pending shapes and element-accented
arenas until supplied art is registered. These are playable encounters with real
saved rewards, not preview-only buttons.
Evolution shows only required own-element material artwork where supplied.
Character Upgrades shows
the saved companion's working combat kit and illustration.
Character has a left area-selector rail, central saved companion, and right detail
panel: Overview, all seven upgrade paths, and Artifacts / Equipment. Home dock
shortcuts open the corresponding area directly. Area buttons expose their selected
state and move focus to the detail heading. Settings preserves the selected area.
Within Character Upgrades, changing areas replaces only the detail panel and updates
the existing buttons' selected state. The character image, showcase, navigation and
Settings remain mounted; heading focus does not force a scroll jump or replay art.
Level and evolution panels show saved level/form, current/next stats, actual
owned/required currency/material counts and one action. Missing resources or
level-cap requirements disable that action with concise guidance. Confirmation
lists exact spending; cancellation changes nothing. Successful upgrades update
the detail/progress/currency displays without replacing the portrait or rail.
Detailed rules are collapsed; no all-rarity art catalog or placeholder cost text
appears on these panels. Creature costs are deferred in this first pass.
The next evolution is previewed as a solid black silhouette on a neutral light
backing, without its form title or colors. The owned portrait remains in color;
successful evolution reveals that form in the existing portrait. Final Evo.6
shows no next-form preview. This is a visual reveal, not asset-access protection.
Overview shows the real passive, abilities, Shatter Gauge costs, and cooldowns;
no mock-up health slider, estimated damage, fake levels, or additional owned roster
has been implemented. The saved starter remains the only owned companion.
Home and Character Overview display all seven stats: Shatter capacity, Health,
Defense, Attack Damage, Critical Rate, Critical Damage Multiplier and Elemental
Damage. Battle displays the same stats with current HP/gauge and resolved skills.
The level/Fracture panels enforce caps 30/45/60/75/90/105 across six forms,
preserved levels, +1% base per level, +10% base per evolution and first Fracture
+10 Lycalis. Growth is additive; level 90 Evo.5 is 2.3x base. The old level-reset
rule is superseded. All supplied evolved portraits now appear across Home,
Character, Squad and battle. Selection remains beginner art; tab changes keep
the current image mounted and evolution updates its source without replacing it.
All character portraits and evolution silhouettes share left-facing orientation
metadata, including selection and team thumbnails. Enemy sprites face right.
Only opposite-facing art is mirrored; frontal poses remain as drawn. See
[unit-facing integration](art-workflow.md#unit-facing).
Battle field labels use soft blurred black shadows instead of opaque boxes;
hold-and-drag opens an ornate four-direction guide with availability feedback.
These battle-only styles do not remove sanctuary menu/equipment panels.
[Editable first-pass costs](units-and-progression.md)
are implemented, and owned progression drives Home/Character/battle kits.
Standalone Inventory shows only positive-count owned material stacks.
Character > Artifacts / Equipment is a separate, character-scoped menu showing
exactly eight numbered artifact slots and one Master Artifact above them.
Home's equipment shortcut opens that same character menu, not global Inventory.
Artifacts buff only the equipped character's stats. All slots currently remain
empty; no artifacts have been granted and no equip, unequip, artifact ownership
or bonus calculation operation exists yet. Exact bonuses and stacking need definition.

Inventory lists saved material stacks or an honest empty-material state.
Equipment remains empty. Story mode contains a readable
starter-specific prologue, not playable battles or a chapter progression system.
Events is a reserved tab with no active events or timers.
Character shows an owned-companion picker above the existing upgrade tabs.
Squad exposes a required leader and two optional slots; saving validates distinct
ownership and persists their order. The starter is not locked to the squad.
Summon publishes remaining-pool odds and a 10-Lycalis cost, confirms before
spending, and reveals the saved acquisition. Insufficient funds or a completed
collection disables summoning. New companions must be equipped manually.
Captures, duplicate copies and additional currency sources remain unimplemented.

Settings supports persisted, validated ally/target selection keys (no attack
or Space end-turn shortcuts) and a motion preference: follow device settings or reduce
motion. Device reduced motion cannot be overridden. The setting updates both
Phaser ambient movement and CSS reveals immediately. Failed reads/writes are
reported; storage uses the separate `last-light.settings` key.
Opening Settings suspends battle presentation and detaches its hotkeys. Closing
restores the already-resolved battle state and uses the latest saved key bindings.
Combat's Settings drawer now uses the same neutral charcoal surface language,
crisp labels, rounded cards, full-width save actions and visible keyboard focus
as sanctuary controls. Combat-specific styles live in
`src/presentation/battle-ui.css`, scoped to `.battle-screen`; no additional
preferences or save formats are introduced.

## Legacy companion saves

All three version-1 starter IDs continue to the menu normally. The previous
fire-only re-selection policy is superseded: water/grass saves are not overwritten,
and Adventure uses their saved companion. New saves still require explicit
selection and a successful write before entering the menu.

## Equipment implementation requirements

Before enabling equipping:

- Define item instance IDs separately from artifact/Master Artifact definitions.
- Enforce eight distinct artifacts per character across all equip entry points.
  Clarify whether uniqueness means distinct item instances or distinct artifact
  definitions, and whether copies can be shared between different characters.
- Restrict the special ninth slot to Master Artifacts; it is not an extra regular artifact slot.
- Specify ownership, slot eligibility, swapping, locking, unequipping, and save migration.
- Define character-specific stat bonuses, additive/multiplicative stacking,
  interactions with level/evolution/passives and exact validation tests.
  Apply the same resolved equipped stats to Home, Character and combat;
  never implement a display-only bonus or account-wide equipment slot.

None of these unresolved rules should be implemented through silent defaults.

## Implementation references

- [Menu renderer](../src/main.ts)
- [Hub and character-area markup](../src/presentation/hub.ts)
- [Hub content tests](../src/presentation/hub.test.ts)
- [Currency, slot, and upgrade definitions](../src/content/progression.ts)
- [Available starters](../src/content/starters.ts)
- [Motion persistence](../src/presentation/settings.ts)
- [Opening/save transitions](../src/game/flow.ts)
- [Foundation tests](../src/content/progression.test.ts)
- [Legacy-save tests](../src/game/flow.test.ts)

See [units and progression](units-and-progression.md) and
[economy](summoning-and-economy.md) for the owning gameplay contracts.
