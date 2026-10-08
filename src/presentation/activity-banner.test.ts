import { describe, expect, it } from 'vitest';
import { activityBanner } from './activity-banner';
import { gameplayHub } from './gameplay';
import { emptyAccount } from '../game/account';

describe('reference activity banners', () => {
  it('uses real base-aware artwork with a separate overlaid activity name', () => {
    const html = activityBanner('Awaken the Machines', 'banners/machines-banner.png', 'An ancient machine awakens.');
    expect(html).toContain('class="activity-banner"');
    expect(html).toContain('assets/banners/machines-banner.png');
    expect(html).toContain('alt="An ancient machine awakens."');
    expect(html).toContain('<h3>Awaken the Machines</h3>');
    expect(html).not.toContain('loading="lazy"');
    expect(activityBanner('City of Heaven', 'banners/heavens-banner.png', undefined, true)).toContain('loading="lazy"');
  });
  it('keeps missing-art activities named without requesting a missing image', () => {
    const html = activityBanner('An authored dungeon', null);
    expect(html).toContain('Artwork pending');
    expect(html).toContain('<h3>An authored dungeon</h3>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('src=');
  });
  it('retains all staged entry selectors inside real entry footers and all named reward panels', () => {
    const account = emptyAccount();
    account.infusionStages.machines = 100;
    const html = gameplayHub(account);
    expect(html.match(/class="activity-entry"/g)).toHaveLength(16);
    expect(html.match(/data-dungeon-stage=/g)).toHaveLength(10);
    expect(html.match(/data-infusion-stage=/g)).toHaveLength(6);
    expect(html).toContain('value="100" selected');
    expect(html).toContain('data-infusion="machines"');
    expect(html).toContain('class="activity-facts"');
    expect(html).toContain('Conduit upgrade currency');
    expect(html).toContain('Passion of Crimson Roses</h3>');
    expect(gameplayHub(null)).not.toContain('class="activity-entry"');
  });
});
