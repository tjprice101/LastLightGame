import { describe, expect, it } from 'vitest';
import { creatures, creatureLore, type Creature } from './creatures';
import { calamityBossLore, calamityIntro, enemyLineLore, enemyLore } from './enemy-lore';
import { calamityTierScaling } from './calamity';

const intro = calamityIntro([calamityTierScaling[1].level, calamityTierScaling[2].level, calamityTierScaling[3].level]);
const individual = creatures.filter(creature => !creature.mode && !creature.calamity);

describe('authored enemy bestiary lore', () => {
  it('authors every individual enemy, with no unused entries', () => {
    expect(individual).toHaveLength(115);
    for (const creature of individual) expect(enemyLore[creature.id], creature.id).toContain(creature.name);
    expect(Object.keys(enemyLore).sort()).toEqual(individual.map(creature => creature.id).sort());
  });

  it('keeps every lore string unique except within the six declared lines', () => {
    const outside = creatures.filter(creature => !creature.mode).map(creatureLore);
    expect(new Set(outside).size).toBe(outside.length);
    const lines = Object.keys(enemyLineLore);
    expect(lines.sort()).toEqual(['abyss', 'heavens', 'machines', 'roses', 'sanctuary', 'treasury']);
    for (const line of lines) {
      const forms = creatures.filter(creature => creature.mode === line);
      expect(forms, line).toHaveLength(6);
      for (const form of forms) expect(creatureLore(form).startsWith(enemyLineLore[line as keyof typeof enemyLineLore])).toBe(true);
    }
    expect(new Set(Object.values(enemyLineLore)).size).toBe(6);
    expect(new Set(Object.values(enemyLore)).size).toBe(Object.keys(enemyLore).length);
  });

  it('gives Calamity bosses a shared intro with mechanical facts and distinct unique lines', () => {
    const bosses = creatures.filter(creature => creature.calamity);
    expect(bosses).toHaveLength(12);
    expect(intro).toContain(String(calamityTierScaling[3].level));
    expect(intro).toContain('none can be captured or recruited');
    for (const boss of bosses) {
      const lore = creatureLore(boss);
      expect(lore.startsWith(intro)).toBe(true);
      expect(lore).toContain(calamityBossLore[boss.calamity!]);
      expect(calamityBossLore[boss.calamity!]).toContain(boss.name);
    }
    expect(new Set(Object.values(calamityBossLore)).size).toBe(12);
  });

  it('throws loudly when a creature lacks authored lore', () => {
    const real = individual[0];
    const fake: Creature = { ...real, name: 'Unwritten Devourer' };
    expect(() => creatureLore(fake)).toThrow(/Missing authored lore/);
  });

  it('avoids stock filler phrasing', () => {
    const banned = /testament to|\bweaves?\b|tapestry|embodies|ethereal|whispers of|\bdelve|\brealm|beacon of|\u2014/i;
    for (const creature of creatures) expect(creatureLore(creature), creature.id).not.toMatch(banned);
  });
});
