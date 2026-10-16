import { describe, expect, it } from 'vitest';
import { describeFighter, resolveFighter } from '../content/combat';
import { abilityStatuses, kitResource } from './ability-status';
import { starters } from '../content/starters';
import { nativeIdentities } from '../content/native-identities';

describe('typed ability status labels', () => {
  it('refreshes stale online snapshot copy without changing frozen strengths or writing back to combat state', () => {
    const snapshot = resolveFighter('sprout', { level: 18, evolution: 2 });
    snapshot.abilities.skill1.description = 'Consumes all Blooms.';
    snapshot.passive.description = 'Old Bloom description.';
    snapshot.abilities.skill1.strength.damageMultiplier = 1.2345;
    const before = structuredClone(snapshot);
    const display = describeFighter('sprout', snapshot);
    expect(display.abilities.skill1.description).toBe(nativeIdentities.sprout.abilities.skill1.description);
    expect(display.passive.description).toBe(nativeIdentities.sprout.passive.description);
    expect(display.stats).toEqual(snapshot.stats);
    expect(display.abilities.skill1.strength).toEqual(snapshot.abilities.skill1.strength);
    expect(snapshot).toEqual(before);
    expect(describeFighter('sprout', display)).toEqual(display);
  });
  it('uses actual strengths and omits absent effects', () => {
    const html = abilityStatuses({ damageMultiplier: 2, burnMultiplier: 1, weakenFraction: .2, shield: 30, healing: 20, critBonus: .1, attackBoostFraction: .2 });
    for (const id of ['burn', 'suppression', 'ward', 'bloom', 'focus']) expect(html).toContain(`data-status-art="${id}"`);
    expect(abilityStatuses({ damageMultiplier: 3 })).toBe('');
    expect(abilityStatuses({ healing: 0 })).toBe('');
    expect(html).toContain('title="Infernic Embers · Burn"');
    expect(html).toContain('title="Oceanic Protection · Shield"');
    expect(html).toContain('title="Chaotic Suppression · Weaken"');
  });
  it('explains each native identity rather than assigning shared charge loops', () => {
    for (const starter of starters) {
      const kit = resolveFighter(starter.id);
      const summary = kitResource(kit, starter.id);
      expect(summary).toContain(nativeIdentities[starter.id].role);
      expect(summary).toContain(nativeIdentities[starter.id].playLoop);
      expect(summary).not.toContain('Up to 3 charges');
      expect(kit.pilot).toBeUndefined();
    }
  });
  it('keeps shared charge rules out of individual ability descriptions', () => {
    for (const starter of starters) {
      const kit = resolveFighter(starter.id);
      const text = JSON.stringify(kit);
      expect(text).not.toMatch(/Consumes all|stacks? of|per stack|authored ordinary|Conduit Ember Seals/);
      for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
        const ability = kit.abilities[action];
        expect(ability.description).not.toContain('?');
        expect(ability.description.startsWith(nativeIdentities[starter.id].abilities[action].description)).toBe(true);
        if (ability.strength.burnMultiplier !== undefined) expect(ability.description).toContain('ignores Defense');
      }
    }
    expect(resolveFighter('tide').abilities.skill1.description).toContain('25% [Weaken]');
    expect(resolveFighter('tide').abilities.skill1.description).toContain('for the next enemy phase');
    expect(resolveFighter('tide').abilities.skill1.description.split(/\s+/).length).toBeLessThanOrEqual(65);
  });
  it('retains exact actions without generic resource or recovery instructions', () => {
    for (const starter of starters) {
      const kit = resolveFighter(starter.id);
      expect(JSON.stringify(kit)).not.toMatch(/do nothing|No standalone effect|Recover next turn/);
      for (const ability of Object.values(kit.abilities)) {
        expect(ability.description.match(/Recovery:/g)?.length ?? 0).toBeLessThanOrEqual(1);
      }
      expect(kitResource(kit, starter.id)).not.toContain('Spending resets the saved charges');
      expect(kit.passive.description).toBe(nativeIdentities[starter.id].passive.description);
    }
  });
  it('does not invent status art or fake charges when explaining new native identities', () => {
    for (const starter of starters) {
      const summary = kitResource(resolveFighter(starter.id), starter.id);
      expect(summary).not.toContain('data-status-art=');
      expect(summary).not.toContain('charges');
      expect(summary).not.toContain('<img');
    }
    const historical = resolveFighter('ember');
    delete historical.nativeIdentity;
    historical.pilot = 'ember';
    expect(kitResource(historical, 'ember')).toContain('data-status-art="burn"');
  });
});
