# Training (formerly Adventure)

## Victory-stage replay and online loot parity (D-301)

Every staged victory sheet offers **Replay stage**, alongside Continue where
another stage exists and Quit/Return. Includes Story regional/terminal bosses,
all material dungeons, Heaven/Abyss, Treasury/Sanctuary, Roses, Machines and
Elemental War. Final stages can replay directly without leaving the results.
Training keeps its Next wave and defeat-only Restart flow.

Replay uses the existing restart path with a fresh run/receipt ID, full HP and
fresh Gauge, keeping the frozen squad/progression/captures/equipment/upgrades/
Masters. It clears encounter events and starts a new entrance. Saved rewards
and unlocks remain; restarting never claims the previous loot again.
Subsequent kills earn ordinary replay drops, not repeated Story first-clear
bonuses. Online retry accepts defeat or cleared staged encounters, not active
or cleared Training runs; stale IDs and ambiguous request retries keep their
existing validation/idempotency. New enemies can add ordinary seen discoveries.

The online loot discrepancy was a separately stale game-operation function:
hosted version12 still gated Story Uncommon materials atLv23, despite D-297
client tables listing a roll fromLv1. Website pushes deploy Pages only, not
the game server. Regenerate/deploy the shared server bundle with loot changes.
No chance increases, guaranteed rare drops, retroactive grants or save rewrite.
View Loot explicitly distinguishes per-kill chances from guaranteed100% drops.

Validation: `npm test -- src\game\loot-table-parity.test.ts
src\presentation\battle-results.test.ts src\presentation\battle-exit.test.ts
src\online\server-game.test.ts --maxWorkers=2`.
The live-table tests compare actual drops/guarantees at every Training level,
Story/dungeon/other activity stage and War boss; hosted smoke
`node tools\smoke_server_game.mjs --loot-parity` also checks early Story
Uncommon reachability, each final boss, atomic persisted holdings and direct
victory replay/idempotency using only disposable accounts.

## Repeatable final-boss loot (D-294)

Owner approves **5x existing currency, material and component quantities** on
every terminal-boss kill, including replays. Story applies this separately to
each region's boss at25/50/75/100/125/150. Other endpoints are dungeon35,
Heaven/Abyss35, Treasury/Sanctuary25, Roses35, Machines100 and each War mode10.
Endless Training has no terminal boss and remains unchanged.

The original quantity is sampled first, then multiplied by5. This preserves
the original chance decisions, quantity distribution and number/order of RNG
draws; boosted ranges contain multiples of5 rather than every integer.
Earlier bosses/ordinary enemies retain their existing quantities.
No new clear transaction, retroactive grant or second reward roll.
Account validation uses the same terminal ranges and quantity lattice;
all currencies/items/discovery/receipts/unlocks still commit once before VFX.
Rejected/overflow/denied persistence leaves the complete stored wallet intact.

Examples:

| Final encounter | Payout |
| --- | --- |
| Material dungeon35 |75-150 Prismatica;15-30 per successful material roll |
| Heaven/Abyss35 |75-150 Prismatica;15-30 specialty/bonus stacks; premium0/5/10/15 at75/10/10/5% |
| Treasury25 |24,300-48,600 Prismatica |
| Sanctuary25 |75-150 Prismatica;80% chance of25 Null-Prismatica |
| Roses35 |90-180 Prismatica;15-30 per successful Rosethorn roll |
| Machines100 |75-150 Prismatica; guaranteed625 Broken Mechanical Components |
| War10 |25,000-40,000 Prismatica;60% chance of25 Null-Prismatica |

Conduit/chest counts remain one per successful roll. Their chances, capture
chances/counts, War recruitment1%, owned-recruit conversion100 Null-Prismatica
and separate one-time Story regional bonuses are unchanged. Live Collections
loot tables, Gameplay Information and Battle menu explain the same rule.

Shared implementation: [classifier/range helper](../src/content/final-boss-loot.ts),
[reward engine](../src/game/battle.ts), [atomic validator](../src/game/account.ts).
Validate with `npm test -- src\game\final-boss-loot.test.ts --maxWorkers=2`;
hosted smoke is `node tools\smoke_server_game.mjs --final-loot`, using only
disposable identities and near-defeated final-boss fixtures.

**D-164:** the existing endless engine described below is now presented as
Training, with stable legacy IDs and unchanged wave/loot/Continue rules.
Home's campaign is the separate [150-stage Story map](story-and-training.md),
with first-clear bosses and limited elemental materials. Historical Adventure
wording below refers only to retained Training, not the campaign.

**Status:** implemented endless Adventure, renamed from Free Battle. Supports the
saved squad of one to three independently controllable owned characters.

