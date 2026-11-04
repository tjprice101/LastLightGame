export const conduitGlossary: readonly { term: string; definition: string }[] = [
  { term: 'Global', definition: 'An effect that applies to all eligible targets on its specified side, such as damage to all enemies or healing to all allies. It does not change which side or targets an effect can affect.' },
  { term: 'Attack Action', definition: 'A [Normal Attack], [Skill 1], [Skill 2] or [Last Flare] that hits enemies.' },
  { term: 'Bonus Strike', definition: 'An extra hit or damage instance created by a Conduit.' },
  { term: 'Direct Damage', definition: 'Damage dealt by a hit; [Burn] damage is separate.' },
  { term: 'Shield', definition: 'Protection that absorbs damage before [Health] and lasts until broken. Skill and Last Flare Shields stack on repeat casts. Conduit effects keep their stated sizing and refresh rules.' },
  { term: 'Burn', definition: 'Damage over time. Unless an ability states otherwise, deals 25% of its source’s [Direct Attack] once per enemy phase for three enemy phases, with applicable Skill Power and damage-over-time bonuses. Reapplying the same source refreshes its duration and keeps the stronger damage; different sources remain independent.' },
  { term: 'Weaken', definition: 'Reduces an enemy’s outgoing direct damage. Unless an ability states otherwise, reduces it by 25% for the next enemy phase. Only the strongest active Weaken applies.' },
  { term: 'Enemy Turn', definition: 'The part of a Round when enemies act.' },
  { term: 'Round', definition: 'One player turn followed by one Enemy Turn.' },
  { term: 'Battle', definition: 'One complete combat run from its start until it ends.' },
];
