import { type BattleEvent } from '../game/battle';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { lootRoll } from '../content/loot-random';
import { currencyArt } from './currency-icon';
import { getCreature } from '../content/creatures';

export function lootMotion(random: () => number = Math.random) {
  return { size: .75 + lootRoll(random) * .6, scatter: (lootRoll(random) - .5) * 14,
    height: (lootRoll(random) - .5) * 24, duration: 850 + Math.floor(lootRoll(random) * 1000) };
}

export function lootItems(event: BattleEvent) {
  if (event.kind !== 'reward') throw new Error('Loot presentation requires a reward event.');
  return [
    { id: 'fractalis', name: 'Fractalis', amount: event.amount, art: undefined, color: '#ffffff' },
    ...(event.lycalis ? [{ id: 'lycalis', name: 'Lycalis', amount: event.lycalis, art: undefined, color: '#ffffff' }] : []),
    ...Object.entries(event.materials ?? {}).map(([id, amount]) => ({
      id, name: materialName(id), amount, art: materialArt(id),
      color: id.startsWith('heavens-') ? '#ff7474' : id.startsWith('abyss-') ? '#ff70dd'
        : id.endsWith('-omnic') ? '#ff85d9' : id.endsWith('-legendary') ? '#ffd473'
          : id.endsWith('-epic') ? '#c898ff' : id.endsWith('-rare') ? '#79caff'
            : id.endsWith('-uncommon') ? '#9ee899' : '#ffffff',
    })),
    ...(event.capture ? [{ id: `capture:${event.capture.creatureId}`, name: `${getCreature(event.capture.creatureId).name} creature`,
      amount: 1, art: getCreature(event.capture.creatureId).art, color: '#f3df9b' }] : []),
  ];
}

export function lootArt(item: { id: string; art?: string }): string | undefined {
  return item.id === 'fractalis' ? currencyArt('fractalis')
    : item.id === 'lycalis' ? currencyArt('lycalis')
    : item.art ? assetUrl(`${item.id.startsWith('capture:') ? 'enemies' : 'materials'}/${item.art}.png`) : undefined;
}

export function lootBurst(event: BattleEvent, random: () => number = Math.random): HTMLElement {
  const burst = document.createElement('div');
  burst.className = 'battle-loot';
  burst.setAttribute('role', 'status');
  burst.setAttribute('aria-label', `Collected ${lootItems(event).map((item) => `${item.amount} ${item.name}`).join(', ')}`);
  const items = lootItems(event);
  items.forEach((item, index) => {
    const motion = lootMotion(random);
    const drop = document.createElement('span');
    drop.className = 'loot-drop';
    drop.style.setProperty('--loot-color', item.color);
    drop.style.setProperty('--loot-x', `${(index - (items.length - 1) / 2) * 38 + motion.scatter}px`);
    drop.style.setProperty('--loot-y', `${motion.height}px`);
    drop.style.setProperty('--loot-size', String(motion.size));
    drop.dataset.pickupDuration = String(motion.duration);
    const beam = document.createElement('span');
    beam.className = 'loot-beam';
    drop.append(beam);
    const artwork = lootArt(item);
    if (artwork) {
      const image = document.createElement('img');
      image.src = artwork;
      image.alt = '';
      drop.append(image);
    } else {
      const token = document.createElement('span');
      token.className = 'loot-token';
      token.textContent = item.name.split(' ')[0];
      drop.append(token);
    }
    const quantity = document.createElement('strong');
    quantity.textContent = `+${item.amount}`;
    drop.title = `${item.name} +${item.amount}`;
    drop.append(quantity);
    burst.append(drop);
  });
  return burst;
}