Each battle entry snapshots the ordered squad and individual progress. Character
click/gestures, selection hotkeys and Battle menu's acting-Element-Bearer buttons
select allies. Spent, recovering and defeated characters cannot act; the view
defaults to a ready living Element-Bearer when the current selection is unavailable.
The enemy turn begins only after all living teammates are unable to act.
Continue/replay keep the full run team, regardless of later menu changes.
Multi-member mobile formations cap portrait height relative to the viewport,
retaining full names/HP/Gauge and usable touch targets instead of forcing three
endgame portraits to consume the whole screen. Solo art keeps its existing scale.
The legacy document filename is retained for existing links. The owner approved an initial
editable balance set. Elemental Gauge costs/gains are owner-approved; only ultimates
force next-turn recovery, superseding the earlier heavy-attack recovery rule.
This is not production balance or a rewarded story mode.

## Entering and leaving

### Larger death loot and Machine Conduit beams (D-293)

All enemy-death drops render at1.5 times their previous randomized size:
currency, materials, components, chests/pending tokens, Conduits, recruitments
and captured creatures. Nominal artwork is54px rather than36px, retaining
independent75%-135% variation (40.5px through just under72.9px).
The whole stack, beam, quantity and snapshotted upgrade marker scale together.
Results/menu artwork and source PNG bytes are unchanged.

Each awarded Machine Conduit remains a separate actual-receipt loot stack,
with supplied icon, exact quantity, rarity/palette beam and a bright core/base
glare. It accompanies the defeated enemy's ordinary rewards before automatic
visual collection. Conduit artwork is never replaced by another device.
Wrap larger stacks into spaced rows and clamp the burst around the defeated
enemy to viewport bounds; reserve room for beams and quantity labels.

Keep850-1849ms independent pickup times, live1x/2x/3x speed, reduced-motion
static receipts, death fade and disposal cleanup. No extra roll, claim or
save: animation only presents already-resolved rewards. Drop chances,
quantities, RNG streams and acquisition rules do not change.

### Reliable battle exit (D-292)

Results Quit and toolbar Leave use the same caller-navigation exit flow.
That flow alone confirms the online `quit` operation before returning; the
results view must not separately delete the run first. Failed/ambiguous server
operations remain visible and retryable with the same pending request.
Saved kill rewards are retained and no new rewards are written during exit.

Normal entries return to their actual caller with its existing selections and
scroll. Online runs resumed after reconnect/reload have no in-memory caller;
their exit returns to Gameplay with clean transient controls instead of failing
on empty history. This fallback is battle-only: ordinary menu Back still
requires history. Cleared, defeated and unfinished runs all support exit.
An already-confirmed quit retry can finish navigation without looking for the
now-deleted session. Settings Return to title retains its own confirmation.

### Battle animation speed

The compact **Speed** selector in the battle toolbar offers **1x, 2x and 3x** in
Adventure, elemental dungeons, Heaven and Abyss. Existing saves default to 1x.
The choice is saved separately as `last-light.battle-speed`, survives Settings
and reloads, and remains usable during an attack. Failed reads/writes are
reported; a failed save restores the selector and keeps the previous speed.

`presentation/battle-speed.ts` owns validation, persistence and the live change
event. BattleView applies the multiplier to tracked Web Animations, updating
in-flight playback without replaying the action. Portrait cut-ins, windup/return,
attack trails, damage/heal/shield numbers, death fades, randomized loot pickups,
combatant entrances and turn cues all use the same rate. CSS impact particles
and their stagger delays, HP transitions and result reveals scale accordingly.
A 900ms animation takes 900/450/300ms at 1x/2x/3x.

Speed is presentation-only: damage, cooldowns, turn order, RNG, enemy schedules,
reward quantities and save timing do not change. Rewards still commit before
presentation and Victory still waits for death/loot cleanup. Ambient idle and
readiness loops, menu/loading transitions and art size are unchanged. Reduced
motion remains authoritative; speed shortens the remaining static loot dwell
and turn cue, never reenables disabled movement.

### Battle UI styling

`presentation/battle-ui.css` owns the sanctuary-matched combat styling;
`presentation/battle-focus.css` refines the field-first layout across Adventure,
all ten elemental dungeons and both infusion modes. Leave, speed and Settings
use a compact unframed toolbar. Activity name, stage/wave and turn remain in
a small header; one Battle menu replaces the three edge disclosures.
The currency wallet moves into Settings rather than competing with combat.

