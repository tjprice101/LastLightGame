import { validateConduitUpgradeLevel } from '../content/conduits';
import './conduit-upgrade-meter.css';

export function conduitUpgradeMeter(level: number): string {
  validateConduitUpgradeLevel(level);
  return `<span class="conduit-upgrade-meter" data-upgrade-level="${level}" aria-hidden="true"><span class="conduit-upgrade-value">+${level}</span></span>`;
}

export function createConduitUpgradeMeter(level: number): HTMLElement {
  validateConduitUpgradeLevel(level);
  const meter = document.createElement('span');
  meter.className = 'conduit-upgrade-meter';
  meter.dataset.upgradeLevel = String(level);
  meter.setAttribute('role', 'img');
  meter.setAttribute('aria-label', `Conduit upgrade +${level}`);
  const value = document.createElement('span');
  value.className = 'conduit-upgrade-value';
  value.setAttribute('aria-hidden', 'true');
  value.textContent = `+${level}`;
  meter.append(value);
  return meter;
}
