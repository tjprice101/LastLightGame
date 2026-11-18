import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { radiantKitText } from '../content/radiant-kit-text';
import { radiantKits, type RadiantKitEffect, type RadiantKitId } from '../content/radiant-kits';
import { radiantBearerKits, radiantLeaderEffects, type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import { radiantFlareText, radiantLeaderSkillText, radiantSkillText, renderRadiantKitText } from './kit-text';

/** Approved bullets from the Phase 3 drafts: `- Skill 1, Name (25): text` and similar, joined across wrapped lines. */
function approvedKits(): Record<string, Record<string, { name: string; text: string }>> {
  const doc = readFileSync(resolve(__dirname, '../../docs/Future Plans/battle-flurry-reference/phase3-kit-drafts.md'), 'utf8');
  const kits: Record<string, string[]> = {};
  let id: string | null = null;
  for (const line of doc.split(/\r?\n/)) {
    const heading = line.match(/^### .*\(`([a-z]+)`\)/);
    if (heading) { id = heading[1]; kits[id] = []; continue; }
    if (/^## /.test(line)) { id = null; continue; }
    if (!id) continue;
    if (line.startsWith('- ')) kits[id].push(line.slice(2));
    else if (/^ {2}\S/.test(line) && kits[id].length) kits[id][kits[id].length - 1] += ` ${line.trim()}`;
  }
  return Object.fromEntries(Object.entries(kits).map(([key, bullets]) => [key, Object.fromEntries(bullets.flatMap(bullet => {
    const match = bullet.match(/^(Passive|Skill 1|Skill 2|Convergent Light|Leader), (.+?)(?: \((?:25|40)\))?: (.*)$/);
    return match ? [[match[1], { name: match[2], text: match[3] }]] : [];
  }))]));
}
/** Editorial notes in the drafts that are not tooltip text, and one draft inconsistency (D-479). */
function tooltip(text: string): string {
  const cleaned = text.replace(/\*\*/g, '')
    .replace(/ Renamed from the old .*$/, '')
    .replace(/ This differs from Crinso's alternating Combo\.$/, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
const ids = Object.keys(radiantKits) as RadiantKitId[];
const pct = (value: number) => `${Number((value * 100).toFixed(2))}%`;
const token = (value: number) => String(Number((value * 100).toFixed(2)));
const formOne = (id: RadiantBearerId): RadiantLoadout => ({ id, starter: id, level: 1, form: 1, convergenceRank: 1,
  weaponRank: 0, ascension: {}, masterId: null });

describe('Phase 3 kit text (D-479)', () => {
  const approved = approvedKits();

  it('covers every released bearer with approved text', () => {
    expect(Object.keys(radiantKitText).sort()).toEqual([...ids].sort());
    expect(Object.keys(approved).sort()).toEqual([...ids].sort());
  });

  it.each(ids)('%s matches the approved drafts word for word', id => {
    const doc = approved[id], kit = radiantKits[id];
    expect(doc['Skill 1'].name).toBe(kit.skill1.name);
    expect(doc['Skill 2'].name).toBe(kit.skill2.name);
    expect(doc["Convergent Light"].name).toBe(kit.flare.name);
    expect(doc.Passive.name).toBe(kit.passive.name);
    expect(doc.Leader.name).toBe(radiantBearerKits[id].leader);
    expect(radiantSkillText(id, 1)).toBe(tooltip(doc['Skill 1'].text));
    expect(radiantSkillText(id, 2)).toBe(tooltip(doc['Skill 2'].text));
    // Aurora's draft says 8 hits, but every Ultimate Flare resolves 12 hits (N3), so the tooltip shows 12.
    expect(radiantFlareText(id, 'ultimate')).toBe(tooltip(id === 'aurora' ? doc["Convergent Light"].text.replace('8-hit', '12-hit') : doc["Convergent Light"].text));
    expect(radiantLeaderSkillText(formOne(id))).toBe(tooltip(doc.Leader.text));
    expect(kit.passive.description).toBe(tooltip(doc.Passive.text));
  });

  it.each(ids)('%s text carries every number in its kit data', id => {
    const kit = radiantKits[id], text = radiantKitText[id];
    const effectNumbers = (effects: readonly RadiantKitEffect[]) => effects.flatMap(effect =>
      effect.kind === 'signature' || effect.kind === 'cleanse' || effect.kind === 'ignore-defense' || effect.kind === 'damage-bonus'
        ? [] : [{ kind: effect.kind, value: effect.value, perStack: effect.perStack }]);
    for (const slot of ['skill1', 'skill2'] as const) {
      const def = kit[slot], line = text[slot];
      if (def.hits) expect(line).toContain(`${def.hits}-hit`);
      if (def.power) expect(line).toContain(pct(def.power));
      if (def.alt) expect(line).toContain(pct(def.alt.power));
      if (def.perStack) expect(line).toContain(`+${pct(def.perStack)}`);
      for (const effect of effectNumbers(def.effects)) {
        expect(line).toContain(effect.kind === 'fill' ? `+${effect.value}` : pct(effect.value));
        if (effect.perStack) expect(line).toContain(`+${pct(effect.perStack)}`);
      }
    }
    const flare = kit.flare, line = text.flare;
    if (flare.target !== 'none') { expect(line).toContain('{h}-hit'); expect(line).toContain(`{d:${token(flare.power)}}`); }
    if (flare.alt) expect(line).toContain(`{d:${token(flare.alt.power)}}`);
    if (flare.perStack) expect(line).toContain(`+{d:${token(flare.perStack)}}`);
    for (const effect of effectNumbers(flare.effects)) {
      expect(line).toContain(effect.kind === 'fill' ? `{f:${effect.value}}` : `{e:${token(effect.value)}}`);
      if (effect.perStack) expect(line).toContain(`+{e:${token(effect.perStack)}}`);
    }
    for (const entry of radiantLeaderEffects(formOne(id)))
      expect(text.leader).toMatch(new RegExp(`\\{(l:${token(entry.amount).replace('.', '\\.')}|ln:${Number(entry.amount.toFixed(2))})\\}`));
  });

  it('scales Flare text by tier: damage, effects and hits change, durations do not', () => {
    expect(radiantFlareText('ember', 'sparkling')).toBe(
      '4-hit Infernic attack on all enemies (450%), adds Burn (70% Attack per turn, 3 turns), boosts Attack of all allies (+35%, 3 turns).');
    expect(radiantFlareText('ember', 'glimmering')).toBe(
      '8-hit Infernic attack on all enemies (675%), adds Burn (85% Attack per turn, 3 turns), boosts Attack of all allies (+42.5%, 3 turns).');
    expect(radiantFlareText('disciple', 'sparkling')).toContain('(+18)');
    expect(radiantFlareText('atmoso', 'sparkling')).toContain('at 1.5 times damage');
    expect(radiantFlareText('razor', 'glimmering')).toContain('(2.25 times the Wounds spent)');
  });

  it('scales Leader text with form', () => {
    expect(radiantLeaderSkillText({ ...formOne('ember'), form: 6 })).toBe(
      'Boosts Normal Attack damage of Infernic allies (+30%), boosts Burn damage of Infernic allies (+22.5%).');
    expect(radiantLeaderSkillText({ ...formOne('atmoso'), form: 6 })).toContain('fills 3 extra Luminosity');
  });

  it('rejects unknown tokens', () => {
    expect(() => renderRadiantKitText('deals {x:5}')).toThrow('Unresolved kit text token.');
  });
});
