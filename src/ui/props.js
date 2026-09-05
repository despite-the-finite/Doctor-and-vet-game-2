/**
 * Room props, drawn.
 *
 * `data/rooms.js` and `data/shop.js` name each prop with an emoji. Those
 * strings are the authored data and stay exactly as they are — this module
 * is the lookup that turns one into artwork, so nothing in the game renders
 * a typed glyph.
 *
 * Furniture is paper with a tinted hard edge; equipment takes the world hue
 * with a darker tint of itself as its line. Living props are drawn by the
 * character renderers the rest of the game already uses, so the puppy in the
 * vet room is the same puppy a child treats in a case.
 */
import { humanSVG } from './human.js';
import { creatureSVG } from './creature.js';
import { toySVG } from './toy.js';
import { outline, star } from './parts.js';

const PAPER = '#FFF9F0';
const EDGE = '#E4D7C2';
const INK = '#2E2A44';

/** Living props come straight from the character system. */
const LIVING = {
  '🧑‍⚕️': () => humanSVG({ mood: 'happy', age: 'adult', coat: 'coat-white', scrubs: 'scrub-mint', hair: 'short', hairColor: 'hair-brown', skin: 'skin3', accessory: 'stetho' }),
  '🐕': () => creatureSVG({ species: 'dog', mood: 'happy' }),
  '🐈': () => creatureSVG({ species: 'cat', mood: 'calm' }),
  '🐇': () => creatureSVG({ species: 'bunny', mood: 'happy' }),
  '🐦': () => creatureSVG({ species: 'bird', mood: 'happy' }),
  '🧸': () => toySVG({ kind: 'teddy', mood: 'happy' }),
  '🤖': () => toySVG({ kind: 'robot', mood: 'calm' }),
  '🚗': () => toySVG({ kind: 'car', mood: 'happy' }),
};

