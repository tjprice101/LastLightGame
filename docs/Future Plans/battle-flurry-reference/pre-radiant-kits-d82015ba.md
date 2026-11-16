# Old (pre-Radiant) kit catalog, commit d82015ba (2026-11-07)

Source of truth: repo at `d82015ba`, read via `git show` and a `git archive` copy under the scratchpad (no repo files touched). Per-character data in Section 2 was machine-extracted: the d82015ba TypeScript was bundled with esbuild and `fighters`, `nativeIdentities`, `resolveFighter` were dumped, so stats, scaled percentages and descriptions are exact runtime values, not hand transcription. Behaviour claims cite `file:function` at d82015ba.

## 0. Which definition was the effective live kit

- 38 Element-Bearer ids exist in `content/starters.ts`: ember (Infernis), tide (Tizu), sprout (Flora) [opening 5-star]; rosetta, thornia, crinso [Rose]; atmoso, aurora, bliss, bruno, disciple, elise, razor [Flagships]; nerithe, orvella, vaelor, caldrex, solenne, myrthen, neralis, varkhel, seravelle, velmira [War / Phase 1]; ozriel, ilvaris, kaelith [Calamitic, 7-star]; Moon maerion, caevren, vespera, ilyss, asteriel, serapha; Sunshade rhaziel, oryn, thessara, elaris, veyr, aureth (Moon/Sunshade banners/events not launched per AGENTS.md).
- **Native identities override the base fighter definitions for EVERY id.** `content/combat.ts`, module-level loop over `Object.keys(fighters)`: normalizes stats, applies `identity.selfStats` (health/defense multiply by 1+x; skillPower adds x), `delete kit.pilot`, sets `kit.nativeIdentity = true`, replaces `kit.passive` with the native passive (damageBonus/defenseBonus/healFraction forced 0; only Nerithe keeps `lightGaugeBonus: 5`), and `kit.abilities = structuredClone(identity.abilities)`. What survives from the base definitions (`combat.ts` ember/tide/sprout/rosetta/thornia/crinso, `flagships.ts`, `war-characters.ts`, `calamitic-characters.ts`, `moon-sunshade-fighters.ts` roleStats) is: stats, role, element, lore/art, and the Normal Attack name (`basicActionName`: war and calamitic characters have custom names, everyone else "Normal Attack"). The legacy passives/skills in those base files are dead code for heroes (kept in Appendix A for history).
- `resolveFighter` skips potency scaling of ability strengths for native kits (`if (kit.nativeIdentity) continue;`); `describeFighter` for natives copies the identity descriptions and appends " Recovery: caster skips the next player turn." to Last Flare.
- `act()` in `game/battle.ts` has `if (native) { ... nativeAction(...); ...; return { state, events }; }` before any legacy path, so the old kit-pilot "charge" system (`game/kit-pilots.ts`: Infernic Embers, Oceanic Protection, Botanic Renewal, Atmospheric Charge, Rose Grace, Thorn Aegis, Rose Duality) is NOT run for any hero; it only runs for the non-native path (captured Elemental-Devourers). `content/elemental-effects.ts` families (burn=Infernic Embers, ward=Oceanic Protection, bloom=Botanic Renewal, tempest=Atmospheric Charge, focus=Tranquilitic Focus, suppression=Chaotic Suppression) survive as labels/tags for status display only.
- Executed numbers live in `game/native-kits.ts: nativeAction` (hard-coded coefficients); `native-identities.ts` supplies the description text plus `strength.damageMultiplier`. They agree (cross-checked against the tuning table in `docs/character-identity-redesign.md`, "Current tuning and implementation").

## 1. System rules

### 1.1 Turn structure (`game/battle.ts`)
- Squad size at this commit: 1 to 3 distinct squad members (`createBattle`: `roster.length > 3` throws; docs/units-and-progression.md "Squad saves one to three distinct owned IDs"). Captured Elemental-Devourers can occupy slots. (Current game: 1-6.)
- Every living squad member gets exactly ONE action per player turn (`Combatant.spent`; `actionUnavailable` rejects "already acted this turn"; `act` sets `actor.spent = !activation.freeAction`). The player picks any member/any order (hold/drag grid, D-307). Order matters: Bliss posture counts how many OTHER living allies already have `spent` (`nativeAction`: `acted === 0 ? opening : acted === other.length ? closing : passing`), plus Atmoso Gust, Rosetta Quarry contributors, Disciple Instruction timing, etc.
- An action is Normal Attack (`light`), Skill 1, Skill 2 or Last Flare (`ultimate`). The player ends the turn (`endTurn`); `actAndAdvanceTurn` / `advanceUnavailableTurns` auto-end it when nobody can act (`teamCanAct`).
- `endTurn` enemy phase, for each living enemy in order: settle Calamitic debt; Burn ticks (`nativeBurnPhase` for native Burn, legacy tick with its own crit roll); target = `roleTarget(living, roll)` (Tank weight 1.25 vs 1; Calamity pattern `targeting`, taunts and `forcedConduitTarget` override); optional barrier/heal patterns; roll enemy crit; scheduled special skill via `scheduledEnemySkill(enemySkills, round - scheduleShift)` else normal attack; damage `damageAmount(enemy.damage, skillMult*(1-weaken if weakened), effectiveDefense, crit, critMult)`; in `conduitIncoming` the Phase 0 floor keeps incoming at >= 20% of undiminished damage; native modifiers (Cover, Foundation, Stillness, Ceasefire, Seals, Refusal...) apply; shields absorb first; remainder is HP loss; target gains +10 Gauge. Enemy Weaken decrements after that enemy's action. Then `nativePhaseEnd`, `expireNativeShields` (no-op, shields last until broken, D-434), `checkOutcome`, `newTurn`.
- `newTurn`: `round++`, every ally `spent = false`, attackBoost expiry, `conduitTurnStart`, `nativeTurnStart` (matures Seeds, advances Vaelor Beat, Rhaziel Repair...), legacy `passive.healFraction` heals (0 for all natives). Event text: "Only Last Flare forces next-turn recovery."
- Skill 1/2: no cooldown, repeatable on consecutive turns (D-300; `readyRound` only matters for captured copies). Last Flare: `actor.recoverThrough = state.round + 1` in `act()`; next player turn the caster has no legal action at all (not even Normal Attack: "Recovering this turn after Last Flare."). Passive clocks (Vaelor Beat, Seed maturity) keep ticking while recovering. Only Calamitic Conduits (`calamiticNoLastFlareRecovery`) bypass it.
- Waves and stages: Gauge, shields, recovery carry over; stage entry resets HP; Gauge capped to capacity (`nextWave`, `nextStage`). Native memory is wiped per wave (`delete ally.pilot; delete ally.native`, re-seeded for Vaelor/Myrthen).
- **Leader: no effect existed.** The first squad slot is called leader but gives "no additional stat bonus"; docs/units-and-progression.md ~L662 and L687 state "leader bonuses remain unimplemented". `grep -i leader` over src/content and src/game finds none. There were no Leader effects in the old system.

### 1.2 Gauge ("Elemental Gauge", internal `shatter`) (`content/combat.ts: shatterGauge`)
- Capacity `stats.shatterCapacity` (base 100; grows by potency, see 1.7). Starts 0.
- Gains: Normal Attack +20; Skill 1/2/Last Flare +0; every enemy attack that targets an ally +10 to that ally (`conduitIncoming` -> `nativeGauge(..., shatterGauge.incomingHit)`; also when the shield absorbs it all; multi-hit patterns once per hit). Nerithe's Normal gets +5 extra (`passive.lightGaugeBonus`, `act()`: `nativeGauge(... gains[action] + lightGaugeBonus)`). Kit grants (Tizu +8, Thessara 6/8 per Reserve, Seravelle Last Flare 20% of capacity, Ilvaris Hymn/LF 10%, Varkhel refund 15%, Velmira refund 25%) go through `generatedGauge` / `generatedGaugePercent`.
- Costs: Skill 1 = 25, Skill 2 = 40, Last Flare = 100, Normal = 0. Paid up-front in `act()` (`actor.shatter -= paid`).
- Gauge Gain stat (default 100%): every positive Gauge receipt is `round(offer * gaugeGain)` once (`phase-zero-conduit-stats.ts: phaseZeroGaugeOffer`; `conduit-runtime.ts: effectiveGaugeGain` adds Conduit/temporary bonuses). Percentage grants = `round(recipient_capacity * fraction * gain)`. Gauge is clamped to capacity (`generatedGauge`); raising capacity never fills Gauge.

### 1.3 Phase Zero stats (`content/phase-zero-stats.ts`, `phaseZeroStatsReady = true`; D-368/D-370, docs/combat.md "Phase 0 activated release")
Defaults for every combatant: skillPower 1 (100%), skillDuration 0, skillEfficiency 0, gaugeGain 1 (100%). No level growth on these four. Labels: Skill Power, Skill Duration, Skill Efficiency, Elemental Gauge Gain (`phaseZeroStatLabels`).
- **Skill Power**. In `conduit-runtime.ts: prepareConduitAction`, `activation.skillPower` for Skill 1/2/Last Flare = `stats.skillPower + calamiticSkillPowerBonus + 0.5 for each Ascension flag matching the action (ascension.skill1/skill2/lastFlare)`, plus many Conduit tokens and native buffs (Ilvaris Hymn, Seravelle Last Flare `skillPowerBuff`, Ilyss master). For Normal Attack it is fixed at 1 ("Skill Power replaces separate Elemental Damage scaling for skills, not Normal Attack, critical probability, Gauge receipts or generated equipment effects"). It multiplies, once, the authored packet: direct damage (`damageAmount(attack, coefficient*scale*(skillPower+skillPowerBonus)*...)`); Burn damage (`applyConduitBurn`: `round(base*(1+level/30)*skillPower)`); Shields (`nativeShield`: `offer *= skillPower + supportPowerBonus`); active healing (`nativeHeal`: same); Seeds (`seed()`); Weaken strength (`applyConduitWeaken`: `fraction*skillPower`, then capped at 50%); Aurora Seals; Bruno Cover fraction and solo damage reduction; Disciple Instruction bonuses (`.3/.35 * flareSupport * SP`); Thornia trap strike coefficient; Orvella Foundation durability and repair; Bliss Quietstorm buff (10% x SP); Vaelor Rise buff (20% x SP); Aurora Last Flare ward (50% x 1.5 x SP); Caldrex/Neralis/Ilvaris/Varkhel defense or Hymn buffs (as noted per kit); Cyclone release damage (snapshots the casting `skillPower`). NOT scaled: fixed follow-up packets marked `stored`, Seravelle Move as One Direct Attack buff ("not scaled by Skill Power"), Conduit-generated effects ("Generated Conduit effects do not receive Skill Power implicitly", docs/combat.md L17-33), the Support-role 4% heal, enemy stats.
- **Skill Duration**. `Math.floor(stats.skillDuration)` whole extra turns/phases added to timed skill effects: Burn turns (`3 + skillDuration`; Seravelle `2 + ...`), Weaken (`base + skillDuration`, capped 6), Seals, Thorn traps, Cover/intercept/taunt windows, Instruction/Signal/Moonflower/Accord/Ceasefire/Lead/Defense buffs, Cyclone phases (`2 + skillDuration`), Foundation, Fate-seared Mark, Reaper's Claim. NOT cooldowns, recovery, delayed payout timing (Seed maturity, Razor's delayed Shield), action grants or instant effects (docs/combat.md). Sources: Conduits (Resonance Crucible +1, World-Eater Orrery +3, Omnic stats). Base 0.
- **Skill Efficiency**. Discounts the original skill cost additively, cap 50%: `max(floor, ceil(base*(1-min(.5,efficiency))))`, floor 1 for Skill 1/2 and 70 for Last Flare (`phase-zero-conduit-stats.ts: phaseZeroSkillCost`, called from `conduit-runtime.ts: conduitActionCost`). +5% per Ascension flag on that skill; Conduits/tokens add more. Normal Attack unaffected.
- **Gauge Gain**: see 1.2.
- **Unchanged older stats**: Health, Defense, Direct Attack (`damage`), Crit Rate, Crit Multiplier, Gauge Capacity keep pre-Phase-0 growth. The legacy `elementalDamage` stat is unused by native kits (native Burn uses `stats.damage * fraction`; `burnAttack = phaseZeroStatsReady ? actor.stats.damage : elementalDamage`).
- Stat pooling: Health/Defense/Direct Attack/Crit Mult/Gauge Capacity percent bonuses (role perks, Conduits, Omnic/Master) add into ONE pool and multiply the base once; crit, skillPower, skillEfficiency, gaugeGain, skillDuration are additive (`applyPhaseZeroStaticBonuses`; role perks enter as `intrinsic`).

