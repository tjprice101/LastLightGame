# UI and VFX visual overhaul (filed 2026-11-20)

**Status:** Phase 1 (shader foundation and battle) approved 2026-11-23 (D-494)
and released 2026-11-23. Phases 2 (summons) and 3 (menus) approved 2026-11-24
(D-495, plan in §9); step S1 implemented, unreleased. Living scenes framework
approved 2026-11-24 (D-496, §10); **complete menu rebuild approved 2026-11-24
(D-497, §11), which sets the current step order.** Sound remains proposed, not approved.

**Timing:** pick up **after** the current Battle Flurry work: B3c, B4, B5, the
single enemy retune and that release (D-493).

Filing is not approval to add dependencies or spend money.

## 1. Owner direction (2026-11-20)

**Goal.** Make battles, effects, summons and menus look exciting and visually
stunning, like top gacha games (reference: Duet Night Abyss):
- bright glow and bloom at the screen edges on big moments;
- flashes and shine around newly acquired items;
- stylized, consistently formatted menus on dynamic, luxurious backgrounds.

Characters stay static cel cutouts. Animating the characters themselves is
**not** a goal.

**Visual inspirations.** Inspiration only; never copy either game's assets,
sprites or exact look.
- **Terraria Calamity mod (visuals):** bright, saturated additive bloom;
  layered glowing trails and beams; screen-wide shader moments; readable attack
  wind-ups.
- **Brave Frontier (game style):** battle rhythm and hit counters, drop pour,
  burst cut-ins, gacha menu flow.

**Identity.** Original Last Light look: Jewel & Gold (D-461), the six elements,
Lora and Cinzel type tokens.

**Decisions.**
- **Shaders:** original GLSL written for Last Light. MagnumOpus shader code is
  **not** ported (owner: some of it was poorly done).
- **Shader model:** the owner suggested Fable for shader authoring, if it gives
  the most stunning results. Recommend it at the start of that work, with its
  cost; routine wiring and UI can run on Opus or Sonnet.
- **Textures:** the owner's MagnumOpus textures stay approved for reuse (D-482),
  without MagnumOpus motifs.

## 2. Approach

- **No engine change.** Phaser 3 (WebGL battle and spectacle layer) plus the
  HTML menus can do all of it.
- **Live-first.** Build in the real game, screen by screen. No demo pages.
- **Reuse foundations:** `reward-screen.ts`, `summon-presentation.ts`,
  `conduit-presentation.ts`, `luster.ts`, `src/vfx/spectacle-scene.ts`,
  `tools/intake_vfx_library.py`.
- **Effect contract:** finite, pointer-transparent, disposable; a static version
  under Reduce motion; Skip and focus preserved.
- **Validation:** judge motion over time with
  `tools/capture_frames.mjs --stream`, not a still frame.

## 3. Phases

1. **Battle effects**
   - Original shaders: screen-edge light bursts, bloom, radial blur and god rays
     on Convergent Light, a chromatic flash on critical hits, per-element
     distortion (Infernic heat, Oceanic ripple, and so on).
   - Richer layered effects for Normal Attacks, Skill 1, Skill 2, Convergent
     Light, critical hits and Conduit triggers, using the noise and gradient
     textures.
   - Motion that makes static cutouts feel alive: lunges, squash and stretch,
     white hit-flashes, afterimages, recoil, camera punch and shake, hit-stop.
2. **Summons**
   - A full-screen WebGL sequence with the same shaders: portal charge, light
     shafts, rarity escalation, burst, card reveal with a shine sweep.
   - Result cards choreographed in HTML.
3. **Menus**
   - A rigorous live redesign pass, screen by screen.
   - Edge glows, shine sweeps, jewel panels, animated gold frames, luxurious
     moving backgrounds, smooth consistent transitions.
4. **Sound** (alongside phases 1-3): impact, whoosh and summon rise sounds.

## 4. Recommended stack

