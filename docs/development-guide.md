# Development and customization guide

## Setup

Use Node.js 22.12+ (22 LTS recommended) and npm. From the project root:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Development: `http://127.0.0.1:5173/LastLightGame/`.
Production preview: `http://127.0.0.1:4173/LastLightGame/`.
If a port is occupied, Vite prints the actual URL. VS Code tasks provide
"Build Last Light" and "Run Last Light".
Build runs strict TypeScript validation before generating `dist`.
Vitest covers opening/save state, combat formulas and all starter kits, turn
recovery/cooldown/waves, content invariants, motion preferences, and hotkey validation.

### Line endings and concurrent changes

[Git attributes](../.gitattributes) keep detected text files LF in Git and on
checkout, regardless of the developer's global `core.autocrlf` setting.
Windows `.bat` and `.cmd` working copies use CRLF. Binary artwork/audio is
automatically detected and left untouched. The shared
[VS Code settings](../.vscode/settings.json) also default new files to LF.

After changing this policy, start with a clean worktree and run
`git add --renormalize .`, then review `git diff --cached` before committing.
Do not normalize unrelated work while another contributor has edits in progress.

Publish fixes through the same local Git checkout whenever possible. Avoid
editing the same fixes separately through GitHub's file API while local work
is pending: API uploads preserve submitted bytes and bypass local Git
normalization. If remote edits are necessary, submit LF text, then fetch and
integrate those commits before committing overlapping local changes.
This prevents line-ending-only conflicts, not legitimate competing edits;
review real conflicts rather than automatically choosing one side.

## Deployment

Remote: [LastLightGame](https://github.com/tjprice101/LastLightGame).
Public page: [Last Light](https://tjprice101.github.io/LastLightGame/).
[Deployment workflow](../.github/workflows/deploy.yml) runs install, tests, build,
and artifact deployment on pushes to `main` or manual dispatch.
Repository Settings -> Pages -> Source must be **GitHub Actions**.
The workflow environment is `github-pages`; the repository must permit Actions.

### Online account configuration

Vite embeds online account settings at build time. The ignored `.env.local`
configures this computer only; GitHub Actions cannot read it.

For local development, copy `.env.example` to `.env.local` and fill in the
existing project's URL and **publishable** client key. Restart Vite after changes.
Never use a Supabase service-role or secret key in any `VITE_` setting.

For GitHub Pages, set these repository Actions variables under
Settings -> Secrets and variables -> Actions -> Variables:

- `VITE_SUPABASE_URL`: the existing project's HTTPS Supabase URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: its `sb_publishable_` client key.

The deployment build accepts repository Actions secrets with the same names
instead; a variable takes precedence if both exist. Use the same configuration
as the working local build, without committing `.env.local` or keys.
These settings belong to the **build** job, not only the `github-pages`
deployment environment. Missing/invalid configuration stops the build before
artifact upload, keeping the previous deployment intact.

After setting or changing either value, run the deployment workflow again
against the updated workflow on `main`, then reload the published game.
Changing variables alone does not update an already-published JavaScript bundle.
Check that Play online opens without the configuration error, then sign in
with an existing account to verify authentication. No account reset, new
Supabase project or save deletion is required.

[Vite configuration](../vite.config.ts) sets `/LastLightGame/` as the base.
Change it if renaming the repository or deploying at another URL root.
Avoid absolute asset paths that bypass this base. Screens use in-page state, not
server routes, so GitHub Pages does not need a single-page-app redirect workaround.
Do not commit `dist` or `node_modules`; CI uses the committed lockfile.

## Troubleshooting

- Blank page: inspect the browser console and check the deployment base/asset URLs.
- Invalid save: the title reports it and offers a confirmed local-save deletion.
- Save fails: check browser storage permissions; selection stays open, not falsely saved.
- Battle controls: click an ally on the right and an enemy on the left. Hotkeys
  are shown on the actions and can be remapped in Settings. End turn forfeits
  unused actions; only Last Flare users cannot act on the next turn. Each character
  builds Elemental Gauge from normal attacks and incoming hits to pay ability costs.
- Missing artwork: inspect the visible error and confirm `public/assets` was
  included in the Vite build. Source art is not loaded by the browser.
- Python is only needed to regenerate transparent art, not to run/build the game.
  See [asset processing](art-workflow.md#supplied-character-and-enemy-art).
- Windows `npm ci` reports an esbuild file lock: stop this project's dev/preview
  server before restoring dependencies; do not terminate other projects' processes.
- Old deployed build: inspect Actions and Pages deployment status; refresh after success.
- "Online accounts are not configured for this deployment": the bundle was
  built without valid online account settings. Follow
  [online account configuration](#online-account-configuration) and rebuild;
  this is not a bad password or lost save.
- Large bundle warning: Phaser currently accounts for most of the approximately
  1.2 MB uncompressed bundle. Do not suppress the warning as a performance fix.
  Profile load/frames on target devices before expanding runtime assets.

## Before implementing

1. Read [handoff](handoff.md), [vision](game-vision.md), and [decisions](decisions.md).
2. Locate the owning specification through the [index](README.md).
3. Check which rules are confirmed versus proposed.
4. Resolve decisions that materially affect the task with the owner.
5. Inspect existing code, data, and tests once they exist.

## Adding your own feature

Describe player behavior and acceptance criteria first. Identify whether the change
is content-only, a shared rule, a new presentation surface, or a platform service.

- Content-only: follow the [content guide](content-guide.md).
- Shared gameplay rule: update the owning system spec and exact rule tests.
- UI: specify entry points, loading/empty/error states, input, readability, and accessibility.
- Persistence: specify migration and recovery behavior before changing stored data.
- Online/payment feature: resolve authority, privacy, and platform requirements first.

Trace all affected surfaces: authored data -> validation -> gameplay operation ->
persistence -> presentation -> tests. Do not stop after adding an unused record
or a button with no working operation.

## Feature specification template

```text
Feature and owning document:
Status: proposed / confirmed / implemented
Player goal:
Entry point and flow:
Inputs and rules:
State/data changes:
Errors and recovery:
Acceptance criteria with exact expected outcomes:
Tests and manual checks:
Open decisions:
Implementation references:
```

## Validation strategy

Use the selected stack's existing tools once available:

- Unit tests for formulas, transitions, progression, odds, and validation.
- Integration tests for rewards, saves/migrations, and transaction recovery.
- UI checks for battle feedback, squad edits, progression previews, summon costs,
  cancel paths, and error states.
- Target-device checks for performance, sizing, and input behavior.

Start with focused tests and expand when shared behavior changes. Test exact
thresholds and outcomes, not merely that an operation returns success.

## Definition of done

- Approved acceptance criteria work end-to-end.
- Validation and error paths are explicit.
- Related behavior remains intact.
- Builds/type checks/tests pass where applicable; limitations are reported.
- System docs, index links, decisions, and handoff reflect the actual result.
- No secrets, temporary artifacts, or unrelated changes are introduced.

## Documentation-only changes

Check relative links, paths, factual status, and cross-document consistency.
Do not claim runtime validation for a project that has no runtime.