### 1.4 Damage, crit, Burn, Weaken, Shield, heal, attack boost
- Direct damage (`battle.ts: damageAmount`): `max(1, round(attack * multiplier * (crit ? critMult : 1) * 1/(1 + Defense/attack)))`: mitigation = attack/(attack+Defense), rounded once, floor 1. Native `direct()` in `act()`: `multiplier = coefficient * activation.scale * (skillPower + hit.skillPowerBonus) * nativeInstructionDamage * (1 + modifiers.bonus)`, Defense used = `nativeTargetDefense * (1 - min(.75, pierce + modifiers.pierce))` (Defense-ignore capped at 75%). Shield absorbs first, then HP. Last Flare pierce and crit-chance bonuses are x1.5 (`flareSupport`, 1.5) except for exact-damage war/Moon/Sunshade ids.
- Native coefficient tuning (`content/native-balance.ts`, `nativeAction.hit`): for the 16 original bearers (ember, tide, sprout, atmoso, elise, bliss, bruno, disciple, aurora, razor, rosetta, thornia, crinso, nerithe, orvella, vaelor) every Skill 1/2 direct coefficient x `skillDamageScale` 1.6 and Last Flare direct x1.6 x3 = x4.8 (D-378), Last Flare non-damage potency (healing, shields, pierce, crit bonus, Cover, Instruction, ward) x1.5 (`lastFlare.support`). `exactDirectDamageIds` (caldrex, solenne, myrthen, neralis, varkhel, seravelle, velmira, all 12 Moon/Sunshade), the three Calamitic and `isNewEventCharacter` ids are authored final values with no extra scaling. The descriptions in Section 2 already show final percentages.
- Attack boosts (`attackBoost`): in Phase 0 `conduitHitModifiers` adds `fraction` times the pre-bonus base Direct Attack to the attacker's Attack for the hit (additive with Tempered/Solace tokens), not a post-hoc multiplier.
- Normal Attack: `hit(1)`: 100% Direct Attack, one enemy, Gauge +20, Skill Power not applied, may crit.
- Critical (`battle.ts: rollCritical`, `conduit-runtime.ts: conduitCriticalHit`): chance = `stats.crit + ability critBonus + activation.criticalBonus + conduit bonus (+5 percentage points for Kaelith skills)`. Above 100% the hit always crits and one more roll with chance (rate-100%) makes it an Elemental Crit (crit multiplier x1.5, `elementalCritFactor`). Crit multiplies by `stats.critMultiplier`. All native packets (Burn ticks, detonations, Cyclone, recalls, Wounds, traps, Foundation demolition) roll crit with the owner's stats (D-415); Conduit-generated damage does not.
- Burn (`applyConduitBurn`, `nativeAction.burn`, `nativeBurnPhase`): per-source stored `native.burns[enemy]`; damage per enemy phase = `round(owner.stats.damage * fraction * (1+sourceLevel/30) * skillPower)`; turns = 3 + skillDuration (Infernis, Vespera, Caldrex; Seravelle 2 + skillDuration); a stronger application replaces, refreshing turns; Burns from different casters are tracked separately. Ticks in the enemy phase, ignore Defense (shields still absorb through `periodicDamage` -> `payShield`), can crit. The Infernis passive text "Allied damage-over-time gains +100% damage per 30 levels of its source" is implemented generally as `damageOverTimeLevelMultiplier(level) = 1 + level/30` for every ally Burn (`nativeBalance.damageOverTime.levelsPerBonus = 30`). Flame Arc detonation is `fixed(... bypass=true)`: stored damage x up to 2 phases, ignoring Defense.
- Weaken (`applyConduitWeaken`): the enemy's attack multiplier is `(1 - weakenFraction)`; strength = `fraction * skillPower` capped at 50%; duration = base (1 enemy phase for Tizu/Solenne, 2 for most) + skillDuration, max 6; a stronger existing Weaken is kept; counts down once per enemy action; Defense untouched. Aurora's Seal is separate (cuts the next scheduled special skill/ultimate once).
- Shields (`nativeShield`): amount = target max Health x fraction (Ozriel flat 90/140) x `(skillPower + supportPowerBonus)`; Skill/Last Flare shields use `stack: true` (D-434): layers add with no cap, last until broken, absorb before HP; native-authored shield layers are tracked per owner for hooks (Tizu Gauge, Rhaziel Repair).
- Healing (`nativeHeal`): max-Health fraction x `(skillPower + supportPowerBonus)`, clamped to missing Health; excess is wasted (Phase 0 removed overheal-to-shield); never revives; only healing that restores > 0 counts for hooks (Neralis Current etc.).
- Taunt = native memory `tauntThrough`: "eligible random single-target attacks" are redirected; area-of-effect and scripted attacks are not. Cover/intercept redirect a fraction of post-Defense direct damage (`nativeRouteDamage`).

### 1.5 Role perks (`content/role-perks.ts`, D-437)
- Tank: +50% Defense; enemy single-target weight 1.25 (`roleTarget`).
- Attacker: +100% Direct Attack, +50% Skill Power (additive).
- Support (incl. "Healer & Support"): +50% Health, +25% Skill Power; every resolving Skill 1/2 or Last Flare also heals every living squad member for 4% of their max Health (`battle.ts: supportRoleHeal`; capped by missing Health, not Skill-Power scaled, never on Normal Attack; does not feed charge/Current hooks). Captured Elemental-Devourers get none.
- Calamitic `selfStats` (native-identities): Ozriel Health x1.65 Defense x1.65; Ilvaris Health x3 Defense x2; Kaelith Skill Power +75%.
- Moon/Sunshade base stats are by role only (`moon-sunshade-fighters.ts roleStats`): Tank 280/17/31 crit 10% x1.5; Attacker 210/10/42 crit 25% x1.7; Support (and Healer & Support) 215/10/32 crit 12% x1.5 (Health/Defense/Attack).

### 1.6 Element Resonance (`game/element-resonance.ts`, applied in `createBattle`)
2 same-element bearers in the frozen roster: +15% max Health for everyone; 3 same-element: +25% max Health and +5 percentage points Skill Power.

### 1.7 Growth (`content/progression.ts`, `content/stat-growth.ts: playableGrowth`, `content/combat.ts: resolveFighter`)
- `characterGrowthFactor = 1 + level*0.15 + (evolution-1)*1.5`. Health, Direct Attack, Elemental Damage x factor; Defense x factor^0.7; weapon rank +2% Attack per rank (max 10). `ascension.stats` multiplies every numeric stat x1.5 as coded (loop over all numeric keys, so Skill Power/Gauge Gain also x1.5 as written; level cap 115; ambiguous whether intended).
- `characterPotencyFactor = 1 + level*0.003 + (evolution-1)*0.05` scales Crit Rate (min 1), Crit Multiplier and Gauge Capacity. Level cap = 30 + 15*(evolution-1); evolutions 1-6 (Calamitic evo 6 cap 110).
- Native ability coefficients do NOT scale with level or potency. Abilities scale through Attack growth (damage, Burn), max-Health growth (shields/heals are fractions of max Health), Skill Power, and the Burn level multiplier `1 + level/30`. (Legacy non-native kits scaled `strength` by potency and shield/heal by factor.)

### 1.8 Passives, resources, elemental stacks
- Every hero passive is the native passive in Section 2; runtime state is `NativeKitState` (Seeds, Cyclone/Gust, Shuriken, Cover, Instruction, Seals, Wounds, Quarry, Thorn traps, Combo, Survey, Foundation, Beat, Heat, Stillness, Season, Current, Tension, Cadence, Crosscut, Unreturned, Load, Beacon, Severance, Promise, Interval, Reserve, Branch, Fault, Momentum/Lead, Terms/Accord, Signal, Moonflower, Ceasefire, Repair, Fate-seared Mark, Fractalized Incision).
- The earlier shared "charge" loop (kit-pilots: +8%/+12% damage per charge, +5 pp Weaken per Ward/Rose Grace/Thorn Aegis charge, +5% max-Health shield per charge, +10% Rose Grace damage, +15% Flora healing per charge, no cap on charges) was retired for heroes by D-316 ("replaced locally by the approved distinct character identities"). See Appendix A.
- Legacy-style stat passives (+X% damage below 50% Health, +N Defense, 2-5% team heal each turn) are fully gone for natives (zeroed in `combat.ts`).

### 1.9 Last Flare recovery rule
Costs 100 Gauge (efficiency floor 70), sets `recoverThrough = round + 1`; the next player turn that caster cannot take any action. Others act normally. Authored text for Moon/Sunshade/Calamitic strips "Recover next turn." but the engine rule is global (`act()`), and `describeFighter` appends "Recovery: caster skips the next player turn." for all natives.

### 1.10 Conduits touching kits (context)
8 ordinary slots + Master slot; Master Conduits (`master-<id>-N`, 3 per character) modify specific numbers inside `nativeAction` (e.g. `master-ember-2`, `master-tide-2`). Conduit-generated effects are not Skill-Power scaled. Per-character Master effects are out of scope here except where bracketed Conduit names appear in the War descriptions ([Amber-Station Return Manifold], [Faultstar Chain Accumulator], [Twin-Edge Sequence Orrery], etc.).

## 2. Per-character kits (effective live kit = native identity; values machine-extracted)

Legend. Base = `fighters[id].stats` at Lv0/Evo1 after native `selfStats`; Resolved = `resolveFighter(id)` with no progress/equipment (role perk applied; includes role Skill Power). Direct-damage percentages are final (post-tuning for the 16 original bearers; x1.6 skills / x4.8 Last Flare already baked in). "stored damageMultiplier" is `strength.damageMultiplier` (display/validation value); executed coefficients are hard-coded in `nativeAction`. Square-bracket terms are glossary names. Normal Attack = 100% Direct Attack on one enemy, +20 Gauge, no Skill Power, can crit. Passive "Leader effect": none exists for any character (see 1.1). Display name is "Prefix, Name" from `character-art.characterName` + evolution titles; base names listed. Custom Normal Attack names: Nerithe Surveyor's Thrust, Orvella Plumbline Strike, Vaelor Tuning Strike, Caldrex Gate Bash, Solenne Bell Tap, Myrthen Sickle Cut, Neralis Crescent Thrust, Varkhel Counterweight Strike, Seravelle Beacon Lance, Velmira Measured Edge, Ozriel Halberd Verdict, Ilvaris Struck Chord, Kaelith Fault Reap; all others "Normal Attack".

### Opening starters (5-star)

#### Infernis (`ember`) - 5-star Infernic Attacker
- Title: Wrath that guards a fragile beginning. Weapon: Greatsword.
- Native role/loop: Persistent fire specialist. [Infernis] applies [Burn] that lasts across enemy phases; [Flame Arc] can deal its remaining damage at once.
- Base stats (content, after native selfStats none): HP 220, Def 10, Atk 38, Crit 15%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 8, unused by native kits)
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 220, Def 10, Atk 76, Crit 15%, CritMult 1.5x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 8, unused by native kits)
- Passive - Unbroken Ember: Allied damage-over-time gains +100% damage per 30 levels of its source, fixed when applied.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Cinder Cleave [targets: one enemy] [stored damageMultiplier 256%]: 256% direct damage to one enemy, then apply [Burn] dealing 25% of [Infernis]’s Attack per enemy phase for three enemy phases.
- Skill 2 (40 Gauge) - Flame Arc [targets: all-enemies] [stored damageMultiplier 176%]: 176% direct damage to all enemies. Each surviving enemy carrying [Infernis]’s [Burn] immediately takes the damage of up to two of its remaining [Burn] phases, and those phases are removed. [Burn] applied by other characters is unaffected.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Dawnfire [targets: all-enemies] [stored damageMultiplier 960%]: 960% direct damage to all enemies, then apply [Burn] dealing 135% of [Infernis]’s Attack per enemy phase for three enemy phases.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Tizu (`tide`) - 5-star Oceanic Tank
- Title: Sadness remembered, and carried safely. Weapon: Spear.
- Native role/loop: Precise barrier protector. [Tizu] places a stacking shield on one chosen ally before the next enemy attack.
- Base stats (content, after native selfStats none): HP 260, Def 16, Atk 30, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 260, Def 24, Atk 30, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Stillwater Guard: When a shield from [Tizu]’s abilities fully absorbs an enemy’s direct hit so that no HP is lost, the shielded ally gains 8 [Elemental Gauge].
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Undertow Thrust [targets: one enemy] [stored damageMultiplier 240%]: 240% direct damage to one enemy and apply 25% [Weaken] for the next enemy phase.
- Skill 2 (40 Gauge) - Tidal Shelter [targets: one-ally]: Grant one living ally a Shield equal to 45% of its maximum Health.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Ocean Memory [targets: all-allies]: Grant all living allies a Shield equal to 52.5% of their maximum Health. Reduce the first direct hit each ally takes while this Shield remains by 45%.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Flora (`sprout`) - 5-star Botanic Healer & Support
- Title: Joy gives life room to return. Weapon: Bow.
- Native role/loop: Delayed recovery gardener. [Flora] plants [Seed] healing that restores HP at the start of the next player turn, or harvests it immediately with [Verdant Renewal].
- Base stats (content, after native selfStats none): HP 190, Def 8, Atk 32, Crit 20%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 285, Def 8, Atk 32, Crit 20%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Root of Hope: Each living ally can hold one [Seed]. At the start of the next player turn, it restores 50% of its holder’s maximum Health while [Flora] is alive, then disappears. Planting another replaces the previous [Seed].
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Briar Shot [targets: one enemy] [stored damageMultiplier 224%]: 224% direct damage to one enemy, then plant a [Seed] on the living ally with the lowest Health percentage.
- Skill 2 (40 Gauge) - Verdant Renewal [targets: all-allies]: Harvest existing [Seeds], healing their holders for 50% maximum Health (97.5% for [Empowered Seeds]). Then plant a [Seed] on each living ally, preserving any pending [Empowered Seed].
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Worldseed [targets: all-allies]: Every living ally immediately heals 75% of its maximum HP, then receives an [Empowered Seed] that restores 97.5% at the start of the next player turn while [Flora] is alive.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

### Flagships

