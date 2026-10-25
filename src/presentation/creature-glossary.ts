import { creatures, getCreature, creatureLoot, creatureLore } from '../content/creatures';
import { materialArt, materialName } from '../content/dungeon-art';
import { formatStat } from '../content/combat';
import { type Account } from '../game/account';
import { assetUrl } from './portrait';
import { currencyIcon } from './currency-icon';
import { elementLabel } from './element-label';
import { getConduit, isConduitId, type ConduitUpgrades } from '../content/conduits';
import { conduitIcon, conduitDetails } from './conduit-store';
import { conduitElement } from './conduit-element';
import { mechanicalComponents } from '../content/mechanical-components';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { masterChest } from '../content/master-conduits';
import { information } from './information';
import { calamityChest, calamityEncounter, isCalamityTier, parseCalamityChestId } from '../content/calamity';
import { calamityChestIcon } from './calamity';

function lootTable(id: string, stage?: number, upgrades?: ConduitUpgrades): string {
  const creature = getCreature(id);
  const drops = creatureLoot(creature, stage);
  const rollNotes = [...new Set(drops.flatMap(drop => drop.note && !creature.story ? [drop.note] : []))];
  return `<table><caption>Per-enemy loot at ${creature.id.startsWith('calamity:') ? `EX+${stage}` : creature.stages.length ? `Stage ${stage}` : `Enemy level ${stage ?? 1}`}</caption>
    <colgroup><col class="loot-drop-column"><col><col></colgroup>
    <thead><tr><th scope="col">Drop</th><th scope="col">Amount</th><th scope="col">Chance</th></tr></thead><tbody>${drops.map((drop) => {
      const currency = drop.id === 'fractalis' || drop.id === 'lycalis' ? drop.id : null;
      const conduit = isConduitId(drop.id) ? getConduit(drop.id) : null;
      if (drop.id.startsWith('capture:')) return `<tr><td><strong>${creature.name} · Playable copy</strong></td><td>1</td><td>${formatStat(drop.chance * 100)}%</td></tr>`;
      if (drop.id.startsWith('calamity:')) {
        const { activity, tier } = parseCalamityChestId(drop.id);
        return `<tr><td>${calamityChestIcon(tier)}<strong>${calamityChest(activity, tier).name}</strong><small>Sealed chest · Open in Inventory</small></td><td>${drop.minimum}-${drop.maximum}</td><td>${formatStat(drop.chance * 100)}%</td></tr>`;
      }
      if (drop.id === masterChest.id) return `<tr><td>${masterChest.name}</td><td>1</td><td>${formatStat(drop.chance * 100)}%</td></tr>`;
      if (drop.id === mechanicalComponents.id) return `<tr><td>${mechanicalComponentIcon()} <strong>${mechanicalComponents.name}</strong></td><td>${drop.minimum}-${drop.maximum}</td><td>${formatStat(drop.chance * 100)}%</td></tr>`;
      const art = currency || conduit ? undefined : materialArt(drop.id);
      return `<tr><td>${currency ? currencyIcon(currency) : conduit ? conduitIcon(conduit.id, upgrades?.[conduit.id]) : art ? `<img draggable="false" src="${assetUrl(`materials/${art}.png`)}" alt="" width="28" height="28">` : ''}
        <strong>${currency === 'fractalis' ? 'Prismatica' : currency === 'lycalis' ? 'Null-Prismatica' : conduit ? `${conduit.name} · ${conduit.rarity}` : materialName(drop.id)}</strong>${conduit ? conduitElement(conduit.id) : ''}        ${drop.note && creature.story ? `<small>${drop.note}</small>` : ''}
        ${conduit ? information(`loot-conduit-${id}-${conduit.id}`, conduit.name, conduitDetails(conduit.id, upgrades?.[conduit.id]), 'View Details') : ''}</td>
        <td>${drop.minimum}-${drop.maximum}</td><td>${formatStat(drop.chance * 100)}%</td></tr>`;
    }).join('')}</tbody></table>${rollNotes.length ? `<section class="loot-roll-notes" aria-label="Drop roll rules">${rollNotes.map(note => `<p>${note}</p>`).join('')}</section>` : ''}`;
}

