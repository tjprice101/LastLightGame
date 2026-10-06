import { type Combatant } from '../game/battle';

export interface AttackFlair {
  power: number;
  rings: number;
  rays: number;
  sparks: number;
  size: number;
  duration: number;
  family: 'flame' | 'tide' | 'bloom' | 'radiant' | 'void' | 'force';
}

export function attackFlair(unit: Combatant, action: string | undefined, enhancedAttack = false): AttackFlair {
  const level = unit.level ?? 0;
  const evolution = unit.evolution ?? 1;
  if (!Number.isInteger(level) || level < 0 || !Number.isInteger(evolution) || evolution < 1 || evolution > 6) {
    throw new Error('Attack flair requires valid combatant progression.');
  }
  const growth = unit.side === 'ally' ? Math.min(1, level / 105 * .65 + (evolution - 1) / 5 * .35)
    : Math.min(1, level / 120);
  const skill = enhancedAttack || action !== 'light' && action !== undefined;
  const ultimate = action === 'ultimate';
  const power = growth ** 1.5;
  const family = unit.creatureId?.startsWith('infusion:heavens:') || unit.creatureId?.startsWith('infusion:treasury:') || unit.creatureId?.startsWith('infusion:sanctuary:') ? 'radiant'
    : unit.creatureId?.startsWith('infusion:abyss:') ? 'void'
    : unit.definitionId === 'ember' || unit.creatureId?.startsWith('dungeon:infernic:') ? 'flame'
    : unit.definitionId === 'tide' || unit.creatureId?.startsWith('dungeon:aquatic:') ? 'tide'
    : unit.definitionId === 'sprout' || unit.creatureId?.startsWith('dungeon:efflorescent:') ? 'bloom' : 'force';
  return { power, family, rings: 1 + Math.floor(power * 3) + Number(ultimate),
    rays: Math.floor(power * (ultimate ? 12 : skill ? 9 : 6)),
    sparks: 4 + Math.floor(power * (ultimate ? 28 : skill ? 22 : 16)),
    size: 1 + power * .8 + (ultimate ? .45 : skill ? .2 : 0),
    duration: (ultimate ? 650 : skill ? 430 : 310) + Math.round(power * 160) };
}

export function attackEffectMarkup(flair: AttackFlair): string {
  return `<span class="flair-core"></span>${Array.from({ length: flair.rings }, (_, index) =>
    `<span class="flair-ring" style="--ring:${index};--rotation:${index * 37}deg"></span>`).join('')}
    ${Array.from({ length: flair.rays }, (_, index) =>
    `<span class="flair-ray" style="--rotation:${index * 360 / flair.rays}deg"></span>`).join('')}
    ${Array.from({ length: flair.sparks }, (_, index) => {
      const angle = index * 2.399963;
      const radius = 45 + index % 4 * 16;
      return `<span class="flair-spark" style="--spark-x:${Math.cos(angle) * radius}%;--spark-y:${Math.sin(angle) * radius}%;--flight-x:${Math.cos(angle) * radius}px;--flight-y:${Math.sin(angle) * radius}px;--rotation:${index * 137.5}deg;--spark-delay:${index % 5 * 18}ms"></span>`;
    }).join('')}`;
}
