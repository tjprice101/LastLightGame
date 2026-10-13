import { describe, expect, it } from 'vitest';
import { describeFighter, resolveFighter } from '../content/combat';
import { abilityStatuses, kitResource } from './ability-status';
import { elementalEffectFamilies } from '../content/elemental-effects';
import { kitPilotDescriptions, kitResourceUses } from '../content/kit-pilots';
import { starters } from '../content/starters';

describe('typed ability status labels', () => {
  it('refreshes stale online snapshot copy without changing frozen strengths or writing back to combat state', () => {
    const snapshot = resolveFighter('sprout', { level: 18, evolution: 2 });
    snapshot.abilities.skill1.description = 'Consumes all Blooms.';
    snapshot.passive.description = 'Old Bloom description.';
    snapshot.abilities.skill1.strength.damageMultiplier = 1.2345;
    const before = structuredClone(snapshot);
    const display = describeFighter('sprout', snapshot);
    expect(display.abilities.skill1.description).toContain('Botanic Renewal charges');
    expect(display.abilities.skill1.description).toContain('123.45%');
    expect(display.passive.description).toContain('one charge of Botanic Renewal');
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
  it('shares native resource names with the elemental family catalog and uses grammatical stack wording', () => {
    for (const pilot of ['ember', 'ward', 'bloom', 'tempest'] as const) {
      const description = kitPilotDescriptions[pilot];
      const resource = description.resource!;
      expect(resource.label).toBe(elementalEffectFamilies[resource.effect.family].label);
      expect(description.passive).toContain(`one charge of ${resource.label}`);
      expect(resource.detail).toContain(resource.label);
    }
    for (const id of ['sprout', 'bliss'] as const) {
      const kit = resolveFighter(id);
      expect(kit.abilities.skill1.description).toContain('Botanic Renewal charges');
      expect(kit.abilities.ultimate.description).toContain('Botanic Renewal charges');
      expect(JSON.stringify(kit)).not.toContain('Consumes all Blooms');
    }
  });
  it('keeps shared charge rules out of individual ability descriptions', () => {
    for (const starter of starters) {
      const kit = resolveFighter(starter.id);
      const resource = kit.pilot ? kitPilotDescriptions[kit.pilot].resource : undefined;
      const text = JSON.stringify(kit);
      expect(text).not.toMatch(/Consumes all|stacks? of|per stack|authored ordinary|Conduit Ember Seals/);
      for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
        const ability = kit.abilities[action];
        expect(ability.description).not.toContain('?');
        if (resource) expect(ability.description).not.toContain(resource.summary);
        if (ability.strength.burnMultiplier !== undefined) expect(ability.description).toContain('ignores Defense');
      }
      if (resource) {
        expect(kitResource(kit, starter.id)).toContain(kitResourceUses[starter.id]);
        expect(kitResource(kit, starter.id)).toContain('At 0 charges, the skill still has its normal effect.');
        expect(kitResource(kit, starter.id)).not.toContain(resource.summary);
      }
    }
    expect(resolveFighter('tide').abilities.skill1.description).toContain('Weaken: outgoing attack damage reduction; Defense unchanged.');
    expect(resolveFighter('tide').abilities.skill1.description.split(/\s+/).length).toBeLessThanOrEqual(65);
  });
  it('explains earning and spending separately for every resource bearer without empty-effect wording', () => {
    for (const starter of starters) {
      const kit = resolveFighter(starter.id);
      expect(JSON.stringify(kit)).not.toMatch(/do nothing|No standalone effect|Recover next turn/);
      for (const ability of Object.values(kit.abilities)) {
        expect(ability.description.match(/Recovery:/g)?.length ?? 0).toBeLessThanOrEqual(1);
      }
      if (!kit.pilot) {
        expect(kitResource(kit, starter.id)).toBe('');
        continue;
      }
      const usage = kitResourceUses[starter.id];
      expect(usage).toBeDefined();
      expect(usage).toContain('spends');
      expect(kitResource(kit, starter.id)).toContain(usage);
      expect(kitResource(kit, starter.id)).toContain('Up to 3 charges');
      expect(kit.passive.description).toContain('maximum 3');
    }
  });
  it('maps all native and Rose resource identities to delivered icons without parsing prose', () => {
    for (const [id, icon] of [['ember', 'burn'], ['tide', 'ward'], ['sprout', 'bloom'],
      ['atmoso', 'tempest'], ['rosetta', 'rose-grace'], ['thornia', 'thorn-aegis'], ['crinso', 'rose-duality']] as const) {
      expect(kitResource(resolveFighter(id))).toContain(`data-status-art="${icon}"`);
    }
  });
});
