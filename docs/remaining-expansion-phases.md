# Remaining expansion: implementation order

## Status and scope (2026-11-04)

Owner-requested roadmap, not an implementation or launch instruction.
This layout replaces the numbering of the supplied remaining Phases4/5/6/8;
it does not reopen completed work or resume the paused Story work.
Requirements below are confirmed unless explicitly marked as a proposal or
open decision. No schedules, rewards, characters or purchases are live merely
because they appear here.

### Confirmed clarifications

- Each new banner has **six characters: four5-star and two6-star**.
  There are three male and three female characters overall: each gender has
  two5-stars and one6-star. This replaces the original conflicting request
  for three characters per star tier with incompatible parenthetical counts.
- Daily reset: **8:00 PM America/New_York**, following daylight saving.
  Weekly reset: **Sunday at8:00 PM in that same timezone**. This supersedes
  interpreting the original "EST" as a fixed UTC-5 offset.
- "November31" is corrected to **November30,2026 at the daily reset**.
  This applies to the current Rose banner and the Moon banner target end.
- Keep the requested banner windows as targets, but **do not activate,
  backdate, grant compensation or silently reschedule anything yet**.
  The Moon target start predates this roadmap. Release readiness and handling
  a missed target require a separate owner decision.

## Required character workflow: every future character

This is a permanent design gate, not a task to skip for familiar themes.
Follow these steps in order for every character, including both new banners:

1. **Identity first.** Who are they? What makes them unique and memorable?
   Establish personality, lore, emotional/elemental identity, role and what
   distinguishes them from the existing roster and their banner peers.
2. **Appearance through every stage.** Design the complete evolution line:
   face, eyes, hair, silhouette, clothing, weapons and materials. Consider
   dresses, armor, glass-shard clothing or other character-specific wardrobes;
   armor/prismatic armor is not a universal template. Decide what they become.
3. **Advanced visual identity.** Specify the mythology and powers that belong
   to this individual: whether they have wings, exact wing counts by form,
   flame rings, magical water or other matching structures. Define sources,
   shapes, movement and increasingly enveloping power, not generic effect fog.
4. **Prompt-to-identity check.** Prompts must visibly emphasize these features.
   Could someone seeing only the name and Omnic form understand why the name
   fits? Keep form titles distinct from associated activity/mode names.
5. **Uniqueness and spectacle check.** Is the result individual, awe-inspiring,
   epic and thematically coherent? Escalate from a readable simple base to an
   extraordinary Omnic; do not make every earlier form Omnic-level.
6. **Ask the owner questions.** Present the actual design and unresolved
   choices, invite corrections, and obtain approval before locking it in.
   Supplied banner themes do not waive this interview.

Preserve the Infernis/Tizu compact anime/cel foundation, crisp readable detail,
complete silhouette margins and progressively luxurious clothing, weapons
and powers. Keep identifying features consistent unless change is intentional;
document intentional changes, such as hair color, beside the relevant prompt.
Preserve the existing cutout no-glow-on-edges exclusion, contrasting key
backgrounds and art-review rules. Shimmering metal, painted specular highlights
and opaque flame/energy structures express the requested themes in cutout
prompts; runtime VFX and full-bleed scenery may glow and bloom.
See [art workflow](art-workflow.md) and the
[shared prompt guide](../Art/guides/midjourney-character-style-prompt.md).

## Ordered phases and dependencies

| New phase | Deliverable | Why this order / dependencies |
|---|---|---|
| 1 | Reset clock, special-banner lifecycle and Special Banner Archive | Shared prerequisite for calendar days, weekly boundaries, gifts and scheduled banners; preserves Rose content before any closure. |
| 2 | Identity-first design and approval for both new banners | Starts art lead time early; requires the character workflow, existing roster-gap audit and owner review, not completed live-service UI. |
| 3 | Shared acquisition/equipment QoL and material-shop refresh | Establishes reusable selection, reward-detail and first-acquisition feedback before adding twelve characters and new reward sources. Independent of Phase2 design approval. |
| 4 | Mailbox, friend gifts and monthly login calendar | Uses Phase1 day keys and Phase3 acquisition feedback; mailbox delivery precedes gifts and calendar delivery integration. |
| 5 | Special Banner #2: Glow of the Moon's Light | Uses Phase1 scheduling/archive, approved Phase2 designs, supplied/reviewed art and Phase3 reward/equipment foundations. |
| 6 | Special Banner #3: The Angel-blazened Sunshade | Reuses the validated Moon event lifecycle, with its own approved roster, assets and theme. |

This is implementation order, not a new marketing calendar. Phase2 design/art
preparation can run alongside approved foundation work. Phases3/4 do not
silently authorize delaying a banner or removing a requested feature to meet a
date. If the original windows cannot be met, stop for the release decision.
Phase4 is not intrinsically required for summoning unless approved banner
designs explicitly depend on mail/calendar rewards.

## Phase1: reset and special-banner preservation

### Required

