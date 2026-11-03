# Story polish and Chapters 2-3 design draft

**D-450: owner-confirmed plot boundaries; all new locations, prose, numbers and
art designs below are PROPOSALS, not approved canon or playable content.**

## What Chapter 1 currently tells

Chapter 1 is **Search the Six Beacons of Emotion**, six regions of20 stages,
120 total, Lv1-55. The region sequence, guardians and restoration objective
are complete. The current short introductions/conclusions explain where to
go, not a fully dramatized journey. The founding prologue explains the creators
and competing searches, but character reactions, cryptic papers and the
emotional significance of restoring each beacon are still missing.

The owner confirms that Rise destroyed the beacon cores. Devourer bosses guard
them because restored beacons advance the search for Let's soul. Rise is buying
time to convince the bearers that she is not what they assume. That motive is
author knowledge, **not an early Codex revelation**. The characters speak as the
player character; do not introduce a separate fixed protagonist.

Chapter1 ends with all beacons restored, not a soul discovery. The machine,
Let's note and guiding wisp move to Chapter2's opening. Chapter3 brings the
destructive plan to light; Chapter6 remains the confrontation. Calamity prepares
the party to rival Let through Rise's powers; this is long-term narrative intent,
not authorization to change Calamity rewards, gates or combat.

### Implemented bounded polish

Collections has a Story Codex with the founding prologue plus six beacon
records, unlocked at0/20/40/60/80/100/120 clears. Old progress counts immediately.
Locked titles/prose are absent from rendered markup. No claims, extra rewards,
load-time writes or new wallet fields. Quiet boss-victory text points to the
record; replays say it is available, not falsely newly earned. The records use
confirmed history rather than invented character quotations.

### Proposed cryptic-paper pacing: approval required

These six short lines are **drafts of unidentified fragments**, not Rise's
implemented dialogue. Suggested milestones are10/30/50/70/90/110. Attribution
would remain uncertain; restore the regional beacon before its associated
complete record becomes readable. Do not expose the later twist in a title.

| Region | Proposed fragment | Proposed player-character response |
| --- | --- | --- |
| Emberwake | "A road can lead home. It can also lead someone to your door." | "Who would break a beacon just to keep the road closed?" |
| Glasswater | "The first account is not always the whole account." | "This says nothing plainly. But someone expected us to read it." |
| Stormspan | "A quiet voice is not an absent voice." | "The next beacon is still our way forward. We can keep the paper." |
| Rootstone | "Before you restore what was broken, ask what it was built to reach." | "We know what these roads promise. Do we know who made that promise?" |
| Stillhalo | "A sealed door can be a prison, or a shelter." | "Both sides call this protection. Neither has told us everything." |
| Riftbound | "When every light answers, listen before you follow." | "Six beacons. One road ahead. We will choose where it takes us." |

These leave essential authorship questions open: how the cores are repaired,
what their mechanisms look like, whether papers are signed and whether the
player-character voice varies by starter. No replacement core items or repair
quests are assumed. Author approval of text and implementation remains required.

## Proposed campaign loop

Keep the current free-entry, sequential campaign loop: choose chapter/region,
inspect level and drops, assemble a team, enter a stage, save actual kill/clear
rewards atomically, read an optional unlocked Codex record, Continue or replay.
Continue retains the frozen squad/equipment and existing Gauge behavior.
No mandatory reading, gacha prerequisite, new energy meter or story RNG.

New chapters should eventually use separate stable chapter progress, encounter
IDs and receipt namespaces; do not overload Chapter1's `storyCompleted` beyond120.
That future schema/authority work needs its own approved implementation and
migration tests. This phase installs no later-stage content or future asset URLs.

### Proposed pacing and tuning

| Part | Stages | Levels | Gate | Milestone bosses |
| --- | --- | --- | --- | --- |
| Chapter2: Explore the Metropolis |5 x25 =125 |55-85 |Chapter1 stage120 |25/50/75/100/125 |
| Intermission: The Descent |3 x25 =75 |85-100 |Chapter2 stage125 |25/50/75 |
| Chapter3: At the Brink |3 x25 =75, proposed length |100-120 |Intermission stage75 |25/50/75 |

Levels would interpolate over each whole part, preserving endpoints; no new
enemy stat curve or difficulty factor is proposed. Prototype testing must use
ordinary non-Calamitic ownership/progression distributions, not guaranteed
premium trios. Forecast only: no clear-rate or balance claim has been tested.
Calamity is optional training/power pursuit, not a proposed mandatory story gate.

Proposal: three-enemy ordinary encounters and one regional-boss encounter,
using current enemy skill/cooldown and stat foundations. The five identities
per region are four ordinary enemies and a boss, not five evolutions.
First24 stages vary the four ordinary identities; no random recruitment.
Codex milestones at local stages5/15/25 give approach/clue/conclusion records.

Proposed reward budget, pending economy review: each new stage pays the existing
150 Prismatica +2 Null-Prismatica first-clear award,150 Prismatica on replay.
That is250 premium units in Chapter2 and150 in each later part,550 total.
Proposal for per-kill Prismatica: retain the existing linear level-based activity
curve without extra boss multipliers. Region-themed Common/Uncommon materials
only, no captures, new currencies, free characters, Conduits or repeat premium.
Do not silently import Chapter1's escalating regional-boss one-time bonuses:
whether later parts receive those bonuses is an owner decision.

