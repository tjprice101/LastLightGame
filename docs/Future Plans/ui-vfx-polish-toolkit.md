# UI and VFX visual overhaul (filed 2026-11-20)

**Status:** Phase 1 (shader foundation and battle) approved 2026-11-23 (D-494)
and released 2026-11-23. Phases 2 (summons) and 3 (menus) approved 2026-11-24
(D-495, plan in §9); step S1 implemented, unreleased. Sound remains proposed, not approved.

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
| R2 | Opus | Interface accent channel (`@property`, 600 ms), per-activity scenes, frame-time check (release) | Not started |
| R3 | Opus | Glass tokens, `src/styles/luxury.css`, shell and dialogs, `arrival.ts`, `ui-fx.ts` action feedback with `kick` (release) | Not started |
| R4 | Opus | Battle atmosphere layer over the arena art; hit pulse by tier (release) | Not started |
| R5 | Fable, then Opus and Sonnet | Summons S2 to S6 (section 9), over the astral scene | Not started |
| R6 | Sonnet | Per-screen passes (former M3 to M8), most-used first | Not started |
| R7 | Sonnet | Performance, dead CSS cleanup, full validation | Not started |

This replaces Phase 3 steps M1 and M2 in section 9 (R1 to R3 cover them) and
moves the summon steps after R4. Scene details:
[menus spec](../menus-and-inventory.md#living-scene-backdrop-d-496-2026-11-24).
