# Last Light: AI agent entry point

## Read first

1. [Documentation index](docs/README.md).
2. [Current state and handoff](docs/handoff.md).
3. [Game vision](docs/game-vision.md) and [decision log](docs/decisions.md).
4. The system document relevant to the task.
5. [Art workflow](docs/art-workflow.md) and the existing
   [prompt guide](Art/midjourney-character-style-prompt.md) before changing art.

## Project rules

- Last Light is an original gacha game inspired by Brave Frontier. Do not copy
  its characters, assets, story, code, names, or proprietary content.
- Separate confirmed requirements, proposed designs, open questions, and
  implemented behavior. A written proposal is not owner approval.
- The owner delegated stack selection: TypeScript, Phaser 3, Vite, and Vitest
  power the browser prototype. Keep accessible menus in HTML over the canvas.
  Ask before changing engines or adding paid services, backends, or payments.
- Inspect the workspace before trusting handoff status. Opening flow and
  [Adventure](docs/free-battle.md), all ten elemental material dungeons and
  [level/evolution transactions](docs/units-and-progression.md) are implemented.
- Starter selection offers fire, water, and grass. Adventure uses only the saved
  starter, including after restart; do not auto-grant a team or replace existing saves.
- Each Adventure entry starts at wave 1; Settings retains the run, quitting does not.
  Enemy level follows wave up to120; stats accelerate from double prior initial
  growth. All enemy curves use src/content/stat-growth.ts with200k ordinary/
  400k bossHP at120. Character G=(1+.03*level)^3*1.45^(evo-1);
  percentages/coefficients use separate boundedP, not HP-scale growth.
  [Dungeon captures](docs/dungeons-and-captures.md) remain unimplemented.
  Captures are distinct from characters, Normal only after global Heavy removal,
  levelable but never evolved; captured Defense eligibility remains open.
- [Gameplay/element framework](docs/gameplay-and-elements.md) is now the activity entry
  point: all ten elemental dungeons and both infusion modes are playable (D-050).
  Five elemental dungeons use prompt-pack enemy names with neutral
  art-pending visuals; never request missing PNGs or reuse another element's art.
  Register supplied packs in content/dungeon-art.ts when they arrive. Shared dungeon levels
  10->120 across35 floors; Heaven/Abyss likewise35 floors80->120. Preserve final
  enemy stats/ability strength and material unlock levels. Shared loot-random.ts
  scales quantities quadratically and chances by level; dungeon/infusion loot APIs
  are the source of truth for rewards and glossary. Costs are unchanged.
  The old Flaming Depths Lv6-55 proposal is
  superseded. Editable first-pass drops/costs live in content/dungeons.ts and
  content/progression.ts. Creature consumption is deferred, not permanently removed.
- Full-concept sanctuary uses seven bottom destinations: Home, Character,
  Gameplay, Events, Inventory, Squad and Summon. Character selects owned IDs;
  Squad saves 1-3 distinct owned IDs, leader first, starter removable. Summon
  costs10 Lycalis, equal odds among unowned existing IDs, disabled when complete.
  New companions start Lv0/Evo1/weapon0 and unequipped. Do not invent extra
  Lycalis income: First Fracture still pays10 once globally.
  Keep sanctuary CSS isolated from title/selection and immersive battle. Preserve
  character portrait/rail DOM when changing upgrade tabs.
- UI primary colors are neutral black/white/gray; accents follow the associated
  element, not arbitrary rainbow navigation or gold currency styling. Keep
  banner-ready button sizes. Supplied Infernic/Aquatic dungeon art is wired to
  dungeon battles and recipe icons, alongside the supplied Garden of Beauty and
  City of Heaven and Galvanic Field packs. Their enemies have per-enemy ability names in dungeon-art.ts.
  City source RGB images use reviewed offline color keys in prepare_dungeons.py;
  protect ivory halos/wings, Shard ribbons and Crest gold. No runtime keying.
  Galvanic green/teal keys are reviewed per image; wider Bloom/Seed/Soul cleanup
  protects Seed painted highlights and Soul facets with foreground masks.
  Do not auto-grant materials or implement captures.
- Art prompts share the original compact chibi renderer: clean anime contours,
  crisp cel shading, painted non-emissive highlights and jewel-like subject colors.
  Preserve identities/palettes/equipment/species; Heaven/Abyss may escalate
  ornamentation, never switch to realistic anatomy or a different renderer.
  Standalone weapons now follow this renderer, not earlier splotchy ink concepts.
  Cutouts retain solid key backgrounds/no glow; scenery keeps full-bleed lighting.
  Same approved --sref at400 for cutouts/200 for scenery; never invent its URL.
  Validate prompt changes with python -m unittest discover -s tools -p test_art_prompts.py.
