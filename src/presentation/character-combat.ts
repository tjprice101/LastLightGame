import { radiantAttunement, radiantBearerKits, radiantEquipmentAmount, radiantFlarePower, radiantLeaderBonus, radiantMasters, resolveRadiantStarterStats,
  radiantRoleSkillPower, radiantSupportSquadHeal, radiantTankTargetWeight, radiantCriticalStats,
  type RadiantBearerId, type RadiantLoadout, type RadiantStats } from '../content/combat-kits';
import type { RadiantSkillSlot } from '../content/radiant-kits';
import { adaptRadiantLoadouts } from '../game/combat-loadout';
import { radiantCapacityCap, radiantChargeRules, radiantFlareTierCost, radiantSkillCost } from '../game/combat-gauge';
import { radiantHealthMote, radiantLoadoutSkillStats, radiantMaximumDuration } from '../game/combat-engine';
import { radiantFlareText, radiantLeaderSkillText, radiantSkillName, radiantSkillText } from './kit-text';
import { getMasterConduit } from '../content/master-conduits';
import { formatStat } from '../content/combat';
import { convergentLightRankCap, convergentLightRankCost, convergentLightTier, displayEvolution,
  type CharacterProgress, type ConvergentLightTier, type UpgradeCost } from '../content/progression';
import { convergentLightMaxPlan, ownedProgress, type Account } from '../game/account';
import { abilityIcon } from './ability-icon';
import { assetUrl, portrait } from './portrait';
import { currencyIcon } from './currency-icon';
import { materialArt, materialName } from '../content/dungeon-art';
import { statChange, statDirection } from './stat-change';
import { escapeDialogText as escape } from './game-dialog';
import './character-combat.css';
import { informationSheet } from './information-layout';
import { characterName } from '../content/character-art';
import { getStarter } from '../content/starters';
import { characterLevelCap, characterRarity } from '../content/progression';
import { elementLabel } from './element-label';
import { getConduit } from '../content/conduits';
import { radiantConduitDescription } from '../content/conduit-effect-text';
import { bracketReferences } from './reference-text';
import { radiantConduitPrimitives } from '../content/conduit-effects';
import { information } from './information';
import { radiantAttunementNames, radiantAttunementProfile as radiantAttunementStatText } from './master-text';

export const radiantStatKeys = ['hp', 'attack', 'defense', 'recovery'] as const;
export const radiantStatLabels: Record<keyof RadiantStats, string> = { hp: 'HP', attack: 'Attack', defense: 'Defense', recovery: 'Recovery' };
export const radiantFlareTierNames: Record<ConvergentLightTier, string> = {
  sparkling: 'Sparkling Convergent Light', glimmering: 'Glimmering Convergent Light',
  ultimate: 'Ultimate Convergence of Light',
};
const tierForm: Record<ConvergentLightTier, number> = { sparkling: 1, glimmering: 4, ultimate: 6 };
const tierRank: Record<ConvergentLightTier, number> = { sparkling: 1, glimmering: 6, ultimate: 11 };
const percent = (value: number): string => `${Number((value * 100).toFixed(2))}%`;
const number = (value: number): string => String(Number(value.toFixed(4)));

export interface RadiantCharacterLoadout { loadout: RadiantLoadout; issue: string }

export function isRadiantBearer(id: string): id is RadiantBearerId {
  return Object.hasOwn(radiantBearerKits, id);
}

/** Builds the bearer's live combat loadout (level, form, ascension, Master and Conduits) from the saved account. */
export function radiantCharacterLoadout(account: Account | null, id: string, override?: Partial<CharacterProgress>): RadiantCharacterLoadout | null {
  if (!isRadiantBearer(id)) return null;
  const progress = { ...(account?.characters[id] ? ownedProgress(account, id) : { level: 0, evolution: 1 }), ...override } as CharacterProgress;
  const member: RadiantLoadout = { id, starter: id, level: progress.level, form: progress.evolution,
    convergenceRank: progress.convergenceRank ?? 1,
    weaponRank: progress.weaponRank ?? 0, ascension: structuredClone(progress.ascension ?? {}), masterId: null };
  if (account?.characters[id]) {
    const result = adaptRadiantLoadouts([member], Object.keys(account.characters), account);
    if (result.ok) return { loadout: result.loadouts[0], issue: '' };
    try {
      resolveRadiantStarterStats(member);
      return { loadout: member, issue: `Equipment not applied: ${result.errors.map(error => error.reason).join(' ')}` };
    } catch { return null; }
  }
  try {
    resolveRadiantStarterStats(member);
    return { loadout: member, issue: '' };
  } catch { return null; }
}

