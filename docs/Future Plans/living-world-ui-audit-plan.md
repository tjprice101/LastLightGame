# Living-world UI audit and implementation plan

## 1. Status, intent and boundaries

**Audit date:** November 5, 2026, with verification continuing November 6 UTC.
**Source baseline:** `f2f3442ed8c9eb7dd19da75de82d1e97f7a4f521`.
**Status:** evidence-backed presentation audit and proposed implementation plan.
This document does not claim the proposed UI changes are implemented.

The owner wants Last Light to feel alive, elegant and unmistakably itself.
The objective is not to put more particles on every button. It is to connect
art, motion, interaction, information and saved outcomes into one deliberate
experience, with different emotional weight for different actions.

The current game already has substantial effects, reward choreography, artwork,
native dialogs and transaction safeguards. The biggest opportunity is to give
those systems a consistent hierarchy and ownership model, remove competing
visual layers, improve information quality and make each destination distinct.

### Confirmed requirements

- Modern vibrant lighting, bloom, movement and elegant interaction feedback.
- Luxurious rewards whose presentation follows a successful save.
- Professional, organized, concise information without redundant rules.
- Creative individual characters and recognizable special-banner identity.
- Intuitive, clean menus with purpose, not disconnected collections of controls.
- Fixed compact anime/cel artwork foundation; creativity is within that renderer.
- Current Moon/Sunshade prompt directions, not the superseded grayscale/gold locks.

### Preserved contracts

- No engine replacement, paid service, new account grant or reward reroll.
- No combat, stat, economy, ownership, RNG, pity or event-schedule changes.
- Moon/Sunshade remain inactive until explicit launch approval.
- No unprovided artwork URLs, unrelated art substitutions or runtime background removal.
- Georgia remains the shared font; do not quietly adopt a new typeface.
- Element, rarity, stars and banner theme have different meanings.
- Exact large numbers remain readable; do not abbreviate balances to solve layout.
- Keep portrait DOM, authored facing, silhouettes and source artwork intact.
- Keep Back/history, filters, selection, scroll and frozen battle runs.
- Keep immediate Skip where provided, dismissal and keyboard focus.
- Reduce motion provides useful static feedback, not missing results.
- A failed, cancelled or uncertain operation never gets an acquisition celebration.
- Source-generated prompt completion is not generated-pixel approval.

### What this audit is and is not

This is a full **presentation-system and screen-family audit**. It covers primary
menus, account utilities, gameplay selection, battle presentation, rewards,
dialog systems, copy, responsive behavior and presentation lifecycle.
It is not a balance audit, security review or claim that every combatant was
manually played through every possible encounter.

The screen matrix below covers the live entry points and their shared families.
Unmeasured visual/performance questions are explicitly marked for implementation
validation rather than converted into invented defects.

## 2. Prompt verification: the requested art changes are already current