Unit names use serif nameplates with element-accented edges. Enemy nameplates
display `Name / Lv. N` in Adventure, all elemental dungeons and both infusion
modes, including bosses and art-pending enemies. Allied levels remain visible.
HP and allied Shatter
readouts sit beneath them in translucent 260px-maximum strips. Defense and
full combatant readouts move into Battle menu's Combatants reference. Health uses the unit's element and
Shatter a neutral silver track; numbers remain tabular and readable without
colored text glows. The artwork's scale, formations and image-only facing are
unchanged; no bottom action bar is restored.

Disclosure/action controls, victory/defeat sheets, Settings, damage numbers,
turn cues and cut-in typography follow the same charcoal/white/serif hierarchy.
Last Flare cut-ins retain elemental artwork effects and readable copy.
High-specificity field selectors in this stylesheet deliberately supersede
legacy transparent-readout rules in `neutral-theme.css`; do not add competing
readout overrides there.

Interactive controls have at least 44px targets and explicit focus/disabled
states. The toolbar wraps on small screens; disclosure contents and the modal
drawer remain scrollable. BattleView marks the host `aria-busy` during entrance
and presentation. Settings still suspends presentation and reconstructs the
same resolved state; neither the new styling nor busy metadata changes combat,
reward timing, reduced motion or selection-only key bindings.

### Victory, defeat and turn overlays

Clearing an entire wave/stage opens a prominent **Victory!** results sheet only
after attacks, enemy death fades and loot collection finish. Ordinary turns never
show Victory. A brief **Enemy turn** cue precedes enemy attacks; **Your turn**
announces the next player turn. These small edge indicators ignore pointer input
and do not obscure HP/Defense/Shatter readouts.

Results aggregate exact saved per-enemy rewards from every action in the current
encounter, not a truncated log or a rerolled loot table. Identical materials combine
with icons/colors/amounts. Continue advances through the existing loading/entrance
flow; Quit returns Gameplay and keeps rewards. Final Stage35 offers Return to
Gameplay, never an invalid next stage. Defeat offers Retry/Restart and Quit,
retaining rewards already earned before defeat.

The nonmodal raised sheet occupies its own layout space beneath the battlefield,
not a full-screen blocking dialog. Focus moves to its heading after presentation.
**View battlefield** collapses it; the header **View victory/results** reopens it.
Rules/log/combat menus remain collapsed. The old drop-text feed and dungeon-clear
report are replaced by one structured summary with optional battle statistics.
Long reward pools scroll inside the sheet; mobile keeps full-size action targets.
Settings reconstruction preserves current encounter totals and dismissal state.
Reload still ends an unsaved battle run; this sheet is not saved run history.
No extra wave-clear reward or claim transaction: rewards commit at each kill.

`presentation/battle-results.ts` owns markup/aggregation, `battle-results.css`
owns presentation, and BattleSession.stageEvents now tracks all activities,
including Adventure, resetting on the next encounter. Reduced motion uses a
static sheet and brief static cues; disposal removes temporary indicators.

Gameplay's **Start Adventure** button (or Home's Adventure shortcut) opens a fresh run at **wave 1**, never resumes a
previous run. Restart and reload also start at wave 1. Enemy level equals wave.
Adventure is a separate full-viewport field screen, without the sanctuary
header, primary navigation, or footer. Scenery fills the viewport; transparent
unit art stands on the field without blue card borders. Detached dark name/stat
readouts preserve contrast. The bottom action bar is removed. Battle menu is
a modal containing optional accessible actions (including touch Defense),
combatant details, rules, restart and the recent event log. Pass remaining
actions is available there, not on the field. Victory/defeat Continue remains explicit.
Only target/ally selection keys remain; no attack or Space turn shortcuts.
**Quit Adventure** returns Gameplay and ends the run, preserving earned Prismatica but
discarding wave progress. Settings suspends battle input while open; closing it
preserves the current wave, health, gauges, and already-resolved actions.
Small screens allow vertical scrolling rather than clipping controls; the scenery
stays full-screen behind the content. This uses the browser viewport, not the
permission-gated Fullscreen API.
Choose Infernis (fire), Tizu (water), or Flora (grass) at the start. Adventure
uses **only your saved starter**, not a temporary team. Entry, restart, and later
waves preserve that identity; no additional units or items are granted.
Every newly defeated enemy drops a level-scaled random integer of Prismatica:
**5-10 at Lv1**, increasing quadratically to **15-30 at Lv120**, including
burn kills and each target of a multi-enemy attack. The drop appears above the arena
and in the log. The running balance appears in the currency strip.
Rewards are saved immediately, before committing battle state/playing animations;
leaving, defeat, restarting, and reloading do not remove earned currency.
Already defeated enemies never drop again. A failed wallet read/write leaves the
action/state uncommitted and shows an error; retry uses the same reward result.
Reward randomness is separate from combat randomness.
The minimum is `5+floor(95*((level-1)/119)^2)` and maximum is double the minimum.
Adventure remains endless; enemy levels, stats and drops cap at120.
Existing water/grass saves continue normally without forced fire re-selection.

