const moonCharacterDesigns = [
  {
    id: 'maerion', stars: 6, name: 'Maerion', role: 'Healer & Support', art: 'maerion',
    title: 'The Ferry Remembers Every Name', element: 'Oceanic', elementId: 'oceanic', weapon: 'Crescent Polearm', color: '#cbd2d8',
    description: 'An Oceanic Element-Bearer of the Witnesses of the Unfinished Night, carrying a surgeon’s coat, ferry tokens and a crescent polearm.',
    lore: { origin: 'The Witnesses of the Unfinished Night', story: 'Maerion keeps the names on ruined ferry tokens open in his ledger, tending those who remain without deciding what became of the missing.', vow: 'No name is closed by an empty crossing.', awakening: 'The harbor keeps its passage open.' },
    vow: 'No name is closed by an empty crossing.',
    awakening: 'The harbor keeps its passage open.',
  },
  {
    id: 'caevren', stars: 6, name: 'Caevren', role: 'Tank', art: 'caevren',
    title: 'The Meridian Holds Through Night', element: 'Atmospheric', elementId: 'atmospheric', weapon: 'Counterweight Flail', color: '#b8c2ca',
    description: 'An Atmospheric Element-Bearer of the Witnesses of the Unfinished Night, bracing an observatory harness around a caged counterweight.',
    lore: { origin: 'The Witnesses of the Unfinished Night', story: 'Caevren held a sky-bridge open during an evacuation and stayed behind to recover the records needed to search for the missing.', vow: 'I can hold the weight until you pass.', awakening: 'The observatory still measures the way home.' },
    vow: 'I can hold the weight until you pass.',
    awakening: 'The observatory still measures the way home.',
  },
  {
    id: 'vespera', stars: 6, name: 'Vespera', role: 'Support', art: 'vespera',
    title: 'One Beacon Remains Beyond the Wall', element: 'Infernic', elementId: 'infernic', weapon: 'Signal Standard', color: '#e3e1dc',
    description: 'An Infernic Element-Bearer of the Witnesses of the Unfinished Night, raising a silver-white signal standard in the dark.',
    lore: { origin: 'The Witnesses of the Unfinished Night', story: 'Vespera kept an evacuation signal burning against orders to abandon a district, and now refuses to extinguish the final beacon while anyone remains beyond the walls.', vow: 'The last signal is still a promise.', awakening: 'White flame marks a path through the night.' },
    vow: 'The last signal is still a promise.',
    awakening: 'White flame marks a path through the night.',
  },
  {
    id: 'ilyss', stars: 6, name: 'Ilyss', role: 'Healer & Support', art: 'ilyss',
    title: 'What Need Not Remain', element: 'Chaotic', elementId: 'chaotic', weapon: 'Connected Severance Shears', color: '#bcbfc4',
    description: 'A Chaotic Element-Bearer of the Witnesses of the Unfinished Night, restoring the living with connected black-silver severance shears.',
    lore: { origin: 'The Witnesses of the Unfinished Night', story: 'Ilyss repairs memorials but will not promise resurrection; she removes what harms the living and seeks answers without claiming dominion over death.', vow: 'I will not call an ending a cure.', awakening: 'The living thread is cut free.' },
    vow: 'I will not promise what I cannot return.',
    awakening: 'The living still have choices to make.',
  },
  {
    id: 'asteriel', stars: 6, name: 'Asteriel', role: 'Support', art: 'asteriel',
    title: 'Every Orbit Carries a Future', element: 'Botanic', elementId: 'botanic', weapon: 'Seed Orrery', color: '#d8dadd',
    description: 'A Botanic Element-Bearer of the Witnesses of the Unfinished Night, lending moonflower seeds from a silver seed-orrery.',
    lore: { origin: 'The Witnesses of the Unfinished Night', story: 'Asteriel distributed a sealed conservatory’s living collection during famine and accepted exile rather than hoard its seeds.', vow: 'A seed kept from the hungry is already lost.', awakening: 'Every orbit bears a future.' },
    vow: 'A future is worth more when it is shared.',
    awakening: 'A seed can leave its library and still take root.',
  },
  {
    id: 'serapha', stars: 6, name: 'Serapha', role: 'Healer & Support', art: 'serapha',
    title: 'A Sanctuary in the Open Interval', element: 'Tranquilitic', elementId: 'tranquilitic', weapon: 'Split-Oval Mercy Scepter', color: '#d1d2d3',
    description: 'A Tranquilitic Element-Bearer of the Witnesses of the Unfinished Night, opening a passage with an articulated silver mercy scepter.',
    lore: { origin: 'The Witnesses of the Unfinished Night', story: 'Serapha laid down a victor’s ceremonial blade after a lawful duel brought another household grief, and now escorts people through ceasefires she knows may fail.', vow: 'Mercy does not require surrender.', awakening: 'An interval can still save a life.' },
    vow: 'An interval can be enough to leave alive.',
    awakening: 'The passage stays open only while we protect it.',
  },
] as const;

