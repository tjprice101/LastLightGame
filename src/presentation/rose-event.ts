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

export const roseEventRules = `<p>${devourerHabitats.roses}</p><p>35 stages at levels 80-140. Fight two enemies per stage, or one boss every fifth stage.</p>
    <p>Enemies at Lv.120 or below have a 20% capture chance. Captured copies keep their form, skills and defeated level, and cannot evolve.</p>
    <p>Each enemy drops Prismatica and has a separate chance to drop each unlocked Rosethorn material. No Null-Prismatica.
    Bosses use the same drop chances. The stage 35 boss gives 5x Prismatica and materials on every clear. Check View Loot in Collections for exact drops.</p>
    <p>Sales exchange one copy for its form's material: ${roseMaterials.map((material, index) => `${roseSaleQuantities[index]} ${material.name}`).join(', ')}.
    Locked, squad and Conduit-equipped copies cannot be sold or consumed.</p>
    <p>Rosetta, Thornia and Crinso use these materials for leveling and evolution. Late evolutions also use 1 form 3+ Roselius, then 2 form 4+ copies, then 3 form 5+ copies. You choose which copies to use.
    Every evolution requires the current form's max level.</p>
    <p>This event and its banner remain available without an expiry until an end date is announced.</p>`;

export function roseEvent(account: Account | null, showInformation = true): string {
  const stage = account ? unlockedInfusionStage(account, 'roses') : 1;
  const encounter = infusionEncounter('roses', stage);
  return `${showInformation ? information('rose-event-information', 'Passion of Crimson Roses', roseEventRules) : ''}
    <article class="activity-card rose-event-card">
    ${activityDifficulty('roses', activityLayout(`
    ${activityBanner('Passion of Crimson Roses', 'banners/roses-banner.png', 'Passion of Crimson Roses: a rose-filled garden beneath sunny skies.')}
    <p class="eyebrow">TRANQUILITIC · EVENT</p>
    <p>${devourerHabitats.roses}</p><p>35 stages · Enemy levels 80-140</p>
    <p>Latest unlocked: Stage ${stage} · Lv.${encounter.level}${encounter.level > 120 ? ' · No captures above Lv.120' : ' · 20% captures'}</p>
    <p>${infusionLoot('roses', stage).specialties.map((drop) => `${roseMaterials.find((material) => material.id === drop.id)?.name}: ${drop.minimum}-${drop.maximum} · ${bannerPercent(drop.chance)}`).join(' · ')}</p>`, `
    ${itemShowcase([{ id: 'fractalis' }, ...roseMaterials.map((material) => ({ id: material.id }))], 'Rewards across stages')}
    <button class="text-button" data-page="summon" data-rose-banner>Roses Under Sunny Skies &rarr;</button>
    ${infusionEntry({ id: 'roses', name: 'Passion of Crimson Roses' }, account)}`), account)}</article>`;
}