Enemies are on the **left**, allies on the **right**, including mobile layouts.
The screen uses the supplied [grassy-field scenery](art-workflow.md), with
aspect-preserving cover cropping and detached dark readouts for readable stats.
Your character's action kit is selected automatically. Click an enemy to target it.
Hold the character and drag **Up** for Last Flare, **Left** for Skill 1,
**Right** for Skill 2, **Down** for Normal Attack; release to execute against
the selected enemy. Drag at least 32 CSS pixels; a short drag, return to center,
pointer cancellation or exact diagonal tie cancels without spending an action.
No hold timer is required. Unavailable actions visibly explain their restriction
and never spend gauge or a turn. Right-click the character for **Normal Attack**
against the selected enemy, as a shortcut equivalent to dragging down.
Battle menu provides native keyboard/touch buttons, including Defense.
Enemy units retain click-to-target and never trigger ally actions.
The character glows white and shimmers only when Last Flare is currently usable:
enough gauge, alive, unspent, active player phase and not recovering. Reduced
motion uses a steady white glow plus the visible readiness label.
After selecting an action,
enemy phases resolve automatically whenever no living ally has a legal action.
Support skills and Defense count too. Last Flare's full recovery turn still
occurs, including enemy damage, periodic effects and rewards; it no longer
waits for a meaningless manual pass. Processing stops as soon as a teammate
can act or combat becomes terminal. Continue into a wave with carried recovery
uses the same rule. Reopening a blocked turn after Settings also resumes it.
**Pass remaining actions** in Battle menu forfeits unused actions voluntarily.
Clears/defeats do not trigger retaliation; Next wave / Next stage still requires
manual confirmation.

Every wave has a Goblin, an Imp, and a Rock Golem. Approved linear growth:

- Enemy level = `wave`, starting at 1; shown next to the enemy name.
- HP = `round(baseHP * (1 + 0.12 * (wave - 1)))`.
- Attack = `round(baseAttack * (1 + 0.12 * (wave - 1)))`.
- Defense = `baseDefense + (wave - 1)`; increases every wave.
- Critical chance stays at its base value.

Growth uses wave-1 base stats, NOT the previous wave's stats, so it is not compounded.
Integer rounding may make adjacent HP/attack increments differ by one.
Edit [Adventure scaling](../src/content/combat.ts) to tune the fixed increments.
Clear a wave, then explicitly choose Next wave.
Continue until defeat, exit, or a confirmed restart. Health, shields, Elemental Gauge,
retained Last Flare cooldowns, and recovery carry between waves; defeated allies stay defeated.
Flora' living passive still applies at the new-turn boundary.

Leaving Adventure during animation cancels presentation and ends the run; already
committed Prismatica stays earned. Opening Settings during animation cancels
presentation only, retaining the resolved combat state.
Saved character level/evolution now resolve the combat kit at run entry; enemy
levels are independent of character progression. All ten
[material dungeons](gameplay-and-elements.md) are playable separately;
captures remain deferred.

## Actions and recovery

Player actions use [actAndAdvanceTurn](../src/game/battle.ts), which resolves the
action and every required enemy/recovery phase into one ordered result. Rewards
from all phases (including burn defeats) commit before presentation; failed reward
storage leaves the prior session state available for retry. The single-action
`act` helper remains available for isolated rule tests.

Character sprites face left, enemies right using per-asset authored-direction
metadata. Already-correct and front-facing art is not indiscriminately flipped.
Images alone are mirrored; text, HUD, gesture directions and effects are unchanged.
The selected living enemy has stronger layered white/element-color glow and
highlighted name/readout. Static glow also works with reduced motion.
Holding a character opens an ornate, viewport-contained compass with four arrow
arms: Up Last Flare, Left Skill1, Right Skill2 and Down Normal. Skill availability
and gauge costs are visible; the chosen direction lights up, and unavailable
choices show an explicit reason rather than consuming an action. Release near
center cancels; gestures and optional menu buttons keep their existing rules.
Field names, stats, floating numbers, turn/title/reward text and HUD use transparent
backgrounds and soft black blurred text shadows, not solid label boxes.
Action controls retain faint translucent surfaces for affordance. Settings and
stage reports remain readable panels; no gameplay stats or input thresholds change.
Enemy field labels show **name, current/maximum HP and Defense only**. Level,
attack, critical stats, elemental damage, shield amounts and status labels are
not displayed beside enemies; their mechanics and battle-log events remain
unchanged. Allies keep their existing combat feedback.
Damage numbers are larger and luminous yellow-white; criticals are white/gold,
healing green and shields cyan. They pop gently, hold briefly and rise/fade over
850ms without opaque backing. Living sprites breathe slowly between 1x and
1.025x over five seconds, with staggered phases. Fallen sprites do not pulse.
Idle motion uses an inner wrapper, leaving attack motion and facing independent.
Device or in-game reduced motion disables pulsing and existing animated combat
presentation; results remain available in HP changes and the battle log.