- One shared reset boundary: daily8 PM New York; weekly Sunday8 PM New York.
  Reuse it for all daily/weekly features rather than separate ad-hoc clocks.
- End the current **Roses Under Sunny Skies** special banner at the confirmed
  November30,2026 daily reset, subject to separately approved activation of
  scheduling. Preserve its associated information and mechanics for reruns.
- Add the exact destination **Special Banner Archive**. Preserve this and
  every future special banner's mechanics and information in-game for reruns:
  roster, actual rates/pity/costs, duplicate rules, event rules/rewards,
  progression requirements, art, descriptions and related content.
- Archive is not deletion, an automatic rerun, an automatic reset of saved
  progress/pity, or permission to replace existing owned units/materials.
  Keep stable IDs, account ownership, inventory and completed transactions.

### Open before implementation

- Archive browsing versus playable rerun entry; when and how reruns activate.
- Whether a banner's associated event closes with its draws, and what remains
  playable/viewable outside its window.
- Pity/event-progress behavior across closure and reruns; preserve current
  state until the owner approves any change.
- Start timestamps for Moon/Sunshade and the precise December31 end time.
  Only the November end-at-reset and global reset times are confirmed.
- Offline versus authority-backed eligibility and unavailable-network UX.
  Prefer the existing authority for reward-bearing time checks; client clock
  changes must not mint another day's rewards.

### Exit checks

Test before/at/after8 PM, Sunday rollover, month/year rollover, daylight-saving
transitions, repeated requests and retained accounts. Browse archived content
without writes or lost data. Never claim a closed banner is summonable.

## Phase2: two banner design packages

Audit current element/role coverage first, including the newly released War
roster. Use real gaps, not just theme, to choose elements and roles. Infernic,
Oceanic, Atmospheric, Tranquilitic and Botanic are examples, not mandatory
assignments; all choices must remain within the current six-element system.
Do not silently rewrite existing characters to manufacture a gap.

### Banner #2: Glow of the Moon's Light

- Requested target window: **November1,2026 through November30,2026 at reset**.
- Six new Element-Bearers with the confirmed four5-star/two6-star distribution.
- **Black-and-white shimmering moonlight angelic warriors**, adorned in shiny
  metallic armor; embody the moon's strength and space's beauty and regality.
- Apply the full character-first workflow even though the group theme is
  supplied. Distinct faces, wardrobes/armor silhouettes, weapons and powers
  must prevent six interchangeable angel designs.

### Banner #3: The Angel-blazened Sunshade

- Requested target window: **December1 through December31,2026**; exact
  endpoints remain to be confirmed as described in Phase1.
- Six new Element-Bearers with the same confirmed distribution.
- **Black-and-golden warriors armored head to toe**, with armor igniting into
  **black-and-orange flames**, sunlit glory, ornate and regal designs.
- Apply the same foundational workflow; maintain individual identities and
  gradual evolution rather than duplicating the Moon roster with new colors.

### Required package for each banner

Character identities/lore, every evolution's appearance and annotated
intentional changes, complete concise in-game kits, associated Conduits,
all associated art prompts/assets, overarching theme, special-banner/event
splash art, battle arena and any required event/reward/enemy/material artwork.
Explicitly inventory portrait forms, ability icons, weapons, Conduit icons,
headers, scenery and additional needed assets instead of assuming a fixed
count. Universal shared actions stay shared unless a change is approved.
Clarify Conduit types/counts and acquisition, including personal Masters if
intended; the request does not yet fix those numbers.

Do not invent approved rates, pity, event stage counts, drop tables, material
recipes or numeric kits. Present these designs for review. Character approval,
kit approval, prompt approval, delivered-art review and playable release are
separate gates. No missing-image URLs, unrelated substitute art or auto-grants.

## Phase3: shared QoL and material-shop refresh

### Multiple Master Chests and selection details

- When multiple Master Chests are owned, allow choosing multiple Master
  Conduits in one flow. The reward screen shows **all chosen Masters** and
  permits inspecting each one's details, like banner/Calamity chest rewards.
- Rework the **Master Slot Selection Screen** so the selected Conduit, its
  identity, effect and available choices are clear. Provide **View Details**
  and polished, meaningful animations rather than a visually ambiguous list.
- Keep chest choice and equipment choice consistent but distinct: inspect/
  choose is not automatic equip, and cancellation must not consume chests.
- Decide bulk limits, duplicate eligibility, selection editing and transaction
  semantics before implementation. Reuse shared saved-reward presentation;
  celebrate only persisted results, with Skip, focus and reduced motion.

### Material shop

- For each elemental material needed for infusion, add **Prismatica purchases**
  once **any owned character reaches the relevant leveling threshold**.
- Prices grow **exponentially** across the relevant progression; the requested
  anchor is **about550,000 Prismatica for one Soul of <element>**.
- Confirm the exact covered materials, thresholds, price curve, stock/quantity
  rules and any daily/weekly refresh behavior. The heading "Shop refresh"
  does not itself specify timed stock replenishment. Do not silently include
  special-banner materials or replace existing infusion/fodder requirements.
