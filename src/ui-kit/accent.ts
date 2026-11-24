/**
 * The interface accent channel (D-496, D-497): the colour the living scene uses for its light is also the
 * interface accent. `--ui-accent` is registered in `interface.css`, so a change fades instead of snapping.
 */
export function applyAccent(root: { style: Pick<CSSStyleDeclaration, 'setProperty'> }, accent: string): void {
  if (!/^#[0-9a-f]{6}$/i.test(accent)) throw new Error('The interface accent must be a six-digit hex colour.');
  root.style.setProperty('--ui-accent', accent);
}