- Economy/progress share last-light.wallet version3; migrate version2 stage unlocks
  to35-floor equivalent level progress exactly once, and legacy version1
  Fractalis without losing currency. Loading must not write. Retain all account
  data, receipts and stable discovery IDs. Use game/account.ts for atomic upgrades and
  receipt-deduplicated rewards, summons and squad saves. Progress-record presence
  establishes ownership; normalize the profile starter/default squad on read,
  without writes or loss of existing progress. All battle modes snapshot the
  full squad's independent progress; Continue/replay preserve it and each Gauge.
  Preserve starter identity, settings and hotkey keys.
  Battle attack/Defense/ability/Space shortcuts are disabled (D-053); only selection
  keys remain and legacy action fields are ignored without rewriting saves.
  Gestures primary, modal Battle menu accessible, explicit result Continue.
  Cosmetic battle-effects.ts scales bounded rings/rays/sparks by level/evolution;
  scheduled enemy abilities use enhancedAttack events. No combat/RNG changes.
  battle-cinematic.css staggers mirrored formations, never crosses sides.
  battle-ui.css is the final sanctuary-themed combat chrome/Settings layer:
  serif activity/unit names, charcoal framed toolbar and compact320px readout
  cards, unit-element HP accents, white turn controls. Shared by all13 modes.
  Strong #battle-root selectors supersede old transparent-readout rules.
  Use it for controls/readability rather than extending legacy glow overrides.
  Preserve 44px targets, visible focus, collapsed utilities and no bottom bar.
  BattleView's aria-busy tracks entrance/action presentation, not engine phases.
  D-056: toolbar speed1x/2x/3x is presentation-only, persisted separately by
  battle-speed.ts. Update tracked WAAPI playback rates live and scale CSS effect
  duration/delays; do not change combat math, RNG, rewards or reduced motion.
  Remove speed listeners on disposal; preserve Settings/reload selection.
  Field-first layout lives in battle-focus.css. Keep the three former edge
  disclosures inside the modal Battle menu, retaining keyboard/touch actions.
  Field readouts show names/levels, HP and allied Gauge; full DEF/reference
  stays in the menu. Settings uses shared settings-panel.ts/CSS in both contexts.
  Live battle Fractalis is inside Settings, not the toolbar; retain its ID.
  numeric-layout.css owns large-number containment: adaptive stat card columns,
  card-relative type size and full-value wrapping for counts/costs/rewards.
  Preserve exact numeric text; do not abbreviate balances or change stat math
  to fit the UI. Check endgame HP and maximum-safe-integer holdings on mobile.
  teamCanAct/advanceUnavailableTurns resolve blocked player turns automatically
  until an ally can act or combat ends. Recovery is a real enemy phase, never a
  free skip. Continue remains manual; rewards and presentation must retain every
  resolved event across recovery and resumed sessions.
  Owner-supplied alpha in Art/source/cutouts is authoritative for96 assets.
  All exporters use prepare_art.prepare_sprite: trim/resize/pad ONLY for these
  sources. Never apply background removal, seeds, foreground masks or edge
  decontamination to them. Art/cutout-intake.json records originalbyte hashes and
  canonicalnames. Historical originals remain preserved; older Infernis6/Tizu5/
  Flora6 corrections apply only to legacy sources, not supplied cutouts.
  BaseFlora/BaseTizu/archivedHeavy have no suppliedreplacement and stay unchanged.
  Currency originals live in Art/source/currencies; transparent 256px runtime
  icons live in public/assets/currencies. prepare_currencies.py and review_art.py
  share source-specific brown/spill/shadow cleanup. Review replacements before
  reusing masks; --record-review updates only selected currency provenance.
  Use presentation/currency-icon.ts and battle-loot.lootArt, not material URLs
  or letter tokens. Keep both balance IDs, accessible labels and economy rules;
  Lycalis is not enemy loot. Native confirmation dialogs remain text-only.
  New cutout prompts follow Art/cutout-background-contract.md: subject identity,
  equipment, palette and style first; short plain solid unlit background clause
  last. Never force subject colors to clash or redesign them for keying.
  No glows in cutout generation: powers are opaque solid-color lines/ribbons/
  rings/shapes with crisp edges; painted highlights are non-emissive.
  Remove positive luminous/glowing/translucent effect wording, preserve names
  like Luminous and Bloom, and exclude "light bloom" rather than flowers.
  Existing supplied PNGs and runtime battle VFX are not changed by this rule.
  Same solid background fills rings/gaps; no-glow excludes scenery prompts.
  Abyss uses green #00FF00, not neon lighting. Banners/arenas
  remain scenery. Legacy white-matte tools need explicit chroma-key support
  before processing newly generated keyed originals; never erase pale artwork.
  D-054 results sheets appear only after full clear/defeat presentation;
  normal turn cues are brief/nonblocking. battle-results.ts aggregates actual
  kill events, no rerolls/claims. stageEvents includes Adventure and resets per
  encounter; never derive reward totals from the truncated log. Continue/Quit/
  Retry use existing transitions; final stages have no Continue. Dismiss/reopen
  stays transient in the session and preserves totals across Settings.
  D-055: every real enemy has1 skill below50,2 at50+ via enemy-skills.ts.
  Boss second skill is a heavy ultimate every6 turns, replacing due primary.
  Attack events carry actual skill action/abilityName; do not infer from message.
  Character skills and50+ enemy skills have portrait-cut-ins with actual form art;
  battle-cutin.css owns elemental charged ribbons/crests/rails, no boxed copy.
  All skill/ultimate cut-ins3500ms base, stationary12%-90% reading hold;
  final10% fades opacity in place, never slides/scales away.
  Retain1/2/3x scaling per owner choice (910ms stationary hold at3x).
  Ability is large serif title, caster/tier subordinate. Runtime VFX may glow;
  no-glow generation policy applies only to art prompts, not cut-in UI.
  Ultimates use richer ribbons. Track WAAPI/cleanup, skip reduced motion, impact
  after cut-in. Optional skill fields only support legacy mocks, not real spawns.
  Start Lv.0/Evo.1, no retroactive items, no Lycalis spending. Play in one tab;
  local storage is not an authoritative or cross-tab-locked economy.
