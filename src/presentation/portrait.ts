import { type Starter } from '../content/starters';

export function portrait(starter: Starter): string {
  const hair = { ember: '#b85e38', tide: '#428cbb', sprout: '#679350' }[starter.id];
  const motif = { ember: '#c95144', tide: '#428cbb', sprout: '#679350' }[starter.id];
  const weapon = {
    ember: '<path d="M238 204 L251 63 L264 57 L270 72 L254 207Z" fill="#ba9266"/><path d="M228 204 L269 210 M245 211 L242 238" stroke="#735338" stroke-width="9"/>',
    tide: '<path d="M247 242 L266 53" stroke="#a8875d" stroke-width="6"/><path d="M266 33 L253 62 L266 58 L277 65Z" fill="#b9c8d2"/>',
    sprout: '<path d="M255 75 Q309 143 249 219" fill="none" stroke="#aa8056" stroke-width="8"/><path d="M255 75 L249 219" stroke="#ded4b6" stroke-width="2"/>',
  }[starter.id];
  return `<svg viewBox="0 0 360 270" role="img" aria-label="${starter.name}, ${starter.element.toLowerCase()} companion with a ${starter.weapon.toLowerCase()}">
    <circle cx="180" cy="143" r="102" fill="${starter.color}" opacity=".07"/>
    <circle cx="180" cy="143" r="88" fill="none" stroke="${starter.color}" opacity=".22"/>
    <path d="M102 191 Q70 151 99 115 M279 162 Q299 127 280 101" fill="none" stroke="${starter.color}" stroke-width="3" opacity=".5"/>
    ${weapon}
    <path d="M151 212 L148 238 L165 238 L175 213 M185 213 L195 238 L212 238 L204 209" fill="#735645" stroke="#302c32" stroke-width="3"/>
    <path d="M154 161 L139 205 Q177 224 213 204 L203 159Z" fill="#e3d6b3" stroke="#4d4142" stroke-width="3"/>
    <path d="M152 171 L132 189 M206 171 L228 188" stroke="#e3d6b3" stroke-width="14" stroke-linecap="round"/>
    <path d="M151 165 Q179 180 205 162 L206 177 L183 184 L157 177Z" fill="${motif}"/>
    <path d="M190 179 Q217 183 236 166 L219 194 L191 190Z" fill="${motif}" opacity=".9"/>
    <ellipse cx="180" cy="123" rx="46" ry="43" fill="#f1d7b9" stroke="#4d4142" stroke-width="3"/>
    <path d="M134 125 Q124 77 167 71 Q216 63 227 113 L213 126 L208 99 L192 113 L180 98 L157 119 L151 103Z" fill="${hair}" stroke="#4d4142" stroke-width="3"/>
    <ellipse cx="162" cy="129" rx="5" ry="10" fill="#253447"/>
    <ellipse cx="197" cy="129" rx="5" ry="10" fill="#253447"/>
    <circle cx="163" cy="126" r="2" fill="#fff"/><circle cx="198" cy="126" r="2" fill="#fff"/>
    <path d="M91 78 L95 69 L99 78 L95 87Z M280 220 L284 211 L288 220 L284 229Z" fill="${starter.color}"/>
  </svg>`;
}
