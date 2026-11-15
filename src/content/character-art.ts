import { getStarter, starters, type StarterId } from './starters';
import { characterLevelCap } from './progression';

const finalEvolutionEpithets = {
  ember: 'Ignis Aeternus',
  tide: 'Mare Serenum',
  sprout: 'Vita Florens',
  rosetta: 'Pax Seraphine',
  thornia: 'Nox Imperatrix',
  crinso: 'Fatum Geminus',
  maerion: 'Aequor Memoria',
  caevren: 'Caelum Vigilis',
  vespera: 'Vespera Incensa',
  ilyss: 'Noctis Liberum',
  asteriel: 'Astra Virentis',
  serapha: 'Concordia Aeterna',
  rhaziel: 'Ferrum Ardens',
  oryn: 'Pax Concordis',
  thessara: 'Mare Perennis',
  elaris: 'Silva Aurea',
  veyr: 'Umbra Ferrata',
  aureth: 'Caelum Fulgent',
  atmoso: 'Aura Perennis',
  aurora: 'Lux Clementia',
  bliss: 'Pluma Serena',
  bruno: 'Saxum Vivens',
  disciple: 'Mens Solutus',
  elise: 'Fulmen Duplex',
  razor: 'Nox Custodia',
  nerithe: 'Aequor Oraculum',
  orvella: 'Fundamentum Vitae',
  vaelor: 'Tonitrus Quietus',
  caldrex: 'Ignis Vigilans',
  solenne: 'Silentium Sacrum',
  myrthen: 'Tempus Florens',
  neralis: 'Reditus Fidus',
  varkhel: 'Pons Invictus',
  seravelle: 'Signum Flammae',
  velmira: 'Vita Post Finem',
  ozriel: 'Murus Aeternus',
  ilvaris: 'Cantus Novus',
  kaelith: 'Fatum Ruptum',
} satisfies Record<StarterId, string>;

const titlesByStarter: Partial<Record<StarterId, readonly string[]>> = {};
for (const starter of starters) {
  titlesByStarter[starter.id] = [
    starter.name,
    starter.element,
    `${starter.element} Queen`,
    `${starter.element} Goddess`,
    `${starter.element} Legend`,
    finalEvolutionEpithets[starter.id],
  ];
}

export const evolutionTitles = titlesByStarter as Record<StarterId, readonly string[]>;

const artworkPending = new Set([
  'rhaziel', 'oryn', 'thessara', 'elaris', 'veyr', 'aureth',
]);

export function characterArt(id: StarterId, evolution = 1): { art: string; title: string; available: boolean } {
  characterLevelCap(evolution, id);
  const starter = getStarter(id);
  return {
    art: evolution === 1 ? starter.art : `${starter.art}-evo-${evolution}`,
    title: evolutionTitles[id][evolution - 1],
    available: !artworkPending.has(id),
  };
}

export function characterName(id: StarterId, evolution = 1, riseBlessed = false): string {
  const starter = getStarter(id);
  const title = evolution === 1 ? '' : `${characterArt(id, evolution).title} `;
  return `${title}${starter.name}${riseBlessed ? ', Rise-blessed' : ''}`;
}
