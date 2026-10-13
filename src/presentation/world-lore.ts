import { worldHistory, machineOrigin } from '../content/world-lore';

export function worldLore(): string {
  return `<section class="world-lore" aria-label="Origins of the world">${worldHistory.map(entry => `<h3>${entry.title}</h3><p>${entry.text}</p>`).join('')}<h3>The Machines</h3><p>${machineOrigin}</p></section>`;
}