export function radiantAttunementName(loadout: RadiantLoadout): string {
  return radiantAttunementNames[radiantAttunement(loadout)];
}

export function radiantAttunementProfile(loadout: RadiantLoadout): string {
  const attunement = radiantAttunement(loadout);
  const source = loadout.masterId === null ? 'No personal Master equipped' : `Set by ${getMasterConduit(loadout.masterId).name}`;
  return `${radiantAttunementStatText(attunement)} ${source}.`;
}

export function radiantAttunementChip(loadout: RadiantLoadout): string {
  const name = radiantAttunementName(loadout);
  return `<span class="radiant-attunement-chip" data-radiant-attunement="${radiantAttunement(loadout)}" title="${escape(radiantAttunementProfile(loadout))}">${name}</span>`;
}

export function radiantStatsPanel(loadout: RadiantLoadout, label = 'Current combat stats'): string {
  const values = resolveRadiantStarterStats(loadout);
  const base = resolveRadiantStarterStats({ ...loadout, gear: undefined });
  return `<dl class="info-stat-table radiant-stats" aria-label="${escape(label)}">${radiantStatKeys.map(key => {
    const direction = statDirection(base[key], values[key]);
    const modified = direction !== 'unchanged';
    return `<div data-radiant-stat="${key}"><dt>${radiantStatLabels[key]}</dt><dd><strong${modified ? ` class="stat-change stat-change--${direction}"` : ''}>${formatStat(values[key])}</strong>${modified ? `<span class="info-label">Before Conduits: ${formatStat(base[key])}</span>` : ''}</dd></div>`;
  }).join('')}${radiantCriticalRows(loadout)}</dl>`;
}
/** D-493 crit step: Critical Rate (base + Conduit points) and Critical Damage (base x Conduit bonus), always-on parts only. */
function radiantCriticalRows(loadout: RadiantLoadout): string {
  const base = radiantCriticalStats[loadout.starter];
  const rate = base.rate + radiantEquipmentAmount(loadout, 'crit-rate');
  const damage = base.damage * (1 + radiantEquipmentAmount(loadout, 'crit-damage'));
  const row = (key: string, label: string, value: string, before: string) =>
    `<div data-radiant-stat="${key}"><dt>${label}</dt><dd><strong${value !== before ? ' class="stat-change stat-change--increase"' : ''}>${value}</strong>${
      value !== before ? `<span class="info-label">Before Conduits: ${before}</span>` : ''}</dd></div>`;
  return row('crit-rate', 'Critical Rate', percent(rate), percent(base.rate)) +
    row('crit-damage', 'Critical Damage', `×${number(damage)}`, `×${number(base.damage)}`);
}

/** Same row markup as stat-preview.ts statPreview, over the four combat stats. */
export function radiantStatPreview(before: RadiantLoadout, after: RadiantLoadout, row: 'span' | 'div' = 'span'): string {
  const from = resolveRadiantStarterStats(before);
  const to = resolveRadiantStarterStats(after);
  return radiantStatKeys.map(key => {
    const change = statChange(from[key], to[key]);
    return `<${row} data-radiant-stat="${key}"><small>${radiantStatLabels[key]}</small>${row === 'span' ? `<strong>${change}</strong>` : change}</${row}>`;
  }).join('');
}

export function radiantLeaderAmount(loadout: RadiantLoadout): number {
  return radiantLeaderBonus(loadout);
}

/** Leader text in the approved Phase 3 phrasing, scaled by form and Leader equipment (D-479). Plain text. */
export function radiantLeaderText(loadout: RadiantLoadout): string {
  return radiantLeaderSkillText(loadout);
}

export function radiantFlareTierUnlocked(loadout: RadiantLoadout, tier: ConvergentLightTier): boolean {
  return loadout.form >= tierForm[tier] && loadout.convergenceRank >= tierRank[tier];
}

function flareCost(loadout: RadiantLoadout, tier: ConvergentLightTier): string {
  const cost = radiantFlareTierCost(radiantBearerKits[loadout.starter].baseCost, tier,
    radiantLoadoutSkillStats(loadout, 'flare').skillEfficiency);
  return `${cost} Luminosity`;
}