### Impact and health-bar timing

Allied field readouts show **current/maximum HP, Defense and Elemental Gauge only**
throughout battle. Attack, critical stats, elemental damage, shield amounts and
status text are omitted from the character readout. Identity/name/role stays
above the artwork. Full stats remain in Home/Character; action availability,
Defense glow, ultimate glow, floating shield/heal numbers and the battle log
retain combat feedback. Shield mechanics and impact-synchronized HP are unchanged.

Allied names include a small role medal: Infernis Attacker, Tizu Tank and Flora
Healer/Support. Role labels describe existing kits only, without changing combat,
aggro or Defense behavior. Enemies do not receive role labels.

Combat still resolves and commits rewards before presentation, but the visible
HP ledger starts from pre-action values rather than showing the final turn early.
At attack impact (180ms normal / 360ms ultimate wind-up), damage numbers and HP
text update immediately; health-bar width eases to the new percentage over 420ms.
All targets of a multi-target attack update together. Return/effect/floating-number
animations run after that update, not before it. Enemy hits use the same path.
Standalone burn ticks and passive heals update when their ordered event starts.
Healing/shield gains and absorbed shield damage are tracked without discarding
fractional HP or subtracting shield-absorbed damage twice. Defeated visuals apply
at zero HP. Final render reconciles to resolved state after presentation completes.
Reduced motion skips animation/transitions and displays final results immediately;
animation interruption/error retains the resolved state and existing error reporting.

### Activity loading and encounter entrance

Entering Adventure or any elemental dungeon uses a black curtain with a
small **Loading!** label and progress track in the bottom-right corner. The
curtain fades in (800ms, D-281), the destination renders behind it, supplied visible
artwork gets a bounded1500ms decode opportunity, then the curtain fades away
(800ms), both with ease-in-out. D-328 excludes hidden panels, closed dialogs
and below-viewport art from this wait. Visible images are promoted to eager
loading; remaining menu art uses native lazy loading unless explicitly authored
otherwise. Slow images continue loading after reveal and never reject a
successfully rendered destination.
The bar tracks preparation/
decoded images, not network byte progress. Missing/pending dungeon art uses its
existing neutral visuals rather than requesting nonexistent images.

New encounters slide enemies in from beyond the left viewport edge and allies
from beyond the right edge, finishing in their normal stage positions over
650ms plus 70ms per entrant's index. The full unit travels, including its readouts;
facing, idle breathing and impact animation remain separate. Combat buttons,
selection keys, action menus and gestures are locked until every entrant finishes; turn/damage/reward
resolution does not advance during entry. This applies to initial fights, next
Adventure waves, next dungeon stages and replay/restart. Reopening settings does
not replay an already completed entrance.

Other sanctuary navigation and readable story/event activity destinations also
use the curtain, while same-screen character tabs and category filtering remain
instant. Repeated navigation shares the active transition rather than duplicating
entry. Input/focus restore after loading. Actual image failures are logged and
offer a per-image Retry control throughout the UI (Calamity bosses keep their
scene-specific error control). Merely exceeding the artwork wait budget is not
an operation failure. Render/entry errors still reject and remove the curtain;
the previous inert state is restored. Encounter state and earned rewards are preserved.
Both game/device reduced motion skip fading/sliding and show a short static
loading indicator before revealing the ready encounter.

Each living character may perform **one** action per player turn:

| Action | Rule |
| --- | --- |
| Normal Attack | Drag down, right-click an ally or Battle menu Normal Attack button; 100% damage to one target; gain 20 Elemental Gauge |
| Ability 1 | Character-specific effect; costs 25 Elemental Gauge; no cooldown |
| Ability 2 | Character-specific effect; costs 40 Elemental Gauge; no cooldown |
| Last Flare | Character-specific ultimate; costs 100 Elemental Gauge; no action next turn |
| Defense | Battle menu Defense button; consumes action, reduces incoming damage by 10% until next player turn |

**Heavy Attack is removed**, not hidden behind another input. The internal `light`
action ID now means Normal Attack and preserves the existing basic-attack PNG.
Defense costs no gauge, grants none on use and does not force recovery.
It reduces damage after Defense mitigation/critical calculation and before shield
absorption: `max(1, round(incomingDamage * 0.90))`. Existing one-damage floor
remains; incoming hits still grant +10 gauge. It applies to damage events, not
healing or shield gains, and clears at the next player-turn boundary, including
a wave transition. Recovery also blocks Defense; it is not a second free action.

