import { type MotionPreference } from './settings';
import { commands, allowedCodes, keyLabel, type Bindings } from '../game/hotkeys';
import { battleSpeeds, type BattleSpeed } from './battle-speed';
import { information } from './information';

export function settingsPanel(motion: MotionPreference, bindings: Bindings, speed: BattleSpeed): string {
  return `<header class="drawer-heading"><div><h2 id="settings-heading">Settings</h2></div>
    <button id="close-settings" class="drawer-close" aria-label="Close settings">&times;</button></header>
    ${information('settings-information', 'Settings information', '<p>Settings save on this device. Animation speed changes presentation only, not combat or rewards. Reduced motion respects both the saved setting and device preference. Selection keys switch allies or targets; they cannot attack or end a turn. Use distinct physical keys. Typing and browser shortcuts are not intercepted.</p><p>Drag characters to act or use Battle menu controls. Turns advance automatically while no living ally can act. Stages require Continue.</p>')}
    <section class="settings-panel"><h3>Battle presentation</h3>
      <label for="settings-battle-speed">Animation speed</label>
      <select id="settings-battle-speed" data-battle-speed aria-describedby="speed-description">${battleSpeeds.map((value) =>
        `<option value="${value}" ${speed === value ? 'selected' : ''}>${value}&times;${value === 1 ? ' ~ Cinematic' : value === 2 ? ' ~ Quick' : ' ~ Fast'}</option>`).join('')}</select>
      <p id="speed-description">Presentation only ~ Saved automatically</p>
    </section>
    <form id="settings-form" class="settings-panel"><h3>Motion &amp; accessibility</h3>
      <label for="motion">Animation preference</label>
      <select id="motion" name="motion" aria-describedby="motion-description">
        <option value="system" ${motion === 'system' ? 'selected' : ''}>Follow device preferences</option>
        <option value="reduced" ${motion === 'reduced' ? 'selected' : ''}>Reduce motion</option>
      </select>
      <p id="motion-description">Device reduced-motion settings also apply.</p>
      <button class="primary-button" type="submit">Save motion preference</button><p id="settings-result" role="status"></p>
    </form>
    <form id="hotkey-form" class="settings-panel hotkey-panel"><h3>Selection keys</h3>
      <p>Switch allies or targets. Keys never attack or end a turn.</p>
      <div class="settings-key-grid">${commands.map(([command, label]) => `<div><label for="key-${command}">${label}</label>
        <select id="key-${command}" name="${command}">${allowedCodes.map((code) =>
          `<option value="${code}" ${bindings[command] === code ? 'selected' : ''}>${keyLabel(code)}</option>`).join('')}</select></div>`).join('')}</div>
      <button class="primary-button" type="submit">Save selection keys</button><p id="hotkey-result" role="status"></p>
    </form>`;
}
