type Facing = 'left' | 'right' | 'front';

const sourceFacing: Record<string, Facing> = {
  infernis: 'right', 'infernis-evo-2': 'right', 'infernis-evo-3': 'right',
  'infernis-evo-4': 'right', 'infernis-evo-5': 'front', 'infernis-evo-6': 'front',
  tizu: 'left', 'tizu-evo-2': 'right', 'tizu-evo-3': 'left',
  'tizu-evo-4': 'left', 'tizu-evo-5': 'left', 'tizu-evo-6': 'left',
  flora: 'left', 'flora-evo-2': 'left', 'flora-evo-3': 'front',
  'flora-evo-4': 'right', 'flora-evo-5': 'right', 'flora-evo-6': 'front',
  goblin: 'left', imp: 'right', 'rock-golem': 'left',
  ashling: 'right', 'coalcap-kobold': 'left', 'emberhorn-faun': 'right',
  'furnace-salamander': 'left', 'cinderhide-cyclops': 'left', 'obsidian-gargoyle': 'left',
  'brasshorn-minotaur': 'right', 'pyrewing-harpy': 'left', 'magma-wyrm-knight': 'front',
  'last-furnace-ifrit': 'front',
  'pebblefin-sprig': 'left', 'shellcap-kappa': 'right', 'brineclaw-sentinel': 'left',
  'coralcrest-nereid': 'left', 'glasswake-kelpie': 'left', 'abyssbell-oracle': 'front',
  'pearlscale-leviathan': 'left', 'sovereign-of-the-endless-tide': 'front',
  budling: 'right', 'mosscap-brownie': 'front', 'thornshell-beetle': 'left',
  'petalhorn-satyr': 'left', 'orchid-mantis': 'left', 'moonbloom-dryad': 'front',
  'verdant-antler-regent': 'left', 'empress-of-the-thousand-blooms': 'front',
  hushbud: 'right', 'bellcap-keeper': 'front', 'lotusback-tortoise': 'left',
  'porcelain-crane': 'front', 'concord-lion': 'left', 'stillbell-oracle': 'front',
  'harmonywing-kirin': 'front', 'sovereign-of-the-unbroken-accord': 'front',
  sparkpip: 'right', 'coppercap-gremlin': 'left', 'coilback-scarab': 'front',
  'stormhorn-faun': 'left', 'thunderclaw-raiju': 'left', 'tempestwing-roc': 'left',
  'crowncoil-kirin': 'left', 'sovereign-of-the-living-storm': 'front',
  'heavens-dawnthorn-slime': 'right', 'heavens-scarlet-benediction': 'front',
  'heavens-gilded-reproach': 'front', 'heavens-thorns-first-light': 'left',
  'heavens-crimson-reckoning': 'left', 'heavens-dawn-without-mercy': 'right',
  'abyss-wraththorn-slime': 'front', 'abyss-starless-murmur': 'front',
  'abyss-ruins-awakening': 'left', 'abyss-hunger-beyond-veil': 'left',
  'abyss-worldfall-reverie': 'left', 'abyss-night-without-end': 'left',
};

export function unitFacing(art: string, side: 'ally' | 'enemy'): { facing: 'left' | 'right'; mirrored: boolean } {
  const source = sourceFacing[art];
  if (!source) throw new Error(`Unit facing metadata is missing: ${art}.`);
  const facing = side === 'ally' ? 'left' : 'right';
  return { facing, mirrored: source !== 'front' && source !== facing };
}

export function unitFacingAttributes(art: string, side: 'ally' | 'enemy'): string {
  const { facing, mirrored } = unitFacing(art, side);
  return `data-facing="${facing}" data-mirrored="${mirrored}"`;
}
