import { starters } from '../content/starters';
import { characterName } from '../content/character-art';
import { evolutionRarity } from '../content/progression';
import { elements, materialRarities } from '../content/activities';
import { resolveFighter, formatStat } from '../content/combat';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';
import { conduits, conduitEffect } from '../content/conduits';
import { referencedEffect as readableEffect } from './effect-copy';
import { ownedProgress, type Account } from '../game/account';
import { portrait, assetUrl } from './portrait';
import { creatures } from '../content/creatures';
import { capturedRating } from './owned-companion';
import { characterRating } from './character-rating';
import { characterRole } from './character-role';
import { conduitIcon, conduitRarity, conduitDetails, conduitLore } from './conduit-store';
import { conduitElementLabel, conduitElementTheme, omnicTheme } from './conduit-element';
import { calamiticStoreUnlocked } from '../content/calamitic-conduits';
import { creatureGlossary } from './creature-glossary';
import { elementLabel } from './element-label';
import { information } from './information';
import { abilityStatuses, kitResource } from './ability-status';
import './archives.css';
import { masterChest, masterConduits } from '../content/master-conduits';
import { masterConduitIcon } from './master-conduits';
import { getStarter } from '../content/starters';

const galleries = [
  { id: 'characters', name: 'Character Archive', subtitle: 'Element-Bearers · Forms · Combat kits' },
  { id: 'conduits', name: 'Conduit Archive', subtitle: 'Ancient mechanisms · Effects · Ownership' },
  { id: 'creatures', name: 'Elemental-Devourer &amp; Machine Glossary', subtitle: 'Discoveries · Elements · Enemy loot' },
] as const;
export type ArchiveGallery = (typeof galleries)[number]['id'];