## Chapter2: Explore the Metropolis

Opening: after Chapter1, the party discovers a shattered machine of Let's design,
his message for "worthy" bearers, and a guiding wisp leading toward Nyrasma.
Exact note, wisp identity/reliability and discovery staging remain unauthored.
Do not label the wisp a confirmed soul fragment before owner confirmation.

Proposed Nyrasma is a vast city with precision civic machinery, canals, aerial
transit and an underground destination. Rise-infused machines obstruct passage.
**Proposed lineage only:** older jointly built mechanisms, later altered by Rise.
This does not rewrite existing Machines or declare every machine a Devourer.

| Region / visual palette | Proposed action and clue | Boss purpose, not authored allegiance |
| --- | --- | --- |
| Arrival of Brass / bronze, ivory, teal |Pass shuttered arrival locks; discover that the wisp follows an older route than the city's signage.|Turnkey Processional Engine controls the arrival gate.|
| Glasswater Circuit / navy, silver, cyan |Cross flooded civic channels; follow a machine signal beneath the transit current.|Undertide Pressure Regent regulates passage through the waterworks.|
| Suspended Mile / indigo, silver, amber |Traverse hanging transit rings; trace where the wisp vanishes behind interference.|Zenith Counterweight Tyrant anchors the transit obstruction.|
| Garden of Returning Cogs / jade, ivory, copper |Pass overgrown maintenance terraces; encounter repairs that appear protective rather than purely hostile.|Verdant Recirculation Heart keeps a sealed lower route alive.|
| The Unanswered Terminal / plum, black, pale gold |Reach the destination; see Devourers moving toward a deeper search-site, apparently nearing Rise's soul.|Silent Dispatch Sovereign blocks the final terminal.|

End on an urgent choice to follow, not proof of Rise's intentions. Do not locate
her soul in Nyrasma itself or reveal Let's plan before Chapter3.

## Separate intermission: The Descent

| Region / palette | Proposed gameplay/story beat | Boss |
| --- | --- | --- |
| Faultline Stair / charcoal, copper, amber |Pursue Devourers down broken transit access shafts; their route suggests purpose, not a mindless retreat.|Shaftjaw Excavator|
| The Buried Confluence / slate, pale blue, silver |Follow converging underground waterways; watch the pursuit narrow into a shared destination.|Confluence Abyssal Stag|
| The Last Threshold / obsidian, violet, ivory |Cross the deep boundary into the Brink of Oblivion; pursuit becomes confrontation with incomplete knowledge.|Threshold Veilmaw|

No player-faction swap, timed chase failure, forced captured team or recruitment.
Proposal: Brink of Oblivion is a story location **distinct from** Gates of
Oblivion, unless the owner chooses a connection. Do not reuse its artwork,
Calamitic enemies or Lv140-180 tuning automatically.

## Chapter3: At the Brink

Proposed three regions, all optional author choices until approved:

| Region / palette | Proposed beat | Boss |
| --- | --- | --- |
| The Bound Expanse / pearl gray, black, violet |The party searches for Rise's soul among structures that bind rather than merely destroy; earlier papers gain context.|Binding Crown Leviathan|
| Witness Hollow / midnight blue, ivory, restrained crimson |Compare evidence of the creators' conflict. Discover the destructive plan rather than accepting an unexplained exposition dump.|Witness Mirror Chimera|
| The Soul's Quiet / black, ivory, pale rose |Reach Rise's soul and hear her account. The party must decide what to believe about Let's plan to end violence by destroying everything.|Hushbound Sentinel|

The proposed final guardian tests passage; it is **not Rise**, and no creator
combat/portrait is designed here. Do not force a fight against the soul or
silently grant Rise as a fighter. A response/ultimatum and the exact evidence
need owner-authored or owner-approved text.

Chapter3 ends with the truth brought to light, not reconciliation. Chapter4
begins the journey with Rise; Chapters4-5 seek Let, Chapter6 confronts him and
Chapter7 concludes coexistence. Leave doubt/reactions emotionally credible:
the party remembers Rise broke their beacons and has not forgotten the war.

## Art deliverables and implementation boundary

[The complete proposed prompt pack](../Art/story/Chapters%202-3%20Draft.md)
contains55 unique enemy/boss cutouts,11 arenas, three part maps, three banners
and three transitional scene illustrations:75 prompts total. This covers the
proposed5+3+3 regions, **not** playable creator portraits or new material/ability
icons; the draft adds neither collectible type. Existing material assets remain.

Each proposed asset has its own output filename; nothing is wired or requested
at runtime before delivery and review. Names, species and palettes are proposals.
No prompt claims actual generated-pixel containment or owner visual approval.
Reproduce via `python tools/build_future_story_art.py`; validate with
`python -m unittest discover -s tools -p test_future_story_art.py`.

Before implementing Chapters2-3, approve region identities/counts, exact notes
and Rise dialogue, wisp nature, machine lineage, Oblivion continuity, rewards
and tested difficulty. Prompts can be generated for visual exploration, but
final art intake must follow those approvals and preserve supplied originals.
