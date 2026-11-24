import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The menu rebuild (D-497) replaces the legacy stylesheets screen by screen. These ceilings only ever go
 * down: when a step deletes legacy CSS, lower them to the new counts in the same commit. Raising one
 * means new work was added to a stylesheet that is scheduled for deletion instead of to `src/ui-kit`.
 */
const ceiling = { files: 86, important: 6835, guards: 1144 };

function legacyCss(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'ui-kit' ? [] : legacyCss(path);
    return entry.name.endsWith('.css') ? [path] : [];
  });
}
const count = (files: string[], needle: string) =>
  files.reduce((sum, file) => sum + readFileSync(file, 'utf8').split(needle).length - 1, 0);

describe('legacy stylesheets only shrink', () => {
  const files = legacyCss(join(process.cwd(), 'src'));
  it('adds no legacy stylesheet', () => expect(files.length).toBeLessThanOrEqual(ceiling.files));
  it('adds no !important outside the kit', () => expect(count(files, '!important')).toBeLessThanOrEqual(ceiling.important));
  it('adds no :not(#_) guard outside the kit', () => expect(count(files, ':not(#_)')).toBeLessThanOrEqual(ceiling.guards));
});