function characterArchive(account: Account | null): string {
  const capturedForms = creatures.filter((creature) => creature.mode && creature.mode !== 'machines');
  const total = starters.length * 6 + capturedForms.length;
  return `<div class="archive-filters" role="group" aria-label="Character archive filters">
      <label>Element<select data-character-filter="element"><option value="">All elements</option>${elements.map((element) => `<option value="${element.id}">${element.name}</option>`).join('')}</select></label>
      <label>Rarity<select data-character-filter="rarity"><option value="">All rarities</option>${materialRarities.map((rarity) => `<option>${rarity}</option>`).join('')}</select></label>
      <label>Ownership<select data-character-filter="ownership"><option value="">All characters</option><option value="owned">Owned</option><option value="unowned">Not owned</option></select></label>
      <label>Form discovery<select data-character-filter="discovery"><option value="">All forms</option><option value="revealed">Reached</option><option value="locked">Unreached</option></select></label>
      <label>Stars<select data-character-filter="stars"><option value="">All stars</option>${[1, 2, 3, 4, 5, 6].map((stars) => `<option value="${stars}">${stars}-star</option>`).join('')}</select></label>
      <button class="text-button" data-reset-character-filters>Reset filters</button>
    </div><div class="archive-results-toolbar"><p data-character-filter-result role="status">${total} / ${total} forms shown</p>
      <div class="ref-archive-manage"><button class="ref-link" data-page="character">Manage Element-Bearers →</button></div></div>
    <div class="archive-grid">${starters.flatMap((starter) => {
      const owned = !!account?.characters[starter.id];
      const progress = owned && account ? ownedProgress(account, starter.id) : undefined;
      return Array.from({ length: 6 }, (_, index) => {
      const evolution = index + 1;
      const revealed = !!progress && progress.evolution >= evolution;
      const current = progress?.evolution === evolution;
      const kit = resolveFighter(starter.id, current ? progress : { level: 0, evolution, weaponRank: 0 }, current ? account?.conduitEquipment?.[starter.id] : undefined, current ? account?.conduitUpgrades : undefined,
        current ? account?.masterEquipment?.[starter.id] ?? undefined : undefined);
      return `<article class="archive-card ${revealed ? 'archive-form-revealed' : 'archive-form-locked'}" data-archive-character="${starter.id}" data-form="${evolution}" data-filter-element="${starter.elementId}" data-filter-rarity="${evolutionRarity(evolution)}" data-filter-ownership="${!account ? 'unavailable' : owned ? 'owned' : 'unowned'}" data-filter-discovery="${!account ? 'unavailable' : revealed ? 'revealed' : 'locked'}" data-filter-stars="${starter.stars}">
        <div class="archive-portrait${revealed ? '' : ' unreached-character-art'}">${portrait(starter, evolution)}</div>
        <h3>${characterName(starter.id, evolution)} · Evo.${evolution}</h3>
        ${elementLabel(starter.elementId)}${characterRating(starter.id, evolution)}
        <p class="archive-ownership">${!account ? 'Ownership unavailable' : !owned ? 'Not owned' : current ? `Current form · Lv.${progress?.level}` : revealed ? 'Reached form' : 'Evolution not reached'}</p>
        ${information(`archive-kit-${starter.id}-${evolution}`, `${characterName(starter.id, evolution)} · Evo.${evolution}`, `${characterRole(starter.id)}${elementLabel(starter.elementId)}${characterRating(starter.id, evolution)}
        <p class="archive-ownership">${!account ? 'Ownership unavailable' : !owned ? 'Not owned' : current ? `Current form · Lv.${progress?.level}` : revealed ? 'Reached form' : 'Evolution not reached'}</p>
        <p>${starter.weapon}</p>
        <h3>Origin</h3><p>${starter.description}</p><p>${starter.lore.story}</p><blockquote>${starter.lore.vow}</blockquote>
        ${current ? '' : '<p class="quiet">Level 0 preview</p>'}
        <dl class="archive-stats"><div><dt>Health</dt><dd>${formatStat(kit.stats.health)}</dd></div>
          <div><dt>${phaseZeroStatsReady ? 'Direct Attack' : 'Attack'}</dt><dd>${formatStat(kit.stats.damage)}</dd></div><div><dt>Defense</dt><dd>${formatStat(kit.stats.defense)}</dd></div></dl>
        <h3>${current ? 'Current combat kit' : 'Form combat-kit preview'}</h3><p><strong>${kit.passive.name} · Passive</strong><br>${readableEffect(kit.passive.description)}</p>${kitResource(kit, starter.id)}
          ${(['skill1', 'skill2', 'ultimate'] as const).map((action) => `<p><strong>${kit.abilities[action].name}</strong>${abilityStatuses(kit.abilities[action].strength, starter.id, action)}<br>${readableEffect(kit.abilities[action].description)}</p>`).join('')}`, 'Combat kit')}
      </article>`;
      });
    }).join('')}${capturedForms.map((creature) => {
      const copies = account?.capturedCharacters?.filter((copy) => copy.creatureId === creature.id) ?? [];
      const tier = Number(creature.id.split(':').at(-1));
      const owned = copies.length > 0;
      return `<article class="archive-card ${owned ? 'archive-form-revealed' : 'archive-form-locked'}" data-archive-character="${creature.id}" data-form="${tier + 1}" data-filter-element="${creature.element}" data-filter-rarity="${materialRarities[tier]}" data-filter-ownership="${!account ? 'unavailable' : owned ? 'owned' : 'unowned'}" data-filter-discovery="${!account ? 'unavailable' : owned ? 'revealed' : 'locked'}"       data-filter-stars="${tier + 1}">
        <div class="archive-portrait${owned ? '' : ' unreached-character-art'}">${creature.art ? `<img draggable="false" src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${creature.name}" width="960" height="960">` : '<span>Artwork pending</span>'}</div>
        <h3>${creature.name}</h3>${elementLabel(creature.element)}${capturedRating(creature.id)}
        <p class="archive-ownership">${!account ? 'Ownership unavailable' : owned ? `Owned copies ${copies.length}` : 'Not owned'}</p>
        <p>${creature.area} · Stages ${creature.stages[0]}-${creature.stages.at(-1)}</p>
      </article>`;
    }).join('')}</div>`;
}

export const conduitSearchScopes = [
  { id: 'all', name: 'Everything' },
  { id: 'name', name: 'Name' },
  { id: 'effect', name: 'Effect' },
  { id: 'ability', name: 'Ability term' },
  { id: 'lore', name: 'Lore' },
] as const;

