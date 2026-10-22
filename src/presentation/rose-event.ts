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

export const roseEventRules = `<p>${devourerHabitats.roses}</p><p>35 stages, Lv.80-140: two enemies per stage, a boss every fifth stage. No expiry until an end date is announced.</p>
    <p>Enemies at Lv.120 or below have a 50% capture chance. Captures keep their form and skills, up to Lv.60, and cannot evolve.</p>
    <p>Each enemy drops Prismatica and every unlocked Rosethorn material, using elemental-dungeon level brackets and quantity ranges. Seed through Heart drop from Stage 1; Soul from Lv.95 (Stage 10). No Null-Prismatica. The stage 35 boss gives 5x Prismatica and materials on every clear.</p>
    <p>Sell a copy for its form's material: ${roseMaterials.map((material, index) => `${roseSaleQuantities[index]} ${material.name}`).join(', ')}. Locked, squad and Conduit-equipped copies are protected.</p>
    <p>Rosetta, Thornia and Crinso level and evolve with these materials. Late evolutions also consume Roselius worth 3, 8, then 15 Evolution Value (each copy is worth its form, 1-6); you choose the copies. Evolving requires max level.</p>`;

export function roseEvent(account: Account | null, showInformation = true): string {
  const stage = account ? unlockedInfusionStage(account, 'roses') : 1;
  const encounter = infusionEncounter('roses', stage);
  return `${showInformation ? information('rose-event-information', 'Passion of Crimson Roses', roseEventRules) : ''}
    <article class="activity-card rose-event-card">
    ${activityDifficulty('roses', activityLayout(`
    ${activityBanner('Passion of Crimson Roses', 'banners/roses-banner.png', 'Passion of Crimson Roses: a rose-filled garden beneath sunny skies.')}
    <p class="eyebrow">TRANQUILITIC · EVENT</p>
    <p>${devourerHabitats.roses}</p><p>35 stages · Enemy levels 80-140</p>
    <p>Latest unlocked: Stage ${stage} · Lv.${encounter.level}${encounter.level > 120 ? ' · No captures above Lv.120' : ' · 50% captures'}</p>
    <p>${infusionLoot('roses', stage).specialties.map((drop) => `${roseMaterials.find((material) => material.id === drop.id)?.name}: ${drop.minimum}-${drop.maximum} · ${bannerPercent(drop.chance)}`).join(' · ')}</p>`, `
    ${itemShowcase([{ id: 'fractalis' }, ...roseMaterials.map((material) => ({ id: material.id }))], 'Rewards across stages')}
    <button class="text-button" data-page="summon" data-rose-banner>Roses Under Sunny Skies &rarr;</button>
    ${infusionEntry({ id: 'roses', name: 'Passion of Crimson Roses' }, account)}`), account)}</article>`;
}
