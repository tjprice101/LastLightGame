import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { starters } from '../content/starters';
import { characterArt } from '../content/character-art';
import { characterArtRevisions } from '../content/character-art-revisions';
import { assetUrl, portraitAttributes } from './portrait';
import { archives } from './archives';
import { emptyAccount } from '../game/account';
import { characterDetail, characterHub, homeHub } from './hub';
import { ownedCompanion } from './owned-companion';
import { squadHub } from './roster';
import { bannerShowcase } from './banner-showcase';
import { BattleView } from './battle-view';
import { createBattle } from '../game/battle';

describe('current character artwork across revealed and locked surfaces', () => {
  it.each(starters)('$name uses byte-derived revisions for every form and silhouette', (starter) => {
    const locked = archives(emptyAccount());
    for (let evolution = 1; evolution <= 6; evolution++) {
      const form = characterArt(starter.id, evolution);
      const revision = createHash('sha256')
        .update(readFileSync(`public/assets/characters/${form.art}.png`)).digest('hex').slice(0, 16);
      expect(characterArtRevisions[form.art]).toBe(revision);
      const url = assetUrl(`characters/${form.art}.png`);
      expect(url).toBe(`${import.meta.env.BASE_URL}assets/characters/${form.art}.png?v=${revision}`);
      expect(portraitAttributes(starter, evolution).src).toBe(url);
      expect(locked).toContain(`src="${url}"`);
      const account = { ...emptyAccount(), characters: { [starter.id]: { level: 0, evolution } }, squad: [starter.id] };
      for (const html of [homeHub(starter, false, account), characterHub(starter, 'overview', account),
        ownedCompanion(account, starter.id).art, squadHub(account), archives(account)]) {
        expect(html).toContain(`src="${url}"`);
      }
      const state = createBattle(1, [starter.id], account.characters);
      const view = Object.create(BattleView.prototype);
      Object.assign(view, { session: { state } });
      const field = Reflect.apply(Reflect.get(BattleView.prototype, 'unit'), view, [state.allies[0]]);
      expect(field).toContain(`src="${url}"`);
      if (evolution < 6) {
        const next = assetUrl(`characters/${characterArt(starter.id, evolution + 1).art}.png`);
        const preview = characterDetail(starter, 'upgrade-0', account);
        expect(preview).toContain('class="evolution-silhouette"');
        expect(preview).toContain(`src="${next}"`);
      }
    }
  });
  it('versions unlock showcase portraits but not unrelated art', () => {
    for (const banner of ['standard', 'roses'] as const) {
      const html = bannerShowcase(banner);
      const urls = [...html.matchAll(/src="([^"]+characters\/[^"]+)"/g)].map((match) => match[1]);
      expect(urls.length).toBeGreaterThan(0);
      for (const url of urls) expect(url).toMatch(/\.png\?v=[a-f0-9]{16}$/);
    }
    expect(assetUrl('enemies/goblin.png')).toBe(`${import.meta.env.BASE_URL}assets/enemies/goblin.png`);
    expect(assetUrl('currencies/mechanical-components.png')).not.toContain('?v=');
  });
});
