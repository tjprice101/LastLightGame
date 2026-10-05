# Current state and handoff

**Last updated:** Moderated loot stack growth.

### Moderate loot quantities (supersedes oversized 35-floor payouts below)

Owner requested only roughly2-3x usual loot gains. All elemental and infusion
material stacks now scale from1-2 to2-4 to3-6 per successful per-enemy drop.
Fractalis scales5-10 to15-30 byLv120 across every mode. Unlock levels, rising
rarity odds, five-element infusion pools,35 floors and enemy power stay intact.
Costs and previously saved holdings are unchanged. Gameplay help, glossary,
actual reward rolls and save validation share the revised quantity definitions.
Earlier large-stack figures in this handoff are historical, not current rules.

### Large numeric displays

numeric-layout.css gives Home and Character stat grids adaptive 145px-minimum
cards instead of fixed four-column cells. Card-relative type sizing and wrapping
preserve exact displayed values; no K/M rounding or economy changes. Upgrade
comparisons, material counts/costs, balances, results and glossary ranges also
wrap inside their containers instead of overlapping neighboring content.

### Field-first combat and Settings

Battle focus styling removes the three edge disclosures and framed header
panels. One Battle menu opens a modal with accessible actions, full combatant
readouts, rules and log. Field name/level, HP and allied Gauge remain; Defense
and role metadata no longer compete with the artwork. Leave/speed/Settings
stay in a compact toolbar; the live Fractalis balance is inside Settings.
Shared settings-panel.ts/CSS serves both Sanctuary and battle with a proper
close button, presentation speed, motion and grouped selection keys.
Both speed selectors share persistence and stay synchronized.

teamCanAct/advanceUnavailableTurns use actual action eligibility, advancing
enemy phases until someone can act or combat ends. Last Flare recovery remains
a real enemy turn, not a skipped penalty; it is simply automatic now. Continue
with carried recovery and reopening an exhausted session use the same rule.
Reward commits precede presentation, and result Continue stays explicit.

### Supplied currency icons

Both root originals moved intact to Art/source/currencies. Custom offline
background, cast-shadow and localized sparkle-spill cleanup exports transparent
256x256 icons to public/assets/currencies. Source-specific processing and
targeted regeneration live in tools/prepare_currencies.py; review_art.py uses
the same helper. Provenance is recorded in Art/matte-review.json.
Shared currency-icon presentation covers every Sanctuary wallet, inventory,
level/evolution/weapon costs and the existing First Fracture reward preview.
Fractalis also appears in the battle wallet, kill-loot burst, result summary
and revealed glossary drop pools. Existing balance IDs and accessible names
remain; currency counts, saving and drop mechanics are unchanged. Lycalis is
not added to enemy reward pools or the unavailable summoning system.

### Art-prompt style consistency

Audited259 Midjourney prompt blocks across the Art library against the original
character renderer. Currency prompts already match. Filled missing jewel-like
palette anchors in older examples/materials/scenery, restored explicit compact
proportions in the original example characters and evolved Heaven/Abyss slimes,
and replaced standalone weapon splotchy ink rendering with clean contours,
cel shading and painted highlights. Weapon anatomy, motifs, colors and3:2
framing remain. Mode scenery retains severe atmosphere, restricted palettes
and lighting; removed cinematic renderer wording. Abyss hourglass glass now
uses opaque painted facets, not background-visible transparency.
Names, species, equipment, evolution features, ratios and existing supplied
artwork are preserved. Same approved style reference400 for cutouts/200 for
scenery; actual URL is still unavailable. Shared style lock is documented in
Art/midjourney-character-style-prompt.md; regression checks in
tools/test_art_prompts.py cover every prompt plus currency/mode identity locks.

### Replacement Heart of the Shattered Void

New root image moved to Art/source/materials; former RGB and owner-alpha copies
archived under Art/source/replaced/heart-shattered-void-2026-10-05.
Canonical abyss-heart-shattered-void icon replaced without changing material IDs.
Offline mint/teal key removes background, openings and ground shadow; three
reviewed masks preserve cyan crystal facets. Targeted prepare_infusions.py
--assets export and review_art.py use the same helper. Original96-image intake
records retain the superseded copy's byte hashes; all other cutouts unchanged.
All28 Python art tests pass, including exact foreground/background samples,
padding/dimensions and reproducible exports.

### Infusion element restriction and cut-in timing

Owner corrected infusion bonus eligibility: Heaven only drops Infernic, Aquatic,
Tectonic, Efflorescent and Atmospheric Epic+ materials; Abyss only drops Voltaic,
Luminous, Ominous, Tranquilitic and Chaotic Epic+ materials. Shared
infusionElements(mode) drives both actual rolls and glossary eligibility.
Successful rarity rolls choose one of five equally; final per-element odds
are17%/13%/8%. Rarity success odds, stack sizes, unlock levels, specialty
materials and existing inventory remain unchanged. Earlier all-element claims
below are superseded.
All portrait cut-ins now3500ms at1x, with stationary12%-90% reading hold and
final10% fade in place instead of slide/scale exit. Speed1/2/3x still applies;
ornate ultimate framing remains.

### 35-floor dungeons and loot scaling

All ten elemental dungeons and both infusion modes have35 floors. Adventure
remains endless. Linear enemy levels reach the sameLv120 final stat/ability
endpoints at35; material unlock enemy levels, upgrade costs and affinities remain.
Shared content/loot-random.ts curves drive actual rewards and Creature Glossary.
Elemental final per-enemy stacks: Seed80-160 guaranteed, Bloom40-80 at98%,
Shard20-40 at90%, Crest12-24 at80%, Heart6-12 at60%, Soul3-6 at35%.
Infusion final specialty stacks80-160/40-80/24-48; supplemental rarity odds
85%/65%/40%, stacks12-24/6-12/3-6, one random mode-associated element per successful rarity.
Currency scales5-10 atLv1 to100-200 atLv120 across every mode. Rare types remain
chance-based, not guaranteed all-pool drops.
Walletv3 migrates v2 stage unlocks approximately by enemy-level progress,
retaining balances, materials, character progress, receipts and discoveries.
Load does not write; savingv3 never remaps again. Quit/replay/reload reset Gauge;
Continue retains it. See gameplay-and-elements.md for exact curves and gates.
Older handoff entries below are historical; their50/25-floor and flat-loot
descriptions are superseded by this section.

Validation: all411 tests across42 files and production build/typecheck pass.
Isolated browser verified all12 selectors end at35, actual Stage35 Voltaic
saved rewards (100 Fractalis plus80/40/20/12/6/3 material minima with forced
successful rolls), final completion, glossary odds/ranges, v2 read-only migration,
v3 persistence and reload. No page errors; owner's save untouched.

### Shatter Gauge within-run carry

Owner chose carry through turns/waves/next stages in the current run only.
Turns and Adventure waves already preserved Gauge. New game/battle.ts nextStage
now carries the same character's Gauge into elemental/infusion stage continuation
(bounded by capacity), retaining full-health/fresh-cooldown encounter behavior.
BattleView Continue routes through this helper; results/announcements explain carry.
Quit, mode switch, retry/replay and reload still reset Gauge; no save schema change.
114 focused tests and build pass. Isolated browser Continue retained65.5 Gauge
and full HP at Stage2 in both Galvanic Field and Abyss.

### Galvanic Field

Archived all16 original root PNGs; exported eight enemies and six Voltaic icons,
and copied the opaque banner/arena unchanged. Pack now drives all50 stages,
Gameplay banner, combat/cut-ins, loot, Inventory and Creature Glossary.
Individual reviewed green/teal keys clear backgrounds/internal openings.
Bloom/Seed/Soul wider cleanup removes spill; source-coordinate masks protect
Seed painted green metal highlights and Soul crystal facets.
Re-export: `python tools\prepare_dungeons.py --elements voltaic`.
Review tooling shares the same processing; authoritative owner-alpha bypass
and previous City settings remain unchanged.

Each enemy has a distinct named strike in dungeon-art.ts. Shared level50
Overdrive/heavy boss Last Ruin rules and stage/drop balance remain unchanged.
City integration tests were generalized to supplied-dungeon-integration.test.ts
and now cover both packs, all50 stages, final ultimates and glossary drop gates.
Facing metadata reflects reviewed gaze/weapon direction; only presentation flips.

Validation:107 targeted TypeScript tests,27 Python art tests and production
build pass (existing chunk warning). Browser decoded all16 assets and rendered
all eight enemy tiers with the correct arena and skill labels. Isolated live UI
cleared Stage1, displayed exact saved Voltaic Seed/Fractalis rewards, recorded
Sparkpip defeat, unlocked/continued to Stage2 and retained identical account
data after quitting/reload. Inventory's six icons and Glossary's eight portraits
decode and fit at actual320/390/1280px with no horizontal overflow.
Owner saves were not modified; hidden-tab harness finished finite animations.

### City of Heaven

Moved all16 root PNGs into Art/source, preserving original bytes. Eight enemies
and six Tranquilitic materials now use canonical runtime filenames; banner/arena
are byte-identical landscape copies. Registered pack drives Gameplay, all50
stages, cut-ins, loot bursts, Inventory and Creature Glossary without save changes.
Every enemy has a unique named strike; shared level50 second-skill/boss-ultimate
rules, stage growth, boss cadence and existing per-enemy drop chances remain.

