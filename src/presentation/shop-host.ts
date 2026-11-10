import { escapeDialogText } from './game-dialog';
import './shop-host.css';

type HostLine = 'welcome' | 'inspect' | 'locked' | 'offline' | 'cancel' | 'saved' | 'equipped';
type HostDefinition = {
  name: string;
  role: string;
  lines: Partial<Record<HostLine, string>> & Record<'welcome' | 'inspect' | 'cancel' | 'saved', string>;
  idle: readonly [string, string, string];
};

const hosts = {
  mirel: {
    name: 'Mirel', role: 'Material Exchange',
    lines: {
      welcome: "Welcome in. Tell me what you need, and we'll make a little room in your pack.",
      inspect: 'Check the quantity as well as the material. The total is right beside it.',
      cancel: "No rush. I'll keep the shelves exactly as they are.",
      saved: 'Packed and accounted for. May it help on the road ahead.',
    },
    idle: [
      'I sort these shelves by destination. The jars have other opinions.',
      'Every label faces forward. The books refuse to cooperate.',
      'A spare compartment is the closest thing to a good luck charm.',
    ],
  },
  veylin: {
    name: 'Veylin', role: 'Cosmetic Store',
    lines: {
      welcome: 'A good frame should introduce you, not shout over you.',
      inspect: "This decorates your profile. It won't change anyone's combat strength.",
      offline: "You're welcome to browse. Sign in when you're ready to buy or equip a frame.",
      cancel: "An excellent decision can wait until you're certain.",
      saved: "It's yours to keep. Try it on your profile whenever you like.",
      equipped: 'There. Your name has just the right company.',
    },
    idle: [
      'I keep every offcut. Someday one of them will become the perfect finishing touch.',
      "A frame doesn't need to be loud to be unforgettable.",
      'I once spent an afternoon choosing one corner. It was time well spent.',
    ],
  },
  torven: {
    name: 'Torven', role: 'Conduit Store',
    lines: {
      welcome: "Come in! Let's find a Conduit that actually earns its place.",
      inspect: 'Read the effect first. The best machine is the one your squad can use.',
      cancel: 'Fair enough. A machine worth choosing is worth thinking about.',
      saved: "It's yours. You can equip it when you're ready; I won't do that for you.",
    },
    idle: [
      "Hear that little click? That's a mechanism admitting it's happy.",
      "Sometimes a tiny gear does the biggest job. Don't tell the big ones.",
      'If it rattles, ask why before you tighten everything.',
    ],
  },
  edda: {
    name: 'Edda', role: 'Conduit Upgrade',
    lines: {
      welcome: "Let's see what your machine can become.",
      inspect: 'The current level and required Broken Mechanical Components are right here.',
      cancel: 'Tools down, then. We can come back to it.',
      saved: 'Adjustment saved. That mechanism should run beautifully.',
    },
    idle: [
      'The quietest gear usually has the most interesting job.',
      'A careful turn of the wrench can be worth a dramatic overhaul.',
      'I save the odd-shaped screws. They usually know where they belong.',
    ],
  },
  sarev: {
    name: 'Sarev', role: 'Calamitic Conduits',
    lines: {
      welcome: 'Some mechanisms deserve a moment of thought before they are opened.',
      inspect: 'Study the effect. Strength is easier to carry when you understand it.',
      locked: 'The seal opens after a Calamity tier has been cleared. The requirement is shown here.',
      cancel: 'A closed case can wait.',
      saved: 'The mechanism is yours. Use it with care.',
    },
    idle: [
      'The old world left questions behind as carefully as it left machines.',
      'I catalog the questions as well as the mechanisms.',
      "A warning isn't a judgment. It's a way to leave choices open.",
    ],
  },
  nimra: {
    name: 'Nimra', role: 'Event Elemental-Devourers',
    lines: {
      welcome: "Hello! I've been making notes on the travelers passing through.",
      inspect: "The listing shows this form's level and skills. Take a look before deciding.",
      offline: 'You can browse here, but purchases need an online sign-in.',
      cancel: "All right. There's always more to learn while you decide.",
      saved: 'The copy is safely in your collection. You decide what to do next.',
    },
    idle: [
      'This page was a map yesterday. Then it rained.',
      'I never leave the trail without writing down the weather.',
      'A quiet footprint can tell you more than a loud story.',
    ],
  },
} satisfies Record<string, HostDefinition>;

export type ShopHostId = keyof typeof hosts;
const idlePositions = new WeakMap<HTMLElement, number>();
const boundRoots = new WeakSet<HTMLElement>();

function isShopHostId(value: string): value is ShopHostId {
  return Object.prototype.hasOwnProperty.call(hosts, value);
}

function lineFor(id: ShopHostId, line: HostLine): string {
  const definition: HostDefinition = hosts[id];
  const text = definition.lines[line];
  if (!text) throw new Error(`Missing ${line} dialogue for ${hosts[id].name}.`);
  return text;
}

export function shopHost(id: ShopHostId, initial: HostLine = 'welcome'): string {
  const host = hosts[id];
  return `<section class="shop-host" data-shop-host="${id}" aria-label="${host.name}, ${host.role}">
    <span class="shop-host-mark" role="img" aria-label="${host.name} portrait artwork pending"><span aria-hidden="true">${host.name[0]}</span></span>
    <div class="shop-host-copy"><div class="shop-host-heading"><div><strong>${host.name}</strong><small>${host.role}</small></div>
      <button type="button" class="shop-host-talk" data-shop-talk="${id}" aria-label="Talk to ${host.name}">Talk</button></div>
      <p data-shop-line role="status" aria-live="polite">${escapeDialogText(lineFor(id, initial))}</p></div>
  </section>`;
}

export function setShopHostLine(root: ParentNode, id: ShopHostId, line: HostLine): void {
  const panel = root.querySelector<HTMLElement>(`[data-shop-host="${id}"]`);
  if (!panel) return;
  const output = panel.querySelector<HTMLElement>('[data-shop-line]');
  if (!output) throw new Error(`${hosts[id].name}'s dialogue is missing.`);
  output.textContent = lineFor(id, line);
}

export function bindShopHosts(root: HTMLElement): void {
  if (boundRoots.has(root)) return;
  boundRoots.add(root);
  root.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-shop-talk]');
    if (!button || !root.contains(button) || button.disabled) return;
    const id = button.dataset.shopTalk;
    const panel = button.closest<HTMLElement>('[data-shop-host]');
    if (!id || !isShopHostId(id) || !panel || panel.dataset.shopHost !== id) {
      throw new Error('Invalid shop host dialogue control.');
    }
    const output = panel.querySelector<HTMLElement>('[data-shop-line]');
    if (!output) throw new Error(`${hosts[id].name}'s dialogue is missing.`);
    const position = idlePositions.get(panel) ?? 0;
    output.textContent = hosts[id].idle[position % hosts[id].idle.length];
    idlePositions.set(panel, position + 1);
  });
}
