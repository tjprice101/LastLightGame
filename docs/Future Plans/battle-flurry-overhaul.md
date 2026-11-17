# Battle Flurry overhaul: specification and phased plan (2026-11-16)

**Phase 1 implemented (D-471, 2026-11-16):** device-run encounters with
`settle` replay, End Turn, per-encounter Haul and squad cap 3 are live in code;
see [combat spec](../combat.md#device-run-encounters-settle-replay-and-squad-cap-3-d-471-battle-flurry-phase-1).
Owner chose to keep current enemy tuning until Phase 3.

**Phase 2 implemented (D-472, 2026-11-16):** overlapping presentations,
canvas hit-sparks, damage numbers with Weakness flair, Prismatica motes into
the Haul, material pour after the save, electrified gauges, Flare cut-in and a
HUD speed control. Presentation only, no deploy; see
[combat spec](../combat.md#flurry-presentation-d-472-battle-flurry-phase-2).
Owner choices: Health motes move to Phase 3 (engine rule, needs a deploy), and
materials pour after the save rather than being predicted on the device.
Phases 3-4 remain planned below.

**Phase 3 in progress (2026-11-16):** Step 1 (docs only) drafts every kit in
batches, plus a number sheet, in
[phase3-kit-drafts.md](battle-flurry-reference/phase3-kit-drafts.md). Owner
choices: one release after all batches are approved; Defend removed; Health
motes drop once per enemy defeat. The owner approved the number sheet, O1-O5 and
all four batches plus restored role traits (D-473, 2026-11-16). Step 2a, the
engine framework, is implemented on branch `battle-flurry-phase3` (D-474,
2026-11-17; not released). Next: Step 2b signature mechanics in four batches,
then Step 3 (UI), Step 4 (retune) and one release.

**Status:** owner-approved direction (D-470, seven decisions below). Exact
numbers, kit batches, the Conduit remap and later depth systems still need
per-phase approval. No code has changed. Filing this plan does not authorize implementation, deploys
or balance changes beyond each approved phase.

## Why (owner feedback, 2026-11-16)

The battle loop feels clunky: it stutters, often breaks, attacks take too long,
Conduits do not visibly help, and nothing exciting happens beyond clicking
portraits. The owner prefers the old Skill 1 / Skill 2 system. The target feel
is the genre's best "flurry" turn: rapidly tap every portrait, all attacks fire
at once in a stream of damage numbers and effects, currencies and Gauge orbs
pour from struck and defeated enemies, then the enemy phase plays once the
dust settles. Gauges should look electrified; the HUD full and lively.
Brave Frontier is a feel reference only; no content, names or art are copied.

## Diagnosis (code-verified 2026-11-16)

1. **Every tap is a server round trip.** Online, each action calls the
   `game-operation` Edge Function (`src/online/battle-transport.ts`,
   30 s timeout) and the animation starts only after the saved response is
   validated (`src/online/battle-session.ts` `send`). Latency, cold starts,
   timeouts and stale-revision errors explain the stutter and "breaks half the
   time". Rapid tapping is impossible under this model.
2. **Slow choreography.** One attack spans about 2.6 s (D-469 capture
   evidence); members act strictly one after another.
3. **Spectacle not wired.** The canvas VFX systems (`src/vfx/signature-vfx.ts`,
   `master-vfx-engine.ts`) are used only by the legacy `battle-view.ts`; the
   Radiant screen mostly animates portraits with DOM transforms.
4. **Conduits are invisible.** Effects run in the engine but nothing on screen
   attributes damage, Shields, healing or Gauge to a Conduit.
5. **Shallow turns.** Radiant removed Skill 1 / Skill 2. The old Conduit
   catalog was most interesting precisely where it interacted with them
   (button-specific Skill Power, trait-gated Skill Power, sequencing tokens,
   Last Flare economy); see the reference catalog section 3.

Reference catalogs of the last pre-Radiant state (commit `d82015ba`,
2026-11-07), machine-extracted and spot-checked:
[old kits](battle-flurry-reference/pre-radiant-kits-d82015ba.md) (38 bearers,
system rules) and [old Conduits](battle-flurry-reference/pre-radiant-conduits-d82015ba.md)
(99 ordinary + 114 Masters, effect categories, redundancy audit). Verified
facts: the old game capped squads at 3 (`account.ts` validation) and each
living member took one action per player turn in any order; native identities
overrode base fighter kits; no Leader effects existed then.

## Approved decisions (D-470)

1. **Flashy drops with a Haul.** Prismatica, materials and Gauge orbs burst
   from enemies on every qualifying hit and defeat. Gauge orbs are combat state
   and charge bearers immediately. Prismatica and materials fill a visible
   **Haul** counter during the encounter; they are saved atomically with a
   receipt when the encounter ends, and only then play the full reward
   celebration. Quitting mid-encounter forfeits only that encounter's unsaved
   Haul; earlier encounters' saved rewards are never removed. This amends the
   per-action reward-save behavior of the current Radiant authority; the rule
   "save before celebration" still holds for the real reward celebration.
2. **Squads are capped at 3 everywhere** (squad, saved loadouts, Team UI,
   validation, authority). Loading never writes: stored squads/loadouts with
   4-6 members are read-only-normalized to their first 3 for display and play,
   and are physically trimmed only when the player next saves them.
3. **Skill 1 / Skill 2 return for every bearer**, rewritten simply in one
   consistent genre-style phrasing with Last Light terminology (section
   "Skill language"). Claude drafts in batches; the owner approves each batch.
   Old kits may be reworked too. The phrasing and sample batch below are
   approved as the style standard, provided every kit stays clear and
   consistent.
4. **Device-run encounters with end-of-encounter authority replay**
   (section A), including the seed-visibility trade-off.
5. **Flare next-turn recovery is removed**; Luminosity cost alone gates Flares.
6. **Health motes** are added as a fourth drop (heal the collecting bearer;
   combat state, not a reward).

## Proposed design (needs per-phase approval)

### A. Device-run encounters with authority replay (Phase 1)

- At `start`/`continue` the authority freezes the run and issues the encounter
  seed (existing behavior). The client resolves every action **locally and
  instantly** with the same pure resolver the authority uses
  (`resolveRadiantRun`; `src/online/battle-local.ts` already does this
  offline).
- At encounter end (victory, defeat, or Continue) the client submits one
  `settle` operation: run ID, expected revision, encounter, ordered action log.
  The authority replays the log on the frozen state with the same seed and RNG
  streams, rejects any mismatch or illegal action, then saves outcome, Haul
  rewards, progress and receipt in one atomic write. The client celebrates
  only after that acknowledgement. Retries reuse the request ID.
- A local in-progress action log (combat state only, no rewards) lets a page
  refresh resume the encounter; it never grants anything by itself.
- Security note: the client can know the seed, so it could preview rolls.
  Accepted by the owner (D-470); replay still blocks fabricated results.
- Combat-rules/run-schema version bump with the existing read-only retirement
  of older runs; client and authority ship together.

### B. Flurry turn structure (Phase 1 rules, Phase 2 presentation)

- Player phase: each living bearer has one action. A tap resolves that action
  immediately in logic and starts its animation without waiting for others;
  animations overlap. Resolution order is tap order (deterministic for replay).
- Enemy phase starts when every living bearer has acted (or End Turn) and
  the player-phase effects have settled.
- Inputs: tap = Normal Attack on the current target; hold = Skill 1 / Skill 2 /
  Flare grid (reuses the D-307 hold/drag pattern); swipe up = Flare when
  affordable. Keyboard equivalents kept. Ally-targeted skills auto-target
  (all allies or lowest Health) so tapping never stops for a target picker.
- Speed setting 1x / 2x / 3x plus Skip; Reduce motion keeps static feedback.
- Target: a full three-bearer flurry plus drop pour reads in under ~3 s at 1x.

### C. Spectacle (Phase 2)

- Wire the existing canvas VFX to Radiant: per-element projectiles and
  impacts, hit-sparks, light screen shake on heavy hits, Flare cut-ins
  (`battle-cutin.ts`).
- Stacking damage-number stream with critical and weakness flair.
- Drop pour: Gauge orbs fly to bearers with an electrified gauge surge;
  Prismatica and material motes arc into the Haul counter. Reuse
  `luster.ts`, `reward-screen.ts` and rarity-feedback foundations; effects
  finite, pointer-transparent and disposable.
- Lively HUD: crackling gauge fills, ready-state pulses for Skill/Flare,
  attunement accents.
- Health motes (approved): heal the collecting bearer. **Moved to Phase 3**
  (owner, D-472): they change combat state, so they ship with the Phase 3
  rules change and its deploy.

### D. Skill 1 / Skill 2 merged with Radiant (Phase 3)

- Kit per bearer: Normal Attack, **Skill 1**, **Skill 2**, **Flare**
  (Convergent Light), one-line Passive, Leader Skill (existing D-456 authored
  Leader effects, rewritten in the same phrasing).
- One gauge: personal **Luminosity**. Draft costs from the old system:
  Skill 1 = 25, Skill 2 = 40; Flare keeps its Convergent Light tier costs
  (100 Sparkling; 200 Glimmering/Ultimate). Normal hits, incoming hits and
  Gauge orbs fill it. Exact gains retuned in Phase 3.
- Restore the Skill-stat family as previously defined: Skill Power (skills
  only, not Normal Attack or Conduit-generated effects), Skill Duration (whole
  turns on timed effects), Skill Efficiency (cost discount, cap 50%, Flare
  floor 70%) and Gauge Gain. Role perks, Resonance, Convergent Light ranks
  and attunement subtypes stay.
- Flare next-turn recovery is removed (approved); cost gates Flares.
- **Buff categories.** Timed effects use a fixed category list: Attack Up,
  Defense Up, Critical Up, Damage Reduction, Luminosity Gain Up, Drop Up,
  Element Infusion, Health Over Time, plus enemy Weaken and Burn. Same category
  does not stack (strongest applies, refreshes duration); different
  categories combine. This keeps skills comparable and makes squad coverage a
  real choice. Shields keep D-434 (last until broken, skill Shields stack).
- At most **one signature mechanic per bearer** (for example Infernis Burn
  detonation, Flora Seeds), replacing the old 40-resource native identities.
- Enemy formations and calibration retuned for 3-bearer squads using
  `roster-capability-audit.md` and `enemy-benchmark-calibration.md`.

### E. Conduits that visibly help (Phase 4)

- Trigger callouts on the field ("Vigil Core: Shield +300") and a post-battle
  contribution summary (damage, healing, Shields, Luminosity per Conduit).
- Re-anchor Conduit effects on skills, following the old catalog's strongest
  categories: button-specific Skill Power (Skill 1 / Skill 2 / Flare),
  trait-gated Skill Power (damage/heal/Shield/debuff skills), buff-category
  granters and extenders, Luminosity economy, sequencing tokens between
  allies. Cut interchangeable stat sticks and near-duplicate heal-on-X items.
  Stable IDs, ownership, ranks and art preserved.
- Later depth (separate approval): Prismatic Convergence (bonus when
  different-element allies hit one enemy in a turn), telegraphed boss intents,
  Health-threshold phases, a small set of original afflictions with ward
  Conduits.

## Skill language

One fixed phrase order: **[hits] [element] attack on [target] ([power]%),**
then effects in this order: enemy debuffs, ally buffs, healing/Shields,
Luminosity. Each effect is a short clause with exact value and duration.

| Effect | Phrase |
|---|---|
| Damage | `6-hit Infernic attack on all enemies (180%)` |
| Burn | `adds Burn (25% Attack per turn, 3 turns)` |
| Weaken | `Weakens target (-25% Attack, 2 turns)` |
| Buff | `boosts Attack of all allies (+40%, 3 turns)` |
| Damage Reduction | `reduces damage taken by all allies (-25%, 2 turns)` |
| Heal | `heals all allies (30% of max Health)` |
| Shield | `grants all allies a Shield (25% of max Health)` |
| Luminosity | `fills Luminosity of all allies (+15)` |
| Gain rate | `boosts Luminosity gained by all allies (+30%, 3 turns)` |

Rules: "turns" means player turns unless stated; percentages of Attack/max
Health always name their base; no adjectives or lore in effect text; shared
rules (Burn, Weaken, Shield, categories) live once in the glossary; ally
skills auto-target; one signature mechanic per bearer at most.

### Approved style sample (draft numbers, Phase 3 tuning)

**Infernis** (Infernic Attacker). Signature: Burn detonation.
- Passive, Unbroken Ember: boosts Burn damage of all allies (+30%).
- Skill 1, Cinder Cleave (25): 4-hit Infernic attack on one enemy (260%),
  adds Burn (25% Attack per turn, 3 turns).
- Skill 2, Flame Arc (40): 6-hit Infernic attack on all enemies (180%),
  detonates Infernis's Burn on each target (deals up to 2 remaining turns at
  once).
- Flare, Dawnfire: 12-hit Infernic attack on all enemies (900%), adds Burn
  (100% Attack per turn, 3 turns), boosts Attack of all allies (+50%, 3 turns).

**Tizu** (Oceanic Tank). Signature: full-block refunds.
- Passive, Stillwater Guard: when a Shield from Tizu fully blocks a hit, that
  ally gains 8 Luminosity.
- Skill 1, Undertow Thrust (25): 4-hit Oceanic attack on one enemy (240%),
  Weakens target (-25% Attack, 2 turns).
- Skill 2, Tidal Shelter (40): grants all allies a Shield (25% of max Health),
  boosts Defense of all allies (+30%, 2 turns).
- Flare, Ocean Memory: grants all allies a Shield (50% of max Health),
  reduces damage taken by all allies (-30%, 2 turns).

**Flora** (Botanic Healer & Support). Signature: Seeds.
- Passive, Root of Hope: a Seed heals its holder (30% of max Health) at the
  start of the next player turn while Flora lives. One Seed per ally.
- Skill 1, Briar Shot (25): 4-hit Botanic attack on one enemy (220%), plants a
  Seed on the ally with the lowest Health.
- Skill 2, Verdant Renewal (40): heals all allies (25% of max Health), plants a
  Seed on all allies.
- Flare, Worldseed: heals all allies (60% of max Health), plants an Empowered
  Seed on all allies (heals 60%), boosts Luminosity gained by all allies
  (+30%, 3 turns).

## Phases and gates

| Phase | Scope | Model | Owner gate |
|---|---|---|---|
| 1 | Device-run encounters + `settle` replay; squad cap 3; tap-order player phase; Haul saved per encounter | Opus, Plan mode | Approve plan; approve authority deploy; play-test hosted build |
| 2 | Flurry presentation, VFX wiring, drop pour, electrified gauges, speed setting | Opus (Sonnet for polish rounds) | Feel review in game |
| 3 | Skill 1/2 + Skill-stat family + buff categories; all kits in batches; 3-bearer enemy retune | Opus | Approve each kit batch; approve deploy |
| 4 | Conduit callouts and contribution summary; Conduit re-anchoring; later depth systems | Sonnet / Opus | Approve Conduit remap; separate approval for depth systems |

Each phase updates its live system docs, validation guidance, decision log
and the handoff, and follows the Publication standing rule.

## Open owner questions

None for Phase 1 beyond approving its implementation plan. Later: each kit
batch, Phase 3 numbers, the Conduit remap and any depth system.