Reviewed pink color keys remove outer/interior backgrounds. Crest uses an
orange border-connected key to protect gold; Shard narrow hue preserves ribbons;
Seed wider hue clears pale pink glow spill. Alpha-supplied assets remain exempt.
Re-export: `python tools\prepare_dungeons.py --elements tranquilitic`.
Tests cover all50 encounters, skill names/counts, real Sovereign ultimate,
glossary drop gates/material icons, sprite margins and original landscapes.
Validation:98 targeted TypeScript tests and production build pass (existing
chunk warning);26 Python art tests cover original owner-alpha and City keying.
Review tooling regenerates City sprites with the same exporter helper.
Browser decoded all16 assets and rendered every enemy tier without missing
images/errors. Isolated live UI cleared Stage1, displayed Victory and exact saved
Seed/Fractalis stacks, unlocked/continued to Stage2, recorded Hushbud defeat and
retained identical account data after quitting/reload. Hidden-tab test harness
finished finite animations only; owner saves were not modified.
Inventory displays all six material images and Glossary all eight portraits;
both decode and fit at actual320/390/1280px without horizontal overflow.

### Readable menu artwork

Character rail art grew24->52px (20->48px small phones); detail ability art34->
80px (72px small phones); character upgrade materials32->64px, inventory48->
64px, glossary loot28->56px. Menu/navigation SVGs now32-34px, bottom navigation
30px on mobile. Desktop character rail220px; minimum68px buttons and two-column
groups on small phones preserve labels instead of squeezing larger icons.
Stat grids auto-fit110px cells so the wider rail does not split large numbers.
Character portrait, gameplay mechanics and battle icon sizes unchanged.

Validation:31 menu/icon tests and build pass (existing chunk warning). Browser
checked all nine character tabs, Home and Inventory at actual320/390/780/1280/
1600px: no horizontal overflow, rail art48/52px and detail art72/80px measured.

### Readable elemental cut-ins

Owner chose longer base timing while retaining1x/2x/3x scaling. Skills now last
4000-4400ms and ultimates5600-6000ms at1x, based on existing visual power. Entry12%,
stationary reading hold78%, exit10%; removed copy drift/zoom during the hold.
At3x, even base skills hold1040ms; max-power ultimates hold1560ms.

Ribbon now has unit-element gradients, diagonal energy bands, engraved rings,
diamond crests and bright edge rails. Ability name is large serif centerpiece;
caster and action tier are subordinate, with explicit Enemy Skill/Boss Ultimate.
Ultimate framing is richer; enemy layout remains mirrored. Adjusted portrait
framing to retain recognizable faces rather than magnifying only the torso.
Removed battle-ui.css's plain rectangular copy backing/neutral ribbon override.
No battle math, reward, speed-storage or reduced-motion changes; impact still
waits until reveal ends. Runtime VFX are not subject to cutout prompt no-glow rules.

Validation:39 focused tests pass; production build passes with existing chunk
warning. Browser checked150 character/boss/ability layouts over actual320/390/
780/1280/1600px with no copy clipping/overflow. Live ultimate at1/2/3x measured
6000ms base duration, playback rates1/2/3, holds4680/2340/1560ms; no damage numbers
before reveal, Victory after completion, zero leftover effects. Isolated contexts.

### No-glow cutout generation

Owner confirmed cutout art only; arenas and banners retain their scenery effects.
All 230 character/enemy/item/icon/weapon prompts explicitly prohibit glows and
glowing visual effects. Positive emissive wording was replaced, not just masked
by a negative list. Powers now use opaque solid-color lines/ribbons/rings/shapes
with crisp edges; luminous eyes/cores/blades and translucent fins/wings/effects
use painted color instead. Normal cel shading and painted highlights remain
non-emissive. Bigger effects and ornamentation still communicate higher power.

Names (including Luminous element/materials), colors, weapons, evolution motifs,
background swatches and generation flags remain. One exclusion list includes
glow/glowing effects/light bloom/soft aura/haze/light spill. "Bloom" flower names
and open halo geometry remain; never ban flowers or all rings indiscriminately.
The shared contract and pack prose supersede earlier permission for subject glow.
Existing PNGs, export tooling and in-game combat VFX are unchanged.
Audit passed: all 230 cutouts contain the explicit no-glow/solid-effect rule,
with no remaining positive glow/luminous/radiant/translucent/mist/neon wording.
Names, swatches and generation flags are preserved; all27 scenery prompt blocks
remain byte-identical. Whitespace checks pass; no code/build change required.

### Sanctuary-matched battle UI

The shared `presentation/battle-ui.css` now gives all battle scenes the main
menu's serif hierarchy, framed charcoal surfaces, white controls and restrained
unit-element accents. Toolbar has a Last Light diamond/wordmark and grouped
controls; encounter headings label Adventure/dungeon/infusion alongside progress
and a high-contrast turn button. Names/readouts are joined compact cards, with
320px maximum width instead of unbacked full-unit-width HP bars. Damage numbers,
turn cues, ability controls, results and cut-in copy follow the same typography.

BattleView markup and main toolbar are shared by all 13 battle types. No math,
rewards, animation timing, art sizes/facing, gestures or save behavior changes.
No bottom action bar. Strong field selectors intentionally override the older
transparent-readout rules; continue edits in the scoped battle stylesheet.

Validation: 46 focused presentation tests pass, including new shared-chrome
checks for Adventure, ten dungeons, Heaven/Abyss, victory and defeat. Build passes
with the existing nonfatal chunk warning. Browser checked all 13 modes at actual
320/390/780/1280/1600px: no horizontal overflow/off-screen cards; End turn remains
at least44px. Settings and expanded Combat/rules/log/results fit mobile.
Browser uses isolated contexts; owner save untouched.

### Owner-transparent art intake

Matched all 96 root timestamp PNGs uniquely to existing assets and visually
checked all matches. Renamed them to canonical in-game filenames under
`Art/source/cutouts/{characters,enemies,materials,abilities}`; archived PNG bytes
are unchanged. Replaced the matching runtime exports, keeping existing asset IDs,
URLs, portrait helpers and facing metadata. [Intake manifest](../Art/cutout-intake.json)
records names, sources and SHA-256; [review manifest](../Art/matte-review.json)
now identifies owner-supplied alpha sources.

All four exporters and cleaned review previews prefer these sources and do
only alpha-bounds trim, uniform sizing and transparent padding. **Do not run any
background removal or historical pocket/foreground masks on supplied cutouts.**
No screen uses runtime background removal; intentional silhouettes, shadows
and facing effects remain. Historical originals are preserved, but the earlier
complex-character cleanup below is superseded for replaced art.

