import type { StarterId } from './starters';
import type { OmnicRule } from './conduit-kit';
import { lootRoll } from './loot-random';
import { machineStageCount } from './activities';
import { masterOrigin } from './world-lore';
import { redesignEffect } from './conduit-redesign';

export const masterChest = {
  id: 'grand-master-chest', name: 'Cosmic Grand Master Chest',
  chance: .01, stage: machineStageCount, art: 'master-conduits/grand-master-chest.png',
  description: 'Choose one unowned Master Conduit for any Element-Bearer. Opens once; does not equip the reward.',
} as const;
export const astralReserveArt = 'master-conduits/astral-reserve.png';
export const masterRulesText = `The final Awaken the Machines boss (stage ${machineStageCount}) has a separate 1% chance to drop a Cosmic Grand Master Chest. Every Calamity EX+Omnipotent chest contains two. Open a Master chest in Inventory to choose one unowned Omnic Master, even for an Element-Bearer you do not own yet. A Master equips only to its named bearer, in a separate slot, without using up the copy. It cannot be upgraded. Check Details for its effect and limits. Extra chests stay unopened once you own all 48 Masters.`;

function redesignedMasterRule(): OmnicRule { return { trigger: 'activation', outcomes: [] }; }
function master(character: StarterId, slot: 1 | 2 | 3, name: string, design: string) {
  return { id: `master-${character}-${slot}` as const, character, name, rarity: 'Omnic' as const,
    art: `master-conduits/master-${character}-${slot}.png` as const, effect: redesignEffect(`master-${character}-${slot}`), design,
    lore: masterOrigin };
}

