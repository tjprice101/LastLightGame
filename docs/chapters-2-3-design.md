# Story polish and Chapters 2-3 design draft

**D-450/D-451: approved story/design foundations, with draft dialogue, puzzle
details and revised rewards for review. No new gameplay implementation authorized.**

## Approval status after the author interview (D-451)

Confirmed: the11 region names and enemy/art identities below are the foundation;
Nyrasma machines must be predominantly black and ominous. They are new machines
made by Rise, guarding the approaches to where they believe her soul is located.
The guiding wisp is genuinely a fragment of Let, but the party does not know.
Keep a cryptic note from Let; its wording below is a draft. Unsigned papers must
be much vaguer and their author must remain unknown until Chapter3.

The125/75/75 stage counts and55-85/85-100/100-120 level ranges are approved
**provisional design targets**, not tested encounter balance. Brink and Gates
of Oblivion are connected places; the existing Gates activity stays independent.
Chapter3 uses Let's memories and emotions to reveal his intention. Rise's
incomplete soul fragment shares feelings/images, knows only part of her plan and
asks the party to seek her while holding onto their emotions. Her complete self
is encountered later. No fragment becomes a playable character here.

Approved design direction: a mandatory, separately persisted Rebuild Core
rotate/connect puzzle after each regional boss; players may choose to restart
the rewritten Chapter1, with historical first-clear rewards protected from
repeat payout. **Do not reset any account or implement that gate yet.** The
owner explicitly requests the revised design/dialogue first, then approval.
Revised reward quantities below are not approved.

## What Chapter 1 currently tells

Chapter 1 is **Search the Six Beacons of Emotion**, six regions of 20 stages,
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

These revised, deliberately incomplete lines are **drafts**, not implemented
dialogue. Suggested milestones remain10/30/50/70/90/110, subject to approval.
They are unsigned; Rise's authorship is not revealed until Chapter3. Proposed
stage-local discoveries are readable when found; beacon records remain separate
at20/40/60/80/100/120. No early title or narrator identifies their author.

| Region | Proposed fragment | Proposed player-character response |
| --- | --- | --- |
| Emberwake | "...still warm." | "The rest is gone." |
| Glasswater | "Not the reflection." | "A warning? Or part of something longer?" |
| Stormspan | "There was a pause." | "Before what?" |
| Rootstone | "What remained, grew." | "Someone kept this." |
| Stillhalo | "An interval. Nothing more." | "We are missing the beginning." |
| Riftbound | "...and still, a little longer." | "Keep it with the others." |

Their precise wording, placement and player-character reactions need approval.
Responses represent the player through the characters, not a new fixed
protagonist or ownership-dependent required cast. Unique starter voice variants
are not assumed. No signature, collectible spending or complete revelation.

## Rebuild Core: design for approval, not implemented

After a regional boss, kill and stage-clear rewards save immediately. Victory
offers **Rebuild Core** and **Return to map**; normal onward Continue remains
unavailable until the core's successful save. The map shows **Core awaiting
repair** and an accessible Rebuild Core button. At the final beacon, rebuilding
completes Chapter1. Earlier stages remain replayable; quitting never removes loot.

Proposed puzzle: a small3x3 board of fixed source/receiver nodes and rotatable
straight/corner circuit pieces. Click/tap or Enter/Space rotates a selected
piece90 degrees; Tab reaches each piece and its accessible orientation label.
Connect the source to the receiver, then choose **Restore beacon**. Patterns are
authored, deterministic, solvable and regional, not randomized puzzles or
speed tests. No timer, resource cost, failure damage, input-mashing or new RNG.
Target a short understandable interaction, not an enforced duration.

| Region | Proposed visual motif / increasing interaction |
| --- | --- |
| Emberwake |Amber-red furnace traces, two rotatable corners; explicit first-puzzle instruction.|
| Glasswater |Blue water channels, three rotatable sections.|
| Stormspan |Silver wind vanes, four sections.|
| Rootstone |Green root-like conduits, four sections with a different route.|
| Stillhalo |Ivory inset channels, five sections.|
| Riftbound |Violet fracture seams, six sections; no timing pressure.|

These are UI circuit motifs, not new elemental lore or delivered art. Proposed
repair explanation: the party reconnects surviving channels and channels its
elemental energy into the damaged mechanism. **That explanation is still a draft**;
do not require an owned bearer of each element or invent replacement-core items.

