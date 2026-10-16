import { redesignValue } from './conduit-redesign';

export const calamiticTokenPrice = 100;
export const calamiticLockMessage = 'Rise deems you UNWORTHY of her most prized creations.';

export function calamiticStoreUnlocked(account: { calamityClears?: Partial<Record<string, number>> } | null): boolean {
  return !!account && Object.values(account.calamityClears ?? {}).some(tier => tier !== undefined && tier >= 1);
}

export const calamiticPower = redesignValue;

export const calamiticConduits = [
  { id: 'calamitic-world-eater-orrery', name: "World-Eater's Orrery",
    lore: 'Rise suspended an annihilation furnace inside counter-rotating planetary rings. Every wound suffered by its bearers winds the machinery toward a single, deliberate ending.' },
  { id: 'calamitic-causality-funeral-engine', name: 'Causality Funeral Engine',
    lore: 'Paired black-metal vaults bind the interval between impact and consequence. Rise built them to postpone destruction until her chosen moment, never to forgive it.' },
  { id: 'calamitic-horizon-cleaving-godpress', name: 'Horizon-Cleaving Godpress',
    lore: 'Opposing white-metal jaws close around an impossible horizon. Rise designed its crimson rails to press through barriers without mistaking protection for invulnerability.' },
  { id: 'calamitic-throne-borrowed-tomorrows', name: 'Throne of Borrowed Tomorrows',
    lore: 'An empty command throne controls a canopy of interlocking timeworks. Rise could order its machinery to consume tomorrow before today had ended.' },
  { id: 'calamitic-cathedral-final-equation', name: 'Cathedral of the Final Equation',
    lore: 'Three monumental cipher-engines turn around a captive crimson aperture. Rise built their closing equation to erase whatever she had chosen, not to worship it.' },
] as const;

export type CalamiticConduitId = (typeof calamiticConduits)[number]['id'];
export function isCalamiticConduitId(id: unknown): id is CalamiticConduitId {
  return calamiticConduits.some(conduit => conduit.id === id);
}

export function calamiticEffect(id: CalamiticConduitId, level = 0): string {
  const amount = (base: number, maximum: number) => Number(calamiticPower(level, base, maximum).toFixed(6));
  switch (id) {
    case 'calamitic-world-eater-orrery':
      return `Store ${amount(40, 80)}% of actual direct enemy HP damage suffered by living squad members, up to ${amount(400, 800)}% of your Attack. Defense empties this reserve into one shield-first strike against the healthiest enemy, using normal Defense mitigation. Generated damage, shields and self-costs cannot fill it.`;
    case 'calamitic-causality-funeral-engine':
      return `Defer ${amount(40, 60)}% of direct enemy damage that would reach your HP after shields, up to ${amount(30, 50)}% of your maximum HP per enemy phase. Pay the exact debt at the start of the next enemy phase, before attacks. Debt bypasses shields and protection, can defeat you and cannot be deferred again. Routed damage is not deferred.`;
    case 'calamitic-horizon-cleaving-godpress':
      return `${amount(40, 60)}% of your native direct damage bypasses enemy shields. While the target has a shield, your native direct damage is also +${amount(30, 60)}%. The remaining damage spends shields normally; Burn and generated strikes are unchanged.`;
    case 'calamitic-throne-borrowed-tomorrows':
      return `Once every three player turns, Defense lets you choose one further non-Defense, non-Last-Flare action that turn. Taking it grants ${amount(10, 30)} Gauge after paying its normal cost, but you cannot act on the next player turn. No borrowed action means no lost turn. Recovery and unavailable skills remain enforced.`;
    case 'calamitic-cathedral-final-equation':
      return `Choose three different action types in succession to complete the Equation. Repeating a type restarts the sequence with that action. The third action releases ${amount(120, 240)}% of your Attack, split equally among living enemies as shield-first strikes using normal Defense mitigation, then clears the sequence. No extra critical rolls, Gauge or native effects.`;
  }
}