Every character has an independent **Elemental Gauge**, starting at **0**, capped at
**100 at base**. Capacity is a per-character stat and grows with level/evolution;
gains and costs do not. Runtime entries use saved owned progression.
Normal gains apply once per action, not once per target. Each incoming
enemy hit adds **10**, including shield-absorbed and lethal hits; critical hits do
not increase the gain. Burn, healing, shields, passives, and ability casts do not
generate gauge. Skills and Last Flare require and spend their exact costs; spending
does not generate gauge. Gauges persist between turns/waves and consecutive
dungeon/infusion stages in the same run, but reset on quit, mode switch,
retry/replay, restart or reload. Next-stage continuation still refreshes HP
and cooldowns; it no longer resets Elemental Gauge.

Skills do not force recovery or cooldowns for any squad member (D-300).
Skill1/Skill2 may repeat on successive turns, including for captured allies.
A Last Flare on turn 1 blocks every action on turn 2 and allows actions again
on turn 3. The rule also applies when a wave is cleared by that action.
Normal, Defense, and skills allow another action on the next turn (subject to Gauge).
Captured Last Flare retains its enemy-interval cooldown in addition to recovery.
Support skills still spend Gauge and consume
the character's one action.

## Stats and formulas

Training enemies use identical wave1 values below. Later levels use shared
accelerating curves reaching9,000 HP/1,200 Attack/400 Defense at Lv120 (D-289),
with extra exponential acceleration above25, without a sudden endgame spike.
Species retain identity, not different stats; equal-level/rank hostiles are
consistent across activities. Enemy levels plateau120 while waves continue. Characters follow linear core growth
and separate bounded potency; see [progression](units-and-progression.md).
Seen creatures save at encounter entry; first kill unlocks the Home glossary's
drop pool. Discoveries and rewards commit together before death presentation.

| Character | HP | Base defense | Effective defense | Base damage | Critical chance |
| --- | --- | --- | --- | --- | --- |
| Infernis | 220 | 10 | 10 | 38 | 15% |
| Tizu | 260 | 16 | 24 (passive) | 30 | 10% |
| Flora | 190 | 8 | 8 | 32 | 20% |

| Enemy (wave 1) | HP | Defense | Damage | Critical chance |
| --- | --- | --- | --- | --- |
| Goblin | 83 | 4 | 22 | 12% |
| Imp | 83 | 4 | 22 | 12% |
| Rock Golem | 83 | 4 | 22 | 12% |

Damage (D-165): `max(1, round(baseDamage * multiplier * criticalModifier /
(1 + defense / baseDamage)))`; zero base Attack resolves to the one-damage floor.
Character stats and flat shield/heal potency retain fractional progression values.
The rounding above applies only to attack resolution, not stored/resolved Attack
or Defense; use full-precision stats and round once after mitigation. All stat readouts,
floating amounts, logs and reports format up to two decimals without changing
combat precision. Burn ticks, Defense-mode reduction and percentage healing keep
their existing resolution rounding. Zero-base stats remain zero.
Critical modifier uses the attacker's Critical Damage Multiplier (1.5x at base)
on a critical hit, otherwise 1. Defense gives attack-relative diminishing returns:
equal Defense and base Attack mitigate50%; twice that Defense mitigates two-thirds.
Skills, Weaken and crits modify outgoing damage, not the mitigation ratio.
Defense pierce reduces the Defense input before mitigation. Shields absorb calculated damage before health; HP floors at
zero. Healing caps at maximum HP and never revives. Burn bypasses defense but
still consumes shield before HP. There is no elemental advantage multiplier yet.
All characters also have Elemental Gauge capacity (100 at base) and Elemental Damage
(Infernis 8, Tizu/Flora 0 because their current kits have no damaging elemental
status). Burn uses Elemental Damage times its skill coefficient. Both the
Attack Damage stat and skill damage coefficient grow with progression; this
two-factor effect is intentional. See [seven-stat growth rules](units-and-progression.md).

Critical rolls and enemy target selection use a seeded xorshift32 generator.
Initial Adventure seeds come from browser crypto; a fixed seed reproduces rules
in tests. Critical rolls occur independently per target; enemy attacks choose a
random living ally. This is not an authoritative or monetized online battle system.

## Implemented starter kits

### Infernis

- **Unbroken Ember (passive):** multiply outgoing damage by 1.2 at or below
  exactly 50% HP.
