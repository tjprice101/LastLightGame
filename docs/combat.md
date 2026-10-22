# Combat specification

## Linear allied damage-over-time scaling (D-381)

New allied DoT applications receive an additional `1 + sourceLevel / 30`
multiplier: Lv.0 x1,30 x2,60 x3,90 x4 and105 x4.5. This supplements existing
Attack/Skill Power growth, not a replacement curve. Scale the unrounded
application and round once at the existing damage snapshot boundary.
The no-progress base fighter (`level: null`) remains equivalent to Lv.0.
Invalid numeric levels are rejected explicitly.

Burn is currently the game's periodic damage status. Its shared application
path covers native/general allied applications and Conduit-enhanced Burn;
Cinder Testament's additive growth stores the same level-adjusted base.
Enemy-origin DoTs, traps and delayed direct packets are unchanged. Tick,
detonation, copied spillover and actual-damage-derived Master healing use
their existing stored/actual damage without another level multiplier.
There are no independently authored current-production Conduit DoTs outside
that shared Burn path; copied historical Conduit Burn remains a stored copy.

Keep existing pending snapshots, source ownership, strongest-only refreshes,
durations, costs, recovery, RNG and saves. The stronger Burn intentionally
changes the seeded late-boss benchmark: the equipped starter squad at seed1729
now clears Roses and all three War finals; seeds1/12345 still lose those
encounters, and unequipped final activity attempts still fail. Do not retune
enemies to cancel this approved buff.

Validate `damage-over-time-scaling.test.ts`, `battle.test.ts` and
`enemy-progression.test.ts`, plus the full equipment/native/authority suite.
Hosted disposable-account check:
`node tools/smoke_server_game.mjs --dot-scaling`.

## Last Flare potency (D-378)

