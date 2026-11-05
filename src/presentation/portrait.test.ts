import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { starters } from '../content/starters';
import { characterArt, characterName } from '../content/character-art';
import { characterArtRevisions } from '../content/character-art-revisions';
import { assetUrl, portrait, portraitAttributes } from './portrait';
import { archives } from './archives';
import { emptyAccount } from '../game/account';
import { characterDetail, characterHub, homeHub } from './hub';
import { ownedCompanion } from './owned-companion';
import { squadHub } from './roster';
import { bannerShowcase } from './banner-showcase';
import { BattleView } from './battle-view';
import { createBattle } from '../game/battle';

describe('current character artwork across revealed and locked surfaces', { timeout: 30_000 }, () => {
  const locked = archives(emptyAccount());
  it.each(starters)('$name uses byte-derived revisions only for shipped forms and keeps pending art neutral', (starter) => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      const form = characterArt(starter.id, evolution);
      expect(portrait(starter, evolution, true)).toContain(`alt="${characterName(starter.id, evolution, true)},`);
      if (!form.available) {
        expect(characterArtRevisions[form.art]).toBeUndefined();
        expect(portraitAttributes(starter, evolution).src).toContain('data:image/svg+xml,');
        expect(portraitAttributes(starter, evolution).alt).toContain('artwork pending');
        const account = { ...emptyAccount(), characters: { [starter.id]: { level: 0, evolution } }, squad: [starter.id] };
        const pendingSurfaces = [homeHub(starter, false, account), characterHub(starter, 'overview', account),
          ownedCompanion(account, starter.id).art, squadHub(account), archives(account)];
        for (const html of pendingSurfaces) expect(html).not.toContain(`characters/${form.art}.png`);
        const state = createBattle(1, [starter.id], account.characters);
        const view = Object.create(BattleView.prototype);
        Object.assign(view, { session: { state } });
        const field = Reflect.apply(Reflect.get(BattleView.prototype, 'unit'), view, [state.allies[0]]);
        expect(field).not.toContain(`characters/${form.art}.png`);
        if (evolution < 6) {
          const next = characterArt(starter.id, evolution + 1);
          expect(characterDetail(starter, 'upgrade-0', account)).not.toContain(`characters/${next.art}.png`);
        }
        continue;
      }
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
        expect(preview).toContain('class="evolution-silhouette unreached-character-art"');
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
