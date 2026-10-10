import { sharedNativeEffects, type ElementalEffectTag } from './elemental-effects';

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
  resource?: { label: string; key: KitPilotResourceKey; detail: string; effect: ElementalEffectTag };
}> = {
  ember: {
    passive: 'Your effective authored Burn damage grants one Infernic Embers stack per enemy phase, maximum 3; the living source must be you.',
    skill2: 'Consumes all Infernic Embers for +8% outgoing damage each (maximum +24%); one spend for the whole activation.',
    ultimate: 'Consumes all Infernic Embers for +12% outgoing damage each (maximum +36%); one spend for the whole activation.',
    resource: { label: 'Infernic Embers', key: 'ember', detail: 'Infernic Embers: Skill2 +8% outgoing damage each or Last Flare +12% each.', effect: sharedNativeEffects.ember },
  },
  ward: {
    passive: 'Direct enemy damage actually absorbed by your authored shields grants one Oceanic Protection per enemy phase, maximum 3; the living source must be you.',
    skill1: 'Consumes all Oceanic Protection for +5 percentage points Weaken per stack (maximum +15; total reduction capped at 60%).',
    ultimate: "Consumes all Oceanic Protection to add a shield worth 5% of your maximum Health per stack (maximum 15%) to the authored team shield; refresh, never additive with existing shields.",
    resource: { label: 'Oceanic Protection', key: 'ward', detail: 'Oceanic Protection: Skill1 +5 percentage points Weaken each or Last Flare adds 5% caster maximum Health shield each.', effect: sharedNativeEffects.ward },
  },
  bloom: {
    passive: 'Your effective authored healing grants one Botanic Renewal per round, maximum 3; only living sources and actual healing count.',
    resource: { label: 'Botanic Renewal', key: 'bloom', detail: 'Botanic Renewal is earned by effective authored healing, once per round, maximum 3.', effect: sharedNativeEffects.bloom },
  },
  tempest: {
    passive: 'An effective critical Normal Attack or ordinary skill grants one Atmospheric Charge per activation, maximum 3; existing critical rolls are used, and Last Flare grants none.',
    resource: { label: 'Atmospheric Charge', key: 'tempest', detail: 'Atmospheric Charge: the authored ordinary skill +8% outgoing damage each or Last Flare +12% each.', effect: sharedNativeEffects.tempest },
  },
  'rose-grace': {
    passive: 'Effective Rosetta-authored healing, including her passive, grants one Rose Grace per round, maximum 3; overhealing, Conduit healing and dead sources grant none.',
    skill1: 'Consumes all Rose Grace for +5 percentage points Weaken each (maximum +15; combined reduction capped at 60%).',
    ultimate: 'Consumes all Rose Grace for +10% outgoing damage each (maximum +30%); one spend for the whole activation.',
    resource: { label: 'Rose Grace', key: 'roseGrace', detail: 'Rose Grace: Skill1 +5 percentage points Weaken each or Last Flare +10% outgoing damage each.', effect: { family: 'bloom', kind: 'healing', origin: 'rose', source: 'living-self-authored-healing' } },
  },
  'thorn-aegis': {
    passive: 'Direct enemy damage actually absorbed by Thornia-authored team shields grants one Thorn Aegis per enemy phase across recipients, maximum 3; the shield source must be living.',
    skill2: 'Consumes all Thorn Aegis for +5 percentage points Weaken each (maximum +15; combined reduction capped at 60%).',
    ultimate: 'Consumes all Thorn Aegis to add 5% caster effective maximum Health shield each (maximum 15%) before authored shield potency and refresh; never stacks with existing shields.',
    resource: { label: 'Thorn Aegis', key: 'thornAegis', detail: 'Thorn Aegis: Skill2 +5 percentage points Weaken each or Last Flare adds 5% caster maximum Health shield each.', effect: { family: 'ward', kind: 'shield-absorption', origin: 'rose', source: 'living-self-authored-shield' } },
  },
  'rose-duality': {
    passive: 'Effective damage from Crinso-authored Burn grants one Rose Duality per enemy phase, maximum 3; the living source must be Crinso. Independent of Conduit Ember Seals.',
    skill1: 'Consumes all Rose Duality for +8% outgoing damage each (maximum +24%); one spend for the whole activation.',
    ultimate: 'Consumes all Rose Duality for +12% outgoing damage each (maximum +36%); one spend for the whole activation.',
    resource: { label: 'Rose Duality', key: 'duality', detail: 'Rose Duality: Skill1 +8% outgoing damage each or Last Flare +12% each.', effect: { family: 'burn', kind: 'burn', origin: 'rose', source: 'living-self-authored-burn' } },
  },
};
