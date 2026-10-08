import { formatStat } from '../content/combat';
import './stat-change.css';

export function statDirection(before: number, after: number): 'increase' | 'decrease' | 'unchanged' {
  return after > before ? 'increase' : after < before ? 'decrease' : 'unchanged';
}

export function statChange(before: number, after: number, unit: '' | '%' | 'x' = ''): string {
  const direction = statDirection(before, after);
  const label = direction === 'increase' ? 'Increased to' : direction === 'decrease' ? 'Decreased to' : 'Unchanged at';
  const render = (value: number): string => `${formatStat(unit === '%' ? value * 100 : value)}${unit}`;
  return `${render(before)} &rarr; <b class="stat-change stat-change--${direction}" aria-label="${label} ${render(after)}">${render(after)}</b>`;
}
