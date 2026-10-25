# Character Master Conduits (D-201)

**Current D-383 mechanics:** all48
[approved Master transformations](character-conduit-compatibility.md)
have refreshed personal/squad stat packages and exact native mechanics in
the [authoritative catalog](conduit-catalog.txt). Their complete rows replace every old effect,
reserve bank and uniform recurring-trigger claim below. Three fixed alternatives
per character now have individual limits, including approved rescues, action
changes, shields, control and native-resource transformations. Only explicitly
approved native passive replacements can earn their documented native resources;
generated assists/strikes/heals never feed native loops.
Acquisition, matching slots, artwork and non-upgradeability are unchanged.
Rules7 publication and validation status are in the [handoff](handoff.md).

## Acquisition and choice

There are **48 Omnic Masters: three for each of the 16 Element-Bearers**.
They are separate from the90 ordinary-slot Conduits and never enter ordinary
machine tier rolls, banners, the Store or Conduit upgrades.

The final Awaken the Machines boss, **stage35 / Lv.120**, independently has
a **5% chance** (D-400) to drop one **Cosmic Grand Master Chest**. Repeat final clears
are eligible. This remains the only ordinary direct enemy drop. Under D-315,
opening any [Calamity EX+Omnipotent chest](calamity-mode.md) additionally grants
exactly two Cosmic Grand Master Chests, including when all48 Masters are owned.
Calamity bosses themselves drop only their activity/tier chest. Separate RNG
streams preserve combat and all existing reward streams.

Open a chest from Inventory, choose an unowned Master, then confirm. The owner
approves choices for any named Element-Bearer, including one not yet owned.
This unlocks the Master, not the character, and never auto-equips it. Already
owned choices are disabled and rejected by transactions. If all 48 are owned,
extra chests remain unopened; there is no duplicate conversion.

## Equipment

Each owned Element-Bearer has **one matching Master slot**, separate from the
eight ordinary slots and their four-Omnic cap. Captured creatures cannot equip
Masters. Unlocks are permanent; swapping/removing equipment consumes nothing.
Masters have fixed kit effects and listed personal/squad stats, never upgrade-scaled, and cannot
be upgraded, sold or purchased.

Team equipment exposes the actual slot and exact effect. Inventory lists
owned Masters; Collections lists all 48 with ownership. Character and Battle
references show the equipped effect. The final creature's loot reference
publishes the actual chest chance.

## Current kit mechanics (D-383)

