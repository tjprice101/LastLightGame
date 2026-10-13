// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { bindInformation, informationTopics } from './information';
import { gameplayHub } from './gameplay';

describe('Information topic menus', () => {
  it('opens Gameplay information as a topic menu and shows one topic at a time', () => {
    const host = document.createElement('div');
    document.body.append(host);
    host.innerHTML = gameplayHub();
    bindInformation(host);
    const dialog = host.querySelector<HTMLDialogElement>('#gameplay-information')!;
    dialog.showModal = function showModal() { this.setAttribute('open', ''); };
    const list = dialog.querySelector<HTMLElement>('.information-topic-list')!;
    const panels = () => Array.from(dialog.querySelectorAll<HTMLElement>('[data-info-panel]'));
    const topics = Array.from(list.querySelectorAll<HTMLButtonElement>('[data-info-topic]')).map(button => button.dataset.infoTopic);
    expect(topics).toEqual(['origins', 'start', 'story', 'training', 'dungeons', 'infusion', 'currency', 'roses', 'machines', 'war', 'continuing']);
    host.querySelector<HTMLButtonElement>('[data-information="gameplay-information"]')!.click();
    expect(list.hidden).toBe(false);
    expect(panels().every(panel => panel.hidden)).toBe(true);

    list.querySelector<HTMLButtonElement>('[data-info-topic="machines"]')!.click();
    expect(list.hidden).toBe(true);
    expect(panels().filter(panel => !panel.hidden).map(panel => panel.dataset.infoPanel)).toEqual(['machines']);
    expect(dialog.querySelector('[data-info-panel="machines"]')!.textContent).toContain('Conduit');

    dialog.querySelector<HTMLButtonElement>('[data-info-panel="machines"] [data-info-back]')!.click();
    expect(list.hidden).toBe(false);
    expect(panels().every(panel => panel.hidden)).toBe(true);
    expect(document.activeElement).toBe(list.querySelector('[data-info-topic="machines"]'));

    list.querySelector<HTMLButtonElement>('[data-info-topic="war"]')!.click();
    host.querySelector<HTMLButtonElement>('[data-information="gameplay-information"]')!.click();
    expect(list.hidden).toBe(false);
    host.remove();
  });

  it('rejects duplicate topic identifiers', () => {
    expect(() => informationTopics('x', [
      { id: 'a', title: 'A', summary: '', content: '' }, { id: 'a', title: 'B', summary: '', content: '' },
    ])).toThrow('unique');
  });
});