function conduitArchive(account: Account | null): string {
  const shown = conduits.filter(conduit => conduit.rarity !== 'Calamitic' || calamiticStoreUnlocked(account));
  const rarities = [...new Set(shown.map(conduit => conduit.rarity as string)), 'Master'];
  const total = shown.length + masterConduits.length;
  const ownership = (owned: boolean) => !account ? 'unavailable' : owned ? 'owned' : 'unowned';
  return `<div class="archive-filters archive-conduit-filters" role="group" aria-label="Conduit archive filters">
      <label class="archive-search">Search<input type="search" data-conduit-search placeholder="Name, effect, [Burn], [Skill 1]…" autocomplete="off"></label>
      <label>Search in<select data-conduit-search-scope>${conduitSearchScopes.map(scope => `<option value="${scope.id}">${scope.name}</option>`).join('')}</select></label>
      <label>Rarity<select data-conduit-filter="rarity"><option value="">All rarities</option>${rarities.map(rarity => `<option>${rarity}</option>`).join('')}</select></label>
      <label>Ownership<select data-conduit-filter="ownership"><option value="">All Conduits</option><option value="owned">Owned</option><option value="unowned">Not owned</option></select></label>
      <button class="text-button" data-reset-conduit-filters>Reset filters</button>
    </div><div class="archive-results-toolbar"><p data-conduit-filter-result role="status">${total} / ${total} Conduits shown</p>
    <div class="ref-archive-manage"><button class="text-button" data-page="conduit-store">Conduit Store &rarr;</button><button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button></div></div>
    <div class="archive-grid">${shown.map((conduit) => `<article class="archive-card ${(account?.conduits?.[conduit.id] ?? 0) > 0 ? 'archive-conduit-revealed' : 'archive-conduit-locked'}" data-archive-conduit="${conduit.id}" data-filter-rarity="${conduit.rarity}" data-filter-ownership="${ownership((account?.conduits?.[conduit.id] ?? 0) > 0)}" ${omnicTheme(conduit.id)}>
      <div class="archive-mechanism">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div>
      <h3>${conduit.name}</h3>${conduitRarity(conduit.id)}
      <p class="archive-ownership">${account ? `Owned ${account.conduits?.[conduit.id] ?? 0}` : 'Ownership unavailable'}</p>
      <p class="archive-effect">${readableEffect(conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id]))}</p>
      ${information(`archive-conduit-${conduit.id}`, conduit.name, conduitDetails(conduit.id, account?.conduitUpgrades?.[conduit.id], (account?.conduits?.[conduit.id] ?? 0) > 0), 'Details')}
    </article>`).join('')}${masterConduits.map(entry => `<article class="archive-card ${account?.masterConduits?.[entry.id] === 1 ? 'archive-conduit-revealed' : 'archive-conduit-locked'}" ${conduitElementTheme(getStarter(entry.character).elementId)} data-archive-master="${entry.id}" data-filter-rarity="Master" data-filter-ownership="${ownership(account?.masterConduits?.[entry.id] === 1)}">
      <div class="archive-mechanism">${masterConduitIcon(entry.id)}</div><h3>${entry.name}</h3>
      <p>Omnic Master · ${getStarter(entry.character).name}</p>${conduitElementLabel(getStarter(entry.character).elementId)}<p class="archive-ownership">${account ? account.masterConduits?.[entry.id] === 1 ? 'Owned' : 'Not owned' : 'Ownership unavailable'}</p>
      <p class="archive-effect">${readableEffect(entry.effect)}</p><p>Choose from a Cosmic Grand Master Chest. Final Machines boss: ${masterChest.chance * 100}% chest drop. Every Calamity EX+3 chest contains two guaranteed Master chests. Named bearer enhancement; no upgrades.</p>
      ${information(`archive-master-${entry.id}`, entry.name, `${conduitElementLabel(getStarter(entry.character).elementId)}${conduitLore(entry.lore)}<p>${readableEffect(entry.effect)}</p>`, 'Details')}
    </article>`).join('')}</div>`;
}

export function archives(account: Account | null, selected: ArchiveGallery = 'characters'): string {
  return `<section class="archives"><header class="archive-toolbar"><div><h2>Collections</h2><p>Browse forms, Conduits and enemy discoveries.</p></div>${information('collections-information', 'Collections', `<h3>Forms and stats</h3><p>Color marks reached Element-Bearer forms, owned captured forms and owned Conduits. Everything else stays silhouetted.</p><p>Your current forms show equipped stats. Other forms preview Lv.0 without Conduits. Stars and form rarity are separate.</p>
    <h3>Enemy discovery</h3><p>Encounter an enemy to reveal its identity and lore; defeat it to reveal its loot table.</p><p>Loot quantities are equally likely within each range. Rarity rolls are independent, with no pity. Final bosses give 5x currency, materials and components, not 5x drop chances.</p>
    <h3>Captures</h3><p>50% per kill in Heaven, Abyss, Treasury and Sanctuary. Crimson Roses has the same chance up to enemy Lv.120. No captures in Story, Training or elemental dungeons.</p><p>Captures keep their form and skills, cap at Lv.60 and sell by form, not level.</p>
    `)}</header>
    <nav class="archive-navigation" aria-label="Archive galleries">${galleries.map((gallery) =>
      `<button class="archive-gallery-button" data-archive-gallery="${gallery.id}" aria-controls="archive-${gallery.id}" aria-pressed="${selected === gallery.id}"><strong>${gallery.name}</strong><small>${gallery.subtitle}</small></button>`).join('')}</nav>
    ${!account ? '<p role="alert">Saved ownership and discoveries unavailable. Resolve the save error; public catalog previews remain available.</p>' : ''}
    ${galleries.map((gallery) => `<section id="archive-${gallery.id}" class="archive-panel" aria-labelledby="archive-${gallery.id}-heading" ${selected === gallery.id ? '' : 'hidden'}>
      <h2 class="ref-sr-only" id="archive-${gallery.id}-heading" tabindex="-1">${gallery.name}</h2>
      ${gallery.id === 'characters' ? characterArchive(account) : gallery.id === 'conduits' ? conduitArchive(account) : creatureGlossary(account)}
    </section>`).join('')}</section>`;
}

