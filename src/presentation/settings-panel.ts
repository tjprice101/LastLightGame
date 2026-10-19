import { type MotionPreference } from './settings';
import { commands, allowedCodes, keyLabel, type Bindings } from '../game/hotkeys';
import { battleSpeeds, type BattleSpeed } from './battle-speed';
import { information } from './information';
import { defaultMusicPreferences, type MusicPreferences } from './music';

export function settingsPanel(motion: MotionPreference, bindings: Bindings, speed: BattleSpeed, music: MusicPreferences = defaultMusicPreferences): string {
  return `<header class="drawer-heading"><div><h2 id="settings-heading">Settings</h2></div>
    <button id="close-settings" class="drawer-close" aria-label="Close settings">&times;</button></header>
    ${information('settings-information', 'Settings information', '<p>Settings save on this device. Animation speed affects visuals only. Animations play unless Reduce motion is selected here. Selection keys switch allies or targets and must be distinct; they never attack or end turns.</p><p>Drag characters or use the Battle menu to act. Turns advance on their own when no ally can act; stages wait for Continue.</p>')}
    <section class="settings-panel"><h3>Music</h3>
      <label for="music-volume">Music volume <output id="music-volume-value" for="music-volume">${music.volume}%</output></label>
      <input id="music-volume" type="range" min="0" max="100" step="1" value="${music.volume}" aria-describedby="music-description">
      <label for="music-muted"><input id="music-muted" type="checkbox" ${music.muted ? 'checked' : ''}> Mute music</label>
      <p id="music-description">Saved automatically on this device. Music starts after an interaction and pauses while this tab is hidden. Activities without delivered tracks stay silent.</p>
    </section>
    <section class="settings-panel"><h3>Battle presentation</h3>
      <label for="settings-battle-speed">Animation speed</label>
      <select id="settings-battle-speed" data-battle-speed aria-describedby="speed-description">${battleSpeeds.map((value) =>
        `<option value="${value}" ${speed === value ? 'selected' : ''}>${value}&times;${value === 1 ? ' · Cinematic' : value === 2 ? ' · Quick' : ' · Fast'}</option>`).join('')}</select>
      <p id="speed-description">Presentation only · Saved automatically</p>
    </section>
    <form id="settings-form" class="settings-panel"><h3>Motion &amp; accessibility</h3>
      <label for="motion">Animation preference</label>
      <select id="motion" name="motion" aria-describedby="motion-description">
        <option value="system" ${motion === 'system' ? 'selected' : ''}>Full animations</option>
        <option value="reduced" ${motion === 'reduced' ? 'selected' : ''}>Reduce motion</option>
      </select>
      <p id="motion-description">Animations are on by default. Only Reduce motion disables them.</p>
      <button class="primary-button" type="submit">Save motion preference</button><p id="settings-result" role="status"></p>
    </form>
    <form id="hotkey-form" class="settings-panel hotkey-panel"><h3>Selection keys</h3>
      <p>Switch allies or targets. Keys never attack or end a turn.</p>
      <div class="settings-key-grid">${commands.map(([command, label]) => `<div><label for="key-${command}">${label}</label>
        <select id="key-${command}" name="${command}">${allowedCodes.map((code) =>
          `<option value="${code}" ${bindings[command] === code ? 'selected' : ''}>${keyLabel(code)}</option>`).join('')}</select></div>`).join('')}</div>
      <button class="primary-button" type="submit">Save selection keys</button><p id="hotkey-result" role="status"></p>
    </form>
    <section class="settings-panel settings-session"><h3>Session</h3>
      <p>Return to the title ends any active battle. Saved progress and earned rewards are kept.</p>
      <button id="return-title" type="button" class="text-button">Return to title</button>
    </section>`;
}