#### Atmoso (`atmoso`) - 5-star Atmospheric Attacker
- Title: Calm charts a road through the broken sky. Weapon: Wind staff.
- Native role/loop: Delayed wind-field attacker. [Cyclone Weave] creates a [Cyclone] that grows as allies act and later releases on all enemies; [Razor Gale] can release it early.
- Base stats (content, after native selfStats none): HP 205, Def 9, Atk 39, Crit 20%, CritMult 1.6x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 205, Def 9, Atk 78, Crit 20%, CritMult 1.6x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Gale Cadence: While a [Cyclone] is active, the first action each other living ally takes in a player turn ([Normal Attack] or any skill) adds one [Gust].
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Razor Gale [targets: one enemy] [stored damageMultiplier 288%]: 288% direct damage to one enemy. If a [Cyclone] exists, it releases immediately on all living enemies and ends.
- Skill 2 (40 Gauge) - Cyclone Weave [targets: all-enemies]: Release any existing [Cyclone], then create one with 0 [Gust]. After two enemy phases, it releases on all living enemies for 70% of [Atmoso]’s Attack plus 30% per [Gust]. [Atmoso] must be alive for a release.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Sky Without End [targets: all-enemies] [stored damageMultiplier 960%]: Release any active [Cyclone] at its current [Gust] count for three times its normal release damage, then deal 960% direct damage to all enemies.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Aurora (`aurora`) - 6-star Tranquilitic Support
- Title: Peace sees what every verdict leaves behind. Weapon: Empty-hand light casting.
- Native role/loop: Hostile skill forecaster. [Aurora] reveals when each enemy’s next special skill is due; [Seal] and [Last Flare: Final Dawn Verdict] reduce its damage.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Lens of Diminishment: The battle menu shows each living enemy’s next scheduled special skill or ultimate and the enemy phase it is due, or states that none is scheduled.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Gleamseal [targets: one enemy]: Place a [Seal] on one enemy for three enemy phases. Its next scheduled special skill or ultimate deals 40% less direct damage and consumes the [Seal]. Recasting refreshes it and keeps the stronger reduction.
- Skill 2 (40 Gauge) - Eclipse Mandate [targets: all-enemies] [stored damageMultiplier 160%]: 160% direct damage to all enemies, then place a 25% [Seal] on each survivor, following the same rules as [Gleamseal].
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Final Dawn Verdict [targets: all-allies]: For two enemy phases, all living allies take 75% less direct damage from enemy ultimates. Enemy [Normal Attack] and other skills are unaffected.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Bliss (`bliss`) - 6-star Tranquilitic Attacker
- Title: Peace moves with a thousand careful feathers. Weapon: Paired feather fans.
- Native role/loop: Action-order dancer. [Bliss]’s skills change with when she acts in the player turn: acting first adds offense, acting last adds healing and shields. When she is the only living ally, she always counts as acting first.
- Base stats (content, after native selfStats none): HP 210, Def 10, Atk 42, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 210, Def 10, Atk 84, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Stillfeather Tempo: Each action is [Opening] if no other living ally has acted this player turn, [Closing] if every other living ally has acted, and [Passing] otherwise. When [Bliss] is the only living ally, every action is [Opening].
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Warfeather Cut [targets: one enemy] [stored damageMultiplier 272%]: 272% direct damage to one enemy. [Opening]: +25 percentage points Critical Rate for this attack. [Closing]: heal the most injured other living ally for 6% of its maximum HP. [Passing]: no bonus.
- Skill 2 (40 Gauge) - Quietstorm Flourish [targets: all-enemies] [stored damageMultiplier 192%]: 192% direct damage to all enemies. [Opening]: living allies deal 10% more direct damage this player turn. [Closing]: grant all living allies a Shield equal to 6% of their maximum Health.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Thousandfeather Stillness [targets: all-enemies] [stored damageMultiplier 1200%]: 1200% direct damage to all enemies. [Opening]: +45 percentage points Critical Rate for this attack. [Closing]: heal other living allies for 15% of their maximum HP. [Passing]: no bonus.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Bruno (`bruno`) - 5-star Botanic Tank
- Title: Joy and life endure beneath falling stone. Weapon: Stone hammer.
- Native role/loop: Deliberate damage interceptor. [Bruno] places [Cover] on allies and takes part of the damage they receive.
- Base stats (content, after native selfStats none): HP 285, Def 18, Atk 29, Crit 8%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 285, Def 27, Atk 29, Crit 8%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Faultbound Resolve: Damage redirected to [Bruno] by [Cover] is reduced by 25%.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Seismic Hammerfall [targets: one enemy] [stored damageMultiplier 304%]: 304% direct damage to one enemy.
- Skill 2 (40 Gauge) - Citadel Mantle [targets: one-ally, excludes self]: Place [Cover] on another living ally until the next enemy phase ends: 50% of the direct damage it takes, after Defense, is redirected to [Bruno]. Only one ally can hold this [Cover]; recasting moves it. If [Bruno] is the only living ally, he instead takes 20% less direct damage for that phase. Redirected damage cannot be redirected again.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Worldwall Ascendant [targets: all-allies]: Place [Cover] on every other living ally for two enemy phases, redirecting 60% of each direct hit to [Bruno]; this replaces single-ally [Cover]. Grant [Bruno] a Shield equal to 30% of his maximum Health.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Disciple (`disciple`) - 6-star Chaotic Support
- Title: Mortality binds no mind to a single will. Weapon: Empty-hand psychic casting.
- Native role/loop: Conditional ally instructor. [Disciple] gives one ally an [Instruction] ([Strike], [Shelter] or [Resolve]) that strengthens its next matching action.
- Base stats (content, after native selfStats none): HP 240, Def 11, Atk 36, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 360, Def 11, Atk 36, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Shared Mindflame: [Disciple] maintains one [Instruction] on one living ally, which can be [Disciple]. The ally’s next action of any kind ([Normal Attack] or a skill) uses it up; otherwise it expires at the end of the next player turn. Giving a new [Instruction] replaces the old one. A new [Instruction] takes effect after the action that granted it.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Thoughtspark Benediction [targets: one-ally]: Give one living ally [Strike]: its next action deals 30% more direct damage.
- Skill 2 (40 Gauge) - Concord of Chaos [targets: one-ally]: Give one living ally [Shelter]: its next action heals and Shields for 35% more. Does not increase Conduit-generated healing or Shields.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Unbound Mindcrown [targets: all-allies]: Give [Resolve] to all living allies, replacing their current [Instruction]. Each ally’s next action gains [Strike] (45% more direct damage), [Shelter] (52.5% more healing and shields) or both, matching what that action does. [Resolve] expires at the end of the next player turn.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Elise (`elise`) - 5-star Atmospheric Attacker
- Title: Calm finds its way through the storm. Weapon: Two four-point shuriken.
- Native role/loop: Two-shuriken placement duelist. [Elise] lodges two [Shuriken] in enemies, then recalls them for extra strikes.
- Base stats (content, after native selfStats none): HP 195, Def 8, Atk 40, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 195, Def 8, Atk 80, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Stormwheel Rhythm: [Elise] has exactly two [Shuriken], both held at the start of battle. Each is either held or lodged in one living enemy. A lodged [Shuriken] returns to her when its enemy is defeated, without dealing damage.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Voltstar Cut [targets: one enemy] [stored damageMultiplier 176%]: Throw one held [Shuriken] for 176% direct damage to the selected enemy; it lodges in that enemy. With no [Shuriken] held, deal 224% direct damage instead and neither [Shuriken] moves. Both [Shuriken] can lodge in the same enemy.
- Skill 2 (40 Gauge) - Crosscurrent Volley [targets: one enemy] [stored damageMultiplier 224%]: Recall every lodged [Shuriken]: each strikes its enemy for 90% of [Elise]’s Attack. If both were in the same enemy, it takes one extra 60% strike. If both [Shuriken] are already held, deal 224% direct damage to the selected enemy instead. Recalled strikes generate no Gauge.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Infinite Thunderwheel [targets: one enemy] [stored damageMultiplier 1248%]: Recall every lodged [Shuriken] with 270% strikes and a 180% same-enemy strike, then deal 1248% direct damage to the selected enemy.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Razor (`razor`) - 6-star Chaotic Tank
- Title: At midnight, destruction meets a steadfast guard. Weapon: Night sword.
- Native role/loop: Wounds-powered revenge duelist. [Razor] stores HP lost to enemy attacks as [Wounds], then spends them for extra damage.
- Base stats (content, after native selfStats none): HP 290, Def 19, Atk 32, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 290, Def 28.5, Atk 32, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Unbroken Night: HP [Razor] loses to direct enemy hits is stored as [Wounds]. Damage absorbed by shields, damage redirected to him, [Burn], HP he pays himself and Conduit effects add no [Wounds]. Healing does not remove [Wounds].
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Nightcleave [targets: one enemy] [stored damageMultiplier 256%]: 256% direct damage to one enemy, then spend all [Wounds] for an extra strike that uses the spent amount as its Attack.
- Skill 2 (40 Gauge) - Eclipse Bastion [targets: one enemy]: [Razor] takes 30% less direct damage during the next enemy phase, then gains a Shield equal to the Health he lost to direct hits during that phase.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Unbroken Midnight [targets: one enemy] [stored damageMultiplier 1056%]: 1056% direct damage to one enemy, then spend all [Wounds] for an extra strike dealing three times the damage of a strike using twice the spent amount as its Attack, reduced by Defense.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

### Rose (6-star)

#### Rosetta (`rosetta`) - 6-star Tranquilitic Attacker
- Title: Peace takes flight beneath a crimson sun. Weapon: Bow.
- Native role/loop: Coordinated quarry hunter. [Rosetta] marks a [Quarry]; when different allies hit it in the same player turn, her abilities gain bonuses.
- Base stats (content, after native selfStats none): HP 225, Def 11, Atk 43, Crit 20%, CritMult 1.6x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 225, Def 11, Atk 86, Crit 20%, CritMult 1.6x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Virtuous Bloom: [Rosetta] can have one [Quarry]. Each player turn, the different living allies whose attacks hit it directly are counted. Each direct hit on it after two different allies have hit it that player turn gives each of those allies a shield worth 8% of their maximum HP.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Golden Thorn Volley [targets: one enemy] [stored damageMultiplier 256%]: 256% direct damage to one enemy and mark it as [Quarry] until it is defeated or [Rosetta] marks another enemy. This hit counts as her contribution. Marking the same enemy again keeps this turn’s count; marking a different enemy resets it.
- Skill 2 (40 Gauge) - Crimson Skyfall [targets: one enemy] [stored damageMultiplier 320%]: 320% direct damage to a living [Quarry], plus 40% for each other ally who hit it this player turn. With no living [Quarry], deal 256% direct damage to the selected enemy.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Rose Beyond the Sun [targets: one enemy] [stored damageMultiplier 1440%]: 1440% direct damage to the [Quarry], or to the selected enemy if there is none. If at least two different allies hit the [Quarry] this player turn, heal those allies for 15% of their maximum Health.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Thornia (`thornia`) - 6-star Chaotic Tank
- Title: Destruction held to account at the garden gate. Weapon: Greatsword.
- Native role/loop: Enemy-action thorn trapper. [Thornia] places a [Thorn Trap] that strikes an enemy whenever it attacks; [Shadow Rose Cleave] can spend a charge for immediate damage.
- Base stats (content, after native selfStats none): HP 280, Def 17, Atk 31, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 280, Def 25.5, Atk 31, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Forbidden Garden: Each enemy can hold one [Thorn Trap] from [Thornia], with up to three charges. When that enemy finishes an action that deals direct damage to any ally, one charge is spent for a strike of 60% of [Thornia]’s Attack. This happens once per enemy action, however many allies it hits. Damage absorbed by shields still counts; actions that deal no damage do not.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Gilded Thorn Guard [targets: one enemy]: Place a [Thorn Trap] with three charges on the selected enemy for three enemy phases. Recasting refreshes its charges and duration, preserving an [Empowered Thorn Trap].
- Skill 2 (40 Gauge) - Shadow Rose Cleave [targets: one enemy] [stored damageMultiplier 272%]: 272% direct damage to one enemy. If it has a [Thorn Trap], spend one charge for an extra strike of 80% of [Thornia]’s Attack.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Thousand-Rose Dominion [targets: all-enemies] [stored damageMultiplier 672%]: 672% direct damage to all enemies, then place an [Empowered Thorn Trap] with three charges on each survivor for three enemy phases. Its strikes deal 270% of [Thornia]’s Attack.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Crinso (`crinso`) - 6-star Chaotic Attacker
- Title: One blade, honest about death and renewal. Weapon: Dual-edged sword.
- Native role/loop: Alternating-edge combo duelist. Alternating [Golden Edge] and [Crimson Rupture] builds [Combo]; [Last Flare: Blossoming Cataclysm] spends it.
- Base stats (content, after native selfStats none): HP 205, Def 9, Atk 41, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 9, unused by native kits)
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 205, Def 9, Atk 82, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 9, unused by native kits)
- Passive - Rose Duality: Alternating [Golden Edge] and [Crimson Rupture] adds 1 [Combo]. Repeating either skill resets [Combo] to 0. The first use after battle starts or [Last Flare: Blossoming Cataclysm] begins a new chain at 0. [Normal Attack] does not affect the chain.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Golden Edge [targets: one enemy] [stored damageMultiplier 256%]: 256% direct damage to one enemy. If [Crinso]’s previous skill was [Crimson Rupture], this attack ignores 20% of the target’s Defense. Then updates [Combo] as described in [Rose Duality].
- Skill 2 (40 Gauge) - Crimson Rupture [targets: one enemy] [stored damageMultiplier 320%]: 320% direct damage to one enemy, increased by 64% (384% total) if [Crinso]’s previous skill was [Golden Edge]. Then updates [Combo] as described in [Rose Duality].
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Blossoming Cataclysm [targets: one enemy] [stored damageMultiplier 1248%]: 1248% direct damage to one enemy plus 216% per [Combo]. At 3 or more [Combo], the attack also ignores 45% of the target’s Defense. Uses up all [Combo] and ends the chain, so the next [Golden Edge] or [Crimson Rupture] starts a new one.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

### Elemental War / Phase 1 (6-star)

