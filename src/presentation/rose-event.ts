import { type Account, unlockedInfusionStage } from '../game/account';
import { infusionEncounter, infusionLoot } from '../content/infusions';
import { roseMaterials, roseSaleQuantities } from '../content/roses';
import { information } from './information';
import { itemShowcase } from './item-showcase';
import { bannerPercent } from '../content/standard-banner';
import { activityBanner } from './activity-banner';
import { infusionEntry } from './activity-entry';

export const roseEventRules = `<p>35 stages, levels 80-140; a boss every fifth stage. Ordinary stages contain two enemies, boss stages one.
    Six increasingly formidable Tranquilitic Roselius forms use golden thorns and crimson roses.</p>
    <p>20% independent capture chance only at enemy levels 120 or below. Above 120, no captures. Captured copies retain level and skills, can level to 120 and never evolve.
    Final-form Lv.80 copies are special-banner duplicate rewards, not high-level mission captures.</p>
    <p>Each kill grants ordinary level-scaled Prismatica and rolls unlocked Rosethorn materials independently. No Null-Prismatica or clear bonus.
    Bosses and ordinary enemies have identical reward odds. Exact stage drops appear in the defeated Creature Glossary.</p>
    <p>Sales exchange one copy for its form's material: ${roseMaterials.map((material, index) => `${roseSaleQuantities[index]} ${material.name}`).join(' ~ ')}.
    Locked, squad and Conduit-equipped copies cannot be sold or consumed.</p>
    <p>Rosetta, Thornia and Crinso use these materials for leveling and evolution. Late evolutions consume explicitly selected Roselius forms 3+ ~ 4+ ~ 5+ in quantities 1 ~ 2 ~ 3.
    Every evolution requires the current form's max level.</p>
    <p>This event and its banner remain available without an expiry until a schedule is authored.</p>`;

export function roseEvent(account: Account | null, showInformation = true): string {
  const stage = account ? unlockedInfusionStage(account, 'roses') : 1;
  const encounter = infusionEncounter('roses', stage);
  return `${showInformation ? information('rose-event-information', 'Passion of Crimson Roses', roseEventRules) : ''}
    <article class="activity-card rose-event-card">
    ${activityBanner('Passion of Crimson Roses', 'banners/roses-banner.png', 'Passion of Crimson Roses: a rose-filled garden beneath sunny skies.')}
    <p class="eyebrow">TRANQUILITIC ~ EVENT</p><p>35 stages ~ Enemy levels 80-140</p>
    ${itemShowcase([{ id: 'fractalis' }, ...roseMaterials.map((material) => ({ id: material.id }))], 'Rewards across stages')}
    <p>Latest unlocked: Stage ${stage} ~ Lv.${encounter.level}${encounter.level > 120 ? ' ~ No captures above Lv.120' : ' ~ 20% captures'}</p>
    <p>${infusionLoot('roses', stage).specialties.map((drop) => `${roseMaterials.find((material) => material.id === drop.id)?.name}: ${drop.minimum}-${drop.maximum} ~ ${bannerPercent(drop.chance)}`).join(' ~ ')}</p>
    <button class="text-button" data-page="summon" data-rose-banner>Roses Under Sunny Skies &rarr;</button>
    ${infusionEntry({ id: 'roses', name: 'Passion of Crimson Roses' }, account)}</article>`;
}
