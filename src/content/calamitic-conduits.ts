import { redesignValue } from './conduit-redesign';
import { phaseZeroStatsReady } from './phase-zero-stats';
import { phaseZeroUpgradedAbility } from './phase-zero-conduit-upgrades';

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
  { id: 'calamitic-bulwark-of-the-last-horizon', name: 'Bulwark of the Last Horizon', art: null,
    lore: 'Rise forged a black-and-white horizon wall around a crimson pressure core, reinforcing its bearer and the shields raised in its defense.' },
  { id: 'calamitic-reliquary-of-unending-mercy', name: 'Reliquary of Unending Mercy', art: null,
    lore: 'Rise built a white relief chamber carrying crimson channels through its healing and warding mechanisms, directing more power into restorative skills.' },
  { id: 'calamitic-aegis-engine-of-severed-fate', name: 'Aegis-Engine of Severed Fate', art: null,
    lore: 'Rise forged a crimson axle to drive an armored shield engine, preserving the bearer’s barriers while feeding power into its skills.' },
  { id: 'calamitic-monolith-of-the-unmoved-star', name: 'Monolith of the Unmoved Star', art: null,
    lore: 'Rise set a star-shaped mass of dark metal inside a white brace, bracing its bearer against force and reducing skill costs.' },
  { id: 'calamitic-heartforge-of-the-sunless-dawn', name: 'Heartforge of the Sunless Dawn', art: null,
    lore: 'Rise sealed a crimson furnace within a pearl-white housing, restoring its bearer’s strength and powering their skills.' },
  { id: 'calamitic-ruinmark-censer', name: 'Ruinmark Censer', art: null,
    lore: 'Rise built a black censer burning crimson behind a white lattice, marking weakened foes for greater harm from every attacker.' },
  { id: 'calamitic-choir-array-of-branded-stars', name: 'Choir-Array of Branded Stars', art: null,
    lore: 'Rise assembled a ring of white resonators around a crimson star, relaying each mark into a brief surge for the whole squad.' },
  { id: 'calamitic-throne-of-the-lone-apostate', name: 'Throne of the Lone Apostate', art: null,
    lore: 'Rise raised an empty black throne beneath a crimson-white canopy, concentrating its full power when its bearer stands alone.' },
  { id: 'calamitic-worldbreaker-cannonade', name: 'Worldbreaker Cannonade', art: null,
    lore: 'Rise designed a white cannon assembly around a crimson aperture, channeling its force into skills that strike every enemy.' },
] as const;

export type CalamiticConduitId = (typeof calamiticConduits)[number]['id'];
export function isCalamiticConduitId(id: unknown): id is CalamiticConduitId {
  return calamiticConduits.some(conduit => conduit.id === id);
}

const sectionFourCalamiticIds = new Set<CalamiticConduitId>([
  'calamitic-bulwark-of-the-last-horizon', 'calamitic-reliquary-of-unending-mercy',
  'calamitic-aegis-engine-of-severed-fate', 'calamitic-monolith-of-the-unmoved-star',
  'calamitic-heartforge-of-the-sunless-dawn', 'calamitic-ruinmark-censer',
  'calamitic-choir-array-of-branded-stars', 'calamitic-throne-of-the-lone-apostate',
  'calamitic-worldbreaker-cannonade',
]);

export function calamiticEffect(id: CalamiticConduitId, level = 0): string {
  const amount = (base: number, maximum: number) => Number(calamiticPower(level, base, maximum).toFixed(6));
  if (sectionFourCalamiticIds.has(id)) {
    const ability = phaseZeroUpgradedAbility(id, level);
    if (!ability) throw new Error(`Missing approved Calamitic ability: ${id}.`);
    return ability;
  }
  if (!phaseZeroStatsReady) {
    switch (id) {
      case 'calamitic-world-eater-orrery':
        return `Store ${amount(40, 80)}% of enemy Direct Damage to HP suffered by living squad members. [Normal Attack] releases the reserve as a [Bonus Strike] against the healthiest enemy.`;
      case 'calamitic-causality-funeral-engine':
        return `Defer ${amount(40, 60)}% of each enemy hit's Direct Damage to HP after [Shields]. The deferred damage is taken at the start of the next Enemy Turn, ignores [Shields] and can defeat you.`;
      case 'calamitic-horizon-cleaving-godpress':
        return `${amount(40, 60)}% of your Attack Actions' Direct Damage bypasses enemy [Shields]. While the target has a [Shield], your Attack Actions also gain +${amount(30, 60)}% Direct Damage.`;
      case 'calamitic-throne-borrowed-tomorrows':
        return `Your first [Normal Attack] each player turn does not spend your action and lets you take one additional [Skill 1] or [Skill 2] that turn. Taking it grants ${amount(10, 30)} [Elemental Gauge], but you cannot act on the next player turn.`;
      case 'calamitic-cathedral-final-equation':
        return `Use three different action types in succession to complete the [Equation]. Repeating a type restarts the sequence with that action. The third action deals ${amount(120, 240)}% of your Attack as [Bonus Strikes] split equally among enemies, then restarts the sequence.`;
    }
  }
  const ability = phaseZeroUpgradedAbility(id, level);
  if (!ability) throw new Error(`Missing approved Calamitic ability: ${id}.`);
  return ability;
}