#### Nerithe (`nerithe`) - 6-star Oceanic Attacker
- Title: Sadness charted beyond the shoreless sea. Weapon: Surveyor trident.
- Native role/loop: Survey and precision-pierce attacker. [Nerithe]’s [Normal Attack] adds [Survey] points to an enemy; her skills spend them to ignore part of its Defense.
- Base stats (content, after native selfStats none): HP 235, Def 13, Atk 40, Crit 18%, CritMult 1.6x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 235, Def 13, Atk 80, Crit 18%, CritMult 1.6x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Uncharted Current: [Nerithe]’s [Normal Attack] gains 5 extra [Elemental Gauge] and adds 1 [Survey] point to its target. Only one enemy can hold [Survey]; surveying another enemy removes the old points. [Survey] disappears when its enemy is defeated.
- Normal Attack - Surveyor's Thrust: 100% Direct Attack on one enemy, +20 Gauge (+5 passive = 25 total; also adds 1 Survey). Skill Power does not apply.
- Skill 1 (25 Gauge) - Meridian Break [targets: one enemy] [stored damageMultiplier 288%]: 288% direct damage to the enemy holding [Survey], or the selected enemy if none does. Spends 1 [Survey] point, if any, to ignore 25% of the target’s Defense.
- Skill 2 (40 Gauge) - Fold the Sea [targets: all-enemies] [stored damageMultiplier 208%]: If an enemy holds [Survey], move it and all its points to the selected living enemy. Then deal 208% direct damage to all enemies.
- Last Flare (100 Gauge, caster skips next player turn) - Ocean Beyond the Map [targets: one enemy] [stored damageMultiplier 1344%]: 1344% direct damage to the enemy holding [Survey], or the selected enemy if none does. Uses up all [Survey] points; each ignores 22.5% of the target’s Defense.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Orvella (`orvella`) - 6-star Botanic Tank
- Title: Joy grows from foundations beneath the world. Weapon: Crystal mace.
- Native role/loop: Squad barrier support. [Orvella] raises a shared [Foundation] that absorbs damage for the squad until its durability runs out; it can be repaired or spent for damage.
- Base stats (content, after native selfStats none): HP 300, Def 20, Atk 32, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 300, Def 30, Atk 32, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Load-Bearing Will: Only one [Foundation] can exist. While it has durability, it absorbs up to 20% of each direct hit on a living ally (after Defense), before that ally’s shields, and loses durability equal to the amount absorbed. When one attack hits several allies at once, the absorbed amount is shared proportionally.
- Normal Attack - Plumbline Strike: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Keystone Reversal [targets: one enemy] [stored damageMultiplier 224%]: 224% direct damage to one enemy, then repair the [Foundation] by 8% of [Orvella]’s maximum Health. With no [Foundation], deal 288% direct damage instead.
- Skill 2 (40 Gauge) - Raise the Faultline [targets: all-allies]: Create a [Foundation] with durability equal to 30% of [Orvella]’s maximum HP for three enemy phases. Recasting replaces it at full durability; it never stacks.
- Last Flare (100 Gauge, caster skips next player turn) - Worldweight Citadel [targets: all-enemies] [stored damageMultiplier 960%]: 960% direct damage to all enemies. An existing [Foundation] is used up for an extra strike on each enemy that deals three times the damage of a strike using its remaining durability as Attack, reduced by Defense.
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Vaelor (`vaelor`) - 6-star Atmospheric Attacker
- Title: Calm holds the note between storms. Weapon: Resonance blade.
- Native role/loop: Three-beat attacker. [Vaelor]’s skills change with a repeating three-step [Beat]; [Crescendo] strengthens [Last Chord of the Sky].
- Base stats (content, after native selfStats none): HP 210, Def 11, Atk 45, Crit 22%, CritMult 1.65x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 8, unused by native kits)
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 210, Def 11, Atk 90, Crit 22%, CritMult 1.65x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 8, unused by native kits)
- Passive - Standing Thunder: The [Beat] cycles [Tune] → [Rise] → [Crescendo] → [Tune], moving one step every player turn, even when [Vaelor] is recovering or cannot act. Each battle starts on [Tune].
- Normal Attack - Tuning Strike: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Forked Cadence [targets: one enemy] [stored damageMultiplier 272%]: 272% direct damage to one enemy. On [Tune], +30 percentage points Critical Rate for this attack.
- Skill 2 (40 Gauge) - Resonance Cascade [targets: all-enemies] [stored damageMultiplier 192%]: 192% direct damage to all enemies. On [Rise], [Vaelor] deals 20% more direct damage until the end of his next player turn; recasting refreshes it and it never stacks.
- Last Flare (100 Gauge, caster skips next player turn) - Last Chord of the Sky [targets: all-enemies] [stored damageMultiplier 1248%]: 1248% direct damage to all enemies, or 1632% on [Crescendo].
  - Scaling note: shown direct-damage percentages already include the x1.6 skill / x4.8 (1.6x3) Last Flare tuning (native-balance.ts).

#### Caldrex (`caldrex`) - 6-star Infernic Tank
- Title: Wrath banked behind a closed furnace gate. Weapon: Forge gauntlets.
- Native role/loop: Heat-banking tank. [Caldrex] banks [Heat] when enemies hit him, shields and taunts random single-target attacks, then spends [Heat] for [Burn] strikes or a gate-wide shield.
- Base stats (content, after native selfStats none): HP 300, Def 20, Atk 32, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 300, Def 30, Atk 32, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Banked Heat: Gain 1 [Heat] (maximum 3) when an enemy direct attack damages [Caldrex]’s Health or Shield, once per enemy phase. Redirected damage and damage over time never grant [Heat]. [Heat] resets with each new encounter.
- Normal Attack - Gate Bash: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Close the Kiln [targets: all-allies]: Shield every living squad member for 12% of their maximum HP, scaled by Skill Power. Taunt: during the next enemy phase, enemy attacks that would pick a random single target are directed at [Caldrex]; area-of-effect and scripted attacks are not overridden.
- Skill 2 (40 Gauge) - Cinder Discharge [targets: all-enemies] [stored damageMultiplier 255%]: Spend all [Heat]: 255% direct damage to all enemies plus 24% per [Heat] spent, and apply [Burn] to each enemy hit.
- Last Flare (100 Gauge, caster skips next player turn) - Nothing Beyond These Gates [targets: all-allies]: Spend all [Heat]. Shield every living squad member for 65% of their maximum HP plus 12% Defense per [Heat] spent for 2 turns (both scaled by Skill Power) and taunt for the next enemy phase (random single-target attacks only; area-of-effect and scripted attacks are not overridden). For the next 2 enemy phases, ability-applied [Burn] from allies deals 25% more while [Caldrex] lives; [Burn] detonations and Conduit damage are unchanged.

#### Solenne (`solenne`) - 6-star Tranquilitic Tank
- Title: Peace held in the silence between two chimes. Weapon: Temple bell shield.
- Native role/loop: Stillness tank. [Solenne] holds [Stillness] charges that soften each hit, then spends them for a bell-toll strike and squad shield.
- Base stats (content, after native selfStats none): HP 285, Def 19, Atk 30, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 285, Def 28.5, Atk 30, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Held Stillness: Hold up to 4 [Stillness]. When [Solenne] takes direct or periodic damage, she consumes 1 [Stillness] to reduce that damage by 20% before shields. [Stillness] resets with each new encounter.
- Normal Attack - Bell Tap: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Answer the Bell [targets: one enemy] [stored damageMultiplier 240%]: 240% direct damage to one enemy, apply [Weaken], and taunt for the next enemy phase (random single-target attacks only; area-of-effect and scripted attacks are not overridden).
- Skill 2 (40 Gauge) - Circle of Repose [targets: all-allies]: Gain 2 [Stillness] and shield every living squad member for 16% of their maximum HP, scaled by Skill Power.
- Last Flare (100 Gauge, caster skips next player turn) - The Last Reverberation [targets: all-enemies] [stored damageMultiplier 720%]: Spend all [Stillness]: 720% direct damage plus 45% per [Stillness] spent to all enemies, and shield every living squad member for 24% of their maximum HP plus 4.5% per [Stillness] spent, scaled by Skill Power.

#### Myrthen (`myrthen`) - 6-star Botanic Attacker
- Title: Joy and Life turn with every season. Weapon: Chained sickles.
- Native role/loop: Seasonal reaper. [Myrthen] turns through [Sprout], [Bloom] and [Harvest] with Skills; [Harvest] empowers her next Skill or Last Flare.
- Base stats (content, after native selfStats none): HP 220, Def 11, Atk 44, Crit 22%, CritMult 1.65x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 220, Def 11, Atk 88, Crit 22%, CritMult 1.65x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Turning Season: Each battle starts in [Sprout]. Using a Skill advances [Sprout] to [Bloom] to [Harvest]. In [Harvest], the next Skill or Last Flare deals 35% more direct damage, then returns to [Sprout]. Normal Attacks never advance the season; a Last Flare outside [Harvest] preserves it.
- Normal Attack - Sickle Cut: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Reaper’s Claim [targets: one enemy] [stored damageMultiplier 272%]: 272% direct damage to one enemy, then mark it with [Reaper’s Claim] for 2 enemy phases: it takes 12% more native direct damage from squad attacks and abilities, not Conduit-generated damage or periodic damage. Only one enemy is marked at a time. In [Harvest], ignores 20% of the target’s Defense.
- Skill 2 (40 Gauge) - Turn the Bough [targets: all-enemies] [stored damageMultiplier 192%]: 192% direct damage to all enemies. In [Harvest], ignores 20% of their Defense.
- Last Flare (100 Gauge, caster skips next player turn) - All That Ripens [targets: one enemy] [stored damageMultiplier 1248%]: 1,248% direct damage to one enemy. In [Harvest], ignores 30% of its Defense.

#### Neralis (`neralis`) - 6-star Oceanic Healer & Support
- Title: The current that returns for the last traveler. Weapon: Crescent polearm.
- Native role/loop: Oceanic healer and support. Attack to build [Current], rescue one wounded ally, or spend [Current] to heal the squad.
- Base stats (content, after native selfStats none): HP 240, Def 12, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 360, Def 12, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Returning Current: Gain 1 [Current], up to 3, when Neralis’s Normal Attack damages an enemy or his ability restores missing Health. Gain at most 1 per action, even when healing several allies. Healing after spending [Current] can earn 1 back; healing full Health, the Support role perk and Conduit healing do not count. With [Amber-Station Return Manifold], the cap is 4.
- Normal Attack - Crescent Thrust: 100% Direct Attack on one enemy, +20 Gauge (see passive for extra hooks). Skill Power does not apply.
- Skill 1 (25 Gauge) - Light the Next Station [targets: one-ally]: Restore 35% maximum Health to one living squad member, scaled by Skill Power. Grant +30% Defense for 2 turns.
- Skill 2 (40 Gauge) - Carry Them Back [targets: all-allies]: Spend all [Current]. Restore 18% maximum Health to each living squad member, plus 6% per [Current] spent, scaled by Skill Power. [Amber-Station Return Manifold] increases the per-Current heal to 9%.
- Last Flare (100 Gauge, caster skips next player turn) - No Crossing Left Empty [targets: all-enemies] [stored damageMultiplier 720%]: Spend all [Current]. Deal 720% direct Attack to all enemies and restore 30% maximum Health to each living squad member, plus 5% per [Current] spent, scaled by Skill Power.

#### Varkhel (`varkhel`) - 6-star Infernic Tank
- Title: Wrath held on a chain instead of unleashed. Weapon: Chained counterweight.
- Native role/loop: Infernic tension tank. Shield and Taunt to build [Tension] from incoming hits, then spend it on a piercing strike or a squad-shielding Last Flare.
- Base stats (content, after native selfStats none): HP 305, Def 21, Atk 33, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 305, Def 31.5, Atk 33, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Tension Held: Gain 1 [Tension], up to 4, when an enemy direct attack effectively damages Varkhel’s Health or Shield, once per enemy phase. His damaging Normal Attack also grants 1 [Tension]. [Faultstar Chain Accumulator] raises the cap to 5.
- Normal Attack - Counterweight Strike: 100% Direct Attack on one enemy, +20 Gauge (see passive for extra hooks). Skill Power does not apply.
- Skill 1 (25 Gauge) - Set the Warning Chain [targets: all-allies]: Grant Varkhel a Shield equal to 25% maximum Health, scaled by Skill Power. Gain +40% Defense for 2 turns and Taunt for the next enemy phase. [Scarlet-Hinge Load Distributor] also shields each other living ally for 16% maximum Health, scaled by Skill Power.
- Skill 2 (40 Gauge) - Return the Strain [targets: one enemy] [stored damageMultiplier 285%]: Spend all [Tension]. Deal 285% of Direct Attack to one enemy, plus 45% per [Tension] spent. Ignore 20% of its Defense; [Recoil-Star Compression Turbine] raises this to 35% and refunds 15% maximum Gauge when at least 3 [Tension] were spent.
- Last Flare (100 Gauge, caster skips next player turn) - The Bridge Holds Behind Me [targets: all-enemies] [stored damageMultiplier 690%]: Spend all [Tension]. Deal 690% of Direct Attack to all enemies, plus 55% per [Tension] spent. Shield each living squad member for 30% maximum Health, scaled by Skill Power.

