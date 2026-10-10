# Menus and inventory

## Contextual desktop navigation (D-166)

The approved D-160 desktop pass retains the four Home/Team/Summon/Play dock
destinations, large character art, contextual categories and existing curtain/
panel/drawer animations. Menu now lists secondary routes rather than repeating
the dock; Inventory/Collections/Conduit Store/Upgrade/Story/Events/Stores remain
reachable. Back names its actual prior destination, including cross-links,
and retains the existing filter/tab/scroll history rather than always going Home.

Return to title exists only in Settings. In battle it confirms ending the run,
retains saved rewards and disposes the suspended session; Cancel stays in Settings.
Confirmation submissions and Escape settle explicitly, without waiting for a
browser-render-scheduled native close event; native dismissal remains supported.
Saved reward Continue/Escape uses the same explicit completion guarantee, with
existing animation/listener/focus cleanup and no additional economy transaction.
Closing menu Settings no longer rebuilds the screen, preserving live category,
filters, unsaved squad selection, scroll and portrait DOM. Battle still rebuilds
from its retained snapshot without repeating entrance presentation.

Desktop Gameplay, Character and Summon use the page scroll instead of stacked
bounded panel scrolls; modal drawers, explicit selection lists and galleries
keep intentional contained scrolling. Neutral button hover feedback enhances
the existing panel animations and honors both reduced-motion preferences.
Title/selection/immersive battle CSS and economy are unchanged.

Validate sanctuary/settings/inventory/navigation/copy tests, production build,
and disposable browser contexts at desktop/mobile widths: contextual Back,
Settings/Escape restoration, all routes, single-scroll content, exact large
balances/costs, reduced-motion/focus and battle title-cancel/confirm. Do not write
to owner storage. This is the desktop contextual-flow pass, not new artwork or
the deferred remaining intrinsic character kits.

## In-game dialogs and reward foundation (D-148)

No browser `alert`, `confirm`, `prompt`, Notification permissions or OS
notifications may originate from the game. `presentation/game-dialog.ts`
provides styled HTML dialogs in the game's own page, distinct from browser
message boxes. Every former browser-confirm path uses this helper: save
recovery, Conduit purchase/upgrade, creature sale/leveling, character
level/evolution, summon and battle restart/replay. Existing HTML Settings,
Information, Max Level and battle dialogs remain in-game.

Confirmations show the real cost/consequences, Cancel and a named action.
Cancel receives initial focus, Escape cancels, the underlying page is inert
through browser modal semantics and focus restores on close. Only one shared
dialog runs at a time; background game keyboard handlers do not act while open.
Destructive warnings and transaction-time reread/validation remain unchanged.

`presentation/reward-screen.ts` is the shared acquisition reveal/receipt:
- Save first, animate second. Never run economy logic, RNG or a Claim
  transaction from presentation. Explicit Continue dismisses only the receipt.
- A 2400ms elemental geometric Light portal precedes actual reward art/details.
  Skip or Escape during animation goes straight to the saved result, never
  discards it. Escape after reveal dismisses; Continue remains keyboard/touch
  accessible. Reduced motion shows the receipt immediately without animation.
- Summons show the actual new Element-Bearer or creature, awarded base/fixed
  form art/stars/rarity/element/level, spent currency, pity guarantee if used,
  and separately saved Legendary Conduit bonus. Duplicate characters show
  the awarded converted creature and explain conversion, not false ownership.
- Conduit purchases and upgrades share this screen with actual icon/meter,
  rarity/modifiers, owned count and spending receipt. Existing character
  growth celebrations and battle loot/results remain their domain-specific
  presentation, with no extra persistence or collection actions.
- Animation cancels on Skip/close/disposal. Image failures are reported in the
  receipt without claiming the saved reward failed. Failures after saving must
  explicitly distinguish saved rewards from rejected transactions.
- Georgia/neutral framing, element-associated glow, current art/facing and
  deployment-base URLs; no new art requests, dependencies, sounds or services.

Validation: `npm test -- src\presentation\game-dialog.test.ts
src\presentation\summon-presentation.test.ts
src\presentation\conduit-upgrade.test.ts`; full `npm test` and
**Build Last Light** (`npm run build`). The source policy regression rejects
browser/OS popup APIs. Browser-check cancellation/Escape, double activation,
real saved new/duplicate/creature/bonus receipts, Skip/natural completion,
reduced motion, failed save, focus and mobile containment using isolated storage.

## Primary-screen copy cleanup (D-146)

Keep primary screens focused on the player's current items, choices and actions.
Do not repeat the page title as an explanatory sentence or expose prototype
versions, implementation commentary, redundant confirmation reminders or long
formula descriptions on the main surface. Help and Information remain available
for detailed rules; do not remove prices, exact balances/stats/odds, requirements,
disabled-action reasons, protection warnings or transaction/error feedback.
Meaningful story, character identity and lore are not generic help text.

- Inventory removes its introductory sentence and acquisition paragraphs from
  empty states. Currency cards use names without redundant main/premium/usage
  suffixes. Upgrade and Information share one compact action row; empty states
  keep their heading and destination button.
- Conduit Store cards focus on rarity, name, modifiers, copies, price and Buy;
  remove repeated drive-type/lore paragraphs and successful-affordability
  confirmation reminders. Upgrade removes its introductory sentence and long
  empty-state instructions, retaining current/next effects, costs and shortages.
- Team removes repeated category eyebrows, the duplicate Squad instruction
  footer, and nonfunctional ability-upgrade cards/buttons. Skill detail panels
  retain the complete actual effects; Character Information explains how skills
  grow through levels/evolution. Equipment restrictions remain beside equipment.
- Play removes the machine component formula repeated outside Information and
  its redundant Conduit description, keeping stage/level/reward facts and tier
  odds. Story entry and prologue omit repeated no-reward implementation notes.
