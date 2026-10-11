import { elementalEffectFamilies, sharedNativeEffects, type ElementalEffectTag } from './elemental-effects';

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
    passive: `While you are alive, Burn from your own abilities grants one charge of ${elementalEffectFamilies.burn.label} when it deals damage, at most once per enemy phase (maximum 3). The charges are not Burn and do nothing on their own.`,
    skill2: `Spends all ${elementalEffectFamilies.burn.label} charges for +8% outgoing damage per charge (maximum +24%); one spend for the whole activation.`,
    ultimate: `Spends all ${elementalEffectFamilies.burn.label} charges for +12% outgoing damage per charge (maximum +36%); one spend for the whole activation.`,
    resource: { label: elementalEffectFamilies.burn.label, key: 'ember', summary: 'Charges: 0-3. Gain: +1 from own ability Burn damage, once per enemy phase while alive. Consumption: all charges per listed ability. No standalone effect.', detail: `${elementalEffectFamilies.burn.label}: Skill 2 +8% outgoing damage per charge or Last Flare +12% per charge.`, effect: sharedNativeEffects.ember },
  },
  ward: {
    passive: `While you are alive, shields from your own abilities grant one charge of ${elementalEffectFamilies.ward.label} when they absorb a direct enemy hit, at most once per enemy phase across the team (maximum 3). The charges are not shield points and do nothing on their own.`,
    skill1: `Spends all ${elementalEffectFamilies.ward.label} charges for +5 percentage points Weaken per charge (maximum +15; total reduction capped at 60%).`,
    ultimate: `Spends all ${elementalEffectFamilies.ward.label} charges to increase this ability's team shield by 5% of your maximum Health per charge (maximum 15%). Each ally keeps the higher of their remaining shield and this new amount.`,
    resource: { label: elementalEffectFamilies.ward.label, key: 'ward', summary: 'Charges: 0-3. Gain: +1 from own ability shield absorbing a direct enemy hit on any ally, once per enemy phase while alive. Consumption: all charges per listed ability. No standalone effect.', detail: `${elementalEffectFamilies.ward.label}: Skill 1 +5 percentage points Weaken per charge or Last Flare adds a shield worth 5% of caster maximum Health per charge.`, effect: sharedNativeEffects.ward },
  },
  bloom: {
    passive: `While you are alive, healing from your own abilities or passive grants one charge of ${elementalEffectFamilies.bloom.label} when it restores missing HP, at most once per turn (maximum 3). Full-health targets and Conduit healing do not count. The charges are not healing and do nothing on their own.`,
    resource: { label: elementalEffectFamilies.bloom.label, key: 'bloom', summary: 'Charges: 0-3. Gain: +1 from own abilities or passive restoring missing HP, once per turn while alive. Conduit healing excluded. Consumption: all charges per listed ability. No standalone effect.', detail: `${elementalEffectFamilies.bloom.label} charges come from restoring missing HP with your own abilities or passive, once per turn, maximum 3.`, effect: sharedNativeEffects.bloom },
  },
  tempest: {
    passive: `A critical Normal Attack, Skill 1 or Skill 2 that deals damage grants one charge of ${elementalEffectFamilies.tempest.label}, at most once per use even against multiple enemies (maximum 3). Last Flare grants none. The charges do nothing on their own.`,
    resource: { label: elementalEffectFamilies.tempest.label, key: 'tempest', summary: 'Charges: 0-3. Gain: +1 from a damaging critical Normal Attack, Skill 1 or Skill 2, once per use. Last Flare excluded. Consumption: all charges per listed ability. No standalone effect.', detail: `${elementalEffectFamilies.tempest.label}: the skill that says it spends them gets +8% outgoing damage per charge; Last Flare gets +12% per charge.`, effect: sharedNativeEffects.tempest },
  },
  'rose-grace': {
    passive: 'While Rosetta is alive, her abilities or passive grant one Rose Grace charge when they restore missing HP, at most once per turn (maximum 3). Full-health targets and Conduit healing do not count.',
    skill1: 'Spends all Rose Grace for +5 percentage points Weaken each (maximum +15; combined reduction capped at 60%).',
    ultimate: 'Spends all Rose Grace for +10% outgoing damage each (maximum +30%); one spend for the whole activation.',
    resource: { label: 'Rose Grace', key: 'roseGrace', summary: 'Charges: 0-3. Gain: +1 from own abilities or passive restoring missing HP, once per turn while alive. Conduit healing excluded. Consumption: all charges per listed ability. No standalone effect.', detail: 'Rose Grace: Skill 1 +5 percentage points Weaken each or Last Flare +10% outgoing damage each.', effect: { family: 'bloom', kind: 'healing', origin: 'rose', source: 'living-self-authored-healing' } },
  },
  'thorn-aegis': {
    passive: 'While Thornia is alive, shields from her abilities grant one Thorn Aegis charge when they absorb a direct enemy hit, at most once per enemy phase across the team (maximum 3). Conduit shields do not count.',
    skill2: 'Spends all Thorn Aegis for +5 percentage points Weaken each (maximum +15; combined reduction capped at 60%).',
    ultimate: 'Spends all Thorn Aegis to add shield points equal to 5% of your maximum Health per charge (maximum 15%), before this ability\'s shield modifiers. Each ally keeps the higher of their remaining shield and this new amount.',
    resource: { label: 'Thorn Aegis', key: 'thornAegis', summary: 'Charges: 0-3. Gain: +1 from own ability shield absorbing a direct enemy hit on any ally, once per enemy phase while alive. Conduit shields excluded. Consumption: all charges per listed ability. No standalone effect.', detail: 'Thorn Aegis: Skill 2 +5 percentage points Weaken each or Last Flare adds 5% caster maximum Health shield each.', effect: { family: 'ward', kind: 'shield-absorption', origin: 'rose', source: 'living-self-authored-shield' } },
  },
  'rose-duality': {
    passive: 'While Crinso is alive, Burn from his abilities grants one Rose Duality charge when it deals damage, at most once per enemy phase (maximum 3). The charges are not Burn and are separate from the Ember Seals granted by the Cinder Testament Conduit.',
    skill1: 'Spends all Rose Duality for +8% outgoing damage each (maximum +24%); one spend for the whole activation.',
    ultimate: 'Spends all Rose Duality for +12% outgoing damage each (maximum +36%); one spend for the whole activation.',
    resource: { label: 'Rose Duality', key: 'duality', summary: 'Charges: 0-3. Gain: +1 from own ability Burn damage, once per enemy phase while alive. Separate from Conduit charges. Consumption: all charges per listed ability. No standalone effect.', detail: 'Rose Duality: Skill 1 +8% outgoing damage each or Last Flare +12% each.', effect: { family: 'burn', kind: 'burn', origin: 'rose', source: 'living-self-authored-burn' } },
  },
};