export function bindArchives(host: HTMLElement): void {
  const scrollPanel = host.querySelector('.archives')?.closest<HTMLElement>('.sanctuary-content');
  if (scrollPanel) scrollPanel.dataset.menuScroll = 'collections';
  const filters = Array.from(host.querySelectorAll<HTMLSelectElement>('[data-character-filter]'));
  const cards = Array.from(host.querySelectorAll<HTMLElement>('[data-archive-character]'));
  const filterCards = (): void => {
    let shown = 0;
    for (const card of cards) {
      card.hidden = !filters.every((filter) => !filter.value ||
        card.getAttribute(`data-filter-${filter.dataset.characterFilter}`) === filter.value);
      if (!card.hidden) shown++;
    }
    const result = host.querySelector<HTMLElement>('[data-character-filter-result]');
    if (!result) throw new Error('Character archive filter status is missing.');
    result.textContent = shown ? `${shown} / ${cards.length} forms shown` : 'No forms match these filters.';
  };
  filters.forEach((filter) => filter.addEventListener('change', filterCards));
  host.querySelector('[data-reset-character-filters]')?.addEventListener('click', () => {
    filters.forEach((filter) => {
      filter.value = '';
      filter.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
  host.querySelectorAll<HTMLButtonElement>('[data-archive-gallery]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.archiveGallery;
      if (!galleries.some((gallery) => gallery.id === selected)) throw new Error('Unknown archive gallery.');
      host.querySelectorAll<HTMLButtonElement>('[data-archive-gallery]').forEach((entry) => {
        entry.setAttribute('aria-pressed', String(entry === button));
      });
      for (const gallery of galleries) {
        const panel = host.querySelector<HTMLElement>(`#archive-${gallery.id}`);
        if (!panel) throw new Error('Archive panel is missing.');
        panel.hidden = gallery.id !== selected;
      }
      host.querySelector<HTMLElement>(`#archive-${selected}-heading`)?.focus({ preventScroll: true });
    });
  });
  if (filters.length) filterCards();
  bindConduitFilters(host);
}

type ConduitSearchScope = (typeof conduitSearchScopes)[number]['id'];

function bindConduitFilters(host: HTMLElement): void {
  const search = host.querySelector<HTMLInputElement>('[data-conduit-search]');
  const scope = host.querySelector<HTMLSelectElement>('[data-conduit-search-scope]');
  const result = host.querySelector<HTMLElement>('[data-conduit-filter-result]');
  if (!search || !scope || !result) return;
  const filters = Array.from(host.querySelectorAll<HTMLSelectElement>('[data-conduit-filter]'));
  const text = (nodes: ArrayLike<Element>) => Array.from(nodes, node => node.textContent ?? '').join(' ').toLowerCase();
  const cards = Array.from(host.querySelectorAll<HTMLElement>('[data-archive-conduit], [data-archive-master]')).map(card => {
    const effect = text(card.querySelectorAll('.archive-effect, .information-content dd'));
    const index: Record<ConduitSearchScope, string> = {
      name: text(card.querySelectorAll(':scope > h3')),
      effect,
      ability: (effect.match(/\[[^\]]+\]/g) ?? []).join(' '),
      lore: text(card.querySelectorAll('.conduit-lore')),
      all: '',
    };
    index.all = `${index.name} ${effect} ${index.lore} ${text(card.querySelectorAll(':scope > p'))} ${card.dataset.filterRarity ?? ''}`.toLowerCase();
    return { card, index };
  });
  const apply = (): void => {
    const terms = search.value.toLowerCase().replace(/[[\]]/g, ' ').split(/\s+/).filter(Boolean);
    const field = (conduitSearchScopes.some(entry => entry.id === scope.value) ? scope.value : 'all') as ConduitSearchScope;
    let shown = 0;
    for (const { card, index } of cards) {
      card.hidden = !filters.every(filter => !filter.value || card.getAttribute(`data-filter-${filter.dataset.conduitFilter}`) === filter.value)
        || !terms.every(term => index[field].includes(term));
      if (!card.hidden) shown++;
    }
    result.textContent = shown ? `${shown} / ${cards.length} Conduits shown` : 'No Conduits match these filters.';
  };
  search.addEventListener('input', apply);
  scope.addEventListener('change', apply);
  filters.forEach(filter => filter.addEventListener('change', apply));
  host.querySelector('[data-reset-conduit-filters]')?.addEventListener('click', () => {
    search.value = '';
    for (const control of [scope, ...filters]) {
      control.value = control === scope ? 'all' : '';
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  apply();
}