- Summon omits the generic confirmation reminder when affordable; shortage and
  unavailable reasons, base-rate qualifications, exact odds and pity remain.
- Sanctuary header omits the prototype subtitle; Menu omits the unrelated
  Adventure/run note and fixed starter-origin subtitle. Contextual Help remains.
- Archives, Settings and battle retain their relevant discovery, preference,
  combat and reward information rather than stripping meaningful data.

Validation: `npm test -- src\presentation\ui-copy.test.ts
src\presentation\inventory.test.ts src\presentation\hub.test.ts
src\presentation\conduit-upgrade.test.ts src\presentation\conduit-store.test.ts
src\presentation\roster.test.ts src\presentation\sanctuary.test.ts
src\presentation\activity-banner.test.ts`; **Build Last Light**
(`npm run build`). Copy tests exclude closed dialogs when checking primary
surfaces and separately require the detailed rules to remain available.
Browser-check Inventory empty/owned tabs, Store/Upgrade, Team skill detail,
Summon and Play; Help/Information still open and no currency/save changes occur.

## Connected Sanctuary reference (D-144)

The owner requests the supplied Sanctuary HTML/Markdown be fully connected,
not merely approximated with demo actions. Follow-up approvals explicitly
restore the **Home / Team / Summon / Play** dock and combine team management
under **Squad / Element-Bearers / Captured Creatures**. Keep **Georgia** and the
game's neutral charcoal/ivory surfaces with associated element accents.
This supersedes D-079/D-080/D-090/D-093/D-123's no-dock and separate
Character/Squad directions below. Their unchanged economy, accessibility,
discovery, equipment and portrait-preservation contracts still apply.

### Implemented screens and real wiring

- **Header:** brand left, page title centered, exact base-aware currency icons/
  balances right, clickable Inventory pills, round Help/Menu. Retain both
  balance IDs and history-aware Back. Mobile Back becomes an accessible icon
  button; full names/values wrap rather than truncate.
- **Dock:** four icon-over-label destinations and an ivory active tile on
  sanctuary menus. Legacy Character/Squad navigation normalizes to Team's
  appropriate area. No dock on title, selection, combat or battle results.
  Utility screens remain reachable through Menu rather than gaining fake dock
  destinations. No additional saved navigation fields or migration.
- **Home:** two matching cropped Standard/real limited-banner tiles with
  overlaid Showcase, large saved leader art, translucent identity plate with
  separate form prefix/name, stars, actual short lore/level and View character
  (or the exact captured leader). Three real squad slots and Adventure entry.
  Remove redundant left menu shortcuts. Desktop tiles are196px; phone tiles
  grow to256px so long banner names, complete subtitles and44px Showcase do
  not overlap. The portrait leads on phones; banners/squad follow in two columns.
- **Team / Squad:** three portrait cards, leader first, all owned instance IDs
  in the roster, pick-member then pick-slot assignment, optional Remove and
  explicit Save. Moving an already assigned member swaps occupants; moving the
  leader into an empty slot requires a replacement first. Native named
  selection panels remain as an accessible alternative. Draft changes do not
  write; existing `setSquad` rereads and validates on Save.
- **Team / Element-Bearers:** large portrait left, framed450px panel right,
  owned roster under the portrait; Details/Growth/Conduits selectors. Details
  shows all actual stats/skills; optional individual skill panels retain the
  existing tab IDs. Growth preserves Level/Evolution, exact deltas, resource
  eligibility and confirmations. Conduits retains reserved Master and eight
  ordinary slots, four columns on desktop. Tab/upgrade/equipment updates keep
  portrait DOM and facing; saved growth also refreshes the owned thumbnail/name/
  level. No independent skill/weapon upgrades were invented.
- **Team / Captured Creatures:** the reference's placeholder is replaced with
  existing real per-UUID selection, retained kits, leveling/max-level, locks,
  equipment, protected sales and squad links. Captures remain creatures.
- **Play:**270px categorized desktop rail, selected framed detail with cropped
  named scenery, three fact cards, actual reward icons and a stage/entry footer.
  Desktop detail scrolls while its entry remains reachable; phone rail scrolls
  horizontally and entry follows content. All ten elemental dungeons,
  Heaven/Abyss, Treasury/Sanctuary,100-stage Machines, Roses, Adventure and
  authored story remain reachable. No placeholder disabled activities or
  missing-image requests. Exact current rules remain in Information.
- **Summon:** real banner/availability/Showcase/rates left, draw/cost/
  affordability/pity right. Desktop left panel scrolls independently; phones
  place the draw after banner art, before the full availability/rates lists.
  Star filters only hide rate rows; one actual table per banner retains exact
  names, awarded rarity/stars and probabilities. Tier bar/totals and both pity
  meters derive from live content/counters. All detailed rules remain in the
  accessible Rates & Information dialog. No mock pool, fabricated pity, free
  draw, automatic equipment or changed atomic cost/reward behavior.
- **Inventory / Collections:** retain the reference's large currency cards,
  Materials/Conduits tabs and actual positive holdings grids; the real BMC
  balance is the necessary third card. Existing three galleries, filters,
  current artwork, discovery/ownership silhouettes and protection remain.
- **Menu / Help:** native right-side380px sheets, featured Inventory/Collections
  tiles, Conduits/Game sections, real Store/Upgrade/Events/Story/Settings/title
  destinations, contextual instructions. Close, scrim and Escape restore focus.
  No auto-tutorials, demo toasts or unconnected actions.

### Implementation and validation