- **Cinder Cleave:** 160% damage to one enemy; if it survives, apply 8 burn damage
  at the start of its next two enemy phases. Refreshes, does not stack.
- **Flame Arc:** 110% damage to every living enemy.
- **Last Flare: Dawnfire:** 280% damage to every living enemy.

### Tizu

- **Stillwater Guard (passive):** +8 defense, included in the battle display.
- **Undertow Thrust:** 150% damage to one enemy; if it survives, its next two
  enemy-phase attacks use a 0.75 damage multiplier. Refreshes, does not stack.
- **Tidal Shelter:** refresh every living ally's shield to at least 25; do not
  add 25 to an existing shield.
- **Last Flare: Ocean Memory:** 220% damage to all enemies; refresh ally shields
  to at least 35.

### Flora

- **Root of Hope (passive):** at every subsequent player-turn start, while
  Flora lives, heal each living ally for `round(maxHP * 0.05)`, at least 1.
- **Briar Shot:** 150% damage to one enemy with +20 percentage points crit chance.
- **Verdant Renewal:** heal every living ally for 30.
- **Last Flare: Worldseed:** 180% damage to all enemies; heal living allies for 55.

## Resolution order

Validate phase, living actor, action allowance, recovery, resources, cooldown, and
target -> clone state -> spend action/Elemental Gauge, apply attack gauge gain, and
set ultimate recovery/retained Last Flare cooldown -> damage and
statuses -> support effects -> outcome check.
Invalid operations throw explicit errors without modifying the previous state.

On ending a turn, each living enemy takes its burn tick, then (if still alive)
attacks a living ally, who gains Elemental Gauge after damage. Its weaken duration
decrements after its attack.
Check defeat/clear, then advance the round and apply Flora' passive if the battle
continues. An enemy killed by burn does not attack. No dead-target retargeting is
needed for player actions because each action validates its current target.
Defeat is terminal until restart. There is no revival or simultaneous reflected damage.

## Hotkeys and feedback

| Command | Default |
| --- | --- |
| Next ally / Next enemy | C / T |

Attack/Defense/ability hotkeys and global Space end-turn/next-wave are disabled.
Change only selection bindings in Settings -> Battle selection keys. Every command needs a
distinct supported key; duplicates/unsupported/corrupt mappings report errors.
Use physical keyboard positions (`KeyboardEvent.code`). Browser modifier shortcuts,
held-key repeats, and typing in form fields are ignored. Mobile uses buttons.
Bindings persist under `last-light.hotkeys`, independently of motion/profile saves.
Legacy attack/Heavy/Defense/end-turn fields are ignored; custom ally/target
selection keys are retained in memory without rewriting storage.
Unsupported or duplicate selection keys fail explicitly. Space cannot be assigned.
Native Enter/Space activation of a focused button remains standard accessibility,
not a global battle shortcut.

## Battle cinematics

### Skill portrait cut-ins and enemy skill kits

