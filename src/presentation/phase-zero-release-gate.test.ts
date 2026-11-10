// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';
import { getStarter } from '../content/starters';
import { emptyAccount } from '../game/account';
import { stats } from './hub';
import { maxLevelPreview } from './max-level';
import { upgradeResult } from './upgrade-result';

describe('Phase 0 release gate', () => {
  it('keeps legacy ten-stat reference while live upgrade surfaces publish the four Radiant stats', () => {
    expect(phaseZeroStatsReady).toBe(true);
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    const legacy = document.createElement('div');
    legacy.innerHTML = stats(getStarter('ember'));
    for (const label of ['Skill Power', 'Skill Duration', 'Skill Efficiency', 'Elemental Gauge Gain', 'Direct Attack'])
      expect(legacy.textContent).toContain(label);
    for (const html of [maxLevelPreview(account, 'ember').html, upgradeResult(account, account, 'ember', 'level').details ?? '']) {
      const host = document.createElement('div');
      host.innerHTML = html;
      expect(host.textContent).not.toMatch(/Elemental [Dd]amage/);
      for (const label of ['HP', 'Attack', 'Defense', 'Recovery']) expect(host.textContent).toContain(label);
      expect(host.textContent).not.toContain('Skill Power');
    }
    expect(maxLevelPreview(account, 'ember').html.match(/data-radiant-stat=/g)).toHaveLength(4);
  });
});
