import { calamityActivities } from '../content/calamity';
import { fighters } from '../content/combat';
import { conduits } from '../content/conduits';
import { currencyModes, elementalMaterials, elements, infusionModes } from '../content/activities';
import { masterConduits } from '../content/master-conduits';
import { starters } from '../content/starters';
import { storyRegions } from '../content/story';
import { elementalEffectFamilies } from '../content/elemental-effects';
import { phaseZeroStatLabels } from '../content/phase-zero-stats';
import { conduitGlossary } from '../content/conduit-glossary';
import { elementLabel } from './element-label';

/** Shortened names in prose resolve to the full in-game name inside the brackets. */
const aliases: Record<string, string> = {
  Heaven: 'Soar to Heaven', Abyss: 'Delve into the Abyss',
  Treasury: 'Crownfall Treasury', 'Crimson Roses': 'Passion of Crimson Roses',
  'Normal Attacks': 'Normal Attack', Gauge: 'Elemental Gauge', 'Cosmic Grand Master Chests': 'Cosmic Grand Master Chest',
};

const fixedNames = ['Roselius', 'Prismatica', 'Null-Prismatica', 'Broken Mechanical Components', 'Cosmic Grand Master Chest',
  'Calamitic Tokens', 'Story', 'Training', 'Calamity', 'Elemental War', 'Awaken the Machines', 'Passion of Crimson Roses',
  'Elemental Gauge', 'Normal Attack', 'Skill 1', 'Skill 2', 'Last Flare', 'Burn', 'Weaken',
  ...Object.values(phaseZeroStatLabels), ...conduitGlossary.map(entry => entry.term),
  'HP', 'Maximum HP', 'Elemental Damage', 'Elemental Crit', 'Critical Hit', 'Critical Hits',
  'All-enemy', 'Single-target', 'Skill-created', 'Skill', 'Skills', 'Shields', 'Shielded',
  'Shielding', 'Healing', 'Overhealing', 'Weakened', 'Attack Actions', 'Bonus Strikes',
  'Player Turn', 'Player Turns', 'Enemy Turns', 'Cooldown', 'Cooldowns', 'Recovery',
  'Accord', 'Seed', 'Seeds', 'Empowered Seed', 'Empowered Seeds', 'Gust', 'Gusts', 'Cyclone',
  'Foundation', 'Combo', 'Wounds', 'Cover', 'Seal', 'Seals', 'Sealed', 'Shuriken', 'Survey',
  'Quarry', 'Instruction', 'Instructions', 'Strike', 'Shelter', 'Resolve',
  'Opening', 'Closing', 'Tune', 'Crescendo', 'Rise', 'Trap', 'Traps', 'Thorn Trap', 'Empowered Thorn Trap'];

let matcher: { pattern: RegExp; names: Map<string, string>; elementIds: Map<string, (typeof elements)[number]['id']> } | null = null;

function referenceMatcher(): { pattern: RegExp; names: Map<string, string>; elementIds: Map<string, (typeof elements)[number]['id']> } {
  if (matcher) return matcher;
  const names = new Map<string, string>(Object.entries(aliases).map(([name, full]) => [name.toLowerCase(), full]));
  const add = (name: string | undefined) => { if (name && !names.has(name.toLowerCase())) names.set(name.toLowerCase(), name); };
  fixedNames.forEach(add);
  Object.values(elementalEffectFamilies).forEach(family => add(family.label));
  starters.forEach(starter => add(starter.name));
  for (const fighter of Object.values(fighters)) {
    add(fighter.passive?.name);
    for (const ability of Object.values(fighter.abilities)) add(ability.name);
  }
  conduits.forEach(conduit => add(conduit.name));
  masterConduits.forEach(master => add(master.name));
  calamityActivities.forEach(activity => { add(activity.name); add(activity.boss); });
  elements.forEach(element => add(element.dungeon));
  infusionModes.forEach(mode => add(mode.name));
  currencyModes.forEach(mode => add(mode.name));
  elementalMaterials.forEach(material => add(material.name));
  storyRegions.forEach(region => add(region.name));
  const elementIds = new Map(elements.map(element => [element.name, element.id] as const));
  elementIds.forEach((_id, name) => add(name));
  const escaped = [...names.keys()].sort((a, b) => b.length - a.length).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  matcher = { pattern: new RegExp(`(?<![\\w\\[-])(${escaped.join('|')})(?![\\w\\]-])`, 'gi'), names, elementIds };
  return matcher;
}

const skippedTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'strong', 'b', 'dt', 'dd', 'label', 'summary', 'span',
  'th', 'option', 'select', 'nav', 'small', 'figcaption', 'meter', 'script', 'style']);

/**
 * Formats named game references in description/information prose as [Full Name]; element names also
 * gain their medal. Only text between tags changes; headings, labels, buttons, values and attributes stay plain.
 */
export function bracketReferences(html: string, elementMedals = true): string {
  const { pattern, names, elementIds } = referenceMatcher();
  const skipped: string[] = [];
  let depth = 0;
  let elementLabelDepth = 0;
  return html.replace(/(<[^>]*>)|([^<]+)/g, (_whole, tag: string | undefined, text: string | undefined) => {
    if (tag) {
      const name = /^<\/?([a-zA-Z0-9]+)/.exec(tag)?.[1]?.toLowerCase();
      if (name === 'span' && !tag.startsWith('</') && !skipped.length && /class="element-label\b/.test(tag)) elementLabelDepth = 1;
      if (name && skippedTags.has(name) && !tag.endsWith('/>')) {
        if (tag.startsWith('</')) {
          if (name === 'span' && skipped.length === 1) elementLabelDepth = 0;
          const index = skipped.lastIndexOf(name); if (index >= 0) skipped.splice(index, 1);
        }
        else skipped.push(name);
      }
      return tag;
    }
    // Existing element medals in prose read as [Element] too.
    if (elementLabelDepth && skipped.length === 1 && text && elementIds.has(text.trim())) return text.replace(text.trim(), `[${text.trim()}]`);
    if (skipped.length || !text) return text ?? '';
    let last = 0;
    let output = '';
    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      const before = text.slice(last, index);
      for (const character of before) depth += character === '[' ? 1 : character === ']' ? -1 : 0;
      const fullName = names.get(match[0].toLowerCase()) ?? match[0];
      const element = elementIds.get(fullName);
      const label = fullName.toLowerCase() === match[0].toLowerCase() ? match[0] : fullName;
      output += before + (depth > 0 ? match[0] : element && elementMedals ? elementLabel(element, true) : `[${label}]`);
      last = index + match[0].length;
    }
    const rest = text.slice(last);
    for (const character of rest) depth += character === '[' ? 1 : character === ']' ? -1 : 0;
    return output + rest;
  });
}