export const masterConduits = [
  master('ember', 1, 'Helios Pyre Cathedral',
    'A furnace cathedral around a crimson miniature sun, twelve greatsword-shaped exhaust wings, stacked gold flame shutters and volcanic orbital rails'),
  master('ember', 2, 'Cinderstar Genesis Engine',
    'A split stellar ignition engine, three molten planet chambers, counter-rotating sword-tooth halos and branching crimson ignition conduits'),
  master('ember', 3, 'Unbroken Sunforge Throne',
    'A bronze-and-crimson sunforge throne machine, greatsword anvil at its heart, armored flare crowns and six immense mechanical flame fans'),
  master('tide', 1, 'Abyssal Shelter Observatory',
    'A sapphire pressure observatory, spear-shaped lighthouse spindle, nested diving-bell shields and immense tidal astrolabe fins'),
  master('tide', 2, 'Ocean Memory Worldpump',
    'A world-sized tide pump enclosing three ocean planets, sapphire manifold crown, twelve spearhead vanes and interlocked platinum sea rings'),
  master('tide', 3, 'Undertow Sovereign Harpoon',
    'A monumental spear-tip targeting engine, abyssal sapphire prisms, concentric current locks and six armored harpoon-wing arcs'),
  master('sprout', 1, 'Worldseed Mercy Foundry',
    'An emerald seed foundry with ivory bow-limb gantries, twelve leaf-blade mechanical wings and a densely interwoven root orrery'),
  master('sprout', 2, 'Briar Constellation Loom',
    'A cosmic bowstring loom with three emerald seed planets, intertwined root escapements and vast ivory thorn-constellation fans'),
  master('sprout', 3, 'Evergreen Continuance Crucible',
    'A sealed living-world crucible, emerald germination heart, ivory petal armor and six gigantic bow-branch sanctuary wings; no resurrection imagery'),
  master('atmoso', 1, 'Sky Without End Turbine',
    'A turquoise sky-axis turbine, wind-staff core, twelve spiraling blade wings and immense counter-sweeping cyclone crowns'),
  master('atmoso', 2, 'Horizon Cyclone Orrery',
    'Three turquoise storm planets inside a staff-shaped horizon orrery, ivory turbine ramparts and layered compass-wing vaults'),
  master('atmoso', 3, 'Crosswind Imperial Drive',
    'An imperial crosswind staff-drive with crossed turquoise pressure corridors, ivory gale armor and six monumental scythe-shaped wind wings'),
  master('aurora', 1, 'Final Dawn Tribunal',
    'An ivory solar tribunal mechanism, amber judgment lens, twelve lens-wing arches and descending platinum verdict locks'),
  master('aurora', 2, 'Prismseal Astral Judiciary',
    'Three amber lens planets in an ivory judiciary orrery, interlocking seal plates and vast empty-hand casting aperture wings'),
  master('aurora', 3, 'Merciful Eclipse Regulator',
    'A white eclipse regulator surrounding an amber sun lens, twelve protective shutter petals and immense tiered celestial court rails'),
  master('bliss', 1, 'Thousandfeather Zenith Loom',
    'An ivory-and-rose feather loom, two immense mechanical warfan assemblies, platinum quill wings and densely nested celestial ribbon gears'),
  master('bliss', 2, 'Stillplume Planetary Ballet',
    'Three rose opal planets dancing inside paired ivory fan rotors, counterbalanced feather crowns and platinum orbital ribbons'),
  master('bliss', 3, 'Quiet Heaven Fanforge',
    'A double-fan heaven forge, ivory-and-rose central feather heart, twelve platinum quill mandalas and monumental quiet-wing armor'),
  master('bruno', 1, 'Living Worldwall Atlas',
    'A basalt-and-bronze atlas machine supporting a faceted ochre world, hammer-shaped axial pillar and twelve titanic faultplate wings'),
  master('bruno', 2, 'Quarry Planet Gravitas',
    'Three basalt quarry planets locked in bronze gravitic hammer cages, immense layered bedrock buttresses and ochre orbiting armor rails'),
  master('bruno', 3, 'Worldforge Hammer Dominion',
    'A bronze hammer-dominion engine, basalt shelter vaults, ochre crystal pistons and six massive mechanically linked mountain-wing plates'),
  master('disciple', 1, 'Unbound Mindcrown Synapse',
    'An amethyst synapse crown engine, scarlet mindflame channels, twelve open-palm-shaped mechanical arches and linked psychic orbital frames'),
  master('disciple', 2, 'Concord Planet Thoughtforge',
    'Three amethyst thought planets in scarlet-linked open orbital cages, empty-hand mindcrown apertures and monumental psychic lattice wings'),
  master('disciple', 3, 'Sovereign Will Amplifier',
    'A black-amethyst will amplifier with scarlet triple-tier crown rings, huge open psychic handframes and twelve ornate inward-linked flame vanes'),
  master('elise', 1, 'Infinite Thunderwheel Arsenal',
    'Exactly two four-point shuriken-shaped thunderwheel rotors with open central grips, yellow-green voltage rails and twelve platinum lightning wings'),
  master('elise', 2, 'Twin Star Planetary Ratchet',
    'Three voltage planets held between two four-point star ratchets, yellow-green branching circuitry and huge platinum circuit-crown blades'),
  master('elise', 3, 'Storm Empress Execution Clock',
    'A double-shuriken execution clock, segmented yellow-green circuit armor, twelve angular stormblade fans and layered four-point chronometer rails'),
  master('razor', 1, 'Unbroken Midnight Bastion',
    'An obsidian midnight bastion engine enclosing one night-sword spindle, violet crescent shield wings and enormous layered eclipse ramparts'),
  master('razor', 2, 'Eclipse Planet Watchtower',
    'Three violet eclipse planets behind obsidian tower-shield cages, one night-sword axis and twelve monumental crescent watchtower wings'),
  master('razor', 3, 'Nightglass Counterblade Engine',
    'An obsidian counterblade engine, violet nightglass gem chambers, sword-hilt locking clasps and immense double-crescent shield architecture'),
  master('rosetta', 1, 'Rose Beyond the Sun Orrery',
    'A rose-gold solar bow orrery with crimson petal gears, ivory wing vaults and twelve enormous gilded thorn-mandala arches'),
  master('rosetta', 2, 'Virtuous Planet Rosegarden',
    'Three rose planets in rose-gold garden cages, ivory bow-limb orbit rails and densely layered crimson petal cathedral wings'),
  master('rosetta', 3, 'Golden Thorn Judgment Loom',
    'A golden thorn targeting loom with one central rose-bow aperture, crimson rose mandalas, ivory prism petals and twelve sweeping thorn-wing rails'),
  master('thornia', 1, 'Forbidden Garden Worldlock',
    'A rose-gold forbidden worldlock, violet eclipse cage, crimson thorn greatsword axis and twelve immense gilded rose-shield fans'),
  master('thornia', 2, 'Thousand-Rose Planetary Aegis',
    'Three crimson rose planets nested in golden aegis cages, violet thorn eclipse rails and massive interwoven rose-armored greatsword wings'),
  master('thornia', 3, 'Shadow Rose Sovereign Foundry',
    'A violet-and-rose-gold shadow foundry, crimson thorn blade crucible, six immense rose-wing forge arches and dense golden petal countergears'),
  master('crinso', 1, 'Twin-Rose Singularity Drive',
    'A rose-gold singularity drive around one connected double-ended blade axle, golden flame and crimson lightning halves with twelve thorn wings'),
  master('crinso', 2, 'Duality Planet Flamewheel',
    'Three crimson-gold planets inside one connected dual-edged sword wheel, nested rose hubs, opposed flame rails and lightning petal armor'),
  master('crinso', 3, 'Crimson Beauty Pyre Requiem',
    'A golden-crimson pyre requiem engine with a connected double-ended sword core, twelve rose lightning wings and ornate flame-petal crowns'),
  master('nerithe', 1, 'Shoreless Meridian Worldchart',
    'A turquoise worldchart engine, surveyor-trident spindle, twelve ocean compass wings and immense folded meridian astrolabe rails'),
  master('nerithe', 2, 'Folded Ocean Planetarium',
    'Three turquoise ocean planets in folded ivory meridian cages, surveyor trident locking prongs and huge layered sea-map wings'),
  master('nerithe', 3, 'Abyssal Surveyor Crown',
    'A turquoise abyssal crown surveyor, trident-shaped rangefinding lens, ivory ocean ramparts and twelve royal compass-blade wings'),
  master('orvella', 1, 'Throne Beneath the World',
    'An ivory-and-ochre planetary foundation throne, crystal-mace cornerstone, twelve monumental stone armor wings and immense bronze support arches'),
  master('orvella', 2, 'Deep Foundation Planetpress',
    'Three ochre foundation planets braced by bronze masonry press rings, crystal-mace piston and ivory world-bearing buttress wings'),
  master('orvella', 3, 'Keystone Sovereign Counterweight',
    'An ochre keystone counterweight engine with crystal mace fulcrum, bronze celestial load rails and twelve ivory citadel shield wings'),
  master('vaelor', 1, 'Final Chord Celestial Resonator',
    'A gold-and-black celestial resonator, resonance-blade tuning core, twelve immense thunder choir wings and branching frequency crown rails'),
  master('vaelor', 2, 'Thunder Choir Planetary Fugue',
    'Three gold thunder planets in black conducting cages, resonance-blade axis and vast branching voltage organ-wing architecture'),
  master('vaelor', 3, 'Broken Sky Imperial Metronome',
    'A black-and-gold sky metronome with resonance-blade pendulum, twelve thunder-frequency wings and enormous nested conductor halos'),
] as const;

export type MasterConduitId = (typeof masterConduits)[number]['id'];
export type MasterConduit = (typeof masterConduits)[number];
export type MasterLoadouts = Partial<Record<StarterId, MasterConduitId | null>>;
export function isMasterConduitId(value: unknown): value is MasterConduitId {
  return masterConduits.some(entry => entry.id === value);
}
export function getMasterConduit(id: MasterConduitId): MasterConduit {
  const entry = masterConduits.find(entry => entry.id === id);
  if (!entry) throw new Error('Unknown Master Conduit.');
  return entry;
}
export function validateMasterCharacter(id: MasterConduitId, character: string): void {
  if (getMasterConduit(id).character !== character) throw new Error('This Master Conduit requires its named Element-Bearer.');
}
export function masterChestDrops(stage: number, boss: boolean, random: () => number): number {
  return stage === masterChest.stage && boss && lootRoll(random) < masterChest.chance ? 1 : 0;
}
