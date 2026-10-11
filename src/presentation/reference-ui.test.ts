import { describe, expect, it } from 'vitest';
import { emptyAccount, type Account } from '../game/account';
import { getStarter } from '../content/starters';
import { createCreatureCopy } from '../game/character-instances';
import { characterName } from '../content/character-art';
import { referenceHome } from './reference-home';
import { referenceTeam } from './reference-team';
import { summonHub } from './roster';
import { conduitStore } from './conduit-store';
import { conduitUpgradeMenu } from './conduit-upgrade';
import { onlineProfile, onlineStores } from './online-store-profile';
import { storyCampaign } from './story';
import { gameplayHub } from './gameplay';
import { storyEncounter } from '../content/story';
import { assetUrl } from './portrait';
import { getCreature } from '../content/creatures';
import { capturedProgress } from '../game/character-instances';
import { stats } from './hub';

function account(): Account {
  return { ...emptyAccount(), characters: {
    ember: { level: 12, evolution: 1 }, tide: { level: 20, evolution: 1 },
  }, squad: ['tide', 'ember'] };
}

describe('replacement reference screen structures', () => {
  it('gives Training its own scenery header, compact facts and real entry without a location picker', () => {
    const wallet = account();
    const before = structuredClone(wallet);
    const html = gameplayHub(wallet);
    const training = html.slice(html.indexOf('id="gameplay-adventure"'), html.indexOf('id="gameplay-dungeons"'));
    expect(training).toContain('activity-card training-card');
    expect(training).toContain('class="training-hero"');
    expect(training).toContain(assetUrl('backgrounds/grassy-field.png'));
    expect(training).toContain('class="training-details"');
    expect(training.match(/<dt>/g)).toHaveLength(3);
    expect(training).toContain('class="training-entry"');
    expect(training.match(/data-page="battle"/g)).toHaveLength(1);
    expect(training).not.toContain('activity-picker');
    expect(wallet).toEqual(before);
  });
  it('organizes Play into activity groups and Story into regions, stages, boss rewards and a shared entry footer', () => {
    const wallet = account();
    wallet.storyCompleted = 26;
    const before = structuredClone(wallet);
    const html = gameplayHub(wallet);
    for (const label of ['Start here', 'Practice', 'Grow your team', 'Earn currency', 'Events']) {
      expect(html).toContain(`<h3>${label}</h3>`);
    }
    for (const category of ['story', 'adventure', 'dungeons', 'infusion', 'machines', 'war', 'currency', 'events']) {
      expect(html.match(new RegExp(`href="#gameplay-${category}"`, 'g'))).toHaveLength(1);
    }
    expect(html).toContain('class="ref-story-region-sidebar"');
    expect(html).toContain('class="ref-story-main"');
    expect(html).toContain('data-story-region-heading');
    expect(html).toContain('<h2 tabindex="-1">Glasswater Reach</h2>');
    expect(html).toContain('Next: Glasswater Reach, stage 2.');
    expect(html).toContain('Stages · 1 / 25 cleared');
    expect(html.match(/class="ref-story-stages"/g)).toHaveLength(6);
    expect(html.match(/class="story-boss-preview"/g)).toHaveLength(6);
    expect(html.match(/class="ref-story-entry" data-story-detail=/g)).toHaveLength(6);
    expect(html).toContain('data-story-enter="27" >Enter stage 2');
    expect(html).toContain('Deepbell Leviathan');
    expect(html).toContain('1,150');
    expect(html).toContain('Per-kill rewards:');
    expect(html).not.toContain('mono-story-detail-banner');
    expect(html).not.toContain('Open world map');
    expect(wallet).toEqual(before);
  });
  it('connects all six real world-map beacons with completion-aware roads without unlocking stages', () => {
    const wallet = account();
    wallet.storyCompleted = 25;
    const before = structuredClone(wallet);
    const html = storyCampaign(wallet, 'ember');
    expect(html.match(/data-story-map-region=/g)).toHaveLength(6);
    expect(html.match(/<line /g)).toHaveLength(5);
    expect(html.match(/vector-effect="non-scaling-stroke"/g)).toHaveLength(5);
    expect(html).toContain('class="ref-map-node is-restored"');
    expect(html.match(/class="ref-map-node is-locked"/g)).toHaveLength(4);
    expect(html).toContain('data-story-stage="27" disabled');
    expect(wallet).toEqual(before);
  });

  it('offers owned profile icons and automatic field saving with an accurate bio count', () => {
    const wallet = account();
    const html = onlineProfile(wallet, { username: 'Test_Player', displayName: 'Player', bio: 'A spark', icon: 'tide', frame: 'default', ownedFrames: ['default'], createdAt: '2026-01-01', totalDraws: 0 });
    expect(html.match(/type="radio" name="icon"/g)).toHaveLength(3);
    expect(html).toContain('value="tide" checked');
    expect(html).not.toContain('value="sprout"');
    expect(html).toContain('data-bio-count>7 / 120');
    expect(html).toContain('Changes save automatically');
    expect(html).toContain('data-profile-retry hidden');
    expect(html).not.toContain('>Save profile<');
  });

  it('uses the actual leader and the reference Home panels without promoted banners or writes', () => {
    const wallet = account();
    wallet.storyCompleted = 25;
    const before = structuredClone(wallet);
    const html = referenceHome(getStarter('tide'), wallet);
    expect(html).toContain('ref-home-leader');
    expect(html).toContain('<h2>Tizu</h2>');
    expect(html).toContain('Glasswater Reach');
    expect(html).toContain('25 / 150 stages cleared');
    expect(html).not.toContain('data-make-leader');
    expect(html).not.toContain('ref-home-squad');
    expect(html).not.toContain('ref-home-slot');
    expect(html).not.toContain('data-team-view="formation"');
    expect(html).not.toContain('home-banner');
    expect(html).not.toContain('data-page="summon"');
    expect(wallet).toEqual(before);
  });

  it('supports captured leaders without substituting the starter or changing ownership', () => {
    const wallet = account();
    const copy = createCreatureCopy('infusion:treasury:0', 1, 65);
    wallet.capturedCharacters = [copy];
    wallet.squad = [copy.instanceId];
    const before = structuredClone(wallet);
    const html = referenceHome(getStarter('ember'), wallet);
    expect(html).toContain(`data-team-capture-detail="${copy.instanceId}"`);
    expect(html).not.toContain('<h2>Infernis</h2>');
    expect(wallet).toEqual(before);
  });

  it.each([0, 24, 25, 29, 49, 50, 74, 75, 99, 100, 124, 125, 149, 150])('shows the current Story arena after %i completed stages without changing progress', (completed) => {
    const wallet = account();
    wallet.storyCompleted = completed;
    const before = structuredClone(wallet);
    const encounter = storyEncounter(Math.min(150, completed + 1));
    const html = referenceHome(getStarter('tide'), wallet);
    const card = html.slice(html.indexOf('<button class="ref-panel ref-home-story"'), html.indexOf('<div class="ref-home-shops"'));
    expect(card).toContain(`src="${assetUrl(`backgrounds/${encounter.background}`)}"`);
    expect(card).toContain('class="ref-home-story-arena"');
    expect(card).toContain('alt="" draggable="false"');
    expect(card).toContain('data-page="story"');
    expect(card).toContain(`${completed} / 150 stages cleared`);
    expect(card).not.toContain('story-world-map.png');
    expect(wallet).toEqual(before);
  });

  it('separates Team growth and equipment into persistent sub-menus and ability dialogs', () => {
    const wallet = account();
    const html = referenceTeam(wallet, { view: 'detail', selected: 'ember', element: '', sort: 'level' });
    expect(html).toContain('ref-team-sidebar');
    expect(html).toContain('ref-character-header');
    expect(html).toContain('data-reference-level>12 / 30');
    expect(html.match(/class="is-filled"/g)).toHaveLength(1);
    for (const heading of ['Stats', 'Skills']) expect(html).toContain(`>${heading}</h3>`);
    for (const tab of ['overview', 'upgrade-1', 'upgrade-0', 'equipment']) expect(html).toContain(`data-character-tab="${tab}"`);
    expect(html.match(/aria-haspopup="dialog"/g)).toHaveLength(4);
    expect(html).not.toContain('data-conduit-slot=');
    expect(html).not.toContain('data-upgrade=');
    expect(html).toContain('data-make-leader="ember"');
    expect(html).not.toContain('character-upgrade-grid');
    expect(html).toContain(characterName('ember'));
    const state = { view: 'detail', selected: 'ember', element: '', sort: 'level' } as const;
    const equipment = referenceTeam(wallet, { ...state, tab: 'equipment' });
    expect(equipment.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(equipment).toContain('Master slot');
    expect(equipment).toContain('data-page="conduit-upgrade"');
    expect(equipment).not.toContain('data-upgrade="level"');
    for (const [tab, action] of [['upgrade-1', 'level'], ['upgrade-0', 'evolve']]) {
      const growth = referenceTeam(wallet, { ...state, tab });
      expect(growth).toContain(`data-character-tab="${tab}" aria-pressed="true"`);
      expect(growth).toContain(`data-upgrade="${action}"`);
      expect(growth).toContain('Owned / Required');
      expect(growth).toContain('upgrade-stat-preview');
      expect(growth).toContain('id="upgrade-result"');
    }
  });

  it('filters and sorts only actual owned Element-Bearers while keeping the squad visible', () => {
    const wallet = account();
    const state = { view: 'bearers', selected: 'ember', element: '', sort: 'level' } as const;
    const html = referenceTeam(wallet, state);
    const grid = html.slice(html.indexOf('class="ref-bearer-grid"'));
    expect(grid.match(/data-team-detail=/g)).toHaveLength(2);
    expect(grid.indexOf('data-team-detail="tide"')).toBeLessThan(grid.indexOf('data-team-detail="ember"'));
    expect(html).toContain('data-team-sort data-native-select');
    const filtered = referenceTeam(wallet, { ...state, element: 'infernic' });
    expect(filtered).toContain('Element-Bearers · 1 of 2');
    expect(filtered.slice(filtered.indexOf('class="ref-bearer-grid"'))).not.toContain('data-team-detail="tide"');
    expect(filtered).toContain('data-reference-member="tide"');
    expect(wallet.squad).toEqual(['tide', 'ember']);
  });

  it('renders independent captured-copy cards and retains their actual locks', () => {
    const wallet = account();
    const first = createCreatureCopy('infusion:treasury:0', 1, 65);
    const second = { ...createCreatureCopy('infusion:treasury:0', 1, 65), locked: true };
    wallet.capturedCharacters = [first, second];
    const html = referenceTeam(wallet, { view: 'creatures', selected: 'ember', element: '', sort: 'level' });
    for (const copy of [first, second]) expect(html).toContain(`data-team-capture-detail="${copy.instanceId}"`);
    expect(html).toContain(`data-character-lock="${first.instanceId}" data-lock-value="true" aria-pressed="false"`);
    expect(html).toContain(`data-character-lock="${second.instanceId}" data-lock-value="false" aria-pressed="true"`);
    expect(html.match(/Copy [12]/g)).toHaveLength(2);
    expect(html).not.toContain('data-captured-copy');
    const detail = referenceTeam(wallet, { view: 'capture', selected: 'ember', capture: first.instanceId, element: '', sort: 'level' });
    expect(detail).toContain('ref-character-header');
    expect(detail).toContain('ref-character-panels');
    expect(detail).toContain('mono-character-quad');
    expect(detail).not.toContain('ref-master-slot');
    expect(detail).not.toContain('data-owned-capture');
    expect(detail.match(/data-captured-copy=/g)).toHaveLength(1);
    expect(detail).not.toContain('data-capture-conduit=');
    expect(detail).toContain('loadout-summary');
    expect(detail.match(/data-open-loadout/g)).toHaveLength(2);
    expect(detail.match(/aria-haspopup="dialog"/g)).toHaveLength(3);
    expect(detail).toContain(`data-level-capture="${first.instanceId}"`);
    expect(detail).toContain(`data-max-level="${first.instanceId}"`);
  });

  it('rejects invalid selected ownership and explicitly distinguishes account errors from empty collections', () => {
    const state = { view: 'detail', selected: 'sprout', element: '', sort: 'name' } as const;
    expect(() => referenceTeam(account(), state)).toThrow('owned Element-Bearer');
    expect(referenceTeam(null, state)).toContain('role="alert"');
    expect(referenceHome(getStarter('ember'), null)).toContain('role="alert"');
    expect(() => referenceTeam(account(), { ...state, selected: 'ember', view: 'capture', capture: 'removed' })).toThrow('owned captured Elemental-Devourer');
  });

  it.each(['infusion:treasury:0', 'infusion:sanctuary:0', 'infusion:roses:1', 'infusion:heavens:0'])('uses bearer panels for %s while preserving its own kit and sale eligibility', (creatureId) => {
    const wallet = account();
    const creature = getCreature(creatureId);
    const copy = createCreatureCopy(creatureId, creature.stages[0], 89);
    wallet.capturedCharacters = [copy];
    wallet.squad = [copy.instanceId, 'ember'];
    const before = structuredClone(wallet);
    const html = referenceTeam(wallet, { view: 'capture', selected: 'ember', capture: copy.instanceId, element: '', sort: 'level' });
    expect(html).toContain('ref-team-detail ref-capture-detail');
    expect(html).not.toContain('captured-stage');
    expect(html).not.toContain('ref-copy-management');
    expect(html).toContain(stats(copy));
    expect(html).toContain('loadout-summary');
    expect(html).toContain('data-open-loadout');
    expect(html).not.toContain('ref-equipment-slot loadout-slot');
    const loadout = referenceTeam(wallet, { view: 'capture-conduits', selected: 'ember', capture: copy.instanceId, element: '', sort: 'level' });
    expect(loadout).toContain('Character Masters are for their named Element-Bearer only.');
    expect(loadout).toContain('ref-master-slot');
    expect(html).not.toContain('data-master-equipment=');
    expect(html).toContain(`data-character-lock="${copy.instanceId}"`);
    expect(html).toContain('Fixed form · Cannot evolve');
    for (const skill of capturedProgress(copy).skills) expect(html).toContain(skill.name);
    if (creatureId.includes('heavens')) {
      expect(html.match(/class="creature-sale-choice" data-sell-creature="[^"]+" data-sale-option="[^"]+" disabled/g)).toHaveLength(4);
    } else expect(html).toContain(`data-sell-creature="${copy.instanceId}" disabled`);
    expect(html).toContain('Sale protected: In squad');
    expect(wallet).toEqual(before);
  });

  it('retains an available sale outside the squad and caps Elemental-Devourer growth without an evolution action', () => {
    const wallet = account();
    const copy = createCreatureCopy('infusion:treasury:0', 1, 120);
    wallet.capturedCharacters = [copy];
    const html = referenceTeam(wallet, { view: 'capture', selected: 'ember', capture: copy.instanceId, element: '', sort: 'level' });
    expect(html).toContain(`data-sell-creature="${copy.instanceId}" >Sell copy`);
    expect(html).toContain('Maximum level 120');
    expect(html).not.toContain('data-level-capture');
    expect(html).not.toContain('data-upgrade-kind="evolve"');
  });

  it('positions banner selection and pity before the hero, draw command and all real rate tiers', () => {
    const html = summonHub(account(), 'standard');
    const leftEnd = html.indexOf('</aside>');
    expect(html.slice(0, leftEnd)).toContain('banner-pity');
    expect(html.indexOf('ref-summon-hero')).toBeLessThan(html.indexOf('ref-summon-draw'));
    expect(html.indexOf('ref-summon-draw')).toBeLessThan(html.indexOf('id="summon-information"'));
    expect(html).not.toContain('ref-summon-rates');
    expect(html).not.toContain('data-banner-character');
    expect(html).not.toContain('banner-showcase-control');
    expect(html.match(/data-banner-entry=/g)).toHaveLength(28);
    expect(html.match(/id="summon-character"/g)).toHaveLength(1);
    expect(html.match(/class="ref-rate-tier"/g)).toHaveLength(5);
  });

  it('selects one real Store or restoration detail without losing catalog/owned entries', () => {
    const wallet = account();
    wallet.conduits = { 'vigil-core': 1, 'worldbreaker-drive': 1 };
    const before = structuredClone(wallet);
    const store = conduitStore(wallet, 'bastion-lock');
    expect(store.match(/data-store-conduit=/g)).toHaveLength(10);
    expect(store.match(/data-buy-conduit=/g)).toHaveLength(1);
    expect(store).toContain('data-buy-conduit="bastion-lock" disabled');
    const upgrade = conduitUpgradeMenu(wallet, 'worldbreaker-drive');
    expect(upgrade.match(/data-select-upgrade-conduit=/g)).toHaveLength(2);
    expect(upgrade.match(/data-upgrade-conduit=/g)).toHaveLength(1);
    expect(upgrade).toContain('data-upgrade-conduit="worldbreaker-drive"');
    expect(upgrade.match(/class="is-current"/g)).toHaveLength(1);
    expect(wallet).toEqual(before);
  });

  it('keeps every material and frame selectable while exposing only the selected transaction', () => {
    const wallet = account();
    const material = onlineStores(wallet, null, 'materials', 'oceanic');
    expect(material.match(/data-market-material=/g)).toHaveLength(6);
    expect(material).toContain('data-buy-material="oceanic" data-quantity="1" disabled');
    expect(material.match(/data-buy-material=/g)).toHaveLength(3);
    const frames = onlineStores(wallet, null, 'cosmetics', 'infernic', 'double-outline');
    expect(frames.match(/data-market-frame=/g)).toHaveLength(4);
    expect(frames).toContain('data-buy-frame="double-outline" disabled');
  });

  it('shows real profile information or Friends without fabricating activity history', () => {
    const wallet = account();
    const profile = { username: 'Test_Player', displayName: 'Test Player', bio: '', icon: 'neutral',
      frame: 'default', ownedFrames: ['default'], createdAt: '2026-10-10T00:00:00Z', totalDraws: 17 };
    const social = { friends: [], incoming: [], outgoing: [] };
    const info = onlineProfile(wallet, profile, social);
    expect(info).toContain('data-profile-tab="info" aria-pressed="true"');
    expect(info).toContain('class="ref-profile-social" hidden');
    expect(info).toContain('data-copy-username="Test_Player"');
    expect(info).toContain('Activity history is not recorded');
    const friends = onlineProfile(wallet, profile, social, 'friends');
    expect(friends).toContain('class="online-profile-statistics" hidden');
    expect(friends).toContain('data-friend-search');
    expect(friends).toContain('data-refresh-social');
  });
});
