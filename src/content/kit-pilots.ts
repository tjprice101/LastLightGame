export type KitPilot = 'ember-seals' | 'shelter' | 'bloom' | 'verdict' | 'restoration';

export interface KitPilotState {
  emberSeals?: number;
  emberRound?: number;
  tideStacks?: number;
  tideRound?: number;
  blooms?: number;
  bloomRound?: number;
  restorativeCharges?: number;
  shelterSourceId?: string;
  shelterWard?: { sourceId: string; fraction: number };
  precision?: { points: number; throughRound: number };
  verdictMarks?: Record<string, { stacks: number; turns: number }>;
}

export const kitPilotDescriptions: Record<KitPilot, { passive: string; skill1?: string; skill2?: string; ultimate?: string }> = {
  'ember-seals': {
    passive: 'Own effective Burn damage grants one Ember Seal per enemy phase, maximum 3.',
    skill2: 'Consumes all personal Ember Seals for +8% outgoing damage each (maximum +24%); one spend for the whole activation.',
    ultimate: 'Consumes all personal Ember Seals for +12% outgoing damage each (maximum +36%); one spend for the whole activation.',
  },
  shelter: {
    passive: 'A shield granted by Tizu that survives an enemy phase primes one Shelter Charge: the next direct enemy hit deals 10% less damage. Refreshes; cannot stack. Direct enemy damage absorbed by her shields grants her one Tide stack per enemy phase, maximum 3; a living source is required.',
    skill1: 'Consumes all Tide stacks for +5 percentage points Weaken per stack (maximum +15; total reduction capped at 60%).',
    ultimate: "Consumes all Tide stacks to add shield worth 5% of this caster's maximum Health per stack (maximum 15%) to the authored team shield; refresh, never additive with existing shields.",
  },
  bloom: {
    passive: 'Effective healing by Flora grants one Bloom per round, maximum 3, including her passive; overhealing grants none.',
    skill1: 'Consumes all Blooms for +10% outgoing damage each (maximum +30%).',
    ultimate: 'Consumes all Blooms for +15% authored healing each (maximum +45%); spent before healing, once for the whole activation.',
  },
  verdict: {
    passive: 'Gleamseal adds one owner-specific Verdict Mark to a surviving target, maximum 2, lasting two enemy phases (refresh).',
    skill1: 'Adds one Verdict Mark to a surviving target.',
    skill2: 'Spends own marks across living targets; each mark grants +5 percentage points team Critical Rate, maximum +10, through the next player turn. Refreshes; does not stack.',
  },
  restoration: {
    passive: 'Effective healing of another living ally grants one Restorative Charge per activation, maximum 3; overhealing and self-healing do not count.',
    ultimate: "Spends all Restorative Charges to give living allies a shield worth 5% of this caster's maximum Health per charge, maximum 15% (refresh; cannot stack).",
  },
};
