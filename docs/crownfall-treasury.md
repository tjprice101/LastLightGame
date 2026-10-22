# Crownfall Treasury / Phase9

## Approved and implemented

Luminous Prismatica currency farm with25 stages, starting hostile level65 and
ending120. Every fifth floor is one boss; other floors have two ordinary slimes.
Six fixed forms become progressively regal gemstone-crowned masterpieces.
Enemies use shared ordinary/boss growth and retained periodic kits;
Sovereign Facet is the authored strike. Bosses retain a Last Ruin ultimate.

| Form | Rarity / Stars | Stages | Sale Prismatica |
| --- | --- | --- | --- |
| Gleamstone Slime | Common /1 |1-5 |1,000 |
| Diadem of Daybreak | Uncommon /2 |6-9 |3,000 |
| Scepter of Radiance | Rare /3 |10-13 |10,000 |
| Regalia of the Sun | Epic /4 |14-17 |30,000 |
| Sovereign of the Gilded Vault | Legendary /5 |18-21 |100,000 |
| The Crown Beyond Dawn | Omnic /6 |22-25 |300,000 |

Every form name ends with Gleamstone Slime except the base. No actual evolution
mechanic: copies cannot change form. Hostile level is
`round(65 + (stage-1)*55/24)`. Tier is `floor((stage-1)*6/25)`.
Stats use D-289's shared level/rank enemy curve; Lv120 has9,000 ordinary/
35,000 bossHP. Captures use separate linear playable stats times fixed
`.65+.35*tier/5`; they never inherit hostile or boss growth.
[Current balance](combat.md#progressive-build-reliance-d-288).
Mode stage count is explicit, not the35-floor elemental/Heaven/Abyss constant.

## Mission loot

Each newly defeated enemy awards one uniform integer in the Prismatica range:
`minimum=round(storyMinimum(level)*(1+19*((level-65)/55)^2))`, maximum=`minimum*2`,
where `storyMinimum=5+2*(level-1)` is the D-225 linear Story line. Treasury
equals Story at the same level on entry (133-266 at65), then the multiplier
accelerates to20x: base4,860-9,720 at120. D-294 multiplies the stage25
final boss's sampled quantity by5:24,300-48,600 on every clear/replay.
Earlier boss/ordinary rates remain equal. Capture chance/count is unchanged.
No second ordinary currency roll, Null-Prismatica, materials or clear bonus.
Reward RNG and50% capture RNG remain separate (D-377). Burn/AOE share the normal
newly-dead path. Dead units cannot roll again.

Real captures retain defeated level/stage/skills, independent UUIDs, unlocked
state, and existing leveling/Conduits/mixed squads/Settings/replay behavior.
Currency, capture, discovery, receipt and unlock save atomically before combat
advances. Failed writes reject visibly; receipts deduplicate retry.
Continue resets health/cooldowns, preserves Gauge/run roster/gear; Stage25 is
complete and cannot advance to26. Unlocks cap25.

## Exact-copy sale

Only Treasury creatures are eligible. Character's copy management offers
the fixed-form price above, regardless of level/source. This includes a Lv50
Omnic duplicate reward. Locked, current-squad or any-Conduit-equipped copies
cannot be sold. No batch sale or selling EBs/other captured species.
Confirmation names the exact UUID/copy, price and permanent loss.
The transaction rereads ownership/protection and commits currency plus removal
in one write. It removes an obsolete empty equipment map only for that copy.
Other copies/progress/discoveries/receipts/pity remain unchanged. Selling the
last owned form remasks its Character Archive entry; Creature discovery stays.
Stale IDs, changed protection, overflow and write failures never consume a copy.

## Standard Banner activation

The first three Treasury forms join the matching1/2/3-star tiers, making12 real
outcomes. Each creature tier now has3 equally likely entries; tier weights remain
50:30:17 within99%,5-star EBs share1% total. No4/6-star EB placeholders.
Existing200/500 independent pity is wired into actual atomic draws.

Ordinary banner creatures start at the first authored stage of their form.
Owned EB outcomes instead grant the final Omnic Treasury slime at **Lv50 flat**,
with its Stage22 kit and ordinary stats at50. Only this final form accepts
`acquisition: "banner-duplicate"` provenance. Mission captures still retain
defeated level; ordinary banner reward levels are not reduced to50.
The owner's final Lv50 rule supersedes the suggested highest-account-level rule.
Cost, copy/new EB and pity save in one write. No auto-equip.
See [complete banner rules](summoning-and-economy.md).

## Code and art handoff

- [Mode definitions](../src/content/activities.ts), [encounters/sale prices](../src/content/infusions.ts).
- [Currency formula](../src/content/loot-random.ts), [battle rewards](../src/game/battle.ts).
- [Copy validation/growth](../src/game/character-instances.ts), [transactions](../src/game/account.ts).
- [Gameplay](../src/presentation/gameplay.ts), [copy/summon UI](../src/presentation/roster.ts).
- [Regression tests](../src/game/treasury.test.ts).
- [Six cutouts + mode banner + arena prompts](../Art/creatures/Crownfall%20Treasury.md).

The six supplied portraits,3:1 mode banner and16:9 arena are registered.
Captures/enemies reuse each reviewed portrait. Original hashes and per-image
key settings are in [root-art-intake.json](../Art/provenance/root-art-intake.json). The
Standard summoning artpiece remains16:9 Omnic, with Treasury crown motifs.
No new materials, currency purchase, pity ramp or Phase10 mode is included.
