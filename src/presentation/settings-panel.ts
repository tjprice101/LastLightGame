import { type MotionPreference } from './settings';
import { commands, allowedCodes, keyLabel, type Bindings } from '../game/hotkeys';
import { battleSpeeds, type BattleSpeed } from './battle-speed';

export function settingsPanel(motion: MotionPreference, bindings: Bindings, speed: BattleSpeed): string {
  return `<header class="drawer-heading"><div><p class="eyebrow">YOUR EXPERIENCE</p><h2 id="settings-heading">Settings</h2></div>
    <button id="close-settings" class="drawer-close" aria-label="Close settings">&times;</button></header>
    <p class="subtitle">Saved on this device, separately from your Element-Bearer.</p>
    <section class="settings-panel"><h3>Battle presentation</h3>
      <label for="settings-battle-speed">Animation speed</label>
      <select id="settings-battle-speed" data-battle-speed aria-describedby="speed-description">${battleSpeeds.map((value) =>
        `<option value="${value}" ${speed === value ? 'selected' : ''}>${value}&times;${value === 1 ? ' / Cinematic' : value === 2 ? ' / Quick' : ' / Fast'}</option>`).join('')}</select>
      <p id="speed-description">Changes animation timing only. Combat and rewards stay the same. Saves automatically.</p>
    </section>
    <form id="settings-form" class="settings-panel"><h3>Motion &amp; accessibility</h3>
      <label for="motion">Animation preference</label>
      <select id="motion" name="motion" aria-describedby="motion-description">
        <option value="system" ${motion === 'system' ? 'selected' : ''}>Follow device preferences</option>
        <option value="reduced" ${motion === 'reduced' ? 'selected' : ''}>Reduce motion</option>
      </select>
      <p id="motion-description">Reduce ambient movement and combat animations. Device reduced-motion preferences are always respected.</p>
      <button class="primary-button" type="submit">Save motion preference</button><p id="settings-result" role="status"></p>
    </form>
    <form id="hotkey-form" class="settings-panel hotkey-panel"><h3>Selection keys</h3>
      <p>Switch allies or targets. Keys never attack or end a turn.</p>
      <div class="settings-key-grid">${commands.map(([command, label]) => `<div><label for="key-${command}">${label}</label>
        <select id="key-${command}" name="${command}">${allowedCodes.map((code) =>
          `<option value="${code}" ${bindings[command] === code ? 'selected' : ''}>${keyLabel(code)}</option>`).join('')}</select></div>`).join('')}</div>
      <details class="settings-help"><summary>How battle controls work</summary><p>Choose distinct physical keys. Typing and browser shortcuts are not intercepted. Drag your character to act, or use the accessible actions in Battle menu. Turns advance automatically when your team cannot act; Space is not an end-turn shortcut.</p></details>
      <button class="primary-button" type="submit">Save selection keys</button><p id="hotkey-result" role="status"></p>
    </form>`;
}