export function radiantFlareArticle(loadout: RadiantLoadout, tier: ConvergentLightTier): string {
  const unlocked = radiantFlareTierUnlocked(loadout, tier);
  return `<article class="hub-ability radiant-flare info-ability${unlocked ? '' : ' is-locked'}" data-radiant-flare="${tier}" data-radiant-reference-tier="${tier}"><h4 class="ability-heading">${abilityIcon(loadout.starter, 'ultimate')}<span>${radiantFlareTierNames[tier]} · ${escape(radiantSkillName(loadout.starter, 'flare'))}</span></h4>
    <p class="info-label">${unlocked ? 'Unlocked' : 'Locked'} · Rank ${tierRank[tier]}+ and Evo.${displayEvolution(loadout.starter, tierForm[tier])}.</p>
    <p data-radiant-kit-text="flare">${escape(radiantFlareText(loadout.starter, tier))}</p>
    <p class="info-price">Costs ${flareCost(loadout, tier)}. Rank ${loadout.convergenceRank} of 20. Convergent Light power ×${number(radiantFlarePower(loadout))} from form, rank (+1% per rank above Rank 1) and Imbues.</p></article>`;
}

/** Effective Luminosity cost of Skill 1 or Skill 2 after this loadout's Skill Efficiency (N2). */
export function radiantSkillCostFor(loadout: RadiantLoadout, slot: RadiantSkillSlot): number {
  return radiantSkillCost(slot, radiantLoadoutSkillStats(loadout, slot).skillEfficiency);
}

export function radiantSkillArticle(loadout: RadiantLoadout, slot: RadiantSkillSlot): string {
  return `<article class="hub-ability radiant-skill" data-radiant-skill-slot="${slot}"><h3 class="ability-heading">${abilityIcon(loadout.starter, slot === 1 ? 'skill1' : 'skill2')}<span>${escape(radiantSkillName(loadout.starter, slot))} · Skill ${slot}</span></h3>
    <p data-radiant-kit-text="skill${slot}">${escape(radiantSkillText(loadout.starter, slot))}</p>
    <p class="info-price">Costs ${radiantSkillCostFor(loadout, slot)} Luminosity.</p></article>`;
}

/** D-473 O5 role trait, shown beside the Passive. */
export function radiantRoleTrait(id: RadiantBearerId): string {
  const role = radiantBearerKits[id].role;
  if (role === 'Tank') return `Tank: enemies target this Element-Bearer more often (weight ${radiantTankTargetWeight} against 1 for single-target attacks); +50% Defense.`;
  if (role === 'Attacker') return `Attacker: +${percent(radiantRoleSkillPower.Attacker)} Skill Power.`;
  return `Support: +50% Health, +${percent(radiantRoleSkillPower.Support)} Skill Power. Each skill and Convergent Light also heals all allies (${percent(radiantSupportSquadHeal)} of max Health; not scaled by Skill Power).`;
}

/** Skill Duration per slot (D-493: Weaken/Critical Up/Burn skills may gain extra turns). */
function durationText(loadout: RadiantLoadout): string {
  const turns = ([1, 2, 'flare'] as const).map(slot => radiantLoadoutSkillStats(loadout, slot).skillDuration);
  const label = (value: number) => `+${value} turn${value === 1 ? '' : 's'}`;
  return turns.every(value => value === turns[0]) ? label(turns[0])
    : `Skill 1 ${label(turns[0])} · Skill 2 ${label(turns[1])} · Convergent Light ${label(turns[2])}`;
}
/** D-493 C8: personal Luminosity capacity, including Conduit capacity above the Convergent Light cost. */
function luminosityCapacity(loadout: RadiantLoadout): number {
  return Math.floor(radiantBearerKits[loadout.starter].baseCost * (loadout.form >= 4 ? 2 : 1) *
    (1 + Math.min(radiantCapacityCap, radiantEquipmentAmount(loadout, 'capacity'))));
}
/** N4 Skill stats for this loadout: per-slot Skill Power, Efficiency and cost, plus Duration and Gauge Gain. */
export function radiantSkillStatsPanel(loadout: RadiantLoadout): string {
  const rows = ([1, 2, 'flare'] as const).map(slot => {
    const stats = radiantLoadoutSkillStats(loadout, slot);
    const label = slot === 'flare' ? 'Convergent Light' : `Skill ${slot}`;
    const cost = slot === 'flare' ? flareCost(loadout, convergentLightTier(loadout.convergenceRank)) : `${radiantSkillCostFor(loadout, slot)} Luminosity`;
    return `<div data-radiant-skill-stat="${slot}"><dt>${label}</dt><dd><strong>${percent(stats.skillPower)}</strong> Skill Power · ${percent(stats.skillEfficiency)} Skill Efficiency · ${cost}</dd></div>`;
  }).join('');
  const shared = radiantLoadoutSkillStats(loadout, 1);
  return `<dl class="info-stat-table radiant-skill-stats" aria-label="Skill stats">${rows}
    <div data-radiant-skill-stat="duration"><dt>Skill Duration</dt><dd><strong>${durationText(loadout)}</strong> on timed skill effects (max ${radiantMaximumDuration} turns)</dd></div>
    <div data-radiant-skill-stat="capacity"><dt>Luminosity capacity</dt><dd><strong>${luminosityCapacity(loadout)}</strong> Luminosity</dd></div>
    <div data-radiant-skill-stat="gauge"><dt>Gauge Gain</dt><dd><strong>${percent(shared.gaugeGain)}</strong> of every Luminosity gain</dd></div></dl>
    <p class="info-label">Skill Power scales skill and Convergent Light damage, Burn, heals, Shields and buff and debuff strength. It does not scale Normal Attack, fills or Conduit-generated effects. Skill Efficiency discounts costs (max 50%; Convergent Light cost at least 70).</p>`;
}