The final composition is `src/sanctuary-reference.css`, imported after the
component styles in `src/main.ts`; old conflicting header/squad rules are
removed from `src/sanctuary-layout.css`. `presentation/sanctuary.ts` owns the
typed destinations, aliases, Team areas, dock and Help. Main keeps Team area/
owned IDs/tab/controls in its existing transient history snapshot.
`presentation/activity-banner.ts` shares live/pending-art headers;
`presentation/activity-entry.ts` shares infusion/farm/Machines/Roses footers,
alongside the elemental entry renderer in `gameplay.ts`.
`roster.ts` owns pure squad assignment and transient
per-banner star filters. Do not move gameplay/economy into these renderers.

Targeted regression command:
`npm test -- src\presentation\sanctuary.test.ts src\presentation\hub.test.ts src\presentation\roster.test.ts src\presentation\menu-information.test.ts src\presentation\inventory.test.ts src\presentation\activity-banner.test.ts src\presentation\ui-copy.test.ts`.
Run `npm test` and **Build Last Light** (`npm run build`) for the shared shell.
Browser-check Home, all three Team areas, equipment, Play, Inventory, Collections
and Summon at actual320/390/1280 CSS pixels. Verify full maximum-safe balances,
endgame HP, no horizontal overflow,44px controls, dock hit targets, native modal
focus/Escape, history selections, Showcase, unlocked stage selectors, draft vs
saved squads, canceled/accepted growth and Conduit equipping using isolated
in-memory storage. Verify owner-storage identity before/after.

The browser host may background pages or mismatch zoom/emulated coordinates.
Focus emulation and measured `innerWidth`/media queries are necessary; do not
accept clipped host screenshots as valid responsive evidence. The supplied file
cannot be rendered directly by this host outside its trusted folder; source
layout values and live-game desktop review are not a pixel-diff comparison.

## Historical navigation and presentation (D-080)

### Conduit restoration (D-130)

[Conduit Upgrade](conduit-upgrades.md) is an accessible submenu in Menu,
Inventory, Store/Archive, machine activity and both equipment screens.
Shows owned names with +0-5 icon markers, exact current/next modifiers including
growing penalties, component balance/cost and confirmation. Account-wide shared
levels; copies untouched. Inventory has a third currency card for Broken
Mechanical Components. Its supplied art is installed (D-137); existing currency IDs,
two primary header balances and all other navigation remain unchanged.
History-aware Back retains the caller and character tab.

### Visible separators and spacing (D-169, supersedes D-127)

The game uses no tilde separators. Use the separator that fits the meaning:

- **Counts, current/maximum values and owned/required amounts:** use spaced slashes,
  such as material requirements **73 / 12**, **HP 220 / 220**, **2 / 3 slots
  filled**, **Stage 5 / 35**, pity **199 / 200** and **Lv.12 / 30**.
  Parallel tier values also use slashes: **unlock at 80 / 93 / 100**.
- **Labels and attributes:** use a spaced middle dot, such as **Lv.0 · Evo.1**,
  **Name · Omnic · 6-star · Lv.50** and **35 stages · Enemy levels 80-140**.
- **Stat bonus lists and prose:** use commas, such as **+15% Attack, +12% Health**.
- **Pairs:** use `&` or "and" (**Dark Matter & Energy**, **touch and keyboard**).
  Use an en dash for a level range (**Evo.5–6**).

Joined words and numbers remain spaced. Paths, markup, save IDs and mathematical
division stay unchanged. Exact numbers, odds, transactions and combat behavior
are preserved.

Validation: `npm test -- src\presentation\ui-copy.test.ts` rejects any tilde or
unspaced slash in rendered menus, rules, galleries and readouts. It also checks
**Owned / Required**, squad counts and middle-dot level labels.
Run `npm test` for related literal expectations and impact/readout regressions;
check the event caption at 320/390/1280px for natural wrapping/no overflow.

The owner's follow-up preferences supersede D-078's information architecture,
serif typography and visible explanatory copy, while retaining neutral
charcoal/ivory surfaces, element-associated accents and prominent controls.

- Home is portrait-first, with left-side Standard/special summon banners, central identity,
  right-side squad cards and Adventure entry (D-090). Identity, current level/form and
  squad are visible; complete stats and lore are in optional Information.
- The Home special tile uses the supplied Roses Under Sunny Skies summon artwork
  with the same center/cover crop as Standard, the real banner name and
  **Special Limited Time Banner!** text (D-125). It opens Summon with Roses
  selected, not the Passion activity. This is promotional copy only: no expiry,
  countdown, banner odds or availability changes. Events remain in Gameplay/Menu.
- Each Home banner and the selected Summon panel have a **Showcase** button
  (D-126), opening a large responsive native gallery dialog. Lists only that
  banner's real5/6-star Element-Bearers: base-form full-color portraits, canonical
  base-form names, element medallions/labels and awarded stars, independent of
  ownership/current evolution. Standard has10, Roses has3. No creatures,
  evolution previews or summon controls in the gallery; the banner art/rate
  table and existing text-only availability strip remain intact. Close/Escape
  restore focus; viewing never writes saves or affects odds/pity. Validation:
  `npm test -- src\presentation\banner-showcase.test.ts src\presentation\hub.test.ts src\presentation\roster.test.ts src\presentation\menu-information.test.ts`;
  browser-check320/390/1280px, image decoding, modal focus/close and save identity.
- **Inventory** contains holdings only: currencies, owned materials and owned
  Conduit counts. **Stores** contains the Conduit Store. **Collections** contains
  the existing Character, Conduit and Creature galleries, with no new completion
  system. Legacy Archives/Glossary aliases still work. No bottom bar.
- **Character** has prominent **Element-Bearers** and **Captured Creatures**
  categories, each with a selectable owned roster. Captured copy leveling,
  locks, Conduits and sales remain here. Select one UUID for details; selling
  that copy selects the next available copy rather than leaving an empty panel.
