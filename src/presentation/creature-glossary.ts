import { creatures, getCreature, creatureLoot } from '../content/creatures';
import { materialArt, materialName } from '../content/dungeon-art';
import { formatStat } from '../content/combat';
import { type Account } from '../game/account';
import { assetUrl } from './portrait';
import { currencyIcon } from './currency-icon';
import { itemShowcase } from './item-showcase';
import { elementLabel } from './element-label';
import { creatureSaleValue } from '../content/infusions';
import { isCurrencyMode } from '../content/activities';
import { getConduit, isConduitId, type ConduitUpgrades } from '../content/conduits';
import { conduitIcon } from './conduit-store';
import { mechanicalComponents } from '../content/mechanical-components';
import { mechanicalComponentIcon } from './mechanical-component-icon';

function lootTable(id: string, stage?: number, upgrades?: ConduitUpgrades): string {
  const creature = getCreature(id);
  const sale = creature.mode && isCurrencyMode(creature.mode) ? creatureSaleValue(creature.mode, Number(creature.id.split(':').at(-1))) : null;
  return `<table><caption>Per-enemy loot at ${creature.stages.length ? `Stage ${stage}` : `Enemy level ${stage ?? 1}`}</caption>
    <thead><tr><th>Drop</th><th>Amount</th><th>Chance</th></tr></thead><tbody>${creatureLoot(getCreature(id), stage).map((drop) => {
      const currency = drop.id === 'fractalis' || drop.id === 'lycalis' ? drop.id : null;
      const conduit = isConduitId(drop.id) ? getConduit(drop.id) : null;
      if (drop.id === mechanicalComponents.id) return `<tr><td>${mechanicalComponentIcon()} ${mechanicalComponents.name}<small>${drop.note ?? ''}</small></td><td>${drop.minimum}-${drop.maximum}</td><td>${formatStat(drop.chance * 100)}%</td></tr>`;
      const art = currency || conduit ? undefined : materialArt(drop.id);
      return `<tr><td>${currency ? currencyIcon(currency) : conduit ? conduitIcon(conduit.id, upgrades?.[conduit.id]) : art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" width="28" height="28">` : ''}
        ${currency === 'fractalis' ? 'Prismatica' : currency === 'lycalis' ? 'Null-Prismatica' : conduit ? `${conduit.name} ~ ${conduit.rarity}` : materialName(drop.id)}${drop.note ? `<small>${drop.note}</small>` : ''}</td>
        <td>${drop.minimum}-${drop.maximum}</td><td>${formatStat(drop.chance * 100)}%</td></tr>`;
    }).join('')}</tbody></table>${sale ? itemShowcase([{ id: 'fractalis', amount: sale.fractalis }, ...(sale.lycalis ? [{ id: 'lycalis', amount: sale.lycalis }] : [])], 'Sale value') : ''}`;
}

export function creatureGlossary(account: Account | null): string {
  if (!account) return '<p class="status" role="alert">Creature discoveries unavailable. Resolve the progression save error.</p>';
  const seen = creatures.filter((creature) => account.creatures[creature.id]);
  const defeated = seen.filter((creature) => account.creatures[creature.id].defeated);
  const areas = [...new Set(creatures.map((creature) => creature.area))];
  return `<div class="glossary-heading"><p>${seen.length} ~ ${creatures.length} discovered &middot; ${defeated.length} defeated</p>
    <label>Activity <select id="glossary-area"><option value="">All activities</option>${areas.map((area) => `<option>${area}</option>`).join('')}</select></label>
    </div>
    <div class="glossary-grid">${creatures.map((creature) => {
      const discovery = account.creatures[creature.id];
      const name = discovery ? creature.name : 'Undiscovered creature';
      const stage = creature.stages[0] ?? 1;
      return `<article class="glossary-card ${discovery ? 'discovered' : 'undiscovered'}" data-creature="${creature.id}" data-area="${creature.area}">
        <div class="glossary-art">${creature.art ? `<img src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${name}" width="220" height="220">`
          : '<svg viewBox="0 0 100 100" aria-label="Creature artwork not supplied" role="img"><path d="M15 70Q0 40 25 35L20 10 40 25Q55 15 65 25L85 10 80 40Q100 65 80 80Q45 100 15 70Z" fill="currentColor"/></svg>'}</div>
        <h2>${name}</h2>${discovery ? elementLabel(creature.element) : '<span class="quiet">Element undiscovered</span>'}<p>${creature.area}${creature.stages.length ? ` ~ Stages ${stage}-${creature.stages.at(-1)}` : ''}</p>
        ${discovery ? `<strong>${discovery.defeated ? 'Defeated' : 'Encountered'}</strong>` : ''}
        ${discovery?.defeated ? `<section class="creature-loot"><h3>Drop pool and chances</h3>
          <label>${creature.stages.length ? 'Stage' : 'Enemy level'} <select data-loot-stage="${creature.id}">${(creature.stages.length ? creature.stages : Array.from({ length: 120 }, (_, index) => index + 1)).map((value) => `<option>${value}</option>`).join('')}</select></label>
          <div class="glossary-loot">${lootTable(creature.id, stage, account.conduitUpgrades)}</div></section>` : ''}
        ${discovery && !creature.art ? '<p class="quiet">Artwork pending</p>' : ''}
      </article>`;
    }).join('')}</div>`;
}

export function bindCreatureGlossary(host: HTMLElement, upgrades?: ConduitUpgrades): void {
  host.querySelector<HTMLSelectElement>('#glossary-area')?.addEventListener('change', (event) => {
    const select = event.currentTarget;
    if (!(select instanceof HTMLSelectElement)) throw new Error('Glossary activity selector is missing.');
    host.querySelectorAll<HTMLElement>('[data-creature]').forEach((card) => { card.hidden = !!select.value && card.dataset.area !== select.value; });
  });
  host.querySelectorAll<HTMLSelectElement>('[data-loot-stage]').forEach((select) => {
    select.addEventListener('change', () => {
      const id = select.dataset.lootStage;
      const target = select.closest('article')?.querySelector('.glossary-loot');
      if (!id || !target) throw new Error('Glossary loot panel is missing.');
      target.innerHTML = lootTable(id, Number(select.value), upgrades);
    });
  });
}
