import { type Account, unlockedInfusionStage } from '../game/account';
import { infusionEncounter, infusionLoot } from '../content/infusions';
import { roseMaterials, roseSaleQuantities } from '../content/roses';
import { information } from './information';
import { itemShowcase } from './item-showcase';
import { bannerPercent } from '../content/standard-banner';
import { activityBanner } from './activity-banner';
import { activityLayout } from './activity-layout';
import { infusionEntry } from './activity-entry';
import { devourerHabitats } from '../content/world-lore';
import { activityDifficulty } from './calamity';
import { roseEventActive, roseAccessMessage, type EventAccess } from '../content/event-schedule';
import { newEventDefinition, newEventMaterialIds, newEventAccessMessage, newEventWindowActive } from '../content/moon-sunshade-events';
import { materialName } from '../content/dungeon-art';

export const roseEventRules = `<p>${devourerHabitats.roses}</p><p>35 stages, Lv.80-140: two enemies per stage, a boss every fifth stage. Ends November 30, 2026 at 8:00 PM New York time. Online entry only. An encounter already underway may finish; no Continue, Retry or new entries after closure. Pity and event progress are retained for explicitly scheduled reruns. Event materials remain permanently in Material Exchange; all six Roselius forms can be purchased in Event Elemental-Devourers only while the event is ended.</p>
    <p>Enemies at every event level have a 50% capture chance. Captures keep their form and skills, up to Lv.60, and cannot evolve.</p>
    <p>Each enemy drops Prismatica and every unlocked Rosethorn material. Each material starts at 1 when unlocked and increases linearly to these final ranges: Seed 5-6, Bud 4, Bloom 3-4, Crest 2-3, Heart 2 and Soul 1-2. Seed through Heart drop from Stage 1; Soul from Lv.95 (Stage 10). No material boss bonus or Null-Prismatica. Prismatica grows linearly from 9-18 at Stage 1 to 750-1,500 at Stage 35, without a boss multiplier.</p>
    <p>Sell a copy for its form's material: ${roseMaterials.map((material, index) => `${roseSaleQuantities[index]} ${material.name}`).join(', ')}. Locked, squad and Conduit-equipped copies are protected.</p>
    <p>Rosetta, Thornia and Crinso level and evolve with these materials. Late evolutions also consume Roselius worth 3, 8, then 15 Evolution Value (each copy is worth its form, 1-6); you choose the copies. Evolving requires max level.</p>`;

export function roseEvent(account: Account | null, showInformation = true,
  access: EventAccess = { online: true, now: Date.now() }): string {
  const stage = account ? unlockedInfusionStage(account, 'roses') : 1;
  const encounter = infusionEncounter('roses', stage);
  return `${showInformation ? information('rose-event-information', 'Passion of Crimson Roses', roseEventRules) : ''}
    <article class="activity-card rose-event-card">
    ${activityDifficulty('roses', activityLayout(`
    ${activityBanner('Passion of Crimson Roses', 'banners/roses-banner.png', 'Passion of Crimson Roses: a rose-filled garden beneath sunny skies.')}
    <p class="eyebrow">TRANQUILITIC · EVENT</p>
    <p>${devourerHabitats.roses}</p><p>35 stages · Enemy levels 80-140</p>
    <p>Latest unlocked: Stage ${stage} · Lv.${encounter.level} · 50% captures · Copies join at Lv.60</p>
    <p>${infusionLoot('roses', stage).specialties.map((drop) => `${roseMaterials.find((material) => material.id === drop.id)?.name}: ${drop.minimum}-${drop.maximum} · ${bannerPercent(drop.chance)}`).join(' · ')}</p>`, `
    ${itemShowcase([{ id: 'fractalis' }, ...roseMaterials.map((material) => ({ id: material.id }))], 'Rewards across stages')}
    <button class="text-button" data-page="summon" data-rose-banner>Roses Under Sunny Skies &rarr;</button>
    <p role="status">${roseAccessMessage(access)}</p>
    <button type="button" data-page="special-banner-archive">Special Banner Archive</button>
    ${access.online && roseEventActive(access.now) ? infusionEntry({ id: 'roses', name: 'Passion of Crimson Roses' }, account) : '<button disabled>Event entry unavailable</button>'}`), account)}</article>`;
}

export function moonEvent(account: Account | null,
  access: EventAccess = { online: true, now: Date.now() }): string {
  const event = newEventDefinition('moon');
  const stage = account ? unlockedInfusionStage(account, 'moon') : 1;
  return `<article class="activity-card moon-event-card">${activityLayout(`
    ${activityBanner(event.activityName, event.activityHeaderArt, 'A lunar gateway overlooking the harbor of unreturned names.')}
    <p class="eyebrow">TRANQUILITIC · MOON EVENT</p>
    <p>35 stages · Enemy levels 80-140 · Boss every fifth stage</p>
    <p>50% captures · Copies join at Lv.60 · No Null-Prismatica drops</p>
    <p>${infusionLoot('moon', stage).specialties.map(drop =>
      `${materialName(drop.id)}: ${drop.minimum}-${drop.maximum} · ${bannerPercent(drop.chance)}`).join(' · ')}</p>`, `
    ${itemShowcase([{ id: 'fractalis' }, ...newEventMaterialIds('moon').map(id => ({ id }))], 'Rewards across stages')}
    <p role="status">${newEventAccessMessage('moon', access.online, access.now)}</p>
    <button type="button" data-page="special-banner-archive">Special Banner Archive</button>
    ${access.online && newEventWindowActive('moon', access.now)
      ? infusionEntry({ id: 'moon', name: event.activityName }, account)
      : '<button disabled>Event entry unavailable</button>'}`)}</article>`;
}