- D-091 supersedes the earlier sans-serif preference: all UI uses the earlier
  Georgia typeface (`Georgia, "Times New Roman", serif`), weight600 for ordinary
  text/controls and700 for headings/emphasis, including headings, numbers, opening
  screens, selection panels, Information, Settings and battle chrome. The shared
  stack is defined in `src/interface.css`; no external font service is needed.
  Short factual labels replace decorative
  prompts and repeated save reminders. Lore remains intact.
- Optional rules and instructions use centered native Information dialogs with
  clear Close controls, Escape, modal keyboard focus and focus restoration.
  There are no automatic tutorial popups. Costs, stage selectors, eligibility,
  errors and required confirmations remain visible.
- Gameplay categories show concise artwork cards with levels, reward types,
  stage selection and Enter; exact rules are available in Information.
- Summon keeps cost, action, current pity and results visible. Its fifteen-row
  text-only table and exact rules are in **Rates & Information**. Odds, pity,
  duplicate rewards and atomic spending are unchanged.
  D-081 adds a compact visible strip of that banner's real5/6-star Element-Bearers
  with element emblem, name, stars and awarded rarity, separate from the rate table.
  D-082 adds a visible banner selector. Standard is the only authored entry;
  selection stays in memory and controls the displayed panel and confirmed draw.
  The future special event requires approved content/rules before registration.
- Motion uses short fades/panel entrances. Decorative title/star loops are
  removed from menus; character idle remains. Device and saved reduced motion
  disable animation. Combat impact, cut-in timing and speed behavior are unchanged.

Selection/dialog styles live in `src/interface.css`; the current mock-up
composition lives in `src/sanctuary-layout.css`. `src/numeric-layout.css` retains
full-number wrapping. The owner's Sanctuary HTML/Markdown references define
screen formatting, not their conflicting bottom dock, serif fonts,
arbitrary accent colors or outdated gameplay placeholders.

### Sanctuary mock-up composition (D-090)

The owner supplied `Last Light — Sanctuary.html` and its Markdown companion,
then clarified that the mock-ups define main buttons/screens while existing
game content populates them. Do not remove implemented activities simply
because the reference calls them unavailable. Preserve neutral charcoal/ivory
panels, associated element accents, Georgia typography (D-091), supplied artwork,
exact numbers, Information dialogs and the no-bottom-bar preference.

- **Header/Menu:** balances retain their IDs and actual currency PNGs. The
  labeled Menu button opens an accessible right-side drawer (D-123) containing Home,
  Character, Summon, Squad, Gameplay, Inventory, Stores, Collections, Opening
  Story, Events, Settings and Return to title. D-092 replaces fixed Home shortcuts
  with history-aware Back; Home remains a destination inside Menu.
  Closing restores focus; choosing the current screen closes Menu.
  Settings closes Menu before opening its existing dialog, avoiding stacked
  modals; closing Settings focuses the visible Menu trigger.
- **Home:** left Standard/event panels, a large central saved leader portrait
  with identity/current form and Information, and three right-side squad slots
  above Adventure. Empty slots link to Squad. Additional labeled left
  shortcuts expose Character, Gameplay and Collections without a bottom dock.
  Standard art/name/cost come from the authored banner registration.
- **Gameplay:** desktop activity category rail on the left, selected category
  and artwork/detail on the right. On phones the category rail scrolls
  horizontally without causing page overflow. Elemental, infusion and currency
  categories expose explicit named activity choices with one detail card at a
  time. All ten elemental dungeons, Heaven/Abyss, Treasury/Sanctuary, Adventure,
  Story and Events remain reachable. Stage unlocks/backing selectors, current
  reward PNGs, exact rules and Enter handlers are unchanged. Selected activity
  stays in memory across menu rerenders; this is not an account/save field.
- **Character:** large portrait/identity on the left, a framed control panel on
  the right with Details/Growth/Conduits sections. All eight existing selectors
  remain inside the appropriate section, retaining stable IDs, skill icons,
  equipment, costs, Max Level, previews and unavailable-upgrade messages.
  Switching sections/tabs updates the detail only, preserving portrait and
  navigation DOM. Captured-copy management uses the same portrait-left/
  controls-right organization with exact UUID, locks, levels, kits, sales and
  Conduits; no fixed-form evolution is invented.
- **Summon:** banner art and real available high-star Element-Bearers on the
  left; single draw/cost/result, pity and Rates & Information on the right.
  Mobile places the draw sidebar first. Preserve the authored banner selector,
  neutral pending-art handling, text-only rate table, real odds, pity and one
  confirmed atomic draw. No mocked multi-draw or Conduit pool is added.
- **Squad:** Save and filled-slot count share the heading row. Three large
  formation cards and the owned roster sit below. Existing selection panels
  retain `slot-0/1/2` values; changing a selection immediately previews its
  art/identity and updates the count, without saving. Save is still explicit
  and validates the same distinct owned IDs.
- **Collections:** three gallery selectors, supplied banner, filters/status
  and portrait-card grid match the reference hierarchy. Existing form discovery,
  silhouette rules, combat-kit dialogs, Conduit catalog and enemy loot survive.

Inventory, Stores/Conduit Store, captured management, Opening Story and Events
were linked or omitted in the mock-up rather than fully designed. They retain
their existing destinations/content and use the same panels, spacing and
Information controls. Inventory remains holdings-only. Title/starter selection,
immersive battle/results and Settings content were not restructured in this
revision. Future bespoke mock-ups can replace their formatting, not mechanics.

