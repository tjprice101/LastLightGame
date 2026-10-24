import type { Combatant } from '../game/battle';
import { formatStat } from '../content/combat';
import { escapeDialogText } from './game-dialog';

export function conduitStatusSnapshot(unit: Combatant): NonNullable<Combatant['conduitRuntime']> & { weakened?: number; weakenSourceId?: string } {
  return structuredClone(unit.hp > 0 ? { ...unit.conduitRuntime ?? { numbers: {}, owners: {} },
    weakened: unit.weakened, weakenSourceId: unit.weakenSourceId } : { numbers: {}, owners: {} });
}

export function conduitStatuses(snapshot: ReturnType<typeof conduitStatusSnapshot>, round: number,
  owners: readonly Pick<Combatant, 'id' | 'name' | 'hp' | 'conduitRuntime' | 'masterConduit' | 'conduits'>[] = [], compact = false): string {
  const n = snapshot.numbers;
  const labels: { id: string; text: string; short: string }[] = [];
  const add = (id: string, text: string, short = text): void => { labels.push({ id, text, short }); };
  const owner = (id: string) => owners.find(unit => unit.id === id && unit.hp > 0);
  if (n.stasisPenalty === round + 1)
    add('stasis-pending', '[Stasis Reliquary]: Spillover blocked. Next [Enemy Turn]: take 25% more damage from enemy [Attack Actions]; protection is on cooldown.',
      '[Stasis]: +25% damage taken next turn');
  if (n.stasisPenalty === round)
    add('stasis-penalty', '[Stasis Reliquary]: Take 25% more damage from enemy [Attack Actions] this [Enemy Turn]. [Shield] break protection is on cooldown.',
      '[Stasis]: +25% damage taken · cooldown');
  if (n.calamiticOrrery) add('calamitic-orrery', `World-Eater reserve: ${formatStat(n.calamiticOrrery)} force · Defense releases it.`);
  if (n.calamiticDebt) add('calamitic-debt', `Funeral debt: ${formatStat(n.calamiticDebt)} HP · paid before enemy phase ${n.calamiticDebtDue}.`);
  if (n.calamiticThroneArmed === round) add('calamitic-throne', 'Borrowed tomorrow: one Normal Attack or ordinary skill available; using it costs next turn.');
  if (n.calamiticThroneSkip >= round) add('calamitic-throne-skip', `Throne debt: cannot act on player turn ${n.calamiticThroneSkip}.`);
  if (n.calamiticEquation) add('calamitic-equation', `Final Equation: ${n.calamiticEquation.toString(2).replace(/0/g, '').length} / 3 different actions.`);
  if (n.windveil) add('windveil', 'Windveil: avoids the next enemy Normal Attack.');
  if (n.criticalSeal) add('critical-seal', 'Critical Seal: the next enemy critical hit loses its critical multiplier.');
  if (n.rootbind) add('rootbind', 'Rootbind: next scheduled enemy skill becomes a Normal Attack.');
  if (n.silence) add('silence', 'Silence: next scheduled enemy skill becomes a Normal Attack.');
  if (n.stasisSkip && n.stasisSkip >= round) add('stasis-skip',
    n.stasisSkip === round ? 'Stasis: cannot act this turn.' : `Stasis: cannot act on turn ${n.stasisSkip}.`);
  if (snapshot.owners.accord) add('accord', `Accord: one lethal direct hit prevented; shield follows · ${owner(snapshot.owners.accord)?.name ?? snapshot.owners.accord}.`);
  if (n.quietFeather) add('quiet-feather', 'Quiet Feather: next legal Skill 1 costs no Elemental Gauge; no extra action or recovery bypass.');
  const guardian = owner(snapshot.owners.guardian);
  if (guardian && n.guardianRound === round && guardian.conduitRuntime?.numbers.guardianUsedRound !== round) {
    add('guardian', `Guardian: lethal-hit interception · ${guardian.name}.`);
  }
  const taunt = owner(snapshot.owners.taunt);
  if (taunt && ((taunt.masterConduit === 'master-tide-3' && (snapshot.weakened ?? 0) > 0 && snapshot.weakenSourceId === taunt.id)
    || (taunt.conduits?.includes('tectonic-atlas-bastion') && taunt.conduitRuntime?.numbers.tauntRound === round))) {
    add('taunt', `Taunt: directed toward ${taunt.name}.`);
  }
  const link = owner(snapshot.owners.link);
  if (link && (link.conduitRuntime?.numbers.linkThrough ?? -1) >= round) add('link', `Linked Gauge income · ${link.name}.`);
  const plates = snapshot.layers?.filter(layer => layer.plate && layer.amount > 0) ?? [];
  if (plates.length) add('plates', `Shield plates: ${plates.length} · ${formatStat(plates.reduce((sum, layer) => sum + layer.amount, 0))} shield.`);
  return labels.map(({ id, text, short }) => `<span class="battle-status-badge" data-conduit-status="${id}"${compact ? ` title="${escapeDialogText(text)}"` : ''}>${escapeDialogText(compact ? short : text)}</span>`).join('');
}

export function conduitStatusReadout(unit: Combatant, round: number, owners: readonly Combatant[] = [], compact = false): string {
  return `<span class="unit-conduit-statuses">${conduitStatuses(conduitStatusSnapshot(unit), round, owners, compact)}</span>`;
}