export function radiantConvergenceRankPanel(loadout: RadiantLoadout, account: Account): string {
  const rank = loadout.convergenceRank;
  const progress = { level: loadout.level, evolution: loadout.form, convergenceRank: rank, ascension: loadout.ascension };
  const cap = convergentLightRankCap(progress, loadout.starter);
  const owned = account.characters[loadout.starter] !== undefined;
  const maximum = owned ? convergentLightMaxPlan(account, loadout.starter, ownedProgress(account, loadout.starter)) : null;
  const tier = convergentLightTier(rank);
  const canRank = rank < 20 && rank < cap;
  const cost = canRank ? convergentLightRankCost(loadout.starter, progress) : null;
  const resourcesFor = (upgradeCost: UpgradeCost) => [
    { id: 'fractalis', name: 'Prismatica', needed: upgradeCost.fractalis, owned: account.fractalis, icon: currencyIcon('fractalis') },
    ...Object.entries(upgradeCost.materials).map(([id, needed]) => {
      const art = materialArt(id);
      return { id, name: materialName(id), needed, owned: account.materials[id] ?? 0,
        icon: art ? `<img draggable="false" src="${assetUrl(`materials/${art}.png`)}" alt="" width="40" height="40">` : '' };
    }),
  ];
  const resources = cost ? resourcesFor(cost) : [];
  const maximumResources = maximum ? resourcesFor(maximum.cost) : [];
  const enough = resources.every(resource => resource.owned >= resource.needed);
  const requiredEvolution = rank + 1 > 10 ? 6 : rank + 1 > 5 ? 4 : 1;
  const requiredLevel = rank * 5;
  const blocked = !owned ? 'Upgrade an owned Element-Bearer.'
    : rank >= 20 ? 'Maximum Convergent Light rank reached.'
    : rank >= cap ? `Reach Lv.${requiredLevel} and Evo.${displayEvolution(loadout.starter, requiredEvolution)} to unlock Rank ${rank + 1}.`
      : enough ? '' : 'Insufficient resources.';
  const maximumBlocked = !owned ? 'Upgrade an owned Element-Bearer.'
    : maximum && maximum.targetRank > rank ? '' : rank >= 20
    ? 'Maximum Convergent Light rank reached.'
    : rank >= cap ? `Reach Lv.${requiredLevel} and Evo.${displayEvolution(loadout.starter, requiredEvolution)} to unlock Rank ${rank + 1}.`
      : 'Not enough resources to raise Convergent Light rank.';
  return `<section class="character-category convergent-rank-panel" data-convergent-rank="${rank}">
    <header><h3>Convergent Light</h3><strong>Rank ${rank} / 20 · +${rank - 1}% effect</strong></header>
    <p>Effects gain 1% per rank above Rank 1. Higher ranks unlock stronger tiers.</p>
    <div class="convergent-rank-tiers" aria-label="${radiantFlareTierNames[tier]}"><span class="is-sparkling"><i style="--rank-fill:${Math.min(rank, 5) / 5 * 100}%"></i>Sparkling · 1–5</span><span class="is-glimmering"><i style="--rank-fill:${Math.max(0, Math.min(rank - 5, 5)) / 5 * 100}%"></i>Glimmering · 6–10</span><span class="is-ultimate"><i style="--rank-fill:${Math.max(0, rank - 10) / 10 * 100}%"></i>Ultimate · 11–20</span></div>
    <div class="convergent-rank-actions"><div>
    ${resources.length ? `<h4>Rank ${rank + 1} <small>Owned / Required</small></h4>` : ''}
    ${resources.length ? `<ul class="upgrade-resources">${resources.map(resource => `<li class="${resource.owned < resource.needed ? 'resource-missing' : 'resource-sufficient'}">${resource.icon}<strong>${escape(resource.name)}</strong><span>${resource.owned} / ${resource.needed}</span></li>`).join('')}</ul>` : ''}
    <button class="primary-button" data-upgrade="convergence" data-upgrade-blocked="${!!blocked}" ${blocked ? 'disabled' : ''}>${rank < 20 ? `Raise to Rank ${rank + 1}` : 'Maximum Rank'}</button>
    </div><div>
    ${maximum && maximum.targetRank > rank ? `<h4>Max Level · Rank ${maximum.targetRank}</h4><p class="info-label">Total cost from Rank ${rank} to ${maximum.targetRank}:</p>` : ''}
    ${maximum && maximum.targetRank > rank ? `<ul class="upgrade-resources">${maximumResources.map(resource => `<li class="${resource.owned < resource.needed ? 'resource-missing' : 'resource-sufficient'}">${resource.icon}<strong>${escape(resource.name)}</strong><span>${resource.owned} / ${resource.needed}</span></li>`).join('')}</ul>` : ''}
    <button class="primary-button" data-upgrade="convergence-max" data-upgrade-blocked="${!!maximumBlocked}" ${maximumBlocked ? 'disabled' : ''}>Max Level</button>
    </div></div>
    <p class="quiet">${escape(maximumBlocked || blocked)}</p>
  </section>`;
}