Base Flora, base Tizu and the archived Infernis Heavy Attack icon were not supplied
and remain unchanged. No timestamp PNGs from this batch remain in the root.
See [current art policy](art-workflow.md#owner-supplied-transparent-replacements-current-policy).

Validation: 19 Python art tests pass, including all 96 archived source hashes,
pixel-exact runtime normalization and regeneration with matte removal disabled.
All four exporter commands also regenerated the 96 replacements with the matte
remover disabled, retaining identical runtime hashes. 47 focused TypeScript art/
icon/facing tests and the production build pass (existing chunk-size warning).
Browser decoded all 96 assets: 16 characters, 41 enemies, 24 materials, 15 icons.
Isolated Home/Character/Inventory/Glossary/battle/cut-in checks loaded the shared
art, retained Evo6 where appropriate, and reported no artwork masks/blending or
runtime errors. Tests used isolated browser saves, not the owner's save.

### Prompt background contract

All 230 character/enemy/material/icon/standalone-weapon prompts now start with
the actual subject instead of the lengthy background-first specification.
Removed "choose subject colors that visibly clash" and the requirement to
reserve a hue by changing foreground highlights/prismatic accents. Identity,
weapons, palette, evolution features and style remain primary and unchanged.
Each prompt ends with one short plain solid-color, flat unlit backdrop clause;
magic now uses non-glowing solid-color shapes as required above. Background-scoped exclusions
are concise rather than repeated. Existing swatches remain; all nine Abyss
cutouts use green #00FF00, without describing it as neon lighting.
Generic templates use `[BACKGROUND COLOR]` / `[BACKGROUND HEX]`.
Every prompt pack links to
[the shared contract](../Art/cutout-background-contract.md).
Owner confirmed cutouts only:27 scenery prompt blocks remain byte-identical.
Generation flags and one exclusion list per prompt remain preserved.
If a generated subject is correct but the backdrop has a gradient, edit only
the backdrop with a reviewed mask and flat fill rather than compromising the
subject. Prompt wording cannot guarantee generator compliance.
Prompt audit passed: 230 subject-first cutouts, nine unchanged Abyss green
swatches, 27 byte-identical scenery prompts, preserved subject descriptions/
exclusions and generation flags, one background clause and one exclusion list.
Originals/runtime PNGs are untouched. Existing white-matte exporters do NOT
support these new keys automatically; implement explicit per-asset chroma
processing or a reviewed alpha mask when new art arrives. Do not blindly erase
white highlights or assume a generator guarantees exact flat hex pixels.

### Complex artwork follow-up

The supplied Infernis Evo6 screenshot exposed erased pale feather tips and
opaque enclosed halo/hair/ground-ring patches. Corrected source-normalized
foreground protection and interior seed points, without changing global matte
thresholds. Also checked high-complexity character originals and corrected
Tizu Evo5's lost wing highlight/halo hole and Flora Evo6's halo-adjacent gaps
and eroded lower pale feather. Regenerated only these three runtime PNGs;
originals remain untouched. Art/matte-review.json now records protection
polygons alongside seeds/hashes. Do not treat prior small contact-sheet review
as proof every complex edge is perfect; compare source and dark cutout at
original resolution. See [workflow](art-workflow.md#complex-character-follow-up).

Validation:18 Python art tests pass, including precise source-resolution
transparent-hole/preserved-RGB assertions and all sprite sizing/padding
contracts. Browser decoded all three updated960px exports through their normal
portrait helper and localhost URLs.

### Battle speed

The toolbar now includes a native 1x/2x/3x Speed selector available during
presentation. `presentation/battle-speed.ts` validates/persists the separate raw
`last-light.battle-speed` key; absent defaults1x, invalid/read/write failures are
visible and failed writes preserve the previous rate. Root metadata/CSS and a
live event update tracked BattleView animation playback rates. Disposal removes
the listener. Entrances, portraits, attack motion/effects, numbers, death/loot,
turn cues, HP transitions and result reveals scale together. Idle/readiness and
menu/loading transitions do not. Reduced motion still disables movement.
No engine/reward/RNG/cooldown changes; completion gates still await presentation.
See [speed contract](free-battle.md#battle-animation-speed).

Validation:40 focused speed/presentation tests and production build pass.
Browser checks at actual320/390/780/1280/1600px show a44px speed target and no
overflow. Choice persists across Settings/reload. At1/2/3x, a900ms animation has
900/450/300ms effective duration; ultimate CSS particles810/405/270ms and
stagger72/36/24ms. Identically seeded ultimates yield identical HP/enemyHP/RNG
state, show portrait/attack/number/loot phases and leave zero temporary nodes.
Reduced motion still omits portraits/impacts; a simulated storage-write failure
keeps the previous3x selection/rate and displays an explicit error.

### Neutral battle UI polish

Battle-specific final styling lives in `presentation/battle-ui.css`, imported
after cinematic/cut-in styles. Quit and Settings now have compact icon/label
controls instead of plain underlined text. The currency pill, turn button,
Combat/rules/log disclosures, action availability, result actions, gesture
labels and portrait copy use crisp neutral typography and consistent charcoal
surfaces. Settings uses rounded preference cards, readable native selects,
full-width save buttons and explicit focus/saved feedback, not legacy blue/gold.
Small-screen toolbar wraps without restoring a bottom bar. Unit readouts stay
floating and art scale/formations remain unchanged.

BattleView exposes `aria-busy` for entrance/presentation, alongside its existing
input gating. No combat math, loot, storage, retired hotkeys or reduced-motion
behavior changes. Continue editing this scoped stylesheet rather than adding
more overrides to the legacy global theme.

Validation: 28 targeted presentation/selection-key tests and production build
pass. Isolated browser checks at actual 320/390/780/1280/1600 CSS pixels found
no horizontal overflow in open Combat/rules/log panels, Settings or Victory.
Toolbar/disclosure/Settings controls are at least 44px. Saved selection keys
and closing Settings preserve the field's HP/gauges. A live Evo6 ultimate
disables battle controls, displays readable cut-in labels and then a Victory
sheet; finite effects clean up with zero runtime errors. Owner save untouched.

### Rechecked combat artwork orientation

Reviewed all18 character forms and41 enemy images individually using dark
contact sheets and full-size checks for ambiguous poses. Corrected17 authored
directions in unit-facing.ts: directional spear/bow poses, Kappa/Regent/
Satyr/Cyclops/Gargoyle/Mantis, Heaven spear/sword poses and later Abyss blades.
Allies face left, enemies right; neutral frontal art stays unchanged rather
than inventing side-facing artwork. Field/cut-in images share metadata; image-only
scale survives wrapper attacks, entrance, idle and portrait motion.
Source/export PNGs untouched. Reviewed overrides documented in art-workflow.md.

### Portrait skill cut-ins and boss ultimates

Characters pop in their current-form portrait/name/ability before skills, including
heals/shields; high-level enemies(Lv50+) get mirrored cut-ins. Ultimates use taller
ornate sigils/portraits and longer reveal. No dismissal/pointer interception, no
extra damage or reward randomness. Reduced motion bypasses; tracked WAAPI plus
finally/disposal cleanup. Customize battle-cutin.ts/.css.

Every real enemy has1 skill below50 and2 from50. Shared enemy-skills.ts:
primary every3 ordinary/2 boss; ordinary second Overdrive every5 at1.25x primary;
boss second Last Ruin ultimate every6 atmax(2.6,primary*1.65). Secondary/ultimate
has priority on schedule collisions, never executes an extra attack. Adventure
now has authored primaries too; early dungeon enemies no longer lack skills.
Typed enemySkills replaces singular enemyAbility. Attack events carry actual
skill action/abilityName and enhancedAttack; rendering/ultimate effects consume
metadata instead of parsing names. Collapsed rules show live enemy schedules.
All three starters still pass3-seed solo final dungeon/Heaven/Abyss boss clears.
Validation:331 game tests, production build, editor diagnostics and whitespace
checks pass. Isolated browser verified all three starter skill/support/ultimate
cut-ins use Evo6 art and actual names, both mode bosses show ultimate cut-ins,
no temporary nodes remain after playback/disposal, no runtime errors.
Long boss names fit320/390/780/1280/1600px without overflow. Reduced-motion
boss ultimate resolves real damage/next turn with zero portrait cut-ins.

### Victory/Defeat results and nonblocking turn cues

Owner clarified Victory is only for cleared encounters, not ordinary turns.
Raised nonmodal sheet shows actual per-kill currency/material totals, Continue/
Quit; final Stage25/50 returns Gameplay, defeat Retry/Restart/Quit.
Display follows final loot presentation; focus heading, View battlefield to
dismiss, header View victory/results to reopen. Occupies separate layout space
instead of covering field readouts. Plain drop-text feed and old report removed.
BattleSession.stageEvents tracks every activity (including Adventure), resets on
next encounter, independent of truncated log; summaries group materialID and
deduplicate reward source. No storage writes/loot rerolls/extra awards.
Settings preserves transient dismissal and summary. Reload ends run as before.
Brief Enemy/Your turn indicators use tracked WAAPI with static reduced motion,
ignore pointers and remove on disposal. Quit callback uses existing navigation/
loading; restart and continue retain gameplay/save contracts.
Customize presentation/battle-results.ts and battle-results.css.
Validation:323 tests and production build passed. Isolated real UI cleared
Adventure, verified no Victory on ordinary turns and captured Enemy/Your turn
cues; reward totals matched wallet and Continue granted nothing extra.
Dungeon Stage1 showed exact Fractalis/Seed totals, unlocked Stage2, retained
summary through Settings and Quit returned Gameplay without modifying rewards.
Result layout never overlaps arena and has no horizontal overflow at320/390/
780/1280/1600px. Final-mode/defeat fixtures verified return/retry options.

### Progression-scaled attack cinematics and minimalist battle UI

Attack flair now derives from actual combatant level/form, independently of combat.
Final Normal:20 sparks/4 rings/6 rays; Last Flare32/5/12 at2.25x effect size.
Starter elements and Heaven/Abyss have distinct layers/trails; skills and scheduled
enemy abilities intensify. Bounded work, two-axis lunges, reduced motion bypass,
tracked WAAPI cleanup and temporary effect-node removal; rewards still commit first.
Tune presentation/battle-effects.ts and battle-cinematic.css.

Bottom action bar removed. Character drag/right-click primary; collapsed Combat
menu supports touch/keyboard Defense and all actions. Small header End turn/
continue, collapsed rules/replay/log. No attack/Defense/ability or global Space
shortcut. Selection-only settings preserve legacy custom C/T equivalents, ignore
retired action fields without rewriting. Space cannot be assigned.
Mirrored staggered triangular formations on desktop, edge-staggered stacks mobile;
boss/solo scale preserved. Historical bar/hotkey notes below are superseded.
Validation:319 game tests and production build passed. Isolated live UI checks
confirmed former attack keys/Space do not advance a turn, touch Defense and drag
still act, no action bar/kbd badges, no horizontal overflow at320-1600px.
Animated fixtures verified all starter/Heaven/Abyss effects and zero leftover
effects/trails/numbers/loot; reduced motion creates no attack effects.

### Endgame curves and Creature Glossary

Owner approved ~100k characterHP,200k ordinary enemyHP and400k bossHP.
CoreG=(1+.03*level)^3*1.45^(evo-1); HP/Attack/Elemental useG, DefenseG^0.7.
Percentage/coefficients useP=1+.003*level+.05*(evo-1), with bounds; flat
shield/heal usesG. Saved progress resolves immediately, no migration/cost changes.
All enemy activities accelerate from twice former initial growth toward shared
Lv120 endpoints; max Attack4k ordinary/6k boss, Defense1500/2250. Three starters
tested against final elemental/Heaven/Abyss bosses across three seeds without gear.
Adventure levels plateau120 while waves continue.

Home Creature Glossary catalogs every form with unseen black silhouettes,
seen color/name, defeated per-stage loot disclosure and activity filter.
Missing enemy art uses explicit neutral placeholders. Walletv2 creatures records
seen on entry and defeated atomically with kill rewards. Old saves default empty;
prior encounters are not inferred or invented. Stages/gates/chances unchanged.
Infusion odds display per-element chance plus overall rarity draw explanation.
Customize content/creatures.ts, stat-growth.ts and progression.ts.
Validation:316 game tests, production build and editor diagnostics pass.
Isolated browser checks confirmed all97 fresh entries silhouette/lock, entry-only
discoveries, real UI kill unlock, reload persistence, filter/stage selection,
and opened long infusion pools without overflow at320/390/780/1280/1600px.
No owner saves changed. Historical additive/linear growth notes below are
superseded by D-052; retain historical caps/costs/migration decisions.

### Per-image cutout audit

Reviewed all99 cutouts (18character/41enemy/24material/16ability) on dark sheets
and inspected suspected pockets against sources.32 targeted exports clear leg,
bow, thorn, ribbon and effect-loop background without globally erasing whites.
tools/matte_regions.py owns normalized pocket seeds, shared by all export paths.
Infernis Evo6 preserves pale wings with235 interior threshold; Infernic Bloom
uses215/50 warm matte; Efflorescent Soul uses170/100 plus foreground protection
for its tinted backdrop. All99 source hashes unchanged; other67 exports unchanged.
Art/matte-review.json records the completed audit and hashes. review_art.py can
generate sheets, numbered candidates and isolated cleaned previews. Candidate
whiteness is never an automatic background classification.

### Uncluttered Home centerpiece

Home removes the entire upgrade dock/caption and decorative ring, retaining
character identity, all seven stats, team/lore/activity links. Team entry now opens
Squad rather than an upgrade. No Home data-character-tab controls remain; upgrades
live in Character. Wider central column allows720px desktop art,620px tablet;
phone sizes stay width-bounded. Verified1600/1280/780/390/320px with no horizontal
overflow, no ring/upgrade controls and all seven stats retained.

### Cinematic Character Upgrades

character-screen.css now uses navigation / large central character / detail
panel instead of thumbnail/sidebar plus oversized data panel. Elemental aura,
halo/stage light, current evolution title, name/role/progress emphasize identity.
Desktop up to600px artwork is viewport-height bounded; details independently
scroll. Tablet/mobile reflow with portrait first; all nine selectors and atomic
upgrades/celebrations remain, preserving the portrait DOM.
The former compact100px mobile identity layout (D-044) is intentionally superseded
on this screen by the owner's cinematic direction.
Validation:45 targeted hub/celebration/form/infusion tests and production build
passed. Isolated browser checks covered all3 characters across5tabs at actual
1600/1280/780/390/320px: no horizontal overflow, stable portrait DOM, >=44px
navigation targets and updated Evo6 title after a form change.

### Larger art, protected wings and enemy-death loot

Supersedes previous sizing below: Home500px desktop/400px mobile, battlefield
Evo6/form6 scale2.7x and final bosses3.1x. Lane maximum580px, short desktop
base155px. Actual rendering at1280x750: final boss480.5px, Evo6 ally418.5px;
small mobile remains lane-bounded with no horizontal overflow.
Infernis Evo6 source-aligned pale wing masks prevent connected white feathers
from being removed; original unchanged, runtime regenerated and reviewed.

battle-loot.ts renders only actual reward events. Enemies fade280ms, disappear,
then show quantity/icon/rarity beams at their feet and auto-collect independently
over850-1849ms per stack, with75-135% sizes and randomized scatter.
Approved plentiful balance: guaranteed Seeds/specialties roll base..2*base;
successful higher-rarity stacks roll1-2. Existing rarity gates/odds and Fractalis
are unchanged. Quantity draws use reward RNG after eligibility/element draws;
cosmetic randomness never changes saved rewards.
Reduced motion uses a static650ms receipt. Rewards still save at kill resolution
before visuals; no new wave reward, collection transaction or click requirement.
Disposal/animation cancellation cleans transient loot. Isolated browser checks
confirmed exact specialty/bonus drops, hidden corpses, cleanup and responsive sizing.
Validation:301 Vitest tests across31 files,12 Python art tests, production
build/typecheck, editor diagnostics and whitespace checks passed. Browser checks
used isolated contexts and did not modify the owner's wallet.

### Battlefield visual progression

Battle art now scales1x->1.9x by character evolution/enemy form, with0.25x
extra for bosses (final2.15x). Enemy formations use actual unit count; a boss
no longer sits in one of three small columns. Shared battle-scale helper reuses
validated encounter tier metadata. PNGs and combat stats are unchanged.
At1600px final Abyss boss artwork measures398px and Evo6 character352px;
mobile sizes are lane-bounded. Verified isolated rendering at1600/780/390/320px
without horizontal overflow;69 targeted tests and build passed.

## Playable Heaven/Abyss (D-050)

- All22 supplied originals preserved byte-identically; runtime enemies/items
  processed by tools/prepare_infusions.py, landscapes copied unchanged.
- content/infusions.ts owns six forms,25 stages80->120, bosses every5,
  stats/strikes, specialty definitions and deterministic loot.
- Stage selectors/entry/arena/next/replay/final-clear/report all use the existing
  battle, activity curtain and entrance machinery. Old elemental/Adventure paths
  remain; no captured creatures or automatically evolved enemies.
- Walletv2 accepts six specialty IDs, optional infusionStages (old saves default
  empty), optional character weaponRank (default0); atomic transactions preserve
  rank and guard stale upgrades. Stage25 is the cap.
- Weapon ranks1-10 cost100R Fractalis/5R matching weapon items, +2% grown Attack
  per rank. Evo4->5 adds5 evolution items;5->6 adds10. All Evo5/6 levels add1
  specialty leveling item, including preserved levels below80.
- Specialty yield1+floor((stage-1)/8), weapon/evolution/level from1/9/13.
  Epic15%/Legendary6%/Omnic2% from1/13/22, independent any-element rolls.
  All current starters are Heaven-affiliated; Abyss spending mapping covers future
  Voltaic/Luminous/Ominous/Tranquilitic/Chaotic characters, not newly granted units.
- Historical D-048 disabled/proposed notes below are superseded by D-050.
- Validation:282 Vitest tests passed across29 files;10 Python art tests passed.
  Build/typecheck, editor diagnostics and whitespace checks passed. Original22
  PNG hashes verified at intake; enemy/material contact sheets reviewed.
  Chalice uses an explicit warm-ivory matte tolerance while preserving enclosed
  white art and supplied decorative framing; other exports retain default tolerance.
  Localhost responds at http://127.0.0.1:5173/LastLightGame/; all22 new mode
  runtime assets return HTTP200.
  Browser title loaded, but intermittent page-handle failures blocked isolated
  live gameplay verification; no end-to-end browser playthrough is claimed.

### Slime identity clarification

Heaven/Abyss art tables, headings and all evolved enemy prompts retain the
permanent name after the form title: "<title>, Dawnthorn Slime" or
"<title>, Wraththorn Slime". These are stronger forms of the same named slime
across stage/level progression, not separately named enemies. Suggested asset
IDs, six-form counts, material/environment prompts and runtime gates unchanged.

Latest naming clarification supersedes the earlier rank ladder: prefixes are
poetic form titles, not Knight/Templar/Ascendant/Seraph/Sovereign enemy classes.
Abyss: Starless Murmur, Ruin's Awakening, Hunger Beyond the Veil, Worldfall
Reverie, The Night Without End. Heaven: Scarlet Benediction, Gilded Reproach,
Thorns of the First Light, Crimson Reckoning, The Dawn Without Mercy.
Each retains ", Wraththorn Slime" or ", Dawnthorn Slime". Proposed enemy asset
IDs now match these titles and the supplied runtime assets.

## Minimal allied battle readouts (D-049)

- unitReadout now shows allies only HP/Defense/Shatter Gauge throughout combat;
  enemies stay HP/Defense only. Names/roles remain separate from stat readouts.
- Removed attack/crit/elemental/shield/status labels; full menu stats, action
  availability, Defense/ultimate visual cues, floating effects and log retained.
- Impact HP updates no longer append a Shield suffix. Presentation shield ledger
  removed because no shield readout is rendered; authoritative shields unchanged.
  Damage event shieldRemaining metadata retained for compatibility.

## Heaven/Abyss mode art packs (D-048)

- Art/gamemodes contains a shared index plus Soar to Heaven and Delve into the
  Abyss packs. Each has six total forms (slime base + five evolutions), three
  specialty material prompts, one3:1 banner and one16:9 arena:22 prompts total.
- Preserve chibi/eyes-only style but escalate intricate thorn regalia, weaponry,
  halos/wings and threatening stance. Heaven white/black/red/gold; Abyss
  black/white/purple/hot pink. New slime lines supersede older wisp concepts.
- Specialty material purposes: weapon, evolution, late-form leveling, retaining
  existing five-element affinity splits. Owner explicitly selected leveling
  materials throughout Evolution5/6 rather than only characterLv81+.
  Both modes can additionally drop any-element Epic/Legendary/Omnic materials.
- Stage allocation/drop unlocks are marked proposals. No rates, quantities,
  recipes, maximum enemy level or weapon stats approved. Runtime modes remain
  disabled with historical wisp/four-tier metadata; no live costs/save IDs changed.
  Creature consumption remains deferred. Art naming is not player fodder evolution.
- Heaven art-pack display title uses owner's "Soar to Heaven"; existing disabled
  runtime label "Soar into the Heavens" and stable heavens ID remain unchanged.

## Home and shared idle portrait pulse (D-047)

- Home no longer displays passive summaries or Passive/Ability1/Ability2/Last
  Flare shortcuts. Five identity/growth/equipment shortcuts remain, repositioned
  around the showcase. All seven stats, roles, lore and activity links remain.
- Shared portrait markup wraps all menu art in character-idle (5s, 1->1.025->1).
  Selection/Home/team/Character/Squad and next-form silhouettes pulse, while
  nearby labels stay stationary. Team50px and Squad220px sizing is preserved.
- Upgrade celebration CSS now targets the nested image; idle wrapper movement,
  image facing scale and celebration transform remain separate. Existing
  battlefield idle behavior is retained. Device/game reduced motion disables
  every pulse; silhouettes remain black and bounded.
- Earlier Home passive/icon notes are superseded. Live browser verification was
  attempted but blocked by the recurring page-handle connection issue.
- Validation: 49 targeted hub/icon/character-art/facing/celebration tests passed,
  build/typecheck passed, editor diagnostics and whitespace checks clean. Tests
  verify no Home ability images/shortcuts, five retained shortcuts, preserved
  Character ability mappings and shared idle markup for all eighteen forms.

## Activity loading and fight entrances (D-046)

- activity-transition.ts mounts a black overlay outside #app, with bottom-right
  Loading!/preparation progress. Cover/render/decode/reveal, input inert, explicit
  artwork errors/12s timeout, cleanup and heading focus. Concurrent triggers share
  the active promise. Device/game reduced motion skips fades and uses static text.
- Main navigation, dungeon entry and cross-page Character shortcuts use it.
  Character tabs and Gameplay category filters remain instant; unavailable
  activities remain unchanged.
- BattleSession.entrancePending is transient. Newly created sessions, next waves/
  stages and replays wait for the curtain, slide full enemy units from the left
  and allied units from the right, then unlock controls. Positions start beyond
  viewport bounds, duration650ms plus70ms per unit. Existing facing/idle/impact
  wrappers stay independent. No turn, damage, reward or save mechanics changed.
- Busy/pending guards cover hotkeys, buttons and gestures; completed entrances
  do not replay on settings reconstruction. Destroy cancels tracked animation;
  animation errors report explicitly and retain encounter state.
- Browser verification attempted in isolated context but page handles remain
  unavailable. No live visual timing verification is claimed.
- Validation: targeted loading/entrance/impact/auto-turn tests passed, including
  cover-before-render, decode gating, duplicate triggers, rejected entries,
  artwork failure/timeout cleanup, viewport-edge starts, control locking through
  all slides, reduced motion, disposal and animation errors. Build/typecheck and
  editor diagnostics passed; existing bundle-size warning remains nonfatal.

## Saved upgrade celebrations (D-045)

- Upgrade handler calls celebrateUpgrade only after upgradeCharacter commits,
  updateCharacterTab refreshes the owned form, and wallet labels update.
  Level: short pulse/ring/six sparks. Evolution: longer reveal/ring/twelve sparks,
  both using the selected character's elemental color and a destination label.
- Temporary overlays do not intercept input or rebuild portraits. A per-portrait
  cleanup replaces previous effects and clears all classes/timers after 1.8/2.4s.
  Device/game reduced motion shows static success text; CSS also handles a motion
  preference change during playback. Existing facing scale remains intact.
- Finished level/evolution panels now retain upgrade-result so reaching a cap/
  final form reports successful saves normally, not through the error surface.
- Validation: 50 targeted celebration/hub/account tests passed and build/typecheck
  passed. Tests cover all three identities, distinct effects, repeat/cleanup,
  reduced-motion labels and explicit missing-portrait errors; existing account
  tests preserve rejected-save/transaction behavior. Live browser validation was
  attempted in an isolated context but blocked by the page-handle connection issue.

## Compact Character screen (D-044)

- Two-column desktop layout: compact owned identity/grouped navigation, broad
  details. Character/Growth/Combat group all nine original destinations.
- Overview groups Survival/Offense/Resource stats and uses a two-column
  passive/ability grid. Level/evolution separate benefits from resource/payment
  information; all seven deltas, real costs, gating and silhouette are preserved.
- Equipment separates Master/eight artifact slots. Unimplemented weapon/ability
  upgrades show current effects and explicit availability, not placeholder
  comparisons. No new upgrade mechanics, transactions or save changes.
- character-screen.css is imported after the shared styles and scoped to the
  Character hub. Phone identity is 100px; grouped navigation and responsive cards
  keep all information accessible without nested scrolling or fixed-height cuts.
- Browser access briefly recovered: isolated checks for all three starters,
  five representative tabs and actual 1280/780/390/320px widths reported no
  horizontal overflow, stable portrait DOM, 44px navigation targets and no page
  errors. At 1280px, each checked hub was 538px high with a 966px detail column.
  Final narrow-screen stat arrangement was compacted afterward; subsequent
  browser calls lost their handles again, so screenshots/before-after scroll
  measurements and that final visual refinement are not browser-verified.
- Final validation: 35 targeted hub/icon/role tests passed, build/typecheck passed,
  editor diagnostics and whitespace checks clean. Tests cover grouped navigation,
  all four combat cards, seven upgrade deltas, resource labels and unavailable
  upgrade states alongside existing costs, silhouettes and equipment contracts.

## Supplied Tizu/Flora ability icons (D-043)

- Ten root PNGs moved byte-identically into Art/source/abilities/tizu and flora.
  Runtime 256px RGBA exports use 224px content/16px padding via prepare_icons.py.
  The exporter now derives character source folders from IDs and supports --assets.
- Shared abilityIcons maps five active icons per starter; all existing Home,
  Character tabs/overview, battle controls/passive and hold guide consumers now
  use Tizu/Flora artwork. Defense is still text-only; no effects or balance changed.
- Earlier "icons not supplied" notes below are historical and superseded here.
- Validation: 30 targeted icon/gesture/hub tests and eight Python art tests
  passed; build/typecheck and editor diagnostics passed. All ten source hashes
  match intake. Reviewed all ten exports together over dark backing; supplied
  framing and enclosed white details remain preserved. Live browser inspection
  remains unavailable due the existing page-handle connection failure.

## Character role medals (D-042)

- Starter metadata owns role labels: Infernis Attacker, Tizu Tank, Flora
  Healer/Support. Shared character-role.ts renders decorative sword/heart/shield
  medals with readable text in selection, Home/team, Character, Squad and battles.
- Neutral, compact, transparent styling preserves the uncluttered battlefield;
  enemies retain only name/HP/Defense. No combat or save format change.
- Validation: 25 targeted role/hub/readout tests passed, build/typecheck passed,
  editor diagnostics and whitespace checks clean. Shared browser page still
  returns "Page not found", so live visual validation remains unavailable.

## Hit timing and health-bar easing (D-041)

- battle-health.ts snapshots pre-action HP, groups an attack's damage/heal/shield
  events and applies event-level health changes. BattleView updates HP text/bar
  targets at impact (normal180ms / ultimate360ms), not after the full turn.
- AoE hits update all targets together; burn/passive heal update at their event.
  Health bars ease width420ms; numbers appear immediately then pop/rise850ms.
- Damage events carry shieldRemaining; shield gains/absorption update correctly.
  Fractional HP, zero-HP fallen state, reward commits, auto-turns and saves remain.
  Reduced motion/error/disposal paths retain authoritative resolved state.
- Validation: the full regression suite and build/typecheck passed. Presentation
  timing test holds wind-up unresolved, confirms old HP, then releases
  impact and confirms updated HP/bar/number before return animations finish.
  Periodic burn metadata prevents same-source ticks being grouped into a skill's
  impact; a regression test covers the automatically advanced enemy phase.
  Browser page handle remains unavailable, so rendered easing was not verified.

## Field labels and combat feedback (D-040)

- Enemy labels show name, HP and Defense only. Enemy levels, attack/crit/elemental
  stats, shields, statuses and pending-art text are absent from field labels.
  Enemy mechanics/events remain unchanged; allies retain their readouts.
- Shared unit-readout.ts separates enemy/ally markup and formats fractional stats.
- Damage/healing/shield numbers use larger bright glow, critical emphasis and
  an 850ms gentle pop/hold/rise/fade. No opaque background.
- Inner unit-idle wrappers pulse living sprites 1x->1.025x over five seconds,
  staggered; fallen units and reduced-motion preferences disable idle animation.
  Attack wrapper and image mirroring remain independent.
- Validation: 11 targeted readout/guide/auto-turn tests passed, build/typecheck,
  diagnostics and whitespace checks passed. Browser tools continued returning
  "Page not found" even for a newly opened page, so visual validation remains
  unavailable; do not claim rendered animation checks passed.

## Ornate battle guide and field text (D-039)

- Holding left-click/touch on an available character opens a four-arm ornamental
  compass with arrows, skill labels, real gauge costs, dim unavailable actions,
  highlighted chosen direction and explicit reason/release status.
  Position clamps to viewport; all existing cancel/release/capture cleanup remains.
- Field labels, readouts, floating amounts, top/toolbar/reward/HUD/log text have
  transparent backgrounds and soft black blurred shadows. Controls retain
  faint translucent surfaces; sanctuary/Settings/report panels unchanged.
- No new icons/assets: Infernis uses supplied icons; other starters keep labels.
  Gesture thresholds, action legality, turns, rewards and saves unchanged.
- Validation: 20 targeted guide/gesture/automatic-turn tests passed; final
  build/typecheck, diagnostics and whitespace checks passed. Browser hold
  confirmed four arms and unavailable skills; computed field-label background
  is transparent with blurred shadows and no box shadow. Responsive pointer
  checks and guide screenshot were interrupted when browser page handles became
  unavailable; do not claim those checks passed. Owner wallet unchanged.

## Turn completion and visual direction (D-038)

- actAndAdvanceTurn resolves one player action plus one enemy phase when all
  living, non-recovering allies are spent. Support/Defense count; dead/recovering
  allies do not block. No retaliation after clear, no auto-stage advance and no
  repeated recovery skipping. Manual end-turn remains available.
- Combined ordered events/rewards commit atomically before presentation; low-level
  act stays single-action for existing tests. Burn rewards are included.
- Selected enemy glow has brighter layered white/element halos and readout borders.
- Per-art unit-facing.ts metadata mirrors opposing sprite directions only:
  characters left, enemies right, frontal poses unchanged. Applies to all portrait
  surfaces and evolution silhouettes; PNG originals/exports unchanged.
- Attacks animate a battle-sprite wrapper rather than overriding image mirroring.
  This also fixes animation of art-pending enemies without img nodes.
- Validation: 229 tests across 20 files passed, build/typecheck, diagnostics and
  whitespace checks passed. Browser confirmed auto-turns after Normal/Defense
  in Adventure and art-pending dungeon, matching reward saves and manual stage
  advance on clear. All supplied sprites have facing metadata. A real Tizu
  Evo3->4 transaction updated mirror direction while preserving portrait DOM.
  Animated browser checks finished finite animations explicitly because hidden
  tabs suspend their timelines; no animation/console errors occurred.
  Owner profile/wallet were not changed; localhost refreshed.

## Inventory and character equipment (D-037)

- Global Inventory lists only positive-count saved materials, with explicit
  empty/unavailable states. No artifact slots or item acquisition preview there.
- Character > Artifacts / Equipment (tab ID equipment) owns that character's
  eight regular slots plus one Master Artifact. Home shortcuts open this menu.
  Owned portrait/rail remain mounted across tab changes.
- Artifacts are intended to buff the equipped character's stats. Slots are
  empty; acquisition, equip persistence, bonus amounts and stacking remain
  undefined. No fabricated bonuses, item grants, costs or save migration.
- "Master Artifact" supersedes "master relic" in current UI/documentation.
- Validation: 23 targeted hub/navigation tests passed, build/typecheck,
  diagnostics and whitespace checks passed. Browser confirmed materials-only
  Inventory, eight regular slots plus Master Artifact on the selected character,
  preserved portrait DOM across tabs and no wallet changes. Localhost refreshed.

## Remaining elemental dungeons (D-036)

- Enabled Tectonic, Voltaic, Atmospheric, Luminous, Ominous, Tranquilitic and
  Chaotic: 50 stages each, shared Lv10->120 curve, own-element material drops
  and Fractalis, independent persisted stage unlocks/replay/reports.
- content/dungeon-enemies.ts lists each existing prompt pack's eight named enemies
  in ascending order and direct-damage strike names. Existing three supplied
  packs retain their exact lineups, assets, stats and rewards.
- Art availability no longer gates gameplay. Missing enemy/arena art is explicit:
  neutral shape and element-accented scenery, no borrowed art or broken URLs.
  Material inventory retains real names/counts without requiring images.
  Future packs register in content/dungeon-art.ts; gameplay automatically uses
  their ordered enemy art, banner, arena and recipe icons.
- Account version2 unchanged; absent dungeon unlocks mean Stage1. No new starters,
  infusion modes, captures, affinity restrictions, materials grants or costs.
- Validation: all 213 tests across 18 files passed, build/typecheck and diagnostics
  passed. Coverage checks all 500 encounters, eight prompt-matching species per
  new dungeon, opening/final clears, own-element drop IDs, reward deduplication,
  saved unlocks and existing supplied assets. Isolated browser cleared Stage1
  in all seven new dungeons, received two matching Seeds and 10-20 Fractalis,
  advanced to Stage2, preserved rewards after reload, and loaded each named
  Stage50 boss at Lv120 without failed asset requests. Owner storage untouched.
- Corrected dungeon-entry listener registration in main.ts: it was nested inside
  the menu-button loop and ran repeatedly after the first successful entry.
  Fresh browser entered/exited all ten dungeons with zero console/page errors
  and no wallet writes from entry/exit alone. Build/typecheck passed afterward.

## Fractional growth correction (D-035)

- Removed integer rounding from all resolved character stats and flat shield/heal
  potency. Each level adds 1% original base; each evolution adds 10% original
  base. Effective defense includes scaled passive defense. Zero bases remain zero.
- Home, Character, upgrade previews, weapon detail, battle HUD, floating amounts,
  logs and stage reports share up-to-two-decimal display formatting only.
- Adventure and all starter dungeons consume the same fractional fighter kit.
  Existing attack/burn/Defense/percentage-heal outcome rounding is unchanged;
  rounded hit damage need not increase on every level.
- Saves store level/form rather than derived stats, so no migration, free items
  or repurchase is needed. Active battles retain their entry snapshot.
- Validation: all 177 tests across 18 files passed, plus build/typecheck and
  diagnostics. Tests cover every valid level through all six forms for all
  starters, fractional combat inputs, shields/heals and wave persistence.
  Isolated browser checks confirmed matching Lv.1 stats on Home, upgrade
  previews, Adventure and all three starter dungeons; owner storage untouched.

Character evolution now previews its next form as a black silhouette on a neutral
light backing, with a generic accessible label instead of the unrevealed title.
Current owned art stays colored; successful evolution reveals it normally.
Evo.6 has no next preview. Level/other tabs do not display the silhouette.
The preview is bounded to 150px with contained proportions and shrinkable comparison
columns. Its HTML dimensions also reserve only 150px, not the source image's 960px.
The owner's open tab had stale CSS despite receiving the new markup; reload picks
up the silhouette styling without changing saved progression.
Validation: 21 targeted tests, build/typecheck, diagnostics and whitespace checks
passed. Screenshot confirms a solid black silhouette in the refreshed owner tab;
isolated browser checks at 1280/390/320px confirm contained art without horizontal
overflow. Owner currencies and progression were not modified.

## Dungeon difficulty update (D-034)

- All elemental dungeon definitions now reach Lv120 at Stage45 and remain120
  through Stage50. Character caps remain unchanged through Lv105/Evo6.
- Shared interpolation uses `round(10+(min(stage,45)-1)*110/44)`.
  Level-derived enemy HP/attack/defense/crit increase; lineups/ability schedules,
  material gates/odds/amounts, Fractalis and upgrade costs remain unchanged.
- Gameplay and battle help read the shared maximum instead of hard-coding100.
- Validation: 27 targeted dungeon/framework/account tests passed; build/typecheck,
  diagnostics and whitespace checks passed. Isolated browser verified all ten
  catalog ranges, updated battle help and Stage50 Ifrit at Lv120 with HP295,
  ATK35, DEF11 and crit16%. Opening stages and Lv105/Evo6 final-stage clears
  passed for all three starters; material tables and upgrade totals unchanged.

## Six-form evolution update (D-033)

- Owner explicitly expanded gameplay to six forms to use all 15 supplied images.
  Evo.1-5 behavior remains identical. Evo.5->6 preserves Lv.90 and adds 10% base,
  costs 4800 Fractalis, 25 Epic Crests and 10 Legendary Hearts. Cap105;
  Lv.105/Evo.6 growth factor2.55. Omnic remains a collectible without a recipe.
- Original `Title, Character.png` files moved to Art/source/characters without
  recompression; tools/prepare_art.py exports all fifteen 960px RGBA portraits
  using the existing padding/matte algorithm.
- src/content/character-art.ts owns form titles/art IDs. Home, team thumbnail,
  Character, Squad and battle resolve the owned form. Selection remains base.
  Evolution updates the existing image src/alt; unrelated tabs keep it unchanged.
- Account version2 and stable starter IDs remain unchanged. Existing saves remain
  valid; no auto-evolution or inventory grant. Six forms use the same transactions.
- Art/Tizu Art.md and Art/Flora Art.md each include six new 1:1 icon prompts:
  Passive, Skill1, Skill2, Last Flare, Normal, Defense. Mechanics match the base
  kit. No icon images supplied yet; no invented runtime URLs or Heavy prompts.
- All currently supplied dungeon materials were already integrated in the prior
  pass. No new loose dungeon material PNGs were present in this intake.

Flora is the nature starter's name. All active
character references and source/runtime art filenames use Flora/`flora`.
Her stable save/combat ID remains `sprout`, so existing saves still load.

## First-pass progression handoff

- Owner requires Fractalis plus smaller matching-element material amounts for
  leveling. Evolution currently omits creatures with explicit owner approval;
  long-term wisp requirements/acquisition remain deferred.
- All ten elemental 50-stage dungeons are playable (expanded by D-036).
  Full-stage clear reports, saved stage unlocks,
  replay, growing levels/stats/periodic strikes and real material drops work.
  Garden uses its newly found supplied eight enemies, banner, arena and materials.
- Lv.0/Evo.1 preserves the old base kit. Caps and additive growth are unchanged.
  Costs: `10 + 2*destination level` Fractalis and `ceil(level/30)` Seeds per level.
  Evolution costs/rarity quantities live in src/content/progression.ts.
  All the way to Lv.105/Evo.6 costs 21,480 Fractalis, 280 Seeds, 35 Blooms,
  35 Shards, 35 Crests, 10 Hearts. These are editable first-pass tuning defaults.
- src/game/account.ts owns version2 of last-light.wallet: both currencies,
  material stacks, starter progress, first-Fracture flag, stage unlocks and
  reward receipts. Version1 wallet balances migrate without changing value;
  reads do not overwrite storage. No retroactive material grant or free upgrade.
- One storage write commits costs/progress and first account Fracture +10 Lycalis.
  Receipt-deduplicated rewards commit before battle state. Failed writes reject
  the action, retain all balances/progress and allow retry. Single-tab prototype;
  no cross-tab lock, backend, cloud account or Lycalis spending.
- Compact upgrade panels show current/next stats, owned/needed resources and
  confirmation. Home/Character/battle use saved scaled kits. Portrait and rail
  remain mounted through tab changes and successful upgrades.
- See [progression](units-and-progression.md), [dungeon rules](gameplay-and-elements.md),
  [schema](technical-architecture.md#persistence-contract), D-032 and new account/dungeon tests.

## Starter evolution art handoff

- Art/Infernis Art.md now includes five new 4:3 character prompts before its
  existing 1:1 ability icons. Greatsword ignition/ornamentation and armor grow
  toward six-winged heavenflame regalia.
- Art/Tizu Art.md and Art/Flora Art.md contain five prompts each: ornate tidal
  spear/celestial wave wings and living bow/angelic leaf wings respectively.
- Initially art-only; now all five post-base images are supplied and integrated
  as six gameplay forms by D-033. Female Infernis, male Tizu and female Flora
  identities are preserved. No new characters or skill mechanics were added.
- Prompts preserve the approved compact chibi/eyes-only/pure-white style,
  complete weapons, 4:3 ratio, whitespace, one --no and shared style-reference
  instructions. Actual approved reference URL still must be supplied by owner.

## Latest local verification

- `npm test`: 167 tests passed across 18 files. Python art suite: 8 tests passed,
  including all three supplied dungeon packs.
- Evolution browser checks in isolated contexts: Infernis/Tizu/Flora each show
  Evo5 art on Home, spend 4800 Fractalis and 25 Epic/10 Legendary to become Evo6
  while preserving Lv90 and the existing portrait node, retain art through tab
  changes, and show Evo6 on Squad/battle. All fifteen exports decode successfully;
  no page errors. Owner save/wallet unchanged.
- Prompt validation: six square icon prompts per Tizu/Flora file, five preserved
  4:3 unit prompts each, shared style reference, exact niji6/s100/q1 parameters,
  one --no per prompt and valid links. No loose PNGs remain in project root.
- Reviewed all fifteen evolved exports together over dark backing. Infernis Evo6
  had an ivory source background; a per-asset matte-minimum215 override removes
  corner patches while preserving enclosed pale details. Other exports keep230.
  Original bytes remain unchanged; the override has a dedicated Python test.
- Build task: TypeScript and Vite passed; existing large-bundle warning remains.
- Editor diagnostics and `git diff --check`: no errors.
- Local browser checks: four release directions, selected Imp targeting, single
  committed action per gesture, short cancellation, denied ultimate, right-click
  Defense, pointer cancellation/lost capture, ready shimmer and reduced-motion
  steady glow. Progressed capacity 140 still becomes ultimate-ready at cost 100.
- Recent changes are local; no new GitHub Pages deployment is implied.
- Earlier UI checks (before progression implementation): all seven destinations; real currency/owned companion; eight
  artifact slots and one relic; ten disabled dungeon cards/two disabled infusion
  cards; one visible activity group; stable portrait/rail across upgrade tabs;
  Settings open/close; Adventure entry and restored run, without sanctuary nav
  or Heavy. Responsive 1280/390/320px checks found no horizontal overflow after
  correcting narrow-page body sizing. Home Adventure fits above bottom nav at
  1280x720. Existing saves/wallet were not changed by UI checks.
- Earlier art checks: both banners/arenas, 18 enemy illustrations and 12 materials
  loaded without broken images; Infernic/Aquatic accents resolved orange/blue.
  Evolution preview contains six own-element material references and keeps the
  character portrait mounted. Neutral HUD/normal/Defense remain in Adventure.
  New 1280/390/320px checks pass with expanded galleries and larger buttons.
- Latest isolated-browser checks: real Stage1 clear grants 2 Seeds and unlocks
  Stage2; purchase deducts exactly 12 Fractalis/1 Seed; cancel retains the save;
  reload retains Lv.1. Evo.1->2 preserves Lv.30, spends 300 Fractalis/15 Seeds,
  awards 10 Lycalis and produces HP308 in Adventure. Portrait stays mounted.
  Upgrade panel has no horizontal overflow at actual 1280/390/320px. No page
  errors; isolated contexts are closed and the owner's profile/wallet untouched.
- Garden Stage50 browser check: dedicated arena/final-boss art loads, clear
  report includes real damage/HP/rewards, 3 Seeds plus rolled rarity rewards are
  saved, highest unlock remains 50 and the continue control is disabled.

## Dungeon art and neutral-theme handoff

- Primary chrome is black/white/gray, superseding earlier blue/gold/rainbow
  styling. `src/neutral-theme.css` owns final palette rules; layout remains in
  existing stylesheets. Ambient backdrop is neutral; elemental art stays colored.
- Home/action-category banners minimum 76px; Adventure launch minimum 128px.
  Dungeon banners reserve 3:1 areas; unsupplied banners show a neutral placeholder.
- `src/content/dungeon-art.ts` owns ten element accents, two supplied dungeon
  packs (now three) and material visual-name order. Gameplay cards show banners and concise
  matching-element enhancement material descriptions; no artwork disclosures or
  enemy/reward catalogs. Arena/enemy exports remain preserved for future combat.
  Character evolution shows own-element supplied
  material art. Only required recipe icons appear; playable dungeons now grant
  actual material stacks using the first-pass tables.
- `tools/prepare_dungeons.py` intakes eight Aquatic enemies, twelve materials and
  four landscapes. Original files live in Art/source by category. Hash-identical
  root Infernic enemies are archived under Art/source/intake-duplicates; existing
  originals and runtime enemy exports remain intact. No root PNG intake remains.
- Sprite/icon sizing and byte-identical landscape contracts are tested by the
  extended art suite. Regenerate with `python tools/prepare_dungeons.py`; first
  intake only uses `--move-sources`. No dependencies added.

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
- Implemented bottom destinations: Home, Character Upgrades, Gameplay, Events,
  Inventory, Squad and Summon. The last two are honest future-system previews.
  Inventory now lists materials only; D-037 moves the equipment preview to Character.
  Adventure and Story are Home subactivities. Settings opens in a modal side drawer.
  Story displays the saved starter's lore/prologue; Events is a future placeholder. Motion settings
  save separately and update both canvas/CSS motion. Fractalis shows a persistent
  local balance; Lycalis is saved and first Fracture awards 10. Level/evolution
  work; equipment and separate skill/weapon purchases remain previews.
- Gameplay groups Adventure, elemental material dungeons, evolution infusion,
  Story and Events. Adventure/Story return here; Home keeps direct Adventure
  and adds Gameplay entry. Colored category rail selects one activity group
  without granting resources; category hashes survive Settings.
- Removed the redundant global ability strip. Matching Infernis PNGs now replace
  numbered symbols in existing Home shortcuts and Character area selectors for
  Passive/Ability1/Ability2/Last Flare. Existing passive/detail panels keep their
  art; no second set of ability cards is added. Other starters retain numbered
  symbols until their own icons are supplied.
  `src/content/activities.ts` owns ten canonical element/dungeon mappings, 60
  distinct material IDs, two exact infusion eligibility groups and recipe helpers.
  Starters keep save IDs but display Infernic/Aquatic/Efflorescent affinities.
  Dungeon levels 10->120 linearly by Stage45, then plateau to Stage50; tested for
  all stages. Seven dungeon cards and two infusion cards remain disabled.
  Heavens/Abyss start Lv80, 25 stages, four tiers, 5-6 enemy concepts each;
  later growth/rates/encounters remain open. Starter characters now have six forms,
  approved recipes Common; Common+Uncommon; Uncommon+Rare; Rare+Epic; Epic+Legendary, plus
  Fractalis; mapped infusable enemies are deferred for this first pass.
  Quantities, material ownership and transactions now work.
  [Owning specification](gameplay-and-elements.md).
- Home now follows the full UI concept's colorful utility rail / central orbit
  character with hexagonal shortcuts / right current-team/stat-passive panel and
  Adventure launch. Seven-destination bottom nav supersedes earlier screen limits.
  Character Upgrades has an area rail, central companion, and focused detail panel
  for Overview, seven upgrade paths, and Inventory / Equipment. Home shortcuts
  select these directly; Settings preserves the selected area. All content uses
  the saved starter. Tizu's effective defense is 24, not base 16.
  Render helpers live in `src/presentation/hub.ts`, `sanctuary.ts` and
  `gameplay.ts`; scoped styling in `src/sanctuary.css`. No external fonts/dependencies
  or mock-up scripts were imported. Provided mock-up files remain untouched.
- Home uses a bounded portrait and internal desktop scrolling; orbit shortcuts
  turn into a wrapping dock on smaller screens. Adventure is above stats and
  utility shortcuts on mobile. Within
  Character Upgrades, tabs replace only the detail panel, preserving the exact
  showcase/image/rail/dialog DOM nodes without replaying entry animation.
  Detail focus uses preventScroll; a desktop minimum panel height limits jumps.
- All valid version-1 starter saves continue unchanged, including water/grass.
  The earlier forced fire re-selection policy is superseded.
- Implemented: solo Adventure using only the saved Infernis/Tizu/Flora, enemy waves,
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
  wave; growth is linear, never compounded. Saved starter progress now scales kits.
- Owner chose documentation/art first for Flaming Depths: one separate future
  dungeon with higher-level waves, wave-end reports, and chance-based captures.
  Captures are separate weaker/squishier fodder with Normal only after Heavy removal and level
  upgrades only, never evolution. Captures/team editing remain unimplemented.
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
  historical levels 6-55 (now superseded by the new Lv10-120 rule), five skill ranks,
  exact hostile skill effects/schedules, report boundaries and final completion.
  Numbers remain proposed; hostile skills never transfer to captured fodder.
  That older design is not the current encounter table. Three starter dungeons
  now have combat, reports/rewards and progression transactions; captures/team
  edits remain deferred.
- Each ally has Shatter Gauge: starts 0, caps 100 at base, Normal +20,
  incoming enemy hit +10 (including shields). Skills cost 25/40 and Last Flare
  costs 100; skills no longer generate resource. Battle meters/buttons and the
  character kit show gauge/costs. No persistent-save schema change is needed.
- Six supplied images moved to Art/source; transparent runtime exports are in
  public/assets. Portraits use the new names but retain old save IDs.
- Six Infernis icons are preserved under `Art/source/abilities/infernis`, with
  separate 256px RGBA / 224px content exports in `public/assets/abilities`.
  `tools/prepare_icons.py` reuses matte removal without applying unit dimensions.
  Adventure buttons use Normal/Ability 1/2/Last Flare icons; archived Heavy art
  is preserved but no longer mapped to a runtime action. Home passive,
  Character overview/individual passive-skill areas and battle passive help use
  the matching art. Text/hotkeys/costs remain visible; water/grass remain text-only.
  Browser checks confirm all mappings, decoded icons, 32px square battle sizing,
  stable character portraits through skill tabs, working Light gauge gain, and
  all five controls/no horizontal overflow at narrow widths for every starter.
  Five Python tests now cover both unit and independent ability-icon exports.
- Grassy Field moved to `Art/source/backgrounds`, with a byte-identical landscape
  PNG in `public/assets/backgrounds`. It is wired behind the Adventure arena;
  no unit-art alpha removal or square normalization is applied.
- Character drag input executes on release: Up Last Flare, Left Skill1, Right
  Skill2, Down Normal. 32px threshold; short drags/cancellation/exact diagonal
  ties do nothing. Selected enemy remains target. Right-click uses Defense:
  consumes action, no gauge cost/gain, -10% incoming damage after defense and
  before shields until next player turn; one-damage floor and incoming +10 remain.
  Buttons/hotkeys are alternatives for touch/accessibility. Ultimate white
  shimmer/glow appears only while legally usable; reduced motion keeps static
  glow and readiness text. Pointer capture prevents losing a drag outside unit;
  cancel/lost capture/navigation/Settings must not execute a pending gesture.
  Old saved Heavy hotkey migrates in memory to Defense without overwriting
  corrupt settings or changing other remapped keys.
- Not implemented: rewarded quests, squad editing, summoning, equipment and
  separate skill/weapon purchases, captured creatures, Lycalis spending,
  accounts, cloud saves, backend, payments.
- Character growth now uses +1% original base per level and +10% per completed
  evolution, added rather than compounded. Six forms cap at 30/45/60/75/90/105;
  evolution preserves level, superseding the old reset-to-0 rule. First Fracture
  still grants +10 Lycalis. Seven stats include Shatter capacity, HP, DEF, Attack
  Damage, critical rate, critical multiplier and elemental damage. Numeric
  skill/passive potency scales too; timing/thresholds/costs/gauge gains stay fixed.
  Resolved kits drive battle effects and descriptions, including grown critical
  multipliers, per-character gauge limits and elemental burn.
  The old preview-only gate is superseded by D-032. Runtime uses saved progression;
  wallet version2 stores currencies, materials, progress and first-Fracture reward.
- Every newly defeated enemy grants 5-10 Fractalis, including burn kills.
  `last-light.wallet` version2 stores the economy/progression together.
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

Playtest dungeon difficulty and upgrade pacing for all three starters, then tune
the first-pass cost/drop tables. Define creature infusion amounts/acquisition,
captures/team rules, equipment uniqueness and independent skill upgrades before
enabling those features. Tizu/Flora Defense icons remain unsupplied; their art
files contain prompts and the approved style-reference URL remains required.

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
- `npm test`: 115 passing tests for all three starter transitions and saved continuations,
  failed storage writes, lore/reveal budget, currency/slot/upgrade definitions,
  motion settings, combat formulas, all kits/passives, exact recovery/cooldown
  boundaries, status durations,   shield/heal caps, waves/defeat, hotkey validation, and every runtime unit PNG's
  960 x 960 RGBA export contract.
- Framework tests cover ten exact dungeon mappings, sixty unique materials, every
  stage level/plateau, rejected invalid inputs, exact infusion eligibility and
  adjacent evolution requirements for every element; unavailable modes stay gated.
- Browser checks for all three starters verify ten dungeon/two infusion cards,
  twelve disabled launch controls, Gameplay Settings restoration, playable
  Adventure launch/quit to Gameplay, Story parent navigation, correct own-element
  recipes and stable character art. Gameplay has no horizontal overflow at
  1280x720, 390x844 and 320x640. Profiles were preserved and test storage restored.
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
- Growth tests verify caps 30/45/60/75/90, preserved-level preview, additive
  factors, all seven stats, scaled skills/passives, fixed costs/timing and first
  +10 Lycalis rule. Live local browser checks cover base kits for all starters,
  progressed-kit battle presentation and no horizontal overflow at 1280/390/320px.
  Earlier production-preview headless Edge
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

## Current: owned roster, summons and squads

Character now selects all owned companions and upgrades them independently.
Squad saves an ordered leader plus up to two companions; starter can be removed,
duplicates/unowned/empty squads rejected. All modes use the equipped team with
per-member progress and controls. Continue/replay preserve the run snapshot and
per-member Gauge; Settings does not replace the team.

Summoning costs10 Lycalis, draws equally only from unowned existing characters,
and atomically saves deduction/acquisition before revealing. Newly summoned
characters are unequipped. Completed pool and insufficient currency disable
the action. First Fracture still grants10 Lycalis only once; acquiring both
remaining companions naturally needs an owner-approved future earning source.

Version3 wallet progress-record presence establishes ownership. Reads add the
profile starter/default squad in memory only, preserving existing progress and
stage migration. Optional squad extends existing saves; no forced reset or
schema-version churn. See [D-059](decisions.md), [economy](summoning-and-economy.md),
[roster](units-and-progression.md#implemented-roster-and-squad-behavior) and
[regression tests](../src/game/squad.test.ts). update template

Verification: 462 tests across46 files passed; production TypeScript/Vite build
passed (existing large-bundle warning remains). Isolated browser checks summoned
both remaining characters using test-only funds, upgraded Tizu independently,
saved/reloaded the ordered squad and controlled all three allies through a full
turn. Every elemental dungeon and both infusion modes spawned the same team.
Stage Continue and Settings retained each Gauge; replay retained the roster and
reset Gauge. Full-team/roster art decoded at320/390/1280px with no horizontal
overflow. Very small320x700 endgame layouts remain vertically scrollable;
390x844 and desktop fit the full allied formation. Owner storage was untouched. update template

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
