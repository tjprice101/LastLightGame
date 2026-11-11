// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount, type Account } from '../game/account';
import { releasedRadiantIds } from '../content/combat-kits';
import { getStarter } from '../content/starters';
import { starters } from '../content/starters';
import { characterReleased } from '../content/release-visibility';
import { getCreature } from '../content/creatures';
import { conduitConfigurationsPanel, savedLoadoutOperation, squadLoadoutsPanel } from './saved-loadouts';
import { gameConfirm } from './game-dialog';
import { createCreatureCopy } from '../game/character-instances';
import { referenceTeam } from './reference-team';
import { characterArt } from '../content/character-art';
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
  it('renders every member and shared six-member capacity for current and saved squads', () => {
    const saved = account(), ids = releasedRadiantIds.slice(0, 6);
    for (const member of ids) saved.characters[member] = { level: 0, evolution: 1 };
    saved.squad = ids;
    saved.squadLoadouts![0].members = [...ids].reverse().map(character => ({
      character, name: getStarter(character).name, element: getStarter(character).elementId,
      conduits: Array<null>(8).fill(null), master: null,
    }));
    document.body.innerHTML = squadLoadoutsPanel(saved);
    expect(document.querySelector('.saved-loadout-member .compact-portrait img')?.getAttribute('src'))
      .toContain(`character-faces/${characterArt(ids[0], 1).art}.png`);
    for (const card of Array.from(document.querySelectorAll('[data-saved-entry]'))) {
      expect(card.querySelector('.saved-loadout-card-heading')?.textContent).toContain('6 / 6 members');
      expect(card.querySelectorAll('.saved-loadout-member')).toHaveLength(6);
    }
    expect(document.querySelectorAll('.saved-loadout-slots li')).toHaveLength(96);
  });
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
    expect(document.querySelector('[data-config-index="0"] .saved-loadout-match')?.textContent).toBe('Matches current');
    expect(document.querySelector<HTMLButtonElement>('[data-config-index="1"] [data-saved-loadout-action="equipConduitConfiguration"]')?.disabled).toBe(true);
    document.querySelector<HTMLDetailsElement>('.saved-configuration-equipment')!.open = true;
    const art = document.querySelector('[data-loadout-slot="0"] img');
    saved.conduitEquipment!.ember = Array<null>(8).fill(null);
    expect(refreshConduitLoadout(document.body, 'ember', 'Infernis', 'infernic', saved)).toBe(true);
    expect(document.querySelector('[data-config-index="0"] .saved-loadout-match')).toBeNull();
    expect(saved.conduitConfigurations?.ember[0]?.conduits[0]).toBe('vigil-core');
    expect(document.querySelector<HTMLDetailsElement>('.saved-configuration-equipment')?.open).toBe(true);
    expect(art).toBeTruthy();
  });
  it('keeps save controls before the visual squad and places all entries inside the Team scroll surface', () => {
    const saved = account(), before = JSON.stringify(saved);
    document.body.innerHTML = squadLoadoutsPanel(saved);
    const scroll = document.querySelector('.saved-loadout-scroll')!;
    expect(scroll.classList.contains('ref-scroll')).toBe(true);
    expect(scroll.querySelectorAll('[data-saved-entry]')).toHaveLength(2);
    const current = scroll.querySelector('[data-saved-id=""]')!;
    expect(current.querySelector('[data-saved-name]')!.compareDocumentPosition(current.querySelector('.saved-loadout-members')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(current.querySelectorAll('.saved-loadout-slots li')).toHaveLength(8);
    expect(current.querySelectorAll('.saved-loadout-slots .is-empty')).toHaveLength(7);
    expect(current.querySelector('.saved-loadout-slot-art .conduit-icon')).not.toBeNull();
    expect(current.querySelector('.saved-loadout-slots li')?.textContent).toContain('Slot 1Vigil Core');
    expect(current.querySelector('.saved-loadout-master')?.textContent).toContain('MasterNone equipped');
    expect(document.querySelector('.saved-loadout-match')?.textContent).toBe('Matches current');
    expect(JSON.stringify(saved)).toBe(before);
  });
  it('shows the saved Master and current upgrade art without claiming those upgrades are part of the preset', () => {
    const saved = account();
    saved.conduitUpgrades = { 'vigil-core': 3 };
    saved.squadLoadouts![0].members[0].master = 'master-ember-1';
    document.body.innerHTML = squadLoadoutsPanel(saved);
    const card = document.querySelector(`[data-saved-id="${id}"]`)!;
    expect(card.querySelector('[data-conduit-upgrade="3"]')).not.toBeNull();
    expect(card.querySelector('.saved-loadout-master img.master-art')).not.toBeNull();
    expect(card.querySelector('.saved-loadout-match')).toBeNull();
  });
  it('distinguishes empty configurations from saved snapshots and keeps the editor above inspectable equipment', () => {
    const saved = account(), before = JSON.stringify(saved);
    document.body.innerHTML = conduitConfigurationsPanel(saved, 'ember');
    expect(document.querySelector('.ref-panel-heading')?.textContent).toContain('1 / 3 saved');
    expect(document.querySelectorAll('.saved-configuration-empty')).toHaveLength(2);
    const first = document.querySelector('[data-config-index="0"]')!;
    const details = first.querySelector('details')!;
    expect(details.open).toBe(false);
    expect(details.querySelector('summary')?.textContent).toContain('1 / 8 Conduits');
    expect(details.querySelectorAll('.saved-loadout-slots li')).toHaveLength(8);
    expect(first.querySelector('[data-saved-loadout-action]')!.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    details.open = true;
    expect(JSON.stringify(saved)).toBe(before);
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
  it('explains owned captured members and disables save, overwrite and equip until the squad is replaced', () => {
    const saved = account(), copy = createCreatureCopy('infusion:treasury:0'), creature = getCreature(copy.creatureId);
    saved.capturedCharacters = [copy];
    saved.squad = [copy.instanceId];
    saved.squadLoadouts![0].members.push({ character: copy.instanceId, name: creature.name,
      element: creature.element, conduits: Array<null>(8).fill(null), master: null });
    const before = JSON.stringify(saved);
    document.body.innerHTML = squadLoadoutsPanel(saved);
    expect(document.querySelector<HTMLButtonElement>('[data-saved-id=""] [data-saved-loadout-action="saveSquadLoadout"]')?.disabled).toBe(true);
    expect(action('equipSquadLoadout').disabled).toBe(true);
    expect(document.querySelector<HTMLButtonElement>(`[data-saved-id="${id}"] [data-saved-loadout-action="saveSquadLoadout"]`)?.disabled).toBe(true);
    expect(action('renameSquadLoadout').disabled).toBe(false);
    expect(action('deleteSquadLoadout').disabled).toBe(false);
    expect(document.body.textContent).toContain('Captured Elemental-Devourers cannot join the squad');
    expect(JSON.stringify(saved)).toBe(before);
  });
  it('disables an unreleased member without hiding or changing the saved entry', () => {
    const saved = account(), hidden = starters.find(starter => !characterReleased(starter.id))!;
    saved.characters[hidden.id] = { level: 0, evolution: 1 };
    saved.squadLoadouts![0].members.push({ character: hidden.id, name: hidden.name,
      element: hidden.elementId, conduits: Array<null>(8).fill(null), master: null });
    document.body.innerHTML = squadLoadoutsPanel(saved);
    expect(action('equipSquadLoadout').disabled).toBe(true);
    expect(document.body.textContent).toContain('not currently released for Radiant combat');
    expect(document.querySelector<HTMLButtonElement>(`[data-saved-id="${id}"] [data-saved-loadout-action="saveSquadLoadout"]`)?.disabled).toBe(false);
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
