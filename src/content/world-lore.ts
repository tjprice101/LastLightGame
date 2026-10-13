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
  { title: 'Let and Infinity', text: 'Let was the first being in the world. A god-like creator, he bore Infinity: the power to transform and manipulate space, the world and anything around him with ease. As he shaped the world, an equal and opposite force stood beside him.' },
  { title: 'Rise and Nothingness', text: 'Rise was that rival: a god-like entity bearing Nothingness, the power to destroy and bind anything that exists. Neither opposite could simply ignore the other. Let and Rise learned to coexist, creating worlds together despite the tension between Infinity and Nothingness.' },
  { title: 'The broken coexistence', text: 'Over time, their anger grew. Arguments became fights, and their rivalry drew civilizations into wars. At last, Let and Rise split themselves among the worlds they had created. Their contest would be decided by their creations: whichever faction first finds its creator\'s soul will enable that creator to rule the world.' },
  { title: 'The Element-Bearers', text: 'Let created the human Element-Bearers in his image. He named their six elements to represent human emotions and experiences: Infernic is Wrath, Oceanic is Sadness, Atmospheric is Calm, Botanic is Joy and Life, Tranquilitic is Peace, and Chaotic is Death and Destruction. These powers are their inheritance, not a command to share one personality.' },
  { title: 'The Elemental-Devourers', text: 'Rise created the Elemental-Devourers in her image. Defying convention, she broke its boundary and stole the same six elements used by Let\'s creations. An element therefore reveals a power, not a faction: an Elemental-Devourer can wield Peace just as an Element-Bearer can wield Death and Destruction.' },
  { title: 'The search begins', text: 'Both factions now travel the worlds in search of their creator\'s soul. This is the beginning of their history, not its ending. Your journey takes place within that unfinished search; no creator has yet been declared the victor.' },
] as const;

export const machineOrigin = 'The Machines are destroyed prototypes from the time Let and Rise worked together. Their damaged mechanisms still awaken amid the ruins of that collaboration; they are not Elemental-Devourers created by Rise.';
export const conduitOrigin = 'A Conduit is a surviving mechanism from the age of Let and Rise\'s collaboration, salvaged and restored for the present search. Elemental Light is the name used for the elemental energy within these devices, not a third creator or a recovered creator\'s soul.';
export const masterOrigin = 'Master Conduits are restored mechanisms from Let and Rise\'s shared prototype work, attuned to a named Element-Bearer. Their power supports that bearer\'s search for Let\'s soul; owning one does not recover the soul or decide the contest.';
export const storyPurpose = 'Restore the six regional beacons to reopen paths in the search for Let\'s soul. Rise\'s Elemental-Devourers follow the same elements in their search for hers. Restoring a beacon opens a route; it does not find a creator\'s soul or settle their contest.';
export const trainingLore = 'Practice against Rise\'s Elemental-Devourers before venturing farther in the search for Let\'s soul.';
export const warLore = 'These are trials against fellow human Element-Bearers, not encounters with Rise\'s Elemental-Devourers. Their mastery tests those seeking Let\'s soul; a successful recruitment joins your squad without ending that search.';
export const summonLore = 'Summoning brings fellow Element-Bearers into your squad as the search for Let\'s soul continues. It does not summon Let, Rise or either creator\'s soul.';

export const devourerHabitats = {
  heavens: 'Dawnthorn Slimes search the high sanctuaries for Rise\'s soul, wielding the Peace stolen from Let\'s creations.',
  abyss: 'Wraththorn Slimes search the deep ruins for Rise\'s soul, wielding the stolen element of Death and Destruction.',
  treasury: 'Crownfall\'s crowned slimes search the old treasury for Rise\'s soul, carrying stolen Peace beneath their regal gemstone shells.',
  sanctuary: 'Rosethorn\'s wisps search its quiet sanctuaries for Rise\'s soul. Their stolen Peace does not make them creations of Let.',
  roses: 'Roselius searches the rose gardens for Rise\'s soul, wielding stolen Peace among crimson petals and golden thorns.',
} as const satisfies Record<Exclude<InfusionModeId, 'machines'>, string>;
