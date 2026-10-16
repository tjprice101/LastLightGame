import { calamityActivities } from '../content/calamity';
import { fighters } from '../content/combat';
import { conduits } from '../content/conduits';
import { currencyModes, elementalMaterials, elements, infusionModes } from '../content/activities';
import { masterConduits } from '../content/master-conduits';
import { starters } from '../content/starters';
import { storyRegions } from '../content/story';

/** Shortened names in prose resolve to the full in-game name inside the brackets. */
const aliases: Record<string, string> = {
  Heaven: 'Soar to Heaven', Abyss: 'Delve into the Abyss',
  Treasury: 'Crownfall Treasury', 'Crimson Roses': 'Passion of Crimson Roses',
  'Normal Attacks': 'Normal Attack', 'Cosmic Grand Master Chests': 'Cosmic Grand Master Chest',
};

const fixedNames = ['Roselius', 'Prismatica', 'Null-Prismatica', 'Broken Mechanical Components', 'Cosmic Grand Master Chest',
  'Calamitic Tokens', 'Story', 'Training', 'Calamity', 'Elemental War', 'Awaken the Machines', 'Passion of Crimson Roses',
  'Normal Attack', 'Skill 1', 'Skill 2', 'Last Flare', 'Burn', 'Weaken'];

let matcher: { pattern: RegExp; names: Map<string, string> } | null = null;

function referenceMatcher(): { pattern: RegExp; names: Map<string, string> } {
  if (matcher) return matcher;
  const names = new Map<string, string>(Object.entries(aliases));
  const add = (name: string | undefined) => { if (name && !names.has(name)) names.set(name, name); };
  fixedNames.forEach(add);
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
  const escaped = [...names.keys()].sort((a, b) => b.length - a.length).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  matcher = { pattern: new RegExp(`(?<![\\w\\[-])(${escaped.join('|')})(?![\\w\\]-])`, 'g'), names };
  return matcher;
}

const skippedTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'strong', 'b', 'dt', 'dd', 'label', 'summary', 'span',
  'th', 'option', 'select', 'nav', 'small', 'figcaption', 'meter', 'script', 'style']);

/**
 * Formats named game references in description/information prose as [Full Name].
 * Only text between tags changes; headings, labels, buttons, values and attributes are left untouched.
 */
export function bracketReferences(html: string): string {
  const { pattern, names } = referenceMatcher();
  const skipped: string[] = [];
  let depth = 0;
  return html.replace(/(<[^>]*>)|([^<]+)/g, (_whole, tag: string | undefined, text: string | undefined) => {
    if (tag) {
      const name = /^<\/?([a-zA-Z0-9]+)/.exec(tag)?.[1]?.toLowerCase();
      if (name && skippedTags.has(name) && !tag.endsWith('/>')) {
        if (tag.startsWith('</')) { const index = skipped.lastIndexOf(name); if (index >= 0) skipped.splice(index, 1); }
        else skipped.push(name);
      }
      return tag;
    }
    if (skipped.length || !text) return text ?? '';
    let last = 0;
    let output = '';
    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      const before = text.slice(last, index);
      for (const character of before) depth += character === '[' ? 1 : character === ']' ? -1 : 0;
      output += before + (depth > 0 ? match[0] : `[${names.get(match[0]) ?? match[0]}]`);
      last = index + match[0].length;
    }
    const rest = text.slice(last);
    for (const character of rest) depth += character === '[' ? 1 : character === ']' ? -1 : 0;
    return output + rest;
  });
}
