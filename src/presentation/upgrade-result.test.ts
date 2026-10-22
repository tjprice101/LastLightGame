import { describe, expect, it } from 'vitest';
import { emptyAccount, ownedProgress } from '../game/account';
import { createCreatureCopy, resolveCapturedFighter } from '../game/character-instances';
import { resolveFighter } from '../content/combat';
import { upgradeResult } from './upgrade-result';
import { statChange } from './stat-change';
import { characterArt } from '../content/character-art';
import { phaseZeroStatKeys } from '../content/phase-zero-stats';

describe('saved upgrade stat results', () => {
  it('shows all ten actual equipped stats for a single level without changing either account', () => {
    const before = emptyAccount();
    before.characters.ember = { level: 0, evolution: 1, weaponRank: 2 };
    before.conduits = { 'vigil-core': 1 };
    before.conduitEquipment = { ember: ['vigil-core', null, null, null, null, null, null, null] };
    const after = structuredClone(before);
    after.characters.ember = { ...ownedProgress(before, 'ember'), level: 1 };
    const snapshot = structuredClone({ before, after });
    const result = upgradeResult(before, after, 'ember', 'level');
    const from = resolveFighter('ember', before.characters.ember, before.conduitEquipment.ember).stats;
    const to = resolveFighter('ember', after.characters.ember, after.conduitEquipment?.ember).stats;
    expect(result.title).toBe('Level up!');
    expect(result.savedLabel).toBe('Upgrade saved');
    expect(result.details).toContain('Level 0 → 1');
    const keys = phaseZeroStatKeys;
    const changed = keys.filter(key => from[key] !== to[key]);
    expect(changed.length).toBeGreaterThan(0);
    expect(result.details.match(/<article /g)).toHaveLength(changed.length);
    expect(result.details.match(/<li>/g) ?? []).toHaveLength(10 - changed.length);
    expect(result.details).toContain(statChange(from.health, to.health));
    expect(result.details).not.toContain('&rarr; <b class="stat-change stat-change--unchanged"');
    expect(result.details).not.toContain('>+0x<');
    expect(result.details).not.toContain('>+0<');
    expect(result.art).toContain(`characters/${characterArt('ember').art}.png`);
    expect({ before, after }).toEqual(snapshot);
  });

  it('uses the saved evolved portrait and retained level rather than predicting a level increase', () => {
    const before = emptyAccount();
    before.characters.ember = { level: 30, evolution: 1 };
    const after = structuredClone(before);
    after.characters.ember = { ...ownedProgress(before, 'ember'), evolution: 2 };
    const result = upgradeResult(before, after, 'ember', 'evolve');
    expect(result.title).toBe('Evolution complete');
    expect(result.details).toContain('Level 30 → 30 · Evolution 1 → 2');
    expect(result.art).toContain(`characters/${characterArt('ember', 2).art}.png`);
    expect(result.name).not.toBe(upgradeResult(before, before, 'ember', 'level').name);
  });

  it('shows the entire Max Level increase from confirmed accounts', () => {
    const before = emptyAccount();
    before.characters.tide = { level: 3, evolution: 1 };
    const after = structuredClone(before);
    after.characters.tide = { ...ownedProgress(before, 'tide'), level: 17 };
    const result = upgradeResult(before, after, 'tide', 'level');
    expect(result.details).toContain('Level 3 → 17');
    expect(result.details).toContain(statChange(resolveFighter('tide', before.characters.tide).stats.damage,
      resolveFighter('tide', after.characters.tide).stats.damage));
  });

  it('supports single and bulk captured-copy leveling with that copy’s actual stats and identity', () => {
    const before = emptyAccount();
    const copy = createCreatureCopy('infusion:heavens:0', 1, 50);
    before.capturedCharacters = [copy];
    for (const level of [51, 60]) {
      const after = structuredClone(before);
      after.capturedCharacters![0].level = level;
      const result = upgradeResult(before, after, copy.instanceId, 'level');
      expect(result.name).toContain('Copy 1');
      expect(result.details).toContain(`Level 50 → ${level}`);
      expect(result.details).not.toContain('Evolution');
      expect(result.details).toContain(statChange(resolveCapturedFighter(copy).stats.health,
        resolveCapturedFighter(after.capturedCharacters![0]).stats.health));
      expect(result.art).toContain('enemies/');
    }
  });

  it('rejects missing ownership rather than displaying a success-shaped preview', () => {
    expect(() => upgradeResult(emptyAccount(), emptyAccount(), 'ember', 'level')).toThrow('Owned Element-Bearer');
    expect(() => upgradeResult(emptyAccount(), emptyAccount(), 'capture:missing', 'level')).toThrow('owned captured copy');
  });

  it('labels genuinely unchanged stats neutrally without inventing a boost', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 1, evolution: 1 };
    const result = upgradeResult(account, structuredClone(account), 'ember', 'level');
    expect(result.details).not.toContain('<article ');
    expect(result.details).toContain('No stat changes.');
    expect(result.details.match(/stat-change--unchanged">Unchanged/g)).toHaveLength(1);
    expect(result.details.match(/<li>/g)).toHaveLength(10);
    expect(result.details).toContain('<li><span>Critical Damage Multiplier</span>');
    expect(result.details).not.toContain('stat-change--increase');
  });

  it('keeps portrait art and the level badge in separate blocks so text never overlaps the art', () => {
    const before = emptyAccount();
    before.characters.ember = { level: 4, evolution: 1 };
    const after = structuredClone(before);
    after.characters.ember = { level: 5, evolution: 1 };
    const result = upgradeResult(before, after, 'ember', 'level');
    expect(result.art).toMatch(/^<div class="upgrade-result-portrait">/);
    expect(result.art).not.toContain('Level');
    expect(result.details).toContain('<span class="upgrade-result-level">Level 4 → 5</span>');
  });
});