export function radiantPassiveArticle(loadout: RadiantLoadout): string {
  const passive = radiantBearerKits[loadout.starter].passive;
  return `<article class="hub-ability radiant-passive"><h3 class="ability-heading">${abilityIcon(loadout.starter, 'passive')}<span>${escape(passive.name)} · Passive Skill</span></h3>
    <p>${escape(passive.description)}</p><p class="info-label" data-radiant-role-trait>${escape(radiantRoleTrait(loadout.starter))}</p></article>`;
}

export function radiantLeaderArticle(loadout: RadiantLoadout): string {
  const kit = radiantBearerKits[loadout.starter];
  return `<article class="hub-ability radiant-leader"><h3 class="ability-heading"><span class="radiant-leader-mark" aria-hidden="true">★</span><span>${escape(kit.leader)} · Leader Skill</span></h3>
    <p>${escape(radiantLeaderText(loadout))}</p></article>`;
}

export function radiantBasicArticles(loadout: RadiantLoadout): string {
  const element = radiantBearerKits[loadout.starter].element;
  return `<article class="hub-ability radiant-normal"><h3 class="ability-heading">${abilityIcon(loadout.starter, 'light')}<span>Normal Attack</span></h3>
      <p>1-hit ${escape(element)} attack on one enemy (100%). A damaging hit fills ${radiantChargeRules.normal} Luminosity; each other living ${escape(element)} ally gains ${radiantChargeRules.otherMemberPercent}% of it. Skill Power does not apply.</p></article>`;
}