| Area | Tool | Cost |
|---|---|---|
| Battle and summon effects | Phaser 3: built-in FX, particle emitters, custom GLSL shaders | Free; already a dependency |
| Effect textures | Owner's MagnumOpus textures; glow shapes generated in code | Free |
| Menu styling | Modern CSS | Free |
| Menu and summon choreography | GSAP | Free; new dependency, needs owner approval |
| Authored UI set pieces (optional) | Rive free tier | Free; new dependency, needs owner approval |
| High-end fire, smoke and energy art (optional) | JangaFX EmberGen | Paid; only if code-built effects look thin |

## 5. Materials: MagnumOpus library (audited 2026-11-20)

`tools/intake_vfx_library.py` has installed 121 textures so far. Still unused:
- **VFX Asset Library (about 186 PNGs):** 19 noise textures (distortion,
  flowing energy, dissolves), 12 colour gradients (palette ramps for
  per-element tinting), plus more beams, trails, impacts and glows.
- **Theme Specific (104 PNGs):** usable after removing MagnumOpus motifs (music
  notes, clefs, the eye, laurels, music waves).
- **Shaders (about 327 HLSL files):** not ported (see Decisions).

## 6. Tool catalog

### Free

| Tool | What it gives Last Light | Notes |
|---|---|---|
| Phaser 3 built-in FX (3.60+) | Glow, bloom, shine, vignette, barrel and gradient effects; particle emitters | Already a dependency. |
| Custom GLSL shaders in Phaser | Any screen or object effect | Written for Last Light. |
| Modern CSS | Edge glows (inset shadows and radial gradients with `mix-blend-mode: plus-lighter`), shine sweeps, frosted panels (`backdrop-filter`), animated gradient frames (`@property`), parallax layers | No dependency. The B3b bonus-tag sheen is a small example. Respects `html[data-motion="reduced"]`. |
| Web Animations API | Scripted menu timelines without a library | Built into browsers. |
| GSAP | Standard animation timelines: staggered reveals, count-ups, eased choreography | Free, including its former paid plugins. |
| Rive runtime + free editor tier | Designed, interactive UI animations | Open-source runtime; animations are made in the Rive editor, which needs a person. |
| Lottie (lottie-web) | Plays vector animations exported from other tools | Free player; authoring usually needs a paid tool. |
| Effekseer | Particle VFX editor with a WebGL runtime | Free, open source; needs a person in the editor. |
| tsParticles | Particles for menu backgrounds | Free (MIT); only if CSS and Phaser fall short. |
| Kenney particle and VFX packs | Starter glow, spark and smoke textures | CC0; neutral shapes, tint per element. |

### Paid (reference only; each needs explicit owner approval)

Prices change; check each vendor's current page before deciding. Figures are
approximate (2026-11-20 search).

| Tool | What it is | Approximate cost | Fit for this goal |
|---|---|---|---|
| JangaFX EmberGen | Fire, smoke, lightning and energy simulation exported as flipbook sprite sheets | About $300 first year (Indie, under $1M revenue); optional maintenance about $180/year; licence kept | Optional. Needs a person in the editor (guided settings possible); Claude cannot reliably operate it. |
| Rive paid tiers | More editor features and seats | From about $9 per seat per month | Not recommended now; code covers it. |
| Spine | 2D skeletal animation for characters and reveals; official Phaser runtime | One-time licence (Essential about $69, Professional about $299) | Not recommended: characters stay static; needs layered character art. |
| Live2D Cubism | Animated, breathing character portraits | Free edition with limits; paid PRO | Not recommended for the same reason. |
| Adobe After Effects + Lottie | Classic web UI motion authoring | Subscription | Not needed. |
| VFX texture and UI packs | Ready-made textures | Varies | Optional; licence must allow web games; neutral shapes only. |
| TexturePacker | Sprite sheet packing | Free basic mode; paid Pro | Optional. |

## 7. Restart gate

After the D-493 release: an owner-approved scope in a fresh session in Plan
mode. That session confirms:
- which phase and screen go first;
- the model (Fable for shader authoring, if chosen);
- any new dependencies (GSAP, Rive);
- any paid tools.

## 8. Phase 1 plan (approved 2026-11-23, D-494)

Owner answers: shader foundation and battle first; Fable writes shaders only;
no GSAP yet; the Spectacle steps 2-7 feel review is folded in; no paid tools.