const sunshadeCharacterDesigns = [
  {
    id: 'rhaziel', stars: 6, name: 'Rhaziel', role: 'Healer & Support', art: 'rhaziel',
    title: 'Every Repaired Join Is Remembered', element: 'Infernic', elementId: 'infernic', weapon: 'Forge Needle and Anvil Gauntlet', color: '#d9a64c',
    description: 'An Infernic Element-Bearer of the Keepers of the Borrowed Dawn, rebuilding armor with a forge needle and anvil gauntlet.',
    lore: { origin: 'The Keepers of the Borrowed Dawn', story: 'Rhaziel records every dent in the armor he repairs, after learning that rushed royal equipment had failed its wearers.', vow: 'Every fracture deserves a careful record.', awakening: 'The repaired join can hold again.' },
    vow: 'A repaired defense should remember who relied on it.',
    awakening: 'No one should be left without a way back.',
  },
  {
    id: 'oryn', stars: 6, name: 'Oryn', role: 'Support', art: 'oryn',
    title: 'No Victory Requires This', element: 'Tranquilitic', elementId: 'tranquilitic', weapon: 'Square-Seal Polehammer', color: '#dfb957',
    description: 'A Tranquilitic Element-Bearer of the Keepers of the Borrowed Dawn, carrying an unstruck square seal above his polehammer.',
    lore: { origin: 'The Keepers of the Borrowed Dawn', story: 'Oryn became a mediator before carrying out an unjust sentence, seeking agreements from which both sides can leave alive.', vow: 'A just agreement leaves an exit open.', awakening: 'No victory requires this.' },
    vow: 'A way out is also a kind of justice.',
    awakening: 'The seal remains unstruck.',
  },
  {
    id: 'thessara', stars: 6, name: 'Thessara', role: 'Support', art: 'thessara',
    title: 'No Village Is Omitted', element: 'Oceanic', elementId: 'oceanic', weapon: 'Paired-Vessel Glaive', color: '#8bb6ce',
    description: 'An Oceanic Element-Bearer of the Keepers of the Borrowed Dawn, routing steel-blue water through the twin vessels of a glaive.',
    lore: { origin: 'The Keepers of the Borrowed Dawn', story: 'Thessara diverted a city’s ceremonial water procession to refugees, then followed the emptied channels to find the villages the court omitted.', vow: 'A promise is measured by who receives it.', awakening: 'No village is omitted.' },
    vow: 'A promise is measured in water delivered.',
    awakening: 'The next channel reaches those left out.',
  },
  {
    id: 'elaris', stars: 6, name: 'Elaris', role: 'Attacker', art: 'elaris',
    title: 'A Grove Beyond the Burning Walls', element: 'Botanic', elementId: 'botanic', weapon: 'Branching Javelin', color: '#c5ad62',
    description: 'A Botanic Element-Bearer of the Keepers of the Borrowed Dawn, opening a firebreak with a branching javelin.',
    lore: { origin: 'The Keepers of the Borrowed Dawn', story: 'Elaris replanted a burned royal preserve as a public orchard and now cuts firebreaks to defend the roads between isolated communities.', vow: 'The orchard belongs to everyone who needs shade.', awakening: 'A grove opens beyond the walls.' },
    vow: 'The next grove deserves a way through.',
    awakening: 'A new route branches beyond the flames.',
  },
  {
    id: 'veyr', stars: 6, name: 'Veyr', role: 'Attacker', art: 'veyr',
    title: 'Only What Must Fall', element: 'Chaotic', elementId: 'chaotic', weapon: 'Articulated Demolition Lance', color: '#ca9b5b',
    description: 'A Chaotic Element-Bearer of the Keepers of the Borrowed Dawn, dismantling only the siege structures that threaten a refuge.',
    lore: { origin: 'The Keepers of the Borrowed Dawn', story: 'Veyr brought down an occupied war foundry without collapsing the refuge beneath it, and counted the workers rescued rather than the machines destroyed.', vow: 'I know exactly what must remain standing.', awakening: 'The refuge holds beyond the fracture.' },
    vow: 'I know exactly what must remain standing.',
    awakening: 'The refuge holds beyond the fracture.',
  },
  {
    id: 'aureth', stars: 6, name: 'Aureth', role: 'Tank', art: 'aureth',
    title: 'Hold the Burning Sky Open', element: 'Atmospheric', elementId: 'atmospheric', weapon: 'Sunshade Shield and Command Blade', color: '#d3b970',
    description: 'An Atmospheric Element-Bearer of the Keepers of the Borrowed Dawn, carrying a broken canopy’s keystone along a rescue corridor.',
    lore: { origin: 'The Keepers of the Borrowed Dawn', story: 'Aureth organized rival watchtowers into a rescue corridor when the solar canopy broke, carrying its keystone to protect settlements from the next ash storm.', vow: 'No one walks beneath that sky alone.', awakening: 'The corridor reaches the next settlement.' },
    vow: 'No one walks beneath that sky alone.',
    awakening: 'The corridor reaches the next settlement.',
  },
] as const;

const elementalWorldLore = {
  oceanic: 'Oceanic Sadness does not let an absent soul become a settled answer.',
  atmospheric: 'Atmospheric Calm keeps a passage open without pretending the search is over.',
  infernic: 'Infernic Wrath is directed at abandonment, not at those still seeking shelter.',
  chaotic: 'Chaotic Death and Destruction are limits to reckon with, not promises of dominion.',
  botanic: 'Botanic Joy and Life belong to the displaced as surely as to a guarded garden.',
  tranquilitic: 'Tranquilitic Peace leaves room for an exit without declaring the contest won.',
} as const;

function worldCharacter<T extends typeof moonCharacterDesigns[number] | typeof sunshadeCharacterDesigns[number]>(character: T) {
  return {
    ...character,
    description: character.description.replace('Element-Bearer of', 'Element-Bearer in Let’s image, of'),
    lore: {
      ...character.lore,
      story: `${character.lore.story} ${elementalWorldLore[character.elementId]} Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers. Their missing souls remain unreunited, and no faction has found a victor in that search.`,
    },
  };
}

export const moonCharacters = moonCharacterDesigns.map(worldCharacter);
export const sunshadeCharacters = sunshadeCharacterDesigns.map(worldCharacter);