/** Shared rules, written once (AGENTS tooltip rule): kit text refers to these terms. */
export function radiantKitGlossary(): string {
  return `<dl class="info-glossary radiant-glossary">
    <div><dt>Turns</dt><dd>Durations count player turns. A timed effect cast this turn counts its first turn at the end of this turn's enemy phase.</dd></div>
    <div><dt>Categories</dt><dd>Allies hold Attack Up, Defense Up, Damage Reduction, Luminosity Gain Up and Health Over Time; enemies hold Weaken, Critical Up and Burn. The same category does not stack: the strongest applies and the duration becomes the longer one. Different categories combine. Caps: Attack Up and Defense Up +100%, Damage Reduction 75%, Luminosity Gain Up +100%, Health Over Time 30% of max Health per turn, Weaken 50%, Critical Up +160% Critical Rate.</dd></div>
    <div><dt>Burn</dt><dd>Deals damage based on the caster's Attack at the end of each enemy phase, ignoring Defense. No cap.</dd></div>
    <div><dt>Weaken</dt><dd>Lowers the holder's Attack.</dd></div>
    <div><dt>Critical Hit</dt><dd>Each Normal Attack, skill, Convergent Light, signature strike and Burn tick rolls once per target against the attacker's Critical Rate (each bearer has a base rate; every enemy has 10%). A critical hit multiplies that damage by the attacker's Critical Damage (enemies 1.5x). Above 100% Critical Rate, a second roll against the excess makes an Elemental Crit: Critical Damage x1.5 again. Conduit-generated strikes never crit.</dd></div>
    <div><dt>Critical Up</dt><dd>Hits on the enemy gain the listed Critical Rate, added to the attacker's.</dd></div>
    <div><dt>Next-action bonus</dt><dd>A Conduit bonus held by one ally for their next matching action (the Conduit names it). Each Conduit gives an ally one at a time: a new one replaces it rather than stacking. The next matching action spends it; otherwise it ends with the turn after the one that granted it, unless the Conduit states another limit. Skill Efficiency from bonuses still caps the total discount at 50%.</dd></div>
    <div><dt>Shield</dt><dd>Absorbs damage until broken. Shields from skills and Convergent Light stack. Kit heals and Shields are a percentage of the recipient's max Health.</dd></div>
    <div><dt>Targets</dt><dd>One-enemy skills hit the current target. Ally skills reach all allies, the other allies, the caster, or the ally with the lowest Health.</dd></div>
    <div><dt>Taunt</dt><dd>While an ally taunts, every enemy attack aims at that ally, including Calamity attacks that pick by Health. A taunt ends with the enemy phase it covers or when its holder is defeated; the latest taunt in the squad applies.</dd></div>
    <div><dt>Rescue limit</dt><dd>Each ally can be rescued by a Conduit once per encounter: Phoenix Reactor's revival and Accord's save share that one rescue. Ozriel's Refusal is separate and can still save an ally afterwards.</dd></div>
    <div><dt>Luminosity</dt><dd>Normal Attack hits fill ${radiantChargeRules.normal}; each enemy hit taken fills ${radiantChargeRules.incomingAttack}. Skill 1 costs 25, Skill 2 costs 40, a Convergent Light costs 100 (Sparkling) or 200 (Glimmering and Ultimate). Skills and Convergent Light fill none.</dd></div>
    <div><dt>Health mote</dt><dd>Each defeated enemy heals the Element-Bearer who defeated it (${percent(radiantHealthMote)} of max Health; the Burn's caster for a Burn defeat). Motes never revive.</dd></div>
  </dl>`;
}

export function radiantMasterLine(loadout: RadiantLoadout): string {
  if (loadout.masterId === null) return '<p class="radiant-master-line">No personal Master equipped · Equinox.</p>';
  return `<p class="radiant-master-line"><strong>${escape(getMasterConduit(loadout.masterId).name)}</strong> · ${escape(radiantMasters[loadout.masterId].effect)}</p>`;
}

export function radiantAttunementSection(loadout: RadiantLoadout): string {
  return `<section class="character-category radiant-attunement" data-radiant-attunement="${radiantAttunement(loadout)}"><h3>Attunement · ${radiantAttunementName(loadout)}</h3>
    <p>${escape(radiantAttunementProfile(loadout))}</p>${radiantMasterLine(loadout)}</section>`;
}

export function radiantKitSections(loadout: RadiantLoadout): string {
  return informationSheet([
    { title: 'Leader Skill', kind: 'leader', content: radiantLeaderArticle(loadout) },
    { title: 'Skills', kind: 'skills', content: `${radiantSkillArticle(loadout, 1)}${radiantSkillArticle(loadout, 2)}` },
    { title: 'Convergent Light', kind: 'flares', content: `<div class="info-flare-grid">${(['sparkling', 'glimmering', 'ultimate'] as const).map(tier => radiantFlareArticle(loadout, tier)).join('')}</div>` },
    { title: 'Passive Skill', kind: 'passive', content: radiantPassiveArticle(loadout) },
  ]);
}

