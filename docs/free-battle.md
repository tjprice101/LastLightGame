# Free Battle

**Status:** implemented practice mode, 2026-10-04. The owner approved an initial
editable balance set. Shatter Gauge costs/gains are owner-approved; only ultimates
force next-turn recovery, superseding the earlier heavy-attack recovery rule.
This is not production balance or a rewarded story mode.

## Entering and leaving

Home's **Enter Free Battle** button opens the activity.
Free Battle is a separate full-viewport field screen, without the sanctuary
header, primary navigation, or footer. Scenery fills the viewport; transparent
unit art stands on the field without blue card borders. Detached dark name/stat
readouts preserve contrast. The compact bottom HUD retains all five actions,
hotkeys, resource/cooldown/recovery feedback, end turn, and restart. Full ability
descriptions/passive/rules and the log are available in disclosures.
**Quit Battle** returns Home, preserving the current in-memory session and earned
Fractalis. Settings remains available and suspends battle input while open.
Small screens allow vertical scrolling rather than clipping controls; the scenery
stays full-screen behind the content. This uses the browser viewport, not the
permission-gated Fullscreen API.
Choose Infernis (fire), Tizu (water), or Flores (grass) at the start. Free Battle
uses **only your saved starter**, not a temporary team. Entry, restart, and later
waves preserve that identity; no additional units or items are granted.
Every newly defeated enemy drops a random integer **5-10 Fractalis**, including
burn kills and each target of a multi-enemy attack. The drop appears above the arena
and in the log. The running balance appears in the currency strip.
Rewards are saved immediately, before committing battle state/playing animations;
leaving, defeat, restarting, and reloading do not remove earned currency.
Already defeated enemies never drop again. A failed wallet read/write leaves the
action/state uncommitted and shows an error; retry uses the same reward result.
Reward randomness is separate from combat randomness.
Existing water/grass saves continue normally without forced fire re-selection.

Enemies are on the **left**, allies on the **right**, including mobile layouts.
The screen uses the supplied [grassy-field scenery](art-workflow.md), with
aspect-preserving cover cropping and detached dark readouts for readable stats.
Your character's action kit is selected automatically. Click an enemy to target it. Select an action,
then finish the player turn with **End turn / enemy attacks**. Unused ally actions
are forfeited when ending the turn. There is no automatic turn ending.

Every wave has a Goblin, an Imp, and a Rock Golem. Enemy HP/damage scale by
`1 + 0.12 * (wave - 1)` with rounding; defense increases by
`floor((wave - 1) / 2)`. Clear a wave, then explicitly choose Next wave.
Continue until defeat, exit, or a confirmed restart. Health, shields, Shatter Gauge,
skill cooldowns, and recovery carry between waves; defeated allies stay defeated.
Flores' living passive still applies at the new-turn boundary.

Switching menu tabs preserves the practice session for the current page lifetime.
Reloading starts a new practice session. Leaving during animation cancels only
presentation; the already resolved state is retained.

## Actions and recovery

Each living character may perform **one** action per player turn:

| Action | Rule |
| --- | --- |
| Light Attack | 100% damage to one target; gain 20 Shatter Gauge |
| Heavy Attack | 180% damage to one target; gain 30 Shatter Gauge; can attack next turn |
| Ability 1 | Character-specific effect; costs 25 Shatter Gauge; two-turn cooldown |
| Ability 2 | Character-specific effect; costs 40 Shatter Gauge; three-turn cooldown |
| Last Flare | Character-specific ultimate; costs 100 Shatter Gauge; no action next turn |

Every character has an independent **Shatter Gauge**, starting at **0**, capped at
**100**. Light/Heavy gains apply once per action, not once per target. Each incoming
enemy hit adds **10**, including shield-absorbed and lethal hits; critical hits do
not increase the gain. Burn, healing, shields, passives, and ability casts do not
generate gauge. Skills and Last Flare require and spend their exact costs; spending
does not generate gauge. Gauges persist between turns/waves, but reset on restart/reload.