Unconnected circuits show an explicit status such as "The channel ends before
the receiver"; Restore remains disabled. Successful alignment gives a small
non-celebratory static connection cue. Only successful persistence of restored
core state triggers the shared finite sheen, circular impact, minor sparks and
short success text. Reduce motion keeps a static repaired circuit/result.
Cancel/Escape returns to the map and restores focus. A save failure preserves
the solved board, reports the error and allows retry without redoing the puzzle.
No animation hides controls or delays rewards/saves.

Future authority design must validate chapter/region, saved boss clear and a
valid submitted board before committing core restoration, idempotently. Next
region entry checks repaired state server-side; finishing the final boss alone
must not bypass it. A suspended old run must not Continue past a new gate:
define explicit resume compatibility while retaining frozen gear and earned loot.
Draft choice: save completed cores, not each rotation; cancellation/reload may
reset an unfinished board and must explain that before leaving.

### Optional rewritten-Chapter1 restart

Offer a clearly confirmed **Restart Chapter1 story** choice, not a forced/global
reset. Players who decline retain current completed progress and region access;
proposed compatibility treats their already-cleared beacons as rebuilt. Players
who accept restart chapter access, papers and core steps, but keep characters,
levels, currencies, items, equipment, loadouts and non-Story activity access.
The latter compatibility details are proposed safeguards, not broader reset
authorization. Do not delete discoveries or other collections.

Preserve historical first-clear eligibility independently of replay progression:
previously paid stage premium and regional bonuses never pay again. Ordinary
replay/kill rewards still pay, and never-before-cleared stages retain their
original first-clear eligibility. Legacy migration must derive reward history
from the account's authoritative existing credited clears, not invented receipts
or a client-supplied list. No migration grants or writes merely for loading.
Restart is one confirmed atomic operation; reject during an active Story run
until the player explicitly exits it, rather than silently destroying that run.
This needs approved schema, client/authority migration and rollback/failure tests
before implementation. No restart is present in the current live game.

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
| Chapter2: Explore the Metropolis |5 x25 =125 |55-85 |Chapter1 final core restored |25/50/75/100/125 |
| Intermission: The Descent |3 x25 =75 |85-100 |Chapter2 stage125 |25/50/75 |
| Chapter3: At the Brink |3 x25 =75 |100-120 |Intermission stage75 |25/50/75 |

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

### Revised reward quantities: owner approval required

Retain the reward kinds, but replace the earlier550-premium proposal with a
more milestone-weighted budget. All amounts below are **proposals**, not live
economy edits. Chapter1's existing rewards remain unchanged.

| Part | First-clear Prismatica / stage | Replay Prismatica / stage | First-clear Null-Prismatica | Part totals from first-clear stage awards |
| --- | --- | --- | --- | --- |
| Chapter2,125 stages |200 |150 |1 per stage, plus5 on each of5 regional finals |25,000 Prismatica /150 Null-Prismatica |
| Intermission,75 stages |250 |150 |1 per stage, plus5 on each of3 regional finals |18,750 Prismatica /90 Null-Prismatica |
| Chapter3,75 stages |300 |150 |1 per stage, plus5 on each of3 regional finals |22,500 Prismatica /90 Null-Prismatica |

Combined first-clear stage awards:66,250 Prismatica and330 Null-Prismatica,
versus550 premium in the first draft (220 fewer,40% reduction). The final-stage
five-unit supplement is part of that stage's single atomic first-clear award;
it never repeats on replay and is not another claim. No additional escalating
regional one-time Prismatica/premium bonuses are proposed. At10 per summon,
330 premium funds33 draws; this is a budget description, not a balance result.
Ordinary kill rewards are separate from these exact totals.

Proposal for per-kill Prismatica: retain the existing linear level-based activity
curve without extra boss multipliers. Region-themed Common/Uncommon materials
only, no captures, new currencies, free characters, Conduits or repeat premium.
These quantities and the no-extra-regional-bonus choice require owner approval.

## Chapter2: Explore the Metropolis

Opening: after Chapter1, the party discovers a shattered machine of Let's design,
his message for "worthy" bearers, and a guiding wisp leading toward Nyrasma.
The wisp is actually part of Let's soul, but its identity remains uncertain to
the party. Exact note and scene wording below need approval; never expose that
private identity through an early Codex title, accessibility text or reward name.

