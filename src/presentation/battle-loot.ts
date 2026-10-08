import { type BattleEvent } from '../game/battle';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { lootRoll } from '../content/loot-random';
import { currencyArt } from './currency-icon';
import { getCreature } from '../content/creatures';
import { getConduit, isConduitId, conduitColor } from '../content/conduits';
import { mechanicalComponents } from '../content/mechanical-components';
import { createConduitUpgradeMeter } from './conduit-upgrade-meter';

export function lootMotion(random: () => number = Math.random) {
  return { size: .75 + lootRoll(random) * .6, scatter: (lootRoll(random) - .5) * 14,
    height: (lootRoll(random) - .5) * 24, duration: 850 + Math.floor(lootRoll(random) * 1000) };
}

export interface LootItem { id: string; name: string; amount: number; art?: string; color: string; upgradeLevel?: number }
export function lootItems(event: BattleEvent): LootItem[] {
  if (event.kind !== 'reward') throw new Error('Loot presentation requires a reward event.');
  return [
    { id: 'fractalis', name: 'Prismatica', amount: event.amount, art: undefined, color: '#ffffff' },
    ...(event.lycalis ? [{ id: 'lycalis', name: 'Null-Prismatica', amount: event.lycalis, art: undefined, color: '#ffffff' }] : []),
    ...(event.mechanicalComponents ? [{ id: mechanicalComponents.id, name: mechanicalComponents.name, amount: event.mechanicalComponents, color: '#ffffff' }] : []),
    ...Object.entries(event.conduits ?? {}).map(([id, amount]) => {
      if (!isConduitId(id)) throw new Error('Unknown Conduit in loot receipt.');
      const conduit = getConduit(id);
      return { id: `conduit:${id}`, name: `${conduit.name} ~ ${conduit.rarity} Conduit`, amount, art: conduit.art ?? undefined, color: conduitColor(conduit), upgradeLevel: event.conduitUpgrades?.[id] ?? 0 };
    }),
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
    : item.id === mechanicalComponents.id ? currencyArt('mechanical-components')
    : item.art ? assetUrl(`${item.id.startsWith('conduit:') ? 'conduits' : item.id.startsWith('capture:') ? 'enemies' : 'materials'}/${item.art}.png`) : undefined;
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
      if (item.upgradeLevel !== undefined) {
        const marker = createConduitUpgradeMeter(item.upgradeLevel);
        marker.className += ' loot-upgrade-marker';
        drop.append(marker);
      }
    } else {
      const token = document.createElement('span');
      token.className = 'loot-token';
      token.textContent = item.id === mechanicalComponents.id ? 'Artwork pending' : item.name.split(' ')[0];
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
