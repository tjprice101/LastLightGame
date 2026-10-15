import type { ElementId } from './activities';
import type { ConduitBuff } from './conduits';
import { redesignEffect } from './conduit-redesign';

interface KitConduitDesign {
  id: string;
  name: string;
  rarity: 'Omnic';
  price: null;
  theme: ElementId;
  element: ElementId;
  buffs: readonly ConduitBuff[];
  effect: string;
  lore: string;
  artDesign: string;
}

export const kitConduitDesigns = [
  { id: 'tempered-strike-link', name: 'Phoenix Temper Dominion', rarity: 'Omnic', price: null, theme: 'infernic', element: 'infernic',
    buffs: [],

    effect: redesignEffect('tempered-strike-link'),
    lore: 'The reborn striking engine tempers its reserve in genuine embers before releasing a measured return.',
    artDesign: 'fully reborn articulated striking-link engine with a readable protected crimson ceramic pivot, six majestic phoenix blade fans, nested orange siege rings, a crown of interlocking impact vanes and densely layered scarlet ribbons' },
  { id: 'mending-valve', name: 'Worldroot Sap Cathedral', rarity: 'Omnic', price: null, theme: 'botanic', element: 'botanic',
    buffs: [],

    effect: redesignEffect('mending-valve'),
    lore: 'A restored restoration valve stores only the pulse of health actually returned.',
    artDesign: 'fully reborn flower-valve cathedral with a readable protected ivory restoration channel, six majestic jade leaf fans, nested root rings, a petal crown and densely layered emerald covenant ribbons between articulated shutters' },
  { id: 'ward-stitch-spool', name: 'Leviathan Ward Loom', rarity: 'Omnic', price: null, theme: 'oceanic', element: 'oceanic',
    buffs: [],

    effect: redesignEffect('ward-stitch-spool'),
    lore: 'A completed ward loom recovers the tension spent protecting a living vessel.',
    artDesign: 'fully reborn sapphire ward loom with a readable protected spool between pearl guides, six majestic shell fans, nested tidal rings, a leviathan crest crown and densely layered opaque blue ward ribbons' },
  { id: 'cinder-metering-nozzle', name: 'Eternal Cinder Observatory', rarity: 'Omnic', price: null, theme: 'infernic', element: 'infernic',
    buffs: [],

    effect: redesignEffect('cinder-metering-nozzle'),
    lore: 'The restored nozzle holds an ember clock rather than creating a flame from nothing.',
    artDesign: 'fully reborn triangular cinder observatory with a readable protected three-baffle nozzle, six majestic orange flame fans, nested scarlet clock rings, an ember crown and densely layered opaque crimson pressure ribbons' },
  { id: 'pulse-trigger-pawl', name: 'Sky Sovereign Escapement', rarity: 'Omnic', price: null, theme: 'atmospheric', element: 'atmospheric',
    buffs: [],

    effect: redesignEffect('pulse-trigger-pawl'),
    lore: 'A sovereign wind escapement returns a successful pressure pulse to a guarded timing wheel.',
    artDesign: 'fully reborn teal ratchet escapement with a readable protected ceramic tooth, six majestic turbine feather fans, nested timing rings, an ivory sky crown and densely layered opaque wind ribbons' },
  { id: 'firstlight-cam', name: 'Firstlight Concordance', rarity: 'Omnic', price: null, theme: 'tranquilitic', element: 'tranquilitic',
    buffs: [],

    effect: redesignEffect('firstlight-cam'),
    lore: 'A restored opening cam aligns an allied mechanism only after genuine support.',
    artDesign: 'fully reborn ivory concordance cam with a readable protected opening joint, six majestic petal fans, nested precision rings, a pearl sanctuary crown and densely layered turquoise support ribbons between articulated arms' },
  { id: 'secondbeat-rack', name: 'Secondbeat Rupture Throne', rarity: 'Omnic', price: null, theme: 'chaotic', element: 'chaotic',
    buffs: [],

    effect: redesignEffect('secondbeat-rack'),
    lore: 'The reborn offset rack measures actual suppression before indexing a new fracture.',
    artDesign: 'fully reborn obsidian toothed-rack throne with a readable protected double jaw, six majestic fractured blade fans, nested violet fault rings, a crimson rupture crown and densely layered opaque tension ribbons' },
  { id: 'flare-focusing-iris', name: 'Ember Coronation Iris', rarity: 'Omnic', price: null, theme: 'infernic', element: 'infernic',
    buffs: [],

    effect: redesignEffect('flare-focusing-iris'),
    lore: 'An enthroned iris returns spent native embers as a protective coronation.',
    artDesign: 'fully reborn scarlet six-leaf focusing iris with a readable protected faceted central crystal, six majestic phoenix shield fans, nested coronation rings, an ivory siege crown and densely layered orange protective ribbons' },
  { id: 'clearwater-manifold', name: 'Abyssal Clearwater Parliament', rarity: 'Omnic', price: null, theme: 'oceanic', element: 'oceanic',
    buffs: [],

    effect: redesignEffect('clearwater-manifold'),
    lore: 'A restored manifold routes consumed ward pressure to a separate protected chamber.',
    artDesign: 'fully reborn three-chamber sapphire manifold with a readable protected return piston, six majestic pearl tide fans, nested channel rings, an abyssal shell crown and densely layered opaque blue return ribbons' },
  { id: 'aegis-return-spring', name: 'Aegis Covenant Crown', rarity: 'Omnic', price: null, theme: 'tranquilitic', element: 'tranquilitic',
    buffs: [],

    effect: redesignEffect('aegis-return-spring'),
    lore: 'The restored spring releases protected pressure as a brief ally covenant.',
    artDesign: 'fully reborn pearl shield-spring crown with a readable protected compression cage, six majestic sanctuary plate fans, nested covenant rings, an ivory aegis crown and densely layered turquoise return ribbons' },
  { id: 'emberlife-kiln', name: 'Phoenix Lifeforge', rarity: 'Omnic', price: null, theme: 'infernic', element: 'infernic',
    buffs: [],

    effect: redesignEffect('emberlife-kiln'),
    lore: 'The completed kiln salvages a measured ember pulse without pretending it is native restoration.',
    artDesign: 'fully reborn vaulted crimson lifeforge with a readable protected ceramic kiln core, six majestic phoenix petal fans, nested life-channel rings, an ivory furnace crown and densely layered orange restoration ribbons' },
  { id: 'tension-governor', name: 'Fractured Mercy Governor', rarity: 'Omnic', price: null, theme: 'chaotic', element: 'chaotic',
    buffs: [],

    effect: redesignEffect('tension-governor'),
    lore: 'A completed suppression governor diverts a precise fraction of weakened resistance to a separate ward.',
    artDesign: 'fully reborn obsidian twin-jaw governor with a readable protected counterweight, six majestic violet fault fans, nested tension rings, a crimson mercy crown and densely layered opaque fractured ribbons' },
  { id: 'covercharge-drum', name: 'Worldgrove Covercharge Heart', rarity: 'Omnic', price: null, theme: 'botanic', element: 'botanic',
    buffs: [],

    effect: redesignEffect('covercharge-drum'),
    lore: 'A restored living drum closes its own plates only when another vessel is truly repaired.',
    artDesign: 'fully reborn jade armored heart drum with a readable protected reserve wheel, six majestic root plate fans, nested grove rings, a gray stone leaf crown and densely layered emerald protective ribbons' },
  { id: 'sootwake-crucible', name: 'Sootwake Phoenix Mirror', rarity: 'Omnic', price: null, theme: 'infernic', element: 'infernic',
    buffs: [],

    effect: redesignEffect('sootwake-crucible'),
    lore: 'The reborn crucible reflects an existing ember channel into a measured self-ward.',
    artDesign: 'fully reborn scarlet siege mirror crucible with a readable protected thorn aperture, six majestic phoenix armor fans, nested sootwake rings, an ivory targeting crown and densely layered orange reflection ribbons' },
  { id: 'tidebound-reflector', name: 'Leviathan Mercy Reflector', rarity: 'Omnic', price: null, theme: 'oceanic', element: 'oceanic',
    buffs: [],

    effect: redesignEffect('tidebound-reflector'),
    lore: 'A completed tide reflector directs a genuine ward expansion toward the vessel under greatest strain.',
    artDesign: 'fully reborn sapphire shell reflector with a readable protected faceted mirror, six majestic ivory tidal plate fans, nested mercy rings, a leviathan pearl crown and densely layered opaque blue shelter ribbons' },
  { id: 'pressurecrest-governor', name: 'Tempest Shelter Sovereign', rarity: 'Omnic', price: null, theme: 'atmospheric', element: 'atmospheric',
    buffs: [],

    effect: redesignEffect('pressurecrest-governor'),
    lore: 'A restored pressure crest directs real critical impact into an ally shelter rather than another attack.',
    artDesign: 'fully reborn teal feather-vane sovereign with a readable protected pressure governor, six majestic turbine shelter fans, nested calibrated rings, an ivory tempest crown and densely layered opaque wind ribbons' },
  { id: 'rootbound-triage-vault', name: 'Worldroot Triage Sanctuary', rarity: 'Omnic', price: null, theme: 'botanic', element: 'botanic',
    buffs: [],

    effect: redesignEffect('rootbound-triage-vault'),
    lore: 'A restored triage vault repairs one timing channel only under genuine pre-heal strain.',
    artDesign: 'fully reborn ivory restoration vault with a readable protected triage chamber, six majestic emerald root fans, nested sanctuary rings, a gray stone petal crown and densely layered jade restoration ribbons' },
  { id: 'solace-anchor', name: 'Solace Witness Monolith', rarity: 'Omnic', price: null, theme: 'tranquilitic', element: 'tranquilitic',
    buffs: [],

    effect: redesignEffect('solace-anchor'),
    lore: 'A completed sanctuary anchor stores the witness of a genuine covenant before releasing a reserve.',
    artDesign: 'fully reborn ivory sanctuary anchor with a readable protected locking joint, six majestic fortress fans, nested solace rings, a pearl witness crown and densely layered turquoise covenant ribbons' },
  { id: 'ruinselect-prism', name: 'Ruinselect Fracture Parliament', rarity: 'Omnic', price: null, theme: 'chaotic', element: 'chaotic',
    buffs: [],

    effect: redesignEffect('ruinselect-prism'),
    lore: 'The restored selection orrery routes spent personal fractures to one allied reserve.',
    artDesign: 'fully reborn fractured obsidian selection orrery with a readable protected central prism, six majestic violet targeting fans, nested fault rings, a crimson parliamentary crown and densely layered opaque precision ribbons' },
  { id: 'infernic-pyre-census', name: 'Pyre Census Requiem', rarity: 'Omnic', price: null, theme: 'infernic', element: 'infernic',
    buffs: [],

    effect: redesignEffect('infernic-pyre-census'),
    lore: 'The completed census records only an ember channel that truly closes.',
    artDesign: 'fully reborn crimson census engine with a readable protected three-counter core, six majestic phoenix requiem fans, nested siege rings, an ivory ember crown and densely layered opaque orange census ribbons' },
  { id: 'oceanic-shared-tide-pump', name: 'Shared Tide Lifesea Engine', rarity: 'Omnic', price: null, theme: 'oceanic', element: 'oceanic',
    buffs: [],

    effect: redesignEffect('oceanic-shared-tide-pump'),
    lore: 'A completed tide pump repairs the vessel whose own ward actually bore the pressure.',
    artDesign: 'fully reborn sapphire lifesea pump with a readable protected three-chamber heart, six majestic pearl shield fans, nested tide rings, a silver leviathan crown and densely layered opaque blue restoration ribbons' },
  { id: 'atmospheric-storm-clock', name: 'Tempest Return Chronarch', rarity: 'Omnic', price: null, theme: 'atmospheric', element: 'atmospheric',
    buffs: [],

    effect: redesignEffect('atmospheric-storm-clock'),
    lore: 'A completed storm clock returns a bounded native pressure reserve without moving the combat clock.',
    artDesign: 'fully reborn teal chronarch clock with a readable protected escapement, six majestic turbine feather fans, nested ivory timing rings, a tempest crown and densely layered opaque wind and electric zigzag ribbons' },
  { id: 'botanic-graft-covenant', name: 'Worldroot Graft Coronation', rarity: 'Omnic', price: null, theme: 'botanic', element: 'botanic',
    buffs: [],

    effect: redesignEffect('botanic-graft-covenant'),
    lore: 'The completed graft engine translates a spent native restoration reserve into one protective covenant.',
    artDesign: 'fully reborn emerald graft engine with a readable protected restoration chamber, six majestic articulated root fans, nested covenant rings, an ivory petal crown and densely layered jade protective ribbons across gray stone braces' },
  { id: 'tranquilitic-accord-bastion', name: 'Accord Seraph Sanctuary', rarity: 'Omnic', price: null, theme: 'tranquilitic', element: 'tranquilitic',
    buffs: [],

    effect: redesignEffect('tranquilitic-accord-bastion'),
    lore: 'A completed accord bastion binds real support to one bounded protective witness.',
    artDesign: 'fully reborn ivory accord bastion with a readable protected sanctuary lock, six majestic seraph fortress fans, nested pearl covenant rings, a turquoise peace crown and densely layered opaque sanctuary ribbons' },
  { id: 'chaotic-fault-verdict', name: 'Rosefault Precision Sovereign', rarity: 'Omnic', price: null, theme: 'chaotic', element: 'chaotic',
    buffs: [],

    effect: redesignEffect('chaotic-fault-verdict'),
    lore: 'The completed fault selector distinguishes a genuinely spent Rose reserve from an unearned echo.',
    artDesign: 'fully reborn obsidian rosefault selector with a readable protected forked prism, six majestic crimson thorn fans, nested violet precision rings, a fractured rose crown and densely layered opaque crimson and amethyst fault ribbons' },
] as const satisfies readonly KitConduitDesign[];

export const convertedKitConduitIds: ReadonlySet<string> = new Set(kitConduitDesigns.map((entry) => entry.id));