- Preserve source images under Art/source; shared prepare_sprite prefers
  Art/source/cutouts and must keep suppliedalpha. No runtime background removal.
  Preserve intentional drop shadows, facing transforms and undiscovered
  silhouettes. Images use Vite's deployment base, not root-relative paths.
- Preserve the established art direction. The owner now approved six gameplay
  forms (D-033), mapped to base plus all five supplied evolved portraits for each
  starter. Caps 30/45/60/75/90/105; Evo5->6 costs 4800 Fractalis and 25 Epic/10
  Legendary materials plus10 matching specialty evolution items. Omnic has no spending recipe yet. Save IDs are
  unchanged. Use content/character-art.ts everywhere, not hard-coded base art.
- Tizu/Flora art files include six icon prompts each (Passive, Skill1/2,
  Last Flare, Normal, Defense). Five icons per character are supplied and wired
  through presentation/ability-icon.ts; Defense remains text-only. Originals
  live in Art/source/abilities/{tizu,flora}; prepare_icons.py supports --assets.
  Do not add Heavy or substitute another character's icons.
- Keep gameplay rules and content definitions separate from presentation where
  the selected stack permits it. Reuse existing patterns once code exists.
- Character screen categories/layout live in presentation/hub.ts and the scoped
  character-screen.css. Cinematic central portrait with navigation/details around
  it uses220px desktop rail,52px nav art/80px ability detail art (48/72px phones),
  64px materials. Do not shrink menu art back to20-34px. Phone navigation groups
  use two columns with68px buttons; stat cells auto-fit110px for readable numbers.
  it supersedes D-044's small identity column; mobile also leads with large art.
  Keep all nine selectors and portrait-preserving
  updateCharacterTab behavior. Costs, eligibility and stat deltas must remain
  visible; do not trade reduced scrolling for clipped data or smaller targets.
- Upgrade celebrations (presentation/upgrade-celebration.ts, D-045) run only
  after saved upgrades/updateCharacterTab. Preserve reduced motion, repeat cleanup,
  nonblocking overlays, facing scale and final-cap upgrade-result status.
- Activity loading/entrance (D-046): use activity-transition.ts for destination
  changes and entrancePending for new encounters. Never enable combat while
  loading/sliding, replay finished entrances on settings close, or delay reward
  persistence. Keep reduced motion, artwork timeout/error reporting and disposal.
- Home omits abilities/passive/ability shortcuts (D-047); full kits remain in
  Character/battle. Shared portrait character-idle wrapper pulses menu art only.
  Home also omits the upgrade dock and orbit ring; large centerpiece art has no
  upgrade controls around it. All upgrades remain in Character.
- Cutout cleanup uses reviewed original-normalized seeds in tools/matte_regions.py
   across all exporters; do not globally remove enclosed white pixels.
   Art/matte-review.json records all99 assets and32 targeted fixes. Use
   tools/review_art.py for dark previews and inspect candidates manually.
   Pale wing/crystal protection and per-asset thresholds must survive regeneration.
