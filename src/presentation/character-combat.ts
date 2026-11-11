import { radiantAttunement, radiantAttunements, radiantBearerKits, radiantFlares, radiantMasters, resolveRadiantStarterStats,
  type RadiantAttunement, type RadiantBearerId, type RadiantLoadout, type RadiantStats } from '../content/combat-kits';
import { radiantGearAmount } from '../content/conduit-effects';
import { adaptRadiantLoadouts } from '../game/combat-loadout';
import { radiantChargeRules, type FlareTier } from '../game/combat-gauge';
import { getMasterConduit } from '../content/master-conduits';
import { formatStat } from '../content/combat';
import { displayEvolution, type CharacterProgress } from '../content/progression';
import { ownedProgress, type Account } from '../game/account';
import { radiantFlareDescription, radiantFlareNeedsTarget, radiantPassiveEnhancements } from './combat-description';
import { abilityIcon } from './ability-icon';
import { assetUrl, portrait } from './portrait';
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

export const radiantStatKeys = ['hp', 'attack', 'defense', 'recovery'] as const;
export const radiantStatLabels: Record<keyof RadiantStats, string> = { hp: 'HP', attack: 'Attack', defense: 'Defense', recovery: 'Recovery' };
export const radiantAttunementNames: Record<RadiantAttunement, string> = {
  equinox: 'Equinox', corona: 'Corona', aegis: 'Aegis', solstice: 'Solstice', prism: 'Prism',
};
export const radiantFlareTierNames: Record<FlareTier, string> = {
  glowing: 'Glowing Flare', lustrous: 'Lustrous Flare', eternal: 'Eternal Radiant Flare',
};
const tierForm: Record<FlareTier, number> = { glowing: 1, lustrous: 4, eternal: 6 };
const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const multiplier = (value: number): string => String(Number(value.toPrecision(12)));

export interface RadiantCharacterLoadout { loadout: RadiantLoadout; issue: string }

export function isRadiantBearer(id: string): id is RadiantBearerId {
  return Object.hasOwn(radiantBearerKits, id);
}

