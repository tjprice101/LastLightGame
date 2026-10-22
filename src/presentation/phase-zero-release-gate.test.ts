// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';
import { getStarter } from '../content/starters';
import { emptyAccount } from '../game/account';
import { stats } from './hub';
import { maxLevelPreview } from './max-level';
import { upgradeResult } from './upgrade-result';

describe('Phase 0 release gate', () => {
  it('publishes the ten verified stats across shared upgrade surfaces', () => {
    expect(phaseZeroStatsReady).toBe(true);
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    for (const html of [stats(getStarter('ember')), maxLevelPreview(account, 'ember').html,
      upgradeResult(account, account, 'ember', 'level').details ?? '']) {
      const host = document.createElement('div');
      host.innerHTML = html;
      expect(host.textContent).not.toMatch(/Elemental [Dd]amage/);
      for (const label of ['Skill Power', 'Skill Duration', 'Skill Efficiency', 'Elemental Gauge Gain', 'Direct Attack'])
        expect(host.textContent).toContain(label);
    }
  });
});
