# Menus and inventory

## Multi-select Elemental-Devourer sales (D-418)

Team > Captured Elemental-Devourers has **Multi-select sell**. It reveals
checkboxes, Select available, Clear selection and Review sale. Clicking a
copy's portrait also toggles it while selection mode is active. Locked,
squad-assigned and Conduit-equipped copies remain visible but unavailable,
with the protection reason. Selections are transient and reset when leaving/
rerendering the collection; cancelling selection clears them.

Every selected Heaven/Abyss copy has its own payout selector: choose
Null-Prismatica or one of that mode's three materials independently, including
different choices for otherwise identical copies. Treasury/Sanctuary/Rose
copies retain their authored fixed payouts. The live summary aggregates exact
currency/material quantities; Review lists each copy and its payout plus the
combined item-art totals. Nothing is sold until explicit confirmation.

Offline and online share one batch transaction: reread all UUIDs, payout
options and protections, reject duplicates/missing copies/overflow, then save
all removals and rewards together once. Any invalid copy rejects the whole
batch; persistence failure retains raw holdings. Existing single sales share
this path. Online uses the normal revision/request-ID retry protocol.

Selected copies get their actual rarity's circular impact/sheens/sparkles.
The saved sale opens the shared reward receipt with the exact totals and
finite celebration; no sale-success animation precedes persistence.
Explicit Reduce motion, Skip/Escape/Continue, focus restoration and disposal
remain. A post-save presentation error must say the sale was saved.

## Motion is a standing design requirement (D-418)

Future applicable game/UI work must include polished action feedback as a
core acceptance criterion, not a deferred cosmetic extra. Reuse shared
selection, rarity, circular-impact/sparkle, reward and upgrade foundations
instead of isolated effects. Match the action and rarity without obscuring
controls or recoloring artwork; avoid celebrating cancellations/failures.
Keep effects finite, disposable, pointer-transparent and deterministic,
with static accessible feedback under explicit Reduce motion. Preserve
save-before-animation, Skip, focus and immediate controls. Test animation
timelines and interactions, not just a still image. This requirement is also
recorded in the project's agent entry point.

## Shared rarity accents and feedback (D-417)

Rarity UI uses one palette: Common bronze, Uncommon silver, Rare gold,
Epic violet/amethyst, Legendary orange, Omnic white with rainbow sparkles,
and Calamitic black/white/crimson. Shared badges, Conduit frames, Inventory
trims and reward rows use these colors without filtering/recoloring artwork.
Elemental mats/labels retain their own identity; character star value is not
form rarity.

Successful Conduit/Master equips get a brief local sheen, ring, deterministic
sparkle burst and success pop-up **after** the saved transaction succeeds.
Accepted occupied-slot, Store/upgrade item and Master-choice selections use
the same effect without claiming a purchase/equip. Unequipping, cancellations
and rejected operations do not play acquisition success. Existing level/
evolution celebrations and saved reward reveals also use the actual form/item
rarity. No modal sizing/theme rollout is implied by these effects.

Victory titles and up to12 rarity-bearing reward rows shimmer once per
encounter result state, not on defeat or reopening the same result. Mixed
ten-pull/chest grids use each awarded item's own rarity, capped at12 effects;
currencies/specialty materials without an authored rarity stay neutral.
Decorative effects are pointer-transparent, finite (about1.15seconds;
1.8seconds for labeled feedback) and cleaned on replacement, navigation,
dialog disposal or timeout. No combat/reward RNG is consumed.

The impact ring is a true circle, not the target's rounded rectangular border.
It expands from15% to125% over850ms; ring diameter and radial spark travel
fit the target's shorter dimension so short equipment cards do not clip the
burst. Twelve primary sparks are followed by16 smaller staggered dots/star
twinkles across the target. Calamitic retains circular expansion alongside
its crimson/white/black pulse. Validate motion at multiple timeline positions,
not from a single still image.

The explicit in-game Reduce motion setting suppresses movement/sparkles,
retaining a temporary static outline and applicable text. Device preferences
do not independently suppress animation, preserving D-187. Existing reveal
Skip/Escape/Continue/focus and save-before-animation behavior remain intact;
skipped/reduced-motion reward reveals add no extra burst or delay.
Validate `rarity-feedback.test.ts` alongside existing equipment, Inventory,
reward, summon, upgrade and battle-result tests, plus production build.

## Calamity chest loot presentation (D-416)

Only Calamity chest **View Loot** dialogs receive this visual pilot, consistently
from activity selection and Inventory. The short dialog header identifies the
view; a larger chest-art hero names the exact activity/chest and EX tier.
Two framed sections distinguish guaranteed contents from the random pool,
with explicit selection counts, semantic row/column headers, exact percentages
and comma-grouped quantities. Machines retains its full Conduit pool and
visible selection/duplicate-conversion explanation.

Typography uses the shared Georgia stack throughout, with controlled heading
sizes and normal letter spacing. Neutral charcoal panels, restrained
leader-accent trims and subtle separators replace the unstructured oversized
heading/list/table. Desktop uses horizontal columns; phones stack without
horizontal overflow. The bounded dialog grows to content rather than forcing
full-screen height; long pools/short viewports retain necessary vertical
scrolling with a sticky header and accessible44px Close. Native Escape,
focus restoration, reduced motion and existing keyword formatting remain.

No other information dialogs, opening/reward animations, loot probabilities,
quantities, save transactions or account data change. Do not spread this theme
to other screens without owner review. Validate Calamity/Inventory/information
tests and browser-check all36 activity/tier combinations at desktop/mobile sizes.