- Use shared eligibility/cost helpers in previews and atomic transactions.
  Preserve exact counts/currencies, overflow rejection and failed-save safety.

### First-acquisition indicator

- A **red exclamation point**, pulsing subtly, appears in the corner of the
  menus/buttons along the route to an item acquired **for the first time**.
- **Hovering that item clears its indicator** and updates its parent routes.
  Do not clear it merely because an unrelated menu was opened.
- Also define keyboard-focus and touch equivalents; reduced motion uses a
  static marker. Preserve accessible labels and avoid color-only meaning.
- Decide which acquisition categories count, legacy-account initialization
  and whether unread state syncs across devices. Do not mark the entire
  historical inventory as newly acquired without owner approval.

## Phase4: mailbox, gifts and monthly login calendar

### Mailbox first

Create a mailbox delivery system for **patch notes, friend gifts and similar
deliveries**. Support readable informational messages and clearly identified
claimable attachments, with duplicate-safe, atomic reward claims. Decide
expiry, retention, read state, claim-all and attachment limits before building.
A read receipt must not be confused with a successful reward claim.

### Friend gifts

Add a once-per-day option to gift friends **one of**:

- **1,000 Prismatica**;
- **10 Null-Prismatica**;
- **10 of any base elemental material (Seed of X)**, including Seeds for
  **currently active special banners**.

Deliver gifts through the mailbox and use the shared daily boundary.
Before implementation confirm whether once/day is per friend or per sender
overall, whether gifts deduct inventory or are a free allowance, recipient
limits, eligible friendship rules, and active-banner checks at send/claim.
Do not assume these choices or introduce daily premium generation silently.
Sending/claiming/retrying must never duplicate or partially lose attachments.

### Calendar and reward draft

Provide a visible **one-month login calendar** that tracks days logged in,
awards the **next reward in the sequence** for days actually logged in, and
tracks consecutive-day streaks. Rewards must become greater/better through
the month and with more consistent attendance/streaks.

**Proposed structure, not approved tuning:** separate monthly attendance
progress from current consecutive streak; use a rising base-reward ladder
with stronger milestone days and additional streak milestones. A missed day
does not silently invent a login or claim. Show next reward, monthly progress,
streak, claimed rewards and time to reset. Exact amounts/items and milestone
days must be drafted and approved against gift/banner economy budgets.

Resolve calendar month versus rolling month, what the original "concurrent
days" means beyond consecutive streaks, missed-day effects, automatic versus
manual claims, streak carryover, month length, eligibility for late joiners,
and catch-up policy before implementation. No paid catch-up is authorized.

### Exit checks

Test reset/DST/month boundaries, missed days, multiple devices, duplicate
send/claim retries, insufficient resources if applicable, full/expired mail
rules, denied writes, overflow and actual saved reward feedback.

## Phases5 and6: implement and release the two banners

Deliver Moon first, then Sunshade, each with its own approved design package:

1. Register approved characters, kits, Conduits, progression and event rules.
2. Preserve/archive reviewed delivered sources and wire every art surface;
   validate evolution identity, facing, complete silhouettes and revisions.
3. Integrate approved draw/event rules with atomic purchases/rewards,
   acquisition details, first-acquisition indicators and optional mailbox
   hooks only where approved. Keep existing accounts and unrelated pools.
4. Verify scheduled availability, archive information and rerun retention.
5. Run exact kit/economy/provenance tests, pressured encounter checks where
   mechanics change, production build and matching authority validation.
   Validate motion over time, cancellation/disposal and reduced-motion UI.
6. Obtain the release-window decision, deploy matching authority/client and
   verify hosted behavior. Record actual release separately from target dates.

## Source mapping: nothing dropped

| Original request | New home |
|---|---|
| Character-first six-step prerequisite | Required character workflow; Phase2 and both release gates |
| Rose end date / Special Banner Archive / preserve reruns | Phase1 |
| Daily and weekly reset prerequisites | Phase1; reused in Phase4 and any approved timed shop rules |
| Phase4 Moon banner, roster, kits, Conduits and all themed art | Phase2 design + Phase5 delivery |
| Phase5 Sunshade banner, roster, kits, Conduits and all themed art | Phase2 design + Phase6 delivery |
| Phase6 login/calendar, streaks and improving rewards | Phase4 |
| Phase6 friend gifts, exact choices, active special Seeds and mailbox | Phase4 |
| Phase8 multi-Master-chest rewards and inspectable choices | Phase3 |
| Phase8 infusion-material Prismatica shop and Soul price target | Phase3 |
| Phase8 first-acquisition red pulsing indicators / hover clear | Phase3 |
| Phase8 Master-slot details and animated UI overhaul | Phase3 |

No original Phase7 was supplied; none is silently invented. The next actual
work is Phase1 design decisions, alongside the Phase2 character interview,
not immediate activation of the target banner dates.