Validation: run `npm test` and `npm run build`. Measure actual CSS viewport
widths320/390/768/1280, not only requested browser automation sizes (browser zoom
can change them). Check all nine renderer surfaces, maximum-safe balances,
Lv105/Evo6 stats, captured copies, >=44px targets and zero horizontal page
overflow. Exercise all fourteen staged activity choices, section/selector
focus, portrait/nav preservation, preview-only squad changes, Menu/Information
Close/Escape and Settings focus. Never fund or rewrite the owner's save for
layout checks. In-memory browser fixtures must be removed afterward.

### Inventory and right-side Menu revamp (D-123)

Owner supplied the Sanctuary Inventory and Menu references. Implement their
composition with Last Light's neutral charcoal/ivory palette, Georgia typography
and actual currency/material/Conduit PNGs, not mock gold/purple currency circles.
This is presentation only; account schema, prices, rewards and transactions stay
unchanged.

- Inventory shows two large balance cards, Materials/Conduits pill tabs and a
  framed artwork grid. Counts mean distinct positive owned item types, not total
  stack quantities. Exact balances and stack counts wrap without abbreviation.
- Empty categories show fourteen decorative slots (not capacity limits), a
  clear empty message and a real Gameplay/Conduit Store shortcut. Unavailable
  saves instead show explicit errors and unavailable counts, never fake zeroes.
  Equipment, captured-copy management/sales and galleries remain separate.
- Tabs use linked tabpanels, roving focus, Left/Right wrapping and Home/End.
  Selection survives Settings, navigation and Back in memory only; loading or
  changing tabs never writes the wallet. Returning to title resets Materials.
- Menu is a full-height, scrollable native modal at the right edge. Inventory
  and Collections are featured tiles; Conduit Store, Opening Story, Settings and
  Return to title are utility rows. A compact additional destination grid keeps
  Home, Character, Summon, Squad, Gameplay, Events and Stores reachable because
  Last Light has no bottom dock.
- Close, Escape and outside-backdrop clicks dismiss Menu; native modal focus
  containment/return and current-page dismissal remain. Settings closes Menu
  first. System and saved reduced motion disable its short entrance.

Rendering/binding lives in [inventory.ts](../src/presentation/inventory.ts) and
[sanctuary.ts](../src/presentation/sanctuary.ts), with scoped
[Inventory](../src/presentation/inventory.css) and
[Menu](../src/presentation/sanctuary-menu.css) styles. Obsolete global Inventory
container rules were removed rather than layering competing layouts.

Validation: `npm test -- src\presentation\inventory.test.ts src\presentation\hub.test.ts src\presentation\sanctuary.test.ts src\presentation\conduit-store.test.ts src\presentation\menu-information.test.ts src\presentation\menu-history.test.ts src\presentation\currency-icon.test.ts`,
then `npm run build`. Browser-check empty/populated/unavailable categories,
maximum-safe quantities, tab keyboard/click behavior, history/Settings retention,
drawer focus/dismissal, mobile scrolling and actual CSS viewport overflow.
Use in-memory fixtures only, confirm localStorage is unchanged, then reload to
remove previews.

### Semantic stat and resource colors (D-097)

Owner approved meaningful color emphasis on stat screens, not neutral-only
information. Shared `presentation/stat-change.ts`/CSS colors the next value
green for increases, red for decreases and neutral for unchanged values in
level/evolution and Max Level previews, including captured Max Level.
Compare unrounded stats; keep existing formatStat text and percentage/multiplier
units. Tiny real increases may round to the same visible value. Screen-reader
labels describe Increased to, Decreased to or Unchanged at; before/after values
and arrows remain visible rather than relying only on color.

Conduit-modified current stat values use the same direction colors against
unequipped stats, retaining Before Conduits reference text. Unmodified current
stats remain neutral. Required-resource counts are green when sufficient and
red when missing, alongside exact Owned/Required numbers, missing outlines,
disabled upgrade controls and existing rejection text. No transaction, math,
rarity, currency identity or navigation palette changes.

Validation: shared helper tests cover gain/loss/equal/zero, percentages,
multipliers and sub-formatting-precision changes. Renderer tests cover level/
evolution, equipment, affordability and Max Level/capped previews. Browser-check
actual computed colors and mobile/full-value containment.

### Concise status wording (D-096)

Status labels describe meaningful player state, not how the UI renders it.
Character Archive uses Not owned, Reached form, Evolution not reached and
Current form with its level; omit Silhouette, Art locked and Art revealed.
Creature cards use Encountered or Defeated without Loot locked/revealed;
undiscovered headings already establish that the creature has not been seen.
Keep silhouettes, discovery/ownership filters and defeat-gated loot unchanged.

Current-form stats remain equipped saved values; other forms retain a concise
Level 0 preview label. Shared Collections Information explains the no-Conduit
preview and reveal rules instead of repeating them under every card.
Captured Home/Squad/Character copy summaries retain levels and distinct copy
numbers but omit the repeated Fixed form label. Level caps and cannot-evolve
rules remain in Information. Keep unavailable-save errors, missing-art notices,
exact costs, protection reasons and preview-vs-owned distinctions.

Validation: Archives, creature discovery, captured-copy, Home and roster renderer
tests must assert concise wording while preserving hidden/revealed form counts,
effective stats, copy identity and loot gates. No save or gameplay changes.

### Dynamic screen backgrounds (D-095)

Every opening/menu screen receives a decorative ambient layer from
`presentation/ambient-background.ts`, styled by `ambient-background.css`.
Title uses starburst rays; selection a triangular weave; Home diagonal planes;
Character concentric portrait rings; Summon astral spokes; Squad formation
grids; Gameplay contour arcs; Inventory a diamond lattice; Stores mechanical
rings; Collections archive grids; Story sweeping curves; Events diagonal
ribbons; Settings fine lines. Conduit Store shares Stores, legacy Archives/
Glossary share Collections. These shapes are neutral, not arbitrary navigation
colors or acquisition/rarity promises.