**Current reference corrections:** D-412 uses
[one80-pull banner meter](summoning-and-economy.md#single80-pull-pity-d-412);
older dual-counter UI descriptions below are historical. D-415 shares canonical
bracketed Conduit effects with Master choices, including `[Health]`, complete
ability names and native resources; it does not change modal sizing/animations.

## Targeted modal sizing (D-413)

Owner withdraws the global D-411 redesign. Restore pre-D-411 victory/results,
mission selectors, squad picker, Information, confirmations, Settings, account,
friend and reward dialogs. Level/evolution, banner, chest-opening and other
celebration/reveal animations retain their original presentation. Small content
belongs in a small modal, not an empty full-screen shell. No global pagination
controller or forced full-screen stylesheet remains.

Only **Master chest selection** is redesigned: a bounded panel up to1120px wide,
three readable columns on desktop, a single column on phones, fixed heading,
bearer selection and Cancel/Choose actions, and a scrollable choices area.
The panel fits the viewport without forcing full-screen or excessive empty
height. Long effect text, all48 choices, owned states, exact elemental styling,
future-character eligibility, focus, Escape and atomic confirmation remain.
The opening animation is separate and unchanged.

Validate Master-choice/opening, game-dialog, selection-panel, reward-screen,
roster and battle-results tests. Browser checks cover every Master/selected
footer at320px/390px, short landscape and desktop; confirm only the option list
scrolls and the other dialogs/animations use their previous layouts.

## Full-screen paged overlays (D-411)

Historical and withdrawn by D-413 above; not the current UI contract.

Every game modal, including small confirmations and nested selection panels,
occupies the full viewport. Content never uses an internal scrollbar. Fixed
headings and primary actions frame a responsive reading/selection area; overflow
uses **Previous / Page N of M / Next** controls. Ordinary game pages retain
their existing scrolling. This supersedes earlier compact-dialog, side-drawer
and contained modal-scrolling contracts, including the D-408 Master window.

The shared `presentation/overlay-pages.ts` controller covers every open native
dialog, including Information/topics, Settings, stage/Conduit selectors, Detailed
Loot, squad/profile-picture choices, friends, update prompts, confirmations and
reward reveals. Battle victory/defeat receipts now use native dialogs too, keeping
View battlefield, reopen, Retry/Replay/Continue/Quit and saved totals unchanged.
Noninteractive combat effects and brief status notices are not modal screens.

Native column fragmentation paginates the original content, rather than copying
forms or hiding excess data. Lists, table rows and text continue on later pages;
normal text stays readable at16px, and controls retain at least44px targets.
Desktop uses two reading columns (three for Master options); phones use one.
Short landscape screens place paging and action controls beside each other.
Resize, content reveal, filters, loaded art and viewport changes recalculate
pages. The selected option opens on its own page. Off-page controls leave the
Tab order; keyboard focus, native Escape/cancel and nested parent-page state
remain intact. Closing the last modal restores ordinary page scrolling.
Submitting a form reveals its first invalid field, even if browser validation
does not emit a new focus event; later invalid fields never override that page.

React declares its own heading/content/footer containers, so the paginator never
reparents React-owned controls. Master choices retain all48 exact effects and
future-character eligibility, with a persistent Element-Bearer selector and
Cancel/Choose actions. Selectable identity/artwork is separate from flowing effect
text, allowing long rules to continue without clipping a giant button. Battle
action cards similarly separate their activation button from full references.
Settings, account and friend forms keep their original controls, values,
validation and submit ownership when their main buttons move to the fixed footer.

Reveals retain hidden artwork until reveal, Skip/Continue, reduced motion, artwork
errors and existing save-before-animation behavior. No mechanics, rewards, RNG,
account writes, loading screens or artwork substitutions are added.

Validate `overlay-pages.test.ts`, React opening/Master tests, game-dialog,
selection-panel, Information/topics, stage-loot, reward-screen, profile-picture,
friends, native targeting and battle-result/chrome tests. Browser validation must
check actual text-fragment bounds, no inner scroll containers, fixed controls,
all48 Master effects, a large Machines pool/rates table, short landscape and
320px phones, nested loot/focus, reveal visibility and no account writes.

## Compact holdings and unified categories (D-407)

Inventory has two expandable sections: **Resources & Items** holds materials,
components, Machine's Master Chests and every Calamity chest; **Conduits** holds
ordinary and personal Master Conduits together. Section counts include every
distinct positive owned type in that section. Conduits filtering includes Masters;
the Master-only and Chests filters remain available. Expansion/filter history is
transient; no holdings or save formats change.

Cards use a compact80px artwork column beside the name, identity, exact quantity
and44px Details/Open controls. Independent content-height cards replace subgrids
that stretched mixed chest/Master rows into narrow towers. Each section spans
the available width with responsive card columns; long names wrap naturally,
and elemental badges retain bold themed borders without splitting their words.
This changes Inventory only, not the enlarged battle/reward chest artwork.
Validate `inventory.test.ts`, `calamity.test.ts`, `conduit-element.test.ts` and
desktop/320px browser layouts with long names and maximum-safe quantities.

## Instant navigation (D-406)

Page changes render immediately without a black loading curtain, fade delays,
artwork decode waits or minimum loading time. Images load independently with
existing fallback/retry controls. Only destination setup that genuinely remains
pending after300ms shows a small corner status, not a loading screen. It disappears
as soon as setup completes. Duplicate navigation and input stay guarded during
real setup; errors propagate and the prior inert state is restored. Destination
heading focus, history, saved state and battle entrance/action locks remain.
This supersedes D-046/D-281/D-328's artificial navigation waits.
Validate `activity-transition.test.ts` and `battle-entrance.test.ts`.

## Chest presentation (D-405)

The former Cosmic Grand Master Chest is now **Machine's Master Chest**.
Inventory keeps its image decorative and provides a separate visible **Open**
button using the existing choice/confirmation flow and all-owned restriction.
Master drops/results resolve the revisioned PNG, not a text token. Master and
Calamity chest drops use96px artwork with wider cluster spacing; victory receipts
give chests dedicated full-width rows with artwork up to240 by200px. Ordinary
loot keeps its existing size. Calamity opening receipts similarly enlarge awarded
Master chests, not the consumed Calamity chest. The Master reveal no longer says
"Planetary locks released." Saved rewards, focus/Skip/Continue/reduced motion,
drop odds and account IDs are unchanged.

Validate chest cases in `battle-loot.test.ts`, `battle-results.test.ts`,
`inventory.test.ts`, `calamity.test.ts` and `conduit-element.test.ts`, plus browser
desktop/mobile artwork loading, button targets and contained receipt scrolling.

## Omnic elemental identity (D-403)

Omnic Conduits now show a bold, element-colored name badge and a matching
gradient/border, separate from their existing prismatic rarity badge.
[Shared Conduit presentation](conduits.md#omnic-element-presentation-d-403)
covers every holding, equipment, reference and reward surface, including
personal Masters. Inventory keeps rarity/element in one row so existing
subgrid alignment and Details controls do not shift into adjacent cards.
Other rarities, artwork, transactions and equipment rules are unchanged.

## Original battle screen restored (D-399)

Owner reverses the screenshot-inspired redesign. Restore the shared battle
screen from before D-392: original formations and sprite offsets, allied
HP/Gauge/status readouts beside their artwork, original header/toolbar and
compact feedback footer. Remove the bottom cards/Stats controls, separate
target banner and always-visible action dock. Actions remain available through
field gestures, Normal Attack secondary-click and the Battle menu; actor/target
selection and keyboard selection remain unchanged.

Retain the activity stage progress meter alongside the original stage/wave,
turn and phase text. Training has no invented finite stage limit. All modes
continue to share the same renderer, existing scenery, palette, artwork scale
and facing. Keep bounded status trays, full Battle menu references, actual
impact-time HP/Shield/buff/native updates, results and toolbar listeners.
No new red-star notifications or alternate footer are implemented.

This supersedes D-392 through D-396's presentation changes, not the earlier
status/readability fixes, later Conduit description cleanup or Calamity tuning.
No combat, reward, authority, account or save changes. Validate shared HUD,
toolbar, chrome, gestures, shortcuts, readout/impact and native targeting tests,
then full suite/build and desktop/mobile browser geometry.

## Slim battle stats bar (D-396)

Historical; superseded by D-399.

Owner confirms replacing each bottom portrait/readout card with a slim
`View [name] Stats` button, retaining the four visible actions. These buttons
inspect only: acting-member selection stays on field sprites, selection
shortcuts and the Battle menu. Spent, recovering and defeated members remain
inspectable; playback/entry still locks stats buttons.

Use the shared game-styled modal with Close/Escape, focus return and disposal
cleanup. Show current HP/Gauge, resolved stat labels/units, buffs/debuffs,
native state/forecasts and full Conduit messages (including Stasis). List living
enemies with effects owned by that member only: native marks, Fracture Marks,
Burn and Weaken retain actual provenance/clocks. Reopen reads current battle
state, never a saved account or parsed combat message. Inspection changes no
selection, actions, RNG, wallet or combat.

Footer uses a single row of four actions, with stats buttons alongside on
desktop and above on narrow screens. Hide former card contents from layout
and accessibility; keep the internal impact snapshot patch nodes so playback
still updates health/buffs/native state in order. No sprite offsets, sizes,
arena sizing, scenery or toolbar changes. Full combat reference remains in
the Battle menu. This supersedes D-392/D-393's visible portrait/readout cards.

## Sprite-only positioning correction (D-395)

Owner rejects D-394's arena expansion: it pushed enemy readouts and the action
dock below the viewport. Restore D-393's fixed-screen arena, containment and
formation sizing. Only the two rear allied sprites in desktop trios move:
the upper sprite28px up, the lower sprite28px down (owner's small follow-up
adds4px per sprite). Button slots, enemy
positions, sprite sizes, header, cards and dock remain unchanged. Phones
retain their prior layout. Keep the nonduplicated enemy identity fix.
Validate visible subject bounds (PNG padding is not subject overlap), and
verify the dock remains on-screen without scrolling at normal desktop sizes.
This supersedes D-394's artwork-driven arena-height/scrolling requirements.

## Artwork clearance and nonduplicated enemy details (D-394)

Enemy name, level and element appear only in the field nameplate, not again
in the corner panel. That panel contains only the selected enemy's strength
modifiers; selection highlights and full Battle menu references remain.

Desktop formation height must accommodate complete artwork, not merely equal
button-center spacing. Reserve two full maximum-size artwork heights plus a
gap for pairs/trios, one for solos. The maximum compressed scale is1.135
(`.82 + .18 * 1.75`); reserve1.14 per row. Remove inherited vertical side
padding that previously consumed the gap. Use intrinsic arena block sizing
with inline-size containment and scroll when full-size art cannot fit.
Stacked tablet formations reserve one complete artwork height per member.
Keep mirrored anchors, defeated slots, existing sprite size formulas and
phone layout. D-393's spacing measurements alone were insufficient: also
measure actual rear artwork rectangle clearance, including at1920x1080.

## Battle spacing and shared control polish (D-393)

Use mirrored, fixed desktop formation anchors for one-, two- and three-member
sides. Pairs occupy the same outer top/bottom anchors as trios; the middle
trio member occupies the inward column and solo members are centered. Remove
legacy per-member translations. Defeated units retain their slots, and bottom
cards reserve a24px desktop status tray so applying/removing statuses cannot
move the formation. Phones retain evenly spaced single-column sides.

The selected-target/modifier heading occupies a real arena grid row, not an
overlay on combatants. At heights600px or less on non-phone-width screens,
the battle shell scrolls a minimum720px layout rather than crushing sprites
and hit targets. Preserve artwork size/facing; artwork ignores pointer hits
so overflowing transparent sprite padding cannot intercept another member's
button or gesture.

The dock fills the available row, with equal-width cards for the actual squad
size. Actions explicitly use the game's shared leader-accent gradient/text
surface, Georgia type, neutral border/surface, visible focus and hover/disabled
states. Artwork-backed squad cards explicitly opt out of generic text-button
restyling. Dock actions are at least56px tall; header targets remain44px.
Actual Gauge values and full ability/rejection text remain accessible.

Toolbar DOM/tab order matches its visual order: speed, Settings, Menu, Leave.
Retain existing speed/Settings/Leave elements and handlers through renders;
replace only the view-owned Menu button, without duplicates. Spent/recovering/
defeated cards cannot silently select a fallback actor; unavailable living
cards remain readable. Combat/authority, results, rewards and saves are unchanged.

Validate HUD, toolbar, chrome, squad sizing/gesture and shortcut regressions,
then full suite/build. Measure equal formation spacing, unchanged positions
after defeat, sprite-center hit targets, full-width dock and contained labels
for squads1/2/3 at320x720,390x844,1280x720,1280x540 and844x390.

## Shared battle HUD (D-392)

Every playable mode uses the same reference-inspired hierarchy, with Last
Light's existing scenery, Georgia typography, neutral surfaces and elemental
accents. The header contains activity, stage/wave progress, animation speed,
Settings, Menu and Leave. The selected target and its actual enemy stat
modifiers sit above the field beside the turn cue.

Enemies remain left, allies right. The field retains existing artwork,
facing, scale metadata, VFX, gestures and enemy HP readouts. Allied HP/Gauge
readouts move to bottom portrait cards rather than appearing twice. Selecting
a card chooses the actor; both the cards and field retain selected-member
feedback. Native/buff changes and HP impacts update the bottom readout while
floating numbers and effects stay anchored to the field sprite.

The command dock always exposes Normal Attack, Skill 1, Skill 2 and Last
Flare, with actual Gauge gains/costs, availability and named ability/rejection
details. There is no new Defense action. The Battle menu retains full kits,
statuses, forecasts and End turn. On phones, cards/actions stack below the
field; Settings/Leave use their existing icons with accessible text retained.
Very short landscape windows scroll the battle shell instead of collapsing
the formation into an unusable strip.
Short status trays cannot expand the formation; full details remain in Menu.

Preserve existing toolbar nodes/listeners through renders, Settings' frozen
run, busy locks, ally-target selection, authority commands, rewards, results,
focus restoration, reduced motion and cut-ins. The dock changes presentation
only: no combat rules bump, account writes, new shortcuts or save migration.

Validate `battle-hud.test.ts`, chrome, shortcuts, impact, toolbar, squad
gestures/art tests, the full suite and production build. Check three-member
formations, long exact values and enemy modifiers at320x720,390x844,
1280x720 and1280x540, including retained sprite dimensions and44px controls.

## Concise player explanations (D-391)

Help describes the rule or exception, not the controls already on screen.
Do not repeat a visible price, currency, Owned state or button instruction in
the same panel's explanatory prose. Use short sentences and lists for distinct
restrictions. Keep canonical bracketed terms, exact effects/rates, eligibility,
permanent-sale warnings and next-run equipment behavior.

Store help reads "Unlock once, equip across your squad." Common purchases
explain that extra copies give no benefit; Calamitic purchases retain universal
element compatibility and ordinary-slot/no-rarity-limit rules. Prices,
single-purchase enforcement and equipment validation are unchanged.

The same pass covers Character progression/equipment, Inventory/material
details, Collections, Conduit upgrades, Focus Loot, Machines/Master help,
Calamity chest help, summon guarantees, Settings and captured-copy panels.
Repeated acquisition rules stay in Inventory/Gameplay rather than Character;
full ability effects, authored lore and numerical reward tables remain intact.
Multi-pull help describes parity with single pulls, not transaction internals.
No mechanics, economy, account writes, routes or dialog behavior change.

Machines loot tables share one Conduit note across all rarities, including
mixed focused/random pools. Component notes omit the guarantee already shown
as100%; final-boss amounts explicitly include5x. Master chest notes retain only
the final-boss restriction and Inventory choice. Do not repeat the same
ownership/selection rules once per rarity. Validate the three-note/60-word
final-boss limit in `creature-loot-dialog.test.ts`.

Validate `menu-information.test.ts` (purchase help at most30 words; shared
Character/Inventory/Upgrade paragraphs at most65 words), existing Store,
Upgrade, summon, Focus Loot, Calamity and Information-topic tests, then build.

## Collapsed Conduit lore (D-358)

Conduit descriptions keep ability effects and equipment restrictions visible.
Origin/lore prose, including the repeated Let/Rise and Elemental Light explanation,
is inside a native **Lore** disclosure, closed by default. This applies to
loadout Details, Store, Upgrade and Archive details, including Master Conduits.
Opening or closing Lore is transient and never writes account data. The
keyboard-focusable summary has a44px minimum target; Archive Lore search still
indexes the collapsed text. Validate with `conduit-store.test.ts`,
`conduit-loadout.test.ts`, `conduit-rules.test.ts` and `archives-controls.test.ts`.

## Compact Normal activity panels (D-330)

Every Normal activity panel uses the shared `activityLayout(media, details)`
helper in `src/presentation/activity-layout.ts`, mirroring Calamity's compact
tier panel. The left column holds the banner (name overlaid), eyebrow, lore,
the three-column facts row and short drop/odds notes; the right column holds
the compact reward showcase, related links, the selected-stage enemy strength
and an inline Stage/Enter row. Training uses a side-by-side hero and details
card. At desktop widths (≥961px) every panel fits 1280×720 through 1920×1080
without page scrolling. Infusion, currency and Elemental War location pickers
become a horizontal row above the card; the ten-dungeon picker stays a column.
Narrow screens stack the columns, scroll normally and share Calamity's compact
header, horizontal activity rail and unsplit dock labels. Presentation only:
all text, numbers, data hooks, Back history and 44px targets are unchanged.

## Sealed Calamitic shop (D-324)

Market and Conduit Store always expose Calamitic Conduits. Before any saved
EX clear, a large locked panel shows exactly "Rise deems you UNWORTHY of her
most prized creations." No products, balance, unlock hint or Information
dialog appear. Unowned Collections entries remain hidden until unlocked.
The unlocked view offers five universal100-token devices, current/+5 effects,
Rise-only lore, exact balances and disabled Owned buttons. Inventory includes
Calamitic Tokens; holdings, equipment and Upgrade include the new rarity.
Same-route shop switching preserves caller history without account writes.
Neutral pending-art placeholders never request unprovided images.
[Full contract and checks](calamitic-conduits.md).

## Visible enemy strength (D-322)

D-326 extends this same comparison into compact battlefield and full Battle
menu readouts, directly below enemy HP. Red signed percentages identify higher
HP/Attack/Defense; blue signed percentages identify lower stats. Neutral text
names the standard enemy's level, or labels boss/activity scaling against it.
These are actual spawn-stat differences, not estimates from damage taken or
temporary debuffs. Mixed increases/reductions retain independent colors and
signed text; labels wrap rather than truncate on phones.
All hostile base stats rise5% before rounding under
[the Phase3 contract](combat.md#phase3-hostile-strength-and-visible-scaling-d-326).

Activity entries show the selected enemy's level, rank and actual HP, Attack
and Defense. Story updates with its selected stage; Training previews wave1.
Dungeon, infusion, currency, Machines, Roses and War selectors refresh the
preview on every change, including restored Back selections. Calamity shows
each tier's actual stats beside its special mechanics.

Compare displayed stats with a standard enemy at the same level, showing only
nonzero differences as percentages. These are stat comparisons, not damage
forecasts or flat Defense mitigation. Gameplay Information explains the shared
level baseline and the additional challenge from shields, healing and skills.
Existing overlapping activity level ranges remain intentional. No hidden
activity multipliers, level rescheduling, account writes or combat changes.

Validate with `npm test -- src/presentation/enemy-strength.test.ts src/content/stat-growth.test.ts --maxWorkers=2`
and narrow-screen ordinary/boss stage switches.

## Plain language and reward alignment (D-321)

Use short, natural English in player-facing activity descriptions, boss rules,
reward details and help. Say what the player fights, earns, spends or must do.
Keep exact amounts, chances, unlocks, timing and meaningful restrictions.
Do not fill these screens with implementation terms, save/receipt internals,
design commentary or repeated assurances about unchanged systems. Show save
status once; keep actionable error messages and post-save failure warnings.

Calamity uses the [compact tier browser](calamity-mode.md#compact-tier-browser-d-327)
instead of three tall side-by-side cards. One selected boss, stats, chest
contents and entry action share the desktop panel; detailed abilities, team
requirements and loot tables remain in native dialogs. Reward names align left, quantities right; omit
Master-chest entries for tiers that do not contain them. Reward showcases share
image/name/quantity rows so long names do not stagger their counts.

Boss previews use contained artwork, dimmed scenery and a subtle contrast edge.
Battle scenery is also dimmed for Calamity; bosses retain a contrast edge in
the field, ultimate cut-ins and revealed Collections entries. Hidden silhouettes,
source images, subject colors, facing and mechanics remain unchanged.

## Activity difficulty tabs (D-320)

The twelve Calamity-enabled activities offer Normal / Calamity tabs, including
Crimson Roses on both Gameplay and Events. Normal is selected initially.
Each panel owns its own mission information, reward details and entry controls:
Calamity shows its three boss tiers and sealed-chest drops, not the normal
mission's currencies, materials or captures. View Loot retains exact chest
contents and weighted bundle probabilities.

Keyboard Left/Right, Home/End and roving tab focus follow the selected panel.
Normal stage controls and portrait/banner DOM survive difficulty switches.
Difficulty is transient menu state, captured/restored by caller-based Back
alongside activity/stage selections; Settings preserves the menu DOM. No save,
unlock, battle, reward or confirmation behavior changes. Story, Training and
Elemental War remain unchanged. See [Calamity](calamity-mode.md#difficulty-tabs-d-320).

## Native identities and explicit ally selection (D-316)

All sixteen Element-Bearers expose their current role, play loop, passive and
exact native actions in Character and battle references. Battlefield readouts
show actual owned resources, recipients, expiry and Aurora's next scheduled
enemy skill rather than historical shared counters. See the
[native identity contract](character-identity-redesign.md).

An ally-targeted action opens the same named recipient picker from the
selected member's hold grid or Battle menu, including nonleaders. Only living
allies are eligible; self is offered when legal. Confirming submits that exact
recipient without changing the hostile target. Cancel/Escape spends no Gauge
or action and restores focus. Disposal closes the picker; stale battle state
must be selected again. Offline and authoritative online actions share this
behavior. The dialog retains contained scrolling, readable full descriptions
and44px targets on narrow screens.

Mechanic cues describe resolved native events; they do not grant damage,
healing, resources or equipment activations. Existing reduced-motion,
presentation speed and disposal apply. Validate recipient selection,
cancellation, nonleader controls, references and mechanic cues with
`src/presentation/native-kit-presentation.test.ts`.

## Character-header element medals (D-310)

Element-Bearer detail headers show their canonical combat-element medal and
name beside stars/role/rarity, using the shared element-label resolver and
installed emblem artwork. Captured member headers use the captured creature's
combat element, not its infusion/fodder family. Medals are36px and remain
visible across Stats, Level, Evolution and Conduit tabs and upgrade refreshes.
The prefix retains form title/weapon without repeating the element as plain
text. Medal images are decorative beside the readable element name; header
tags wrap on phones. No artwork, stats, element rules or account data change.

Validate all16 bearer headers, captured combat elements and portrait/medal DOM
preservation in `src/presentation/upgrade-reference.test.ts`.

## Battle exit after resume or defeat (D-292)

Battle results Quit delegates to the same Back flow as toolbar Leave, rather
than issuing its own server quit before navigation. Preserve server
confirmation/error handling and saved rewards. The real caller wins whenever
history exists; a resumed online battle with empty history returns to Gameplay
with clean controls/scroll. Nonbattle Back does not acquire a default destination.
See [exit contract](free-battle.md#reliable-battle-exit-d-292).

## Conduit Archive search (D-354)

The Conduit Archive has the same top filter bar as the Character Archive:
a Search box, a **Search in** sub-option (Everything, Name, Effect, Ability
term, Lore), Rarity (including Calamitic once unlocked, and Master) and
Ownership, plus Reset and a live "N / total Conduits shown" count.
Words must all match (case-insensitive); brackets are optional, so `burn`
and `[Burn]` match alike. Ability term matches only bracketed terms in the
current and +5 effects (for example [Skill 1], [Burn], [Last Flare]); Lore
matches the lore/power lines in Details, never prices. Master Conduits are
searchable too. Filtering is presentation-only: no account writes or history
entries, and card DOM is kept (cards are hidden, not rebuilt).

## Collections reorganization and control repairs (D-291)

Collections uses a title/Information toolbar, wrapping gallery buttons,
compact top filters and natural-height card results. Counts and management
links no longer compete with a tall filter sidebar. Filters wrap into two
columns on ordinary phones and one on very narrow screens, retaining44px
selection actions. Use the page scroller rather than nested/clipped filter or
results panes; its position participates in caller-based history.

Gallery/filter hidden states override layout display rules. Reset clears all
five backing selects and refreshes the shared selection-panel labels.
Gallery switches preserve controls, card DOM and discovery/ownership gates.
Combat kit, Details, Information and stage-specific loot remain functional.
Unowned captured-form artwork uses the same silhouette as unreached human
forms. No account, acquisition, reward or combat behavior changes.

Archive cards now use flexible natural content flow, not shared subgrid rows
whose child counts differ between humans, captured forms and Masters.
Art stays inside11rem contain-fitted slots, including creature images and
pending SVGs; names and loot never overlap it. Keep readable full text and
existing entrance/reduced-motion behavior. See the
[gallery contract and validation](archives-and-elements.md#collections-layout-and-controls-d-291).

## Play bottom clearance (D-273)

Every Play activity group reserves4rem plus the device bottom safe-area inset
after its content. The shared rule includes Story, Training, dungeons, infusions,
Machines, War, currency farms and Events, including external Event details.
The page scroll container uses matching bottom scroll-padding so focused
controls can be brought clear of the screen edge. Preserve natural page
scrolling, complete information, existing44px targets and separate list/dialog
scrolling; do not shrink text or clip content to force one-screen fitting.

## Resources are owned items

Inventory's Resources grid includes progression materials and positive stacks
of Broken Mechanical Components. Components use the same item card, full-size
artwork area, exact Owned quantity and optional Details as neighboring resources,
not a balance/stat line in Conduits. Resources counts include that distinct item
type. Zero components has no tile; components-only holdings are not empty.
Component Details explains real Conduit upgrade use and Machine drop rules.
Search and the Components type filter target this same resource tile. Keep the
existing account field and all acquisition/spending rules unchanged.

## Inventory search, filters and concise Information (D-271)

Inventory has a live case-insensitive item-name search, combined Item type,
Rarity and Element filters, and Clear. Type covers materials, ordinary Conduits,
Masters, chests and positive component holdings. Search also recognizes a
Master's bearer name. Counts report matching distinct positive item types,
not quantities; currency balances and unavailable-save errors remain visible.
No matches has an explicit status, not an empty-inventory claim.

Element matches ordinary material definitions, authored Conduit affinity,
Master bearer affinity and the actual matching elements for Heaven/Abyss
specialty recipes. Rosethorn materials, unrestricted Conduits, components and
chests have no fixed element; use No element to find them. Specialty materials,
components and chests have no authored rarity; never infer a rarity from art.
Selections use the existing shared accessible selection panels.

Filtering hides nonmatching cards/sections without recreating artwork, Details
or chest controls, changing holdings or resetting disclosure choices. Search
and filters survive menu refresh and caller-based history in memory, resetting
at title. Nothing is written to a wallet.

Inventory Information opens four short optional topics: Finding items,
Materials, Conduits, and Masters & chests. Keep sources, exact equipment limits,
chest chance and activation bounds available without one long visible text wall.
Use the shared topic/back/focus behavior and existing item Details.

## Optional histories and founding canon (D-269)

Team headers provide an optional Lore dialog for individual human bearers and
captured Devourers, without adding a biography wall to the main detail screen.
Individual Archive kit references retain the human's history; Collections
Information stays concise and rules-focused. Devourer and Machine origins are
available only after discovery, alongside existing identity/element gates.
Machines are labeled separately from Rise's Devourers.

Global Help and Gameplay Information provide the Let and Rise origin topic.
Story's Prologue uses the same shared history. All use existing styled native
dialogs and topic navigation, with focus restoration and contained dialog
scrolling. No automatic popup or account write. Item Details and Summon
Information use the same canon without changing their mechanical rules.
See [founding canon](world-lore.md) for the full narrative and boundaries.

## Collapsible holdings and item Details (D-268)

Under D-407, Resources & Items and all Conduits are independent native
disclosures with44px summary controls and Expand/Collapse affordances. All start
open; closing one never hides another. Expansion state is transient and restored
through menu history and refreshes, not written to the account. Returning to
title resets it. Currency balances remain outside the disclosures.

Owned-item cards show bounded artwork, complete names, rarity/bearer where
applicable, exact counts and a Details button. Wider natural-height slots and
shared content rows align neighboring names, counts and buttons. Do not put long
effect paragraphs into narrow grid slots. Native styled Details dialogs retain
the exact current upgraded effect, fixed kit rules (without repeating them),
Conduit lore and ownership/equipment explanation. Masters identify their bearer
and always-active rules; materials explain their real progression use, including
the currently unusable weapon specialties. Chest Details explains choice, use
and drops; its artwork remains the sole opening action with existing protections.
No new destination links, transactions or acquisition rules.

This supersedes D-215's always-open requirement and older prohibitions on optional
descriptions. Lists still use natural page scrolling, never squeezed/nested panes.

Collections Information contains gallery rules only, not a roster-wide
Element-Bearer biography list. Individual combat-kit references remain available.

Machine's Master Chests appear only as positive owned stacks in Resources & Items,
with compact artwork/name/count cards, not a dedicated full-width chest panel.
Use the explicit Open button (D-405) to choose a Master with the existing
confirmation and atomic opening flow. All-owned accounts retain their chest
tile with opening disabled. Calamity chests share this section and Open control;
Master Conduits themselves appear with ordinary Conduits.
Drop rules and detailed chest rules remain in Inventory Information.
Inventory holdings contain no destination shortcut buttons: no Store, Upgrade,
Equip in Team or empty-state dungeon/store links. Use the shared navigation
for destinations; keep Information and owned consumable use available.

Summon banner artwork uses a shared38.75rem maximum width,25% larger than
the previous31rem cap, for both current and future banners. Preserve the
16:9 artwork ratio; constrain to available column width on smaller screens
rather than overflowing, zooming or cropping more of the image.

Featured character portraits beneath each banner use8.5rem square slots,
double the previous4.25rem size. Keep complete contain-fitted portraits,
larger readable names and ownership marks. Tier lists wrap naturally; phones
put the tier heading above the list and fit at most two portraits per row,
reducing the slot width only when needed. This shared rule covers both real
banners and future lineups without changing banner artwork, odds or acquisition.

Item catalog cards share naturally sized content rows using CSS subgrid.
Material Exchange, Cosmetic Store and Conduit Store align artwork, names,
rarity/ownership, effects (when present) and price/count chips across each
visual row. Inventory material/Conduit/Master grids
use the same row-sharing approach; Collections uses D-291's flexible cards.
A longer name/count/effect expands the
shared row rather than shifting adjacent fields independently.
Keep complete text and exact amounts: no fixed-height clipping, ellipsis,
line clamps, smaller fonts or script-measured heights. Responsive column
changes rebuild shared rows automatically; selected styling and actions remain.

Character and Conduit Archives reserve a bounded11rem artwork row under D-291. Portrait
wrappers, ordinary Conduit frames and Master art fit that row with contain
sizing instead of growing from intrinsic image dimensions or square aspect
ratios. A small inset accommodates portrait idle motion; Conduit frames reserve
space for their upgrade meter. Names and details stay outside the artwork row,
with natural card flow keeping names and actions readable. Keep complete
silhouettes, facing and full text; do not resize source assets to repair layout.

Evolution uses a dedicated compact desktop layout: smaller identity portrait
only on this tab, one stat/form heading, horizontal current/next comparison,
three-column exact stat deltas, compact costs and adjacent action/rejection
text. Keep preview, every cost, fodder status and Evolve visible together at
1367x640 and1788x768, including maximum-safe holdings and a full squad.
Only the uncapped captured-copy chooser retains contained scrolling; phones
keep accessible page scrolling with no horizontal overflow. Selection labels
retain44px targets and their checkboxes cannot expand to full-row width.
Evolution and unreached Collections portraits share the same dark radial
background and black silhouette with a subtle white outline/halo, actual
form asset and facing. No white preview slab or revealed future artwork.
Switching tabs restores the normal header without replacing portrait DOM.

The Level tab shares Evolution's compact desktop identity header, resource
cards and three-column seven-stat grid. One "Level & stat preview" heading
replaces repeated progress/preview labels; current and next levels stay visible.
Level up, Max Level and rejection text share an action row. All stats, costs
and controls fit together at1367x640 and1788x768 without page scrolling.
Phones retain page scrolling and a two-column stat grid, without horizontal
overflow. Leveling costs, caps and confirmation behavior are unchanged.

Captured Elemental-Devourer detail uses the same compact Team composition:
identity/level/fixed-form header, squad and Lock copy actions, then Stats & Skills,
Level, Sale and Conduits sub-menus. Remove duplicate collection and equipment-count
links from the header. Stats & Skills displays exact equipped stats and retained
ability dialogs; unavailable slots remain explicitly labelled.
Level shows all seven current/next stat deltas and exact owned/required costs,
with Level up and Max Level together. Sale retains every authored payout choice
and protection reason; nonsellable forms explain their restriction.
Sub-menu switches preserve portrait and action DOM, update the in-memory Team
tab for history/refresh, and never write accounts. Conduits opens the existing
full-page captured-copy loadout. No Evolution tab or new captured mechanics.
At1367x640 and1788x768 these detail panels fit without scrolling; mobile keeps
page scrolling without horizontal overflow. Complete names/portraits stay apart.

Each sellable captured-copy collection card has Quick Sell beside Lock.
It opens a native styled dialog naming that exact copy, with its actual
sale value or authored payout choices, and a Sell action. Locked, squad and
Conduit-protected copies still show their offer but cannot sell; display the
actual protection reason. Reuse the detail screen's shared sale controls,
per-copy IDs and existing reread/confirmation/atomic sale flow. Closing the
dialog does not change the collection, selection or wallet.
Sale confirmations show the creature name and exact payout, not the internal
capture UUID. Exact-copy validation/removal still uses the unchanged saved ID.

Character passive dialogs explain the automatic effect and charge earning
first, then a separate "What the charges do" section with character-specific
skill spending, exact bonuses and caps. All charges are spent; base skill
effects remain available at0 charges. Collections and Battle use the same
identity-aware reference. Battle charge tooltips explain the stored payoff,
not "No standalone effect." Avoid repeating earning paragraphs or recovery,
shield-refresh and Burn-duration rules within one description.

Profile Player info omits the redundant Edit squad heading button; member cards
and empty-slot Add a member routes remain, with full squad editing in Team.
Desktop uses spare panel height for larger portraits (112-144px on shorter
screens, up to176px on tall screens),56-64px squad thumbnails, larger30-32px
headline totals and13-14px account/collection values. At640px height, compact
gaps/48px bio field and balanced rows keep information and save controls visible.
The current Story region is already named/highlighted in its rows; its duplicate
header caption is omitted on short desktops. Preserve five recent events,
full names/counts,120-character bio,44px actions and actual saves. Desktop
1367x640 and1788x768 fit without page/panel scroll after entrance animations;
phones retain accessible page scrolling rather than hiding/clipping information.

Header wallet controls use64px minimum currency cards with32px currency artwork,
larger balances/labels and56px Help/Collections/Settings buttons with26px glyphs.
The Profile control is72px with an edge-filling circular frame and cover-fitted
portrait, not an inset rounded square. Zero padding and circular clipping remove
the dead ring; the outer button border and selected cosmetic border remain.
The unsigned generic profile glyph is36px. Phone utility grids reserve72px for
Profile and56px for each other control. Preserve exact balances, frame selection,
profile-picture resolver, accessible labels and navigation; no art/save changes.

Conduit loadout action/details/slot/filter controls use symmetric inline padding
and centered text/grid alignment, overriding shared leading-edge button styling.

Character detail header artwork uses a height-responsive11-16rem square portrait
on desktop (30dvh, capped16rem), keeping the enlarged artwork while leaving room
for the details on shorter screens. At phone widths the header stacks with a centered
15rem portrait and identity/actions below. Preserve the complete supplied art
with contain sizing, facing/idle wrappers and page scrolling; no sprite cropping
or source changes. This sizing applies to both bearer and captured detail headers.

D-265 removes the duplicate All Element-Bearers and Conduits/count buttons from
the bearer header. Collection remains in the Team sidebar; Conduits remains a
persistent sub-menu. Squad leader/Make leader/Add to squad remain beside the
identity. Compact header/panel gaps, seven stat rows and four skill buttons remove
excess padding and the redundant Skills instruction. Preserve exact values,
ability dialogs,44px minimum actions, full names and page scrolling when needed
on phones/short screens or with expanded equipment comparisons. The sidebar uses
compact thumbnails/rows without removing squad/collection controls. Captured
lock/loadout controls and upgrade/equipment functionality remain unchanged.

Upgrade validation checks the always-visible Stat & form preview (not a
collapsed `details` disclosure), seven stat deltas and exact resource costs for
all16 bearers at each nonfinal evolution and both Level/Evolution paths.
Visible-copy tests enforce spaced count slashes; prose uses words such as
"shield and buff" rather than unspaced slash shorthand.

## Earned profile pictures and text chats (D-260)

The owner approves private text messages between accepted friends and invite-only
groups, up to500 characters/message and10 members. Group owners add/remove members.
Chats/Friends/Requests use the supplied compact references with searchable chat
list, central conversation/composer and member/details sidebar. Unread counts,
pin/mute and blocking are required; blocking prevents messages and new friend
requests. No share-code, squad-sharing or stage-invite cards. Server persistence,
endpoint and client wiring are implemented and deployed; older D-259 "no chat"
describes that earlier delivery, not the current approved scope.

Updates poll every10 seconds only while Chats is visible, with manual Refresh.
Newest pages mark read; earlier history loads30 messages at a time. Pin/mute do
not independently mark read; muted conversations retain their own unread count
but are excluded from aggregate unread. Group invitations require explicit
accept/decline and count toward capacity. Owner departure transfers to the
longest-standing member; an empty group is removed. New members can read earlier
group history. Blocking removes friendship/requests and pending invites between
the players, hides the blocked sender's group messages and excludes them from
unread. Unblocking does not restore friendship; re-friending reveals retained DM
history. No realtime push, edit/delete or reporting feature in this delivery.

Messages are plain text, escaped at render, with no media/HTML interpretation.
Server authorization, rate limits and idempotent request IDs own persistence.
No optimistic sent messages: acknowledgement must precede display. Ambiguous
failure retains a retry with the same payload/ID; definitive rejection allows
correction. Navigation disposes polling and stale responses; account changes
clear transient chat state. Chat never advances gameplay revisions or RNG.

Profile picture collection replaces generic/quick avatar choices with exactly32
character pictures: acquisition and Omnic for each of16 Element-Bearers, plus the
neutral Last Light default. Base requires ownership; Omnic requires evolution6.
No captured creatures or intermediate forms. Legacy character icon IDs resolve to
their acquisition picture without load writes. Change/Browse opens a game-native
searchable All/Unlocked/Locked grid, selected preview, unlock requirement and
Profile/Chat/Friends usage previews. Locked entries show grayscale, lightly blurred
art with a sharp shadowed Locked overlay and cannot be
applied. Selection uses the existing profile edit queue, not another save pipeline.
Navigation/sign-out invalidates an open editor's result.
The D-263 collection reference uses a near-full-viewport native dialog: Back and
breadcrumb row, large collection panel, separate detail panel and anchored Use/
Back controls. Desktop panels share top/bottom bounds; phones stack with contained
collection scrolling and dialog page scrolling. Real Default/Characters sections
have ownership counts; All/Default/Characters/Acquisition/Omnic categories combine
with search and All/Unlocked/Locked filters. Empty groups disappear and the shown
count reflects actual matches. No sample data, New tracking or invented creature/
achievement/event picture categories.

Unlock ring/count includes the available neutral default (33 total), with the
32-character count explicit. Cards remain220px high with100px square artwork rows,
full title and separate rarity/character labels; selected cards have a check mark.
Preview arrows cycle matching entries, including muted locked art and requirements.
The preview shows actual rarity/form, In use, unlock requirement and compact
Profile/Chat/Friends examples. Applying the already used picture is disabled and
cannot cause another save. Preview/filter interactions remain entirely transient.

Dedicated1:1 illustrations are installed (D-262), replacing full-body previews
across every shared avatar surface.31 have vibrant current-element gradient
mosaics; Omnic Flora preserves the complete delivered image unchanged.
Characters retain supplied square framing/scale, with revisioned deployment-base
URLs. The [32-prompt pack](../Art/characters/Element-Bearer%20Profile%20Pictures.md)
remains generation guidance; no auto-grants, costumes or progression changes.

## Friends reference and real presence (D-259)

The top navigation has Player info, Chats and Friends only; the redundant
Requests shortcut is removed. Requests remain in the Friends sidebar.

Friends shares the profile editor on the left, searchable accepted friends in
the center, and Add friend plus Requests on the right. Received/Sent tabs switch
only requests, never hide the accepted-friend list, and remain selected through
refresh/actions and menu history. Friends count uses the real30 limit and the
main Friends tab retains its incoming-request badge. Username and public code
requests remain supported; Copy uses the actual signed-in code, not samples.

Accepted rows show actual artwork/name/username, Online or Offline/Last seen,
and View profile. Remove friend lives in that profile dialog and retains its
confirmation. Requests keep Accept/Decline/Cancel with44px targets. Search
matches accepted names/usernames only and has a no-match message. Dense lists
have bounded visible scrolling so all30 friends and pending requests remain
reachable without stretching the desktop page. Phones stack with page scrolling.
No Beacon Seeker, sample data/codes, fabricated badges or chat system.

Online means a server-recorded accepted presence touch within90 seconds;
otherwise Last seen uses that actual timestamp. Never-seen friends have no
invented timestamp; missing optional legacy fields show Status unavailable.
Only accepted friends receive presence; incoming/outgoing requests do not.
Checkpoints refresh presence text without replacing editor/search/tab DOM.
Presence is approximate recent activity, not guaranteed live connectivity;
sign-out/inactive tabs may remain marked online until the90-second window ends.
No additional polling service, client timestamps or gameplay revision changes.

## Signed-in profile reference layout (D-257)

### One-screen desktop refinement (D-258)

Short desktop viewports retain the three-column profile instead of moving
Squad/Recent activity below the page solely because of height. At desktop
widths of1200px or more and heights up to820px, the avatar sits beside Display
name, spacing is tightened and progress/activity rows are compact. All six
Story rows and five recent records remain visible, without overlapping panels
or shrinking44px actions. The duplicate online-autosave footer is omitted in
this compact arrangement; the editor retains its Auto-saves label. The
editable bio has a smaller textarea, retaining its full120-character limit.
Widths below1200px retain responsive page scrolling; mobile is not squeezed
into a single unreadable screen. Gameplay, save and profile behavior is unchanged.

The owner's first profile image is the layout target, not sample account data.
Player info uses a portrait/editor column, four compact real summary cards,
always-open Story/Collection and Account/Save panels, and a Squad/Recent activity
column. No collapsed article headings or nested profile-panel scrollbars.
At1367x768 the desktop reference fits one screen; narrower/shorter viewports
stack panels with page scrolling rather than clipping. Inputs/actions retain
44px targets, Georgia, exact values, real art, accessible selection/focus and
the existing global navigation. Profile icon shortcuts plus the shared artwork
picker expose every owned bearer without expanding the editor by sixteen icons.
Checkpoint updates refresh tracked numbers without replacing unsaved field or
portrait DOM.

All six canonical Story regions show exact completed stages out of25. Summary
totals are150 stages, six restored regional beacons, sixteen Element-Bearers and
thirty accepted friends. Collection uses actual owned ordinary Conduit types out
of85, distinct currently owned eligible captured forms out of30, and reached
Character Archive forms out of126 (96 bearer evolutions plus30 captured forms).
Captured copies remain uncapped and are counted separately. Account shows join
date, forward-only online days/time/summons, plus both banners' actual200/500
pity counters. No fabricated historical totals or static demo holdings.

Friends still supports usernames, and now also accepts the stable generated
friend code shown with Copy beneath the display name. A separate public Player
ID derives from that code, not the authentication ID. Incoming requests have a
real count badge. Acceptance checks both players'30-friend capacity atomically;
existing excess friendships are not removed. No email, private wallet or other
private account data is shared.

Recent activity displays the latest five real confirmed records (server keeps
eight), including new-profile creation, starter/import, summons, Conduit
purchases and Story clears. First regional clear details identify beacon
restoration; replay does not invent another restoration. Old activity is not
reconstructed. The owner explicitly declines the Beacon Seeker badge; sample
toggles, fictional icons and sample notices are omitted.

Compact Save Data keeps online and browser saves distinct. Save now checkpoints
the signed-in online account and acknowledges only success. Copy/Load save code
and Delete Save Data affect only the offline browser save. Codes are versioned
`LLSAVE1:` UTF-8/base64 complete offline envelopes, limited to4MB decoded and
validated exactly like files; they contain no auth/session/settings data and
are private, editable backups, not rewards. Loading requires in-game confirmation
and retains rollback protection. Missing browser data disables copy/delete/
export, not online Save now or Load. Export/Load files remain in a game-native
File tools dialog to keep the reference card compact. New unstarted online
accounts retain the existing full Player info import safeguards.

Title entry has exactly two actions (D-255): Sign-in / Create Account and
Play Offline. The title Player info button is removed; existing starter/menu
Player info and save-management routes remain. Account entry opens the
authentication dialog and successful sign-in enters online play automatically
(D-256), without a second Play Online button.

## Automatic online entry and minute autosave (D-256)

Successful sign-in and an existing authenticated account enter online directly.
Reload restores the authenticated online account; Play Offline cannot silently
switch a signed-in player to the browser save. Sign out explicitly to play
offline. Email verification and password recovery remain required where
applicable; recovery does not enter play until the new password is saved.
New-account Start fresh/Import Save File remains in Player info, not a mode
choice. Failed entry reports an error and offers Retry connection.

Active initialized online/offline games autosave every60 seconds while the
browser runs. Offline uses the existing validated, rollback-capable save.
Online uses a server-only checkpoint of the authoritative wallet/profile/frozen
run; it changes neither gameplay revision nor RNG, rewards or pending requests,
and never replaces the client battle presentation. Busy/pending online operations
defer that cycle. Title, uninitialized accounts and isolated debug do not save.
Mode/account changes reset the timer; page exit stops it and browser restoration
restarts it. Ordinary immediate transaction saves remain unchanged.

Only acknowledged success shows "Your light endures. Progress saved." in a
separate polite, noninteractive notice. It fades and is removed after1.8 seconds,
without taking focus or replacing error/reward notifications; reduced motion
uses a static notice for the same duration. Failures show an explicit error,
never a success notice.

Level/evolution stat and form previews are permanently expanded (D-253).
Their headings use the same bordered gradient treatment as menu controls but
remain noninteractive headings, with no dropdown/collapse affordance. Compact
stat previews follow the same rule; actual values and transactions are unchanged.

## Master picker artwork and adjacent Team tabs (D-250)

Master equipment choices display their canonical64px art beside names, retaining
the hidden select and single change transaction. The unequipped choice has no
substitute art. Team detail portraits are160px desktop/128px phone. Desktop
Stats & Skills/Level/Evolution/Conduits tabs occupy a2x2 group beside the gradient
header; narrower screens move them below without clipping. This supersedes
D-245's portrait size and below-header tabs, not Squad formation sizing.

## Readable Conduit cards and Details (D-249)

Equipped Master art is112px (D-254),75% larger than D-252's64px, with a matching
grid track on desktop and narrow layouts; containment remains unchanged.

Loadout omits duplicate Buy/global Upgrade header links (D-251). One Store
link remains in the owned catalog; equipped cards retain targeted Upgrade.

Equip uses64px slot/catalog art with4px upgrade-meter squares. Slot names and
owned names use16px text; metadata and controls use14px. Slot artwork and
target/Details controls occupy one row, with full-width identity underneath
and a two-button Upgrade/Remove row. Labels never break within words.
Each owned/equipped Conduit has Details, including stat-only designs.
The game-native modal shows112px art, current upgrade/element, each actual
upgraded stat on its own line, complete special effects and Omnic element/slot
restrictions. Dense effects are no longer squeezed into the small slot.
Four owned entries per page, search/filter/sort, real costs and equipment
transactions are unchanged. Close/Escape restore focus.

## Concise ability facts (D-248)

Ability descriptions use objective effect statements, not questions or repeated
tutorial paragraphs. Shared charge acquisition/cap rules stay in the kit resource
reference, not every spending ability. Ability copy retains targets, potency,
duration, charge scaling/caps and concise status semantics; costs/cooldowns remain
in their existing readouts. Shield/Burn refresh, Defense bypass and caster recovery
rules are preserved. This is a copy change, not a combat rebalance.

Fresh Team navigation opens character detail, even after editing Squad and
visiting Home (D-247). Explicit Edit squad still opens formation; Back restores
its actual historical Team sub-view rather than resetting it.

## Smaller squad formation portraits (D-246)

Formation portrait/empty-slot frames cap at176px square instead of growing
with the three-column cards. Reduced card padding/gaps keep names, rarity,
level and Change/Choose controls readable and visible. Squad selection and
saving are unchanged; this does not resize the separate character header.

## Compact Conduit and Team screens (D-244)

The owner's images6/7 supersede D-238's oversized two-by-four slots and large
Master/owned-list composition. Desktop Equip uses four columns by two rows
of compact slot cards, a short Master row and bonuses inside the loadout panel.
Upgrade uses a compact owned catalog beside selected identity, current/next
effects, level progression and the actual upgrade resource/action footer.
Owned catalogs use pagination with search, sorting and filters, approved for
accounts with85 entries: all entries remain accessible without scrolling lists.
Equip shows four owned rows per page; Upgrade shows six catalog cards per page.
At1367x768 both pages fit the available desktop content viewport, including
filled equipment slots and long multi-stat effects. Narrow screens retain
responsive stacking/page scrolling; touch controls retain44px minimum targets.
The references specify presentation, not fake names, prices, caps or mechanics;
active Master functionality, five account upgrades and component-only spending
remain authoritative. Detailed effects and rejection reasons remain accessible.

Team has a direct Edit squad route to the existing formation editor, even with
three occupied slots. Remove the redundant lower Conduits summary from bearer
and captured-copy details; header/tab equipment entry remains. Character detail
headers retain a black gradient, sized to their content rather than stretching
across the page (D-245). With112px desktop/80px narrow portraits, collection,
Conduits and leader controls sit directly beneath the identity beside the
portrait, not at the far right. Store icon frames
reserve meter space and constrain intrinsic image sizes above the name.
Home, Market and the restored global navigation remain unchanged.

## Restored global navigation (D-243)

At owner request, restore the pre-D-242 global bar's markup, sizing, responsive
layout and always-visible navigation. Remove the expandable wrapper, page-label
row, Show/Hide toggle and in-memory expansion state. All four destinations,
currency controls and utilities use their prior layout; character content is
unchanged. D-242's retractable-header contract below is historical, not active.

Retain the specificity-correct viewport grid and content scroller from D-242
so lower page information remains reachable. Browser checks at1367/1024/390px
confirm four destinations, no toggle, scrolling to the content bottom and no
horizontal overflow. Sanctuary/reference tests cover the restored markup.

## Thin retractable global navigation (D-242)

Superseded by D-243; retained as historical context.

The global Home/Team/Summon/Play header, not the character portrait header,
has a Hide navigation / Show navigation control. Expanded navigation uses
compact44px controls, readable14px-plus labels and natural wrapping when
balances/destinations cannot fit. Collapsed navigation shows the current page
and the toggle in a slim row. All destinations, exact currencies, Help,
Collections, Settings and Profile remain in the expandable region.

The header starts expanded and remembers the player's choice in memory across
menu renders, without wallet/settings writes. Its toggle exposes
`aria-expanded`/`aria-controls`; hidden controls leave the tab order, while the
page heading remains outside the hidden region for navigation focus. Toggling
only changes the header, preserving content DOM, form drafts and selections.
Title, selection and battle toolbars are unchanged.

The menu shell consistently uses a viewport-height grid with an auto-sized
header and a scrollable remaining content region at every width. Explicit
specificity overrides the historical `.menu-screen.sanctuary-content` visible
overflow and narrow-screen block layout that otherwise clipped lower content.
No further shrinking of character art, stats or page content.

Validation: `sanctuary-navigation.test.ts` covers toggling, focus, retained DOM,
collapsed renders and malformed-control errors; existing sanctuary/reference
tests retain destinations. Browser checks at1367/1024/390px measure a53px
collapsed header, reachable bottom content and no horizontal overflow.
Expanded measured60/111/162px with debug-sized balances and no clipped buttons;
larger balances wrap rather than shrinking text. State survives a menu render.

## Normal browser UI sizing and contained art (D-240)

Use the browser's default root font size (`100%`, normally16px), not
viewport-dependent enlargement. This supersedes D-237. Supporting menu labels
have a14px minimum; preserve browser zoom, exact values and44px controls.
Team detail rows size to their actual contents and start-align the header,
preventing overlap with the section tabs. Detail portrait columns are11rem
on desktop, with10/11rem narrow-layout caps,3.5rem sidebar thumbs and9rem
collection art. This reduces D-235 sizing while retaining prominent portraits.

Thumbnail grid tracks and children have zero intrinsic minimums and explicit
container bounds. Inventory art stays inside5rem cells. Upgrade list thumbs
are52px square with contained frames/images and a reserved9px meter area;
the selected icon is at most180px inside a12rem hero. Keep source artwork,
portrait DOM/facing and full-bleed scenery unchanged.

Selection dialogs fit within the viewport minus32px, up to800px wide and640px
high. Their choices region scrolls independently, reserves scrollbar space,
shows a normal-width scrollbar and is keyboard-focusable with a choices label.
All choices remain available, including disabled choices; closing/Escape
restores trigger focus without changing the backing select. Conduit owned
lists also have visible scrollbars; the upgrade list is focusable. At961-1200px,
Upgrade uses a15rem list column beside stacked details/resources instead of
three cramped columns. At1200px and below its owned list is capped at26rem
and scrolls, rather than making an85-entry page unmanageably tall.

Validation: `selection-panel.test.ts` covers85 choices, last-option selection,
one change event, disabled choices and Escape/focus cleanup. Existing Conduit
update/loadout and reference-UI tests retain transaction and DOM behavior.
Browser checks at actual1367/1024/390px cover Home, Team, Summon, Gameplay and
Inventory without horizontal overflow or art exceeding tested containers,
plus Collections without overflow. Team headers end before tabs; upgrade
icons fit52px bounds and the final owned row is reachable. The ordinary
Conduit picker reaches its final option at all three widths and restores focus
on Escape; Settings fits the390px viewport. Use only isolated debug holdings
for navigation checks, never fund or transact against real saves.

## Conduit bonus emphasis and owned search (D-239)

Total bonuses compares final equipped stats against the same member's unequipped
base stats. The base stays white. Only the net bonus and final value are green
when above that base or red when below it; arrows, signs and exact values remain
visible so color is not the only cue. A penalty does not turn a still-above-base
total red. Compare unrounded values using the shared direction helper; unchanged
rows stay omitted. Equipment and combat calculations are unchanged.

Your Conduits has a search field for names, canonical elements, effects and
descriptions/lore (also stat labels, rarity and power). Searches ignore case and
require every whitespace-separated keyword to match somewhere in the entry.
For example, `infernic burn` finds entries matching both words; `interlocking`
finds Siegebound Drive through its lore. Elementless entries can be found with
`any element`. A live Showing N of M count and explicit no-match message
distinguish filtering from an empty collection. Clearing restores all owned rows.

Search only filters the owned list, not equipped slots or eligibility. The
in-memory query survives equip/unequip refreshes and member switching, without
wallet writes. Existing disabled reasons and actual transaction hooks remain.
Validation is in `conduit-loadout.test.ts`, including DOM filtering, no account
mutation, refresh retention and net-color direction, plus shared UI/copy suites.

## Dedicated Conduit loadout page (D-238)

**D-306:** Conduit Upgrade also offers Max Level for the selected ordinary
Conduit. It previews the highest affordable target (up to+5), summed component
cost and target effects, then saves all steps atomically after confirmation.
Single-step upgrading stays available. [Rules and validation](conduit-upgrades.md#max-level-d-306).

**D-304:** Unequip All is available directly beside the Loadout heading for the
viewed owned Element-Bearer or captured Elemental-Devourer. It clears all eight
ordinary slots and the Element-Bearer's Master together in one validated save
or authoritative online operation. It is disabled when nothing is equipped.
Unlocks, upgrades, other members and active battle snapshots remain unchanged.
The refreshed page announces success; failures explicitly report unchanged
equipment. Focus returns to the member's Back button after the action.

Team's Conduits tab and the Stats & Skills summary's Full view/Open full Conduit
view actions open a dedicated page, not an equipment panel beneath the character
portrait. Captured Elemental-Devourer details use the same summary and full-page
entry. The page omits the Team sidebar, character header and growth tabs.

The header has Back to the selected member, their name with the filled-slot count
and squad member pills. Switching pills keeps the full loadout open; Back returns
to that member's detail. The loadout has a separate Master card and eight ordinary
slot cards showing actual art, upgrade pips, rarity, effects, level/next level and
Upgrade/Unequip/swap controls. Total bonuses and the owned Conduits list occupy
the right column, stacking below on narrow screens. Empty slots are centered and
dashed; controls are neutral outlined surfaces without leader-accent stripes,
selected/equipped pills are white, and disabled controls remain gray.

The owner's HTML reference supplies layout only. Keep the implemented Master
system, shared per-character unlocks, actual upgrade caps, Omnic/element/duplicate
restrictions and existing online/offline atomic transactions, rather than the
mock's reserved Master or move-between-characters placeholder rules. Refreshing
equipment stays on the full page. Returning through Team after visiting
Store/Upgrade restores the selected loadout, without saving navigation state
to the wallet.

Validation: `conduit-loadout.test.ts` covers full-page structure, member tabs,
copy-specific controls, ownership rejection and unchanged account data;
`reference-ui.test.ts` covers the detail summaries. Browser checks cover
member switching, Back/reopen, captured equip/unequip and narrow-page overflow.

## Information topic menus (D-220)

Gameplay information opens a topic menu instead of one long page. Topics:
Getting started, Story, Training, Elemental dungeons, Evolution infusion,
Currency farms, Passion of Crimson Roses, Awaken the Machines, Elemental War and
Continuing encounters. Each card shows a title and a short summary. Selecting one
shows only that topic, with an "All topics" back button that returns focus to the
same card. Reopening the dialog always starts on the list. Use the shared
`informationTopics(id, topics)` helper in `presentation/information.ts`; it
rejects duplicate topic IDs. `bindInformation` owns the navigation.
The rules text is the same as before; only the organization changed.

## Material Exchange categories and 10-pull (D-218)

Stores > Material Exchange has two category buttons:

- **Normal Game Materials**: the six Common elemental materials at 80 Prismatica each.
- **Limited-time Event Materials**: the six Roses Under Sunny Skies Rosethorn
  materials, Seed→Soul, at 2,500 / 7,500 / 25,000 / 75,000 / 250,000 / 750,000
  Prismatica each. A note and the detail panel state they are only for
  Rosetta, Thornia and Crinso.

`content/material-exchange.ts` owns the catalog. Each product has Buy 1 / Buy 5 /
Buy 10 buttons showing the exact total; a button is disabled when unaffordable.
There are no bulk discounts. Purchases work online (server `purchaseMaterial`
with the product ID) and offline (`purchaseExchangeMaterial`, one atomic local
write). Unknown products, other quantities, insufficient Prismatica and
inventory overflow are rejected without spending.

Buying an event material first opens a styled in-game warning naming those
characters, with **Do not show again**, **Back** and **Purchase**. Do not show
again stores `last-light.event-material-warning=hidden` (outside the save) and
cancels that purchase; later event purchases use the ordinary confirmation.
Switching category selects that category's first product. The layout wraps on
phones without horizontal scrolling. The banner 10-pull is described in
[summoning](summoning-and-economy.md#summon-10-pull-d-218).

## Isolated development debug profile (D-217)

On a development build, type the exact case-sensitive `Iamthelight` on any
menu (including title/selection) outside text fields. It starts a fresh
in-memory test profile: all16 Element-Bearers at final evolution/current level
cap, all85 ordinary Conduits at +5, all48 Masters, every staged activity and
Story clear, every creature discovery/defeat and three Lv120 copies of every
capturable form. All48 material types receive1,000,000; both currencies and
Broken Mechanical Components receive1,000,000,000; Master chests receive100.
Equipment starts empty so the tester can choose builds.

The shortcut is disabled in production, combat, dialogs, Player info and
during pending online operations/activity transitions. Typing in inputs,
textareas, selects or editable content never activates it. No actual save
rewrites, online grants, paid access or missing-art substitutes.

All local gameplay/settings persistence goes through the same storage adapter;
after activation it reads/writes only memory and never falls through to real
storage. Real save-data management, exports/imports/deletion and online
operations are unavailable in debug mode, including the menu Player info
route. A persistent DEBUG indicator/Exit debug button is visible. Exit or a
page reload discards the test profile and returns to the original saves/auth.
Normal non-debug persistence remains unchanged. Server-only account/social/
cosmetic features are intentionally not unlocked by this local test profile.

Validate complete catalogs against live content, normal storage forwarding,
production refusal, isolated transactions/settings/removals, exact keyboard
matching and no activation in blocked contexts. Browser-check activation,
max progress, equipment/Master changes, blocked real save UI and unchanged
raw browser storage before/after Exit debug.

## Organized Team sub-menus and ability dialogs (D-216)

Team Element-Bearer details now use persistent Stats & Skills, Level,
Evolution and Conduits sub-menus instead of four independently scrolling
panels. Switching updates only the detail area, preserving header, portrait
and navigation. Existing transient tab history restores the selected area.
On narrow phones the selected character content precedes the squad sidebar.

Conduits owns eight ordinary slots and a separate named Master section. D-229
replaces the plain grid with a loadout page (presentation/conduit-loadout.ts):
header "Name · Conduits" with filled count and squad tabs; left Loadout panel
with the Master card and two-column slot cards showing art, upgrade pips,
effect, Level L of 5 / next level, Upgrade, Unequip and a swap selector; right
Total Bonuses (before -> after) and Your Conduits list with Equip buttons
(disabled with a reason when full/ineligible). Columns stack below 760px
container width; the owned list scrolls inside its panel. Overview shows a
Conduits summary card and the header a Conduits n/8 chip, both opening this
page. Store and Restore/Upgrade remain
linked existing destinations, not a combined transaction screen (owner choice).
Effective equipment stats are available on demand. Master selection uses the
delegated change path so it still works after an in-place sub-menu update.
Captured equipment controls retain the actual copy ID, not the selected
Conduit ID.

Level/Evolution keep exact canonical costs, material names/icons, Owned /
Required values, affordability, level gates, specialty/event requirements
and explicit fodder selection. Resources and actions stay visible; seven
stat changes and the evolution silhouette are in an optional preview.
Use natural page scrolling rather than clipped or independently scrolling
panels; resources come first on phones.

Passive, Skill 1, Skill 2 and Last Flare are compact named/icon buttons opening
native in-game information dialogs. Details use the current resolved kit,
stored-resource rules, actual Gauge costs/cooldowns and equipped Conduit/Master
rules. Captured skills also open dialogs, clearly retaining unavailable slots.
Close and Escape preserve the underlying screen; no ability upgrade or combat
mechanic changes. Rich trigger markup is separate from the close button's
plain accessible label.

Validation: all16 Element-Bearers/forms must match canonical level/evolution
costs without writes; check four sub-menus at320/390/1024/1460px, all four
ability dialogs, retained portrait/header, reachable controls and exact large
counts. Equipment protections, atomic upgrades, confirmations and saved reward
presentation remain unchanged.

## Natural-height Inventory panels (D-215; disclosures superseded by D-268)

Inventory uses natural-height grid rows and page scrolling, not fixed
fractional rows that squeeze currency and holdings panels. The two currencies
share an explicit full-width row and stack on narrow phones. Masters/chests
have a dedicated full-width section; Materials and ordinary Conduits sit
side by side on desktop and stacked on phones, independently collapsible under D-268.
Holdings lists grow with content without nested scroll or overlapping panels.
Decorative empty slots stay compact and never represent a storage limit.
Preserve all counts, exact balances, chest actions, external Store/Upgrade routes and
transactions; this is a presentation correction only.

Validation: empty, screenshot-like, populated and unavailable inventories at
320/390/1024/1460px must have nonintersecting open panels, working disclosures, no horizontal
overflow and reachable actions. Include all Masters/Conduits and maximum-safe
balances/material counts without mutating a real account.

## Material summon presentation (D-214)

Both banners replace new creature pulls/conversions with material bundles up
to Rare. Rates & Information displays exact quantities, material names, rarity
and rates; material filters say Common/Uncommon/Rare rather than star values.
Keep character star tiers, costs,80/150 pity and bonus rules. Saved reveals and
inline receipts use awarded material art/names/counts; duplicate results explain
the conversion to15 Rare materials. Inventory Help includes banner sources.
Existing captured creatures are not removed or converted; old saved server
receipts remain displayable. See the [economy contract](summoning-and-economy.md#material-banner-rewards-d-214).

## Readable activity banners and unclipped controls (D-213)

Activity-card titles sit below artwork on a solid dark surface, not over
potentially bright or busy pixels. Shared stage-entry footers are static,
wrapping rows: stage choice and action retain usable width, and unlock guidance
occupies its own full row. Cards grow naturally with page scrolling; do not
compress the footer to fit a fixed-height internally scrolling card.
This covers all three Elemental War trials, dungeons, infusion, currency farms,
Machines and Roses. Machines/Roses have no unused location-picker column.

Shared text/filled buttons wrap complete labels. Disabled menu controls retain
readable contrast rather than fading their entire surface. Quiet menu labels
use a lighter neutral; preserve themed accents, Georgia, focus and existing
selection dialogs. Team level/evolution progress wraps on narrow phones, and
Home artwork stays contained in its button without changing portrait bytes.
No entry gates, stage choices, costs, rewards, recruitment odds or save changes.

Validation: check all16 activity cards at320/390/1024/1280px with locked and
unlocked accounts, including War stage10. Neither page/card nor button/title
may overflow horizontally, and labels must not exceed control height. Check
Home, Team, Inventory, Summon, Store and Upgrade at those widths; War title,
identity, fact labels, disabled entry and unlock hint must exceed4.5:1 contrast.

## Training panel polish (D-212)

Training uses the entire content column, without an empty location-picker
column. A bounded grassy-field scenery header leads into three compact facts,
saved-squad/Continue guidance and the actual Prismatica reward. A separated
footer keeps Enter Training and the per-defeat save/quit note together.
The card grows naturally with page scrolling rather than an internal scrollbar;
phone facts wrap without horizontal overflow. Preserve Georgia, the existing
activity selector, route IDs, entry handler and all Training mechanics.

## Active allied effects and clear ability copy (D-211)

Allied field HP readouts now include a compact wrapping row of actual active
effects: remaining Shield points, outgoing Damage bonus with its last active
turn, Defense reduction, one-hit protection and Last Flare recovery. The shared
readout also serves captured creatures and Battle reference. Hide zero/expired/
defeated effects; use existing status art plus exact text, never icons alone.
The row spans the full health-card grid width so HP cannot collapse into a
zero-width column. Keep complete values and phone wrapping.

Typed event-time buff snapshots from character, pilot and Conduit/Master
producers update the field at impact, including shields absorbing damage.
Use pre-action presentation ledgers rather than final-state guesses or message
parsing. Historical events without snapshots still support shield gain deltas
and shieldRemaining; other active effects appear from real state on final render.
No new combat effects, calculations, RNG, account fields or load writes.

All16 Element-Bearer descriptions share clarified rules: Shield absorbs damage
before HP and keeps the higher amount on refresh; Weaken lowers enemy outgoing
damage, not Defense; critical bonuses are only for that attack; Last Flare
recovery blocks the caster's next player turn, not allies. Personal family stacks
are explicitly stored charges, separate from applied Shield/Burn/healing.
Triggers explain missing-HP healing, living owners and ability-versus-Conduit
sources; Bliss still requires healing another living ally. Existing names,
numeric strengths, target sets, limits/costs/cooldowns and frozen kits remain.

## Battle speed stays available (D-210)

Battle speed1x/2x/3x is presentation-only and remains usable during encounter
entrances, local action animations and authoritative requests/playback. Combat
controls and Leave/Settings remain locked while resolving; restoring the
retained toolbar on render must reset those utilities to the current busy state
rather than carry a stale disabled attribute forward. Preserve toolbar nodes/
listeners, active animation rate updates, persisted speed and all combat/save
rules. Regression coverage includes entrances, local/online actions and server
rejection with actual retained DOM controls.

## No sidebar Menu (D-209)

Owner explicitly requests removing the right-side Menu and its top-bar trigger,
not replacing it with another menu dialog. Shared headers no longer render it.
Settings opens directly from the gear control and returns focus to that control
on closing; Collections has a direct book control beside Help/Profile. Phone
utility rows accommodate all four controls at48px without sideways overflow.

Existing paths remain: currency buttons/Home Inventory open holdings, Home
Market opens Stores, Inventory/Team/Store link to Conduit Store/Upgrade, Home
opens Story and Play includes Events. Keep the four primary destinations and
battle toolbar unchanged. Save-data management remains exclusively Player info.
Help describes these direct routes. This supersedes older Menu-drawer contracts
below; Help and Settings dialogs remain, only the sidebar Menu is removed.

## Uncluttered banners and reduced pity (D-208)

Summon separates banner selection/pity, unobstructed 16:9 artwork/title and
single-draw cost/action/result. Remove the character/star badge cloud, separate
Showcase control and inline rate tiers from this page; Home Showcase is unchanged.
Rates & Information alone contains the complete text-only outcome tables,
aggregate tier totals, filters and pity/reward rules. Rates come first, rules
follow; filters hide entire unselected tiers. Keep full names, awarded rarity,
stars and precise rates, with wrapping table columns and one natural vertical
dialog scroll rather than sideways or independent tiny list scrollers.

Both banners use80 highest-star /150 unowned-highest-star pity. Display actual
saved counters even when above the new limits, clamp only visual meters and show
Next draw guaranteed when due. Honor existing progress on the next successful
draw without rewriting accounts on read. Preserve cost, base rates, independent
banner counters and atomic transactions. This supersedes older Summon layout
and200/500 display guidance below; see [exact rules](summoning-and-economy.md#independent-banner-pity).

## Organized opening starter selection (D-207)

Opening selection now uses a real React StarterSelection component with three
compact, equal-width cards and a selected-character panel alongside on desktop.
Shared five-star/Common rating appears once; each card retains its element,
canonical form name, portrait/facing, role, weapon and selected state. The
selected panel shows identity/role/tagline and Begin before optional native
Read story disclosure. Full origin, awakening, lore and vow remain available.

Phone/tablet layouts put the panel below the three-card comparison row instead
of stacking three full-height portraits. Keep Georgia, character palettes,
shared gradient controls, 44px+ targets, contained artwork and natural vertical
scroll when needed; no clipped content or horizontal scroll. Selecting retains
portrait DOM/focus and the elemental reveal, without rebuilding the screen.
Player info remains accessible; returning restores the choice and detail panel.
Begin locks actions while saving, preserves existing offline confirmation/online
bootstrap authority and opens Story only after success. No new grants or load
writes. Desktop1024/1280 by768 should show all choices and Begin without scrolling;
390 by844 should show Begin before the bottom edge with story closed.

## Gradient buttons with off-center labels (D-206)

Every button without its own artwork receives a subtle gradient: a 135deg
leader-accent wash plus a soft vertical shade, layered with `background-image`
only so existing fill colors survive. `src/presentation/button-style.ts`
(installed once from `main.ts`) observes the DOM and tags each button, link
button or `role="button"` once via `data-button-surface`:

- `art`: url() background or a large image/portrait (starter cards, banners,
  Story arena, portraits, roster art). Never restyled.
- `filled`: already has its own gradient fill (for example primary buttons).
  Fill kept; label becomes bold and left anchored.
- `text`: ordinary labelled controls. Gradient, bold left-anchored label and a
  small accent marker bar at the leading edge.
- `icon`: icon-only or very short/small controls. Gradient only, stays centered.
- `tile`: tall multi-line cards. Gradient, left-aligned copy, bold heading in the
  top-left corner (Home Market/Inventory keep details bottom-left, arrow bottom-right).

Battle field units are never tagged. `src/presentation/button-style.css` is the
last imported stylesheet. Preserve Georgia, leader accents, 44px targets, visible
focus and all behavior; this is presentation only.

## Activity navigation without sideways scrolling (D-205)

The Activity sidebar is a single non-wrapping vertical column on desktop:
section groups do not shrink or wrap into parallel columns, and links do not
inherit legacy fixed horizontal-tab flex sizes. Long labels wrap within the
available width. Vertical scrolling remains available when necessary.
On phones the categories form a responsive wrapping grid rather than a sideways
tab strip. Every category stays reachable with at least44px targets; no overflow
masking or text clipping. Validate rail scrollWidth equals clientWidth at desktop
and phone widths, including short-height windows.

## Conduit panel fit and in-place updates (D-204)

Conduit Store artwork stays inside its card or bounded 200px detail stage;
the icon frame must not inherit a flex basis/aspect ratio that overlaps titles,
rarity or effects. Upgrade detail artwork uses the same contained stage.
Preserve source artwork and upgrade meters rather than masking overflow.
The Required resources Broken Mechanical Components image renders at1.4x
visual scale inside its unchanged44px layout slot. Only that image scales;
the resource panel, balance text, cost meter and action controls keep their size.

Selecting a Store item or owned upgrade target updates its detail/action panels
without rebuilding the menu shell, header or catalog/owned list. Selection
states, focused cards, catalog scroll and existing art nodes survive. Rarity
filters replace catalog contents only when their entries change. Purchases
refresh owned counts, affordability and header balances; upgrades refresh levels,
meters, effects and component costs. New transaction controls are bound once;
the existing Earn components navigation control retains its handler. Confirmations,
atomic persistence, saved reward presentation and online authority are unchanged.
Clicking an already selected target does nothing. Other menu migration remains
separate; this is not a claim that all existing menus now update incrementally.

## Menu header and content scale (D-203)

The menu header is deliberately larger than surrounding content: 5.15rem minimum
height, larger brand/currency icons, 1.05rem navigation labels and 48px minimum
navigation/utility controls. Main menu body text is .95rem with modestly reduced
panel/card spacing and headings. Georgia, leader accents, portrait sizes, full
numeric values, 12px note floors and 44px content controls are retained.

Use shared reference-layout.css rules, not CSS zoom/transforms or root font
changes. Compact desktop preserves separate navigation/wallet columns; phone
wallets place currencies above three utility controls and retain the bottom
dock. Maximum-safe balances wrap without overlap or horizontal scrolling.
Title, pre-game Player info, dialogs and battle are not globally rescaled.
Validate actual Home/Team/Play/Summon/Inventory/Collections/Store/Upgrade/Profile
renderers at phone and desktop widths, with ordinary and maximum-safe balances.

## Save-data management in Player info only (D-202)

Player info owns every game-save control, file explanation, backup warning and
new-account transfer choice. Title and starter selection provide a Player info
link only; menu/battle Settings and registration have no save panels. Offline
Profile now has real Save/Export/Load/Delete controls; online Profile includes the
same clearly labelled offline controls only in Player info, not Friends. New
online accounts visit Player info to import or confirm fresh progress before
choosing a starter. Unreadable-save recovery remains available there.
Device preference buttons and automatic gameplay saves are unchanged.
[Full lifecycle/transaction contract](mono-ui-and-cloud-saves.md#player-info-owns-save-data-management-d-202).

## Character Masters and choice chest (D-201)

Inventory shows chest count, an Open choice action and owned Master effects.
The React dialog groups three Masters per Element-Bearer, permits future-character
choices, disables owned rewards and spends nothing until the subsequent in-game
confirmation. Save precedes the shared reward reveal. All-owned chests remain.
Team has an actual separate matching Master selector; captures explain their
ineligibility. Character/Battle references and Collections expose exact effects;
Astral Reserve shows its actual capped count in battle. Missing artwork remains
explicitly pending. [Mechanics, saves and validation](master-conduits.md).
This supersedes historical reserved-Master statements below.

## Shared menu typography and finish (D-200)

Owner requests a polish pass across all menus and suggests Georgia. Current
reference menus and React title/account/save components use the shared Georgia /
Times New Roman / serif stack; active Sora imports and the local Sora face are
removed. Body copy uses regular weight, controls semibold and headings bold.
Readable line heights, higher-contrast muted text and tabular full-value numbers
replace shrinking desktop text. Small menu notes have a12px floor.

Shared surfaces have consistent borders, depth, section separators, card spacing,
fields and visible focus. Header columns size to the brand and wallet rather
than letting navigation overlap currencies. Currency values wrap without
abbreviation, including maximum-safe balances. Team details/collections,
captured copies, formation, Story/activities, Summon rates, Inventory, Stores,
Conduit equipment/upgrade, Collections and Profile inherit the finish. React
account/save panels and native Settings/confirmation/selection dialogs retain
their actual controls, lifecycle and accessibility.

Compact desktop adjusts dense columns; phone layouts stack rates/growth and use
two equipment columns. Page scrolling and intentionally contained detail lists
remain. Preserve leader accents, entity/semantic colors, artwork, saved upgrade
animations and explicit in-game motion reduction. This is a shared visual pass,
not completion of the remaining React conversion or owner visual approval.

Validate with the menu/React regression selection recorded in the handoff,
`npm run build`, and desktop/phone checks of real renderers, full balances,
44px controls, readable notes and horizontal overflow. Preview fixtures must
not mutate player accounts or start the live Phaser game.

## Home without Squad (D-198)

Owner removes the Squad panel from Home. The current leader showcase remains,
including captured leaders, along with Story and Market/Inventory shortcuts.
Story fills the removed panel's area on desktop; no empty grid row remains.
Squad inspection/editing and leader selection remain in Team, not on Home.
No squad save/order, theme resolution or battle snapshot changes.

## React migration standard (D-197)

Owner approves the entire UI moving to real React components in verified batches.
The title, all offline save panels and account onboarding are the first converted
surfaces. New UI must use shared typed Button/Panel/Status/Dialog primitives and
scoped CSS, with consistent visual states, readable content and at least44px
targets. Preserve the current reference, every real action, accessibility, leader
theme and battle animations. A framework migration is not visual approval.
Remaining legacy menus/dialogs are not yet converted; see the
[migration contract](mono-ui-and-cloud-saves.md#react-ui-migration-d-197).

## Offline save controls (D-196)

Title has Play Online / Play Offline, plus Save, Export Save File, Load Save File
and Delete Save Data. Offline Settings repeats those save controls; online
Settings never writes an offline wallet as its account save. File load/deletion
use explicit in-game confirmations and preserve online identity data. Account
creation offers a backup prompt and an import-or-fresh choice.
[Complete file and one-time transfer contract](mono-ui-and-cloud-saves.md#play-online--play-offline-and-save-files-d-196).

## Captured creature Team layout parity (D-195)

Captured creature details use the same compact identity header and four-panel
Stats / Skills / Growth / Conduits composition as Element-Bearers, rather than
the inherited tall portrait and single scrolling control column. Header shows
actual copy number, canonical element, fixed-form stars/rarity, level60 cap (D-305),
lock and squad/leader actions. Collection cards share artwork/caption styling
and show actual stars, element, level and squad membership.

Stats reuse the seven-stat renderer and Before Conduits comparisons. Skills
show only retained abilities with their real Elemental Gauge costs/cooldowns;
missing slots remain unavailable. Growth includes exact per-copy level costs,
Max Level and real sale value/protection reasons where selling is supported.
No evolution, passive or ultimate is invented. Conduits reuse the same eight-slot
renderer, reserved Master and Store/Upgrade links, with captured-copy transaction
hooks and existing matching-element/duplicate/ownership restrictions.
Desktop uses the existing bounded reference panels; mobile stacks without
horizontal clipping. All lock/level/equip/sale confirmations, server authority,
copy UUID protections and saved upgrade-result animations remain unchanged.

## Squad leader accents and drifting bloom (D-194)

Menu primary actions, active navigation/tabs, selected controls, focus outlines
and dialog highlights follow the current saved squad leader's canonical element
palette. Captured creature leaders use their combat element too. Browsing another
character or activity does not change the theme; changing the saved leader does.
Battle chrome and Settings use the frozen run leader, including a defeated
leader, not the selected actor or live menu equipment.

All shared screen backgrounds include a soft element-tinted radial bloom that
drifts slowly using CSS transforms. It is clipped to the viewport, decorative,
noninteractive and lighter in battles to preserve scenery and combat readability.
The bloom extends beyond every viewport edge throughout its drift, without
desktop size caps or a mobile-sized oval. A faint leader-tinted base gradient
covers the entire nonbattle background so the corners never lose the tint.
Dialogs retain matching static tint. In-game Reduce motion stops the drift.
Before a leader is available, opening screens retain a neutral bloom/accent.
Entity element labels, semantic gains/losses, rarity, art, combat effects and
exact numbers remain their own colors; this is UI theming, not a palette rewrite.
Theme selection does not save account data or consume gameplay RNG.

Validate with `npm test -- src\presentation\leader-theme.test.ts
src\presentation\ambient-background.test.ts src\presentation\reference-ui.test.ts
--maxWorkers=2`, the normal build, and desktop/mobile browser checks for palette
switches, matching gradients, focus, reduced motion and overflow.

## Home Story arena card

The Home Continue Story shortcut shows the installed battle arena of the next
unlocked Story stage as full-bleed artwork, not a blank panel or world map.
It follows saved campaign progress across all six regions; completed campaigns
keep the final region arena. A dark overlay preserves readable region/progress
text and the navigation arrow. The decorative image uses deployment-base URLs;
the button still opens Story without changing progress or saving anything.

## Story-first guidance and visible activity locks (D-192)

Story world map opens after starter selection and for returning early online
accounts (fewer than25 Story clears), unless resuming a saved online battle.
Home highlights Story progress/enemy level. Story offers Team alongside map/stage
views and short contextual hints for leveling, replay materials and boss utility.
Play category descriptions show unlock levels; entry footers show the full
requirement and highest owned bearer level, with locked actions disabled.

Use highest-level owned Element-Bearer, including outside the squad; never count
captured levels. [Exact gates](story-and-training.md#story-first-progression-and-activity-access-d-192)
are enforced by both client entry and server rules. Information retains exact
drop/payout rules separately from the short guidance. Viewing locked activities
does not unlock stages, spend resources or write saves.

Browser fixtures at1280x720 keep map and stage views within the desktop viewport.
At390x844 they have no horizontal overflow; stacked mobile content still uses
vertical page scrolling. Six beacons,25 stage controls, Team, entry and actual
loot remain. This is geometry/renderer validation, not owner pixel acceptance.

## Main-menu navigation without Back (D-190)

All persistent-navigation menu screens omit the redundant Back button, including
Home, Team, Play, Story, Summon, Events, Inventory, Stores, Collections, Conduit
Store/Upgrade and Profile, plus legacy aliases. Use main destinations and Menu.
This supersedes historical caller-based Back requirements for these menus.
Battle still has Leave and retains caller/history-based return behavior.
Dialogs retain Close/Cancel, Escape, focus restoration and confirmation controls.
Keep transient history for screen context and battle returns; no save changes.

## Consistent element and status terminology (D-189)

All element filters, headings, cards, accessibility labels and Material Exchange
copy use Infernic, Oceanic, Atmospheric, Botanic, Tranquilitic and Chaotic.
Fire/Water/Wind/Nature/Peace/Dark Matter & Energy are internal affinity metadata,
not alternative filter labels. Presentation source must not read `.affinity`.

Native resource labels and ability/passive descriptions use the shared
elemental-family catalog: Infernic Embers, Oceanic Protection, Botanic Renewal,
Atmospheric Charge, Tranquilitic Focus and Chaotic Suppression. Flora/Bliss no
longer call Botanic Renewal "Blooms". Use "one stack of Infernic Embers" and
"per stack", not "one Infernic Embers" or uncountable names after numbers.
Rose Grace, Thorn Aegis, Rose Duality and independent Conduit charges retain
their distinct names and mechanics.

Precise effects remain Burn, Weaken, Shield, Healing, Critical boost and Attack
boost; a family name does not imply the presence of every effect in that family.
Typed ability status badges share delivered icons and canonical family tooltips
in Team, action controls, Battle references and Archive kit dialogs. Archive
passives also show the shared resource badge. Do not infer icons from prose.

Battle references refresh description text using frozen authoritative strengths,
not current menu progress/equipment. This also corrects older online snapshots
without changing their stats/kit values, writing saves or deploying server rules.

## Play and Story organization (D-188)

The supplied Story screenshot governs organization, superseding older stacked
stage/detail layouts. Desktop Play has three coordinated columns:

- Grouped Activity rail: Start here, Practice, Grow your team, Earn currency,
  Events. Keep Story, Training, six elemental dungeons, evolution infusion,
  Machines, Elemental War, both currency farms and the Rose event.
- Compact region sidebar: six names, canonical element/progress text and a
  Prologue control. No duplicate region eyebrows, connector lines or bulky cards.
- Single regional main panel: actual region name, level range, introduction,
  completed/next-stage progress and Stages/World map tabs. Its five-by-five stage
  grid sits beside the regional boss and saved-eligibility first-clear rewards;
  the selected-stage summary, exact per-kill loot and Enter/Replay action are in
  the bottom footer. Do not add a second scenic detail card or extra map route.

Region/map selection refreshes the heading and visible stage panel. Stage
selection updates the footer without changing the account. Enter/Replay forwards
to the existing validated stage transaction; locked stages remain disabled.
Use real currency images/amounts, not reference placeholder letters. Phone
activity choices use a compact horizontal rail, regions use two columns, and
the main panel stacks without horizontal page overflow. Stage targets remain
at least 44px, and the entry button stays at least 48px.

Validation includes the real 26-stage-completed/Glasswater stage-2 reference
case, desktop 1440 x 900 and 1280 x 720 with all 25 stages, boss and entry visible
without main-panel scrolling; 390 x 844 has no horizontal overflow or overlap.
Long content or smaller heights may scroll rather than clip.

## Explicit motion preference (D-187)

Animations always display unless the player explicitly selects **Reduce motion**
in game Settings. **Full animations** is the default. Device/browser reduced-motion
preferences do not disable JavaScript presentation or CSS animations. This
supersedes historical statements below about honoring both device and saved
preferences. Preserve slide-in entrances, attack movement, impact effects/glows,
skill/Last Flare portrait banners, Gauge readiness shine and reward/upgrade reveals.
Reduced motion retains static information and the steady readiness glow.

The existing `system` storage token now means Full animations; `reduced` still
means Reduce motion. No load-time write or settings/account migration is needed.
Settings descriptions and the shared motion helper use this explicit-only rule;
CSS must not independently gate animation on `prefers-reduced-motion`.

Captured Votive Roselius retains Golden Thorn Benediction (25 Gauge) and
Overdrive: Golden Thorn Benediction (40 Gauge), with its saved 3/5-turn cooldowns.
Normal attacks grant 20 Gauge and incoming hits grant 10. At encounter entry,
insufficient Gauge is not a missing skill. Ordinary captured forms have no
Last Flare; boss captures retain their authored ultimate instead of Skill 2.
Action controls show actual costs, readiness and rejection reasons.

## Element name display (D-186)

Element typing uses canonical names only: Infernic, Oceanic, Atmospheric,
Botanic, Tranquilitic and Chaotic. Do not append affinity parentheticals such as
"(Peace)", "(Fire)" or "(Dark Matter & Energy)" in any screen, dialog or
accessibility label. Shared emblems/names, all character metadata and portrait
alt text, Team filters/cards, Archive options and Play headings follow this rule.
Affinity definitions remain internal descriptive metadata; element IDs,
mechanics, saves and art are unchanged.

## Permanent polish and preservation standard (D-184)

Character upgrades now also use the D-185
[animated saved stat result](units-and-progression.md#animated-upgrade-results-d-185):
single levels, Max Level and evolutions display the actual portrait and all seven
effective stat deltas, including captured-copy leveling (D-231: changed stats as
cards, unchanged stats collapsed into one muted line, art never overlaps text).

D-232: menu status/warning messages appear as a dark toned toast (error, success or
notice icon/title, × dismiss, auto-dismiss) via `presentation/status-toast.ts`. Selling
the open captured copy returns to the Captured Creatures list with the sale receipt.

D-233: the area is now labelled Captured Elemental-Devourers and all prose uses
Elemental-Devourer(s). Heaven/Abyss copies show a "Choose one payout" grid (Null-Prismatica
or any of three mode items, art + amount, 44px buttons, gray when protected) through the
shared `presentation/creature-sale.ts`; single-payout modes keep one Sell button.

Every new or revised screen, text label, control and dialog must use the current
reference hierarchy, consistent typography/spacing, clear selected/disabled/
focus states and accessible targets. Basic identity, ownership, exact values
and actionable information should be visible, not buried behind unnecessary
dialogs. Minimize page movement and interactions; long catalogs and detailed
rules may scroll within appropriate panels. This standard applies to all future
UI work, not only the interfaces shown in owner screenshots.

Reorganization is not content removal. Keep banner star values and Showcase,
combat actions, ability cut-ins, impact rings/sparks/trails, numbers, glows,
loot effects, results and transaction hooks. Only the in-game Reduce motion
selection disables animation (D-187); reduced motion uses a steady readiness glow.

Battle now owns the viewport with one header, adjacent sprite/nameplate groups
and a compact status/actor/target footer. Leave, Settings and the existing
toolbar survive rerenders; 1x/2x/3x speed choices require one click. The approved
bottom action strip is removed, not its five actions: Normal Attack, Defense,
both skills, Last Flare and Pass remain in Battle menu, alongside gestures.
Desktop menu has Actions/Combatants/Abilities columns and a bottom log, with
bounded independent scrolling rather than clipped sections. At 1440 x 900 the
five actions and Pass fit without action-panel scrolling. Mobile stacks the
menu panels. Results remain dismissible/reopenable with their actual stage gates.

Shared controls/dialogs, title entry buttons, Information hooks and Showcase
typography are aligned. Archives expose rarity/ownership and Conduit effects
without opening details; detailed kits/lore remain accessible. Story has a
visible Prologue control. Profile icon targets are at least 44px. Copy describes
real online/legacy persistence and no longer claims online gameplay is pending.
No combat, economy, authority or reward rules change in this pass.

## Current reference structure replacement (D-183)

The owner explicitly rejects keeping the inherited UI structure. The complete
latest HTML, including its subviews and interactions, supersedes historical
layout conventions in this document. See the [screen-by-screen replacement
status](mono-ui-and-cloud-saves.md#reference-structure-replacement-d-183).

Home has no promotional banner panels. Desktop owns the viewport with contained
panel scrolling; at 960px and below it stacks into page scrolling and bottom
navigation. Team uses the persistent Squad/Collection sidebar and simultaneous
four-panel detail, not the historical horizontal categories/tab rail. Collection
and selected-product views are separate. Inventory shows both holdings panels.
Summon separates left pity, central hero, right action and bottom rate tiers.
Actual prices, values, artwork, ownership and transaction hooks remain required.
Sora is self-hosted at the four reference weights, rather than requiring an
installed font. Shared selection panels remain for equipment; reference-native
controls use `data-native-select` to opt out.

Layout state (Team view/filter/sort, selected store/restoration/material/frame,
profile view) stays transient and is restored with external menu history.
Character growth updates the existing header portrait, level bar, evolution
pips, rarity and sidebar portrait without replacing portrait DOM.
Profile fields automatically save when editing finishes, with live bio count,
owned-icon selection and explicit retry for an unconfirmed server result.
World-map nodes inspect real regions; completion controls roads and entry gates.

## Initial monochrome pass (D-181; layout superseded by D-183)

The current supplied `Last Light.html` supersedes the older Sanctuary mock-up
composition below. Presentation uses real content and stable transaction hooks:
desktop Home/Team/Summon/Play navigation moves to the top; mobile retains a
safe-area-aware bottom navigation. Menu, contextual Back, Help and Settings stay
available. The header has a Profile shortcut. No mock balances, characters,
rates, friends or combat calculations are copied from the reference.

Home places the real saved leader and Health/Attack/Defense on the left, actual
Story progress on the right, and three squad slots, Market and Inventory
panels beside it. Team Overview displays the four Stats/Skills/Growth/Conduits
panels together. Level/evolution previews retain exact costs, eligibility,
fodder and their existing confirmation hooks; tab changes preserve portrait DOM.
Summon has banner navigation, actual banner art, draw/pity panel and complete
rates. Inventory, Collections, Conduit Store and Upgrade keep their existing
holdings, filtering, equipment and purchase/upgrade paths in monochrome panels.

Story is available directly in Play as well as its dedicated route. Six region
selectors, stage details and a World map toggle use the real levels, per-kill
tables, locks and first-clear boss bonuses. All150 stage entry hooks remain;
selection updates detail independently of entry. Delivered regional arena/map
images are reused without clipping the map or inventing missing banner files.

Battle retains actual combatants, status readouts, gestures, selection shortcuts,
Settings, results and reference menu. D-184 consolidates accessible actions and
Pass in the menu rather than duplicating them in a bottom strip.
Normal/Defense remain real actions, not the mock's four-skill shortcut system.
The optional BattleAuthority transport awaits server results before impact
presentation and skips local combat/reward writes. Failed calls keep the previous
session. Continue/Retry/Quit use transport operations online; legacy behavior
remains available. Conduit upgrade binding and online-account Play accept optional
async integration callbacks, without mixing legacy storage into online accounts.

Typed ability strength/resource descriptors add delivered status icons beside
effect labels; no description parsing or wholesale text/HTML replacement.
`reference-layout.css` supersedes the initial `mono-reference.css` layout;
`battle-mono.css` remains the combat layer. Self-hosted Sora removes the installed-
font dependency.44px controls, focus, full numeric values and both reduced-motion
preferences remain.

Validation: targeted presentation, Story/art and authority-isolation tests;
full `npm test -- --maxWorkers=2`, `npm run build`, and disposable desktop/mobile
browser checks. Do not modify owner storage to fund visual examples.

## Online account foundation (D-179/D-180)

Title distinguishes Online account from Play legacy mode. The in-game account
dialog supports username/password authentication, registration with verification
email, password recovery, sign-out and recovery-link password changes. Online
gameplay is explicitly unavailable until server-authoritative combat and economy
are implemented. No legacy wallet/profile import or automatic account grants.
Modal Close/Escape remove the dialog and restore focus synchronously; inputs do
not trigger title's legacy keyboard shortcut.44px controls/mobile containment
and session storage separation remain mandatory.
[Hosted contract and validation](mono-ui-and-cloud-saves.md).

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
[Menu](../src/sanctuary-reference.css) styles. Obsolete global Inventory
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
only HP, Defense and Elemental Gauge for allies, and HP/Defense for enemies.

Changing sanctuary destinations, entering an activity or opening a Home shortcut
uses [instant navigation](#instant-navigation-d-406), superseding the former
black curtain,800ms fades and1500ms artwork decode budget. Real asynchronous
setup retains guarded input and delayed corner status, with no minimum duration.
Artwork failures retain per-image Retry controls. Music changes use a separate1.6-second
crossfade, independent of battle animation speed; see the [Music contract](../Music/README.md).
Same-page taps, character tab updates, and gameplay category filters do not fade.
Unavailable activities remain unavailable and do not pretend to load a fight.
Reduced motion adds no navigation delay. See the
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
Overview shows the real passive, abilities, Elemental Gauge costs, and cooldowns;
no mock-up health slider, estimated damage, fake levels, or additional owned roster
has been implemented. The saved starter remains the only Owned Element-Bearer.
Home and Character Overview display all seven stats: Elemental Gauge capacity, Health,
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

## Team character art size (D-235)

Team detail headers lead with a large square portrait (up to ~19rem) beside the identity block; collection cards use 11rem art and sidebar squad thumbs 4.2rem. Styling lives in the final D-235 block of reference-layout.css.

## Squad formation (D-236)

Squad shows three slot cards (Leader first) with large portraits, name, rating and element/progress. Change/Choose (or clicking the card) opens a picker modal listing every owned Element-Bearer and Elemental-Devourer with All/Element-Bearers/Elemental-Devourers filters, name search and tags for members already placed; choosing a placed member swaps slots. Remove clears members 2-3; the leader cannot move into an empty slot. Changes are a draft until Save squad, which still submits the hidden slot-N selects in one atomic save.

## Viewport-scaled text (D-237)

The root font size grows with viewport width (bounded by height) from about 16.5px at 1280px up to 22px on wide windows, so menus fill large or zoomed-out screens instead of staying small. Size new menu text in rem so it follows this scale.

## Play event navigation

Play's Events section keeps the Crimson Roses card, stage/entry controls and
banner link without an extra Event details navigation button beneath the card.

## Bracketed ability keywords (D-371)

Conduit ability prose consistently brackets gameplay keywords, including
targeting (`[Global]`, `[Single-target]`), actions (`[Skills]`,
`[Attack Action]`), all ten stat names (`[Skill Power]`, `[Skill Efficiency]`,
`[Direct Attack]`), statuses/resources, clocks and native kit terms.
For example: `[Global] damaging [Skills] gains +45% [Skill Power].`
Global replaces the old All-enemy keyword for effects applied to all eligible
targets, including damage, healing and protection. It preserves each effect's
specified side, eligibility and targeting mechanics.
The shared presentation formatter covers ordinary/Master equipment, Inventory,
Collections, Store, upgrades, loot Details and acquisition receipts, including
descriptions inside small text, spans and definition values. Upgrade
confirmations use the same brackets without element medal HTML. Existing brackets
are not nested. Recognized keywords use their canonical casing, including
already bracketed text: `skills`, `[skills]` and `SKILLS` all become `[Skills]`
(D-376). Exact bracketed aliases also expand to their canonical names, such as
`[All-enemy]` becoming `[Global]`. Unknown bracketed prose, numbers, mechanics,
ordinary prose capitalization and label/heading formatting stay unchanged.
The owner-edited catalog remains the raw ability
contract; brackets are applied at presentation, not combat calculations.
Validate with `reference-text.test.ts`, `conduit-keywords.test.ts` and the
affected presentation regression suites.
