// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { radiantFlareCutin } from './battle-cutin';

describe('Convergent Light cinematics cut-in (D-490)', () => {
  const input = (tier: 'sparkling' | 'glimmering' | 'ultimate') => ({ name: 'Ember, <b>Infernis</b>', flare: 'Dawnfire <i>', tier,
    tierLabel: tier === 'ultimate' ? 'Ultimate Convergence of Light' : `${tier} Convergent Light`,
    art: '<span class="radiant-art-pending">Artwork pending</span>', color: '#ff8a5c' });
  it('escalates by tier: band, gilded band with shards, then a full-screen takeover', () => {
    const sparkling = radiantFlareCutin(input('sparkling'));
    const glimmering = radiantFlareCutin(input('glimmering'));
    const ultimate = radiantFlareCutin(input('ultimate'));
    for (const panel of [sparkling, glimmering, ultimate]) {
      expect(panel.getAttribute('aria-hidden')).toBe('true');
      expect(panel.querySelector('.cutin-portrait .radiant-art-pending')).not.toBeNull();
    }
    expect(sparkling.querySelector('.cutin-glint')).not.toBeNull();
    expect(sparkling.querySelector('.cutin-shards, .cutin-bar')).toBeNull();
    expect(glimmering.querySelectorAll('.cutin-shards i')).toHaveLength(7);
    expect(glimmering.classList.contains('cutin-takeover')).toBe(false);
    expect(ultimate.classList.contains('cutin-takeover')).toBe(true);
    expect(ultimate.dataset.tier).toBe('ultimate');
    for (const part of ['.cutin-bar-top', '.cutin-bar-bottom', '.cutin-speedlines', '.cutin-halo', '.cutin-sigil', '.cutin-name-sheen', '.cutin-wipe'])
      expect(ultimate.querySelector(part), part).not.toBeNull();
    expect(ultimate.querySelector('.cutin-crest, .cutin-shards')).toBeNull();
  });
  it('sets identity text as text, never markup', () => {
    const panel = radiantFlareCutin(input('ultimate'));
    expect(panel.querySelector('.cutin-copy small')!.textContent).toBe('ULTIMATE CONVERGENCE OF LIGHT');
    expect(panel.querySelector('.cutin-copy strong')!.textContent).toBe('Ember, <b>Infernis</b>');
    expect(panel.querySelector('.cutin-copy > span')!.textContent).toBe('Dawnfire <i>');
    expect(panel.querySelector('.cutin-copy b, .cutin-copy > span i')).toBeNull();
  });
});
