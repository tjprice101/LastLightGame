import { conduitUpgradeCap, validateConduitUpgradeLevel } from '../content/conduits';
import './conduit-upgrade-meter.css';

function squareClasses(level: number): string[] {
  validateConduitUpgradeLevel(level);
  return Array.from({ length: conduitUpgradeCap }, (_, index) =>
    `conduit-upgrade-square${index < level ? ' is-filled' : ''}`);
}

export function conduitUpgradeMeter(level: number): string {
  return `<span class="conduit-upgrade-meter" data-upgrade-level="${level}" aria-hidden="true">${squareClasses(level)
    .map((className) => `<span class="${className}"></span>`).join('')}</span>`;
}

export function createConduitUpgradeMeter(level: number): HTMLElement {
  const classes = squareClasses(level);
  const meter = document.createElement('span');
  meter.className = 'conduit-upgrade-meter';
  meter.dataset.upgradeLevel = String(level);
  meter.setAttribute('role', 'img');
  meter.setAttribute('aria-label', `Conduit upgrade +${level} of ${conduitUpgradeCap}`);
  for (const className of classes) {
    const square = document.createElement('span');
    square.className = className;
    square.setAttribute('aria-hidden', 'true');
    meter.append(square);
  }
  return meter;
}