Field ability light uses the shared two-scale emission bloom and elapsed-time
simulation described in the [canvas rendering contract](combat.md#canvas-ability-previews-and-rendering-validation)
(D-284). Smoothed release, trails and localized Last Flare radiance change only
presentation; targeting, impact callbacks, costs, combat RNG and saved rewards
are unchanged.

Only Last Flare/ultimate attacks begin with an angled elemental portrait ribbon
using current evolution art, character name and actual ability name (D-283).
Normal attacks, Defense, Skill1 and Skill2 skip the banner, including support
skills; their battlefield VFX and impact presentation remain.
Last Flare banners slide in from the ally side and last **3500ms at1x**.
Last Flare retains its taller ornate sigil/portrait and stronger framing.
The reveal takes12%, a stationary reading hold runs from12% to90%, and a
stationary opacity fade-out takes the final10% (350ms at1x), without sliding or
scaling away. No drifting/zooming copy
during that hold. High-level enemy ultimates (Lv50+) use mirrored enemy-side
cut-ins; ordinary enemy skills do not show banners.
Owner chose to retain speed scaling: divide these durations by1/2/3 normally,
including live speed updates. Total duration is3500/1750/about1167ms at1/2/3x;
the stationary reading hold is2730/1365/910ms respectively.

`battle-cutin.css` owns the elemental gradient ribbon, diagonal bands, engraved
double rings, diamond crest, luminous edge rails and divider. The ability name
is the large serif centerpiece; caster name and Skill/Enemy Skill/Last Flare/
Boss Ultimate labels are subordinate. Remove no-glow prompt policy confusion:
these are runtime UI/VFX, not generated cutout artwork. Neutral battle UI no
longer replaces this ribbon with a separate rectangular text backing.
Pending-art enemies use an honest neutral token instead of borrowed art.
Cut-ins ignore pointer input, do not move the field and never require dismissal.
Reduced motion skips them entirely. Nodes clean up in finally/disposal; attack
impact/HP updates occur only after cut-in and windup. No extra attacks/reward rolls.

Every real enemy has exactly one skill belowLv50, two atLv50+, including Adventure.
Adventure primary skills are Wildwood Ambush/Cinder Mischief/Faultline Crush,
multiplier`1.2+(level-1)*.004`, every3 turns. Dungeon/infusion primary skills
retain authored names but use the same level coefficient, every3 ordinary turns/every2 boss
turns. FromLv50, ordinary secondary **Overdrive** is1.25x primary damage every5
turns; boss secondary **Last Ruin** is an ultimate,
`max(2.6, primary*1.65)`, every6 turns. BelowLv50 bosses have one non-ultimate
skill, respecting the level-based count. Secondary/ultimate takes priority when
due with the primary. Otherwise use one normal attack. Weaken/Defense/shields/
critical damage and RNG rules still apply to the single resolved hit.
The collapsed rules include each current enemy's skill names, damage multipliers,
schedule and due-this-turn state. Skill selection draws no additional randomness.
Tune `content/enemy-skills.ts`; events carry actual skill action/abilityName so
boss ultimates also receive ultimate impact effects, not just portrait changes.

### Progression-scaled cinematics and formations

`presentation/battle-effects.ts` controls cosmetic power:
ally `min(1,.65*level/105+.35*(evolution-1)/5)^1.5`, enemy
`min(1,level/120)^1.5`. Normal hits grow from4 to20 sparks and1 to4 rings;
final Last Flare has32 sparks,5 rings and12 rays at2.25x effect size.
Skills intensify over Normal; scheduled enemy abilities mark `enhancedAttack`
on attack events, leaving damage/action rules unchanged.
Flame slashes, tidal rings, leaf bursts, gold/red Heaven rays and purple/pink
Abyss void rings have distinct styles. Source-target trails and two-axis lunges
follow actual art centers. No extra damage, RNG draws, full-screen flashes or
camera shake. Layer counts are bounded; temporary nodes are removed in finally.
Reduced motion bypasses attacks entirely, preserving saved results/static loot.

Enemy groups occupy staggered triangular slots on the left; allies mirror them
on the right. Single bosses and solo characters keep their grand scale.
Mobile stacks stagger toward each side's edges without crossing the center.
Names, HP/Defense/Shatter, target selection and entrance animation remain intact.

Battle text uses opaque dark backing, high-contrast light colors, at least 14px
for unit stats/gauge/action details and 16px for instructions/logs. Disabled actions
retain readable text and explain their resource/cooldown/recovery restriction;
only defeated artwork fades, not the defeated character's labels.

Animations use the supplied transparent illustrations: lunges, elemental strike
overlays, larger Last Flare effects, and floating damage/heal/shield numbers.
They are illustrative effects, not skeletal/frame-by-frame character animation.
Input is locked while a resolved event sequence plays. Reduced motion skips
movement without changing rules. Navigation and motion changes cancel active
animations safely. A visible error is shown if animation fails, preserving results.
Recent battle logs are bounded to 40 events.

## Implementation and validation

- [Balance and ability content](../src/content/combat.ts)
- [Pure combat engine](../src/game/battle.ts)
- [Battle presentation](../src/presentation/battle-view.ts)
- [Hotkeys](../src/game/hotkeys.ts)
- [Local Prismatica wallet](../src/game/wallet.ts)
- [Reward and wallet tests](../src/game/wallet.test.ts)
- [Exact combat tests](../src/game/battle.test.ts)
- [Defense and Heavy-removal tests](../src/game/defense.test.ts)
- [Directional gesture mapping](../src/presentation/battle-gesture.ts)
- [Gesture threshold/direction tests](../src/presentation/battle-gesture.test.ts)
- [Hotkey tests](../src/game/hotkeys.test.ts)
- [Asset processing](art-workflow.md#supplied-character-and-enemy-art)

Run `npm test` and `npm run build`. Tests cover rounding/crit/defense, one action,
exact recovery and cooldown boundaries, every kit, passives, status durations,
shield/heal bounds, deterministic resolution, waves/defeat, and hotkey persistence.
Defense tests cover exact reduction-before-shield arithmetic, one-action use,
gauge/recovery behavior, expiration at turn/wave boundaries and removed Heavy
rejection. Gesture tests cover four directions, the exact 32px threshold, short
drags, ties and invalid coordinates; hotkey tests cover legacy binding migration.
Browser checks cover all ability buttons, remapped commands, single-listener
lifecycle, animation creation/cancellation, reduced motion, and side placement.