Two slow transform-only animations rotate an off-center ring and drift sparse
particles/soft light bands. Patterns stay visible with animation disabled.
Saved reduced motion and system reduced motion independently disable both.
Fixed viewport-bounded layers are aria-hidden, pointer-transparent, clipped and
paint-contained; no focus targets, images, timers, listeners or gameplay RNG.
Replacing the frame removes the previous decoration automatically.

Battle preserves its supplied arena and gets only sparse drifting motes, no
menu grids/rings or camera motion. Settings, Information, selection panels,
Battle menu and results have restrained static pattern backgrounds, preserving
opaque reading surfaces and native modal behavior. Decorative animation is
independent of battle speed and combat timing.

Validation: run ambient markup and existing renderer tests/build. Measure all14
themes at320/390/768/1280px for clipping/overflow and pointer transparency.
Verify unique menu patterns, real transform progression, both reduced-motion
paths, scenery visibility and unobstructed controls. Visual review must include
opening screens, a real-art Home, Inventory and a battle scenery fixture.
Use isolated profiles or read-only fixtures; never alter the owner's wallet.

### Screenshot layout refinement (D-093)

The owner's nine screenshot references further specify proportions and hierarchy,
not new gameplay rules. Desktop now uses a compact brand/currency/Menu row;
Gameplay's heading sits below at the left. Home, Character, Summon and Squad
retain their accessible page heading without a redundant visible title row.
Home keeps banner-left/portrait-center/squad-right. Adventure has a large
scenery-backed detail panel and prominent entry control beside the category rail.

Character uses a wider portrait stage and a narrower framed control panel with
flat underline section tabs, readable row-based upgrade stat deltas and internal
desktop detail scrolling. Owned roster selection follows the portrait/control
stage rather than pushing it down. Conduits uses one full-width Master block and
a four-by-two desktop slot grid (two columns on phones); the redundant secondary
Conduits navigation button is hidden because the primary Conduits tab performs
the same action. All stable selector IDs and gear controls remain.
Summon uses an approximately two-to-one artwork/draw-pity split. Squad uses three
large formation cards, a wider leader card and dashed member frames.

Keep deliberate differences from the references: real supplied artwork, neutral/
element palette, Georgia everywhere, no bottom bar, caller-based Back, current
single-draw cost/pool, and detailed rates in the accessible Information dialog.
Collection/protection/captured management remains available through existing
Character categories and controls; no mock-only Collection tab is invented.
Small screens stack content rather than clipping it. Exact large values, every
upgrade cost/delta, Max Level, locked/equipped status and all activities remain.

Validation: additionally compare rendered screenshots at1400x800; check header
placement, portrait/panel balance, four-by-two slots, full stat rows, large Squad
cards and summon sidebar. Use isolated browser profiles or read-only fixtures,
never the owner's wallet. Check320/390/768/1280px, >=44px controls, maximum-safe
balances and Lv105/Evo6 stats as in D-090.

### Traversal and Conduit artwork (D-092)

Back returns to the actual calling screen, not a fixed parent. The in-memory
trail retains Character selection/tab/category, banner, collection gallery/
filters, Gameplay category/activity/stage selectors, unsaved Squad choices and
scroll position where values remain valid. Restoration must not dispatch gear
transactions or write account data. Same-screen refreshes are not history entries.
Home shows Back when reached from another screen; initial Home has none.
Battle Leave and result Quit return to the entry screen and discard the run.
Settings/Information remain dialogs, not history entries. Return to title clears
the trail. This does not implement browser URL Back or persistent history.

Conduit art uses80px ordinary Inventory/equipment icons and responsive
up-to200px Store/Archive hero icons. Remove the repeated "Recovered mechanism"
artwork labels, retaining names, effects, prices, counts, lore and controls.

Validation: run the history/header/store/archive regression tests, `npm test`
and the production build. Check Home -> Character -> Conduit Store -> Back,
Stores -> Store -> Back, Collections/Gameplay caller restoration and battle
exit. Check enlarged art at measured320/390/768/1280px with exact large counts.
Use read-only fixtures; do not purchase, equip or fund owner saves for checks.

### Selection and shared Information (D-083)

The owner retained centered Information dialogs instead of separate pages.
Native dropdowns now have48px labeled selection buttons that open a centered
choice panel. The selected choice is marked; disabled choices and groups remain
disabled. Hidden backing selects retain IDs, form values and existing change
handlers for stages, filters, squad, equipment, Settings and battle speed.
Selections dispatch exactly one input/change pair; reset and rerenders refresh
the display. Closing/Escape restores focus; removing or disabling the source
closes an open panel. A stale option shows an explicit error, never selects a
different option by its former index.

Character, Gameplay and Collections each own one shared rules dialog.
Generic progression, protection, discovery and capture rules are not repeated
on individual cards. Unique abilities, costs, stat previews, stage loot, sale
prices and rejection reasons remain available. Collections keeps unique
form Combat kit dialogs and shows each starter's description once in Information.
Captured abilities/equipment and revealed creature loot are ordinary sections.
Summon rules are visible inside Rates & Information, not a nested disclosure.
Battle reference/log sections remain inside the Battle menu; results show their
summary directly. No expandable descriptions remain in runtime renderers.

Validation: test disabled options/groups and sources, exactly-once change
events, FormData/empty squad slots, reset, immediate gear changes, filter resets,
stage entry, Settings/battle speed, Close/Escape and removed-source cleanup.
Check visible triggers/options >=44px and no horizontal overflow at measured
320/390/768/1280px. Never fund the owner's browser account for UI checks.

### Associated item artwork (D-084)