The specified [Moon pack](../../Art/characters/Glow%20of%20the%20Moon's%20Light.md),
[Sunshade pack](../../Art/characters/The%20Angel-blazened%20Sunshade.md) and
[activity enemy/material pack](../../Art/creatures/Moon%20and%20Sunshade%20Events.md)
reproduce from their source generators.

Verified at this audit:

- Ilyss, Asteriel and Serapha have black-primary/white-accent appearances,
  deep-blue/bright-purple powers, vivid moons/phases and distinct link,
  seed-garden and sanctuary architectures.
- Maerion, Caevren and Vespera's protected portraits remain unchanged by the
  celestial redesign.
- Every Moon character's associated ability/Master imagery has individual,
  colorful lunar construction; no blue/purple prohibition defeats that intent.
- Sunshade appearances and associated art use black/white with deep-orange and
  pearlescent-pink solar energy, not the old black/gold restriction.
- Master generation prose describes actual mechanical sculptures and mechanisms.
- Counts remain **98 Moon + 97 Sunshade + 24 event = 219 sources**,
  including **207 required and 12 optional**.
- Exact portrait references, reference-free nonportraits, aspect ratios,
  clearance, fixed natural features and positive-prose limits remain checked.

Commands run:

```powershell
python -m unittest discover -s tools -p test_moon_banner_art.py
python -m unittest discover -s tools -p test_seasonal_art.py
```

**Outcome:** 7 Moon tests and 8 seasonal tests passed, 15 total.
This verifies written contracts and reproduction, not Midjourney image quality.

No further prompt rewrite is necessary merely to start the UI plan.
Future delivered artwork needs its own visual intake review before use.

## 3. Audit method and confidence

### Evidence tiers

| Tier | Meaning | Appropriate conclusion |
|---|---|---|
| C: code-confirmed | Actual renderer, CSS or interaction code was inspected | The implementation has this structure/behavior |
| F: fixture-observed | Production render functions and current styles were rendered with an in-memory account | This layout/measurement occurred in that fixture |
| H: hosted-observed | Current hosted title and deployed assets were inspected | This hosted opening state exists |
| V: validation required | Appearance, performance or a state was not directly observed | Schedule a measurable check; do not claim a defect |

### Source coverage

- [Application composition and imports](../../src/main.ts): routes, shell, history
  integration, state refresh and presentation bindings.
- [Sanctuary navigation](../../src/presentation/sanctuary.ts),
  [Home](../../src/presentation/reference-home.ts),
  [Team](../../src/presentation/reference-team.ts),
  [character detail/growth/equipment](../../src/presentation/hub.ts).
- [Inventory](../../src/presentation/inventory.ts),
  [Conduit Store](../../src/presentation/conduit-store.ts),
  [Collections](../../src/presentation/archives.ts),
  [Story](../../src/presentation/story.ts),
  [Gameplay](../../src/presentation/gameplay.ts).
- Opening/account/save, profile/social/calendar, settings, loadouts and selection
  modules through a separate bounded source review.
- Battle/cut-ins/impact/loot/results, reward/summon/upgrade/rarity systems and
  canvas VFX through a separate bounded source review.
- Global/screen CSS, live theme application, ambient layers, bubble runtime,
  shared information renderer and representative regression tests.

### Browser checks performed

1. The hosted title loaded with sign-in/create-account and offline controls.
   Computed title font was Georgia; the initial viewport reported 1280 x 960
   and no document horizontal overflow.
2. A temporary local Vite server rendered the actual Home, Team detail,
   Inventory, Collections, Gameplay, Story and Conduit Store functions.
   The account was **in memory only**, with one legal-shaped Lv.0/Evo.1
   Infernis and zero currencies. No owner account was funded or modified.
3. Requested browser sizes were 1280, 390 and 320 wide. The integrated browser
   actually reported **1600, 488 and 400** during those fixture batches.
   These are the measured widths. No exact 390/320 claim is made.
4. The sampled fixture document widths matched their actual viewport widths;
   no sampled button crossed the horizontal viewport boundary.
5. Team's Edit squad control was below the 44px target in the fixture.
   Story's Prologue measured **94 x 36px** at actual 400px width after the
   Gameplay navigation binder selected the active group.
6. Static Gameplay markup initially included all activity groups; that initial
   button count is **not** treated as live-screen density. The active-group
   binder was applied for the follow-up measurement.
7. The browser reported `document.visibilityState === "hidden"`. Layout/style
   sampling is useful, but it does not establish smooth real-time animation,
   frame pacing, perceived glare or sound quality.

No populated endgame account, social mutation or battle was exercised by these
fixtures. Those state/performance checks remain in the acceptance matrix.
The temporary audit server is stopped when the task finishes.

## 4. Executive diagnosis

### Keep these foundations

1. **A real shared combat presentation pipeline.** Events, cut-ins, VFX, impact,
   health changes and loot are sequenced rather than fabricated independently.
2. **Saved-outcome rewards.** Summon, chest and upgrade presentation has real
   receipts, duplicate conversion, pity and failure handling.
3. **Capable optical rendering.** The effect renderer supports bloom on its
   own layer without blooming supplied scenery or portraits.
4. **Accessible native HTML.** Existing dialogs, focus states, keyboard
   controls and exact text should be strengthened, not replaced by canvas UI.
5. **Meaningful ownership/history.** Existing filters, copy identities,
   protections, equipment snapshots and menu history are valuable.
6. **Finite reusable feedback.** Rarity and upgrade foundations already have
   cleanup and Reduce motion behavior.
7. **Distinct authored art.** Do not redesign installed portraits just because
   surrounding chrome is inconsistent.

### Change the emphasis

- From **global glitter** to **intent-specific feedback**.
- From **many competing overrides** to **one clear owner per surface**.
- From **leader color everywhere** to **semantic, local visual identity**.
- From **large permanent text blocks** to **concise decisions and optional depth**.
- From **animation as delay** to **animation as explanation and emotional payoff**.
- From **per-function completion** to **complete user journeys**.

The desired result is a recognizable Last Light interface with calm readable
surfaces, vibrant authored focal points and moments of deliberate spectacle.

## 5. Prioritized findings

Priority definitions:

- **P0:** correctness/readability/accessibility/trust prerequisites.
- **P1:** high-impact uniformity and emotional-quality improvements.
- **P2:** polish, scaling and optimization after the contract is stable.

These are presentation priorities, not vulnerability severities.

| ID | Priority / evidence | Finding | Required response |
|---|---|---|---|
| UI-01 | P0 / C | Several successive design layers are imported together, culminating in bubble overrides after reference/mono layers | Assign token, component, layout and effect ownership before another restyle |
| UI-02 | P1 / C | The bubble layer explicitly hides the older per-screen ambient layer outside battle | Restore distinct screen identities through one owner, not two overlapping backgrounds |
| UI-03 | P1 / C | Generic press handling adds rings/particles/glyphs and a scale animation to many controls | Differentiate navigation, selection, draft edit, destructive choice and saved success |
| UI-04 | P0 / C | Generic surfaces and headings inherit leader accents while actual objects may belong to a different element/banner | Resolve local item identity separately from navigation, rarity and status |
| UI-05 | P0 / C | Inventory help hard-codes "all 57" Masters despite the expanded catalog | Derive catalog facts and audit all counts/rules against content sources |
| UI-06 | P1 / C | Ability summary text is copied out of dialog DOM by a mutation enhancer | Render card summary/cost from typed content rather than paragraph position |
| UI-07 | P0 / F | Team Edit squad and Story Prologue undershoot the 44px target in sampled fixtures | Fix component sizing and validate the final computed targets, not only CSS declarations |
| UI-08 | P1 / C | Conduit catalog, detail and help repeat full effect/ownership/purchase context | Give preview and decision detail distinct jobs without hiding costs or rules |
| UI-09 | P1 / C | Character Archives pre-render every six-form card and its combat-kit dialog | Measure DOM/interaction cost; then lazy-render detail, preserving all discovery gates |
| UI-10 | P0 / C + V | Multiple presentation systems own busy, animation, dialog and cleanup state | Document hand-offs and add lifecycle tests; do not replace authoritative game state |
| UI-11 | P1 / C | Toast tone can be inferred from message text | Pass explicit intent/tone from operation results; retain legacy fallback temporarily |
| UI-12 | P1 / C | Neutral accent fallback does not express every activity's world/banner identity | Add authored presentation themes at route/local-art boundaries |
| UI-13 | P0 / C + V | Account/save/social domains use different pending, retry and final-status surfaces | Define consistent transactional states and preserve the same request on uncertain retry |
| UI-14 | P1 / C | Reward dialogs, full-screen cinematics and local celebrations have parallel visual grammars | Reuse a shared reward intensity contract rather than stacking everything |
| UI-15 | P1 / C + V | Battle speed and nonbattle timing need an explicit boundary | Preserve existing speed scaling; verify intended domains before modifying timings |
| UI-16 | P1 / C + V | Settings/account/profile use several visual surface systems and focus paths | Align dialog chrome and verify focus opening/closing across actual routes |
| UI-17 | P2 / C + V | Many global observers, glow layers and per-target effects can be active | Profile concurrency and cleanup before adding more expensive bloom |
| UI-18 | P1 / C | Story entry repeats reward summaries alongside loot details and regional information | Separate chapter context, selected-stage facts and optional exact loot tables |
| UI-19 | P0 / V | Runtime Reduce motion inheritance is not proven for every utility surface | Test computed CSS and in-progress preference changes, not file-local searches alone |
| UI-20 | P1 / C + V | Active/closed/pending special-event identity needs deliberate presentation even without art | Keep real schedules and neutral named fallbacks; avoid false urgency or launch implication |
| UI-21 | P2 / V | Small/low-contrast secondary text and gradient headings need measurement over all themes | Measure rendered contrast and readable hierarchy before changing font/size globally |
| UI-22 | P1 / C | Current documentation contains historical navigation/art/status instructions | Put the current contract first; label history and remove misleading active guidance |

### Finding details and evidence

**UI-01: cascade ownership.**
[Application imports](../../src/main.ts) load sanctuary, neutral, character,
interface, numeric, layout, reference, mono, leader, button and bubble styling.
[Bubble CSS](../../src/presentation/bubble-ui.css) contains 284 lines matching
`!important` in the audit's source search. That is not itself a rendering defect,
but makes visual ownership and regression prediction difficult.
Do not add a new "final-final" stylesheet. Migrate selected selectors only after
capturing their intended computed appearance and behavior.

**UI-02: a lively background can still be uniform.**
[Ambient screen definitions](../../src/presentation/ambient-background.ts) and
[ambient CSS](../../src/ambient-background.css) already supply different geometric
patterns. [Bubble CSS](../../src/presentation/bubble-ui.css) explicitly replaces
the old per-screen layer outside battle with one persistent backdrop.
Keep persistence if it avoids tearing; vary its composition/theme intentionally
instead of running both systems.

**UI-03: a press is not a celebration.**
[Press feedback and installation](../../src/presentation/bubble-ui.ts) add two
rings, particles/glyphs and a scale sequence to eligible controls before the
result of an operation is known. Cosmetic press response can be valid before
saving, but it should communicate acknowledgement, not success.
No destructive/cancel/retry action should look like an acquisition.

**UI-04: color has several owners.**
[Leader theme](../../src/presentation/leader-theme.ts) sets `--ui-accent`.
[Button styling](../../src/presentation/button-style.css) and
[bubble heading/surface rules](../../src/presentation/bubble-ui.css) consume it
widely. Navigation may use this accent; item details must retain their own
element/banner/rarity. Avoid one accent overwriting all of those meanings.

**UI-05: current facts beat remembered numbers.**
[Inventory help](../../src/presentation/inventory.ts) has the literal text
"Chests stay unopened once you own all 57." Other UI logic correctly uses
the actual Master catalog. This is a confirmed copy inconsistency, not an
unimplemented bulk chest mechanic. The future fix should derive the count
or remove the unnecessary count while retaining the unopened-chest rule.

**UI-06: structured content should own presentation.**
[Ability card enhancement](../../src/presentation/bubble-ui.ts) finds paragraphs
inside dialogs and appends an aria-hidden summary/cost to the card.
[Character detail](../../src/presentation/hub.ts) already renders the source kit.
Provide one structured card/detail representation instead of inferring the
summary from DOM classes and paragraph order.

**UI-09: catalog scale is real.**
[Character Archive](../../src/presentation/archives.ts) renders six forms per
starter, resolves preview kits and embeds dialogs for those forms. The fixture
had 218 visible buttons in the default Collections template.
This is not proof of poor frame rate. Measure initial render/filter/open costs;
prefer lazy details first, and consider paging only if measured cost warrants it.

**UI-10 through UI-17: keep the good state guarantees.**
[Battle presentation](../../src/presentation/battle-view.ts),
[reward screen](../../src/presentation/reward-screen.ts),
[rarity feedback](../../src/presentation/rarity-feedback.ts),
[upgrade celebrations](../../src/presentation/upgrade-celebration.ts) and
[activity transition](../../src/presentation/activity-transition.ts) already
have meaningful cancellation/cleanup/save sequencing.
The audit recommends explicit coordination and measured resource ownership,
not a new global state machine or removal of existing protections.

**UI-19: absence in one stylesheet is not absence at runtime.**
Utility CSS sometimes relies on imported global Reduce motion rules.
Treat incomplete evidence as a coverage test to add, not a declaration that
every calendar/chat/loadout animation currently ignores the preference.

## 6. Target visual and interaction system

### 6.1 The visual hierarchy

Use four layers with separate responsibilities:

1. **World atmosphere:** slow screen-specific composition, mostly outside
   text/control regions; establishes place.
2. **Readable working surface:** stable neutral cards, contrast and spacing;
   allows the player to make a decision.
3. **Authored focal content:** portrait, banner, mechanical art or selected
   activity; owns the richest color and largest visual emphasis.
4. **Moment feedback:** bounded press/selection/saved reward/impact effects;
   explains what just happened and then gets out of the way.

No ordinary screen should need all four layers at maximum intensity.
Luxury comes from restraint, timing and material contrast as well as light.

### 6.2 Semantic tokens, not a new theme framework

Start with a small set of shared CSS variables in the existing theme foundation:

| Group | Proposed tokens | Purpose |
|---|---|---|
| Surface | canvas, panel, raised panel, modal, scrim | Consistent depth without identical layouts |
| Text | primary, secondary, quiet, inverse | Predictable readable hierarchy |
| Lines | divider, selected edge, focus edge | Distinguish selection from decoration |
| State | pending, success, warning, danger, disabled | Communicate state with text and shape too |
| Identity | navigation accent, content accent, rarity accent, banner accents | Keep meanings independent |
| Space | compact, normal, section, page | Shared rhythm without shrinking artwork |
| Motion | press, select, enter, reveal, settle | Named timings/intensities |
| Optics | highlight, small glow, focal bloom, scrim strength | Bounded light budgets |

Keep current font stack and authored identity variables. Do not create a large
configurable token system for hypothetical features.

### 6.3 Material language

- Working cards: dark matte/glass mix with a crisp border and restrained light.
- Interactive choices: clear selected edge/inset illumination; no perpetual wobble.
- Portrait stages: broad clean art area with no clipping or arbitrary circular mask.
- Masters: visually large enough to appreciate actual machinery; text remains
  outside the artwork, not etched into the generated image.
- Rewards: high-contrast illuminated focal stage, dark surrounding rest area,
  finite rays/bloom and readable receipt.
- Destructive controls: calm warning language and explicit consequences.
- Pending operations: stable control geometry and a small progress indicator,
  not a high-value reveal portal.

### 6.4 Identity precedence

1. The object's own authored palette and artwork always win.
2. Element color describes combat identity; do not repaint equipment with it.
3. Banner motifs describe provenance/world membership.
4. Rarity/star treatment communicates category/value, not acquisition promises.
5. Leader accent supports general navigation, not every selected object.
6. Semantic success/warning/danger colors remain recognizable independently.

For Moon associated art, use the current blue-purple phases and individual
ship/counterweight/standard/link/garden/fan construction. For Sunshade, use
orange-pink solar shapes in black-white material. Do not automatically repaint
the protected Moon portraits or previously delivered art.

### 6.5 Motion grammar

The following timings are **proposed starting ranges**, not measured current
behavior or authority delays. Tune them through temporal review.

| Intent | Proposed response | Starting duration | Must not do |
|---|---|---|---|
| Hover/focus | Edge light and restrained elevation | 100-160ms | Move the target away or require hover to understand it |
| Press | Small compression/highlight | 80-140ms | Look like acquisition success |
| Local selection | Selected edge, brief local sweep | 120-220ms | Save account state unless the action actually requires it |
| Tab/category change | Short content dissolve/settle | 140-240ms | Rebuild persistent portrait or reset scroll |
| Navigation | Destination-specific settle | 180-320ms | Add a mandatory wait to an already ready screen |
| Saved routine action | Inline confirmation plus small sheen | 300-650ms | Full-screen celebration for every lock toggle |
| Important saved upgrade | Local expanding ring and authored sparks | 650-1200ms | Cover costs/focus or celebrate rejected saves |
| Valuable acquisition | Existing skippable staged reveal | Tune existing sequence | Change loot, pity or earned rarity to suit anticipation |
| Error/uncertain result | Stable message and recovery action | Immediate; persistent if needed | Shake/flash repeatedly or auto-dismiss actionable errors |

Additional rules:

- Animate wrappers, never overwrite artwork-facing transforms.
- No animation is the only indication that an operation happened.
- Cosmetic randomness stays separate from game/reward RNG.
- Do not animate all visible grid cards indefinitely.
- Continuous ambient motion pauses when the document is hidden.
- Do not introduce camera movement without explicit owner approval.
- Preserve existing 1x/2x/3x battle timing contracts; nonbattle UI does not
  silently inherit combat speed.
- A manual battle presentation skip is a **separate proposed feature**, not
  already-approved behavior. If pursued, it requires explicit approval and
  exactly-once impact/reward semantics.

### 6.6 Information grammar

Each screen should answer, in order:

1. Where am I?
2. What is selected/current?
3. What can I do next?
4. What will it cost or change?
5. Why is something unavailable?
6. Where can I inspect exact details?

Use names, actual values, targets, duration and meaningful trigger limits.
Keep shared rules in Help/reference; keep action-specific eligibility beside
the action. Move lore into optional depth rather than deleting it.

Examples of target copy structure:

- **Purchase:** item name, quantity, exact cost, owned amount, primary action.
- **Upgrade:** current -> next, exact resources, relevant deltas, confirm.
- **Locked activity:** exact requirement, current qualifying value, safe next step.
- **Saved reward:** actual award, conversion/bonus if any, concise saved receipt.
- **Uncertain online action:** "Confirmation pending. Retry this action."
  Preserve the same operation/request, not a newly generated action.
- **Saved but presentation failed:** "Reward saved. View it in Inventory."
  Retry artwork/presentation only where supported.

Examples are templates, not replacements for domain-specific truth.

## 7. Screen-by-screen plan

Every subsection includes intent, retained behavior, proposed changes and tests.
All UI work should use real state and real actions, not cosmetic demo controls.

### 7.1 Title and account entry

**Intent:** a living world, a clear choice and confidence about save ownership.

Retain the concise title, online/offline distinction, original identity and
existing React mounting. Avoid additional account setup steps.

Proposed:

- One deliberate celestial focal effect behind the title, not many unrelated
  moving ornaments of equal emphasis.
- Give online primary/offline secondary controls the shared press/focus grammar.
- Keep "Sign-in / Create Account" understandable without a Help dialog.
- Account modal uses the same neutral working surface, clear field states,
  and consistent initial/close focus.
- Normalize known auth/connection categories into actionable messages; retain
  diagnostics in logs, never expose secrets.
- Confirm that browser audio abort/autoplay behavior is expected before treating
  the observed aborted music request as a missing-asset defect.

Acceptance:

- First interactive control is reachable by keyboard and clearly focused.
- Slow sign-in has visible pending state; duplicate activation is blocked.
- Recovery/reset/session expiry has a defined result and next action.
- Offline choice cannot accidentally modify online data.
- Under Reduce motion, the title remains composed and readable, not empty.

### 7.2 Starter selection

**Intent:** meet one distinct character and make an informed initial choice.

Retain three legal starters, no auto-granted trio, selected portrait continuity,
exact kit/role information and existing journey confirmation.

Proposed:

- Introduce each starter with a distinct small elemental material treatment
  inside a common layout, not different fonts or card geometry.
- Selection changes update one focal stage and concise role/effect information.
- Keep lore optional and the primary journey action visible on small screens.
- The selected card has an obvious shape/text state, not color alone.

Acceptance:

- Selecting back and forth does not replace portrait DOM unnecessarily.
- Selected/busy/disabled/restored states retain exact starter identity.
- The full character name and action remain readable at all target widths.
- No success celebration before starter persistence completes.

### 7.3 Home

**Intent:** sanctuary, belonging and a clear next destination.

Current [Home](../../src/presentation/reference-home.ts) has a leader orbit,
six destinations, Story progress and a squad rail. Preserve those destinations
and the authored leader; do not reintroduce a competing navigation scheme.

Proposed:

- Keep one portrait focal point; tone down competing orbit/decorative emphasis.
- Distinguish navigation bubbles by meaningful icon/silhouette and concise label,
  with neutral structure and a restrained leader accent.
- Make Story progress the clear continuing task, without turning Home into a
  duplicate activity catalog.
- Use the existing live squad rail, not a fake "recommended team."
- Show attendance/mail unread availability only from actual online authority.
  Linking those real utilities from Home is a scope decision for the relevant
  phase, not a new daily reward or automatic claim.
- Preserve full currency values; allow header layout to reflow rather than crop.

Acceptance:

- Players can locate Play, Team, Summon, Inventory, Stores and Collections
  without opening Help.
- Long leader/evolution names and maximum-safe balances do not collide.
- No destination changes position during pointer approach.
- Press feedback is immediate; navigation does not stack two entrances.

### 7.4 Global chrome, Back and secondary routes

**Intent:** always know where you are and how to return.

Retain caller-based history, aliases and saved route context.

Proposed:

- Give each destination a visible page identity where the current design relies
  mainly on an offscreen heading; keep headings accessible either way.
- Keep currency, Help, Collections, Settings and Profile grouping consistent.
- Use meaningful text labels or accessible tooltips for compact utility icons.
- Audit duplicate direct links against actual journey needs; do not remove a
  useful shortcut solely because it appears twice.
- Determine the current intended navigation contract before retiring legacy
  dock/drawer styles; older specifications contain superseded guidance.

Acceptance:

- Back returns to the actual caller with selected state and scroll.
- Nested details return to the corresponding list item.
- Returning from Settings preserves drafts where promised.
- Header targets remain >=44 x 44 CSS pixels at final computed size.
- Utility labels remain understandable with icons hidden.

### 7.5 Owned Element-Bearer roster and detail

**Intent:** collection pride, individual identity and a legible build.

Retain sorting/filtering, ownership, full portraits, actual stats, skills,
level/evolution, lore and equipment.

Proposed:

- Roster cards: portrait, name, element/stars/current level and concise squad tag.
  Avoid repeating totals both in a count badge and immediately adjacent copy.
- Detail: one character focal stage, clear Stats & Skills / Level / Evolution /
  Conduits navigation and stable lower work area.
- Ability cards render typed summary/cost/effect data directly.
- Show passive resource/kit detail with the same content source as battle.
- Preserve exact fractional stats and presentation-only formatting.
- Local item/banner identity supplies detail accents rather than the leader
  repainting another character's information.
- Make Edit squad meet the computed target-size requirement.

Acceptance:

- Switching tabs does not restart portrait idle/entrance or lose filters.
- Character name/evolution/rating refreshes after a saved upgrade.
- No clipped ability trigger/cap/duration clause.
- Selecting an unowned Archive form never appears as owned management.
- Mixed-element squads do not contaminate local character accents.

### 7.6 Level, evolution and Calamitic Ascension

**Intent:** understand investment, see progress and feel a saved transformation.

Retain one atomic transaction, exact previews, protected fodder, real costs,
Calamitic gating and existing confirmation/celebration mechanisms.

Proposed:

- Standardize preview layout: current/next at top, relevant stat deltas, exact
  resources, one action row and precise rejection reason.
- Fodder value selection remains deliberate, not an automatically consumed list.
- Move shared rules out of repeated permanent paragraphs while leaving permanent
  consumption warnings and selected-value requirements visible.
- Successful level-up gets a local polished response; evolution/ascension gets
  a stronger finite sequence with authored identity.
- Keep max-level completion visible even when the final upgrade button disappears.

Acceptance:

- Cancel changes no resources/copies/progress.
- Overflow/rejected writes leave raw account and eligibility unchanged.
- Reduced motion shows the same final form, stats and saved result immediately.
- Refresh preserves focus and any promised selected fodder/draft state.
- No text or portrait-facing transform is mirrored by the celebration.

### 7.7 Captured Elemental-Devourers

**Intent:** real owned copies, safe management and clear protection.

Retain UUID identity, fixed form, independent levels/skills, locks, squad/gear
protection, sale eligibility and same-event evolution value.

Proposed:

- Card state distinguishes form identity from copy number and protection.
- Group repeat-species copies visually without merging their IDs or data.
- Clear separate actions for Inspect, Lock, Level, Equip and Sell.
- Bulk sale mode has an unmistakable selection count/value and exit.
- Destructive confirmations show actual selected copies and totals, not long
  unstructured strings.
- Do not celebrate browsing, a failed sale or cancelling destructive confirmation.

Acceptance:

- Identical species remain distinct copies in all commands.
- Protection reasons are visible before and after a stale-state rejection.
- Sold/reacquired forms retain acquisition history.
- Keyboard/touch can acknowledge new-form markers without opening a sale.

### 7.8 Squad and saved loadouts

**Intent:** deliberate team-building and confidence in what was saved.

Retain 1-3 members, leader ordering, duplicate-species captured eligibility,
draft/save separation, exact gear snapshots and existing saved configurations.

Proposed:

- Make current squad, draft squad and saved loadout visibly different states.
- One named action group per saved card: Equip, Rename, Save/Overwrite, Delete.
- Use existing portrait/equipment previews; do not replace with dense inline IDs.
- Optional native detail disclosure retains its open state after refresh.
- Saved success gets a small local ring/sheen; draft edits get selection feedback.
- Matching/unavailable loadouts have short precise state text.

Acceptance:

- Draft editing does not save until the existing explicit transaction.
- Settings/Back restore promised editor state.
- Applying a saved squad does not reread or alter an ongoing frozen battle.
- Long loadout names and nine equipment slots fit without horizontal overflow.
- No double celebration from old and new success enhancers.

### 7.9 Ordinary Conduit and Master equipment

**Intent:** understand the selected mechanism and its actual effect.

Retain eight ordinary slots, separate Master, ownership/element/limit checks,
configuration counts, search, View Details and no auto-equip.

Proposed:

- One clear selected item stage, with real artwork or a named neutral fallback.
- Separate static inspection from accepted selection/equip feedback.
- Owner/banner/rarity identity remains visible in details.
- Maintain current/max effect comparison without repeating it on every tile.
- Explain incompatibility at the affected slot/choice and use disabled semantics.
- Preserve all per-option Master View Details and cross-character chest choices.
- No fake animated machinery for undelivered art; native framing can be polished.

Acceptance:

- View Details never equips or consumes a chest.
- Select/picker cancellation leaves backing selects and wallet unchanged.
- At most four ordinary Omnic slots and matching element remain enforced.
- Configurations preserve all ordinary/Master references and exact snapshots.
- Current and proposed stat deltas derive from actual effects, not cosmetic values.

### 7.10 Inventory

**Intent:** quickly find what was earned and what can be done with it.

Retain positive holdings, exact quantities, currency cards, filters, item details,
real chest commands and new-acquisition acknowledgement behavior.

Proposed:

- Correct stale Master counts/help from catalog data.
- Separate resources, equipment and chests in the existing categories with clear
  subheadings; do not invent storage limits.
- Card preview: name, art, quantity and one short use/state.
- Details: exact use/source/effect and relevant management link.
- Shared item metadata must include current special-event families so element,
  rarity and "No element" filters do not misclassify new resources.
  Audit this against content tables before changing behavior.
- New indicators should guide discovery, not decorate every ancestor forever.
- Empty inventory has one calm explanation and a real route to earn items.

Acceptance:

- Search/filter result counts match visible items.
- First-ever acknowledgement persists before the mark clears.
- Routes are not acknowledged merely by hovering/opening them.
- Historical holdings are seen without load writes.
- Spend/sell/reacquire does not erase lifetime history.
- Catalog expansion updates help and counts automatically.

### 7.11 Stores and material exchange

**Intent:** know the item, price, eligibility and result without visual noise.

Retain exact prices, tier unlocks, quantity options, permanent event materials,
real ownership warnings, confirmed atomic purchase and saved receipt.

Proposed:

- Standard shop header/tabs across ordinary, cosmetic, event and Conduit stores.
- Catalog previews stay brief; selected detail owns the full purchase decision.
- One contained selection sheen, no repeated full-screen sparkles on every tile.
- Keep price and selected quantity adjacent to the action.
- Disabled state says why: balance, owned limit, progression or inactive window.
- Cosmetic preview clearly differs from saved equipped profile appearance.
- Post-event Devourer availability is derived from actual completed windows,
  not inferred from absence of an active schedule.

Acceptance:

- Sheen stays inside its positioned/clipped button at all sizes.
- Quantity/price remain stable while awaiting authority.
- Cancel/rejected purchase has no success light/reward screen.
- Multi-currency/source warnings remain exact and accessible.
- Pending retry cannot purchase twice.

### 7.12 Collections, glossary and Story Codex

**Intent:** discovery, aspiration and optional depth without overwhelming lists.

Retain all forms, current equipped stats, preview labels, locked silhouettes,
discovery/loot gates, combined filters and spoiler protection.

Proposed:

- Shared filter rail with meaningful counts and one Reset action.
- Catalog cards present identity/discovery state; detailed combat kit/lore belongs
  in an on-demand panel.
- Measure eager dialog/render cost. First optimization should be lazy detail
  construction, not deleting catalog entries.
- Optional pagination/virtualization requires measured need and preserved focus,
  filtering, history and disclosure semantics.
- Codex remains a calm rereading surface with discovered records only.
- Reached-form preview never implies that an unowned character was acquired.

Acceptance:

- Locked entries reveal no hidden artwork, loot or Story spoilers.
- Current form uses actual saved/equipped values; other forms say Level 0 preview.
- Filter/open/close is responsive with the complete authored catalog.
- Back from detail restores selected card and scroll.
- New-item indicators do not bypass ownership/discovery gates.

### 7.13 Gameplay activity selector

**Intent:** choose a purpose, understand difficulty/rewards and enter confidently.

Retain category choices, exact stage gates, real levels/rewards/loot and
activity-specific layouts; no placeholder missions or invented stock.

Proposed:

- Three zones: category/location choice, selected activity identity, actionable
  stage/difficulty/reward summary.
- One visible selected activity rather than a wall of all categories.
- Give Story, Training, dungeons, infusion, currencies, Machines, Oblivion, War
  and Events distinct atmosphere within the same fact/action layout.
- Reduce repeated lore/fact paragraphs; preserve exact optional loot tables and
  enemy-strength explanations.
- Difficulty/locked states are readable and not dependent on color.
- Preview stage choices keep entered encounter snapshots independent.

Acceptance:

- Switching category/activity retains its transient selection as intended.
- No empty Location column for modes without a location picker.
- No wrong enemy level/gate from a previously selected mode.
- All registered activities remain reachable by keyboard and touch.
- Free entry, current floor and actual unlock reason stay beside Enter.

### 7.14 Story map and stages

**Intent:** a journey through a living world, not a spreadsheet of stage buttons.

Retain the uncropped map, accessible HTML beacons, canonical sequence, real
progress/rewards and optional Codex/prologue.

Proposed:

- Subtle region atmosphere around, not repainted onto, the supplied map.
- A selected beacon gets one restrained light path/marker response.
- Stage view separates region narrative, chosen encounter and exact loot.
- Completed/current/locked are distinguishable through shape/text as well as color.
- Regional clear has a saved milestone moment using existing result/receipt data.
- Fix Prologue target size; keep map labels reachable on mobile.
- Do not add camera drift, procedural map particles over labels or new Story
  chapters under a UI scope.

Acceptance:

- All map art remains natural aspect and uncropped.
- Beacon selection reveals no locked content.
- Current/cleared stages have the correct first-clear/replay wording.
- Final stage has no incorrect Continue.
- Prologue and stage actions meet final target-size and focus requirements.

### 7.15 Special banners, archive and activities

**Intent:** an unmistakable event world with honest availability.

Retain independent pity, rates, schedules, permanent rerun data, no automatic
launch, real first-clear/post-event eligibility and art-neutral fallbacks.

Proposed:

- Banner and activity share motifs but keep distinct authored names.
- Active, not launched, closed and rerun states each have clear hierarchy.
- No countdown unless based on server-authoritative known timing.
- Moon uses lunar phases and distinct owner motifs; Sunshade uses solar
  orange-pink plasma and black-white construction.
- Existing Rose remains its own established visual identity.
- Archive is inspection, not a disguised inactive summon button.
- Pending art says "Artwork pending" without fake portraits or silhouette leakage.

Acceptance:

- Both new empty schedules remain inaccessible to draw/entry.
- Future closure blocks new stages but preserves saved/current encounter rewards.
- Archive inspection never spends currency or resets pity.
- Gift eligibility and post-event copy shops align with the actual schedule.

### 7.16 Summon, chest and acquisition rewards

**Intent:** anticipation, reveal, recognition and a trustworthy saved receipt.

Retain the existing [reward foundation](../../src/presentation/reward-screen.ts),
actual saved results, duplicate conversions, bonus items, pity, Skip and Continue.

Proposed:

- One grammar with routine, important and extraordinary intensity levels.
- Primary earned object gets the brightest focal stage; receipt follows in
  concise ordered groups, not competing text.
- Keep anticipation star tier separate from actual awarded rarity.
- Ten-pull sequence reveals in a controlled wave; all results remain inspectable.
- Bulk Master choices get one combined reveal/receipt, not repeated purchases.
- Details are available after Skip and after reduced-motion immediate reveal.
- Avoid stacking reward, generic bubble celebration and per-card feedback at
  full intensity simultaneously.
- Distinct celestial/mechanical/Calamitic identities live inside this grammar.

Acceptance:

- Save is complete before any acquisition celebration.
- Skip changes presentation only, not rolls, chest spending or conversion.
- Escape/dismissal/focus paths preserve the saved receipt.
- Failed art loading says the item is saved and never retries acquisition.
- Final exact amounts are available without waiting for decorative number tweening.
- Repeated ten-pulls do not accumulate listeners/observers/canvases.

### 7.17 Battle entrance, actions and field feedback

**Intent:** readable tactical action with distinct, radiant character expression.

Retain [BattleView](../../src/presentation/battle-view.ts), actual ordered events,
impact callbacks, frozen squads/equipment, skills, speed and scenery.

Proposed:

- Audit actual current battle layers before adding more atmosphere; bubble,
  cinematic, mono and canvas effects already coexist.
- Establish selected ally/target, player/enemy turn and recovery as distinct
  readable states without enlarging field data into a dashboard.
- Use character/ability-specific VFX from existing profiles; share execution,
  not identical silhouettes.
- Impact-local bloom/light belongs on effects, not globally blurred artwork/text.
- Damage/heal/Shield/status/cleanse have explicit local response and exact
  state updates. Do not substitute invented green healing for an authored
  differently colored effect; semantic healing text/bar can remain recognizable.
- Preserve cut-in title reading hold and existing speed policy.
- Extend transition/cleanup tests for host replacement and mid-effect settings.
- Manual presentation Skip, if desired, is separately gated for approval and
  exactly-once semantic tests; do not confuse it with skipping an enemy phase.

Acceptance:

- HP/Shield/status changes happen at the semantic impact, not end-of-turn repaint.
- AoE targets update together according to actual events.
- Recovery includes real enemy phases; no free gameplay skip.
- Changing speed mid-animation affects intended active visual domains only.
- Reduce motion gives immediate correct state and useful static indicators.
- Facing survives movement/cut-ins; panels/text are never mirrored.
- All effects stop on exit/disposal; rewards are not lost or duplicated.

### 7.18 Battle results and continuing encounters

**Intent:** closure and a clear choice to continue, retry, inspect or leave.

Retain victory/defeat distinctions, actual accumulated events, saved rewards,
reopen/dismissal state and manual transitions.

Proposed:

- Victory feels radiant; defeat feels calm and informative, not a failed
  celebration or punishment animation.
- Result hierarchy: outcome, encounter identity, actual saved rewards,
  Continue/Retry/Quit and optional details.
- Decorative amount animation must not erase exact receipt text or make
  assistive technology announce every intermediate number.
- Continuing keeps run identity without replaying entrance on Settings close.
- Final encounter omits Continue and communicates completion.

Acceptance:

- Result appears only after the required action/defeat presentation.
- Every reward in the full encounter event ledger is included.
- Dismiss/reopen retains same totals without another claim.
- Current encounter completion after event closure is allowed; new stage denied.
- Uncertain authority result exposes recovery rather than starting a new run.

### 7.19 Profile, friends, chat, calendar and mailbox

**Intent:** an inhabited world and trustworthy social utility.

Retain actual online identity, private profile projection, accepted friendships,
real presence, read/claimed mail, manual attendance and daily gift rules.

Proposed:

- Profile identity/progress first; Friends/Chats/Calendar/Mail utilities next.
- Use consistent neutral utility panels with small themed accents, not summon
  portals for every tab or message.
- Calendar distinguishes attendance ordinal, current reset day and streak;
  no confusing "concurrent" wording or automatic/catch-up claim.
- Mail states: unread/read, unclaimed/claimed and pending claim; claiming does
  not imply unread acknowledgement was already saved.
- Gift choice shows recipient, actual allowed contents and daily send eligibility.
- Chat preserves drafts and retry state; no speculative delivered animation.
- Optional Home shortcuts use actual unread/claim availability, not invented
  retention incentives or new notification permissions.

Acceptance:

- No gift reward deducted from the sender; one send/account/reset day remains.
- No receiving cap or expiry is introduced.
- Individual/claim-all retry is idempotent and overflow rolls back atomically.
- Closing a pending dialog cannot celebrate late or close a newer dialog.
- Friend profile never reveals private mail/calendar/acquisition metadata.
- Long names/messages and keyboard/mobile soft-keyboard layouts remain usable.

### 7.20 Settings, save management, Help and errors

**Intent:** control, clarity and trust.

Retain actual settings, existing online/offline save boundaries, hotkey scope,
battle-speed semantics and native confirmations.

Proposed:

- Group settings by purpose with concise labels and optional explanatory depth.
- Keep Reduce motion prominent; changing it mid-presentation should settle all
  active layers safely.
- Consolidate current surfaces into one dialog family, not one giant dialog.
- Show persistent actionable errors near the operation; transient routine
  notices use explicit-tone toasts.
- Keep short product copy separate from technical logs.
- Help owns shared rules; unique effects/gates remain on decision surfaces.
- Save/delete/import confirmations explicitly name the affected storage/domain.

Acceptance:

- Focus starts predictably, remains contained where modal, and restores on close.
- Closing Settings preserves the menu DOM/draft or reconstructs the frozen battle.
- No browser alert/confirm/prompt or OS notification is added.
- Invalid input, rejected write and lost connection have actionable messages.
- Reduce motion removes nonessential transforms and particles from all active
  layers without changing gameplay settings or outputs.

## 8. Transaction and presentation-state contract

Do not introduce a new authoritative game-state layer. Standardize the existing
UI's vocabulary and hand-offs:

| State | Visible treatment | Available controls | Data rule |
|---|---|---|---|
| Ready | Normal action and exact preview | Existing actions | No new write |
| Draft changed | Local selected state, "not saved" where relevant | Edit, save, cancel | No implicit save |
| Confirming | Consequence and actual cost/selection | Confirm, Cancel, Escape | No mutation yet |
| Pending | Stable progress label, no success imagery | Existing safe dismissal/retry policy | Serialize intended operation |
| Uncertain | Persistent confirmation-pending message | Retry same request, safe inspection | Do not issue a new roll/purchase |
| Saved | Exact saved outcome/receipt available | Inspect/continue | One successful transaction |
| Revealing | Bounded authored celebration | Skip/dismiss as supported | No additional reward write |
| Presentation failed after save | Saved state plus art/UI retry or real destination | View saved holdings | Never repeat acquisition |
| Definitive rejection | Specific reason and correction | Edit/retry when valid | Account unchanged |
| Cancelled/disposed | Return to caller/context | Existing navigation | No success feedback |

The shared implementation can be a few existing helpers and explicit arguments,
not a configurable state-machine framework. Every domain needs a clear owner
for pending promise, animation handles, focus, listeners and cleanup.

## 9. Implementation order and dependencies

### Phase 0: reproducible evidence and acceptance fixtures

**Depends on:** none. **Priority:** P0.

Deliver:

- Save representative screenshots and temporal captures in the session workspace.
- Use in-memory fixture accounts, never fund owner/production saves.
- Capture actual computed styles and viewport sizes before modifications.
- Inventory active selectors/import order and map route/screen owners.
- Record keyboard journeys, scroll restoration and slow/error/pending cases.
- Add focused regression cases for stale catalog facts and measured target sizes.

Exit gate:

- Every screen family in section 7 has a baseline and state checklist.
- Unobserved states are labeled; no exact mobile/performance claim from a hidden,
  resized browser that did not honor requested dimensions.
- Old/candidate appearances can be compared without losing functional behavior.

### Phase 1: semantic surfaces, hierarchy and cascade ownership

**Depends on:** Phase 0. **Priority:** P0.

Deliver:

- Small semantic token set in the existing theme/style foundation.
- Component-owned selected/disabled/focus/error treatment.
- Migrate a pilot set: header, ordinary panel, primary/secondary control,
  information dialog and stat card.
- Preserve artwork-backed button exclusions.
- Replace conflicting selectors for that pilot instead of appending overrides.
- Fix measured small targets and stale factual copy.

Exit gate:

- Same control has equivalent computed states across Home/Team/dialog/Store.
- Actual art, rarity and element identities are not overwritten.
- No unapproved typography/layout/nav replacement.
- Related tests and exact responsive targets pass.

### Phase 2: shared motion/feedback/lifecycle grammar

**Depends on:** Phase 1. **Priority:** P0/P1.

Deliver:

- Intent-aware neutral press, selection, draft-change and saved-success helpers.
- Explicit-tone status API for newly migrated callers.
- One owner for screen ambient layers; pause continuous motion while hidden.
- Shared cleanup/motion subscription where existing code warrants extraction.
- Remove redundant simultaneous entrance/success effects in migrated paths.

Exit gate:

- Cancel/destructive/retry cannot resemble success.
- Animation disposal and runtime Reduce motion switch settle correctly.
- A ready interaction is not delayed by an artificial animation timer.
- Feedback intensity differs by intent, not by accidental CSS classification.

### Phase 3: Home, global navigation and opening confidence

**Depends on:** Phases 1-2. **Priority:** P1.

Deliver:

- Refined Home composition, leader stage, route choices and Story continuation.
- Consistent header/Back/utility grouping.
- Title/starter/account entry use the same hierarchy and interaction grammar.
- Real online utility links only if chosen for scope.

Exit gate:

- Full opening -> Home -> destination -> Back journey works keyboard/touch.
- Progress, ownership and online/offline boundaries preserved.
- No dock/drawer regression or duplicate navigation system.

### Phase 4: Team, growth, captures and equipment

**Depends on:** Phases 1-2; uses Phase 3 navigation. **Priority:** P1.

Deliver:

- Typed skill-card summary/detail rendering.
- Character/local-theme ownership and stable portrait stage.
- Consistent upgrade/fodder/delta/action hierarchy.
- Captured-copy protection and bulk-sale presentation.
- Squad/loadout/configuration/Master detail consistency.

Exit gate:

- Saved and draft states are obvious.
- Atomic upgrades/equip/protection and frozen runs remain correct.
- New overlays do not interfere with full names, art or immediate controls.

### Phase 5: Inventory, Stores and Collections

**Depends on:** Phases 1-2; detail components from Phase 4. **Priority:** P1.

Deliver:

- Concise catalogs with selected detail and exact action facts.
- Content-derived help/counts/current family metadata.
- New-acquisition indicator hierarchy and acknowledgement unchanged.
- Measure catalog costs; lazy detail construction if justified.
- Consistent ordinary/event/Calamitic/cosmetic shop states.

Exit gate:

- Empty/large/max-safe holdings fit and filter correctly.
- Purchases/openings/retries produce exactly one saved result.
- No lost catalog entries, hidden discovery gates or fake art.

### Phase 6: activity worlds, Story and special-event availability

**Depends on:** Phases 1-3 and inventory/loot detail from Phase 5.
**Priority:** P1.

Deliver:

- Distinct screen atmospheres and shared activity fact/action layout.
- Story map selection/progress presentation.
- Honest active/closed/not-launched/rerun hierarchy.
- All activity categories exercised, not just Story.

Exit gate:

- Authored stage counts/levels/loot/gates unchanged.
- Future event windows are not inserted during presentation work.
- Entry/new-stage/retry/current-encounter closure rules retained.

### Phase 7: unified luxurious reward choreography

**Depends on:** Phase 2 and reward detail/card components from Phases 4-5.
Can be developed alongside Phase 6 with isolated surfaces. **Priority:** P1.

Deliver:

- Reuse saved reward foundation, receipt/detail and Skip controls.
- Tier/intensity mapping for summon, duplicates, bonus items, bulk Masters,
  Calamity chests, level/evolution/ascension and mail/attendance.
- One controlled simultaneous-effect budget.

Exit gate:

- Same saved results under full/reduced motion, Skip and failure.
- Actual rarity/anticipation remain separate.
- No receipt lost or repeated acquisition on artwork retry.

### Phase 8: battle-state readability and optical refinement

**Depends on:** Phase 2; result grammar from Phase 7. **Priority:** P1/P2.

Deliver:

- Temporal baseline at all existing speed settings.
- Per-event field feedback matrix and character-profile coverage.
- Effects-only optical refinement, cleanup/performance guards.
- No camera movement or manual battle skip without separate approval.

Exit gate:

- Actual impact/health/Shield/loot semantics unchanged.
- Settings/exit/cancel/speed switches clean up and settle correctly.
- Final states match baseline under all presentation variations.
- Profiled optical cost fits measured device budgets.

### Phase 9: social utility, profile, Settings and error uniformity

**Depends on:** Phases 1-2; shared receipt grammar from Phase 7.
Can overlap later battle work. **Priority:** P1.

Deliver:

- Identity-first profile and concise friends/chat/calendar/mail utility layout.
- Same pending/uncertain/saved/rejected grammar.
- Modal focus restoration and reduced-motion coverage.
- No backend mechanic changes required merely for surface cleanup.

Exit gate:

- Drafts and idempotent requests survive expected dismissal/refresh cases.
- No private-state leak or unearned reward in fixtures.
- All real actions still use existing authority.

### Phase 10: performance, cleanup and final uniformity release gate

**Depends on:** all migrated phases. **Priority:** P0 release gate/P2 polish.

Deliver:

- Remove obsolete selectors only after parity is proven.
- Measure visible and hidden-tab effects, large catalogs and repeated journeys.
- Audit every route for copied/stale text and identity leakage.
- Record code, screenshots, temporal captures and exact hosted release evidence.

Exit gate:

- All section 10 acceptance checks passed or explicitly scoped blockers recorded.
- Owner reviews real before/after screens and motion, not only test totals.
- Full tests/build, authority deploy if changed, push/Pages and exact hosted SHA.
- No claim of visual completion while required screenshots/state cases are missing.

### Dependency summary

```text
0 -> 1 -> 2
1 + 2 -> 3
1 + 2 + 3 -> 4
1 + 2 + 4 -> 5
1 + 2 + 3 + 5 -> 6
2 + 4 + 5 -> 7
2 + 7 -> 8
1 + 2 + 7 -> 9
3 + 4 + 5 + 6 + 7 + 8 + 9 -> 10
```

Do not begin with full-screen bloom or a global CSS rewrite. Resolve ownership,
readability and feedback semantics first so later spectacle remains coherent.

## 10. Acceptance and validation matrix

### 10.1 Required viewports and states

Use a browser that reports the requested CSS viewport correctly. Record actual
dimensions for every capture.

| Dimension | Required checks |
|---|---|
| Widths | 320, 390, 768, 1180 and 1800 CSS pixels |
| Heights | Short desktop and mobile-height states; soft keyboard where relevant |
| Zoom | Normal and 200% text/page zoom; no text/action clipping |
| Input | Mouse, touch, keyboard-only |
| Motion | System full/reduced; explicit game Reduce motion; toggle mid-effect |
| Account | New starter, mixed squad, many captures, endgame build, unavailable save |
| Numbers | Zero, ordinary holdings, very large stats and maximum-safe balances |
| Content | Long character/Master names, long lore/message, neutral pending art |
| Online | Offline, signed in, slow reply, definitive rejection, uncertain reply, expired session |
| Lifecycle | Cancel, Escape, backdrop dismissal, Settings, Back, rapid repetition, host replacement |
| Events | Not launched, active fixture, closed fixture, rerun fixture; no production date injection |

### 10.2 Layout and accessibility gates

- No document horizontal overflow: `scrollWidth <= clientWidth + 1`.
- Visible essential targets >=44 x 44 CSS pixels unless a documented platform
  exception is deliberately reviewed; measure final computed rectangles.
- Text contrast target: WCAG AA 4.5:1 for normal text, 3:1 for large text;
  essential control/focus edges at least 3:1 against relevant adjacent surfaces.
- A visible focus indicator exists on every actionable control.
- Modal focus enters, stays within enabled controls and returns correctly.
- Long numbers/names wrap without truncating facts or shrinking portrait art.
- Selected/disabled/error/owned/locked states are not color-only.
- Screen-reader announcements use final exact outcomes, not decorative tween values.
- Native dialog/backing-select/transaction hooks remain singular; no duplicate events.

### 10.3 Temporal gates

Capture the production effect at:

- initial state;
- early anticipation;
- readable hold;
- semantic impact or saved reveal;
- settling;
- completely clean terminal state.

Also inspect uninterrupted playback on a visible document. Timeline scrubbing
alone verifies different frames, not frame pacing or perceived quality.

For every finite effect:

- No effect nodes/RAF/active callbacks remain after completion/disposal.
- Reduce motion settles to useful static output.
- Skip and cancellation resolve promises and preserve correct final state.
- The exact saved result is unchanged by cosmetic speed/quality settings.
- Restoring Settings does not replay an already completed entrance/reward.

### 10.4 Proposed performance budgets

These are **targets to validate on documented devices**, not existing results:

- Immediate press/selection acknowledgement within 100ms of input.
- No ready navigation artificially delayed for choreography.
- Desktop 60fps target: p95 active presentation frame <=16.7ms.
- Representative lower-end mobile 30fps fallback target: p95 <=33.3ms.
- No sustained full-window blur/filter animation over all text surfaces.
- Background work paused when hidden; final saved state remains available.
- Repeated 20 open/close/navigation cycles return listener/observer/effect counts
  to baseline, allowing known persistent app services.
- Cap simultaneous glow surfaces and particles from actual profiling.

If these targets cannot be met with the current optical stack, reduce resolution,
blur passes or effect concurrency before changing mechanics or adding another
engine. A new graphics-quality setting requires its own scoped design approval;
it is not automatically implied by this audit.

### 10.5 Existing test groups to use during implementation

Run the smallest relevant group per phase. The following are existing paths,
not a claim these commands have all been run for this documentation task.

Opening/account/navigation:

```powershell
npx vitest run src\ui\opening.test.tsx src\ui\starter-selection.test.tsx src\presentation\game-dialog.test.ts src\presentation\settings-panel.test.ts src\presentation\menu-history.test.ts
```

Team/growth/loadouts:

```powershell
npx vitest run src\presentation\hub.test.ts src\presentation\reference-ui.test.ts src\presentation\portrait.test.ts src\presentation\saved-loadouts.test.ts src\presentation\conduit-loadout.test.ts src\presentation\selection-panel.test.ts src\presentation\upgrade-result.test.ts src\presentation\calamitic-ascension.test.ts
```

Inventory/Stores/Collections:

```powershell
npx vitest run src\presentation\inventory.test.ts src\presentation\conduit-store.test.ts src\presentation\archives.test.ts src\presentation\archives-controls.test.ts src\presentation\online-store-profile.test.ts src\presentation\acquisition-surfaces.test.ts
```

Rewards and feedback:

```powershell
npx vitest run src\presentation\reward-screen.test.ts src\presentation\summon-presentation.test.ts src\presentation\rarity-feedback.test.ts src\presentation\upgrade-celebration.test.ts src\ui\master-choice-dialog.test.tsx src\presentation\status-toast.test.ts
```

Battle temporal/state safety:

```powershell
npx vitest run src\presentation\battle-entrance.test.ts src\presentation\battle-impact.test.ts src\presentation\battle-health.test.ts src\presentation\battle-cutin.test.ts src\presentation\battle-speed.test.ts src\presentation\battle-results.test.ts src\presentation\battle-exit.test.ts src\vfx\vfx-systems.test.ts
```

Social/lifecycle:

```powershell
npx vitest run src\presentation\social-calendar.test.ts src\presentation\friend-chat.test.ts src\online\social-calendar.test.ts src\online\social-calendar-privacy.test.ts src\presentation\acquisition-markers.test.ts src\game\moon-sunshade-authority.test.ts
```

Full release:

```powershell
npm test -- --reporter=dot --maxWorkers=2
npm run build
```

Add focused tests for findings not already covered: content-derived catalog
facts, typed skill-card output, semantic-tone notices, computed target sizes,
theme precedence, hidden-tab pausing and exact disposal counts.
Do not replace raw-save/failed-write/overflow assertions with weaker snapshots.

If shared server behavior changes, regenerate/deploy the matching authority and
run appropriate disposable hosted smoke tests. Presentation-only phases do not
need new database migrations. A successful build or push is not hosted evidence.

## 11. Art dependencies and scope controls

### Can be implemented without new art

- Tokens, hierarchy, spacing and button/dialog consistency.
- Copy normalization and content-derived facts.
- Typed ability summaries and selected-state feedback.
- Existing portrait/art framing.
- Native ambient geometry, restrained light and finite feedback.
- Reward receipt layout and cleanup.
- Exact focus, scroll and motion-preference behavior.

### Requires supplied/reviewed art to declare complete

- New Moon trio and Sunshade portrait visual matching.
- Detailed new ability/Master artwork matching the approved prompts.
- New event scenes, enemies and material chain.

The [remaining-art checklist](remaining-expansion-art.md) remains
207 required/12 optional. UI polish must not silently add new source requirements.
If an implementation phase needs a new custom asset, record it as a proposed
dependency and seek approval before expanding that count.

### Explicit non-goals

- Changing combat balance to make animations more dramatic.
- Buying more Midjourney time or switching engines/models without approval.
- Adding automatic tutorials, pop-up marketing or repeated claims.
- Automatic daily gifts/attendance collection.
- Inventing motion/audio for every utility at the same intensity.
- Repainting supplied source art or rewriting protected portrait prompts.
- Activating either new special event.
- Treating Story future chapters as UI content to implement now.

## 12. Owner review and completion evidence

At each phase show a small **real before/after journey**, not unrelated stills:

1. Entry and selected state.
2. One meaningful interaction.
3. Pending/confirmation if applicable.
4. Actual saved success or explicit rejection.
5. Skip/dismissal/Back and restored context.
6. Reduce motion equivalent.
7. Narrow and wide layout.

The first implementation pilot should be **header, Home, one ordinary panel,
one dialog and one selection/saved-success interaction**. This establishes the
grammar before spreading it across the game.

Owner decisions still needed before those specific optional changes:

- Whether to add manual battle presentation Skip.
- Whether to expose new Home calendar/mail shortcuts.
- Whether measured performance warrants a user-facing graphics-quality option.
- Approval of the first actual visual/motion pilot before broad restyling.

The already confirmed philosophies and celestial palette changes do not need
to be asked again. The remaining questions concern optional behavior/scope,
not whether the game should be polished.

### Definition of done

A phase is complete only when its real user journey, exact information,
transaction semantics, focus/history, responsive layout, motion-over-time and
static fallback pass. The overall program is complete only when all screen
families are migrated/reviewed, unused competing rules are retired safely,
tests/build pass and the matching hosted release is verified.

More effects are not the completion metric. **A coherent, expressive and
trustworthy Last Light experience is.**
