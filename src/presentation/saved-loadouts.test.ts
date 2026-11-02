// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount, type Account } from '../game/account';
import { conduitConfigurationsPanel, savedLoadoutOperation, squadLoadoutsPanel } from './saved-loadouts';
import { gameConfirm } from './game-dialog';
import { createCreatureCopy } from '../game/character-instances';
import { referenceTeam } from './reference-team';
import { conduitLoadout, refreshConduitLoadout } from './conduit-loadout';

vi.mock('./game-dialog', async importOriginal => ({
  ...await importOriginal<typeof import('./game-dialog')>(), gameConfirm: vi.fn(),
}));
const id = '00000000-0000-4000-8000-000000000001';
const gear = { conduits: ['vigil-core', null, null, null, null, null, null, null] as const, master: null };
function account(): Account {
  return { ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 } }, squad: ['ember'],
    conduits: { 'vigil-core': 1 }, conduitEquipment: { ember: [...gear.conduits] },
    squadLoadouts: [{ id, name: '<img src=x onerror=alert(1)>', members: [{ character: 'ember', name: 'Infernis', element: 'infernic', conduits: [...gear.conduits], master: null }] }],
    conduitConfigurations: { ember: [{ name: 'Burst', conduits: [...gear.conduits], master: null }, null, null] } };
}
function action(kind: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(`[data-saved-loadout-action="${kind}"]`);
  if (!button) throw new Error('Test loadout action missing.');
  return button;
}
describe('saved loadout controls', () => {
  beforeEach(() => { document.body.innerHTML = ''; vi.mocked(gameConfirm).mockReset(); });
  it('provides a Team destination, named current squad, saved equipment and unlimited list semantics without HTML injection', () => {
    document.body.innerHTML = referenceTeam(account(), { view: 'loadouts', selected: 'ember', element: '', sort: 'name' });
    expect(document.querySelector('[data-team-view="loadouts"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelectorAll('[data-saved-entry]')).toHaveLength(2);
    expect(document.querySelector('img[onerror]')).toBeNull();
    expect(document.querySelector(`[data-saved-id="${id}"] h3`)?.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(document.querySelector('[data-saved-loadouts]')?.textContent).toContain('Vigil Core');
    expect(document.querySelector('[data-saved-name]')?.getAttribute('maxlength')).toBe('40');
    expect(document.querySelector('[data-saved-loadout-status]')?.getAttribute('role')).toBe('status');
  });
  it('renders exactly three named per-character configurations and recalculates matching equipment without replacing unchanged art', () => {
    const saved = account();
    document.body.innerHTML = conduitLoadout('ember', 'Infernis', 'infernic', saved);
    expect(document.querySelectorAll('[data-config-index]')).toHaveLength(3);
    expect(document.querySelector('[data-config-index="0"] h4')?.textContent).toContain('Matches current');
    expect(document.querySelector<HTMLButtonElement>('[data-config-index="1"] [data-saved-loadout-action="equipConduitConfiguration"]')?.disabled).toBe(true);
    const art = document.querySelector('[data-loadout-slot="0"] img');
    saved.conduitEquipment!.ember = Array<null>(8).fill(null);
    expect(refreshConduitLoadout(document.body, 'ember', 'Infernis', 'infernic', saved)).toBe(true);
    expect(document.querySelector('[data-config-index="0"] h4')?.textContent).not.toContain('Matches current');
    expect(saved.conduitConfigurations?.ember[0]?.conduits[0]).toBe('vigil-core');
    expect(art).toBeTruthy();
  });
  it('disables a stale captured template explicitly without substituting a squad', () => {
    const saved = account(), copy = createCreatureCopy('infusion:treasury:0');
    saved.squadLoadouts![0].members.push({ character: copy.instanceId, name: 'Lost copy', element: 'tranquilitic', conduits: Array<null>(8).fill(null), master: null });
    document.body.innerHTML = squadLoadoutsPanel(saved);
    expect(action('equipSquadLoadout').disabled).toBe(true);
    expect(document.body.textContent).toContain('Member no longer owned');
    expect(document.body.textContent).toContain('Cannot equip');
    expect(saved.squad).toEqual(['ember']);
  });
  it('creates only an ID/name command and cancels destructive overwrites/deletion without a command', async () => {
    document.body.innerHTML = squadLoadoutsPanel(account());
    const input = document.querySelector<HTMLInputElement>('[data-saved-name]')!;
    input.value = 'New squad';
    const command = await savedLoadoutOperation(action('saveSquadLoadout'));
    expect(command).toEqual({ kind: 'saveSquadLoadout', id: expect.any(String), name: 'New squad' });
    expect(gameConfirm).not.toHaveBeenCalled();
    vi.mocked(gameConfirm).mockResolvedValue(false);
    expect(await savedLoadoutOperation(action('deleteSquadLoadout'))).toBeNull();
    const overwrite = document.querySelector<HTMLButtonElement>(`[data-saved-id="${id}"] [data-saved-loadout-action="saveSquadLoadout"]`)!;
    expect(await savedLoadoutOperation(overwrite)).toBeNull();
    vi.mocked(gameConfirm).mockResolvedValue(true);
    expect(await savedLoadoutOperation(overwrite)).toEqual({ kind: 'saveSquadLoadout', id, name: account().squadLoadouts![0].name });
  });
  it('names, saves and equips configurations through narrow commands and confirms only an existing-slot overwrite', async () => {
    document.body.innerHTML = conduitConfigurationsPanel(account(), 'ember');
    expect(await savedLoadoutOperation(action('equipConduitConfiguration'))).toEqual({ kind: 'equipConduitConfiguration', character: 'ember', index: 0 });
    expect(await savedLoadoutOperation(action('renameConduitConfiguration'))).toEqual({ kind: 'renameConduitConfiguration', character: 'ember', index: 0, name: 'Burst' });
    vi.mocked(gameConfirm).mockResolvedValue(false);
    expect(await savedLoadoutOperation(action('saveConduitConfiguration'))).toBeNull();
    const fresh = document.querySelector<HTMLButtonElement>('[data-config-index="1"] [data-saved-loadout-action="saveConduitConfiguration"]')!;
    vi.mocked(gameConfirm).mockClear();
    expect(await savedLoadoutOperation(fresh)).toEqual({ kind: 'saveConduitConfiguration', character: 'ember', index: 1, name: 'Configuration 2' });
    expect(gameConfirm).not.toHaveBeenCalled();
  });
});