/** Builds the bearer's live combat loadout (level, form, ascension, Master and Conduits) from the saved account. */
export function radiantCharacterLoadout(account: Account | null, id: string, override?: Partial<CharacterProgress>): RadiantCharacterLoadout | null {
  if (!isRadiantBearer(id)) return null;
  const progress = { ...(account?.characters[id] ? ownedProgress(account, id) : { level: 0, evolution: 1 }), ...override } as CharacterProgress;
  const member: RadiantLoadout = { id, starter: id, level: progress.level, form: progress.evolution,
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
  const profile = radiantAttunements[attunement];
  const changes = radiantStatKeys.filter(key => profile[key] !== 1).map(key => `${radiantStatLabels[key]} ×${multiplier(profile[key])}`);
  const source = loadout.masterId === null ? 'No personal Master equipped' : `Personal Master: ${getMasterConduit(loadout.masterId).name}`;
  return `${changes.length ? changes.join(' · ') : 'Balanced: all four stats ×1'}. ${source}.`;
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
  }).join('')}</dl>`;
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
  const kit = radiantBearerKits[loadout.starter];
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  return kit.leaderBonus * (loadout.ascension.skill2 ? 1.5 : 1) + (master?.enhancement === 'leader' ? master.magnitude : 0) +
    radiantGearAmount(loadout.gear, 'leader');
}

export function radiantLeaderText(loadout: RadiantLoadout): string {
  const kit = radiantBearerKits[loadout.starter];
  return `Every squad member gains +${percent(radiantLeaderAmount(loadout))} ${radiantStatLabels[kit.leaderStat]} while this Element-Bearer is first in the squad and alive.`;
}

function signaturePower(loadout: RadiantLoadout): number {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  return 1 + (master?.rule === 'standard' && master.enhancement === 'signature' ? master.magnitude : 0) +
    (loadout.ascension.lastFlare ? .5 : 0);
}

export function radiantFlareTierUnlocked(loadout: RadiantLoadout, tier: FlareTier): boolean {
  return loadout.form >= tierForm[tier];
}

function flareCost(loadout: RadiantLoadout, tier: FlareTier): string {
  const cost = radiantBearerKits[loadout.starter].baseCost * (tier === 'glowing' ? 1 : 2);
  return `${cost} personal charge${tier === 'eternal' ? ' + full shared meter' : ''}`;
}

export function radiantFlareArticle(loadout: RadiantLoadout, tier: FlareTier): string {
  const offer = radiantFlares[loadout.starter][tier];
  const icon = abilityIcon(loadout.starter, tier === 'glowing' ? 'skill1' : tier === 'lustrous' ? 'skill2' : 'ultimate');
  const unlocked = radiantFlareTierUnlocked(loadout, tier);
  const power = signaturePower(loadout);
  const extra = loadout.starter === 'ember' && tier === 'eternal' ? '<li>First consumes all Infernis-owned Burns on each target, paying each remaining phase as periodic damage; surviving targets then receive the new Burn.</li>'
    : loadout.starter === 'sprout' && tier === 'eternal' ? '<li>Also removes each living ally’s strongest Weaken.</li>' : '';
  return `<article class="hub-ability radiant-flare info-ability${unlocked ? '' : ' is-locked'}" data-radiant-flare="${tier}" data-radiant-reference-tier="${tier}"><h4 class="ability-heading">${icon}<span>${escape(offer.name)} · ${radiantFlareTierNames[tier]}</span></h4>
    <p class="info-label">${unlocked ? 'Unlocked' : 'Locked'} · Unlocks at Evo.${displayEvolution(loadout.starter, tierForm[tier])}.</p>
    <p class="info-label">Target: ${offer.target === 'all-enemies' ? 'all living enemies' : offer.target === 'one-enemy' ? 'selected living enemy' : 'all living allies'}${radiantFlareNeedsTarget(loadout, tier) && offer.target !== 'one-enemy' ? '; select a living enemy for the Master effect' : ''}.</p>
    <ul class="info-effects">${radiantFlareDescription(offer).map(line => `<li>${escape(line)}</li>`).join('')}${extra}</ul>
    <p class="info-price">Costs ${flareCost(loadout, tier)}.</p>${power !== 1 ? `<p>Effect magnitudes ×${multiplier(power)} (not durations).</p>` : ''}</article>`;
}

export function radiantPassiveArticle(loadout: RadiantLoadout): string {
  const passive = radiantBearerKits[loadout.starter].passive;
  return `<article class="hub-ability radiant-passive"><h3 class="ability-heading">${abilityIcon(loadout.starter, 'passive')}<span>${escape(passive.name)} · Passive</span></h3>
    <p>${escape(passive.description)}</p>${radiantPassiveEnhancements(loadout).map(line => `<p class="hub-cost">${escape(line)}</p>`).join('')}</article>`;
}

export function radiantLeaderArticle(loadout: RadiantLoadout): string {
  const kit = radiantBearerKits[loadout.starter];
  return `<article class="hub-ability radiant-leader"><h3 class="ability-heading"><span class="radiant-leader-mark" aria-hidden="true">★</span><span>${escape(kit.leader)} · Leader skill</span></h3>
    <p>${radiantLeaderText(loadout)}</p></article>`;
}

export function radiantBasicArticles(loadout: RadiantLoadout): string {
  return `<article class="hub-ability radiant-normal"><h3 class="ability-heading">${abilityIcon(loadout.starter, 'light')}<span>Normal Attack</span></h3>
      <p>One selected living enemy: direct damage at 100% Attack before Defense mitigation. Grants ${radiantChargeRules.normal} personal charge on a hit.</p></article>
    <article class="hub-ability radiant-defense"><h3 class="ability-heading"><img class="ability-icon" draggable="false" src="${assetUrl('abilities/universal-defense.png')}" alt="" width="48" height="48"><span>Defense</span></h3>
      <p>Halves direct enemy damage taken until the next round (combined reduction floor: 20% damage taken). Grants ${radiantChargeRules.defense} personal charge.</p></article>`;
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
    { title: 'Leader skill', kind: 'leader', content: radiantLeaderArticle(loadout) },
    { title: 'Flares', kind: 'flares', content: `<div class="info-flare-grid">${(['glowing', 'lustrous', 'eternal'] as const).map(tier => radiantFlareArticle(loadout, tier)).join('')}</div>` },
    { title: 'Passive', kind: 'passive', content: radiantPassiveArticle(loadout) },
  ]);
}

export function radiantCharacterSheet(loadout: RadiantLoadout, includeProfile = true, squadState = 'Form preview'): string {
  const starter = getStarter(loadout.starter);
  const gear = loadout.gear ?? [];
  return `<div class="info-character" data-info-element="${starter.elementId}">${includeProfile ? informationSheet([{ title: characterName(loadout.starter, loadout.form), kind: 'profile', content:
    `<div class="info-core"><div class="info-profile-art">${portrait(starter, loadout.form)}</div><div class="info-profile">${elementLabel(starter.elementId)}<p class="info-label">${starter.stars} stars · ${characterRarity(starter.id, loadout.form)} · ${radiantAttunementName(loadout)}</p><p class="info-label">Level ${loadout.level} / ${characterLevelCap(loadout.form, starter.id)} · Evolution ${displayEvolution(starter.id, loadout.form)} · ${escape(squadState)}</p></div></div>` }]) : ''}
    ${informationSheet([{ title: 'Stats', kind: 'stats', content: radiantStatsPanel(loadout) }])}
    ${radiantKitSections(loadout)}
    ${informationSheet([{ title: 'Personal Master / Conduits', kind: 'equipment', content:
      `${radiantAttunementSection(loadout)}
      <p class="info-label">${gear.filter(Boolean).length} / 8 ordinary slots equipped.</p>
      ${gear.some(Boolean) ? `<ul class="info-effects">${gear.flatMap(entry => entry ? [`<li><strong>${escape(getConduit(entry.id).name)} +${entry.rank}</strong><ul>${radiantConduitPrimitives(entry).map(rule => `<li>${escape(radiantConduitDescription(rule))}</li>`).join('')}</ul></li>`] : []).join('')}</ul>` : ''}
    ` }])}
    <details class="info-lore"><summary>Lore</summary><p>${bracketReferences(escape(`${starter.description} ${starter.lore.story}`))}</p></details>
    <details class="info-lore"><summary>Shared combat rules</summary>${radiantBasicArticles(loadout)}<p>Personal charge builds from actions; the highest ready tier is cast. The Eternal shared meter starts at 100, rises 25 after each Eternal Radiant Flare and caps at 200.</p></details></div>`;
}

export function radiantUnavailable(): string {
  return '<p role="note">This Element-Bearer is not available for combat yet.</p>';
}
