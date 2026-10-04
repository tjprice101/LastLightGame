# Opening flow

**Status:** implemented browser prototype, 2026-10-03.

## Confirmed request

Create a cinematic introduction title screen, advance on a key or tap to first
character selection, then display a basic opening menu.
The owner delegated language/engine selection and requested repository deployment.

## Implemented behavior

1. Always show the title on initial page load.
2. Any ordinary key, the begin button, or a touch/click on that button advances.
   Tab, modifier keys, Escape, repeated keys, and browser shortcuts do not advance,
   preserving keyboard navigation and browser controls.
3. With no save, show three starter companions adapted from existing art concepts:
   Ember Beginner (fire/sword), Tide Beginner (water/spear), Sprout Beginner (grass/bow).
4. Require explicit selection; then enable "Begin your journey".
5. Commit the starter to local storage before opening the sanctuary menu.
6. On subsequent visits, the title entry continues directly to the saved menu.
7. "Return to title" preserves the save.

## Starter lore and elemental reveals

Selecting a card plays a short, element-specific reveal: rising embers for fire,
an expanding ripple and droplets for water, and swirling leaves for grass.
Each reveal contains 12 decorative motes and one ring, lasts at most 1.3 seconds,
and never blocks selection or confirmation. Switching cards replaces the prior
effect without accumulating particles. Card updates preserve keyboard focus.

Selection displays original lore, an origin, and a personal vow. Ember carries the
last coal of Ashen Vale; Tide searches for Glasswater's missing ferrykeepers;
Sprout carries the hope of Hollowgreen's first new seed. These are editable
prototype stories, not a claim that the wider world/story has been approved.

After a successful first save, the menu plays a companion awakening and opens
the lore panel. Saved-session continuation does not replay that first-arrival
effect; lore remains available through the "Companion lore" disclosure.
Reduced motion hides decorative reveals and disables the portrait animation,
while all lore and controls remain accessible. No save-schema changes are needed.

The menu displays the saved companion. Quests, squad editing, and summoning are
clearly marked coming soon, not interactive features or working battle systems.
No currency, levels, combat stats, accounts, or payment behavior is introduced.

## Local persistence

Key: `last-light.profile`. Format:

```json
{ "version": 1, "starterId": "ember" }
```

Supported IDs: `ember`, `tide`, `sprout`. A corrupt or unsupported save is reported,
not overwritten. Clearing an unreadable save requires explicit confirmation.
A failed write leaves selection open with a visible error. Saves are per browser
and origin; clearing site data removes them. These saves have no monetary value
and must not become authoritative online account state.

## Presentation

Phaser renders a layered landscape, light halo, and 48 bounded ambient motes.
HTML provides responsive menus, semantic buttons, visible focus, and error alerts.
Reduced-motion preferences disable CSS entrance/pulse animations and mote tweens.
There is no audio or imported artwork. SVG portraits are original concept
placeholders with eyes-only faces and each starter's signature motif.
They are not replacements for approved white-canvas production illustrations.

## Where to customize

- [Starter definitions](../src/content/starters.ts): names, text, colors, IDs, lore.
- [Elemental reveals](../src/presentation/reveal.ts): bounded decorative effect markup.
- [Reveal tests](../src/presentation/reveal.test.ts): lore completeness and effect budget.
- [SVG portraits](../src/presentation/portrait.ts): temporary visuals.
- [Backdrop](../src/presentation/backdrop.ts): ambient Phaser scene and tween budget.
- [Screens](../src/main.ts): DOM rendering, inputs, errors, focus.
- [Styles](../src/style.css): responsive layout and cinematic appearance.
- [Journey transitions](../src/game/flow.ts): opening state machine.
- [Profile storage](../src/game/profile.ts): validation and persistence.
- [Tests](../src/game/flow.test.ts): transitions, each starter, invalid saves, write failure.

Changing starter IDs or profile fields requires a save-version/migration decision.
Balance and animations for future attacks belong to separate combat modules,
not the opening-screen renderer.

## Acceptance checks

- Keyboard and pointer can complete all three screens.
- No starter is preselected; confirm remains disabled until selection.
- All starter IDs persist and reload to the correct menu.
- Mobile layout has no horizontal overflow and all controls remain reachable.
- Corrupt saves and unavailable storage produce explicit errors.
- Reduced-motion mode has no looping background animation.
- Page assets resolve under the GitHub Pages repository subpath.
