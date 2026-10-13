import { elementalEffectFamilies, sharedNativeEffects, type ElementalEffectTag } from './elemental-effects';
import type { StarterId } from './starters';

export const kitResourceUses: Partial<Record<StarterId, string>> = {
  ember: 'Flame Arc spends all Infernic Embers for +8% damage per charge (up to +24%). Last Flare: Dawnfire spends them for +12% damage per charge (up to +36%).',
  tide: 'Undertow Thrust spends all Oceanic Protection for +5 percentage points of Weaken per charge (up to +15; total capped at 60%). Last Flare: Ocean Memory spends them to add team shield equal to 5% of Tizu\'s maximum HP per charge (up to 15%).',
  sprout: 'Briar Shot spends all Botanic Renewal charges for +10% damage per charge (up to +30%). Last Flare: Worldseed spends them for +15% healing per charge (up to +45%).',
  bliss: 'Warfeather Cut spends all Botanic Renewal charges for +8% damage per charge (up to +24%). Last Flare spends them to add team shield equal to 5% of Bliss\'s maximum HP per charge (up to 15%).',
  atmoso: 'Skill 1 spends all Atmospheric Charge for +8% damage per charge (up to +24%). Last Flare spends them for +12% damage per charge (up to +36%).',
  elise: 'Skill 1 spends all Atmospheric Charge for +8% damage per charge (up to +24%). Last Flare spends them for +12% damage per charge (up to +36%).',
  vaelor: 'Skill 2 spends all Atmospheric Charge for +8% damage per charge (up to +24%). Last Flare spends them for +12% damage per charge (up to +36%).',
  rosetta: 'Golden Thorn Volley spends all Rose Grace for +5 percentage points of Weaken per charge (up to +15; total capped at 60%). Last Flare spends them for +10% damage per charge (up to +30%).',
  thornia: 'Shadow Rose Cleave spends all Thorn Aegis for +5 percentage points of Weaken per charge (up to +15; total capped at 60%). Last Flare spends them to add team shield equal to 5% of Thornia\'s maximum HP per charge (up to 15%), before shield modifiers.',
  crinso: 'Golden Edge spends all Rose Duality for +8% damage per charge (up to +24%). Last Flare spends them for +12% damage per charge (up to +36%).',
};

export type KitPilot = 'ember' | 'ward' | 'bloom' | 'tempest' |
  'rose-grace' | 'thorn-aegis' | 'rose-duality';
export type KitPilotResourceKey = 'ember' | 'ward' | 'bloom' | 'tempest' |
  'roseGrace' | 'thornAegis' | 'duality';

export interface KitPilotState {
  ember?: number;
  emberRound?: number;
  ward?: number;
  wardRound?: number;
  bloom?: number;
  bloomRound?: number;
  tempest?: number;
  roseGrace?: number;
  roseGraceRound?: number;
  thornAegis?: number;
  thornAegisRound?: number;
  authoredShieldSourceId?: string;
  duality?: number;
  dualityRound?: number;
}