| Step | Model | Work | Status |
|---|---|---|---|
| 1 | Sonnet | Baseline captures of every tier; owner feel review and `?spectacle-stats` check of the hosted build | Captures done 2026-11-23; owner review pending |
| 2 | Fable | Shader kit: bloom, edge bloom, god rays, critical ring, six element veils; safety guards; tests | Implemented 2026-11-23, unreleased |
| 3 | Opus | Wire overlays into the tiers: Skill 1 veil, Skill 2 soft edge bloom and veils, Convergent Light god rays and edge bloom by tier, critical ring, Conduit callout pulse, boss special edge bloom | Implemented 2026-11-23, unreleased |
| 4 | Sonnet | Tune intensity per element; apply the feel review items; phone portrait and low quality | Not started |
| 5 | Sonnet | Docs, commit, push both branches, hosted check (client only) | Not started |

Details: [combat spec](../combat.md#battle-spectacle-shader-kit-d-494-overhaul-phase-1).
Limit: shaders add light over the DOM cutouts; they cannot warp them.

## 9. Phases 2 and 3 plan (approved 2026-11-24, D-495)

Owner answers: both phases planned in full, summons first; the WebGL sequence
replaces the DOM cinematic for summons; a test-only capture harness; Fable for
new GLSL only; non-blocking menu arrival (refines D-406); a shader backdrop;
no GSAP; most-used menus first; no paid tools; sound out of scope.

**Phase 2: Summons**

| Step | Model | Work | Status |
|---|---|---|---|
| S1 | Opus | Share the spectacle runtime outside battle: `src/vfx/spectacle-runtime.ts` owner claiming, a UI clock (no battle speed), a full-screen frame, layering above the sequence backdrop; DOM cinematic fallback | Implemented 2026-11-24, unreleased |
| S2 | Fable | Summon GLSL: `portal` vortex and `shockwave` ring in the kit; tier palettes from existing tokens | Not started |
| S3 | Opus | `summon-sequence.ts` and `summon-cinematic.ts`: charge, escalation, burst, then the revealed dialog; skip, inert, Reduce motion, fallback | Not started |
| S4 | Sonnet | Result cards in the dialog: card rise and flip in the wave, element edge glow and shine on 5★, 6★ and bonus cards | Not started |
| S5 | Sonnet | `tools/capture_summon.mjs` with fixture receipts (dev server only) | Not started |
| S6 | Sonnet | Tune, docs, commit, push both branches, hosted check (client only) | Not started |

**Phase 3: Menus**

| Step | Model | Work | Status |
|---|---|---|---|
| M1 | Opus | Foundation: semantic tokens, `src/styles/luxury.css` (jewel panel, gold frame, edge glow, shine), `src/presentation/arrival.ts` | Not started |
| M2 | Fable + Opus | Shader backdrop replacing `backdrop.ts`; per-screen palettes; sleeps in battle and when hidden; 30 fps; CSS fallback (release) | Not started |
| M3 | Sonnet | Home and dock | Not started |
| M4 | Sonnet | Summon hub and banner showcase (release) | Not started |
| M5 | Sonnet | Team, character, squad, Conduits | Not started |
| M6 | Sonnet | Play: activities, events, Calamity, Rose (release) | Not started |
| M7 | Sonnet | Inventory, Stores, Collections | Not started |
| M8 | Sonnet | Profile, Social, Settings, dialogs, receipts | Not started |
| M9 | Sonnet | Performance, proven-dead CSS cleanup, full validation (release) | Not started |

Limits: shaders add light only and cannot draw over the top-layer reward
dialog; the backdrop sleeps while a summon or battle owns the spectacle layer.
Moon/Sunshade stay inactive; Story stays paused.

## 10. Living scenes framework (approved 2026-11-24, D-496)

The owner's other game, Magnum Opus REBORN, is the visual target. A read-only
audit (2026-11-24) found five parts, all small:

1. **Living scenes:** one full-screen shader per context, built as a shared
   library plus a scene plus a shared finish (vignette, soft tonemap, grain).
   Particles, mist and rays are drawn in the shader. No image art.
2. **One palette per context:** three colours (deep, mid, accent) feed the
   scene and the interface accent, which fades over 600 ms.
3. **One glass surface:** translucent dark gradient, warm gold hairline,
   14px blur, inner top highlight. Nested tiles use inset hairlines. State
   drives glow (actionable, selected, locked).
4. **The world reacts:** each action layers a ring, a burst, a number and a
   decaying pulse through the scene.
5. **Slow ambient motion** on focal objects; a short fade-and-rise on arrival.

Owner answers: framework first, summons after; glass replaces solid jewel
surfaces (amends D-461); battles keep painted arenas plus a live atmosphere;
REBORN's structure with scenes written new for Last Light. Kept: Lora/Cinzel,
gold frames, element accents, neutral text, Reduce motion, WebGL 1, no GSAP.

| Step | Model | Work | Status |
|---|---|---|---|
| R0 | Fable | Reference captures of REBORN | Done 2026-11-24 |
| R1 | Fable | `src/scene/`: shader library, ten scenes, engine, backdrop replaced, tests, `tools/capture_scenes.mjs` | Implemented 2026-11-24, unreleased |
| R2 | Opus | Interface accent channel (`@property`, 600 ms), frame-time check | Becomes K1 (section 11) |
| R3 | Opus | Glass tokens, shell and dialogs, arrival, action feedback with `kick` | Becomes K2 to K4 in `src/ui-kit/` (section 11) |
| R4 | Opus | Battle atmosphere layer over the arena art; hit pulse by tier (release) | Not started; after the menu rebuild (D-497) |
| R5 | Fable, then Opus and Sonnet | Summons S2 to S6 (section 9), over the astral scene | Not started; after R4 |
| R6 | Sonnet | Per-screen passes (former M3 to M8), most-used first | Becomes G1 to G5 (section 11) |
| R7 | Sonnet | Performance, dead CSS cleanup, full validation | Becomes K-final (section 11) |

This replaces Phase 3 steps M1 and M2 in section 9 (R1 to R3 cover them) and
moves the summon steps after R4. Scene details:
[menus spec](../menus-and-inventory.md#living-scene-backdrop-d-496-2026-11-24).

## 11. Complete menu rebuild (approved 2026-11-24, D-497)

**Why:** an audit of both games (2026-11-24) found that REBORN looks clean
because it is small and strict (about 1,900 lines: one glass panel, one
accent, one screen template). Last Light's menus are ten theme layers that
override each other: 16,687 lines of CSS in 89 files, 6,819 `!important`,
1,144 `:not(#_)` guards, four dialog families and three button systems. The
R1 scene is also hidden on every signed-in menu by the opaque shell
background in `src/presentation/menu-reference.css`.

**Owner decisions (D-497):** clean rebuild on one new design system, with old
stylesheets deleted as screens move over; layouts redesigned too; menus
before battle atmosphere and summons; staged releases; feedback only on
saved success (no burst on every click); header and dock collapse toggles
removed; menus follow the device's reduce-motion setting as well as the
in-game one.

### Isolation rule

Cascade layers cannot protect new styles from legacy `!important`, so new
markup never uses a legacy class name.

- New root `.lk-shell` replaces `.shell.sanctuary-shell` in `frame()`
  (`src/main.ts`). All new markup uses the `lk-` prefix. Kit CSS is
  unlayered, with no `!important` and no `:not(#_)`.
- A screen that has not been rebuilt renders inside a legacy host,
  `<div class="shell sanctuary-shell lk-legacy">`, so its old CSS still
  matches. A `migratedPages` set in `renderMenu()` picks the wrapper.
- Header and dock are re-emitted as `lk-topbar` and `lk-dock`, keeping every
  `data-page`, `data-menu-back`, `#open-settings`, `#sanctuary-help` and
  balance id. The dock keeps its six destinations.
- Kit imports go after the last legacy import. Legacy import lines keep their
  place and order until their files are deleted (tests pin the order).

### The kit: `src/ui-kit/`

| File | Contents |
|---|---|
| `kit.css` | Glass panel, card and its states, stat, screen head, grid, divider, filigree |
| `controls.css` | Buttons, icon button, chip, segmented control, bar, input, select |
| `shell.css` | Shell, top bar, dock, stage |
| `overlay.css` | Dialog, drawer, toast, tooltip |
| `motion.css` | Arrival and feedback keyframes; the one reduced-motion block |
| `legacy-host.css` | Temporary bridge; deleted in K-final |
| `html.ts` | String helpers: `screen`, `panel`, `card`, `grid`, `statRow`, `stat`, `button`, `iconButton`, `segmented`, `chip`, `bar`, `divider`, `dialogFrame` |
| `motion.ts` | `motionAllowed()`: in-game setting or device setting; writes `html[data-motion-effective]` |
| `accent.ts` | Interface accent channel fed by the scene palette |
| `fx.ts` | `actionFx` (ring, sparks, exact number, scene `kick`) and `countUp` |

Tokens stay in `src/interface.css`. Every rebuilt screen uses one template:
Cinzel title, one flavour line, actions top right, a stat row, then card
grids with element accents, a glow on actionable items and dimmed locked
items. Blur is used on the top bar, dock, panels and dialogs only.

### Steps

| Step | Was | Model | Work | Status |
|---|---|---|---|---|
| K0 | none | Sonnet | This section, D-497, handoff | Done 2026-11-24 |
| K1 | R2 | Opus | Glass and accent tokens, `@property` accent, `accent.ts`, `motion.ts`, `accentFor` | Implemented 2026-11-24, unreleased |
| K2 | R3 | Opus | Kit CSS and `html.ts`; kit contract test; legacy `!important` ratchet test | Implemented 2026-11-24, unreleased |
| K3 | R3 | Opus | Shell swap, scene visible behind menus, glass bridge for legacy interiors, compact mode, collapse toggles removed, click burst and pop entrances removed, CSS arrival, `fx.ts` with `kick` | Implemented 2026-11-24, unreleased. Old screens keep their own entrances until rebuilt; frame time not measured |
| K4 | R3 | Sonnet | One dialog, drawer and toast frame | Implemented 2026-11-24 (`overlay.css`; toast on the same glass tokens); not checked in a browser |
| Release 1 | | Sonnet | Scene, glass and new shell on every screen (also ships S1 and R1) | Not started |
| G1 | R6 | Opus | Home and Play (one activity group at a time). Release 2 | Not started |
| G2 | R6 | Opus | Team hub, Element-Bearer detail and upgrade, squad, loadouts, Conduits, captured Devourers. Release 3 | Not started |
| G3 | R6 | Sonnet | Summon hub (not the sequence) and Inventory. Release 4 | Not started |
| G4 | R6 | Sonnet | Stores, Conduit Store and Upgrade, Collections, Glossary, Codex | Not started |
| G5 | R6 | Sonnet | Profile, Social, Settings, opening screens. Release 5 with G4 | Not started |
| K-final | R7 | Sonnet | Delete the remaining legacy layers, performance pass. Release 6 | Not started |
| then | R4, R5 | Opus; Fable for GLSL | Battle atmosphere, then summons S2 to S6 | Not started |

Each group deletes its own stylesheets and luster helpers after a class-name
search confirms nothing else uses them, and updates the tests that read CSS
text in the same commit. Per-screen intents come from the committed sections
7.1 to 7.20 of the [audit plan](living-world-ui-audit-plan.md).

**Validation per step:** `npx tsc --noEmit`; `npx vitest run src/ui-kit src/scene`
plus the navigation and settings tests; `tools/capture_scenes.mjs --ui` (also
`--reduced`, `--low`) to see the scene behind signed-in menus;
`tools/capture_frames.mjs` to confirm arrival settles under 250 ms with input
live at once. Full `npm test` and build before each release. The owner's feel
review of the hosted game gates the next group.

**Open:** blur and accent-fade cost is unmeasured (K3 measures it; no blur is
the fallback); no phone or low-end GPU check; the 960px minimum width
(D-463) and a graphics-quality option remain owner decisions.
