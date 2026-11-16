# Last Light: AI agent entry point

## Mandatory: cost-aware guidance for the owner

The owner is new to Claude Code. Every session:
- Before substantial work, recommend the model (Sonnet: UI/docs/git/small fixes;
  Opus: combat/balance/server authority, large refactors, stubborn bugs) and Plan mode
  for big or risky changes.
- Flag costly steps (multi-agent workflows, ultra/max reviews, broad searches) and offer
  a cheaper path. Before risky or outward-facing steps, explain the options in plain
  language with a recommendation and let the owner decide.
- End each completed task with a short next-steps note: what to verify in game, whether
  to `/clear`, which model fits next, suggested next work from the handoff. Stay concise.

Original browser gacha game (TypeScript, Phaser 3, Vite, Vitest; accessible HTML
menus over the canvas). Inspired by Brave Frontier; never copy its content.
Ask before changing engines or adding paid services, backends or payments.

Read first: [docs index](docs/README.md), [handoff](docs/handoff.md) (top entries =
current state), [game vision](docs/game-vision.md), [decisions](docs/decisions.md),
then the system doc for the task. For art: [art workflow](docs/art-workflow.md) and
[prompt guide](Art/guides/midjourney-character-style-prompt.md).
Per-decision history lives in docs/decisions.md (see D-460), the system docs and git.

## Standing rules

- **Live-first, never demos.** Build every system/rework/UI change directly into the
  live game with complete information. No demos, previews, prototypes, study flags or
  side-by-side pages unless the owner explicitly asks.
- **Radiant is THE live battle system.** All activities, online and local
  (`src/online/battle-local.ts`), use Radiant; calibration `authored-control`; squads
  1-6 acquired Element-Bearers, no captures. UIs present Radiant kits, attunement
  subtypes (Equinox/Corona/Aegis/Solstice/Prism) and Radiant Conduit effects. Legacy
  battle ops are rejected server-side. Never reintroduce a preview/demo gate or route
  battles to the legacy engine. `VITE_RADIANT_STUDY_UI` and `RADIANT_STUDY_ENABLED` are
  obsolete; dispatch still needs `RADIANT_STUDY_SECRET` (never print/commit it).
- **Deploy.** Server changes: `node tools\bundle_server_game.mjs` then
  `npx --yes supabase@3.0.0 functions deploy game-operation --use-api
  --remote=ohtfgwomdfteaxubndww --yes` (`--yes` only after owner approval), matching the
  client deployed from `main`. `main` and `overhaul/radiant-foundation` stay in sync
  and both are pushed.
- **Publication.** By default, after completed and validated changes: commit, push,
  deploy matching authority if server behavior changed, verify the hosted release.
  Report failures honestly; a push or local tests do not prove a release is live.
- **Never stage or publish** the rejected local mock-ups (`radiant-ui.html`,
  `ui-design-lab*`, `src/radiant-ui.test.ts`) or the uncommitted mock-up notes in
  `docs/Future Plans/living-world-ui-audit-plan.md` and lower docs sections.
- **Unfinished work** lives only in [Future Plans](docs/Future%20Plans/README.md)
  (plans, deferred ideas, resume gates, art/Midjourney budget, and the open Radiant
  follow-through: economy review, GPU check, icon art, legacy code, vendor portraits). Never recreate
  competing documents. Filing does not authorize paused Story, event launch or spending.
- Separate confirmed requirements, proposed designs, open questions and implemented
  behavior; a proposal is not owner approval. Never invent commands, results,
  credentials or completed features. Don't touch unrelated files.
- Adding a feature: update its spec, validation guidance and the handoff; add new docs
  to the index; record approved decisions in the decision log, unresolved ones as open items.

## Terminology and text

- **Element-Bearer(s)** / Owned Element-Bearers for characters; never "companions".
  Captured enemies are Elemental-Devourers (internal "creature" IDs stay). Mixed teams:
  squad member. Display names are "Prefix, Character name" via
  `content/character-art.characterName`.
- Currencies: Prismatica (main) and Null-Prismatica (premium); legacy `fractalis`/
  `lycalis` IDs/fields/save keys stay.
- Elements: Infernic/Oceanic/Atmospheric/Botanic/Tranquilitic/Chaotic. Effect names:
  Infernic Embers, Oceanic Protection, Botanic Renewal, Atmospheric Charge,
  Tranquilitic Focus, Chaotic Suppression (stable internal IDs unchanged).
- Banner and activity names must differ from character identity names and Omnic titles
  while staying symbolic of their event.
- Kit/ability/Conduit descriptions are in-game tooltips: name, exact effect, target,
  value, duration, meaningful limits. No vague summaries, no padding, shared rules
  (Burn/Weaken/Shield) explained once in the glossary. Use "Health" in prose.
- All game text uses the Georgia stack via `interface.css --ui-font` (600 body,
  700 headings). UI primaries neutral black/white/gray; accents follow element.
  Green/red only for semantic gains/losses and sufficient/missing resources.

## Gameplay and economy contracts (details in system docs)

- Shields last until broken; Skill/Last Flare shields stack additively (docs/combat.md).
- Direct damage: base Attack/(base Attack + effective Defense) mitigation; round once;
  floor 1; Burn bypass, pierce, shields, guard preserved (docs/combat.md).
