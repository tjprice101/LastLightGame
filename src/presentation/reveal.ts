import { type Starter } from '../content/starters';

export function elementalReveal(starter: Starter): string {
  return `<span class="element-reveal reveal-${starter.id}" aria-hidden="true">
    <span class="reveal-ring"></span>
    ${Array.from({ length: 12 }, (_, index) =>
      `<span class="element-mote" style="--angle:${index * 30}deg;--delay:${index % 3 * 70}ms"></span>`,
    ).join('')}
  </span>`;
}