Activity cards show the actual exported currency/material PNGs in framed80px
item showcases rather than relying on currency names alone. Adventure shows
Prismatica only; elemental dungeons show Prismatica and the six associated
materials, labeled **Rewards across stages**, not guaranteed current-stage
loot. Heaven/Abyss show both currencies and their own three specialty items;
bonus-element pools and exact stage chances remain in Information/Collections.
Treasury shows Prismatica only; Sanctuary shows Prismatica and Null-Prismatica.
Captures remain explicitly listed separately, not illustrated as a guaranteed
specific creature. Story/inactive Events do not advertise rewards.

Captured leveling costs, currency-creature sale values, revealed Creature sale
values and Max Level total costs use the same showcase with exact quantities.
Home Adventure and Stores entry use Prismatica artwork; existing Inventory,
upgrade, Conduit Store and Summon icons remain, with larger currency reward
presentation. No odds, balances, spending, discovery gates or save writes change.
Art-pending materials retain their own names with neutral Artwork pending
tiles; never load missing PNGs or borrow another element's artwork.
Shared renderer/style: `src/presentation/item-showcase.ts` / `.css`.

Validation: `npm test` / `npm run build`; item-showcase tests verify associated
currencies, own-element/specialty material paths, exact maximum-safe amounts,
art-pending fallbacks and existence of every PNG referenced by activity showcases.
Check320/390/768/1280px for no overflow,80px imagery and full readable quantities.

### Max Level

Level Up includes **Max Level** for Element-Bearers; captured details also offer
it. A pure plan accumulates existing ordinary level costs until the first
unaffordable level or the current cap. The dialog shows current/target/cap,
total Prismatica/materials and all seven effective stat changes. No preview write.
Confirm rereads the account and compares the recomputed plan, progression and
equipment snapshot; changed target/cost/progress/equipment requires reopening.
One validated write deducts total costs and updates the exact owned ID.
Zero affordable levels and current caps show factual reasons and disable Confirm.
No evolution, fodder consumption or Null-Prismatica spending; legacy ranks, captured
forms/kits/UUIDs/locks, gear, squad, receipts and other holdings are preserved.
Storage failure cannot partially persist spending. See
[transaction tests](../src/game/max-level.test.ts).

### Validation guidance

Run `npm test` and `npm run build`. Check measured320/390/768/1280px layouts,
maximum-safe holdings and endgame stats, both motion settings, all categories,
galleries and Character tabs. Verify native modal focus/Close/Escape, rates hidden
until requested, Home routes, inventory isolation, capture selection/removal and
portrait-preserving starter upgrades. Test cumulative resource thresholds,
specialty limits, caps, stale previews and save failure; never fund the owner's
save for validation.

## Previous cinematic sanctuary navigation (D-078)

The owner selected a charcoal/ivory cinematic sanctuary redesign. Neutral
textured surfaces, readable serif headings, substantial labeled destinations
and element-associated accents replace narrow shortcut rails and competing
menu layouts. Existing supplied art, balances, costs and save transactions are
unchanged. No reward, feature availability or game rule is implied by styling.

- Home exposes nine destination cards in three visible groups: **Play & explore**,
  **Collection & equipment**, and **Build your team**. The portrait, Adventure
  launch, squad preview, all seven stats and lore remain available.
- The bottom navigation bar is removed at the owner's request. Home's grouped
  cards expose all destinations; every other sanctuary menu has a labeled Home
  button in its header. Inventory/Character submenu routes remain visible.
- Inventory's visible **Holdings / Conduit Store / Archives** navigation follows
  the user through its submenus. Holdings separates currencies, materials and
  Conduit unlocks into framed sections.
- Character exposes **Element-Bearer growth / Owned copies & protection /
  Squad formation** routes. Stable growth/combat/equipment selectors and
  portrait-preserving updates remain intact. Selecting a detail on small
  screens scrolls to its heading; upgrades do not gain this navigation scroll.
- Gameplay has six descriptive category tiles. Selecting one focuses and
  scrolls to its activity heading. Dungeon entry, stages, exact loot tables and
  art-pending visuals retain their existing rules.
- Summon's single draw button, cost, eligibility and result status sit directly
  below the banner, before pity and rates. All fifteen outcomes remain in the
  text-only table; detailed rules remain in their accessible disclosure.
- Archives, store, squad, story, Events, Settings, title and starter selection
  share the framing, spacing and button treatment. Events now expose
  [Passion of Crimson Roses](crimson-roses.md) and its special-banner link,
  using shared stage/loading/Back controls. Battle retains its separate field-first layout and themed chrome;
  menu styling does not change combat presentation timing.

`src/sanctuary-polish.css` owns the final composition after legacy menu styles.
`src/numeric-layout.css` still owns full-number containment. Menus use normal
page scrolling, not nested Home destination/detail scrollboxes. Controls retain
at least44px targets and visible keyboard focus. Hover feedback and320ms panel
entrances respect both device and saved reduced-motion settings; activity loading
and disposal retain their existing implementation.

### Validation guidance

Run the menu/navigation tests and production build. At320/390px phone,768px
tablet and1280px desktop widths, check all seven main screens, three Archives
galleries, store, each Character selector and Settings. Verify no horizontal
overflow, concealed primary actions, clipped values or missing artwork. Test
both reduced-motion mechanisms, keyboard focus, Inventory submenu routing,
category focus/scroll and portrait DOM preservation. Include maximum-safe
balances/material counts and endgame stats. Test saves through the existing
transaction suites; do not fabricate persistent resources for screenshots.

## Conduit Store (Phase2)

Artifact terminology is now **Conduit** throughout the runtime. Home's Stores
destination and Character's Conduits tab reach the Conduit Store. Inventory
shows saved owned-copy quantities separately from materials; the store stays
under Stores. Each confirmed Prismatica
purchase grants one Common mechanism atomically. Equipment exposes eight
immediately saved selectors and effective/baseline stats. One copy unlocks all
characters, one name per character; Master reserved. Listed buffs apply when
equipped and run snapshots retain them. See [Conduits](conduits.md).

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

