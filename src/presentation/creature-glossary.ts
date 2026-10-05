import { creatures, getCreature, creatureLoot } from '../content/creatures';
import { materialArt, materialName } from '../content/dungeon-art';
import { formatStat } from '../content/combat';
import { type Account } from '../game/account';
import { assetUrl } from './portrait';
import { currencyIcon } from './currency-icon';

function lootTable(id: string, stage?: number): string {
  const creature = getCreature(id);
  return `<table><caption>Per-enemy loot at ${creature.stages.length ? `Stage ${stage}` : `Enemy level ${stage ?? 1}`}</caption>
    <thead><tr><th>Drop</th><th>Amount</th><th>Chance</th></tr></thead><tbody>${creatureLoot(getCreature(id), stage).map((drop) => {
      const art = drop.id === 'fractalis' ? undefined : materialArt(drop.id);
      return `<tr><td>${drop.id === 'fractalis' ? currencyIcon('fractalis') : art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" width="28" height="28">` : ''}
        ${drop.id === 'fractalis' ? 'Fractalis' : materialName(drop.id)}${drop.note ? `<small>${drop.note}</small>` : ''}</td>
        <td>${drop.minimum}-${drop.maximum}</td><td>${formatStat(drop.chance * 100)}%</td></tr>`;
    }).join('')}</tbody></table><p class="quiet">Independent rarity rolls. Quantity varies uniformly within each range. No capture or pity.</p>`;
}

export function creatureGlossary(account: Account | null): string {
  if (!account) return '<p class="status" role="alert">Creature discoveries unavailable. Resolve the progression save error.</p>';
  const seen = creatures.filter((creature) => account.creatures[creature.id]);
  const defeated = seen.filter((creature) => account.creatures[creature.id].defeated);
  const areas = [...new Set(creatures.map((creature) => creature.area))];
  return `<div class="glossary-heading"><p>${seen.length} / ${creatures.length} discovered &middot; ${defeated.length} defeated</p>
    <label>Activity <select id="glossary-area"><option value="">All activities</option>${areas.map((area) => `<option>${area}</option>`).join('')}</select></label>
    <p class="quiet">Encounter a creature to reveal its art and name. Defeat it once to reveal its stage-specific loot pool. Saved on this browser.</p></div>
    <div class="glossary-grid">${creatures.map((creature) => {
      const discovery = account.creatures[creature.id];
      const name = discovery ? creature.name : 'Undiscovered creature';
      const stage = creature.stages[0] ?? 1;
      return `<article class="glossary-card ${discovery ? 'discovered' : 'undiscovered'}" data-creature="${creature.id}" data-area="${creature.area}">
        <div class="glossary-art">${creature.art ? `<img src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${name}" width="220" height="220">`
          : '<svg viewBox="0 0 100 100" aria-label="Creature artwork not supplied" role="img"><path d="M15 70Q0 40 25 35L20 10 40 25Q55 15 65 25L85 10 80 40Q100 65 80 80Q45 100 15 70Z" fill="currentColor"/></svg>'}</div>
        <h2>${name}</h2><p>${creature.area}${creature.stages.length ? ` / Stages ${stage}-${creature.stages.at(-1)}` : ''}</p>
        <strong>${discovery?.defeated ? 'Defeated / Loot revealed' : discovery ? 'Encountered / Loot locked' : 'Not encountered'}</strong>
        ${discovery?.defeated ? `<details><summary>Drop pool and chances</summary>
          <label>${creature.stages.length ? 'Stage' : 'Enemy level'} <select data-loot-stage="${creature.id}">${(creature.stages.length ? creature.stages : Array.from({ length: 120 }, (_, index) => index + 1)).map((value) => `<option>${value}</option>`).join('')}</select></label>
          <div class="glossary-loot">${lootTable(creature.id, stage)}</div></details>`
          : '<p class="quiet">Defeat this creature to reveal its drops.</p>'}
        ${discovery && !creature.art ? '<p class="quiet">Artwork pending; no other enemy art is substituted.</p>' : ''}
      </article>`;
    }).join('')}</div>`;
}

export function bindCreatureGlossary(host: HTMLElement): void {
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
      target.innerHTML = lootTable(id, Number(select.value));
    });
  });
}