#### Seravelle (`seravelle`) - 6-star Infernic Support
- Title: A signal raised for people, not for conquest. Weapon: Silver lance.
- Native role/loop: Infernic convoy support. Squad Normal Attacks build [Cadence]. Spend it to strengthen the squad; Last Flare gives other allies Gauge and Skill Power.
- Base stats (content, after native selfStats none): HP 235, Def 13, Atk 34, Crit 14%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 352.5, Def 13, Atk 34, Crit 14%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Convoy Cadence: The first squad Normal Attack that damages an enemy each round grants 1 [Cadence], up to 3, while Seravelle is alive. Seravelle’s own Normal Attack counts. The whole squad can earn only 1 per round; triggered attacks do not count. With [Ashroad Cadence Transmission], the cap is 4.
- Normal Attack - Beacon Lance: 100% Direct Attack on one enemy, +20 Gauge (see passive for extra hooks). Skill Power does not apply.
- Skill 1 (25 Gauge) - Send the Ember Ahead [targets: one enemy] [stored damageMultiplier 245%]: Deal 245% direct Attack to one enemy. Apply [Burn] for 2 enemy phases, dealing 12% of Seravelle’s Direct Attack per phase, scaled by her Skill Power.
- Skill 2 (40 Gauge) - Move as One [targets: all-allies]: Spend all [Cadence]. Grant each living squad member +30% Direct Attack for 2 turns, plus 10% per [Cadence] spent. This fixed buff is not scaled by Skill Power. [Ashroad Cadence Transmission] raises its base bonus to 40%.
- Last Flare (100 Gauge, caster skips next player turn) - The Road Belongs to Everyone [targets: all-enemies] [stored damageMultiplier 620%]: Deal 620% direct Attack to all enemies. Grant each other living squad member 20% maximum Gauge and +30 percentage points Skill Power for 2 turns; these buffs do not strengthen this attack.

#### Velmira (`velmira`) - 6-star Chaotic Attacker
- Title: The cut that opens a way without erasing what matters. Weapon: Pair of crescent blades.
- Native role/loop: Chaotic alternating-edge attacker. Alternate [Open the Seam] and [Turn the Other Edge] to build [Crosscut]. Keep it for area Defense-piercing or spend it on Last Flare.
- Base stats (content, after native selfStats none): HP 218, Def 11, Atk 45, Crit 23%, CritMult 1.65x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 218, Def 11, Atk 90, Crit 23%, CritMult 1.65x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Alternating Edge: After using a different Skill from Velmira’s previous Skill, gain 1 [Crosscut], up to 3. The first Skill grants no stack. Repeating a Skill keeps existing stacks but grants none. Normal Attacks and Last Flare do not change which Skill comes next in the sequence. With [Twin-Edge Sequence Orrery], the cap is 4 and the first Skill grants 1 [Crosscut] after resolving.
- Normal Attack - Measured Edge: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Open the Seam [targets: one enemy] [stored damageMultiplier 280%]: Deal 280% direct Attack to one enemy. Apply [Weaken] for 2 enemy phases, reducing its direct damage by 25%. [Goldseam Precision Fracturer] deals 35% more direct damage against a Weakened enemy.
- Skill 2 (40 Gauge) - Turn the Other Edge [targets: all-enemies] [stored damageMultiplier 205%]: Deal 205% direct Attack to all enemies. With at least 2 [Crosscut] before this attack, ignore 20% of their Defense; [Goldseam Precision Fracturer] raises this to 35%. Keep your stacks; any new [Crosscut] is gained after the attack.
- Last Flare (100 Gauge, caster skips next player turn) - Leave the Doorway Standing [targets: one enemy] [stored damageMultiplier 1050%]: Spend all [Crosscut]. Deal 1,050% direct Attack to one enemy, plus 90% per [Crosscut] spent. Ignore 30% of its Defense. [Open-Threshold Return Drive] refunds 25% maximum Gauge and heals Velmira for 18% maximum Health when at least 3 [Crosscut] were spent; Recovery still applies.

### Calamitic (7-star)

#### Ozriel (`ozriel`) - 7-star Tranquilitic Tank
- Title: The wall that refuses the ending. Weapon: Cathedral tower shield and glass halberd.
- Native role/loop: Shield tank. [Ozriel] protects every living squad member with stacking shields and one [Refusal] per encounter while he lives.
- Base stats (content, after native selfStats {"health":0.65,"defense":0.65}): HP 569.25, Def 39.6, Atk 34, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 569.25, Def 59.4, Atk 34, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Refusal: Ozriel gains +65% Defense and +65% Health. While he is alive, each squad member (including Ozriel) survives one lethal hit per encounter with 1 HP.
- Normal Attack - Halberd Verdict: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Pane of Absolution [targets: one enemy] [stored damageMultiplier 240%]: Deal 240% direct damage to one enemy, then reduce its direct damage by 50% with Weaken for the next two Enemy Turns.
- Skill 2 (40 Gauge) - Cathedral of Shards [targets: all-allies]: Grant each living squad member a 90-strength Shield, scaled by Skill Power.
- Last Flare (100 Gauge, caster skips next player turn) - The World Refuses [targets: all-enemies] [stored damageMultiplier 455%]: Deal 455% direct damage to all enemies. Grant each living squad member a 140-strength Shield, scaled by Skill Power.

#### Ilvaris (`ilvaris`) - 7-star Atmospheric Support
- Title: The choir that sings a different tomorrow. Weapon: Glass halo-lyre.
- Native role/loop: Mark and healing support. [Ilvaris] builds [Fate-seared Mark] to five stacks and refreshes [Hymn of Broken Glass] while healing the squad.
- Base stats (content, after native selfStats {"health":2,"defense":1}): HP 795, Def 32, Atk 40, Crit 15%, CritMult 1.55x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 5, unused by native kits)
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 1192.5, Def 32, Atk 40, Crit 15%, CritMult 1.55x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 5, unused by native kits)
- Passive - Severed Prophecy: Ilvaris gains +200% Health and +100% Defense. The whole squad deals 45% more damage to enemies with Fate-seared Mark, in addition to the Mark’s own damage bonus.
- Normal Attack - Struck Chord: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Unwritten Verse [targets: one enemy] [stored damageMultiplier 225%]: Deal 225% direct damage to one enemy, then add 1 Fate-seared Mark (max 5). Each stack makes it take 10% more squad damage. Marks last through the next two Enemy Turns; reapplying adds a stack and refreshes their duration.
- Skill 2 (40 Gauge) - Hymn of Broken Glass [targets: all-allies]: Heal each living squad member for 35% of their maximum Health. Increase their Critical Damage multiplier by 45% and Skill Power by 50 percentage points through the next Player Turn. Recasting refreshes the buffs.
- Last Flare (100 Gauge, caster skips next player turn) - Tomorrow, Unwritten [targets: all-enemies] [stored damageMultiplier 440%]: Deal 440% direct damage to all enemies. Heal each living squad member for 50% of their maximum HP and restore 10% of their Elemental Gauge capacity.

#### Kaelith (`kaelith`) - 7-star Chaotic Attacker
- Title: The blade that cuts the thread of fate. Weapon: Shatterglass greatscythe.
- Native role/loop: Fractalized Incision attacker. [Kaelith] builds three [Fractalized Incision] stacks through direct hits; [Glass Meridian] spends them for a stronger strike.
- Base stats (content, after native selfStats {"skillPower":0.75}): HP 240, Def 13, Atk 50, Crit 22%, CritMult 1.7x, GaugeCap 100, SkillPower 175%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 10, unused by native kits)
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 240, Def 13, Atk 100, Crit 22%, CritMult 1.7x, GaugeCap 100, SkillPower 225%, SkillDur 0, SkillEff 0%, GaugeGain 100%, (legacy ElemDmg 10, unused by native kits)
- Passive - Reality Fault: Kaelith gains +75% Skill Power and +5% Skill Critical Rate. Each of her direct hits adds 1 Fractalized Incision stack (max 3). Each stack makes that enemy take 10% more squad damage, up to 30%, until consumed by Glass Meridian.
- Normal Attack - Fault Reap: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Shatterfall [targets: all-enemies] [stored damageMultiplier 456%]: Deal 456% direct damage to all enemies.
- Skill 2 (40 Gauge) - Glass Meridian [targets: one enemy] [stored damageMultiplier 365%]: Deal 365% direct damage to one enemy, increased by 20% for each Fractalized Incision stack it already has (up to 60%). Consume all of its stacks after the hit, including the stack added by Reality Fault.
- Last Flare (100 Gauge, caster skips next player turn) - Denial of Fate [targets: all-enemies] [stored damageMultiplier 360%]: Deal 360% direct damage to all enemies.

### Moon (6-star; inactive until launch approval)

#### Maerion (`maerion`) - 6-star Oceanic Healer & Support
- Title: The Ferry Remembers Every Name. Weapon: Crescent Polearm.
- Native role/loop: Measured recovery support. Turn allies’ direct Health losses into [Unreturned], then spend it to heal one ally or the whole team.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Names Still Carried: While Maerion lives, store allies’ direct Health loss as [Unreturned], up to 45% of his maximum Health. Redirected damage and damage-over-time do not count.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Crescent Triage [targets: one enemy] [stored damageMultiplier 200%]: Deal 200% Direct Attack damage to one enemy and heal the living ally with the lowest Health percentage for 25% of their maximum Health.
- Skill 2 (40 Gauge) - A Place on the Ferry [targets: one-ally]: Heal one chosen living ally for 45% of maximum Health plus all stored [Unreturned], then spend it.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Bring Every Name Home [targets: all-allies]: Heal all living squad members for 70% of maximum Health. Split stored [Unreturned] evenly among them as extra healing, then spend it.

#### Caevren (`caevren`) - 6-star Atmospheric Tank
- Title: The Meridian Holds Through Night. Weapon: Counterweight Flail.
- Native role/loop: Counterweight interception tank. Take enemy hits to build [Load], then spend it to strengthen Caevren’s Last Flare Shield.
- Base stats (content, after native selfStats none): HP 280, Def 17, Atk 31, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 280, Def 25.5, Atk 31, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Weight of the Watch: When an enemy direct attack damages Caevren’s Health or Shield, gain 1 [Load] (max 3), once per enemy phase. Redirected hits count.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Hold the Meridian [targets: one enemy] [stored damageMultiplier 280%]: Deal 280% Direct Attack damage to one enemy and taunt eligible attacks through the next enemy phase.
- Skill 2 (40 Gauge) - Counterweight Covenant [targets: one-ally]: Give one chosen other living ally Shield equal to 30% of maximum Health. For two enemy phases, redirect 30% of their incoming enemy direct damage to Caevren while he lives.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: The Night Shall Not Fall [targets: one enemy]: Spend all [Load]. Shield Caevren for 60% of maximum Health plus 12% per [Load] spent. For two enemy phases, redirect 30% of every other living ally’s incoming enemy direct damage to Caevren.

#### Vespera (`vespera`) - 6-star Infernic Support
- Title: One Beacon Remains Beyond the Wall. Weapon: Signal Standard.
- Native role/loop: Signal and team-offense support. [Signal] boosts an ally’s next damaging Skill; when it is spent, gain [Beacon] for Vespera’s Last Flare.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Someone Still Beyond the Walls: When another living ally spends Vespera’s [Signal], gain 1 [Beacon] (max 3), once per player turn.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Whitefire Dispatch [targets: one enemy] [stored damageMultiplier 220%]: Deal 220% Direct Attack damage to one enemy and Burn it for 25% of Vespera’s Direct Attack per enemy phase for three enemy phases. Burn ignores Defense.
- Skill 2 (40 Gauge) - Keep the Last Beacon [targets: one-ally, excludes self]: Give one other living ally [Signal]: their next damaging Skill or Last Flare deals 35% more direct damage, through the next player turn. Reapplying refreshes it rather than stacking.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: None Left in the Dark [targets: all-enemies, excludes self] [stored damageMultiplier 480%]: Spend all [Beacon]. Deal 480% Direct Attack damage to all enemies, then Signal every other living ally for 50% more direct damage plus 10% per [Beacon] spent, through the next player turn.

#### Ilyss (`ilyss`) - 6-star Chaotic Healer & Support
- Title: What Need Not Remain. Weapon: Connected Severance Shears.
- Native role/loop: Debuff-cleansing healer. Remove harmful statuses to build [Severance], then spend it to strengthen team healing.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - What Need Not Remain: When Ilyss removes one [Burn] or [Weaken] application with a Skill or Last Flare, gain 1 [Severance] (max 3), once per player turn.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Cut the Harmful Thread [targets: one enemy] [stored damageMultiplier 220%]: Deal 220% Direct Attack damage to one enemy and Weaken it by 25% for two enemy phases.
- Skill 2 (40 Gauge) - Unbind the Living [targets: one-ally]: Heal one chosen living ally for 45% of maximum Health. Remove one chosen [Burn] or [Weaken] application from them, if present.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: No Promise of Resurrection [targets: all-allies]: Spend all [Severance]. Heal every living squad member for 65% of maximum Health plus 10% per [Severance] spent. Remove one [Burn] from each member, if present; otherwise remove one [Weaken].

#### Asteriel (`asteriel`) - 6-star Botanic Support
- Title: Every Orbit Carries a Future. Weapon: Seed Orrery.
- Native role/loop: Path-changing support. Switch between [Shelter] and [Flourish] to earn [Promise], then spend it on stronger team Shields or Moonflower attacks.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Futures Given Freely: Begin without a path. Skill1 enters [Shelter]; Skill2 enters [Flourish]. Switching between paths grants 1 [Promise] (max 3).
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Lend the Quiet Seed [targets: all-allies]: Enter [Shelter] and Shield every living squad member for 25% of maximum Health.
- Skill 2 (40 Gauge) - Open the Night Library [targets: all-allies]: Enter [Flourish] and give every living squad member [Moonflower]: their next damaging Skill or Last Flare deals 30% more direct damage, through the next player turn. Reapplying refreshes it rather than stacking.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Every Orbit Bears a Future [targets: one enemy]: Spend all [Promise]. In [Shelter], Shield every living squad member for 45% of maximum Health plus 8% per [Promise] spent. In [Flourish], give every living member [Moonflower] for 50% more direct damage plus 10% per [Promise] spent. With no path, use [Shelter]. Keep the current path.

