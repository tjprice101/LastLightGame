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
      return `Store ${amount(40, 80)}% of enemy Direct Damage to HP suffered by living squad members. [Normal Attack] releases the reserve as a [Bonus Strike] against the healthiest enemy.`;
    case 'calamitic-causality-funeral-engine':
      return `Defer ${amount(40, 60)}% of each enemy hit's Direct Damage to HP after [Shields]. The deferred damage is taken at the start of the next Enemy Turn, ignores [Shields] and can defeat you.`;
    case 'calamitic-horizon-cleaving-godpress':
      return `${amount(40, 60)}% of your Attack Actions' Direct Damage bypasses enemy [Shields]. While the target has a [Shield], your Attack Actions also gain +${amount(30, 60)}% Direct Damage.`;
    case 'calamitic-throne-borrowed-tomorrows':
      return `Your first [Normal Attack] each player turn does not spend your action and lets you take one additional [Skill 1] or [Skill 2] that turn. Taking it grants ${amount(10, 30)} [Shatter Gauge], but you cannot act on the next player turn.`;
    case 'calamitic-cathedral-final-equation':
      return `Use three different action types in succession to complete the [Equation]. Repeating a type restarts the sequence with that action. The third action deals ${amount(120, 240)}% of your Attack as [Bonus Strikes] split equally among enemies, then restarts the sequence.`;
  }
}