export const kitPilotDescriptions: Record<KitPilot, {
  passive?: string;
  skill1?: string;
  skill2?: string;
  ultimate?: string;
  resource?: { label: string; key: KitPilotResourceKey; detail: string; summary: string; effect: ElementalEffectTag };
}> = {
  ember: {
    passive: `While you are alive, Burn from your own abilities grants one charge of ${elementalEffectFamilies.burn.label} when it deals damage, at most once per enemy phase (maximum 3). Save these charges to strengthen Flame Arc or Last Flare.`,
    skill2: `Spends all ${elementalEffectFamilies.burn.label} charges for +8% outgoing damage per charge (maximum +24%); one spend for the whole activation.`,
    ultimate: `Spends all ${elementalEffectFamilies.burn.label} charges for +12% outgoing damage per charge (maximum +36%); one spend for the whole activation.`,
    resource: { label: elementalEffectFamilies.burn.label, key: 'ember', summary: 'Save up to 3 charges from your own Burn damage, once per enemy phase while alive. Flame Arc spends them for +8% damage each; Last Flare spends them for +12% each.', detail: `${elementalEffectFamilies.burn.label}: Skill 2 +8% outgoing damage per charge or Last Flare +12% per charge.`, effect: sharedNativeEffects.ember },
  },
  ward: {
    passive: `While you are alive, shields from your own abilities grant one charge of ${elementalEffectFamilies.ward.label} when they absorb a direct enemy hit, at most once per enemy phase across the team (maximum 3). Save these charges to strengthen Undertow Thrust's Weaken or Last Flare's team shield.`,
    skill1: `Spends all ${elementalEffectFamilies.ward.label} charges for +5 percentage points Weaken per charge (maximum +15; total reduction capped at 60%).`,
    ultimate: `Spends all ${elementalEffectFamilies.ward.label} charges to increase this ability's team shield by 5% of your maximum Health per charge (maximum 15%). Each ally keeps the higher of their remaining shield and this new amount.`,
    resource: { label: elementalEffectFamilies.ward.label, key: 'ward', summary: 'Save up to 3 charges when your ability shield absorbs a direct enemy hit, once per enemy phase while alive. Skill 1 spends them to strengthen Weaken; Last Flare spends them for a larger team shield.', detail: `${elementalEffectFamilies.ward.label}: Skill 1 +5 percentage points Weaken per charge or Last Flare adds a shield worth 5% of caster maximum Health per charge.`, effect: sharedNativeEffects.ward },
  },
  bloom: {
    passive: `While you are alive, healing from your own abilities or passive grants one charge of ${elementalEffectFamilies.bloom.label} when it restores missing HP, at most once per turn (maximum 3). Full-health targets and Conduit healing do not count. Save these charges to strengthen Skill 1 or Last Flare.`,
    resource: { label: elementalEffectFamilies.bloom.label, key: 'bloom', summary: 'Save up to 3 charges by restoring missing HP with your own kit, once per turn. Skill 1 spends them for extra damage. Last Flare spends them for extra healing (Flora) or team shield (Bliss). Conduit healing does not earn charges.', detail: `${elementalEffectFamilies.bloom.label}: Skill 1 spends charges for extra damage; Last Flare spends them for extra healing (Flora) or team shield (Bliss).`, effect: sharedNativeEffects.bloom },
  },
  tempest: {
    passive: `A critical Normal Attack, Skill 1 or Skill 2 that deals damage grants one charge of ${elementalEffectFamilies.tempest.label}, at most once per use even against multiple enemies (maximum 3). Last Flare grants none. Save these charges for the charge-spending skill or Last Flare's damage bonus.`,
    resource: { label: elementalEffectFamilies.tempest.label, key: 'tempest', summary: 'Save up to 3 charges from damaging critical Normal Attacks or skills, once per use; Last Flare earns none. Skill 1 (Atmoso and Elise) or Skill 2 (Vaelor) spends them for +8% damage each; Last Flare spends them for +12% each.', detail: `${elementalEffectFamilies.tempest.label}: Skill 1 (Atmoso and Elise) or Skill 2 (Vaelor) spends charges for +8% damage each; Last Flare spends them for +12% each.`, effect: sharedNativeEffects.tempest },
  },
  'rose-grace': {
    passive: 'While Rosetta is alive, her abilities or passive grant one Rose Grace charge when they restore missing HP, at most once per turn (maximum 3). Full-health targets and Conduit healing do not count.',
    skill1: 'Spends all Rose Grace for +5 percentage points Weaken each (maximum +15; combined reduction capped at 60%).',
    ultimate: 'Spends all Rose Grace for +10% outgoing damage each (maximum +30%); one spend for the whole activation.',
    resource: { label: 'Rose Grace', key: 'roseGrace', summary: 'Save up to 3 charges by restoring missing HP with Rosetta\'s own kit, once per turn while alive. Skill 1 spends them for stronger Weaken; Last Flare spends them for +10% damage each. Conduit healing does not earn charges.', detail: 'Rose Grace: Skill 1 +5 percentage points Weaken each or Last Flare +10% outgoing damage each.', effect: { family: 'bloom', kind: 'healing', origin: 'rose', source: 'living-self-authored-healing' } },
  },
  'thorn-aegis': {
    passive: 'While Thornia is alive, shields from her abilities grant one Thorn Aegis charge when they absorb a direct enemy hit, at most once per enemy phase across the team (maximum 3). Conduit shields do not count.',
    skill2: 'Spends all Thorn Aegis for +5 percentage points Weaken each (maximum +15; combined reduction capped at 60%).',
    ultimate: 'Spends all Thorn Aegis to add shield points equal to 5% of your maximum Health per charge (maximum 15%), before this ability\'s shield modifiers. Each ally keeps the higher of their remaining shield and this new amount.',
    resource: { label: 'Thorn Aegis', key: 'thornAegis', summary: 'Save up to 3 charges when Thornia\'s ability shield absorbs a direct enemy hit, once per enemy phase while alive. Skill 2 spends them for stronger Weaken; Last Flare spends them for a larger team shield. Conduit shields do not earn charges.', detail: 'Thorn Aegis: Skill 2 +5 percentage points Weaken each or Last Flare adds 5% caster maximum Health shield each.', effect: { family: 'ward', kind: 'shield-absorption', origin: 'rose', source: 'living-self-authored-shield' } },
  },
  'rose-duality': {
    passive: 'While Crinso is alive, Burn from his abilities grants one Rose Duality charge when it deals damage, at most once per enemy phase (maximum 3). The charges are not Burn and are separate from the Ember Seals granted by the Cinder Testament Conduit.',
    skill1: 'Spends all Rose Duality for +8% outgoing damage each (maximum +24%); one spend for the whole activation.',
    ultimate: 'Spends all Rose Duality for +12% outgoing damage each (maximum +36%); one spend for the whole activation.',
    resource: { label: 'Rose Duality', key: 'duality', summary: 'Save up to 3 charges from Crinso\'s own Burn damage, once per enemy phase while alive. Skill 1 spends them for +8% damage each; Last Flare spends them for +12% each. Separate from Conduit charges.', detail: 'Rose Duality: Skill 1 +8% outgoing damage each or Last Flare +12% each.', effect: { family: 'burn', kind: 'burn', origin: 'rose', source: 'living-self-authored-burn' } },
  },
};
