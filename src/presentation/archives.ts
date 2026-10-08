import { starters } from '../content/starters';
import { characterName } from '../content/character-art';
import { evolutionRarity } from '../content/progression';
import { elements, materialRarities } from '../content/activities';
import { resolveFighter, formatStat } from '../content/combat';
import { conduits, conduitEffect } from '../content/conduits';
import { ownedProgress, type Account } from '../game/account';
import { portrait, assetUrl } from './portrait';
import { creatures } from '../content/creatures';
import { capturedRating } from './owned-companion';
import { characterRating } from './character-rating';
import { characterRole } from './character-role';
import { conduitIcon, conduitRarity } from './conduit-store';
import { creatureGlossary } from './creature-glossary';
import { elementLabel } from './element-label';
import { information } from './information';
import './archives.css';

const galleries = [
  { id: 'characters', name: 'Character Archive', subtitle: 'Element-Bearers ~ Forms ~ Combat kits' },
  { id: 'conduits', name: 'Conduit Archive', subtitle: 'Ancient mechanisms ~ Effects ~ Ownership' },
  { id: 'creatures', name: 'Creature Glossary', subtitle: 'Discoveries ~ Elements ~ Enemy loot' },
] as const;
export type ArchiveGallery = (typeof galleries)[number]['id'];

function characterArchive(account: Account | null): string {
  const capturedForms = creatures.filter((creature) => creature.mode && creature.mode !== 'machines');
  const total = starters.length * 6 + capturedForms.length;
  return `<button class="text-button" data-page="character">Manage characters &rarr;</button>
    <div class="archive-filters" role="group" aria-label="Character archive filters">
      <label>Element<select data-character-filter="element"><option value="">All elements</option>${elements.map((element) => `<option value="${element.id}">${element.name} ~ ${element.affinity}</option>`).join('')}</select></label>
      <label>Rarity<select data-character-filter="rarity"><option value="">All rarities</option>${materialRarities.map((rarity) => `<option>${rarity}</option>`).join('')}</select></label>
      <label>Character ownership<select data-character-filter="ownership"><option value="">All characters</option><option value="owned">Owned</option><option value="unowned">Not owned</option></select></label>
      <label>Form discovery<select data-character-filter="discovery"><option value="">All forms</option><option value="revealed">Reached</option><option value="locked">Unreached</option></select></label>
      <label>Stars<select data-character-filter="stars"><option value="">All stars</option>${[1, 2, 3, 4, 5, 6].map((stars) => `<option value="${stars}">${stars}-star</option>`).join('')}</select></label>
      <button class="text-button" data-reset-character-filters>Reset filters</button>
    </div><p data-character-filter-result role="status">${total} ~ ${total} forms shown</p>
    <div class="archive-grid">${starters.flatMap((starter) => {
      const owned = !!account?.characters[starter.id];
      const progress = owned && account ? ownedProgress(account, starter.id) : undefined;
      return Array.from({ length: 6 }, (_, index) => {
      const evolution = index + 1;
      const revealed = !!progress && progress.evolution >= evolution;
      const current = progress?.evolution === evolution;
      const kit = resolveFighter(starter.id, current ? progress : { level: 0, evolution, weaponRank: 0 }, current ? account?.conduitEquipment?.[starter.id] : undefined, current ? account?.conduitUpgrades : undefined);
      return `<article class="archive-card ${revealed ? 'archive-form-revealed' : 'archive-form-locked'}" data-archive-character="${starter.id}" data-form="${evolution}" data-filter-element="${starter.elementId}" data-filter-rarity="${evolutionRarity(evolution)}" data-filter-ownership="${!account ? 'unavailable' : owned ? 'owned' : 'unowned'}" data-filter-discovery="${!account ? 'unavailable' : revealed ? 'revealed' : 'locked'}" data-filter-stars="${starter.stars}">
        <div class="archive-portrait">${portrait(starter, evolution)}</div>
        <h3>${characterName(starter.id, evolution)} ~ Evo.${evolution}</h3>${characterRole(starter.id)}${elementLabel(starter.elementId)}${characterRating(starter.id, evolution)}
        <p class="archive-ownership">${!account ? 'Ownership unavailable' : !owned ? 'Not owned' : current ? `Current form ~ Lv.${progress?.level}` : revealed ? 'Reached form' : 'Evolution not reached'}</p>
        <p>${starter.weapon}</p>
        ${current ? '' : '<p class="quiet">Level 0 preview</p>'}
        <dl class="archive-stats"><div><dt>Health</dt><dd>${formatStat(kit.stats.health)}</dd></div>
          <div><dt>Attack</dt><dd>${formatStat(kit.stats.damage)}</dd></div><div><dt>Defense</dt><dd>${formatStat(kit.stats.defense)}</dd></div></dl>
        ${information(`archive-kit-${starter.id}-${evolution}`, `${characterName(starter.id, evolution)} ~ Evo.${evolution}`, `<h3>${current ? 'Current combat kit' : 'Form combat-kit preview'}</h3><p><strong>${kit.passive.name} ~ Passive</strong><br>${kit.passive.description}</p>
          ${(['skill1', 'skill2', 'ultimate'] as const).map((action) => `<p><strong>${kit.abilities[action].name}</strong><br>${kit.abilities[action].description}</p>`).join('')}`, 'Combat kit')}
      </article>`;
      });
    }).join('')}${capturedForms.map((creature) => {
      const copies = account?.capturedCharacters?.filter((copy) => copy.creatureId === creature.id) ?? [];
      const tier = Number(creature.id.split(':').at(-1));
      const owned = copies.length > 0;
      return `<article class="archive-card ${owned ? 'archive-form-revealed' : 'archive-form-locked'}" data-archive-character="${creature.id}" data-form="${tier + 1}" data-filter-element="${creature.element}" data-filter-rarity="${materialRarities[tier]}" data-filter-ownership="${!account ? 'unavailable' : owned ? 'owned' : 'unowned'}" data-filter-discovery="${!account ? 'unavailable' : owned ? 'revealed' : 'locked'}"       data-filter-stars="${tier + 1}">
        <div class="archive-portrait">${creature.art ? `<img src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${creature.name}" width="960" height="960">` : '<span>Artwork pending</span>'}</div>
        <h3>${creature.name}</h3>${elementLabel(creature.element)}${capturedRating(creature.id)}
        <p class="archive-ownership">${!account ? 'Ownership unavailable' : owned ? `Owned copies ${copies.length}` : 'Not owned'}</p>
        <p>${creature.area} ~ Stages ${creature.stages[0]}-${creature.stages.at(-1)}</p>
      </article>`;
    }).join('')}</div>`;
}