- Conduit-generated effects do not auto-scale with Skill Power; existing Master-specific
  scaling stays. Omnic Conduits require matching element, max 4 of 8 ordinary slots;
  Master slot reserved. Resonance: 2 same-element EBs +15% Health; 3 +25% Health +5%
  Skill Power.
- War modes recruit at 5% per final-boss clear (0 on Stages 1-9); only successful owned
  recruitment converts to 100 NP; no pity/auto-grants; atomic receipts, separate RNG.
- Rose/event timing: draws/activity close Nov 30 2026 8 PM America/New_York; daily reset
  8 PM, weekly Sunday 8 PM, DST-following. Authority time gates draws and entry.
  Underway encounters may finish; never erase saved rewards/pity/progress. Event
  materials stay purchasable; warn before buying event items without an associated
  Element-Bearer. Moon/Sunshade banners/events stay inactive until explicit launch
  approval (docs/moon-sunshade-events.md). Story is paused.
- Every economy/reward change is one atomic, receipt-deduplicated write saved BEFORE any
  celebration. Loading never writes. No load-time migration writes, overflow fallbacks,
  retired-original deletion or auto-grants. Wallet versions are read-only-normalized
  until the first successful transaction. Never fund browser saves for layout tests.
- Separate RNG streams (combat, reward, capture, encounter, conduit, lycalis) must not
  perturb each other. Preserve stable character/Conduit/capture/discovery IDs, saves,
  settings and hotkey keys, and frozen run snapshots through Continue/Retry/Settings.
- Shared growth: `src/content/stat-growth.ts`; preserve fractional stats and format only
  at presentation boundaries (docs/units-and-progression.md).
- Balance work: use docs/roster-capability-audit.md and docs/enemy-benchmark-calibration.md;
  model ordinary progression honestly, not the strongest paper outlier.

## UI, motion and presentation

- Every screen/action must feel alive, elegant and unique to Last Light: light, bloom,
  motion and reward choreography are acceptance criteria. Reuse shared reward/
  rarity-feedback/upgrade foundations (`reward-screen.ts`, `summon-presentation.ts`,
  `conduit-presentation.ts`). Effects are finite, pointer-transparent, disposable, with
  static feedback under Reduce motion; keep Skip/dismiss/focus/immediate controls. Never
  celebrate failed/cancelled actions; no artificial delays or gameplay RNG. Validate
  motion over time, not only a still frame.
- No browser alert/confirm/prompt or OS Notifications; use `presentation/game-dialog.ts`.
- Information is professionally organized, concise and nonredundant while keeping exact
  mechanics. Navigation has purpose; no disconnected half-finished panels.
- Navigation/menu contract: docs/menus-and-inventory.md (persistent Home/Team/Summon/Play
  dock, caller-based Back with in-memory history, Settings-only return to title, Menu
  drawer). Use `button-style.ts/css` and `sanctuary-reference.css`; never restyle
  artwork-backed buttons; text buttons are never round icon buttons. Keep 44px targets,
  portrait DOM preservation and numeric containment (`numeric-layout.css`; exact numbers,
  no abbreviation).
- Never use missing-image URLs: art-pending content uses honest neutral tiles, never
  another owner's art. Images use Vite's deployment base.

## Art rules (full detail in docs/art-workflow.md and Art/guides)

- Fixed compact anime/cel renderer; character creativity lives inside it (not identical
  costumes or monochrome templates). Rarity escalates epicness, not realism. Eyes-only
  faces where established; non-explicit, neutral wording; no moderation-evasion claims.
- Cutout prompts: framing and complete outer margin first, subject identity/equipment/
  palette, short solid unlit background clause last; opaque crisp powers, no glow wording.
  Scenery stays full-bleed. Icons are object-only (no figures/faces/hands). Short prompts
  (Calamitic pack cap 230 words). Use `tools/prompt_quality.py` and
  `tools/character_palette.py`; never force subject colors to clash.
- `--sref`/`--sw 400` only for Element-Bearer/enemy-form portraits per the shared mapping
  (D-129/D-155); never invent a reference URL; items, icons, banners, scenery get none.
- Conduits are integrated luxurious machines (armored chassis, gears, crystal reactors,
  pistons; pearlescent craftsmanship), not buildings; use `build_calamitic_art.CONDUIT_FOUNDATION`.
- Moon: black/white/silver with deep-blue and vivid-purple moon phases. Sunshade:
  black/white with deep-orange and pearlescent pink. Reclaimed War art keeps its own
  palettes. See docs/moon-sunshade-character-design.md.
- Character-linked ability art embodies the character's signature equipment, trim and
  power geometry; universal Normal Attack/Defense icons are shared.
- Source originals stay under Art/source with hashes in Art/provenance; the owning
  `tools/intake_*.py` reproduces runtime exports with reviewed per-source keys. Supplied
  alpha is authoritative (trim/resize/pad only); never key it or run runtime background
  removal. Never globally remove interior blue/green/pale pixels. Preview actual pixels
  before declaring visual success; source-clipped tips cannot be reconstructed.
  Use `tools/art_library.py` for paths; do not reintroduce flat duplicate folders.
- Validate prompt changes with `python -m unittest discover -s tools -p "test_*.py"`
  (e.g. test_art_prompts.py, test_character_*.py, test_calamitic_art.py).

## Completion report

Report what changed, what was verified (exact commands and outcomes), what remains
unimplemented, and owner decisions needed. Use the
[handoff template](docs/handoff.md#handoff-update-template) for persistent state; do not
create a second status document.