Proposed Nyrasma is a vast city with precision civic machinery, canals, aerial
transit and an underground destination. Rise-infused machines obstruct passage.
**Confirmed lineage:** new machines made by Rise, protecting approaches to where
they believe her soul is. They can be mistaken; their belief is not a map to her
complete self. This does not rewrite the older joint Machines or make machines
Devourers. Predominantly black chassis with ominous silhouettes, and restrained
district accent colors, supersede the brighter original machine prompts.

| Region / visual palette | Proposed action and clue | Boss purpose, not authored allegiance |
| --- | --- | --- |
| Arrival of Brass / black chassis, dark bronze, restrained teal |Pass shuttered arrival locks; discover that the wisp follows an older route than the city's signage.|Turnkey Processional Engine controls the arrival gate.|
| Glasswater Circuit / black chassis, gunmetal, restrained cyan |Cross flooded civic channels; follow a machine signal beneath the transit current.|Undertide Pressure Regent regulates passage through the waterworks.|
| Suspended Mile / black chassis, dark silver, restrained amber |Traverse hanging transit rings; trace where the wisp vanishes behind interference.|Zenith Counterweight Tyrant anchors the transit obstruction.|
| Garden of Returning Cogs / black chassis, dark copper, restrained jade |Pass overgrown maintenance terraces; encounter repairs that appear protective rather than purely hostile.|Verdant Recirculation Heart keeps a sealed lower route alive.|
| The Unanswered Terminal / black chassis, dark plum, restrained pale gold |Reach the destination; see Devourers moving toward a deeper search-site, apparently nearing Rise's soul.|Silent Dispatch Sovereign blocks the final terminal.|

End on an urgent choice to follow, not proof of Rise's intentions. Do not locate
her soul in Nyrasma itself or reveal Let's plan before Chapter3.

## Separate intermission: The Descent

| Region / palette | Proposed gameplay/story beat | Boss |
| --- | --- | --- |
| Faultline Stair / charcoal, copper, amber |Pursue Devourers down broken transit access shafts; their route suggests purpose, not a mindless retreat.|Shaftjaw Excavator|
| The Buried Confluence / slate, pale blue, silver |Follow converging underground waterways; watch the pursuit narrow into a shared destination.|Confluence Abyssal Stag|
| The Last Threshold / obsidian, violet, ivory |Cross the deep boundary into the Brink of Oblivion; pursuit becomes confrontation with incomplete knowledge.|Threshold Veilmaw|

No player-faction swap, timed chase failure, forced captured team or recruitment.
Brink of Oblivion is **connected to** Gates of Oblivion. Precise geography is
still a scene/map-design proposal: the Brink approaches the same deep boundary
from another route. Gates retains its independent encounters, unlocks, artwork,
rewards andLv140-180 tuning; story access must not silently unlock that activity.

## Chapter3: At the Brink

Three approved regional foundations; detailed scene prose remains a draft:

| Region / palette | Proposed beat | Boss |
| --- | --- | --- |
| The Bound Expanse / pearl gray, black, violet |The party searches for Rise's soul among structures that bind rather than merely destroy; earlier papers gain context.|Binding Crown Leviathan|
| Witness Hollow / midnight blue, ivory, restrained crimson |Experience Let's memories and emotions, culminating in his intention to erase everything.|Witness Mirror Chimera|
| The Soul's Quiet / black, ivory, pale rose |Meet an incomplete fragment of Rise; receive feelings/images and a plea to seek her while retaining one's emotions.|Hushbound Sentinel|

The proposed final guardian tests passage; it is **not Rise**, and no creator
combat/portrait is designed here. Do not force a fight against the soul or
silently grant Rise as a fighter. This fragment knows only part of Rise's plan;
it does not speak a complete explanation or stand in for her complete self.
Exact images, memory wording and player reactions still need owner approval.

Chapter3 ends with the truth brought to light, not reconciliation. The party
continues seeking Rise's complete self; exact later meeting timing remains open.
Chapters4-5 continue toward Let, Chapter6 confronts him and
Chapter7 concludes coexistence. Leave doubt/reactions emotionally credible:
the party remembers Rise broke their beacons and has not forgotten the war.

## Art deliverables and implementation boundary

[The complete proposed prompt pack](../Art/story/Chapters%202-3%20Draft.md)
contains55 unique enemy/boss cutouts,11 arenas, three part maps, three banners
and three transitional scene illustrations:75 prompts total. This covers the
proposed5+3+3 regions, **not** playable creator portraits or new material/ability
icons; the draft adds neither collectible type. Existing material assets remain.