- Creature Glossary opens from Home. Content catalog assigns stable IDs to each
  authored form across all activities; neutral tokens explicitly denote missing art.
  Walletv2 creatures defaults{} for old saves without rewriting on read.
  Entry records seen before combat, rewards atomically record first defeat.
  Never reveal loot until defeated; use live drop tables and per-stage gates.
  Infusion bonus pools must use infusionElements(mode), matching the five
  associated affinities; per-element probabilities are rarityChance/5.
  Preserve image DOM, thumbnail bounds, facing and nested celebration selectors;
  honor reduced motion. Battle pulse lives separately on unit-idle.
- Heaven/Abyss art direction lives in Art/gamemodes (D-048/D-050): six-form slime
  lines supersede wisps; three specialty items per mode plus mode-associated Epic+
  drops. Late leveling item applies throughout Evo5/6, not just aboveLv80.
  Both modes are live:35 stages80->120, bosses every5. Specialty unlock levels
  80/93/100 (floors1/12/18) are unchanged. Final specialty stacks3-6 each.
  Elemental final stacks3-6 per rarity with
  guaranteed/98%/90%/80%/60%/35% odds; unlock levels10/23/48/73/98/120.
  Rare types remain chance-based. Currency scales5-10 atLv1 to15-30 atLv120,
  including endless Adventure; reward RNG stays separate from combat RNG.
  Visual stacks independently vary size75-135%, scatter and850-1849ms pickup.
  Any-element Epic/Legendary/Omnic unlock80/100/115 (floors1/18/31), odds grow
  15->85%/6->65%/2->40%, final stacks3-6 each. Each success chooses one
  of the mode's five elements uniformly, never from the other mode. Saved infusionStages defaults
  empty on oldv2 wallets; weaponRank defaults0 and must survive all transactions.
  Existing costs plus5/10 specialty items for4->5/5->6 and1 per Evo5/6 level.
  Weapon rankR costs100R Fractalis/5R affinity-bound items, cap10, +2% grown Attack
  per rank. See content/infusions.ts/progression.ts. Never auto-grant resources.
- Preserve fractional growth for all seven character stats and skill/passive
  potency in content/combat.ts. Use formatStat only at presentation boundaries,
  never to calculate stats. Keep established combat-outcome rounding separate.
  Zero-base stats stay zero; see docs/units-and-progression.md (D-035).
- Global Inventory contains owned materials only. Character > Artifacts /
  Equipment owns eight artifact slots plus one Master Artifact per character
  (D-037). Artifacts buff that character's stats; no artifact definitions,
  equip transactions or bonus rules are implemented yet. Do not grant bonuses
  or invent stacking rules from the empty slot preview.
- Battle input uses actAndAdvanceTurn: resolve enemy phases while no living ally
  can legally act; support/Defense count. Recovery retains enemy attacks and all
  effects. Never auto-advance stages. Source art directions live in presentation/
  unit-facing.ts; characters left/enemies right, front poses unchanged.
  Mirror images only and animate sprite wrappers so orientation survives attacks.
  All59 combat sprites were manually re-reviewed;17 directional metadata fixes
  include Tizu2/4/6, Flora4/5, Kappa/Regent and Heaven/Abyss sword/spear stances.
  Cut-ins must share unitFacingAttributes with field art, never flip panels/text.
  Use directional weapon stance for frontal faces, retain truly neutral front art.
- Enemy field labels show name, HP and Defense only (D-040); keep detailed
  mechanics in state/logs, not enemy readouts. Living-unit idle pulse belongs
  on the inner unit-idle wrapper and must respect both reduced-motion settings.
- Visible HP/damage updates occur at impact, not at final turn render (D-041).
  Preserve pre-action HP/shield presentation ledgers and ordered events; all AoE
  targets update together. Health-bar easing is visual only and respects reduced
  motion. Rewards still commit before applying resolved session state.
- Enemy death rewards (D-051) remain atomic per kill, before presentation.
  battle-loot.ts shows only the reward event's actual item stacks/quantity/beams,
  then auto-collects visually. Never add wave-clear grants or a second collection
  transaction. Fade/hide defeated units, keep reduced-motion static receipts,
  action locking and disposal cleanup. Source-aligned pale art masks in
  prepare_art.py preserve Infernis Evo6 feathers without global matte weakening.
- Never invent working commands, test results, credentials, or completed features.
- Do not change unrelated files or overwrite another contributor's work.
- When adding a feature, update its specification, validation guidance, and the
  handoff. Add new documents to the index.
- Record approved consequential decisions in the decision log; unresolved
  questions belong there as open items, not as accepted decisions.

## Completion report

Report what changed, what was verified, what remains unimplemented, and any
owner decisions needed. Include exact commands and outcomes when commands exist.
Use the [handoff template](docs/handoff.md#handoff-update-template) for persistent
state; do not create a second competing status document.
