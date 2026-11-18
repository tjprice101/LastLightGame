// Renders a `run_pressure_study.mjs --retune` JSONL report as markdown tables (Phase 3 Step 4).
// Usage: node tools\render_retune_report.mjs <report.jsonl> [more.jsonl ...]
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) throw new Error('Usage: node tools\\render_retune_report.mjs <report.jsonl> [more.jsonl ...]');
const rows = files.flatMap(file => readFileSync(file, 'utf8').split('\n').filter(Boolean)
  .map(line => JSON.parse(line)).filter(row => row.measurement).map(row => row.measurement));
if (!rows.length) throw new Error('No retune measurements found.');

const bandLabel = band => `${band * 20 + 1}-${band * 20 + 20}`;
const pct = (a, b) => b ? `${(100 * a / b).toFixed(1)}%` : '-';
function cells(key) {
  const map = new Map();
  for (const row of rows) {
    const k = key(row);
    const cell = map.get(k) ?? { wins: 0, n: 0, timeouts: 0, rounds: 0, health: 0, flares: 0 };
    cell.n++;
    if (row.outcome === 'victory') { cell.wins++; cell.health += row.finalHP / row.initialHP; }
    if (row.outcome === 'timeout' || row.outcome === 'stalemate') cell.timeouts++;
    cell.rounds += row.rounds; cell.flares += row.flares;
    map.set(k, cell);
  }
  return map;
}
const calibrations = [...new Set(rows.map(row => row.calibration))];
const policies = [...new Set(rows.map(row => row.policy))];
const out = [];
const line = cell => cell
  ? `${cell.wins}/${cell.n} (${pct(cell.wins, cell.n)})${cell.timeouts ? `, ${cell.timeouts} timeout` : ''}; ` +
    `${(cell.rounds / cell.n).toFixed(1)} rd; ${cell.wins ? pct(cell.health, cell.wins) : '-'} HP; ` +
    `${(cell.flares / cell.n).toFixed(2)} Fl`
  : '-';

// Totals.
const total = cells(row => `${row.calibration}|${row.policy}|${row.group.startsWith('calamity') ? 'calamity' : 'ordinary'}`);
out.push('### Totals', '', `| Calibration | Policy | Ordinary | Calamity |`, '|---|---|---|---|');
for (const c of calibrations) for (const p of policies)
  out.push(`| ${c} | ${p} | ${line(total.get(`${c}|${p}|ordinary`))} | ${line(total.get(`${c}|${p}|calamity`))} |`);

// Ordinary bands (D-404: >= 95% wins, no timeouts).
const band = cells(row => `${row.calibration}|${row.policy}|${row.group}|${row.band}`);
const keys = [...new Set(rows.filter(row => !row.group.startsWith('calamity')).map(row => `${row.group}|${row.band}`))]
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
for (const c of calibrations) {
  out.push('', `### ${c}: activity bands (target >= 95%, no timeouts)`, '',
    `| Activity | Levels | ${policies.join(' | ')} |`, `|---|---|${policies.map(() => '---').join('|')}|`);
  for (const key of keys) {
    const [group, b] = key.split('|');
    const values = policies.map(p => band.get(`${c}|${p}|${key}`));
    const miss = values[0] && (values[0].wins / values[0].n < .95 || values[0].timeouts) ? ' **below**' : '';
    out.push(`| ${group} | ${bandLabel(Number(b))} | ${values.map(line).join(' | ')}${miss} |`);
  }
  out.push('', `#### ${c}: Calamity (targets EX+1 >= 80%, EX+2 >= 50%, EX+3 >= 30%)`, '',
    `| Tier | ${policies.join(' | ')} |`, `|---|${policies.map(() => '---').join('|')}|`);
  for (const tier of [1, 2, 3])
    out.push(`| EX+${tier} | ${policies.map(p => line(band.get(`${c}|${p}|calamity:${tier}|0`))).join(' | ')} |`);
}

// Per-trio outliers (first policy): win share by team across ordinary rows.
const team = cells(row => `${row.calibration}|${row.policy}|${row.group.startsWith('calamity') ? 'calamity' : 'ordinary'}|${row.ids.join('+')}`);
for (const c of calibrations) {
  out.push('', `### ${c}: by team`, '', `| Scope | Team | ${policies.join(' | ')} |`, `|---|---|${policies.map(() => '---').join('|')}|`);
  const teams = [...new Set(rows.filter(row => row.calibration === c).map(row =>
    `${row.group.startsWith('calamity') ? 'calamity' : 'ordinary'}|${row.ids.join('+')}`))].sort();
  for (const t of teams) {
    const [scope, ids] = t.split('|');
    out.push(`| ${scope} | ${ids} | ${policies.map(p => line(team.get(`${c}|${p}|${t}`))).join(' | ')} |`);
  }
}
console.log(out.join('\n'));