function conduitArchive(account: Account | null): string {
  return `<button class="text-button" data-page="conduit-store">Conduit Store &rarr;</button><button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button>
    <div class="archive-grid">${conduits.map((conduit) => `<article class="archive-card ${(account?.conduits?.[conduit.id] ?? 0) > 0 ? 'archive-conduit-revealed' : 'archive-conduit-locked'}" data-archive-conduit="${conduit.id}">
      <div class="archive-mechanism">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div>
      <h3>${conduit.name}</h3>${conduitRarity(conduit.id)}
      <p class="archive-ownership">${account ? `Owned ${account.conduits?.[conduit.id] ?? 0}` : 'Ownership unavailable'}</p>
      <strong>${conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id])}</strong><p>${conduit.lore}</p><p>${conduit.power} ~ ${conduit.price !== null ? `${conduit.price.toLocaleString('en-US')} Prismatica` : 'Awaken the Machines drop'}${conduit.rarity === 'Legendary' ? ' ~ 0.5% bonus tier on successful banner draws' : ''}</p>
    </article>`).join('')}</div>`;
}

export function archives(account: Account | null, selected: ArchiveGallery = 'characters'): string {
  return `<section class="archives">${information('collections-information', 'Collections', `<h3>Character</h3><p>Reached Element-Bearer forms and owned captured forms reveal in color; other forms remain silhouettes.
    Current forms show saved equipped stats; other Element-Bearer forms preview level 0 without Conduits. Stars and form rarity are separate.
    Captured forms have a level cap of 120 and cannot evolve. Catalog previews do not grant ownership.</p>
    <h3>Conduits</h3><p>Owned Conduits reveal their artwork in color; unowned Conduits remain silhouettes. The catalog shows effects and owned counts. Equipment rules are in Character Information.</p>
    <h3>Creature discovery and loot</h3><p>Encountering reveals identity and element. Defeating reveals exact stage loot.
    Quantities vary uniformly within each range; rarity rolls are independent and have no pity.
    Heaven, Abyss, Treasury and Sanctuary have a separate 20% capture chance per kill; Adventure and elemental dungeons cannot grant captures.
    Captures retain defeated level ~ form ~ skills. Currency creature sale prices are fixed by form; sale protections are in Character Information.</p>
    <h3>Element-Bearer identities</h3>${starters.map((starter) => `<p><strong>${characterName(starter.id)}</strong> ~ ${starter.description}</p>`).join('')}`)}
    <nav class="archive-navigation" aria-label="Archive galleries">${galleries.map((gallery) =>
      `<button class="archive-gallery-button" data-archive-gallery="${gallery.id}" aria-controls="archive-${gallery.id}" aria-pressed="${selected === gallery.id}"><strong>${gallery.name}</strong><small>${gallery.subtitle}</small></button>`).join('')}</nav>
    ${!account ? '<p role="alert">Saved ownership and discoveries unavailable. Resolve the save error; public catalog previews remain available.</p>' : ''}
    ${galleries.map((gallery) => `<section id="archive-${gallery.id}" class="archive-panel" aria-labelledby="archive-${gallery.id}-heading" ${selected === gallery.id ? '' : 'hidden'}>
      <header class="archive-banner archive-banner-${gallery.id}"><img class="archive-banner-art" src="${assetUrl(`banners/archive-${gallery.id}.png`)}" alt="" width="1904" height="640" loading="lazy"><p class="eyebrow">${gallery.subtitle}</p><h2 id="archive-${gallery.id}-heading" tabindex="-1">${gallery.name}</h2></header>
      ${gallery.id === 'characters' ? characterArchive(account) : gallery.id === 'conduits' ? conduitArchive(account) : creatureGlossary(account)}
    </section>`).join('')}</section>`;
}

export function bindArchives(host: HTMLElement): void {
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
    result.textContent = shown ? `${shown} ~ ${cards.length} forms shown` : 'No forms match these filters.';
  };
  filters.forEach((filter) => filter.addEventListener('change', filterCards));
  host.querySelector('[data-reset-character-filters]')?.addEventListener('click', () => {
    filters.forEach((filter) => { filter.value = ''; });
    filterCards();
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
}
