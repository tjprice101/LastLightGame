import { type AbilityStrength, type FighterDefinition } from '../content/combat';
import { kitPilotDescriptions, kitResourceUses } from '../content/kit-pilots';
import type { StarterId } from '../content/starters';
import { elementalStatusArt, type StatusArtId } from '../content/status-art';
import { statusIcon } from './status-icon';
import { elementalEffectFamilies, type ElementalEffectFamily } from '../content/elemental-effects';
import { nativeIdentities } from '../content/native-identities';

type NativeSlot = 'passive' | 'skill1' | 'skill2' | 'ultimate';
type NativeStatus = readonly [StatusArtId | undefined, string];

/** Statuses each native kit applies, tracks or spends, in reading order; shown beside the ability text in menus (D-339). */
export const nativeAbilityStatuses: Record<StarterId, Partial<Record<NativeSlot, readonly NativeStatus[]>>> = {
  ozriel: { passive: [['calamitic-refusal', 'Refusal']], skill1: [['suppression', 'Weaken']], skill2: [['ward', 'Shield']], ultimate: [['ward', 'Shield']] },
  ilvaris: { passive: [['calamitic-fate-mark', 'Fate-seared Mark']], skill1: [['calamitic-fate-mark', 'Fate-seared Mark']],
    skill2: [['bloom', 'Healing'], [undefined, 'Hymn of Broken Glass']], ultimate: [['bloom', 'Healing']] },
  kaelith: { passive: [['calamitic-fault', 'Fractalized Incision']], skill1: [['calamitic-fault', 'Fractalized Incision']], skill2: [['calamitic-fault', 'Fractalized Incision']], ultimate: [['calamitic-fault', 'Fractalized Incision']] },
  ember: { passive: [['burn', 'Burn']], skill1: [['burn', 'Burn']], skill2: [['burn', 'Burn']], ultimate: [['burn', 'Burn']] },
  tide: { passive: [['ward', 'Shield']], skill2: [['ward', 'Shield']], ultimate: [['ward', 'Shield']] },
  sprout: { passive: [['native-flora-seed', 'Seed']], skill1: [['native-flora-seed', 'Seed']],
    skill2: [['bloom', 'Healing'], ['native-flora-seed', 'Seed']], ultimate: [['bloom', 'Healing'], ['native-flora-empowered-seed', 'Empowered Seed']] },
  atmoso: { passive: [['native-atmoso-cyclone', 'Cyclone']], skill1: [['native-atmoso-cyclone', 'Cyclone']],
    skill2: [['native-atmoso-cyclone', 'Cyclone']], ultimate: [['native-atmoso-cyclone', 'Cyclone']] },
  elise: { passive: [['native-elise-held-blade', 'Held Shuriken'], ['native-elise-lodged-blade', 'Lodged Shuriken']],
    skill1: [['native-elise-lodged-blade', 'Lodged Shuriken']], skill2: [['native-elise-held-blade', 'Recall']], ultimate: [['native-elise-held-blade', 'Recall']] },
  bliss: { passive: [['native-bliss-opening', 'Opening'], ['native-bliss-passing', 'Passing'], ['native-bliss-closing', 'Closing']],
    skill1: [['native-bliss-opening', 'Opening'], ['native-bliss-closing', 'Closing']],
    skill2: [['native-bliss-opening', 'Opening'], ['native-bliss-closing', 'Closing']],
    ultimate: [['native-bliss-opening', 'Opening'], ['native-bliss-closing', 'Closing']] },
  bruno: { passive: [['native-bruno-cover', 'Cover']], skill2: [['native-bruno-cover', 'Cover']], ultimate: [['native-bruno-cover', 'Cover'], ['ward', 'Shield']] },
  disciple: { passive: [['native-disciple-strike', 'Strike'], ['native-disciple-shelter', 'Shelter'], ['native-disciple-resolve', 'Resolve']],
    skill1: [['native-disciple-strike', 'Strike']], skill2: [['native-disciple-shelter', 'Shelter']], ultimate: [['native-disciple-resolve', 'Resolve']] },
  aurora: { skill1: [['native-aurora-seal', 'Seal']], skill2: [['native-aurora-seal', 'Seal']], ultimate: [['native-aurora-ultimate-ward', 'Ultimate Ward']] },
  razor: { passive: [['native-razor-wounds', 'Wounds']], skill1: [['native-razor-wounds', 'Wounds']],
    skill2: [['native-razor-bastion', 'Bastion'], ['ward', 'Shield']], ultimate: [['native-razor-wounds', 'Wounds']] },
  rosetta: { passive: [['native-rosetta-quarry', 'Quarry'], ['ward', 'Shield']], skill1: [['native-rosetta-quarry', 'Quarry']],
    skill2: [['native-rosetta-quarry', 'Quarry']], ultimate: [['native-rosetta-quarry', 'Quarry'], ['bloom', 'Healing']] },
  thornia: { passive: [['native-thornia-trap', 'Thorn Trap']], skill1: [['native-thornia-trap', 'Thorn Trap']],
    skill2: [['native-thornia-trap', 'Thorn Trap']], ultimate: [['native-thornia-empowered-trap', 'Empowered Thorn Trap']] },
  crinso: { passive: [['native-crinso-gold-edge', 'Golden Edge'], ['native-crinso-crimson-edge', 'Crimson Rupture'], ['native-crinso-combo', 'Combo']],
    skill1: [['native-crinso-gold-edge', 'Golden Edge'], ['native-crinso-combo', 'Combo']],
    skill2: [['native-crinso-crimson-edge', 'Crimson Rupture'], ['native-crinso-combo', 'Combo']], ultimate: [['native-crinso-combo', 'Combo']] },
  nerithe: { passive: [['native-nerithe-survey', 'Survey']], skill1: [['native-nerithe-survey', 'Survey']],
    skill2: [['native-nerithe-survey', 'Survey']], ultimate: [['native-nerithe-survey', 'Survey']] },
  orvella: { passive: [['native-orvella-foundation', 'Foundation']], skill1: [['native-orvella-foundation', 'Foundation']],
    skill2: [['native-orvella-foundation', 'Foundation']], ultimate: [['native-orvella-foundation', 'Foundation']] },
  vaelor: { passive: [['native-vaelor-tune', 'Tune'], ['native-vaelor-rise', 'Rise'], ['native-vaelor-crescendo', 'Crescendo']],
    skill1: [['native-vaelor-tune', 'Tune']], skill2: [['native-vaelor-rise', 'Rise']], ultimate: [['native-vaelor-crescendo', 'Crescendo']] },
  caldrex: { passive: [[undefined, 'Heat']], skill1: [['ward', 'Shield'], [undefined, 'Taunt']], skill2: [[undefined, 'Heat'], ['burn', 'Burn']],
    ultimate: [[undefined, 'Heat'], ['ward', 'Shield'], [undefined, 'Taunt'], ['burn', 'Burn']] },
  solenne: { passive: [[undefined, 'Stillness']], skill1: [['suppression', 'Weaken'], [undefined, 'Taunt']], skill2: [[undefined, 'Stillness'], ['ward', 'Shield']],
    ultimate: [[undefined, 'Stillness'], ['ward', 'Shield']] },
  myrthen: { passive: [[undefined, 'Season']], skill1: [[undefined, 'Reaper’s Claim'], [undefined, 'Season']], skill2: [[undefined, 'Season']], ultimate: [[undefined, 'Season']] },
  maerion: { passive: [[undefined, 'Unreturned']], skill1: [[undefined, 'Healing']],
    skill2: [[undefined, 'Unreturned'], [undefined, 'Healing']], ultimate: [[undefined, 'Unreturned'], [undefined, 'Healing']] },
  caevren: { passive: [[undefined, 'Load']], skill1: [[undefined, 'Taunt']], skill2: [['ward', 'Shield'], [undefined, 'Interception']],
    ultimate: [[undefined, 'Load'], ['ward', 'Shield'], [undefined, 'Interception']] },
  vespera: { passive: [[undefined, 'Beacon']], skill1: [['burn', 'Burn']], skill2: [[undefined, 'Signal']],
    ultimate: [[undefined, 'Beacon'], [undefined, 'Signal']] },
  ilyss: { passive: [[undefined, 'Severance']], skill1: [['suppression', 'Weaken']],
    skill2: [[undefined, 'Cleansing'], ['bloom', 'Healing']], ultimate: [[undefined, 'Severance'], ['bloom', 'Healing']] },
  asteriel: { passive: [[undefined, 'Shelter'], [undefined, 'Flourish'], [undefined, 'Promise']],
    skill1: [['ward', 'Shield'], [undefined, 'Shelter']], skill2: [[undefined, 'Moonflower'], [undefined, 'Flourish']],
    ultimate: [[undefined, 'Promise'], ['ward', 'Shield'], [undefined, 'Moonflower']] },
  serapha: { passive: [[undefined, 'Interval']], skill1: [['suppression', 'Weaken']],
    skill2: [['bloom', 'Healing'], [undefined, 'Ceasefire']], ultimate: [[undefined, 'Interval'], ['bloom', 'Healing'], [undefined, 'Ceasefire']] },
  rhaziel: { passive: [[undefined, 'Repair']], skill1: [['ward', 'Shield']],
    skill2: [['bloom', 'Healing'], ['ward', 'Shield']], ultimate: [['bloom', 'Healing'], ['ward', 'Shield']] },
  oryn: { passive: [[undefined, 'Terms'], [undefined, 'Accord']], skill1: [['suppression', 'Weaken'], [undefined, 'Terms']],
    skill2: [[undefined, 'Accord']], ultimate: [['suppression', 'Weaken'], [undefined, 'Accord']] },
  thessara: { passive: [[undefined, 'Reserve']], skill1: [[undefined, 'Reserve']],
    skill2: [[undefined, 'Reserve'], ['bloom', 'Healing']], ultimate: [[undefined, 'Reserve'], ['bloom', 'Healing']] },
  elaris: { passive: [[undefined, 'Branch']], skill1: [[undefined, 'Branch']],
    skill2: [[undefined, 'Branch']], ultimate: [[undefined, 'Branch']] },
  veyr: { passive: [[undefined, 'Fault']], skill1: [[undefined, 'Fault']],
    skill2: [[undefined, 'Fault']], ultimate: [[undefined, 'Fault']] },
  aureth: { passive: [[undefined, 'Lead'], [undefined, 'Momentum']], skill1: [[undefined, 'Lead'], ['ward', 'Shield']],
    skill2: [[undefined, 'Lead'], ['suppression', 'Taunt']], ultimate: [[undefined, 'Momentum'], [undefined, 'Lead'], ['ward', 'Shield']] },
  neralis: { passive: [['native-phase2-current', 'Current']], skill1: [['bloom', 'Healing'], [undefined, 'Defense']],
    skill2: [['native-phase2-current', 'Current'], ['bloom', 'Healing']],
    ultimate: [['native-phase2-current', 'Current'], ['bloom', 'Healing']] },
  varkhel: { passive: [['native-phase2-tension', 'Tension']], skill1: [['ward', 'Shield'], [undefined, 'Defense'], ['suppression', 'Taunt']],
    skill2: [['native-phase2-tension', 'Tension']], ultimate: [['native-phase2-tension', 'Tension'], ['ward', 'Shield']] },
  seravelle: { passive: [['native-phase2-cadence', 'Cadence']], skill1: [['burn', 'Burn']],
    skill2: [['native-phase2-cadence', 'Cadence'], [undefined, 'Direct Attack']],
    ultimate: [['bloom', 'Gauge'], [undefined, 'Skill Power']] },
  velmira: { passive: [['native-phase2-crosscut', 'Crosscut']], skill1: [['suppression', 'Weaken']],
    skill2: [['native-phase2-crosscut', 'Crosscut']], ultimate: [['native-phase2-crosscut', 'Crosscut']] },
};

