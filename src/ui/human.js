/**
 * Parametric human character (the hero and every people-patient).
 *
 * Returns an SVG string on a 200x240 canvas. Invisible `data-spot` circles
 * mark the places a tool can be dropped, so the case engine only ever needs
 * to say "the chest" and this file decides where that is.
 */
import { eyes, mouth, blush, moodAura } from './faces.js';
import { SKIN_TONES, HAIR_COLORS, SCRUB_COLORS, COAT_COLORS, SHOE_COLORS } from '../data/characters.js';

const byId = (list, id, fallback) => list.find((x) => x.id === id) || fallback || list[0];

const HEAD = { x: 100, y: 80, r: 40 };

/** A hairline outline is what makes flat shapes read as separate limbs. */
const OUTLINE = 'stroke="rgba(44,51,80,.13)" stroke-width="2"';

/** Darken a hex colour by `amount` (0–1) — used for the far arm and leg. */
function dim(hex, amount) {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.round(v * amount));
  const r = c((n >> 16) & 255), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function humanSVG(opts = {}) {
  const {
    skin = 'skin2', hair = 'curly', hairColor = 'hair-brown', glasses = 'none',
    scrubs = 'scrub-blue', coat = 'coat-white', shoes = 'shoe-white',
    accessory = 'none', extras = [], mood = 'happy', age = 'child',
    idle = true,
  } = opts;

  const sk = byId(SKIN_TONES, skin);
  const hc = byId(HAIR_COLORS, hairColor);
  const sc = byId(SCRUB_COLORS, scrubs);
  const co = byId(COAT_COLORS, coat);
  const sh = byId(SHOE_COLORS, shoes);

  // Adults stand a little taller; toddlers are rounder and shorter.
  const scale = age === 'adult' ? 1 : age === 'toddler' ? 0.9 : 0.96;
  const headR = age === 'toddler' ? HEAD.r * 1.1 : HEAD.r;
  const acc = [accessory, ...extras].filter((a) => a && a !== 'none');

  const shoeFill = sh.value === 'rainbow' ? 'url(#rainbowShoe)' : sh.value;
  // Sleeves match the coat when one is worn, otherwise the scrubs.
  const armFill = co.value || sc.value;

  return `
<svg viewBox="0 0 200 250" class="charsvg" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="rainbowShoe" x1="0" x2="1">
      <stop offset="0%" stop-color="#ff7a6b"/><stop offset="35%" stop-color="#ffc844"/>
      <stop offset="70%" stop-color="#3fd0a6"/><stop offset="100%" stop-color="#a97bf0"/>
    </linearGradient>
    <radialGradient id="cheekGlow"><stop offset="0%" stop-color="#fff" stop-opacity=".5"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>

  <ellipse cx="100" cy="243" rx="46" ry="7" fill="rgba(44,51,80,.16)"/>

  <g transform="translate(100 128) scale(${scale}) translate(-100 -128)" class="${idle ? 'char-idle' : ''}">
    ${acc.includes('cape') ? cape(mood) : ''}

    <!-- legs + shoes -->
    <rect x="79" y="186" width="17" height="36" rx="8.5" fill="${dim(sc.value, .88)}" ${OUTLINE}/>
    <rect x="104" y="186" width="17" height="36" rx="8.5" fill="${sc.value}" ${OUTLINE}/>
    <rect x="72" y="214" width="28" height="17" rx="8.5" fill="${shoeFill}" ${OUTLINE}/>
    <rect x="100" y="214" width="28" height="17" rx="8.5" fill="${shoeFill}" ${OUTLINE}/>

    <!-- arms (behind the torso so the shoulder line stays clean) -->
    <g class="arm-l">
      <rect x="47" y="130" width="19" height="58" rx="9.5" fill="${armFill}" ${OUTLINE}/>
      <circle cx="56.5" cy="192" r="11" fill="${sk.value}" ${OUTLINE}/>
    </g>
    <g class="arm-r">
      <rect x="134" y="130" width="19" height="58" rx="9.5" fill="${armFill}" ${OUTLINE}/>
      <circle cx="143.5" cy="192" r="11" fill="${sk.value}" ${OUTLINE}/>
    </g>

    <!-- torso -->
    <path d="M 68 134 q 0 -20 32 -20 q 32 0 32 20 l 4 58 q -36 8 -72 0 z" fill="${sc.value}" ${OUTLINE}/>
    <path d="M 68 134 q 0 -20 32 -20 q 32 0 32 20 l 1 11 q -33 7 -66 0 z" fill="rgba(255,255,255,.2)"/>

    ${co.value ? labCoat(co.value) : ''}

    ${acc.includes('badge') ? `<text x="76" y="152" font-size="18">🏅</text>` : ''}
    ${acc.includes('flower') ? `<text x="76" y="152" font-size="18">🌸</text>` : ''}
    ${acc.includes('stetho') ? stethoscope() : ''}

    <!-- neck -->
    <rect x="90" y="106" width="20" height="18" rx="8" fill="${sk.shade}"/>

    <!-- head -->
    <g class="char-head">
      ${hairBack(hair, hc.value, headR)}
      <circle cx="${HEAD.x}" cy="${HEAD.y}" r="${headR}" fill="${sk.value}"/>
      <ellipse cx="${HEAD.x}" cy="${HEAD.y - headR * 0.5}" rx="${headR * 0.7}" ry="${headR * 0.4}" fill="url(#cheekGlow)"/>
      <!-- ears -->
      <ellipse cx="${HEAD.x - headR + 2}" cy="${HEAD.y + 4}" rx="8" ry="10" fill="${sk.value}"/>
      <ellipse cx="${HEAD.x + headR - 2}" cy="${HEAD.y + 4}" rx="8" ry="10" fill="${sk.value}"/>

      <g transform="translate(${HEAD.x} ${HEAD.y})">
        ${eyes(mood, { w: 15, y: -2 })}
        ${blush(mood, { w: 27, y: 13 })}
        ${mouth(mood, { y: 17 })}
        ${acc.includes('freckles') ? freckles() : ''}
        ${glasses !== 'none' ? glassesSVG(glasses) : ''}
        ${moodAura(mood, { y: -58 })}
      </g>

      ${hairFront(hair, hc.value, headR)}
      ${acc.includes('headband') ? `<path d="M 62 62 q 38 -22 76 0" stroke="#ff7aa8" stroke-width="7" fill="none" stroke-linecap="round"/><text x="140" y="58" font-size="18">🎀</text>` : ''}
      ${acc.includes('headmirror') ? `<circle cx="100" cy="44" r="12" fill="#e8edf7" stroke="#9aa6c4" stroke-width="3"/><circle cx="100" cy="44" r="4" fill="#5d6688"/><path d="M 64 52 q 36 -20 72 0" stroke="#5d6688" stroke-width="5" fill="none"/>` : ''}
      ${acc.includes('crown') ? `<text x="100" y="36" font-size="34" text-anchor="middle">👑</text>` : ''}
    </g>
  </g>

  <!-- interaction hotspots (invisible, but findable by the case engine) -->
  <g class="spots" fill="transparent">
    <circle data-spot="head"  cx="100" cy="62"  r="26"/>
    <circle data-spot="eye"   cx="100" cy="76"  r="20"/>
    <circle data-spot="ear"   cx="62"  cy="84"  r="16"/>
    <circle data-spot="mouth" cx="100" cy="100" r="16"/>
    <circle data-spot="chest" cx="100" cy="142" r="26"/>
    <circle data-spot="tummy" cx="100" cy="176" r="24"/>
    <circle data-spot="arm"   cx="56"  cy="160" r="20"/>
    <circle data-spot="hand"  cx="56"  cy="192" r="16"/>
    <circle data-spot="back"  cx="100" cy="150" r="24"/>
    <circle data-spot="knee"  cx="88"  cy="206" r="18"/>
    <circle data-spot="foot"  cx="88"  cy="224" r="16"/>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ parts */

function labCoat(color) {
  return `
    <path d="M 65 136 q 2 -21 19 -25 l 16 12 l 16 -12 q 17 4 19 25 l 5 57 q -19 6 -28 5 l -2 -53 l -10 8 l -10 -8 l -2 53 q -9 1 -28 -5 z"
      fill="${color}" stroke="rgba(44,51,80,.14)" stroke-width="2"/>
    <circle cx="90" cy="158" r="2.6" fill="rgba(44,51,80,.22)"/>
    <circle cx="90" cy="174" r="2.6" fill="rgba(44,51,80,.22)"/>`;
}

function stethoscope() {
  return `
    <path d="M 84 118 q -10 34 4 48 q 12 12 24 0 q 14 -14 4 -48"
      stroke="#3a4a6b" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="172" r="9" fill="#c8d3e8" stroke="#3a4a6b" stroke-width="3"/>`;
}

function cape(mood) {
  return `<path d="M 68 122 q 32 -14 64 0 l 26 96 q -58 16 -116 0 z" fill="#ff5f8d" opacity=".92">
      <animate attributeName="d"
        values="M 68 122 q 32 -14 64 0 l 26 96 q -58 16 -116 0 z;
                M 68 122 q 32 -14 64 0 l 32 94 q -58 20 -122 2 z;
                M 68 122 q 32 -14 64 0 l 26 96 q -58 16 -116 0 z"
        dur="3.4s" repeatCount="indefinite"/>
    </path>`;
}

function freckles() {
  return `<g fill="rgba(150,90,50,.5)">
    <circle cx="-22" cy="10" r="1.8"/><circle cx="-15" cy="14" r="1.6"/><circle cx="-27" cy="16" r="1.5"/>
    <circle cx="22" cy="10" r="1.8"/><circle cx="15" cy="14" r="1.6"/><circle cx="27" cy="16" r="1.5"/>
  </g>`;
}

function glassesSVG(kind) {
  const frame = '#3a4a6b';
  if (kind === 'star') {
    return `<g><text x="-15" y="4" font-size="24" text-anchor="middle">⭐</text>
      <text x="15" y="4" font-size="24" text-anchor="middle">⭐</text>
      <path d="M -5 -2 h 10" stroke="${frame}" stroke-width="3"/></g>`;
  }
  const shape = kind === 'square'
    ? `<rect x="-27" y="-13" width="22" height="20" rx="5" fill="rgba(255,255,255,.35)" stroke="${frame}" stroke-width="3.4"/>
       <rect x="5" y="-13" width="22" height="20" rx="5" fill="rgba(255,255,255,.35)" stroke="${frame}" stroke-width="3.4"/>`
    : `<circle cx="-16" cy="-2" r="12" fill="rgba(255,255,255,.35)" stroke="${frame}" stroke-width="3.4"/>
       <circle cx="16" cy="-2" r="12" fill="rgba(255,255,255,.35)" stroke="${frame}" stroke-width="3.4"/>`;
  return `<g>${shape}<path d="M -5 -2 h 10" stroke="${frame}" stroke-width="3.4"/></g>`;
}

/* ------------------------------------------------------------------- hair */

function hairBack(style, color, r) {
  const cx = HEAD.x, cy = HEAD.y;
  switch (style) {
    case 'long':
      // Two strands falling behind the shoulders — a single slab reads as a
      // cape rather than as hair.
      return `<g fill="${color}">
        <path d="M ${cx - r + 2} ${cy - 14} q -22 12 -20 54 q 2 22 14 22 q 10 0 10 -12 q -8 -30 4 -58 z"/>
        <path d="M ${cx + r - 2} ${cy - 14} q 22 12 20 54 q -2 22 -14 22 q -10 0 -10 -12 q 8 -30 -4 -58 z"/>
        <path d="M ${cx - r - 2} ${cy - 8} a ${r + 2} ${r + 2} 0 0 1 ${(r + 2) * 2} 0 q -6 -30 -${r + 2} -30 q -${r + 2} 0 -${r + 2} 30 z"/>
      </g>`;
    case 'ponytail':
      return `<g fill="${color}">
        <path d="M ${cx + r - 6} ${cy - 12} q 30 8 26 46 q -4 22 -20 18 q 12 -16 4 -36 z"/>
        <circle cx="${cx + r - 2}" cy="${cy - 16}" r="8"/>
      </g>`;
    case 'braids':
      return `<g fill="${color}">
        <path d="M ${cx - r - 2} ${cy - 4} q -14 40 -4 56 q 12 6 16 -6 q -10 -22 -2 -46 z"/>
        <path d="M ${cx + r + 2} ${cy - 4} q 14 40 4 56 q -12 6 -16 -6 q 10 -22 2 -46 z"/>
        <circle cx="${cx - r - 6}" cy="${cy + 54}" r="5" fill="#ff7aa8"/>
        <circle cx="${cx + r + 6}" cy="${cy + 54}" r="5" fill="#ff7aa8"/></g>`;
    case 'afro':
      return `<circle cx="${cx}" cy="${cy - 6}" r="${r + 15}" fill="${color}"/>`;
    case 'hijab':
      // A scarf that drapes onto the shoulders and stops there.
      return `<path d="M ${cx - r - 6} ${cy - 6} q -8 46 6 56 q 40 12 80 0 q 14 -10 6 -56 z" fill="${color}"/>`;
    default:
      return '';
  }
}

function hairFront(style, color, r) {
  const cx = HEAD.x, cy = HEAD.y;
  const cap = (d) => `<path d="${d}" fill="${color}"/>`;
  switch (style) {
    case 'buzz':
      return cap(`M ${cx - r} ${cy - 8} a ${r} ${r} 0 0 1 ${r * 2} 0 q -${r} -14 -${r * 2} 0 z`);
    case 'short':
      return cap(`M ${cx - r - 1} ${cy - 4} a ${r + 1} ${r + 1} 0 0 1 ${(r + 1) * 2} 0 q -10 -26 -${r + 1} -26 q -${r + 1} 0 -${r + 1} 26 z`);
    case 'curly':
      return `<g fill="${color}">
        <circle cx="${cx - 28}" cy="${cy - 24}" r="16"/><circle cx="${cx - 8}" cy="${cy - 34}" r="18"/>
        <circle cx="${cx + 14}" cy="${cy - 30}" r="17"/><circle cx="${cx + 32}" cy="${cy - 14}" r="14"/>
        <circle cx="${cx - 36}" cy="${cy - 6}" r="13"/></g>`;
    case 'bun':
      return `<circle cx="${cx}" cy="${cy - r - 12}" r="16" fill="${color}"/>` +
        cap(`M ${cx - r - 1} ${cy - 6} a ${r + 1} ${r + 1} 0 0 1 ${(r + 1) * 2} 0 q -12 -28 -${r + 1} -28 q -${r + 1} 0 -${r + 1} 28 z`);
    case 'afro':
      return '';
    case 'hijab':
      return `<path d="M ${cx - r - 8} ${cy - 2} q 8 -46 ${r + 8} -46 q ${r + 8} 0 ${r + 8} 46 q -${r + 8} -20 -${(r + 8) * 2} 0 z" fill="${color}"/>`;
    case 'ponytail':
    case 'long':
    case 'braids':
    default:
      return cap(`M ${cx - r - 1} ${cy - 2} a ${r + 1} ${r + 1} 0 0 1 ${(r + 1) * 2} 0 q -8 -30 -${r + 1} -30 q -${r + 1} 0 -${r + 1} 30 z`);
  }
}