export function creatureGlossary(account: Account | null): string {
  if (!account) return '<p class="status" role="alert">Elemental-Devourer and Machine discoveries unavailable. Resolve the progression save error.</p>';
  const seen = creatures.filter((creature) => account.creatures[creature.id]);
  const defeated = seen.filter((creature) => account.creatures[creature.id].defeated);
  const areas = [...new Set(creatures.map((creature) => creature.area))];
  return `<div class="glossary-heading"><p>${seen.length} / ${creatures.length} discovered &middot; ${defeated.length} defeated</p>
    <label>Activity <select id="glossary-area"><option value="">All activities</option>${areas.map((area) => `<option>${area}</option>`).join('')}</select></label>
    </div>
    <div class="glossary-grid">${creatures.map((creature) => {
      const discovery = account.creatures[creature.id];
      const kind = creature.calamity ? 'Calamity boss' : creature.mode === 'machines' ? 'Machine' : 'Elemental-Devourer';
      const name = discovery ? creature.name : `Undiscovered ${kind}`;
      const stage = creature.stages[0] ?? 1;
      return `<article class="glossary-card ${discovery ? 'discovered' : 'undiscovered'}" data-creature="${creature.id}" data-area="${creature.area}">
        <div class="glossary-art">${creature.art ? `<img ${creature.calamity && discovery ? 'class="calamity-boss-contrast"' : ''} draggable="false" src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${name}" width="220" height="220">`
          : creature.calamity ? `<span class="calamity-placeholder">${name} · Artwork pending</span>` : `<svg viewBox="0 0 100 100" aria-label="${kind} artwork not supplied" role="img"><path d="M15 70Q0 40 25 35L20 10 40 25Q55 15 65 25L85 10 80 40Q100 65 80 80Q45 100 15 70Z" fill="currentColor"/></svg>`}</div>
        <h2>${name}</h2>${discovery ? elementLabel(creature.element) : '<span class="quiet">Element undiscovered</span>'}<p>${creature.area}${creature.calamity ? ' · EX+1-EX+3 · Not capturable' : creature.stages.length ? ` · Stages ${stage}-${creature.stages.at(-1)}` : ''}</p>
        ${discovery ? `<strong>${discovery.defeated ? 'Defeated' : 'Encountered'}</strong>` : ''}
        ${discovery ? information(`creature-lore-${creature.id}`, creature.name, `<p>${creatureLore(creature)}</p>`, 'Lore') : ''}
        ${discovery && !creature.art ? '<p class="quiet">Artwork pending</p>' : ''}
        ${discovery?.defeated ? information(`creature-loot-${creature.id}`, `${creature.name} · Loot`, `<section class="creature-loot"><h3>Drop pool and chances</h3>
          <p>Drop chances are per enemy at the selected stage. Only drops marked 100% are guaranteed.</p>
          <label>${creature.calamity ? 'EX tier' : creature.stages.length ? 'Stage' : 'Enemy level'} <select data-loot-stage="${creature.id}">${(creature.stages.length ? creature.stages : Array.from({ length: 120 }, (_, index) => index + 1)).map((value) => `<option value="${value}">${creature.calamity && isCalamityTier(value) ? `EX+${value} · Lv.${calamityEncounter(creature.calamity, value).level}` : value}</option>`).join('')}</select></label>
          <div class="glossary-loot">${lootTable(creature.id, stage, account.conduitUpgrades)}</div></section>`, 'View Loot')
          : '<button type="button" class="text-button" disabled>View Loot</button><p class="quiet">Defeat this enemy to reveal its loot.</p>'}
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