All16 Element-Bearers receive3x their previously live Last Flare damage and
1.5x non-damage potency. This includes delayed/stored native damage, healing,
shielding, bonuses, mitigation and Defense ignore, not ordinary skills or
independent Conduit-generated effects. Gauge costs, recovery, durations,
resource counts, target eligibility and snapshots are preserved.
[Exact roster values and scope](character-identity-redesign.md#current-tuning-and-implementation).
Validate `last-flare-balance.test.ts`, native kit/content/presentation suites
and `native-identities-server.test.ts`; hosted release check:
`node tools/smoke_server_game.mjs --last-flare`. specification

## Phase 0 activated release (D-368/D-370)

The [owner-edited catalog](conduit-catalog.txt) is the approved target for the
ten-stat overhaul and all138 equipment effects. It supersedes earlier effect
designs under rules5. The shared client/authority gate is enabled for the
owner-authorized coordinated release. Historical conflicting rules below are
superseded, not additive; hosted release status is in the handoff.

Preserve existing Health, Defense, Direct Attack, Critical Rate, Critical
Damage Multiplier and Elemental Gauge Capacity growth. New base stats have no
level growth: Skill Power100%, Skill Duration0 additional turns, Skill
Efficiency0% and Elemental Gauge Gain100%. Skill Power replaces separate
Elemental Damage scaling for skills, not Normal Attack, critical probability,
Gauge receipts or generated equipment effects. Add bonuses before one
application; stored, converted and released damage must not scale twice.

Skill Duration adds whole turns to timed skill effects, equipment bonuses
capped at+2; it does not alter cooldowns, recovery, delayed payout timing,
action grants or instant effects. Skill Efficiency discounts the original
skill cost additively, capped at50%, rounding the final cost upward once;
Skill1/2 cost at least1 and Last Flare at least70 unless an explicit named
override applies. All positive Gauge sources use the recipient's Gauge Gain
once, rounding once. Conduit grants expressed as percentages use that
recipient's maximum capacity before Gain. Capacity increases never fill Gauge.

The catalog header also owns proc provenance, strongest-only duplicate auras,
expiry, shared extra-action/rescue limits and mitigation caps. Verifying
catalog text or an isolated stat calculator is not runtime-effect verification.
Activation requires per-entry behavior tests, native/captured compatibility,
frozen-run handling and matching client/authority validation.

Implemented in the activated release:

- Cost previews are read-only and use the selected target. Menus, gestures,
  action payment and authority prevalidation share that target-aware cost.
  Actor selection and automatic turn advancement consider any legal action,
  including Throne's paid Skill1/2 when Normal Attack is unavailable.
- Next-action/next-skill Conduit tokens use a two-player-turn expiry and
  refresh rather than accumulating across casts. Consuming an eligible token
  does not consume unrelated Normal-only, damaging-skill or Last Flare tokens.
- Native timed support snapshots include applicable Power/Duration; they do
  not extend Seed maturity or Razor's delayed Shield payout clock. Instruction
  support potency applies additively only to healing/Shield packets, not the
  damage portion of a mixed skill. Generated healing respects received-healing
  bonuses before its final per-recipient cap.
- Non-Defense reductions multiply before enforcing the20% damage floor.
  Generated proc Shields have finite clocks, independent of native duration.

The [138-entry behavior matrix](conduit-behavior-matrix.md) records726 executed
numerical scenarios: each of90 ordinary entries absent and at+0..+5, and each
of48 named Masters equipped and absent. Separate integration tests verify
generated Master Shield isolation, manual-packet modifiers, stored Power,
strongest-only duplicate auras, additive pre-equipment stat pools and Defense
caps. Atlas/Leviathan count one enemy attack rather than each impact; rounded
Gauge receipts respect their per-turn caps. All138 default descriptions and
90 ordinary upgrade descriptions are checked independently of behavior.
This is local implementation evidence, not deployment or universal balance
certification. See the current [handoff](handoff.md) for exact validation.

## Phase3 hostile strength and visible scaling (D-326)

Owner selects a5% increase to hostile HP, Attack and Defense, not a5%
increase to exponential rates. `enemyStrengthMultiplier=1.05` multiplies the
unrounded shared shifted-exponential result before its one final rounding.
Rates, level ranges, ordinary/boss base ratios, skill patterns, critical stats,
shields, healing, rewards and RNG are unchanged. At very low Defense, integer
rounding may leave a displayed stat unchanged or make its rounded increase
larger than5%; do not apply another multiplier in individual activity spawns.
Training, Story, all material/infusion/currency/Machines/Rose activities,
Elemental War and every Calamity tier share this curve. Playable characters,
captured copies and their growth/equipment are not strengthened or rebalanced.

The standard for every enemy identity is the shared ordinary enemy at its
actual level. Boss rank is an explicit modifier, not a hidden activity bonus.
There are currently no additional per-species or per-activity stat multipliers.
Activity previews and compact/full battle readouts compare actual immutable
spawn stats with that baseline. Above-baseline HP/Attack/Defense show signed
red percentages; below-baseline stats show signed blue percentages. Each stat
is colored separately; unchanged stats are omitted and an unchanged enemy
shows "Standard Lv.N stats." The comparison labels boss scaling explicitly.
Current HP loss, shield size, Burn, Weaken and other temporary effects do not
alter the spawn-stat comparison; existing effect readouts remain separate.
Small nonzero changes below0.05% show signed `<0.1%`, never a misleading zero.

Existing frozen encounters are preserved through Settings/resume without
load-time rewrites or a rules-version restart. Fresh encounters use the new
curve. A historical snapshot's actual stats can therefore show below-current-
baseline scaling. Client and generated authority must deploy together for
new-spawn parity; no wallet migration or retrospective reward changes.

The former Rosetta/Thornia/Flora four-Omnic+5 benchmark now loses all36 EX+1
activity/seed cases after this intentional increase. Preserve that difficulty
wall rather than buffing characters or weakening enemies to restore old wins.
The Lv13-vs-unequipped-Lv0 regression retains its9% minimum-hit check; its
former50% upper bound becomes55% to allow the selected stronger Attack.

Validate exact1.05 pre-round output at every level1-185 and both ranks with
`src/content/stat-growth.test.ts`; activity/field/menu comparisons and mixed
red/blue signs with `src/presentation/enemy-strength.test.ts`; full progression,
Calamity and authority tests plus narrow-screen battlefield layout.

## Visible level baseline (D-322)

Level and rank set the same hostile base stats across activities; the existing
overlapping level ranges are intentional, not hidden activity multipliers.
Stage-entry previews show actual HP/Attack/Defense and any difference from a
standard same-level enemy. Boss shields, healing, targeting and skill patterns
remain separate mechanics, not promised damage values.
See [activity previews and validation](menus-and-inventory.md#visible-enemy-strength-d-322).

## Distinct native identities and ally targeting (D-316)

All16 Element-Bearers use the approved
[native identity contract and current tuning](character-identity-redesign.md),
replacing rather than stacking old native passives/charges. Captured members
retain their source kits, missing-slot rules and level60 ceiling. Normal Attack,
Defense, base stats, critical fundamentals, Gauge costs and recovery remain.

Tizu Skill2, Bruno Skill2 and Disciple Skill1/2 require an explicit living-ally
selection from either hold-grid or Battle menu. Opening/cancelling that picker
spends nothing and submits no authority command. Bruno excludes himself when
another living ally exists; solo Cover explicitly offers self. The selected
enemy is independent and unchanged. Confirmed recipients are revalidated before
any action state mutates; disposal closes the picker and restores focus safely.

Native primary direct impacts aggregate equipment triggers once. Fixed native
follow-ups carry typed provenance and cannot crit, earn Gauge, consume another
Instruction or recursively activate equipment actions. Cover routes its share
once with25% reduction, without a second Defense/redirect/Foundation/Wounds
pass. Finite Foundation absorbs20% of remaining direct damage before personal
shields. Shared temporary damage reductions cap at60%; Burn bypass, precise
Weaken, ordinary critical RNG, shields and existing lethal safeguards remain.

Readouts show actual state/owners/targets/clocks, including Bliss posture,
Tizu timed shields, Aurora's next scheduled special, blade locations, Seeds,
Combo, Quarry and finite durability. Mechanic VFX reuse the impact ledger,
speed/reduced-motion controls and disposal rather than simulate extra actions.
Rules version3 restarts only historical current encounters with frozen teams
and saved rewards retained; current runs survive Settings/resume unchanged.
See [equipment compatibility](character-conduit-compatibility.md) and the
[handoff](handoff.md) for validation and separate publication requirements.

## Nonblocking battle errors (D-314)

Rejected actions and battle operation failures use a pointer-transparent alert
overlay just above the footer. The message never contributes to footer height
or shifts the battlefield, steals focus, or introduces an action lock. Existing
operation/presentation busy states remain unchanged. Keep accessible alert
announcements and the existing error logging.

Messages remain visible for three seconds, fade over250ms, then clear. A new
error replaces the previous message and restarts its lifetime, even during the
fade. Reduced motion removes the opacity transition. A battle render dismisses
the current message; rendering and disposal cancel its pending timers.
Validate timing, replacement, cleanup and retained controls with
`src/presentation/battle-toolbar.test.ts`; check unchanged arena/footer geometry,
viewport bounds and pointer pass-through in desktop/mobile browser fixtures.

## Per-member hold/drag attack grid (D-307)

Press and hold any available allied battlefield member to show that member's
Normal Attack, Skill1, Skill2 and Last Flare directions, icons, Gauge costs and
availability. All three squad positions use the same interaction, including
captured Elemental-Devourers. Releasing a direction commands the pressed member,
not the leader, in offline and authoritative online play. Existing action,
Gauge, missing-slot, recovery and Last Flare restrictions remain unchanged.

The fixed-position guide is attached directly to the battle root, not inside
the member button: staggered/transformed units otherwise create a containing
block and push the viewport-positioned grid off-screen. Preserve the member's
element accent and clamp the guide near their artwork within the viewport.
Center release, pointer cancellation, lost capture and disposal remove it;
concurrent pointers cannot replace an active guide or cause duplicate actions.

Validate with `src/presentation/battle-squad-gestures.test.ts`, existing
gesture/shortcut tests, and three-member desktop/mobile browser fixtures.

## Successive-turn squad abilities (D-300)

Skill1 and Skill2 have no cooldown for all16 Element-Bearers and all captured
Elemental-Devourers. They can repeat on consecutive player turns, provided the
caster is alive, has not acted this turn and can pay the unchanged25/40 Gauge
cost. This does not grant extra same-turn actions or refill Gauge.
Existing run snapshots' old skill readiness dates do not block ordinary skills;
their frozen stats, potency, equipment and resources remain unchanged.

Last Flare retains its100 Gauge cost and mandatory full next-turn recovery.
Captured Last Flare also retains its original enemy-interval cooldown.
Missing captured slots remain unavailable. Hostile skill schedules and saved
capture interval metadata are unchanged; ordinary retained intervals no longer
create playable cooldowns. Existing cooldown-reduction Conduit rules are not
rebalanced or replaced and cannot grant additional actions.
This supersedes earlier ordinary-skill cooldown requirements.

## Artwork-led battlefield sizes

Battlefield size follows the design, not a solo/squad bonus or the encounter's
boss flag. All16 Element-Bearers share the same body baseline, with bounded
ensemble scales1/1.08/1.16/1.3/1.5/1.65 across their six forms. War opponents
use the identical character-form scale. This replaces the previous up-to2.7x
form inflation and separate solo ally/solo enemy sizing.

All151 installed enemy designs have reviewed artwork-keyed size bands
(.65/.85/1/1.25/1.5/1.75). Small wisps, insects and minor creatures stay small;
stags, large beasts and armored bodies are substantial; leviathans and colossi
have imposing complete silhouettes. Story is explicitly covered, rather than
falling through to the smallest generic scale. Briarback Stag is1.25 compared
with Evo3 characters1.16; Mossplate Beetle is.65 and Heartwood Colossus1.75.
No name-based guessing, level multiplier or additional boss inflation.
Captured copies keep the same artwork scale in any activity; merged dungeon
families use the actual rendered artwork rather than the first family's tier.
Named artwork-pending tokens stay neutral; unreviewed image IDs report an error.

Both sides use equal-width arena columns and one responsive base constrained
by arena height, width and the larger roster count. Phones retain the same
artwork ratios, instead of discarding the scale variable. This supersedes
D-227's side-specific squad caps/negative overlap margins, not facing,
silhouettes, gestures, cut-ins or artwork exports. Exact character/enemy
stats, RNG, rewards and saved snapshots are unchanged.
Cramped landscape arenas retain vertical scrolling when full readouts cannot
fit, keeping cards reachable without painting over the footer.

### Battlefield silhouette contrast

Every battlefield sprite has a static alpha-following dark edge, narrow pale
rim and soft dark shadow. This separates green/brown enemies from matching
scenery and retains contrast against both light and dark backgrounds, even
when unselected. The filter is confined to sprite images, not rectangular art
slots, readouts or VFX. Selected/ultimate glows and fallen grayscale/opacity
remain on their existing outer wrappers. No recoloring, artwork changes,
additional animation, sizing or facing changes; captured allies share the
same treatment. Menus and cut-ins are unaffected.

## Allied effect presentation (D-211)

The shared HP readout displays actual remaining Shield, timed outgoing Damage
buffs, Defense, one-hit protection and recovery. Optional typed BattleEvent
buff snapshots preserve event-time values for character and equipment sources;
presentation tracks pre-action snapshots and applies them at impact without
reading future final state. Legacy shield events remain supported. This changes
presentation metadata only, not combat math, effects, clocks or RNG.
[Full UI/copy contract](menus-and-inventory.md#active-allied-effects-and-clear-ability-copy-d-211).

## Progressive build reliance (D-288)

The owner requests approximately linear playable growth against accelerating
enemies, with Conduits and a reliable team increasingly necessary. This
supersedes D-052/D-192's cubic character growth and former hostile endpoints,
not level caps, acquisition, costs, RNG, rewards or activity access.
All16 Element-Bearers use
`G = 1 + .15*level + 1.5*(evolution-1)`: each level adds15% of base core
stats and evolution adds150% of base, rather than compounding previous gains.
HP/Attack/Elemental Damage, flat ability healing and shields use G; Defense
retains G^0.7. Separate bounded percentage/Gauge/skill potency is unchanged.

### Consistent level-and-rank difficulty (D-289)

The owner reports the six Story regions remain too easy and requests stronger,
consistent enemies across all activities, with above-player-level enemies taking
meaningful effort. All hostile spawns share the complete `enemyCombatStats`
result: Story, Training, material dungeons, infusions, currency missions,
Machines, Roses and War. Species retain names, elements, artwork and skill
names, not different opening stats or critical rates. No Story discounts.
Equal level and rank mean equal stats and scheduled skill strength; bosses
remain stronger than ordinary enemies. Enemy count and player squad/build still
affect total encounter difficulty. There is no hidden player-level modifier.

### Smooth exponential pursuit and intentional walls (D-319)

Owner explicitly requests game-wide exponential hostile growth, not character
buffs to keep pace. This supersedes the old D-289 endpoints, quadratic event
extension and easy-clear/upper-hits-to-kill targets. Difficulty walls are
intentional. No hidden player-level adjustment or encounter-specific stat
discount; Story, Training, dungeons, infusions, events, War and Calamity all use
one level/rank curve. Activity level schedules and Training's level120 cap stay.

For level L from1 through185, opening B, initial slope S and exponent R:
`round(B * (1 + S * expm1(R * (L - 1)) / R))`.
HP uses S=.45/R=.026, Attack .25/.024, Defense .30/.020. Ordinary openings are
83/22/4 and boss openings207.5/27.5/(16/3), rounded only at the final boundary.
The shifted exponential retains opening values and readable early steps;
increments compound continuously, with no knots/plateaus at25,120 or140.
Calamity uses its actual145/160/185 levels, not small multipliers on140.

| Level | Ordinary HP / Attack / Defense | Boss HP / Attack / Defense |
| --- | --- | --- |
|1|83 /22 /4|208 /28 /5|
|38|2,406 /350 /70|6,014 /437 /93|
|60|5,307 /737 /139|13,268 /921 /186|
|105|20,107 /2,574 /424|50,269 /3,217 /566|
|120|30,344 /3,778 /592|75,860 /4,723 /790|
|140|51,962 /6,234 /911|129,906 /7,792 /1,215|
|145|59,364 /7,055 /1,013|148,411 /8,819 /1,350|
|160|88,325 /10,202 /1,387|220,814 /12,753 /1,849|
|185|170,430 /18,760 /2,323|426,076 /23,450 /3,097|

Shared Crit12%, critical multiplier1.5, Gauge capacity100 and Elemental
Damage0 remain; Calamity now shares that same critical profile rather than
its former8% override. Authored skills, boss patterns, targets and intervals
are unchanged. Character stats/kits, captured playable stats/retained skills,
equipment effects/+5 cap, acquisition, costs, rewards and unlocks are unchanged.
Eight ordinary slots retain the four matching-element Omnic maximum and
separate Master. Calamity's build target is a complementary fully developed
team with eight +5 pieces/member, including four relevant Omnic and a suitable
Master. Owner explicitly selects difficulty-only, not an equipment entry gate:
any legal team may attempt it, and clever lower-rarity builds may win.

Early Story entry and regional/Common-team checks remain, but solo material
entry and Common-only fodder access are no longer guaranteed. The old mixed
starter build loses all tested final Roses/War encounters, while final material
bosses and non-Rose staged bosses still have tested built routes. Common-only
fodder measurements include both wins and defeats. No character adjustment is
made to turn these losses into victories.

The [Calamity report](calamity-mode.md#isolated-stats-and-measured-difficulty)
measures648 seeded fights across two squads, three gear variants, twelve bosses
and three tiers. Four-Omnic +5 is a target, not proof of synergy or guaranteed
victory. All tested EX2/EX3 builds currently lose; do not describe those tiers
as proven clearable or lower the enemy curve to satisfy the retired clear floors.

Captured creatures also use **linear playable growth**, not the hostile curve:
base220 HP/38 Attack/16 Defense, factor `1+.15*level`, with Defense exponent.7
and unchanged fixed-form multiplier `.65+.35*tier/5`.
Their final-form Lv.120 reference is4,180 HP/722 Attack, not the former
200,000 HP; otherwise captures would bypass the entire balance.
Saved levels, retained skills, UUIDs, locks and holdings remain untouched.
Captured-kit validation accepts either an exact complete current or historical
authored skill set, not a mixed/forged set. Existing saved coefficients remain
unchanged; metadata-free historical copies resolve historical skills. New
captures retain the defeated enemy's current level-based skills. No load write.
New Heaven/Abyss runs use the
[cap-aligned schedule](gameplay-and-elements.md#two-infusion-modes).
Existing runs without a schedule marker retain the old levels and loot across
Continue/Retry; new entry locks never invalidate a frozen active run.
Combat rules version4 uses the existing compatibility restart: a historical
current encounter restarts once at its current stage/wave with the frozen
squad/progress/gear/upgrades/Masters and a fresh receipt/run ID. Retain all saved
rewards/holdings, reject stale actions and show the restart notice. Current
version4 sessions stay untouched by Settings. No load-time account rewrite.

Validation: `npm test -- src\game\enemy-progression.test.ts
src\game\activity-access.test.ts src\game\defense-balance.test.ts
src\content\stat-growth.test.ts src\game\crimson-roses.test.ts
src\game\captures.test.ts src\online\server-game.test.ts --maxWorkers=2`.
Run the full suite and regenerate the server bundle whenever these rules change.
Signed-in battles execute the deployed Edge Function, not localhost combat code;
deploy the regenerated server bundle for tuning to reach online players.

## Enemy progression rebalance (D-192)

Historical hostile numeric tuning is superseded by D-288 above. D-192's
highest-owned-Element-Bearer activity gates, cap-aligned infusion schedule,
preserved legacy-run schedule/loot and absence of hidden level-gap penalties
remain current.

## Progressive character choreography (D-191)

All battle activities and authoritative responses use the same BattleView
entrance, cast, impact, portrait-banner and readiness-glow paths. Full animation
is still default; only explicit in-game Reduce motion disables it. Normal
attacks, both skills and Last Flare keep their actual names, effects and timing
of HP updates at impact. Combat, Gauge/costs/cooldowns, RNG and rewards are not
changed. Presentation-only speed remains 1x/2x/3x.

Each of the 16 Element-Bearers has a typed visual signature and weapon/caster
pose, rather than most of the roster falling back to generic force rings:

| Character | Signature / choreography |
| --- | --- |
| Infernis | Flame greatsword cleave / sweeping slash |
| Tizu | Three-pronged current / forward thrust |
| Flora | Unfolding petals / bow draw |
| Atmoso | Cyclone spirals / elevated staff cast |
| Aurora | Intersecting prism lenses / stationary cast |
| Bliss | Paired feather fans / twin sweep |
| Bruno | Faultline ridges / hammer windup |
| Disciple | Linked mindcrown / elevated psychic cast |
| Elise | Four-point star lattice / twin sweep |
| Razor | Eclipse bastion / braced guard strike |
| Rosetta | Rose mandala / bow draw |
| Thornia | Thorn battlements / braced guard strike |
| Crinso | Opposing connected blade geometry / twin sweep |
| Nerithe | Meridian current grid / trident thrust |
| Orvella | Citadel foundations / mace windup |
| Vaelor | Branching resonance / blade slash |

Independent bounded level and evolution factors prevent level 140 from
flattening all evolution tiers to the same intensity. Each successive evolution
increases power, scale and windup; ornament counts increase in discrete tiers.
Omnic Last Flare has up to six signature layers, eight sweeping arcs, five
shock rings, twelve rays and 32 sparks. Cast geometry appears around the source
before the impact ensemble; portrait banners retain their 3500ms base duration
and stationary 12%-90% reading hold, adding the same signature architecture.
Animate sprite wrappers, never portrait-facing images. Authored unit colors
drive highlights; no source artwork is changed or requested.

Captured creatures/enemies retain their real progression and use
element/family-derived geometry, without borrowing an Element-Bearer's personal
signature. Support casts remain at their caster rather than lunging at allies.

Development preview: [animation-preview.html](../animation-preview.html), served
at `/LastLightGame/animation-preview.html` by the existing Vite dev server.
Choose any of the 16 characters, six evolutions, actions, speed and activity;
Play animation resets its in-memory fixture; Replay entrance shows the real
slide-in. Real BattleView and pure combat resolution are used, but there is no
storage, account, server or reward persistence. Both preview HTML pages are
bundled build entries, but the battle studio retains its development-only guard.
Hidden-browser timing fixtures advance finite timelines explicitly;
those checks are not claims of natural wall-clock playback or owner approval.

### Canvas ability previews and rendering validation

The optical studio at `/LastLightGame/vfx-preview.html` exposes the16 character
profiles and four action tiers (64 presets). Seven procedural archetypes render
their geometry and optical passes; Last Flare includes character-specific
geometry. Shared archetypes are not proof that every ordinary skill has a
wholly distinct design. Owner visual approval remains separate from rendering
validation.

BattleView mounts the pointer-transparent canvas inside the positioned arena.
The runner uses its actual CSS dimensions and DPR-scaled backing buffer, with
caster/target centers relative to the canvas. Invalid/invisible anchors report
errors instead of substituting guessed positions. Frames clear the physical
buffer and isolate drawing state; cancellation settles pending playback and
frame failures reject into the existing battle error path rather than hanging
input. HP/shield/healing presentation runs at the authored charge/impact point;
already-resolved combat, costs, cooldowns, RNG and rewards are unchanged.
Reduced motion still bypasses animated effects.

**Attack wait recovery (D-286):** canvas playback uses actual elapsed time,
not a100ms-per-frame progress cap. Sparse frames therefore do not stretch the
input lock; reaching the duration skips expired simulation/bloom work while
still dispatching impact exactly once. Particle updates retain1/120-second
maximum steps. In-flight VFX read the current battle speed, matching sprite
animations. Cancellation remains available while waiting for impact numbers
after the effect ends; enabling Reduce motion cancels both canvas and WAAPI
playback. Resolved combat and rewards are never recalculated.

Online battle actions display a server-confirmation message before effects
start. Gameplay function requests abort after30 seconds if transport stalls,
then use the existing error/unlock path. A timeout does not prove the server
rolled back: retain the same request ID, revision and operation for an explicit
retry, never issue an automatic replacement attack. The owner's transient
crossed-out cursor report was not reproduced as a permanent freeze; disabled
controls alone do not identify whether the delay is network or animation.

**Bloom and fluid motion (D-284):** the studio and battle runner share a
transparent emission surface, two cached downsampled blur passes and crisp
foreground compositing. Only effect light enters bloom, never portraits,
scenery or arena dimming. The optical studio's Bloom switch now controls this
actual pass; Camera Shake also controls its softened continuous motion.
Particles advance in steps no larger than1/120 second using elapsed animation
time. Studio scrubbing reconstructs a fresh simulation rather than retaining
stale particles or impact state.

All seven archetypes have eased buildup/release and bounded completion fades.
Projectile trails use analytic time samples, damping is elapsed-time based,
volley hit light decays, and Last Flare replaces the broad white wash with
localized radiance. Character-specific Last Flare geometry includes curved
flames, wind ribbons, branches/leaves, psychic lenses, growing lightning and
arched bastions. Ordinary skills still share archetypes; this polish is not a
claim of64 wholly different systems or guaranteed frame rates.

**Last Flare banners (D-283):** portrait cut-ins occur only for `ultimate`
actions (Last Flare and eligible enemy ultimates). Skill1/Skill2, including
support skills, play battlefield effects without the banner. Last Flare
duration, speed scaling, reduced-motion skips and cleanup remain unchanged.

**Affected-unit visuals (D-282):** each activation runs independent VFX
instances for every actual damage/heal/shield/buff recipient on one shared
canvas timeline. Team support also includes full-health living allies and the
caster; fallen allies are excluded. Use pre-impact displayed HP so lethal
hits still animate on their targets. Mixed Last Flares cover enemies and
supported allies together. Support effects originate on each recipient,
offensive effects retain the caster origin, and each target is deduplicated.
Impact presentation runs once per activation; arena dimming runs once rather
than multiplying with the number of recipients.

Field attacks no longer instantiate the legacy CSS impact bloom, signature
star/pentagram or trail overlays. Canvas effects replace those layers;
portrait cut-ins, sprite choreography, damage numbers and genuine status
readouts remain. This changes presentation only, not ability targeting/math.

Preview stages fill the viewport space remaining below their controls, not a
second full viewport. Sprites use arena-relative dimensions. Compact battle
previews keep enemy and ally columns separated. The optical transport remains
visible; its sidebar scrolls within a bounded panel.
The battle studio's Formation selector supports Solo or Three allies using
in-memory units only. Three-allies previews start partially injured to make
healing visible; Training supplies three enemies for area-attack inspection.
No account ownership, progress, resources or rewards are written.
Phone squad previews use compact full-value readouts with portraits in their
nameplate headers, retaining HP, Gauge, resources, real statuses and44px
controls. Both artwork anchors and complete readouts must fit the arena,
including support buffs and enemy debuffs after an action.

Validation: run `npx vitest run src\vfx\vfx-systems.test.ts
src\vfx\preview-dom.test.ts src\presentation\battle-animations.test.ts
src\presentation\battle-authority.test.ts src\presentation\battle-impact.test.ts
src\presentation\battle-health.test.ts
src\presentation\battle-speed.test.ts src\presentation\battle-squad-art.test.ts
--maxWorkers=2`, then `npm run build`. Mock canvas tests establish lifecycle
behavior, not visible rendering. Browser validation must additionally measure
nontransparent lit effect pixels, complete action playback, actual HP/effect
updates, canvas/arena alignment and viewport containment.
For bloom/motion regression coverage, include
`src\presentation\battle-cutin.test.ts` and `src\game\battle.test.ts`.
Real Chrome on/off comparisons verified added glow for all64 studio presets;
all64 BattleView actions were also checked on desktop and at390x844/DPR2 for
lit recipient pixels, Last Flare-only banners, settled input locks, absent
legacy overlays and unchanged localStorage. The phone sweep additionally
verified complete readout containment. Pixel checks do not replace owner
visual approval or establish smoothness on every device.

**Battle presentation (D-187):** all battle animations play by default regardless
of device motion preferences; only the in-game Reduce motion selection disables
them. Entrances, attack movement/effects, skill banners and Last Flare shine are
preserved. [Motion and captured-skill contract](menus-and-inventory.md#explicit-motion-preference-d-187).
Ordinary Votive Roselius retains Skill 1/2 at 25/40 Gauge, not a Last Flare;
its saved kit, cooldowns and Gauge requirements are unchanged.

**Current D-173 direction:** owner approves shared elemental families/fewer
personal counters and precise Rose signatures. [Current contract](character-kit-rework.md#current-consolidation-contract-d-173)
supersedes the all16 bespoke-resource goal below. Preserve essential healing,
Shield, Weaken, crit/attack buffs, Gauge, cooldowns/recovery and owned equipment;
family labels do not replace actual status predicates or combat elements.

**Status:** [Adventure](free-battle.md) is implemented with prototype formulas,
starter kits, waves, and hotkeys. This page retains broader production questions.

## Resumed intrinsic kits (D-170 / D-172)

The seven Standard flagships and remaining Rose/War batches receive typed capped setup/payoff choices using
existing attack/shield/buff/event clocks. No equipment prerequisite or new RNG,
reward/save writes or recovery bypass. [Exact loops and rollout](character-kit-rework.md)
own the current contract; [status icon prompts](../Art/ui/Battle%20Status%20Icons.md)
remain generation-only with text indicators until reviewed delivery.

## Defense mitigation foundation (D-165; hostile tuning superseded by D-192)

All direct allied/enemy attacks use attack-relative diminishing Defense, not
flat subtraction. See [exact formula and modifier order](free-battle.md#stats-and-formulas).
The owner approves this correction afterLv13 enemies hit unequippedLv0 starters
for1. The original correction gave Story16/24 opening Attack and .12 early growth at half
the staged curve; Machines/material/infusion/currency modes use32/48 atLv10.
Existing HP/Defense curves, level120 endpoints and Rose level140 endpoints,
rewards/RNG/saves/ability schedules are unchanged. Existing runs retain snapshots;
start a new encounter to receive the new enemy stats.

Validate `npm test -- src\game\defense-balance.test.ts src\game\battle.test.ts
src\game\defense.test.ts src\game\story.test.ts src\content\stat-growth.test.ts
src\game\crimson-roses.test.ts --maxWorkers=2`.
Acceptance includes real noncriticalLv13 Story/Machines hits of at least9% of
every unequippedLv0 starter's maximumHP, diminishing returns, precision,
critical/skill multipliers, guarded/shielded hits, monotonic growth and unchanged
late endpoints for that historical tuning. D-192 now owns enemy stats. Stronger progression reduces relative incoming damage; there
is no forced level-gap multiplier or Conduit requirement.

## Open rules

The battle starts with only the saved starter and player/enemy turns. Each ally acts at
most once, building an individual Elemental Gauge from normal attacks and
incoming hits to pay for abilities. Only Last Flare forces full next-turn recovery.
Directional drags execute on release; right-click an ally performs Normal Attack
against the selected enemy, equivalent to dragging down (D-287). Defense remains
in Battle menu, uses the action and reduces incoming damage by10% until next
player turn. Heavy Attack is removed.
Whenever no living teammate has a legal action, enemy phases resolve until
someone can act or combat ends. Support/Defense count; Last Flare recovery still
incurs a real enemy phase, automatically. Manual passing remains inside Battle
menu for voluntarily forfeiting actions. Clear/defeat and manual stage
advancement remain distinct; D-057 supersedes the one-phase rule in D-038.
See [current rules](free-battle.md) for exact costs, targeting, order, and effects.
Production squad size, advanced timing controls, and elemental relationships are open.
Fire, water, and grass exist as art themes; no damage advantage chart is confirmed.
Do not assume Brave Frontier's exact formulas or skill names.

## Proposed battle state

- Encounter ID, content version, battle phase, and deterministic random state.
- Ally and enemy combatants with instance IDs, current/max HP, stats, and effects.
- Pending actions, skill resources, turn/round counters, and outcome.
- Ordered events for presentation and debugging.

Battle state is separate from persistent owned-unit data. Temporary HP and effects
must not accidentally overwrite roster progression.

## Proposed flow

1. Validate encounter, squad, skills, and referenced content.
2. Initialize derived stats and combat resources.
3. Accept only legal actions for the current phase.
4. Resolve actions in the approved ordering.
5. Apply damage, healing, resource changes, and effects in a defined order.
6. Check defeat/victory and transition or start the next phase.
7. Produce one reward request for a completed encounter.

Presentation consumes battle events; animation completion should not determine
damage outcomes. Reward application belongs to the
[economy boundary](summoning-and-economy.md#transaction-requirements).

## Formula specification checklist

Before coding damage, document:

- Base stat inputs and skill coefficients.
- Defense handling, elemental modifiers, critical hits, and random variance.
- Modifier order, rounding points, minimum/maximum values, and overflow behavior.
- Shield/HP interaction, healing caps, and whether zero-damage hits trigger effects.

The owner authorized a prototype balance set. Current formulas and worked tests
are linked in [Adventure](free-battle.md#stats-and-formulas); production tuning
is still open.

## Skill and effect rules

Every skill needs target rules, cost, trigger, effect sequence, and failure behavior.
Every timed effect needs duration units, tick timing, stacking/refresh behavior,
removal conditions, and immunity rules.

Explicitly define simultaneous knockouts, dead-target retargeting, revival,
summoned combatants if supported, and when an action consumes its cost.

## Validation cases

- Illegal targets and insufficient resources cannot resolve actions.
- Same initial state, action sequence, content version, and seed give the same outcome.
- HP, resources, and turn transitions obey their bounds.
- Effect expiration and stacking match exact documented examples.
- A final action causing simultaneous knockouts follows the selected outcome rule.
- Pausing, skipping animations, or changing display speed does not change results.
- Victory grants rewards once; defeat follows an explicit reward policy.

## Implementation references

Implemented: [engine](../src/game/battle.ts), [kit definitions](../src/content/combat.ts),
[exact tests](../src/game/battle.test.ts), and [event presentation](../src/presentation/battle-view.ts).
Practice battle state is isolated from roster saves, upgrades, and economy.

## Elemental Crits (D-223)

Critical Rate is no longer capped at 100% by Conduit bonuses. For each direct
hit, the chance is Critical Rate plus that hit's bonuses. At or below 100% the
original single roll decides a normal crit. Above 100% the hit always crits and
one extra seeded roll with chance (rate - 100%), capped at 100%, upgrades it to
an Elemental Crit: the critical multiplier is multiplied by 1.5. Elemental Crits
show a rainbow ELEMENTAL CRIT damage number. Enemy crits are unchanged.