function nativeStatusList(character: string | undefined, slot: NativeSlot): readonly NativeStatus[] {
  return character && character in nativeAbilityStatuses ? nativeAbilityStatuses[character as StarterId][slot] ?? [] : [];
}

export function abilityStatuses(strength: AbilityStrength, character?: string, slot?: NativeSlot): string {
  const effects: readonly [number | undefined, ElementalEffectFamily, string][] = [
    [strength.burnMultiplier, 'burn', 'Burn'],
    [strength.weakenFraction, 'suppression', 'Weaken'],
    [strength.shield, 'ward', 'Shield'],
    [strength.healing, 'bloom', 'Healing'],
    [strength.critBonus, 'focus', 'Critical boost'],
    [strength.attackBoostFraction, 'focus', 'Attack boost'],
  ];
  const active = effects.filter(([value]) => value !== undefined && value > 0);
  const generic = active.map(([, family, label]) =>
    `<span class="ability-status" data-effect-family="${family}" title="${elementalEffectFamilies[family].label} · ${label}">${statusIcon(family)}${label}</span>`);
  const shown = new Set<string>(active.map(([, family]) => family));
  const native = (slot ? nativeStatusList(character, slot) : []).filter(([icon]) => !icon || !shown.has(icon) && (shown.add(icon), true))
    .map(([icon, label]) => `<span class="ability-status" data-native-status="${icon ?? 'text'}" title="${label}">${icon ? statusIcon(icon) : ''}${label}</span>`);
  return generic.length || native.length ? `<span class="ability-statuses">${[...generic, ...native].join('')}</span>` : '';
}

export function kitResource(kit: FighterDefinition, character?: StarterId): string {
  if (kit.nativeIdentity) {
    const identity = character ? nativeIdentities[character] : undefined;
    return identity ? `${abilityStatuses({}, character, 'passive')}<p class="kit-resource-summary native-identity"><strong>${identity.role}</strong> · ${identity.playLoop}</p>` : '';
  }
  const resource = kit.pilot ? kitPilotDescriptions[kit.pilot].resource : undefined;
  const usage = character ? kitResourceUses[character] : resource?.detail;
  return resource ? `<span class="ability-status" data-effect-family="${resource.effect.family}" data-effect-origin="${resource.effect.origin}">
    ${statusIcon(elementalStatusArt(resource.effect))}${resource.label} · Charges</span><p class="kit-resource-summary"><strong>Charges:</strong> ${usage} Spent charges reset to 0. Skills work normally without charges.</p>` : '';
}
