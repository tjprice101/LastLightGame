# Last Light: AI agent entry point

## Read first

1. [Documentation index](docs/README.md).
2. [Current state and handoff](docs/handoff.md).
3. [Game vision](docs/game-vision.md) and [decision log](docs/decisions.md).
4. The system document relevant to the task.
5. [Art workflow](docs/art-workflow.md) and the existing
   [prompt guide](Art/midjourney-character-style-prompt.md) before changing art.

## Project rules

- Last Light is an original gacha game inspired by Brave Frontier. Do not copy
  its characters, assets, story, code, names, or proprietary content.
- Separate confirmed requirements, proposed designs, open questions, and
  implemented behavior. A written proposal is not owner approval.
- The owner delegated stack selection: TypeScript, Phaser 3, Vite, and Vitest
  power the browser prototype. Keep accessible menus in HTML over the canvas.
  Ask before changing engines or adding paid services, backends, or payments.
- Inspect the workspace before trusting handoff status. Opening flow and
  [Free Battle](docs/free-battle.md) exist; progression/economy operations do not.
- Free Battle uses a temporary three-starter practice team; permanent first
  companion selection stays fire-only. Do not grant practice units as owned units.
- Preserve source images under Art/source; process runtime copies using
  tools/prepare_art.py. Images use Vite's deployment base, not root-relative paths.
- Preserve the established art direction. Six illustrated stages do not establish
  six gameplay rarities or six implemented evolutions.
- Keep gameplay rules and content definitions separate from presentation where
  the selected stack permits it. Reuse existing patterns once code exists.
- Never invent working commands, test results, credentials, or completed features.
- Do not change unrelated files or overwrite another contributor's work.
- When adding a feature, update its specification, validation guidance, and the
  handoff. Add new documents to the index.
- Record approved consequential decisions in the decision log; unresolved
  questions belong there as open items, not as accepted decisions.

## Completion report

Report what changed, what was verified, what remains unimplemented, and any
owner decisions needed. Include exact commands and outcomes when commands exist.
Use the [handoff template](docs/handoff.md#handoff-update-template) for persistent
state; do not create a second competing status document.
