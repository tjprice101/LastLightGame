/**
 * Minimal keyed DOM morph: updates `from` in place to match `to` so unchanged nodes (artwork images,
 * focused controls, scroll containers) survive. Children are matched by the key attributes below, then by tag order.
 */
const keyAttributes = ['data-loadout-conduit', 'data-loadout-slot', 'id'];

function keyOf(node: Node): string | null {
  if (!(node instanceof Element)) return null;
  for (const attribute of keyAttributes) {
    const value = node.getAttribute(attribute);
    if (value !== null && value !== '') return `${node.nodeName}|${attribute}|${value}`;
  }
  return null;
}

function syncAttributes(from: Element, to: Element): void {
  for (const { name } of Array.from(from.attributes)) if (!to.hasAttribute(name)) from.removeAttribute(name);
  for (const { name, value } of Array.from(to.attributes)) if (from.getAttribute(name) !== value) from.setAttribute(name, value);
}

function morphChildren(from: Element, to: Element): void {
  const oldChildren = Array.from(from.childNodes);
  const keyed = new Map<string, Node>();
  oldChildren.forEach(child => { const key = keyOf(child); if (key) keyed.set(key, child); });
  const used = new Set<Node>();
  Array.from(to.childNodes).forEach((next, index) => {
    const key = keyOf(next);
    let match: Node | undefined = key ? keyed.get(key) : oldChildren.find(child => !used.has(child) && !keyOf(child) && child.nodeName === next.nodeName);
    if (match && used.has(match)) match = undefined;
    let node: Node;
    if (match) {
      used.add(match);
      morphNode(match, next);
      node = match;
    } else {
      node = from.ownerDocument.importNode(next, true);
    }
    const current = from.childNodes[index] ?? null;
    if (current !== node) from.insertBefore(node, current);
  });
  oldChildren.forEach(child => { if (!used.has(child) && child.parentNode === from) from.removeChild(child); });
}

function morphNode(from: Node, to: Node): void {
  if (from.nodeType !== Node.ELEMENT_NODE) {
    if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue;
    return;
  }
  const source = from as Element;
  const target = to as Element;
  syncAttributes(source, target);
  if (source instanceof HTMLInputElement) return;
  morphChildren(source, target);
  if (source instanceof HTMLSelectElement && target instanceof HTMLSelectElement) {
    const chosen = Array.from(target.options).find(option => option.hasAttribute('selected')) ?? target.options[0];
    source.value = chosen?.value ?? '';
  }
}

/** Morphs `element` (kept in place, same identity) to match the single root element in `html`. */
export function morphElement(element: Element, html: string): void {
  const template = element.ownerDocument.createElement('template');
  template.innerHTML = html.trim();
  const next = template.content.firstElementChild;
  if (!next || next.nodeName !== element.nodeName) throw new Error('Morph target does not match the rendered element.');
  morphNode(element, next);
}
