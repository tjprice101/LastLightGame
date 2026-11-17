import { radiantKitText } from '../content/radiant-kit-text';
import { radiantFlareTierScale, radiantKits, type RadiantKitId, type RadiantSkillSlot } from '../content/radiant-kits';
import { radiantLeaderBonus, type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import type { ConvergentLightTier } from '../content/progression';

/** Scales applied to the tokens of an approved kit text template (see content/radiant-kit-text.ts). */
export interface RadiantKitTextScale { damage: number; effect: number; hits: number; leader: number }
const base: RadiantKitTextScale = { damage: 1, effect: 1, hits: 12, leader: 1 };

const exact = (value: number): string => String(Number(value.toFixed(2)));
const times = (value: number, word: boolean): string =>
  word && value === 3 ? 'triple' : word && value === 2 ? 'double' : `${exact(value)} times`;

/** Fills a kit text template; durations, counts and fixed bonuses are literal text and never scale. */
export function renderRadiantKitText(template: string, scale: RadiantKitTextScale = base): string {
  const text = template.replace(/\{(h|d|e|f|m|mw|l|ln)(?::([\d.]+))?\}/g, (_, token: string, raw?: string) => {
    if (token === 'h') return String(scale.hits);
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error(`Invalid kit text token: ${token}`);
    switch (token) {
      case 'd': return `${exact(value * scale.damage)}%`;
      case 'e': return `${exact(value * scale.effect)}%`;
      case 'f': return String(Math.round(value * scale.effect));
      case 'm': return times(value * scale.damage, false);
      case 'mw': return times(value * scale.damage, true);
      case 'l': return `${exact(value * scale.leader)}%`;
      default: return String(Math.round(value * scale.leader));
    }
  });
  if (/[{}]/.test(text)) throw new Error('Unresolved kit text token.');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const kitId = (id: RadiantBearerId): RadiantKitId => {
  if (!Object.hasOwn(radiantKitText, id)) throw new Error(`Missing kit text for ${id}.`);
  return id as RadiantKitId;
};

/** Skill 1 / Skill 2 tooltip text at base values (Skill Power is shown separately). */
export function radiantSkillText(id: RadiantBearerId, slot: RadiantSkillSlot): string {
  return renderRadiantKitText(radiantKitText[kitId(id)][slot === 1 ? 'skill1' : 'skill2']);
}

/** Flare text at a Convergent Light tier (N3 damage, effect and hit scaling; durations unchanged). */
export function radiantFlareText(id: RadiantBearerId, tier: ConvergentLightTier): string {
  const scale = radiantFlareTierScale[tier];
  return renderRadiantKitText(radiantKitText[kitId(id)].flare, { damage: scale.damage, effect: scale.effect, hits: scale.hits, leader: 1 });
}

/** Leader text with this loadout's Leader scaling (form and Leader equipment; 1 at form 1 with none). */
export function radiantLeaderSkillText(loadout: RadiantLoadout): string {
  return renderRadiantKitText(radiantKitText[kitId(loadout.starter)].leader, { ...base, leader: radiantLeaderBonus(loadout) / .2 });
}

export function radiantSkillName(id: RadiantBearerId, slot: RadiantSkillSlot | 'flare'): string {
  const kit = radiantKits[kitId(id)];
  return slot === 'flare' ? kit.flare.name : slot === 1 ? kit.skill1.name : kit.skill2.name;
}
