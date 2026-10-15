# Combat specification

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

With bounded level L=min(level,120), opening B, target T and initial rate R:
`round(B*(1+(L-1)*R)*exp(log(T/(B*(1+119*R)))*max(0,L-25)/95))`.
HP/Attack/Defense rates are .45/.25/.30. The accessible linear opening now
has extra exponential acceleration above25, without a late-level spike.
Ordinary openings remain83 HP/22 Attack/4 Defense; boss openings remain
207.5/27.5/(16/3). Beyond120, the existing event-only extension is
`(1 + .018 * (level-120))^2`, through140.

| Lv.120 stat | Ordinary | Boss |
| --- | --- | --- |
| Health | 9,000 | 35,000 |
| Attack | 1,200 | 3,000 |
| Defense | 400 | 600 |

Measured unequipped Infernis against ordinary same-level enemies:

| Level / evolution | Player HP | Enemy HP | Noncritical Normal Attacks to defeat |
| --- | --- | --- | --- |
| 19 / 1 | 847 | 755 | 7 |
| 60 / 3 | 2,860 | 2,945 | 8 |
| 90 / 5 | 4,510 | 5,452 | 9 |
| 105 / 6 | 5,335 | 7,076 | 11 |

At enemy120, max-level unequipped Infernis needs at least13 Normals; the tested
unupgraded late Conduit loadout needs at most8 and more than halves relative
incoming ordinary damage. Lv.105 relative ordinary incoming damage exceeds
Lv.19's by at least1.2x; late per-level hostile stat steps stay below5%.
All16 Lv.19 base-form characters have less than3x corresponding standard/Story
enemy HP and cannot one-shot with a critical Normal Attack.

Every Lv.60 ordinary enemy has2,945 HP/428 Attack/108 Defense; a Lv.60 boss
has8,665/691/151. Shared Crit12%, critical multiplier1.5, Gauge capacity100
and Elemental Damage0. First skill coefficient is `1.2+(level-1)*.004`,
with shared ordinary/boss schedules and second-skill priority.
Across all16 Element-Bearers at legal progression caps, an ordinary enemy
ten levels higher requires at least7 noncritical Normals, has more than15%
greater raw hits-to-kill than its same-level counterpart, and deals a
noncritical Normal exceeding10% player maximum HP. Actual available Skill1
direct hits stay below80% enemy HP. For unequipped Lv.19 Infernis, enemy29
takes11 Normals instead of7 at19; incoming Normals rise from12% to19% HP.
These are no-gear benchmarks, not immunity to a well-built powerful skill.

All starters clear the first Story encounter at Lv.0 without gear across three
seeds. Each initial starter can clear the first regional boss solo atLv15 with
Common Store gear, before recruitment. A complementary same-level Common-geared
squad clears all six regional bosses. Accessible Common Store squad loadouts
also support the opening material dungeon, Rare materials at the Lv.45 cap and
form3 infusion at the Lv.60 cap. Across three seeds,
the complementary Infernis/Tizu/Flora squad clears final material bosses,
all six staged creature/Machine activities and all three War bosses with a
legal unupgraded late loadout. The same squad without gear loses every tested
final staged creature/Machine boss. This is a regression benchmark, not a
promise that every squad or rotation wins, or that no exceptional unbuilt
strategy exists. Late loadout: Worldbreaker Drive, Immortal Vessel, Citadel
Spine, Astral Prism, Siege Cantilever, Duplex Heart, Twinpulse Bellows and
Springwell Pump. Existing three Rose/starter mixed-squad clear tests remain.

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
Loading/Settings does not rewrite active combat stats. A rebuilt staged
encounter or Retry resolves the current curves from frozen progress/gear;
Training retains its allied run snapshot when advancing waves.

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
most once, building an individual Shatter Gauge from normal attacks and
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
