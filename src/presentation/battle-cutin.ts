import { type BattleEvent, type Combatant } from '../game/battle';
import { assetUrl } from './portrait';
import { unitFacingAttributes } from './unit-facing';
import { isStarterId } from '../content/starters';
import { attackFlair, signatureMarkup } from './battle-effects';

export function portraitCue(unit: Combatant, event: BattleEvent) {
  const action = event.action;
  if (event.kind !== 'attack' || action !== 'ultimate') return null;
  if (unit.side === 'enemy' && (unit.level ?? 0) < 50) return null;
  const ultimate = action === 'ultimate';
  const power = attackFlair(unit, action).power;
  const name = event.abilityName ?? (unit.side === 'ally' ? unit.kit?.abilities[action].name
    : unit.enemySkills?.find((skill) => skill.action === action)?.name);
  if (!name) throw new Error('Portrait cut-in requires an ability name.');
  return { ultimate, power, name, duration: 3500 };
}

export function portraitCutin(unit: Combatant, cue: NonNullable<ReturnType<typeof portraitCue>>, art: string | null, color: string): HTMLElement {
  const panel = document.createElement('div');
  const flair = attackFlair(unit, cue.ultimate ? 'ultimate' : 'skill1');
  panel.className = `portrait-cutin cutin-${unit.side}${cue.ultimate ? ' cutin-ultimate' : ''}`;
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-label', `${unit.name} · ${cue.name}${cue.ultimate ? ' · Ultimate' : ''}`);
  panel.style.setProperty('--element', color);
  panel.style.setProperty('--cutin-power', String(cue.power));
  panel.innerHTML = `<span class="cutin-architecture" aria-hidden="true">${signatureMarkup(flair)}</span><span class="cutin-streaks" aria-hidden="true"></span><span class="cutin-sigil" aria-hidden="true"></span>
    <span class="cutin-crest" aria-hidden="true"><span></span></span><span class="cutin-edge cutin-edge-top" aria-hidden="true"></span><span class="cutin-edge cutin-edge-bottom" aria-hidden="true"></span>
    <span class="cutin-portrait" aria-hidden="true">${art ? `<img ${unit.definitionId.startsWith('calamity:') ? 'class="calamity-boss-contrast"' : ''} src="${assetUrl(`${isStarterId(unit.definitionId) && !unit.captured ? 'characters' : 'enemies'}/${art}.png`)}" alt="" ${unitFacingAttributes(art, unit.side)} width="960" height="960">`
      : '<span class="pending-enemy-art"><span></span></span>'}</span>
    <span class="cutin-copy"><small>${cue.ultimate ? unit.boss ? 'BOSS ULTIMATE' : 'LAST FLARE' : unit.side === 'enemy' ? 'ENEMY SKILL' : 'SKILL RELEASE'}</small><strong></strong><span></span><i class="cutin-divider" aria-hidden="true"></i></span>`;
  const name = panel.querySelector('.cutin-copy strong');
  const ability = panel.querySelector('.cutin-copy > span');
  if (!name || !ability) throw new Error('Portrait cut-in identity region is missing.');
  name.textContent = unit.name;
  ability.textContent = cue.name;
  return panel;
}

export interface RadiantFlareCutinInput {
  /** Display name, "Prefix, Character name". */
  name: string;
  /** Saved Convergent Light offer name. */
  flare: string;
  tier: 'sparkling' | 'glimmering' | 'ultimate';
  tierLabel: string;
  /** Trusted portrait markup from `radiantAllyArt` (escaped at its source). */
  art: string;
  color: string;
}
const radiantCutinPower = { sparkling: .35, glimmering: .65, ultimate: 1 } as const;
/**
 * Convergent Light cut-in (D-490), presentation only and pointer-transparent. Sparkling and Glimmering use
 * the diagonal band (Glimmering adds gold edges and prismatic shards); Ultimate is a full-screen takeover
 * with letterbox bars, speed lines, a turning sigil, a name sheen and a closing wipe. The view animates it.
 */
export function radiantFlareCutin(input: RadiantFlareCutinInput): HTMLElement {
  const panel = document.createElement('div');
  const ultimate = input.tier === 'ultimate';
  panel.className = `portrait-cutin cutin-ally cutin-radiant${ultimate ? ' cutin-ultimate cutin-takeover' : ''}`;
  panel.dataset.tier = input.tier;
  panel.setAttribute('aria-hidden', 'true');
  panel.style.setProperty('--element', input.color);
  panel.style.setProperty('--cutin-power', String(radiantCutinPower[input.tier]));
  const copy = `<span class="cutin-copy"><small></small><strong></strong><span></span><i class="cutin-divider"></i>${
    ultimate ? '<i class="cutin-name-sheen"></i>' : ''}</span>`;
  panel.innerHTML = ultimate
    ? `<span class="cutin-speedlines"></span><span class="cutin-halo"></span><span class="cutin-sigil"></span>
    <span class="cutin-portrait">${input.art}</span>${copy}
    <span class="cutin-bar cutin-bar-top"></span><span class="cutin-bar cutin-bar-bottom"></span><span class="cutin-wipe"></span>`
    : `<span class="cutin-streaks"></span><span class="cutin-sigil"></span>${
      input.tier === 'glimmering' ? `<span class="cutin-shards">${'<i></i>'.repeat(7)}</span>` : ''}
    <span class="cutin-crest"><span></span></span><span class="cutin-edge cutin-edge-top"></span><span class="cutin-edge cutin-edge-bottom"></span>
    <span class="cutin-portrait">${input.art}</span><span class="cutin-glint"></span>${copy}`;
  panel.querySelector('.cutin-copy small')!.textContent = input.tierLabel.toUpperCase();
  panel.querySelector('.cutin-copy strong')!.textContent = input.name;
  panel.querySelector('.cutin-copy > span')!.textContent = input.flare;
  return panel;
}