#### Serapha (`serapha`) - 6-star Tranquilitic Healer & Support
- Title: A Sanctuary in the Open Interval. Weapon: Split-Oval Mercy Scepter.
- Native role/loop: Protective-window healer. Weaken enemies to build [Interval] from their attacks, then spend it on stronger team healing and protection.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - An Interval Without Surrender: When an enemy carrying Serapha’s [Weaken] uses a direct attack, gain 1 [Interval] (max 3), once per enemy phase.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Terms of Mercy [targets: one enemy] [stored damageMultiplier 240%]: Deal 240% Direct Attack damage to one enemy and Weaken it by 20% for two enemy phases.
- Skill 2 (40 Gauge) - A Passage Left Open [targets: all-allies]: Heal every living squad member for 30% of maximum Health. Give each [Ceasefire], reducing their next enemy direct hit by 20%. It expires after the next enemy phase; reapplying refreshes it rather than stacking.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Let Them Leave Alive [targets: all-allies]: Spend all [Interval]. Heal every living squad member for 70% of maximum Health. Give each [Ceasefire] to reduce one next enemy direct hit by 20% plus 5% per [Interval] spent; it expires after two enemy phases.

### Sunshade (6-star; inactive until launch approval)

#### Rhaziel (`rhaziel`) - 6-star Infernic Healer & Support
- Title: Every Repaired Join Is Remembered. Weapon: Forge Needle and Anvil Gauntlet.
- Native role/loop: Shield-and-repair healer. Shield allies before pressure; effective damage absorption becomes delayed [Repair] healing.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Record the Repaired Join: The first time each ally’s Shield from Rhaziel’s abilities absorbs enemy direct damage in an enemy phase, store 20% of that absorbed damage as [Repair], up to 20% of that ally’s maximum Health. At the start of the next player turn, spend [Repair] to heal its holder while Rhaziel lives.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Mend Before the Break [targets: one-ally]: Shield one chosen living ally for 35% of their maximum Health.
- Skill 2 (40 Gauge) - Leave the Dents Remembered [targets: all-allies]: Heal every living squad member for 20% of their maximum Health and shield each for 20% of their maximum Health.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: A Defense Worth Returning To [targets: all-allies]: Heal every living squad member for 45% of their maximum Health and shield each for 55% of their maximum Health.

#### Oryn (`oryn`) - 6-star Tranquilitic Support
- Title: No Victory Requires This. Weapon: Square-Seal Polehammer.
- Native role/loop: Single-target agreement support. [Terms] and [Accord] coordinate one attack each turn; the Last Flare broadens coverage without stacking defense.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Terms Both Sides Can Leave: Maintain [Terms] on one enemy and [Accord] on one ally. Once per player turn, an ally carrying Oryn’s [Accord] deals 30% more direct damage with a Normal Attack or ability against his [Terms] target.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - The Seal Remains Unstruck [targets: one enemy] [stored damageMultiplier 240%]: Deal 240% Direct Attack to one enemy. Apply 25% [Weaken] and [Terms] for two enemy phases, replacing Oryn’s previous [Terms] target.
- Skill 2 (40 Gauge) - An Exit in the Agreement [targets: one-ally]: Give one chosen living ally +30% Defense and [Accord] for two player turns, replacing Oryn’s previous [Accord] holder. Refreshes rather than stacks.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: No Victory Requires This [targets: all-enemies]: Apply 30% [Weaken] to all enemies for two enemy phases. Preserve any existing [Terms] target and refresh its duration. Give every living squad member +20% Defense and [Accord] for two player turns, replacing the single-ally [Accord].

#### Thessara (`thessara`) - 6-star Oceanic Support
- Title: No Village Is Omitted. Weapon: Paired-Vessel Glaive.
- Native role/loop: Gauge-delivery support. Normal Attacks and Skill1 build [Reserve]; spend it to choose focused healing or team Gauge delivery.
- Base stats (content, after native selfStats none): HP 215, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"health":0.5,"skillPower":0.25}: HP 322.5, Def 10, Atk 32, Crit 12%, CritMult 1.5x, GaugeCap 100, SkillPower 125%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Promises Measured in Water: Store up to 4 [Reserve]. Each Normal Attack or Skill1 that directly hits an enemy grants 1 [Reserve], once per action.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge (see passive for extra hooks). Skill Power does not apply.
- Skill 1 (25 Gauge) - Follow the Empty Channel [targets: one enemy] [stored damageMultiplier 240%]: Deal 240% Direct Attack to one enemy. Gain 1 [Reserve] if it hits.
- Skill 2 (40 Gauge) - Deliver What Was Promised [targets: one-ally]: Spend all [Reserve]. Heal one chosen living ally for 20% of their maximum Health, plus 10% per [Reserve] spent. Grant them 8 Elemental Gauge per [Reserve] spent.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: No Village Omitted [targets: all-allies]: Spend all [Reserve]. Heal every living squad member for 50% of their maximum Health, plus 5% per [Reserve] spent. Grant every other living squad member 6 Elemental Gauge per [Reserve] spent.

#### Elaris (`elaris`) - 6-star Botanic Attacker
- Title: A Grove Beyond the Burning Walls. Weapon: Branching Javelin.
- Native role/loop: Marked-target setup attacker. Build [Branch] on one enemy, then spend it for focused defense-piercing damage or allied [Open Route] tokens.
- Base stats (content, after native selfStats none): HP 210, Def 10, Atk 42, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 210, Def 10, Atk 84, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - A Way Through the Grove: Normal Attacks and Skill1 place 1 [Branch] on their surviving target, up to 3. Elaris maintains [Branch] on one enemy; attacking another target replaces the mark.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge (see passive for extra hooks). Skill Power does not apply.
- Skill 1 (25 Gauge) - Mark the Firebreak [targets: one enemy] [stored damageMultiplier 280%]: Deal 280% Direct Attack to one enemy, then place 1 [Branch] on a surviving target.
- Skill 2 (40 Gauge) - Branching Escape [targets: all-enemies] [stored damageMultiplier 240%]: Spend all [Branch]. Deal 240% Direct Attack to all enemies. Against the previously marked target, ignore 8% Defense per [Branch] spent.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: A Grove Beyond the Burning Walls [targets: one enemy] [stored damageMultiplier 1050%]: Spend all [Branch]. Deal 1050% Direct Attack to one enemy, plus 90% per [Branch] spent if it was the marked target. Against that target, ignore 10% Defense per [Branch] spent.

#### Veyr (`veyr`) - 6-star Chaotic Attacker
- Title: Only What Must Fall. Weapon: Articulated Demolition Lance.
- Native role/loop: Defense-fracture attacker. Build [Fault] on one enemy to lower its Defense; spend it for demolition and specialized Master effects.
- Base stats (content, after native selfStats none): HP 210, Def 10, Atk 42, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"damage":1,"skillPower":0.5}: HP 210, Def 10, Atk 84, Crit 25%, CritMult 1.7x, GaugeCap 100, SkillPower 150%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Only What Must Fall: Normal Attacks and Skill1 place 1 [Fault] on their surviving target, up to 3. Veyr maintains [Fault] on one enemy; attacking another target replaces the old mark. Each [Fault] reduces the marked enemy’s Defense by 8%. [Fault] lasts two enemy phases; new applications refresh its duration.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge (see passive for extra hooks). Skill Power does not apply.
- Skill 1 (25 Gauge) - Find the Load-Bearing Lie [targets: one enemy] [stored damageMultiplier 320%]: Deal 320% Direct Attack to one enemy, then place 1 [Fault] on a surviving target.
- Skill 2 (40 Gauge) - Dismantle the Occupied Engine [targets: all-enemies] [stored damageMultiplier 240%]: Spend all [Fault]. Deal 240% Direct Attack to all enemies and an additional 200% Direct Attack per [Fault] spent to the previously marked target.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: What Remains Standing [targets: one enemy] [stored damageMultiplier 1050%]: Spend all [Fault]. Deal 1050% Direct Attack to one enemy, plus 200% per [Fault] spent if it was the marked target.

#### Aureth (`aureth`) - 6-star Atmospheric Tank
- Title: Hold the Burning Sky Open. Weapon: Sunshade Shield and Command Blade.
- Native role/loop: Moving-shelter tank. [Lead] moves protection across the squad; changing holders earns [Momentum] for a team-wide shelter.
- Base stats (content, after native selfStats none): HP 280, Def 17, Atk 31, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Level-0/Evo-1 resolved stats incl. role perk {"defense":0.5}: HP 280, Def 25.5, Atk 31, Crit 10%, CritMult 1.5x, GaugeCap 100, SkillPower 100%, SkillDur 0, SkillEff 0%, GaugeGain 100%
- Passive - Carry the Corridor Forward: Maintain [Lead] on one living ally. Moving it to a different ally grants 1 [Momentum], up to 3, once per player turn. Its holder takes 20% less enemy direct damage for two enemy phases while Aureth lives.
- Normal Attack - Normal Attack: 100% Direct Attack on one enemy, +20 Gauge. Skill Power does not apply.
- Skill 1 (25 Gauge) - Take the Sheltered Route [targets: one-ally]: Shield one chosen living ally for 35% of their maximum Health. Move [Lead] to them and refresh its duration.
- Skill 2 (40 Gauge) - Turn the Ashwind Aside [targets: all-enemies] [stored damageMultiplier 240%]: Deal 240% Direct Attack to all enemies. Move [Lead] to Aureth and taunt eligible attacks for the next enemy phase.
- Last Flare (100 Gauge, caster skips next player turn) - Last Flare: Hold the Burning Sky Open [targets: all-allies]: Spend all [Momentum]. Shield every living squad member for 60% of their maximum Health and grant +10% Defense per [Momentum] spent for two player turns. Move [Lead] to Aureth and taunt for the next enemy phase.

## 3. Notable synergies and setup/payoff loops (as implemented at d82015ba)

Loop kinds below are what the native code enforces (`native-kits.ts`); each loop is per character unless noted.

Self-contained resource loops (build with Normal Attack / skills, spend with Skill 2 or Last Flare):
- Infernis: Cinder Cleave and Dawnfire lay Burn; Flame Arc detonates up to 2 stored phases on every enemy carrying HER Burn (ignores Defense, can crit). Burn scales by the generic `1 + level/30` rule and by Skill Power. Vespera, Seravelle, Caldrex burn on their own stored ledgers.
- Tizu: places stacking shields; Gauge +8 when a Tizu shield fully absorbs a direct hit. Last Flare shield carries a 45% first-hit reduction.
- Flora: Seeds heal at the start of the next player turn (50% / empowered 97.5% of max Health x Skill Power), Verdant Renewal harvests early then replants; Worldseed = immediate 75% heal plus empowered Seeds.
- Atmoso / Cyclone: allies' first actions add Gusts; release = 70% + 30% per Gust of Atmoso's Attack after 2 phases, or early via Razor Gale; Last Flare releases at 3x. Elise: two Shuriken, lodge then recall (90% each, +60% convergence; Last Flare 270% / 180%). Bliss: acts first/last in the squad for Opening/Closing bonuses. Bruno: Cover redirects 50% (60% LF) of a chosen ally's direct damage after Defense to him (-25% from passive). Disciple: Instruction (Strike +30% damage, Shelter +35% heal/shield potency, Resolve both at 45% / 52.5%) on the ally's next action. Aurora: Seals cut a scheduled special/ultimate 40% (25% from Eclipse); LF -75% enemy ultimate damage to allies for 2 phases. Razor: stores Wounds from direct HP loss, spends them as extra strikes; Eclipse Bastion converts HP lost into a Shield. Rosetta: Quarry plus contributions of different allies (Crimson Skyfall +40 pp per other contributor; 8% shields for allies after two contributors; LF heals contributors 15%). Thornia: Thorn Trap (3 charges) strikes on enemy attack (60% Attack; empowered 270%), Shadow Rose Cleave spends one. Crinso: alternate Golden Edge / Crimson Rupture to build Combo; Blossoming Cataclysm spends it (+45% / Combo from 260%, 3+ Combo pierces 30%; displayed LF numbers 1248% base +216 pp per Combo, 45% Defense ignore). Nerithe: Normal Attack builds Survey; Meridian Break/Ocean Beyond the Map spend it to ignore Defense (25% / 15%->22.5% each); Fold the Sea moves the mark. Orvella: Foundation absorbs 20% of each direct hit for the squad, repaired by Keystone Reversal, spent on Worldweight Citadel. Vaelor: Tune -> Rise -> Crescendo beat; Resonance Cascade on Rise buffs himself, Last Chord +30% on Crescendo.
- War kits: Caldrex Heat (max 3) -> Cinder Discharge (255% + 24%/Heat and Burn) or Nothing Beyond These Gates (squad shield 65% + 12% Defense per Heat, +25% ally ability-Burn for 2 phases). Solenne Stillness (max 4) softens each hit by 20% and pays out in a 720% + 45%/Stillness Last Reverberation with squad shield. Myrthen Sprout -> Bloom -> Harvest; Harvest is +35% direct damage and Defense ignore 20% (30% on All That Ripens). Neralis Current (max 3) -> Carry Them Back 18% + 6%/Current squad heal, LF 30% + 5%/Current and 720% damage. Varkhel Tension (max 4) -> Return the Strain 285% + 45%/Tension (20% pierce), LF 690% + 55%/Tension with 30% squad shield. Seravelle: squad Normal Attacks (1 per round) -> Cadence (max 3) -> Move as One (+30% Direct Attack +10%/Cadence, fixed, not Skill-Power scaled). Velmira alternates Open the Seam / Turn the Other Edge for Crosscut (max 3): Turn pierces 20% Defense at 2+, LF 1050% + 90%/Crosscut with 30% pierce.
- Moon: Maerion Unreturned (stores allies' direct Health loss up to 45% of his Health) -> A Place on the Ferry / Bring Every Name Home heals. Caevren Load -> LF shield 60% + 12%/Load. Vespera Signal (ally's next damaging skill +35% direct damage) -> Beacon for her LF (Signal to everyone for 50% + 10%/Beacon). Ilyss cleanses Burn/Weaken to build Severance -> LF heal 65% + 10%/Severance. Asteriel Shelter/Flourish switching -> Promise (shields 45% + 8%/Promise, or Moonflower 50% + 10%/Promise). Serapha Weaken -> Interval (from enemy attacks) -> LF heal 70% + Ceasefire 20% + 5%/Interval.
- Sunshade: Rhaziel shields -> Repair (20% of absorbed damage, cap 20% max Health, heals at next player turn). Oryn Terms on an enemy + Accord on an ally (+30% direct damage once per turn). Thessara Reserve (Normal / Skill 1 hits) -> heal + Gauge delivery. Elaris Branch (max 3; 8% Defense ignore per Branch) and Veyr Fault (max 3; -8% Defense each on the marked target, then Dismantle deals 200% per Fault). Aureth Lead moved between allies earns Momentum (LF shield 60% + 10%/Momentum).
- Calamitic: Ozriel Refusal (each squad member survives a lethal hit once per encounter at 1 HP) + big stacking shields (90/140, Skill-Power scaled) + Pane's 50% Weaken. Ilvaris Fate-seared Mark (to 5; each stack +10% squad damage, plus passive x1.45 total on marked targets, all squad damage including periodic) + Hymn (+45% crit damage and +50 pp Skill Power for 2 turns, heal 35%). Kaelith Fractalized Incision (to 3; +10% squad damage each, consumed by Glass Meridian for +20% per stack up to +60%).

