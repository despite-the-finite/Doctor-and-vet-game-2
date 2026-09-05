/**
 * Drawn icons.
 *
 * There is no emoji in the rendered game and no icon font: every mark here is
 * inline SVG, stroked 3–5.5px with round caps and joins, filled in a world
 * hue with a darker tint of the same hue as its line.
 *
 * `icon(name)` returns markup for a 40x40 box unless the icon says otherwise.
 * Anything unknown falls back to a friendly dot rather than a broken glyph.
 */
import { star } from './parts.js';

const INK = '#4A4667';

const svg = (inner, { box = '0 0 40 40', size = 30, cls = '' } = {}) =>
  `<svg viewBox="${box}" class="${cls}" style="width:${size}px;height:${size}px;display:block" aria-hidden="true">${inner}</svg>`;

const ICONS = {
  /* ---- navigation & chrome ---- */
  back: (c = INK) => `<path d="M23 11 L14 20 L23 29" fill="none" stroke="${c}" stroke-width="5"
    stroke-linecap="round" stroke-linejoin="round"/>`,

  soundOn: (c = INK) => `<path d="M10 15 h6 l8-6 v22 l-8-6 h-6 z" fill="${c}"/>
    <path d="M29 14 q5 6 0 12" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`,
  soundOff: (c = INK) => `<path d="M10 15 h6 l8-6 v22 l-8-6 h-6 z" fill="${c}"/>
    <path d="M28 15 l8 10 M36 15 l-8 10" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`,

  voiceOn: (c = INK) => `<rect x="15" y="7" width="10" height="18" rx="5" fill="${c}"/>
    <path d="M12 22 a8 8 0 0 0 16 0" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M20 30 v4" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`,
  voiceOff: (c = INK) => `<rect x="15" y="7" width="10" height="18" rx="5" fill="${c}" opacity=".45"/>
    <path d="M12 22 a8 8 0 0 0 16 0" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" opacity=".45"/>
    <path d="M9 9 l22 22" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`,

  palette: () => `<path d="M20 6 a14 14 0 1 0 4 27.5 c-3-1-2-5 1-5 h4 a7 7 0 0 0 5-12 A14 14 0 0 0 20 6z"
      fill="#FFF9F0" stroke="${INK}" stroke-width="2.6"/>
    <circle cx="14" cy="15" r="2.6" fill="#E8556D"/><circle cx="22" cy="12" r="2.6" fill="#FFB13B"/>
    <circle cx="28" cy="18" r="2.6" fill="#2FA8A0"/><circle cx="14" cy="24" r="2.6" fill="#A87BF0"/>`,

  lock: (c = '#B4AC9C') => `<rect x="10" y="18" width="20" height="15" rx="5" fill="${c}"/>
    <path d="M15 18 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="20" cy="25" r="2.6" fill="#FFF9F0"/>`,

  play: (c = '#6B4300') => `<path d="M15 11 L30 20 L15 29 z" fill="${c}"/>`,

  tick: (c = '#2E7D4F') => `<path d="M11 21 l6 6 12-14" fill="none" stroke="${c}" stroke-width="5"
    stroke-linecap="round" stroke-linejoin="round"/>`,

  /* ---- currencies ---- */
  star: () => star(12, 12, 9.4, { width: 1.4 }),
  kindness: () => `<path d="M12 20.5 C4 14 5.5 7 10 7 c2.2 0 3.4 1.4 2 3 1.4-1.6 4.6-3 6.6-1
      C22 11 20 16 12 20.5z" fill="#FF5F8D" stroke="#D8558C" stroke-width="1.2"/>`,
  coin: () => `<circle cx="12" cy="12" r="9" fill="#FFC463" stroke="#D98A19" stroke-width="1.6"/>
    <circle cx="12" cy="12" r="5.4" fill="#FFE0A3"/>`,

  /* ---- the three worlds ---- */
  doctor: (c = '#FFF9F0') => `<path d="M13 9 v13 a7 7 0 0 0 14 0 V9" fill="none" stroke="${c}"
      stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="20" cy="30" r="6" fill="none" stroke="${c}" stroke-width="3.6"/>`,
  vet: (c = '#FFF9F0') => `<ellipse cx="20" cy="26" rx="8" ry="7" fill="${c}"/>
    <ellipse cx="11" cy="16" rx="3.4" ry="4.6" fill="${c}"/><ellipse cx="17" cy="12" rx="3.4" ry="4.8" fill="${c}"/>
    <ellipse cx="24" cy="12" rx="3.4" ry="4.8" fill="${c}"/><ellipse cx="30" cy="16" rx="3.4" ry="4.6" fill="${c}"/>`,
  toy: (c = '#FFF9F0') => `<circle cx="20" cy="21" r="10" fill="${c}"/>
    <circle cx="11" cy="12" r="5" fill="${c}"/><circle cx="29" cy="12" r="5" fill="${c}"/>
    <circle cx="16" cy="19" r="1.8" fill="#8F5FD6"/><circle cx="24" cy="19" r="1.8" fill="#8F5FD6"/>
    <path d="M17 25 q3 3 6 0" fill="none" stroke="#8F5FD6" stroke-width="2" stroke-linecap="round"/>`,

  /* ---- shop / bag ---- */
  bag: () => `<path d="M7 13 h26 l-3 21 h-20z" fill="#FFB13B" stroke="#D98A19" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M14 13 v-3 a6 6 0 0 1 12 0 v3" fill="none" stroke="#D98A19" stroke-width="3"/>`,
  hint: () => `<circle cx="20" cy="17" r="9" fill="#FFE08A" stroke="#D98A19" stroke-width="2.2"/>
    <rect x="16" y="26" width="8" height="6" rx="2.4" fill="#C9C4E0"/>
    <path d="M20 34 h0" stroke="#8C86AD" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M13 8 l-3-3 M27 8 l3-3 M20 5 v-4" stroke="#FFD05A" stroke-width="2.6" stroke-linecap="round"/>`,

  'magnify-small': (c = INK) => `<circle cx="18" cy="18" r="8" fill="none" stroke="${c}" stroke-width="3.4"/>
    <path d="M24 24 l8 8" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
  'magnify-big': (c = INK) => `<circle cx="18" cy="18" r="12" fill="none" stroke="${c}" stroke-width="3.4"/>
    <path d="M27 27 l6 6" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
    <path d="M13 18 h10 M18 13 v10" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`,

  dice: () => `<rect x="8" y="8" width="24" height="24" rx="7" fill="#FFF9F0" stroke="#D9CFC0" stroke-width="2.6"/>
    <circle cx="15" cy="15" r="2.4" fill="#4A4667"/><circle cx="25" cy="15" r="2.4" fill="#4A4667"/>
    <circle cx="20" cy="20" r="2.4" fill="#4A4667"/>
    <circle cx="15" cy="25" r="2.4" fill="#4A4667"/><circle cx="25" cy="25" r="2.4" fill="#4A4667"/>`,

  kit: () => `<rect x="8" y="14" width="24" height="20" rx="6" fill="#E8556D"/>
    <path d="M14 14 v-3 a6 6 0 0 1 12 0 v3" fill="none" stroke="#E8556D" stroke-width="3.4"/>
    <rect x="17" y="20" width="6" height="10" rx="3" fill="#FFF9F0"/>
    <rect x="15" y="23" width="10" height="4" rx="2" fill="#FFF9F0"/>`,
};

/** Markup for a named icon. */
export function icon(name, { size = 30, color = null, box = '0 0 40 40' } = {}) {
  const draw = ICONS[name];
  if (!draw) return svg(`<circle cx="20" cy="20" r="8" fill="${INK}" opacity=".3"/>`, { size, box });
  const currency = name === 'star' || name === 'coin' || name === 'kindness';
  return svg(color ? draw(color) : draw(), { size, box: currency ? '0 0 24 24' : box });
}

/** A row of `total` stars with `earned` of them filled. */
export function starRow(earned, total = 3, size = 26) {
  let out = '';
  for (let i = 0; i < total; i++) {
    const on = i < earned;
    out += svg(star(12, 12, 9.4, {
      fill: on ? '#FFD84D' : '#E4DED2',
      stroke: on ? '#E0AE12' : '#CFC7B8',
      width: 1.4,
    }), { size, box: '0 0 24 24', cls: on ? 'lh-star-stamp' : '' });
  }
  return `<span style="display:inline-flex;gap:5px">${out}</span>`;
}

export { ICONS };