Skills do not force recovery. Cooldown "2" means using it on turn
1 makes it usable again on turn 3; cooldown "3" becomes usable on turn 4.
A Last Flare on turn 1 blocks every action on turn 2 and allows actions again
on turn 3. The rule also applies when a wave is cleared by that action.
Light, Heavy, and skills allow another action on the next turn (subject to gauge
and the selected skill's cooldown). Support skills still spend gauge and consume
the character's one action.

## Stats and formulas

| Character | HP | Base defense | Effective defense | Base damage | Critical chance |
| --- | --- | --- | --- | --- | --- |
| Infernis | 220 | 10 | 10 | 38 | 15% |
| Tizu | 260 | 16 | 24 (passive) | 30 | 10% |
| Flores | 190 | 8 | 8 | 32 | 20% |

| Enemy (wave 1) | HP | Defense | Damage | Critical chance |
| --- | --- | --- | --- | --- |
| Goblin | 110 | 5 | 23 | 10% |
| Imp | 90 | 3 | 28 | 15% |
| Rock Golem | 160 | 15 | 20 | 5% |

Damage: `max(1, round(baseDamage * multiplier * criticalModifier) - defense)`.
Critical modifier is 1.5 on a critical hit, otherwise 1. Defense is flat reduction,
not a percentage. Shields absorb calculated damage before health; HP floors at
zero. Healing caps at maximum HP and never revives. Burn bypasses defense but
still consumes shield before HP. There is no elemental advantage multiplier yet.

Critical rolls and enemy target selection use a seeded xorshift32 generator.
Initial practice seeds come from browser crypto; a fixed seed reproduces rules
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

### Flores

- **Root of Hope (passive):** at every subsequent player-turn start, while
  Flores lives, heal each living ally for `round(maxHP * 0.05)`, at least 1.
- **Briar Shot:** 150% damage to one enemy with +20 percentage points crit chance.
- **Verdant Renewal:** heal every living ally for 30.
- **Last Flare: Worldseed:** 180% damage to all enemies; heal living allies for 55.

## Resolution order

Validate phase, living actor, action allowance, recovery, resources, cooldown, and
target -> clone state -> spend action/Shatter Gauge, apply attack gauge gain, and
set ultimate recovery/skill cooldown -> damage and
statuses -> support effects -> outcome check.
Invalid operations throw explicit errors without modifying the previous state.

On ending a turn, each living enemy takes its burn tick, then (if still alive)
attacks a living ally, who gains Shatter Gauge after damage. Its weaken duration
decrements after its attack.
Check defeat/clear, then advance the round and apply Flores' passive if the battle
continues. An enemy killed by burn does not attack. No dead-target retargeting is
needed for player actions because each action validates its current target.
Defeat is terminal until restart. There is no revival or simultaneous reflected damage.

## Hotkeys and feedback

| Command | Default |
| --- | --- |
| Light / Heavy | Q / W |
| Ability 1 / Ability 2 | E / R |
| Last Flare | F |
| End turn / Next wave | Space |
| Next ally / Next enemy | C / T |

Change all eight bindings in Settings -> Battle hotkeys. Every command needs a
distinct supported key; duplicates/unsupported/corrupt mappings report errors.
Use physical keyboard positions (`KeyboardEvent.code`). Browser modifier shortcuts,
held-key repeats, and typing in form fields are ignored. Mobile uses buttons.
Bindings persist under `last-light.hotkeys`, independently of motion/profile saves.
Actual bindings are displayed on the action buttons and battle instructions.

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
- [Local Fractalis wallet](../src/game/wallet.ts)
- [Reward and wallet tests](../src/game/wallet.test.ts)
- [Exact combat tests](../src/game/battle.test.ts)
- [Hotkey tests](../src/game/hotkeys.test.ts)
- [Asset processing](art-workflow.md#supplied-character-and-enemy-art)

Run `npm test` and `npm run build`. Tests cover rounding/crit/defense, one action,
exact recovery and cooldown boundaries, every kit, passives, status durations,
shield/heal bounds, deterministic resolution, waves/defeat, and hotkey persistence.
Browser checks cover all ability buttons, remapped commands, single-listener
lifecycle, animation creation/cancellation, reduced motion, and side placement.