/** Everything else is drawn here, in a 60x60 box. */
const DRAWN = {
  /* --- furniture: paper, with a tinted hard edge --- */
  '🛏️': (c) => `<rect x="6" y="26" width="48" height="22" rx="6" fill="${PAPER}"/>
    <rect x="6" y="44" width="48" height="6" rx="3" fill="${EDGE}"/>
    <rect x="8" y="18" width="18" height="12" rx="5" fill="${c}" opacity=".5"/>
    <rect x="4" y="22" width="6" height="28" rx="3" fill="${EDGE}"/>`,
  '🛌': (c) => DRAWN['🛏️'](c),
  '🪑': () => `<rect x="16" y="30" width="28" height="8" rx="4" fill="${PAPER}"/>
    <rect x="16" y="36" width="28" height="4" rx="2" fill="${EDGE}"/>
    <rect x="38" y="10" width="8" height="22" rx="4" fill="${PAPER}"/>
    <rect x="19" y="38" width="5" height="14" rx="2.5" fill="${EDGE}"/>
    <rect x="36" y="38" width="5" height="14" rx="2.5" fill="${EDGE}"/>`,
  '🪴': () => `<path d="M18 34 h24 l-4 18 h-16z" fill="#E8A05C" stroke="${outline('#E8A05C')}" stroke-width="2"/>
    <circle cx="30" cy="22" r="12" fill="#4FBF6E"/><circle cx="20" cy="28" r="8" fill="#5FCB7C"/>
    <circle cx="40" cy="28" r="8" fill="#5FCB7C"/>`,
  '🖼️': (c) => `<rect x="10" y="12" width="40" height="32" rx="6" fill="${PAPER}" stroke="${EDGE}" stroke-width="3"/>
    <circle cx="24" cy="24" r="5" fill="#FFD84D"/>
    <path d="M14 40 l10-12 8 8 6-6 8 10z" fill="${c}" opacity=".7"/>`,
  '🛎️': () => `<path d="M14 36 a16 16 0 0 1 32 0z" fill="${PAPER}" stroke="${EDGE}" stroke-width="2.6"/>
    <rect x="10" y="36" width="40" height="6" rx="3" fill="${EDGE}"/>
    <circle cx="30" cy="16" r="4" fill="#E8556D"/>`,
  '📦': () => `<rect x="10" y="22" width="40" height="26" rx="5" fill="#E8C08A" stroke="${outline('#E8C08A')}" stroke-width="2.2"/>
    <path d="M10 30 h40" stroke="${outline('#E8C08A')}" stroke-width="2.2"/>
    <rect x="26" y="22" width="8" height="26" fill="#FFD9A6"/>`,
  '🧰': (c) => `<rect x="10" y="26" width="40" height="22" rx="6" fill="${c}" stroke="${outline(c)}" stroke-width="2.4"/>
    <path d="M22 26 v-4 a8 8 0 0 1 16 0 v4" fill="none" stroke="${outline(c)}" stroke-width="3"/>
    <rect x="26" y="32" width="8" height="12" rx="3" fill="${PAPER}"/>
    <rect x="22" y="36" width="16" height="4" rx="2" fill="${PAPER}"/>`,
  '🧻': () => `<rect x="18" y="16" width="24" height="30" rx="6" fill="${PAPER}" stroke="${EDGE}" stroke-width="2.4"/>
    <ellipse cx="30" cy="16" rx="12" ry="4" fill="#F0EAE0"/><circle cx="30" cy="16" r="3.4" fill="${EDGE}"/>`,
  '💡': () => `<circle cx="30" cy="24" r="13" fill="#FFE08A" stroke="#D98A19" stroke-width="2.2"/>
    <rect x="24" y="36" width="12" height="9" rx="3" fill="#C9C4E0"/>
    <path d="M22 12 l-5-5 M38 12 l5-5 M30 8 v-6" stroke="#FFD05A" stroke-width="2.6" stroke-linecap="round"/>`,

  /* --- equipment: the world hue, lined with a darker tint of itself --- */
  '🩺': (c) => `<path d="M18 12 v14 a12 12 0 0 0 24 0 V12" fill="none" stroke="${c}" stroke-width="4.4" stroke-linecap="round"/>
    <circle cx="30" cy="42" r="9" fill="${PAPER}" stroke="${c}" stroke-width="4.4"/>`,
  '⚕️': (c) => `<circle cx="30" cy="30" r="20" fill="${PAPER}" stroke="${outline(c)}" stroke-width="2.6"/>
    <rect x="26" y="16" width="8" height="28" rx="4" fill="#E8556D"/>
    <rect x="16" y="26" width="28" height="8" rx="4" fill="#E8556D"/>`,
  '❤️': () => `<path d="M30 48 C10 34 8 22 15 16 c5-4 11-2 15 4 4-6 10-8 15-4 7 6 5 18-15 32z"
    fill="#FF5F8D" stroke="#D8558C" stroke-width="2.2"/>`,
  '🔬': (c) => `<rect x="12" y="46" width="36" height="6" rx="3" fill="${outline(c)}"/>
    <rect x="22" y="40" width="16" height="6" rx="3" fill="${PAPER}"/>
    <path d="M32 40 v-12 l10-10" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="44" cy="16" r="6" fill="${PAPER}" stroke="${c}" stroke-width="4"/>
    <rect x="20" y="34" width="20" height="4" rx="2" fill="${c}"/>`,
  '🧪': (c) => `<path d="M24 10 h12 v16 l9 20 a5 5 0 0 1-4.6 7H19.6a5 5 0 0 1-4.6-7l9-20z"
      fill="${PAPER}" stroke="${outline(c)}" stroke-width="2.6"/>
    <path d="M19 38 h22 l3.4 8 a5 5 0 0 1-4.6 7H20.6a5 5 0 0 1-4.6-7z" fill="${c}" opacity=".75"/>`,
  '🧫': (c) => `<ellipse cx="30" cy="32" rx="20" ry="14" fill="${PAPER}" stroke="${outline(c)}" stroke-width="2.6"/>
    <circle cx="24" cy="30" r="4" fill="${c}" opacity=".8"/><circle cx="35" cy="34" r="3" fill="${c}" opacity=".6"/>
    <circle cx="33" cy="27" r="2.4" fill="${c}" opacity=".7"/>`,
  '🩻': (c) => `<rect x="10" y="10" width="40" height="40" rx="8" fill="#1F5E68"/>
    <path d="M30 18 v24 M22 24 h16 M24 32 h12" stroke="#BDE9E5" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="30" cy="16" r="4" fill="#BDE9E5"/>`,
  '🧲': () => `<path d="M14 40 V26 a16 16 0 0 1 32 0 v14 h-10 V26 a6 6 0 0 0-12 0 v14z"
      fill="#E8556D" stroke="#B93450" stroke-width="2.4"/>
    <rect x="14" y="40" width="10" height="8" fill="#C9C4E0"/><rect x="36" y="40" width="10" height="8" fill="#C9C4E0"/>`,
  '🖥️': (c) => `<rect x="8" y="12" width="44" height="30" rx="6" fill="${PAPER}" stroke="${EDGE}" stroke-width="3"/>
    <rect x="13" y="17" width="34" height="20" rx="4" fill="${c}" opacity=".35"/>
    <path d="M16 30 l6-8 5 6 4-5 6 10" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="24" y="42" width="12" height="7" fill="${EDGE}"/><rect x="16" y="48" width="28" height="5" rx="2.5" fill="${EDGE}"/>`,
  '🦴': () => `<path d="M14 34 a7 7 0 1 1 8-9 l16 0 a7 7 0 1 1 8 9 a7 7 0 1 1-8 9 l-16 0 a7 7 0 1 1-8-9z"
    fill="${PAPER}" stroke="${EDGE}" stroke-width="2.6"/>`,
  '🪛': (c) => `<rect x="26" y="10" width="8" height="20" rx="3" fill="${c}"/>
    <rect x="27.5" y="28" width="5" height="18" rx="2" fill="#C9C4E0"/>
    <path d="M27 46 h6 l-3 5z" fill="#8C86AD"/>`,
  '🚑': () => `<rect x="8" y="24" width="44" height="16" rx="6" fill="${PAPER}" stroke="${EDGE}" stroke-width="2.6"/>
    <rect x="14" y="29" width="6" height="3" rx="1.5" fill="#E8556D"/><rect x="15.5" y="27.5" width="3" height="6" rx="1.5" fill="#E8556D"/>
    <circle cx="18" cy="42" r="5" fill="${INK}"/><circle cx="42" cy="42" r="5" fill="${INK}"/>
    <rect x="26" y="18" width="8" height="5" rx="2.5" fill="#5EC8F0"/>`,
  '🚁': () => `<ellipse cx="28" cy="34" rx="15" ry="9" fill="#E8556D"/>
    <path d="M42 32 q12 1 16 5 q-8 2-16 1z" fill="#B93450"/>
    <circle cx="24" cy="33" r="5" fill="#DFF6F4"/>
    <rect x="6" y="16" width="46" height="4" rx="2" fill="${INK}"/>
    <rect x="26" y="19" width="4" height="6" rx="2" fill="#B93450"/>`,
};

/** A prop's artwork. Living props keep their own viewBox; the rest are 60x60. */
export function propMarkup(emoji, { accent = '#2FA8A0' } = {}) {
  if (LIVING[emoji]) return LIVING[emoji]();
  const draw = DRAWN[emoji];
  const inner = draw
    ? draw(accent)
    : star(30, 30, 14, { fill: accent, stroke: outline(accent) });
  return `<svg viewBox="0 0 60 60" style="width:100%;height:100%;display:block" aria-hidden="true">${inner}</svg>`;
}

/** True when this prop is a character rather than an object. */
export function isLivingProp(emoji) { return !!LIVING[emoji]; }
