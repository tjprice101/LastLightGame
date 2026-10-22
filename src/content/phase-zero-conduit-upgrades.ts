import { approvedConduitAbility } from './phase-zero-conduit-catalog';

// Percentage positions that grow; thresholds, costs, penalties and safety caps stay fixed.
export const phaseZeroUpgradePercentages: Readonly<Record<string, readonly number[]>> = {
  'bastion-lock': [0], 'crosspin-governor': [0], 'fieldbrace-coupler': [0],
  'fracture-reservoir': [0], 'parallax-relay': [0], 'precision-escapement': [0],
  'prism-splinter-socket': [0], 'reserve-torque-crank': [0], 'siegebound-drive': [0], 'vigil-core': [0],
  'aegis-capacitor': [0], 'breach-pendulum': [0], 'coilfeed-ratchet': [0], 'duplex-heart': [0],
  'falcon-sight': [0], 'glassroot-gimbal': [0], 'hammerbalance-link': [0], 'lifeline-flywheel': [0],
  'opal-indexer': [0], 'resonance-crucible': [], 'sentinel-aperture': [0], 'spearwheel-engine': [0],
  'springwell-pump': [0], 'twinpulse-bellows': [0], 'wardglass-transformer': [0, 1],
  'astral-prism': [0], 'citadel-spine': [0, 2], 'execution-orrery': [0], 'granite-hourglass': [0],
  'horizon-heartcase': [0], 'immortal-vessel': [0, 1], 'judgment-lens': [0], 'meridian-inverter': [0],
  'nullsong-transmission': [0], 'pale-bulwark-diadem': [0], 'siege-cantilever': [0],
  'starvein-conductor': [1], 'stasis-reliquary': [1], 'verdict-caliper': [0], 'worldbreaker-drive': [0],
  'clearwater-manifold': [0], 'tranquilitic-accord-bastion': [0], 'aegis-return-spring': [0, 1],
  'tectonic-atlas-bastion': [0, 1], 'infernic-cinder-testament': [0, 1],
  'luminous-dawn-witness-array': [0, 1], 'ominous-eclipse-mantle': [0, 1], 'flare-focusing-iris': [0],
  'cinder-metering-nozzle': [0], 'tectonic-faultkeeper-loom': [0], 'firstlight-cam': [0, 1],
  'tension-governor': [0, 2], 'atmospheric-griffin-turbine': [0, 1], 'tranquilitic-kirin-cradle': [0, 2],
  'tidebound-reflector': [0, 1], 'aquatic-leviathan-pump': [0, 1], 'ward-stitch-spool': [0],
  'ominous-nightglass-archive': [0], 'chaotic-ouroboros-core': [0, 1], 'chaotic-paradox-spindle': [0, 1],
  'emberlife-kiln': [0], 'infernic-phoenix-reactor': [0, 1], 'tempered-strike-link': [0, 1],
  'infernic-pyre-census': [0, 1, 2], 'chaotic-fault-verdict': [0, 1], 'ruinselect-prism': [0],
  'secondbeat-rack': [0, 1], 'luminous-seraph-mirror': [0], 'oceanic-shared-tide-pump': [0],
  'pulse-trigger-pawl': [0], 'atmospheric-skythread-rudder': [0], 'solace-anchor': [0],
  'sootwake-crucible': [0], 'tranquilitic-stillhour-carillon': [0, 1],
  'voltaic-stormstep-dynamo': [0, 1], 'atmospheric-storm-clock': [0], 'pressurecrest-governor': [0],
  'voltaic-thunderbird-coil': [0, 1], 'aquatic-undertide-chronometer': [0],
  'efflorescent-verdant-covenant': [0], 'covercharge-drum': [0, 1], 'botanic-graft-covenant': [0, 2],
  'mending-valve': [0], 'rootbound-triage-vault': [0, 1], 'efflorescent-worldtree-heart': [0],
  'calamitic-cathedral-final-equation': [0, 1], 'calamitic-causality-funeral-engine': [0],
  'calamitic-horizon-cleaving-godpress': [0, 1], 'calamitic-throne-borrowed-tomorrows': [],
  'calamitic-world-eater-orrery': [0],
};

export function phaseZeroUpgradedAbility(id: string, level = 0): string | undefined {
  const ability = approvedConduitAbility(id);
  if (ability === undefined) return undefined;
  if (!Number.isInteger(level) || level < 0 || level > 5)
    throw new Error('Conduit upgrade level must be an integer from 0 to 5.');
  if (id.startsWith('master-')) {
    if (level !== 0) throw new Error('Master Conduits cannot be upgraded.');
    return ability;
  }
  const positions = phaseZeroUpgradePercentages[id];
  if (!positions) throw new Error(`Missing Phase 0 upgrade policy: ${id}.`);
  let index = 0;
  return ability.replace(/([+-]?\d+(?:\.\d+)?)%/g, (text, amount: string) => {
    if (!positions.includes(index++)) return text;
    const upgraded = Number((Number(amount) * (1 + level * .1)).toFixed(8));
    return `${amount.startsWith('+') ? '+' : ''}${upgraded}%`;
  });
}