The [typed catalogue](../src/content/master-conduits.ts) retains all48 stable
IDs, assignments, art and exact descriptions from the approved roster.
[The shared runtime](../src/game/conduit-runtime.ts) implements the individual
rows; there is no old `.rule`/Astral Reserve resolver or generic recurring limit.
Native and generated provenance, ordinary-before-Master resolution, shield
layers, action caps, rescue precedence and snapshot restarts follow the
[shared resolution contract](combat.md#omnic-and-master-refresh-d-383).
Executable paired coverage for every Master lives in
[phase-zero-master-matrix.test.ts](../src/game/phase-zero-master-matrix.test.ts)
and [omnic-refresh.test.ts](../src/game/omnic-refresh.test.ts).

## Historical kit mechanics (before D-313; not current effects)

[The typed catalogue](../src/content/master-conduits.ts) owns all 48 names,
character assignments, exact numeric effects, triggers and art designs.
Effects include personal Burn/Weaken extension, Fracture Marks, healing,
shields, Gauge returns, cooldown reduction, refresh-only Attack buffs, one-hit
direct-damage protection, team-wide outcomes and fixed Conduit strikes.

**D-264: always-active bearer enhancements.** An equipped Master remains enabled
throughout its bearer's living battle participation; it does not activate once
per round or need manual reactivation. Every qualifying native outcome can apply
its enhancement, including multiple targets/hits in one round. This is not a
mandatory squad-wide aura: existing explicitly team-targeted payoffs stay team
targeted. Temporary payoff durations, next-hit protection and spend conditions
remain explicit; always-active means the enhancement rule never switches off,
not that a timed Attack payoff becomes a permanent stacked stat.

All48 effects have been compared with authored passives and native resource
loops. No Master repeats a native charge award, passive healing or Nerithe's
Normal-only Gauge award. Instead they add complementary mechanics. Ordinary
Conduits and intrinsic character round/phase limits are unchanged.

D-226 makes every Master distinct (unique effect text and rule; each
character's three Masters use three different trigger/bank pairs) and tied
to that character's kit:

| Character | 1 | 2 (Astral Reserve) | 3 |
|---|---|---|---|
| Infernis | Every own Burn tick echoes50% and heals20% (max10% HP); no self-extension | Burn banks; Flame Arc shields4% HP and strikes all enemies15% Attack per reserve | Spending Embers returns Gauge per charge and a cooldown |
| Tizu | Blocked hits cut a cooldown and refresh15% team protection | Blocked hits bank; Tidal Shelter heals the team | Weaken lasts longer and places Fracture Marks |
| Flora | Each native heal also shields the most injured other ally | Healing banks; Briar Shot strikes20% Attack and returns5 Gauge per reserve | Last Flare gives team protection and cuts both cooldowns |
| Atmoso | Critical hits add a gust strike | Crits bank; Cyclone Weave refreshes10% protection and returns8 Gauge per reserve | Razor Gale on an enemy at or below half HP adds a strike and Gauge |
| Elise | Crits cut both cooldowns and shield20% damage (max10% HP) | Crits bank; Last Flare cuts cooldowns and returns Gauge | Defeating an enemy returns Gauge and Attack |
| Vaelor | Direct hits below half HP heal Vaelor and return Gauge | Crits bank; Last Flare strikes every enemy | Defending primes Attack and Gauge |
| Crinso | Crits refresh15% HP shield and40% Attack | Burn banks; Last Flare heals8% HP and refreshes10% protection per reserve | Hitting own Burn heals and extends Burn |
| Rosetta | Weaken returns Gauge and shields an ally | Healing banks; Golden Thorn Volley cuts a cooldown and shields the team3% HP per reserve | Hitting own Weaken grants Attack and Fracture |
| Thornia | Blocked hits strike back at the attacker and return10 Gauge | Blocked hits bank; Shadow Rose Cleave shields the team | Weaken lasts longer and heals Thornia |
| Bruno | Defending shields the whole team | Shield growth banks; Last Flare strikes every enemy | Weaken triggers an aftershock strike and a cooldown |
| Razor | Defending heals and primes protection | Defending banks; Last Flare strikes and primes protection | Weaken places Fracture and a shield |
| Aurora | Weaken lasts longer and gives the team Gauge | Weaken banks; Last Flare gives the team Attack | Hitting own Weaken heals/protects an ally |
| Bliss | Crits shield the most injured other ally | Healing others banks; Warfeather Cut cuts a cooldown and strikes | Last Flare shields and empowers an ally |
| Disciple | Support returns Gauge and protection to an ally | Supporting others banks; Last Flare gives the team Gauge | Thoughtspark hits cut a cooldown and feed an ally Gauge |
| Nerithe | Normal Attack refreshes10% HP shield and30% Attack (no copied passive Gauge) | Weaken banks; Normal Attack strikes per reserve | Weaken places Fracture and protection |
| Orvella | Shield growth primes protection and Gauge | Blocked hits bank; Keystone Reversal extends Weaken and cuts cooldowns | Hitting own Weaken shields/empowers an ally |

Conduit strikes are fixed damage: `Attack x amount x Attack/(Attack+Defense)`
plus an optional share of the triggering damage, optionally capped by Attack.
They never crit, roll RNG or retrigger Conduits, are absorbed by enemy shields
first, and never occur on Defense. Defeats from strikes use the normal
per-kill reward path (act/endTurn HP diff). Masters do not grant native kit
charges; those remain owned by authored abilities/passives. Weaken extension requires the
bearer's own existing Weaken and caps at three phases. Reserve scaling also
applies to boost (max 65%), protection (max 60%) and cooldown amounts.

Sixteen banked designs introduce **Astral Reserve**, with different authored
earn/spend actions and payoffs. It caps at three and earns on every qualifying
native outcome, including repeated outcomes in the same round. The declared skill/Last Flare spends the bank only if its payoff has
an actual effect. The field shows the real 0-3 counter; full reference gives
the exact trigger and per-reserve payoff. An action may earn and spend in the
same activation where its own effective outcome qualifies.

Shared safeguards:
- Only actual authored/native outcomes trigger effects. Generated Conduit
  healing/shields/buffs do not recursively generate new triggers or reserves.
- Healing cannot revive; healing/Gauge cap at the recipient's actual maximum.
- Shields refresh to a larger amount, never add; generated shields do not count
  as the character's authored shield source.
- Attack buffs refresh the stronger existing value through next round, never
  stack. A direct-hit trigger's buff benefits later hits/actions, not the hit
  that triggered it.
- Burn extension requires the bearer's existing personal Burn and caps at three
  phases. Burn ticks never extend themselves; Helios now heals instead, so Burn
  still expires without another native application/direct-hit extension.
  Fracture requires their existing Weaken, caps at two personal marks,
  and uses the existing Fracture damage rules.
- Protection refreshes one bounded charge against the next direct enemy hit.
  Cooldowns never become ready before next round; recovery/costs are unchanged.
- Multi-effect ally selection is frozen before outcomes, so a heal/Gauge return
  cannot redirect the accompanying buff/shield to a different ally.

Settings preserves reserve/interaction memory. Legacy Master `usedRound` and
`bankRound` stamps are ignored without rewriting loaded saves. New encounters reset memory;
Continue, Training and Retry retain frozen equipment, not later menu changes.
No new combat RNG, automatic revival, skill grants or affinity multipliers.

## Saves and online authority

Wallet v5 adds optional `masterChests`, `masterConduits` (0/1 unlocks) and
`masterEquipment`. Missing legacy fields remain absent on read: no grants,
load writes or version migration. Save-file validation/export/import retains
the fields. Counts are safe integers; matching owned-character equipment is
validated at account and fighter boundaries.

Chest reward, ordinary kill rewards and receipt commit together in one
validated save. Invalid final-boss provenance, overflow or denied writes leave
the raw wallet unchanged. Opening rereads the wallet and consumes one chest/
unlocks one Master in one save before presentation. Cancel spends nothing.
Offline and authoritative server operations reuse the same helpers; online
durable runs retain their Master snapshot through Retry.

D-264 server source and generated bundle are deployed to the existing hosted
`game-operation` function with owner approval. Hosted deterministic combat
checks confirm three native AoE critical Master payoffs in one round despite
legacy activation stamps, with no recursive strikes, one acknowledged
revision, idempotent retry and frozen checkpoint persistence. Disposable
identities/records are removed after checks. Frontend publication remains
separate; updated descriptions/reference labels are local until published.

## Artwork

[Master Conduits.md](../Art/conduits/Master%20Conduits.md) is the requested
combined **50-prompt** file: all 48 Masters, the chest and Astral Reserve emblem.
Cosmic/planetary machinery is densely layered and character-palette-locked,
with complete outer safety margins and the existing compact anime/cel renderer.
Mechanical flames use opaque painted shapes, not cutout glow. Non-portrait
prompts have no references.

D-226 installs the owner-delivered images: 48 Masters, the chest and the Astral
Reserve emblem. `tools\intake_master_conduit_art.py` with reviewed per-source
settings in `Art\provenance\master-conduit-art-settings.json` archives the
original bytes in `Art\source\master-conduits` (hashes in
`Art\provenance\master-conduit-art-intake.json`) and writes transparent
`public\assets\master-conduits\<id>.png`. An unnamed extra delivery is archived
under `alternates` and not wired. `tools\master_conduit_art_revisions.py --write`
regenerates `src\content\master-conduit-art-revisions.ts`; `assetUrl` versions
every Master URL. Equipment, Inventory, Archives, the chest choice dialog, reward
reveal and the field Astral Reserve counter show the art. No runtime background
removal.

Reproduce and validate:

```powershell
python tools\build_master_conduit_art.py
python -m unittest discover -s tools -p test_master_conduit_art.py
npm test -- src\game\master-conduits.test.ts src\ui\master-choice-dialog.test.tsx --maxWorkers=2
npm test -- --maxWorkers=2
node tools\bundle_server_game.mjs
npx tsc --project supabase\functions\game-operation\tsconfig.json --pretty false
npm run build
node tools\smoke_server_game.mjs --masters
node tools\smoke_server_game.mjs
```

Tests cover the exact 5% boundary/no off-stage entropy, all 48 rules, separate
ordinary pools, real activation, one-write reward/opening failure paths,
future-character choices, save files, equipment snapshots and server Retry.
D-264 also covers all48 rules repeating within one round with legacy stamps,
all16 banks accruing repeatedly up to three, ordinary round gates, native AoE
criticals without recursion and finite Burn. The `--masters` hosted check
creates one disposable identity and seeds deterministic combat only for that
identity; it requires the existing authorized Supabase CLI access.