export function radiantPortraitStats(loadout: RadiantLoadout): string {
  const values = resolveRadiantStarterStats(loadout);
  return `<dl class="ref-portrait-stats" aria-label="Current combat stats">
    <div><dt>Attunement</dt><dd>${radiantAttunementChip(loadout)}</dd></div>
    <div><dt>Level</dt><dd>${formatStat(loadout.level)}</dd></div>
    ${radiantStatKeys.map(key => `<div><dt>${key === 'hp' ? 'Health' : radiantStatLabels[key]}</dt><dd>${formatStat(values[key])}</dd></div>`).join('')}</dl>`;
}

export function radiantCompactOverview(loadout: RadiantLoadout): string {
  const activeTier = convergentLightTier(loadout.convergenceRank);
  return `<div class="ref-compact-kit">
    ${radiantLeaderArticle(loadout)}${radiantSkillArticle(loadout, 1)}${radiantSkillArticle(loadout, 2)}${radiantPassiveArticle(loadout)}
    <section class="ref-flare-summary"><header class="ref-flare-heading"><h3>${radiantFlareTierNames[activeTier]} · ${escape(radiantSkillName(loadout.starter, 'flare'))} · Rank ${loadout.convergenceRank}</h3>
      ${information(`unit-reference-${loadout.id}`, characterName(loadout.starter, loadout.form),
        radiantCharacterSheet(loadout, false), 'Full character information', 'Details')}</header>
      <p data-radiant-kit-text="flare">${escape(radiantFlareText(loadout.starter, activeTier))}</p>
      <div class="ref-flare-actions" aria-label="Convergent Light rank bands">${(['sparkling', 'glimmering', 'ultimate'] as const).map(tier =>
        information(`unit-flare-${loadout.id}-${tier}`, radiantFlareTierNames[tier], radiantFlareArticle(loadout, tier),
          radiantFlareTierNames[tier], tier === 'sparkling' ? 'Sparkling' : tier === 'glimmering' ? 'Glimmering' : 'Ultimate')).join('')}</div>
    </section>
  </div>`;
}

export function radiantCharacterSheet(loadout: RadiantLoadout, includeProfile = true, squadState = 'Form preview'): string {
  const starter = getStarter(loadout.starter);
  const gear = loadout.gear ?? [];
  return `<div class="info-character" data-info-element="${starter.elementId}">${includeProfile ? informationSheet([{ title: characterName(loadout.starter, loadout.form), kind: 'profile', content:
    `<div class="info-core"><div class="info-profile-art">${portrait(starter, loadout.form)}</div><div class="info-profile">${elementLabel(starter.elementId)}<p class="info-label">${starter.stars} stars · ${characterRarity(starter.id, loadout.form)} · ${radiantAttunementName(loadout)}</p><p class="info-label">Level ${loadout.level} / ${characterLevelCap(loadout.form, starter.id)} · Evolution ${displayEvolution(starter.id, loadout.form)} · ${escape(squadState)}</p></div></div>` }]) : ''}
    ${informationSheet([{ title: 'Stats', kind: 'stats', content: radiantStatsPanel(loadout) },
      { title: 'Skill stats', kind: 'skill-stats', content: radiantSkillStatsPanel(loadout) }])}
    ${radiantKitSections(loadout)}
    ${informationSheet([{ title: 'Personal Master / Conduits', kind: 'equipment', content:
      `${radiantAttunementSection(loadout)}
      <p class="info-label">${gear.filter(Boolean).length} / 8 ordinary slots equipped.</p>
      ${gear.some(Boolean) ? `<ul class="info-effects">${gear.flatMap(entry => entry ? [`<li><strong>${escape(getConduit(entry.id).name)} +${entry.rank}</strong><ul>${radiantConduitPrimitives(entry).map(rule => `<li>${escape(radiantConduitDescription(rule))}</li>`).join('')}</ul></li>`] : []).join('')}</ul>` : ''}
    ` }])}
    <details class="info-lore"><summary>Lore</summary><p>${bracketReferences(escape(`${starter.description} ${starter.lore.story}`))}</p></details>
    <details class="info-lore"><summary>Shared combat rules</summary>${radiantBasicArticles(loadout)}${radiantKitGlossary()}<p>Convergent Light rank is saved per Element-Bearer: ranks 1–5 are Sparkling, 6–10 are Glimmering (Evo.4+), and 11–20 are Ultimate (Evo.6+). Each rank requires five character levels; potency increases by 1% per rank above Rank 1.</p></details></div>`;
}

export function radiantUnavailable(): string {
  return '<p role="note">This Element-Bearer is not available for combat yet.</p>';
}
