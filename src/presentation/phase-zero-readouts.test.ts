// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

vi.mock('../content/phase-zero-stats', async importOriginal => ({
  ...await importOriginal<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: true,
}));

import { phaseZeroStatLabels, phaseZeroStatKeys } from '../content/phase-zero-stats';
import { getStarter } from '../content/starters';
import { emptyAccount } from '../game/account';
import { createCreatureCopy } from '../game/character-instances';
import { stats, characterDetail } from './hub';
import { maxLevelPreview } from './max-level';
import { upgradeResult } from './upgrade-result';
import { referenceTeam } from './reference-team';
import { statPreview } from './stat-preview';
import { resolveFighter } from '../content/combat';

function expectCurrentLabels(html: string) {
  const host = document.createElement('div');
  host.innerHTML = html;
  for (const label of Object.values(phaseZeroStatLabels)) expect(host.textContent).toContain(label);
  expect(host.textContent).not.toMatch(/Elemental [Dd]amage|Attack Damage/);
  return host;
}

describe('release-gated ten-stat surfaces', () => {
  it('shows all ten bearer/captured stats and correct baseline units in grouped and flat readouts', () => {
    const captured = createCreatureCopy('infusion:heavens:0');
    for (const unit of [getStarter('ember'), captured]) for (const grouped of [false, true]) {
      const host = expectCurrentLabels(stats(unit, undefined, grouped));
      const rows = Array.from(host.querySelectorAll('.hub-stats > div'));
      expect(rows).toHaveLength(10);
      const value = (label: string) => rows.find(row => row.querySelector('small')?.textContent === label)?.querySelector('strong')?.textContent;
      expect(value('Skill Power')).toBe('100%');
      expect(value('Skill Duration')).toBe('0');
      expect(value('Skill Efficiency')).toBe('0%');
      expect(value('Elemental Gauge Gain')).toBe('100%');
    }
  });

  it('renders all ten current stats for bearer and captured Max Level and upgrade receipts', () => {
    const before = emptyAccount();
    before.characters.ember = { level: 0, evolution: 1 };
    const copy = createCreatureCopy('infusion:heavens:0');
    before.capturedCharacters = [copy];
    const after = structuredClone(before);
    after.characters.ember = { level: 1, evolution: 1 };
    after.capturedCharacters![0].level = 60;
    for (const id of ['ember', copy.instanceId]) {
      expectCurrentLabels(maxLevelPreview(before, id).html);
      expectCurrentLabels(upgradeResult(before, after, id, 'level').details ?? '');
    }
  });

  it('includes all ten stats in bearer and captured growth previews', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    expectCurrentLabels(characterDetail(getStarter('ember'), 'upgrade-1', account));
    const copy = createCreatureCopy('infusion:heavens:0');
    account.capturedCharacters = [copy];
    expectCurrentLabels(referenceTeam(account, { view: 'capture', selected: 'ember',
      capture: copy.instanceId, tab: 'upgrade-1', element: '', sort: 'level' }));
  });

  it('does not disguise legacy Elemental Damage as Skill Power or fractional turns', () => {
    const before = resolveFighter('ember').stats;
    const after = { ...before, elementalDamage: 9999, skillPower: 1.35, skillDuration: 2, skillEfficiency: .25, gaugeGain: 1.2 };
    const host = expectCurrentLabels(statPreview(before, after));
    expect(host.querySelectorAll(':scope > span')).toHaveLength(phaseZeroStatKeys.length);
    expect(host.textContent).toContain('100% → 135%');
    expect(host.textContent).toContain('0 → 2');
    expect(host.textContent).not.toContain('9999');
  });
});