Cross-kit multipliers and enablers (the team-play layer):
1. Damage-taken amplifiers on an enemy (apply to ALL squad damage, `nativeDamageTakenMultiplier`): Ilvaris Mark (1 + 0.1 x stacks) x 1.45; Kaelith Incision +10%/stack (+30% max); Myrthen Reaper's Claim +12% on native direct damage; Veyr Fault lowers target Defense 8%/stack (`nativeTargetDefense`). Strongest-payoff stacking: Ilvaris + Kaelith + Veyr under a heavy hitter (Elaris/Velmira/Crinso/Elise Last Flare).
2. Next-action damage buffs: Vespera Signal, Asteriel Moonflower, Disciple Strike/Resolve, Oryn Accord, Bliss Opening (+10% x SP, Quietstorm), Vaelor Rise, Seravelle Move as One (+Direct Attack), Open Route pierce (Elaris with Master). Typically one buff consumed per next damaging action.
3. Skill Power / Gauge engines: Seravelle Last Flare (+30 pp Skill Power and 20% Gauge to other allies for 2 turns), Ilvaris Hymn (+50 pp), Thessara Gauge delivery, Tizu Gauge from absorbed hits, Nerithe 25 Gauge Normal Attack, role perks (Attacker +50 pp, Support +25 pp), Element Resonance (+5 pp at 3 same element). Skill Efficiency and Skill Duration only came from Conduits/Ascension in the base roster.
4. Order-dependent kits: Bliss (acting first vs last), Atmoso Cyclone/Gust (needs OTHER allies to act while Cyclone is active), Rosetta Quarry (needs different allies to hit the same target in the same turn), Disciple Instruction (new Instruction takes effect after the granting action), Vespera (Signal spent by another ally's action grants a Beacon), Elise/Veyr/Elaris/Nerithe (marks tied to one enemy; switching targets resets).
5. Protection stack: Orvella Foundation (20% absorb), Bruno/Caevren/Aureth Cover/Intercept/Lead, Tizu/Ozriel/Rhaziel shields (stack until broken), Solenne/Caldrex taunts, Serapha Ceasefire, Aurora Seals, Ozriel Refusal. Support role perk adds 4% squad heal on each Skill/Last Flare action.
6. Last Flare cadence: every Last Flare skips the caster's next turn, so kits that bank charges (Heat, Stillness, Current, Tension, Cadence, Beacon, Crosscut, Combo, Survey) are tuned around a 100-Gauge spend then recovery. Vaelor's Beat and Flora's Seeds keep ticking during recovery.

## 4. Ambiguities and things I could not fully pin down
- Release status: ids Moon/Sunshade exist in `fighters` at this commit but their banners/events were not launched (AGENTS.md); Calamitic acquired via EX activity chance (`calamiticCharacterByTier`).
- Display names "Prefix, Character name" come from `characterName(id, evolution, ascended)` and `*EvolutionTitles`; this catalog lists base names only.
- Per-character Master Conduit effects (3 each, `master-<id>-N`) are NOT catalogued; they modify live numbers inside `nativeAction`.
- `ascension.stats` x1.5 loop in `resolveFighter` multiplies all numeric stats including skillPower/gaugeGain/skillDuration as written; unclear if intended.
- The `strength.damageMultiplier` for support kits without a damage coefficient is absent (e.g. Tizu Skill 2); healing/shield values live only in the description and hard-coded fractions.
- Hard-coded values in `nativeAction` that differ subtly from descriptions: Tizu Undertow Thrust Weaken base is 1 enemy phase (matches "next enemy phase"); Thornia's Last Flare trap coefficient is `.9 * 3 = 270%` x Skill Power; Elise recalls "generate no Gauge" because they use `fixed(..., stored=false)` packets.
- Enemy-phase specifics (Calamity patterns, scheduled enemy skills `content/enemy-skills.ts`, enemy stat growth) were not catalogued.
- Legacy kit-pilot rules in Appendix A are from `content/kit-pilots.ts` descriptions; the runtime implementation (`game/kit-pilots.ts`) was only skimmed.

## Appendix A. Legacy base kits (dead code for heroes; pre-D-316 design, still in the base definition files at d82015ba)

These are the `FighterDefinition` kits in combat.ts / flagships.ts / war-characters.ts BEFORE the native override. Numbers: damageMultiplier etc. in the pre-native flat style (cooldown 0). They were scaled in `resolveFighter` by potency (damage, burn, weaken, crit bonus, attackBoost) and growth factor (shield, healing), with passive damageBonus/healFraction x potency and defenseBonus x factor^0.7; Weaken/crit bonus clamped to 1. Legacy burn = `elementalDamage * burnMultiplier`, 2 enemy phases (cap 6). Legacy attackBoost cap 65%, refreshed not stacked. Legacy pilot charge rules (kit-pilots.ts `kitResourceUses`): Ember Flame Arc +8%/Last Flare +12% damage per Infernic Embers charge (charge when own Burn deals damage); Tide Undertow +5 pp Weaken / LF +5% max Health team shield per Oceanic Protection charge (charge when own shield absorbs a direct hit); Flora and Bliss Botanic Renewal (charge when own healing restores missing HP): Skill 1 +10% (Bliss +8%) damage per charge, LF +15% healing (Flora) or +5% max-Health shield per charge (Bliss); Atmoso/Elise Skill 1 and Vaelor Skill 2 +8% damage per Atmospheric Charge, LF +12% (charge from a critical Normal/Skill 1/Skill 2 that deals damage, once per use); Rosetta Rose Grace (charge when healing restores missing HP) Skill 1 +5 pp Weaken, LF +10% damage; Thornia Thorn Aegis (shield absorbs a hit) Skill 2 +5 pp Weaken, LF +5% max-Health team shield; Crinso Rose Duality (own Burn damage) Skill 1 +8%, LF +12% damage. Charges unlimited; Conduit healing/shields never earned them. Support-role legacy behaviours (Tide/Flora Skill 2 targeting) are not described here.

Legacy kit data (machine-extracted):

- **ember** pilot=ember; stats {"health":220,"defense":10,"damage":38,"crit":0.15,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":8}
  - passive Unbroken Ember: +20% outgoing damage at or below 50% health. [damageBonus 0.2, defenseBonus 0, healFraction 0]
  - skill1 Cinder Cleave: 160% damage to one enemy; burn for 8 damage on its next two enemy phases. strength={"damageMultiplier":1.6,"burnMultiplier":1}
  - skill2 Flame Arc: 110% damage to every living enemy. Spends all Infernic Embers charges for +8% outgoing damage per charge; one spend for the whole activation. strength={"damageMultiplier":1.1}
  - ultimate Last Flare: Dawnfire: 280% damage to every enemy; burn surviving targets for 6 damage on their next two enemy phases. Recover next turn. Spends all Infernic Embers charges for +12% outgoing damage per charge; one spend for the whole activation. strength={"damageMultiplier":2.8,"burnMultiplier":0.75}

- **tide** pilot=ward; stats {"health":260,"defense":16,"damage":30,"crit":0.1,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Stillwater Guard: +8 defense, already included in displayed effective defense. [damageBonus 0, defenseBonus 8, healFraction 0]
  - skill1 Undertow Thrust: 150% damage to one enemy; reduce its next two enemy-phase attacks by 25%. Spends all Oceanic Protection charges for +5 percentage points Weaken per charge. strength={"damageMultiplier":1.5,"weakenFraction":0.25}
  - skill2 Tidal Shelter: Give every living ally 25 shield (lasts until broken; stacks). strength={"shield":25}
  - ultimate Last Flare: Ocean Memory: 220% damage to all enemies and 35 shield for allies. Recover next turn. Spends all Oceanic Protection charges to increase this ability's team shield by 5% of your maximum Health per charge. The shield lasts until broken and adds to any shield the ally already has. strength={"damageMultiplier":2.2,"shield":35}

- **sprout** pilot=bloom; stats {"health":190,"defense":8,"damage":32,"crit":0.2,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Root of Hope: At each new player turn, heal living allies by 5% of their maximum health while Flora lives. [damageBonus 0, defenseBonus 0, healFraction 0.05]
  - skill1 Briar Shot: 150% damage to one enemy with +20 percentage points critical chance. Spends all Botanic Renewal charges for +10% outgoing damage per charge. strength={"damageMultiplier":1.5,"critBonus":0.2}
  - skill2 Verdant Renewal: Restore 30 health to every living ally; cannot revive. Increase living allies' outgoing attack damage by 10% this and next player turn (refresh; does not stack). strength={"healing":30,"attackBoostFraction":0.1}
  - ultimate Last Flare: Worldseed: 180% damage to all enemies and heal living allies by 55. Recover next turn. Spends all Botanic Renewal charges for +15% healing from this ability per charge. strength={"damageMultiplier":1.8,"healing":55}

- **rosetta** pilot=rose-grace; stats {"health":225,"defense":11,"damage":43,"crit":0.2,"shatterCapacity":100,"critMultiplier":1.6,"elementalDamage":0}
  - passive Virtuous Bloom: At each new player turn, heal living allies by 2% of maximum health while Rosetta lives. [damageBonus 0, defenseBonus 0, healFraction 0.02]
  - skill1 Golden Thorn Volley: 170% damage to one enemy; reduce surviving targets' attacks by 20% for two enemy phases. strength={"damageMultiplier":1.7,"weakenFraction":0.2}
  - skill2 Crimson Skyfall [all-enemies]: 120% damage to every living enemy; weaken by 15% for two enemy phases. strength={"damageMultiplier":1.2,"weakenFraction":0.15}
  - ultimate Last Flare: Rose Beyond the Sun [all-enemies]: 300% damage to every living enemy; weaken by 30% for two enemy phases. Recover next turn. strength={"damageMultiplier":3,"weakenFraction":0.3}

- **thornia** pilot=thorn-aegis; stats {"health":280,"defense":17,"damage":31,"crit":0.1,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Forbidden Garden: +9 defense, included in effective defense. [damageBonus 0, defenseBonus 9, healFraction 0]
  - skill1 Gilded Thorn Guard [all-allies]: Give every living ally 30 shield (lasts until broken; stacks). strength={"shield":30}
  - skill2 Shadow Rose Cleave: 180% damage to one enemy; weaken by 20% for two enemy phases. strength={"damageMultiplier":1.8,"weakenFraction":0.2}
  - ultimate Last Flare: Thousand-Rose Dominion [all-enemies]: 240% damage to all enemies and 40 shield for allies. Recover next turn. strength={"damageMultiplier":2.4,"shield":40}

- **crinso** pilot=rose-duality; stats {"health":205,"defense":9,"damage":41,"crit":0.25,"shatterCapacity":100,"critMultiplier":1.7,"elementalDamage":9}
  - passive Rose Duality: +15% outgoing damage at or below 50% health. [damageBonus 0.15, defenseBonus 0, healFraction 0]
  - skill1 Golden Edge: 180% damage to one enemy with +15 percentage points critical chance. strength={"damageMultiplier":1.8,"critBonus":0.15}
  - skill2 Crimson Rupture [all-enemies]: 120% damage to every living enemy; burn for 9 on two enemy phases. strength={"damageMultiplier":1.2,"burnMultiplier":1}
  - ultimate Last Flare: Blossoming Cataclysm [all-enemies]: 310% damage to every living enemy; burn for 14 on two enemy phases. Recover next turn. strength={"damageMultiplier":3.1,"burnMultiplier":1.5}

- **atmoso** pilot=tempest; stats {"health":205,"defense":9,"damage":39,"crit":0.2,"shatterCapacity":100,"critMultiplier":1.6,"elementalDamage":0}
  - passive Gale Cadence: +15% outgoing damage at or below 50% health. [damageBonus 0.15, defenseBonus 0, healFraction 0]
  - skill1 Razor Gale: 180% damage to one enemy. strength={"damageMultiplier":1.8}
  - skill2 Cyclone Weave [all-enemies]: 120% damage to every living enemy. strength={"damageMultiplier":1.2}
  - ultimate Last Flare: Sky Without End [all-enemies]: 290% damage to every living enemy. Recover next turn. strength={"damageMultiplier":2.9}

- **aurora** pilot=none; stats {"health":215,"defense":10,"damage":32,"crit":0.12,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Lens of Diminishment: +6 defense, included in effective defense. [damageBonus 0, defenseBonus 6, healFraction 0]
  - skill1 Gleamseal: 140% damage to one enemy; weaken by 30% for two enemy phases. strength={"damageMultiplier":1.4,"weakenFraction":0.3}
  - skill2 Eclipse Mandate [all-enemies]: 90% damage to every living enemy; weaken by 25% for two enemy phases. strength={"damageMultiplier":0.9,"weakenFraction":0.25}
  - ultimate Last Flare: Final Dawn Verdict [all-enemies]: 220% damage to every living enemy; weaken by 40% for two enemy phases. Recover next turn. strength={"damageMultiplier":2.2,"weakenFraction":0.4}

- **bliss** pilot=bloom; stats {"health":210,"defense":10,"damage":42,"crit":0.25,"shatterCapacity":100,"critMultiplier":1.7,"elementalDamage":0}
  - passive Stillfeather Tempo: +20% outgoing damage at or below 50% health. [damageBonus 0.2, defenseBonus 0, healFraction 0]
  - skill1 Warfeather Cut: 175% damage to one enemy with +15 percentage points critical chance. strength={"damageMultiplier":1.75,"critBonus":0.15}
  - skill2 Quietstorm Flourish [all-enemies]: 125% damage to every living enemy with +10 percentage points critical chance; restore 12 health to every living ally, no revival. strength={"damageMultiplier":1.25,"critBonus":0.1,"healing":12}
  - ultimate Last Flare: Thousandfeather Stillness [all-enemies]: 300% damage to every living enemy with +20 percentage points critical chance. Recover next turn. strength={"damageMultiplier":3,"critBonus":0.2}

- **bruno** pilot=none; stats {"health":285,"defense":18,"damage":29,"crit":0.08,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Faultbound Resolve: +9 defense, included in effective defense. [damageBonus 0, defenseBonus 9, healFraction 0]
  - skill1 Seismic Hammerfall: 155% damage to one enemy; weaken by 20% for two enemy phases. strength={"damageMultiplier":1.55,"weakenFraction":0.2}
  - skill2 Citadel Mantle [all-allies]: Give every living ally 32 shield (lasts until broken; stacks). strength={"shield":32}
  - ultimate Last Flare: Worldwall Ascendant [all-enemies]: 230% damage to every living enemy and 45 shield for allies. Recover next turn. strength={"damageMultiplier":2.3,"shield":45}

- **disciple** pilot=none; stats {"health":240,"defense":11,"damage":36,"crit":0.12,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Shared Mindflame: +15% outgoing damage at or below 50% health. [damageBonus 0.15, defenseBonus 0, healFraction 0]
  - skill1 Thoughtspark Benediction: 150% damage to one enemy; increase living allies' outgoing attack damage by 20% this and next player turn (refresh; does not stack). strength={"damageMultiplier":1.5,"attackBoostFraction":0.2}
  - skill2 Concord of Chaos [all-allies]: Increase living allies' outgoing attack damage by 30% this and next player turn and give 20 shield (lasts until broken; stacks). strength={"attackBoostFraction":0.3,"shield":20}
  - ultimate Last Flare: Unbound Mindcrown [all-allies]: Increase living allies' outgoing attack damage by 40% this and next player turn and give 40 shield (lasts until broken; stacks). Recover next turn. strength={"attackBoostFraction":0.4,"shield":40}

- **elise** pilot=tempest; stats {"health":195,"defense":8,"damage":40,"crit":0.25,"shatterCapacity":100,"critMultiplier":1.7,"elementalDamage":0}
  - passive Stormwheel Rhythm: +15% outgoing damage at or below 50% health. [damageBonus 0.15, defenseBonus 0, healFraction 0]
  - skill1 Voltstar Cut: 170% damage to one enemy with +20 percentage points critical chance. strength={"damageMultiplier":1.7,"critBonus":0.2}
  - skill2 Crosscurrent Volley [all-enemies]: 115% damage to every living enemy. strength={"damageMultiplier":1.15}
  - ultimate Last Flare: Infinite Thunderwheel [all-enemies]: 285% damage to every living enemy with +15 percentage points critical chance. Recover next turn. strength={"damageMultiplier":2.85,"critBonus":0.15}

- **razor** pilot=none; stats {"health":290,"defense":19,"damage":32,"crit":0.1,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Unbroken Night: +10 defense, included in effective defense. [damageBonus 0, defenseBonus 10, healFraction 0]
  - skill1 Nightcleave: 165% damage to one enemy; weaken by 25% for two enemy phases. strength={"damageMultiplier":1.65,"weakenFraction":0.25}
  - skill2 Eclipse Bastion [all-allies]: Give every living ally 35 shield (lasts until broken; stacks). strength={"shield":35}
  - ultimate Last Flare: Unbroken Midnight [all-enemies]: 240% damage to every living enemy and 50 shield for allies. Recover next turn. strength={"damageMultiplier":2.4,"shield":50}

- **nerithe** pilot=none; stats {"health":235,"defense":13,"damage":40,"crit":0.18,"shatterCapacity":100,"critMultiplier":1.6,"elementalDamage":0}
  - passive Uncharted Current: Normal Attack gains 5 additional Elemental Gauge, capped by Elemental Gauge capacity. [damageBonus 0, defenseBonus 0, healFraction 0, lightGaugeBonus 5]
  - skill1 Meridian Break: 170% damage to one enemy; weaken its next two enemy-phase attacks by 20%. strength={"damageMultiplier":1.7,"weakenFraction":0.2}
  - skill2 Fold the Sea [all-enemies]: 130% damage to all enemies; weaken surviving targets by 15% for two enemy phases. strength={"damageMultiplier":1.3,"weakenFraction":0.15}
  - ultimate Ocean Beyond the Map [all-enemies]: 300% damage to all enemies; weaken surviving targets by 30% for two enemy phases. Recover next turn. strength={"damageMultiplier":3,"weakenFraction":0.3}

- **orvella** pilot=none; stats {"health":300,"defense":20,"damage":32,"crit":0.1,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Load-Bearing Will: +10 defense, already included in effective defense. [damageBonus 0, defenseBonus 10, healFraction 0]
  - skill1 Keystone Reversal: 160% damage to one enemy; weaken its next two enemy-phase attacks by 25%. strength={"damageMultiplier":1.6,"weakenFraction":0.25}
  - skill2 Raise the Faultline [all-allies]: Give every living ally 40 shield; lasts until broken and stacks. strength={"shield":40}
  - ultimate Worldweight Citadel [all-enemies]: 260% damage to all enemies and 65 shield to living allies. Recover next turn. strength={"damageMultiplier":2.6,"shield":65}

- **vaelor** pilot=tempest; stats {"health":210,"defense":11,"damage":45,"crit":0.22,"shatterCapacity":100,"critMultiplier":1.65,"elementalDamage":8}
  - passive Standing Thunder: +25% outgoing damage at or below half health. [damageBonus 0.25, defenseBonus 0, healFraction 0]
  - skill1 Forked Cadence: 180% damage to one enemy with +20 percentage points critical chance. strength={"damageMultiplier":1.8,"critBonus":0.2}
  - skill2 Resonance Cascade [all-enemies]: 140% damage to all enemies. strength={"damageMultiplier":1.4}
  - ultimate Last Chord of the Sky [all-enemies]: 330% damage to all enemies. Recover next turn. strength={"damageMultiplier":3.3}

- **caldrex** pilot=none; stats {"health":300,"defense":20,"damage":32,"crit":0.1,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Banked Heat: Gain 1 Heat (max 3) when an enemy direct attack damages Caldrex’s Health or Shield, once per enemy phase. [damageBonus 0, defenseBonus 0, healFraction 0]
  - skill1 Close the Kiln [all-allies]: Shield every living squad member and taunt eligible random single-target attacks for the next enemy phase; area-of-effect and scripted attacks are unchanged. strength={"shield":1}
  - skill2 Cinder Discharge [all-enemies]: Spend all Heat to strike all enemies and Burn them. strength={"damageMultiplier":2.55}
  - ultimate Nothing Beyond These Gates [all-allies]: Spend all Heat for a squad shield, Defense and ally Burn pressure. Recover next turn. strength={"shield":1}

- **solenne** pilot=none; stats {"health":285,"defense":19,"damage":30,"crit":0.12,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Held Stillness: Hold up to 4 Stillness; each hit consumes 1 to reduce its damage by 20%. [damageBonus 0, defenseBonus 0, healFraction 0]
  - skill1 Answer the Bell: Strike one enemy, Weaken it and taunt eligible random single-target attacks for the next enemy phase; area-of-effect and scripted attacks are unchanged. strength={"damageMultiplier":2.4,"weakenFraction":0.25}
  - skill2 Circle of Repose [all-allies]: Gain 2 Stillness and shield the squad. strength={"shield":1}
  - ultimate The Last Reverberation [all-enemies]: Spend all Stillness to strike all enemies and shield the squad. Recover next turn. strength={"damageMultiplier":7.2,"shield":1}

- **myrthen** pilot=none; stats {"health":220,"defense":11,"damage":44,"crit":0.22,"shatterCapacity":100,"critMultiplier":1.65,"elementalDamage":0}
  - passive Turning Season: Skills advance Sprout, Bloom and Harvest; Harvest empowers the next Skill or Last Flare. [damageBonus 0, defenseBonus 0, healFraction 0]
  - skill1 Reaper’s Claim: Strike one enemy and mark it. strength={"damageMultiplier":2.72}
  - skill2 Turn the Bough [all-enemies]: Strike all enemies. strength={"damageMultiplier":1.92}
  - ultimate All That Ripens: Strike one enemy. Recover next turn. strength={"damageMultiplier":12.48}

- **neralis** pilot=none; stats {"health":240,"defense":12,"damage":32,"crit":0.12,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Returning Current: Gain Current from effective Normal damage or native healing, once per action. [damageBonus 0, defenseBonus 0, healFraction 0]
  - skill1 Light the Next Station [one-ally]: Heal one living ally for 35% maximum Health, scaled by Skill Power; grant +30% Defense for 2 turns. strength={}
  - skill2 Carry Them Back [all-allies]: Spend all Current to heal each living ally for 18% maximum Health plus 6% per Current, scaled by Skill Power. strength={}
  - ultimate No Crossing Left Empty [all-enemies]: Spend all Current; deal 720% Direct Attack to all enemies and heal living allies for 30% maximum Health plus 5% per Current, scaled by Skill Power. strength={"damageMultiplier":7.2}

- **varkhel** pilot=none; stats {"health":305,"defense":21,"damage":33,"crit":0.1,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Tension Held: Gain Tension when an enemy direct attack effectively damages Health or Shield once per enemy phase, or when a Normal Attack deals damage. [damageBonus 0, defenseBonus 0, healFraction 0]
  - skill1 Set the Warning Chain [all-allies]: Gain a Shield equal to 25% maximum Health, scaled by Skill Power; +40% Defense for 2 turns and Taunt for the next enemy phase. strength={}
  - skill2 Return the Strain: Spend all Tension; deal 285% Direct Attack plus 45% per Tension to one enemy, ignoring 20% Defense. strength={"damageMultiplier":2.85}
  - ultimate The Bridge Holds Behind Me [all-enemies]: Spend all Tension; deal 690% Direct Attack plus 55% per Tension to all enemies and shield living allies for 30% maximum Health, scaled by Skill Power. strength={"damageMultiplier":6.9}

- **seravelle** pilot=none; stats {"health":235,"defense":13,"damage":34,"crit":0.14,"shatterCapacity":100,"critMultiplier":1.5,"elementalDamage":0}
  - passive Convoy Cadence: The first effective manual Normal Attack each round grants Cadence while Seravelle lives. [damageBonus 0, defenseBonus 0, healFraction 0]
  - skill1 Send the Ember Ahead: Deal 245% Direct Attack to one enemy and apply Burn for 2 enemy phases, dealing 12% of Attack per phase, scaled by Skill Power. strength={"damageMultiplier":2.45}
  - skill2 Move as One [all-allies]: Spend all Cadence; grant living allies +30% Direct Attack plus 10% per Cadence for 2 turns. This fixed bonus is not scaled by Skill Power. strength={}
  - ultimate The Road Belongs to Everyone [all-enemies]: Deal 620% Direct Attack to all enemies; grant each other living ally 20% maximum Gauge and +30 percentage points Skill Power for 2 turns. strength={"damageMultiplier":6.2}

- **velmira** pilot=none; stats {"health":218,"defense":11,"damage":45,"crit":0.23,"shatterCapacity":100,"critMultiplier":1.65,"elementalDamage":0}
  - passive Alternating Edge: Gain Crosscut when an ordinary Skill differs from the previous ordinary Skill; the first Skill establishes the sequence. [damageBonus 0, defenseBonus 0, healFraction 0]
  - skill1 Open the Seam: Deal 280% Direct Attack to one enemy and apply Weaken for 2 enemy phases, reducing its direct damage by 25%. strength={"damageMultiplier":2.8,"weakenFraction":0.25}
  - skill2 Turn the Other Edge [all-enemies]: Deal 205% Direct Attack to all enemies; ignore 20% Defense while holding at least 2 Crosscut. strength={"damageMultiplier":2.05}
  - ultimate Leave the Doorway Standing: Spend all Crosscut; deal 1,050% Direct Attack plus 90% per Crosscut to one enemy, ignoring 30% Defense. strength={"damageMultiplier":10.5}