## Unified Archives (Phase4)

Home links to **Collections**, containing the existing Archives with Character,
Conduit and Creature galleries and separate banner headers. See
[Archives and elements](archives-and-elements.md) for catalog/ownership details,
confirmed enemy typing and art prompts.

### Creature Glossary

The Creature gallery catalog includes all97 authored
enemy forms across Adventure, elemental dungeons and both infusion modes.
Unseen entries use black silhouettes with no revealed name or loot.
Encountering an enemy saves its color/name and reveals its element; first defeat unlocks its actual
per-enemy pool, quantity range and drop chances. Filter by activity and select
a stage within the form's range to inspect rarity/material gates.
Missing artwork remains an explicitly labeled neutral placeholder.
Discoveries persist in walletv3; old saves start empty, never inventing past kills.
Large late-game stats use the shared two-decimal formatter; combat keeps precision.

## Confirmed requirements

- Fire, water, and grass are available as first Element-Bearers; choose one.
  Adventure uses only that saved character.
- **Prismatica** is the main currency; **Null-Prismatica** is the premium currency.
- Characters support evolution, levels, and planned independent upgrades
  for the unique passive, ability 1, ability 2, and ultimate.
- Weapon upgrades are disabled and removed from all menu navigation. Existing
  purchased bonuses remain; weapon names/portraits still identify each character.
- Ultimate names always follow `Last Flare: <character-specific name>`.
- Each character has eight unique artifact slots and one separate special
  **Master Artifact** slot: nine equipment slots total. Artifacts buff the
  equipped character's stats; these slots belong to each character, not Inventory.
- Inventory, settings, and story-mode menus are needed; events come later.
- Main destinations are Home, Character, Gameplay, Events, Inventory, Stores,
  Collections, Squad and Summon. The owner removed the bottom bar; destinations remain
  available through Home cards and header Home buttons. Squad and Summon are
  implemented owned-roster systems; Settings stays in a side drawer.
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
Details use the page's scroll flow; costs/actions are never hidden behind disclosures.
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
its exact rolled Prismatica/material stacks burst at its feet. Supplied item icons
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

Home's main character artwork is an uncluttered centerpiece: up to480px on desktop,
360px on tablet and280px on phones, always bounded by available width. The square
contain-fit keeps complete evolved wings, weapons and effects visible without cropping.
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
Prismatica shows a saved local balance,
starting at 0 and increasing by 5-10 per defeated enemy. Null-Prismatica shows its actual
saved balance, initially zero; first account Fracture grants 10. Prismatica is
spent on leveling/evolution. Null-Prismatica spending and paid purchases remain unavailable.

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
Squad/Summon buttons open the implemented team editor and active Standard Banner.
Confirm10-Null-Prismatica draws; text-only outcome table,200/500 pity and saved results.
Currency chips show actual saved Prismatica and Null-Prismatica balances.
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
quitting returns Gameplay and ends the run without discarding Prismatica. Each entry
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
the saved Element-Bearer's working combat kit and illustration.
Character has a left area-selector rail, central saved Element-Bearer, and right detail
panel: Overview, six upgrade paths (weapon upgrading removed), and Artifacts / Equipment. Home dock
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
appears on these panels. Phase7 adds explicit per-copy creature selection
alongside existing late evolution costs; protected rows show eligibility reasons.
Permanent confirmation and one atomic save commit evolution/costs/removal.
After consumption the Character screen refreshes to remove consumed copy cards.
See [creature infusion](evolution-fodder.md).
The next evolution is previewed as a solid black silhouette on a neutral light
backing, without its form title or colors. The owned portrait remains in color;
successful evolution reveals that form in the existing portrait. Final Evo.6
shows no next-form preview. This is a visual reveal, not asset-access protection.
Overview shows the real passive, abilities, Shatter Gauge costs, and cooldowns;
no mock-up health slider, estimated damage, fake levels, or additional owned roster
has been implemented. The saved starter remains the only Owned Element-Bearer.
Home and Character Overview display all seven stats: Shatter capacity, Health,
Defense, Attack Damage, Critical Rate, Critical Damage Multiplier and Elemental
Damage. Battle displays the same stats with current HP/gauge and resolved skills.
The level/Fracture panels enforce caps 30/45/60/75/90/105 across six forms,
preserved levels, +1% base per level, +10% base per evolution and first Fracture
+10 Null-Prismatica. Growth is additive; level 90 Evo.5 is 2.3x base. The old level-reset
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
Character shows an owned-Element-Bearer picker above the existing upgrade tabs.
Squad exposes a required leader and two optional slots; saving validates distinct
ownership and persists their order. If no squad is saved, the editor defaults to
the first owned member without writing until the player saves. Opening other
menus does not require a valid battle squad; only battle entry enforces that
requirement. The starter is not locked to the squad.
Summon publishes remaining-pool odds and a 10-Null-Prismatica cost, confirms before
spending, and reveals the saved acquisition. Insufficient funds or a completed
collection disables summoning. New Element-Bearers must be equipped manually.
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

## Legacy Element-Bearer saves

All three version-1 starter IDs continue to the menu normally. The previous
fire-only re-selection policy is superseded: water/grass saves are not overwritten,
and Adventure uses their saved Element-Bearer. New saves still require explicit
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
# Silhouette drag previews

Character portraits, evolution previews, captured/Creature gallery portraits
and Conduit icons disable native image dragging. CSS silhouettes must not reveal
the original colored image in a browser drag ghost. Reveal/ownership rules,
portrait DOM and accessible labels are unchanged.