Each proposed asset has its own output filename; nothing is wired or requested
at runtime before delivery and review. Region/enemy identities are approved
foundations; the black-machine revision implements the requested art direction.
Actual generated artwork still needs review, not automatic installation approval.
No prompt claims actual generated-pixel containment or owner visual approval.
Reproduce via `python tools/build_future_story_art.py`; validate with
`python -m unittest discover -s tools -p test_future_story_art.py`.

Before implementation, approve the remaining exact scene/paper wording, puzzle
and restart details, reward quantities and tested difficulty. No later gameplay
or live Chapter1 reset/gate implementation is authorized in this phase.
Prompts can be generated for visual exploration, but
final art intake must follow those approvals and preserve supplied originals.

## Revised scenes: exact wording and imagery for author review

These are drafts, not shipped dialogue or proof of a new lore mechanism.
No fixed premium cast is required; **player-character** lines are spoken by
the player's represented character. Narration describes discoveries, not an
omniscient announcement of the twist.

### Chapter2 opening: the machine, note and wisp

The party finds the shattered machine beyond the restored final beacon.
Its protected message plate remains legible; a small wisp emerges from the
broken housing. Neither a creator nameplate nor an inventory reward identifies it.

**Let's note (draft):**

> To those who have come this far:
> What was divided is not yet lost.
> If you are worthy of the road ahead, follow what remains.
> Beyond Nyrasma, the search continues.
> Let.

**Player-character:** "He left this for someone who reached the beacons."

The wisp drifts toward the distant city, stops and returns a short distance.

**Player-character:** "It wants us to follow. That does not tell us what it is."

The note offers direction, not a command to destroy or an explanation of the
wisp. Its intentional silence preserves the uncertainty the owner requested.

### Chapter2 ending and pursuit

Machines close routes toward a protected descent. Beyond the terminal, the
party sees Devourers taking the same descending route with urgency.

**Player-character:** "They are not scattering. They know where they are going."

The wisp turns toward the descent.

**Player-character:** "If their search ends down there, we cannot turn back now."

No scene asserts that the machines know the true location of Rise's full soul.
The pursuit is its own intermission, not extra Chapter2 regions.

### Chapter3: Let's memories and emotions

**First memory / grief:** a once-inhabited place after conflict, familiar
objects left in silence. The party feels loss without a complete explanation.

**Player-character:** "This grief... it is not mine."

**Second memory / fear and anger:** places rebuilt, then the sensation of
conflict returning. Rapid images give way to clarity rather than an exposition
wall. No invented faction massacre, named victim or definitive war chronology.

**Player-character:** "He was afraid it would happen again. Then fear became anger."

**Third memory / exhaustion and desire for peace:** the same impulse to mend
gives way to an image of perfect stillness, with no one left to experience it.

**Player-character:** "He wanted it to stop. All of it."

**Final memory / explicit intention:** Let imagines removing the whole world,
bearers and Devourers alike, so that no conflict can ever recur. The recollected
thought below is a proposed expression of his intention, not a current
conversation or proof that he has already carried it out.

**Let, remembered thought (draft):** "If nothing remains, nothing can suffer.
No one can begin it again."

**Player-character:** "Not a world without war. A world without anyone."

This makes the plan unmistakable in Chapter3 while leaving his confrontation
for Chapter6. His suffering explains his reasoning; it does not excuse the plan.

### Chapter3: Rise's fragment

After the final guardian, the party reaches a fragment, not Rise in totality.
It sends incomplete images: separated pieces reaching toward each other,
hands holding onto something precious, and a path continuing beyond this place.
Grief, fear, anger, calm and hope are felt rather than spoken by an all-knowing Rise.

**Player-character:** "There is more of you. You want us to find it."

An image returns: a hand loosening its grip, then closing again around its
small held light. The feeling is urgent but not commanding.

**Player-character:** "And not leave ourselves behind. Keep what we feel."

Proposed authorship reveal: the remembered texture/handwriting of the unsigned
papers appears among these fragmentary images. This associates them with Rise
without granting her fragment knowledge of every paper or her complete plan.
The actual recognition device is a draft, not a new memory-transfer rule.

**Player-character:** "Those scraps along the beacons... they were yours."

The fragment offers no complete answer or guarantee of benevolence.

**Player-character:** "You broke the cores. We have not forgotten. But we will
find the rest of you, and hear what you could not leave here."

End on an informed choice to continue, not instant absolution, recruitment,
creator reconciliation or an early confrontation with Let.
