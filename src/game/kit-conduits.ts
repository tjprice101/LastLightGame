// Historical snapshot shape retained only for compatibility restarts.
export type ConduitMechanic = 'burn-focus' | 'shield-heal' | 'defense-ward' | 'renewal' | 'critical-gauge' |
  'normal-momentum' | 'defeat-gauge' | 'weaken-pierce' | 'defense-heal' | 'ultimate-ward' |
  'ember-seals' | 'undertide-cooldown' | 'faultkeeper-ward' | 'verdant-covenant' | 'stormstep' |
  'skythread' | 'dawn-witness' | 'nightglass' | 'stillhour' | 'paradox' | 'kit-interaction';
export interface OmnicMemory {
  bank?: number;
  bankRound?: number;
  usedRound?: number;
}
