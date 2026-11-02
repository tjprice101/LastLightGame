import type { ElementId, InfusionModeId } from './activities';

export const elementEmotions = {
  infernic: 'Wrath',
  oceanic: 'Sadness',
  atmospheric: 'Calm',
  botanic: 'Joy and Life',
  tranquilitic: 'Peace',
  chaotic: 'Death and Destruction',
} as const satisfies Record<ElementId, string>;

export const worldHistory = [
  { title: 'Let and Infinity', text: 'Let was the first being in the world. He wielded Infinity, the power to transform and manipulate space and everything around him.' },
  { title: 'Rise and Nothingness', text: 'Rise wielded Nothingness, the power to destroy and bind anything that exists. She and Let learned to coexist and created worlds together.' },
  { title: 'The broken coexistence', text: 'Their rivalry drew civilizations into wars. Let and Rise then split themselves among their worlds. The first faction to find its creator\'s soul would allow that creator to rule.' },
  { title: 'The Element-Bearers', text: 'Let created the Element-Bearers in his image. Their elements represent emotions and experiences: Infernic is Wrath, Oceanic is Sadness, Atmospheric is Calm, Botanic is Joy and Life, Tranquilitic is Peace, and Chaotic is Death and Destruction.' },
  { title: 'The Elemental-Devourers', text: 'Rise created the Elemental-Devourers in her image and stole the same six elements. Both factions can use every element.' },
  { title: 'The search begins', text: 'The Element-Bearers seek Let\'s soul; the Elemental-Devourers seek Rise\'s. Neither soul has been found, and no creator has yet been declared the victor.' },
] as const;

export const machineOrigin = 'The Machines are damaged prototypes built by Let and Rise. Their mechanisms still awaken among the ruins.';
export const conduitOrigin = 'Conduits are mechanisms salvaged from the time Let and Rise created worlds together. They use elemental energy called Elemental Light.';
export const masterOrigin = 'Master Conduits come from Let and Rise\'s shared prototype work. Each is designed for a named Element-Bearer.';
export const storyPurpose = 'Restore six regional beacons to reopen the roads and continue the search for Let\'s soul.';
export const trainingLore = 'Fight endless waves of Elemental-Devourers to practice with your saved squad and earn Prismatica.';
export const warLore = 'Challenge fellow Element-Bearers for a chance to recruit them.';
export const summonLore = 'Draw from a banner for Element-Bearers or material bundles. Check Rates & Information for its rewards and pity rules.';

export const devourerHabitats = {
  heavens: 'Battle Dawnthorn Slimes for Heaven materials and a chance to capture them.',
  abyss: 'Battle Wraththorn Slimes for Abyss materials and a chance to capture them.',
  treasury: 'Earn Prismatica by defeating Crownfall Slimes. Captured copies can also be sold for Prismatica.',
  sanctuary: 'Earn Prismatica and Null-Prismatica by defeating Rosethorn wisps. Captured copies can be sold for both currencies.',
  roses: 'Defeat Roselius for Rosethorn materials used by Rosetta, Thornia and Crinso.',
} as const satisfies Record<Exclude<InfusionModeId, 'machines'>, string>;
