/**
 * Parametric animal patients.
 *
 * One body plan (sitting, front-facing) plus swappable ears / snouts / tails /
 * extras covers every species in the game. Add an entry to SPECIES and a new
 * animal exists — no new drawing code required.
 */
import { eyes, mouth, blush, moodAura } from './faces.js';

export const SPECIES = {
  puppy:     { fur: '#e8b06a', belly: '#fde9cf', ears: 'floppy',  snout: 'dog',  tail: 'wag',    nose: '#4a3527', sound: 'woof',   emoji: '🐶' },
  dog:       { fur: '#b98450', belly: '#f2ddc2', ears: 'floppy',  snout: 'dog',  tail: 'wag',    nose: '#3a2a1e', sound: 'woof',   emoji: '🐕' },
  cat:       { fur: '#f0a45c', belly: '#fff0dc', ears: 'pointy',  snout: 'cat',  tail: 'fluffy', nose: '#ff9aa8', sound: 'meow',   emoji: '🐱', stripes: true },
  bunny:     { fur: '#f5f1ea', belly: '#ffffff', ears: 'long',    snout: 'cat',  tail: 'puff',   nose: '#ffa0b4', sound: 'squeak', emoji: '🐰' },
  bird:      { fur: '#7fd1f5', belly: '#e6f7ff', ears: 'none',    snout: 'beak', tail: 'feather',nose: '#ffb445', sound: 'chirp',  emoji: '🐦', wings: true, small: true },
  parrot:    { fur: '#5fd39a', belly: '#ffe9a8', ears: 'none',    snout: 'beak', tail: 'feather',nose: '#ff8b4a', sound: 'chirp',  emoji: '🦜', wings: true, small: true, crest: '#ff6b7a' },
  fox:       { fur: '#f08a4b', belly: '#fff1e2', ears: 'pointy',  snout: 'dog',  tail: 'bushy',  nose: '#3a2a1e', sound: 'woof',   emoji: '🦊', tips: '#ffffff' },
  owl:       { fur: '#b08a63', belly: '#f4e3cd', ears: 'tuft',    snout: 'beak', tail: 'none',   nose: '#ffb445', sound: 'chirp',  emoji: '🦉', wings: true, bigEyes: true },
  turtle:    { fur: '#7bd39a', belly: '#d8f5e2', ears: 'none',    snout: 'cat',  tail: 'none',   nose: '#3f7a55', sound: 'squeak', emoji: '🐢', shell: '#4f9e6c' },
  hamster:   { fur: '#f0c48a', belly: '#fff3e0', ears: 'round',   snout: 'cat',  tail: 'puff',   nose: '#e08fa0', sound: 'squeak', emoji: '🐹', small: true },
  guineapig: { fur: '#d6a06a', belly: '#fff0da', ears: 'round',   snout: 'cat',  tail: 'none',   nose: '#e08fa0', sound: 'squeak', emoji: '🐹', small: true },
  raccoon:   { fur: '#9aa4b8', belly: '#e5e9f2', ears: 'round',   snout: 'dog',  tail: 'bushy',  nose: '#3a2a1e', sound: 'squeak', emoji: '🦝', mask: true },
  deer:      { fur: '#d0a276', belly: '#fbeada', ears: 'pointy',  snout: 'dog',  tail: 'puff',   nose: '#3a2a1e', sound: 'squeak', emoji: '🦌', antlers: true, spots: true },
  duck:      { fur: '#fff2c9', belly: '#ffffff', ears: 'none',    snout: 'beak', tail: 'feather',nose: '#ffa63d', sound: 'chirp',  emoji: '🦆', wings: true, small: true },

  /* ------------------------------------------------------------ soft toys
     The Toy Doctor's patients. Same body plan as the animals — a toy IS a
     round sitting creature — plus `toy: true`, which swaps the eyes for
     sewn-on buttons and adds a seam and a patch. `sound` stays a squeak
     because that is genuinely what they do. */
  teddy:     { fur: '#c08a5e', belly: '#f0d9bd', ears: 'round',   snout: 'dog',  tail: 'none',   nose: '#4a3527', sound: 'squeak', emoji: '🧸', toy: true },
  plushbun:  { fur: '#f6dce8', belly: '#fff4f8', ears: 'long',    snout: 'cat',  tail: 'puff',   nose: '#e58aa8', sound: 'squeak', emoji: '🐰', toy: true },
  ragdoll:   { fur: '#ffe0c2', belly: '#fff1e2', ears: 'none',    snout: 'cat',  tail: 'none',   nose: '#e58aa8', sound: 'squeak', emoji: '🪆', toy: true, yarnHair: '#e8703f' },
  sockmonkey:{ fur: '#d8cfc2', belly: '#f6f1e8', ears: 'round',   snout: 'dog',  tail: 'wag',    nose: '#c1485c', sound: 'squeak', emoji: '🐵', toy: true },
  plushele:  { fur: '#b9c6e0', belly: '#e6edf8', ears: 'round',   snout: 'cat',  tail: 'puff',   nose: '#6b7a95', sound: 'squeak', emoji: '🐘', toy: true },
  plushdino: { fur: '#8ed4a0', belly: '#dff5e4', ears: 'none',    snout: 'dog',  tail: 'bushy',  nose: '#3f7a55', sound: 'squeak', emoji: '🦕', toy: true, spikes: '#5fae74' },
  plushcat:  { fur: '#f5c98a', belly: '#fff2dc', ears: 'pointy',  snout: 'cat',  tail: 'fluffy', nose: '#e58aa8', sound: 'squeak', emoji: '🐱', toy: true },
  plushpeng: { fur: '#4a5570', belly: '#f4f7ff', ears: 'none',    snout: 'beak', tail: 'none',   nose: '#ffb445', sound: 'squeak', emoji: '🐧', toy: true, wings: true },
  plushlion: { fur: '#e8b45e', belly: '#fbe6c2', ears: 'round',   snout: 'cat',  tail: 'puff',   nose: '#7a4a2a', sound: 'squeak', emoji: '🦁', toy: true, mane: '#c07c32' },
  plushfrog: { fur: '#8fd06a', belly: '#e6f7d8', ears: 'none',    snout: 'cat',  tail: 'none',   nose: '#4a7a35', sound: 'squeak', emoji: '🐸', toy: true, bigEyes: true },
};

export function creatureSVG(opts = {}) {
  const {
    species = 'puppy', mood = 'happy', furOverride = null,
    accessory = null, idle = true, extras = [],
  } = opts;

  const s = { ...(SPECIES[species] || SPECIES.puppy) };
  if (furOverride) s.fur = furOverride;

  const scale = s.small ? 0.86 : 1;
  const headY = 96, headR = s.bigEyes ? 50 : 46;

  return `
<svg viewBox="0 0 200 250" class="charsvg" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <defs>
    <radialGradient id="furShine-${species}">
      <stop offset="0%" stop-color="#fff" stop-opacity=".45"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <ellipse cx="100" cy="240" rx="52" ry="8" fill="rgba(44,51,80,.16)"/>

  <g transform="translate(100 150) scale(${scale}) translate(-100 -150)" class="${idle ? 'char-idle' : ''}">
    ${tail(s)}

    <!-- body -->
    <ellipse cx="100" cy="180" rx="54" ry="52" fill="${s.fur}"/>
    <ellipse cx="100" cy="192" rx="34" ry="36" fill="${s.belly}"/>
    ${s.spikes ? `<g fill="${s.spikes}">
      <path d="M 100 130 l 9 16 l -18 0 z"/><path d="M 118 140 l 9 16 l -18 0 z"/><path d="M 82 140 l 9 16 l -18 0 z"/></g>` : ''}
    ${s.toy ? toySeam(s) : ''}
    ${s.shell ? shell(s) : ''}
    ${s.wings ? wings(s) : ''}
    ${s.spots ? `<g fill="#fff8ea" opacity=".8"><circle cx="76" cy="168" r="5"/><circle cx="124" cy="176" r="4"/><circle cx="92" cy="196" r="4"/></g>` : ''}

    <!-- front paws -->
    <ellipse cx="74" cy="222" rx="17" ry="12" fill="${s.fur}" data-part="paw-l"/>
    <ellipse cx="126" cy="222" rx="17" ry="12" fill="${s.fur}" data-part="paw-r"/>
    <g opacity=".35" fill="${s.nose}">
      <circle cx="70" cy="220" r="2.4"/><circle cx="76" cy="218" r="2.4"/><circle cx="82" cy="221" r="2.4"/>
      <circle cx="122" cy="220" r="2.4"/><circle cx="128" cy="218" r="2.4"/><circle cx="134" cy="221" r="2.4"/>
    </g>

    <!-- head -->
    <g class="char-head">
      ${ears(s, headY, headR)}
      ${s.mane ? `<circle cx="100" cy="${headY}" r="${headR + 15}" fill="${s.mane}"/>` : ''}
      ${s.yarnHair ? yarnHair(s, headY, headR) : ''}
      <circle cx="100" cy="${headY}" r="${headR}" fill="${s.fur}"/>
      ${s.stripes ? `<g stroke="rgba(0,0,0,.14)" stroke-width="5" stroke-linecap="round" fill="none">
          <path d="M 86 ${headY - 38} l 4 12"/><path d="M 100 ${headY - 42} l 0 13"/><path d="M 114 ${headY - 38} l -4 12"/>
        </g>` : ''}
      ${s.mask ? `<path d="M 62 ${headY - 4} q 38 -22 76 0 q -10 26 -38 26 q -28 0 -38 -26 z" fill="rgba(50,58,80,.55)"/>` : ''}
      ${s.crest ? `<path d="M 100 ${headY - headR - 4} q -12 -26 6 -30 q -2 16 10 24 z" fill="${s.crest}"/>` : ''}
      ${s.antlers ? antlers(headY, headR) : ''}
      <ellipse cx="100" cy="${headY - headR * 0.45}" rx="${headR * 0.6}" ry="${headR * 0.34}" fill="url(#furShine-${species})"/>

      <g transform="translate(100 ${headY})">
        ${s.toy
          ? buttonEyes(mood, s)
          : eyes(mood, { w: s.bigEyes ? 20 : 16, y: -4, scale: s.bigEyes ? 1.5 : 1 })}
        ${blush(mood, { w: 29, y: 12 })}
        ${snout(s, mood)}
        ${moodAura(mood, { y: -60 })}
      </g>
    </g>
    ${accessory ? `<text x="100" y="${headY - headR - 6}" font-size="30" text-anchor="middle">${accessory}</text>` : ''}
    ${extras.map((e) => `<text x="${e.x}" y="${e.y}" font-size="${e.size || 24}" text-anchor="middle">${e.emoji}</text>`).join('')}
  </g>

  <g class="spots" fill="transparent">
    <circle data-spot="head"  cx="100" cy="78"  r="26"/>
    <circle data-spot="eye"   cx="100" cy="92"  r="20"/>
    <circle data-spot="ear"   cx="${s.ears === 'long' ? 74 : 62}" cy="${s.ears === 'long' ? 34 : 66}" r="18"/>
    <circle data-spot="mouth" cx="100" cy="118" r="16"/>
    <circle data-spot="nose"  cx="100" cy="112" r="14"/>
    <circle data-spot="chest" cx="100" cy="164" r="26"/>
    <circle data-spot="tummy" cx="100" cy="196" r="26"/>
    <circle data-spot="back"  cx="100" cy="158" r="26"/>
    <circle data-spot="paw"   cx="74"  cy="222" r="19"/>
    <circle data-spot="leg"   cx="126" cy="222" r="19"/>
    <circle data-spot="wing"  cx="${s.wings ? 46 : 100}" cy="${s.wings ? 176 : 164}" r="20"/>
    <circle data-spot="tail"  cx="158" cy="196" r="18"/>
    <circle data-spot="fur"   cx="100" cy="180" r="34"/>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ parts */

/**
 * What makes a toy look like a toy: a stitched seam down the middle and a
 * patch someone has already mended once. Drawn under the head so the seam
 * runs into the body rather than across the face.
 */
function toySeam(s) {
  return `<g>
    <path d="M 100 132 V 228" stroke="rgba(0,0,0,.16)" stroke-width="2" stroke-dasharray="5 6" fill="none"/>
    <g transform="translate(64 168) rotate(-12)">
      <rect x="-13" y="-11" width="26" height="22" rx="4" fill="rgba(255,255,255,.5)" stroke="rgba(0,0,0,.18)" stroke-width="1.6" stroke-dasharray="4 4"/>
    </g>
  </g>`;
}

/** Sewn-on buttons, with the little cross of thread through the middle. */
function buttonEyes(mood, s) {
  const shut = mood === 'sleepy' || mood === 'sad';
  const r = s.bigEyes ? 15 : 11;
  const eye = (cx) => (shut
    ? `<path d="M ${cx - r} -4 q ${r} 8 ${r * 2} 0" stroke="#3a2f2a" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<g>
        <circle cx="${cx}" cy="-4" r="${r}" fill="#efe4d2"/>
        <circle cx="${cx}" cy="-4" r="${r}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.4"/>
        <circle cx="${cx}" cy="-4" r="${r * 0.72}" fill="#3a2f2a"/>
        <g fill="rgba(240,232,218,.85)">
          <circle cx="${cx - 2.6}" cy="-6.6" r="1.3"/><circle cx="${cx + 2.6}" cy="-6.6" r="1.3"/>
          <circle cx="${cx - 2.6}" cy="-1.4" r="1.3"/><circle cx="${cx + 2.6}" cy="-1.4" r="1.3"/>
        </g>
        <circle cx="${cx - r * 0.3}" cy="${-4 - r * 0.42}" r="${r * 0.24}" fill="rgba(255,255,255,.85)"/>
      </g>`);
  return `<g>${eye(-16)}${eye(16)}</g>`;
}

/** Wool hair for the rag doll — loops around the top of the head. */
function yarnHair(s, hy, hr) {
  return `<g fill="${s.yarnHair}">
    ${[-1, -0.5, 0, 0.5, 1].map((k) => {
      const x = 100 + k * (hr - 6);
      return `<circle cx="${x}" cy="${hy - hr + 8}" r="13"/>`;
    }).join('')}
    <circle cx="${100 - hr - 2}" cy="${hy + 6}" r="12"/>
    <circle cx="${100 + hr + 2}" cy="${hy + 6}" r="12"/>
  </g>`;
}

function ears(s, hy, hr) {
  const f = s.fur, tip = s.tips || s.fur;
  switch (s.ears) {
    case 'floppy':
      return `<g>
        <ellipse cx="${100 - hr + 4}" cy="${hy + 8}" rx="15" ry="30" fill="${shade(f)}" class="ear-l"/>
        <ellipse cx="${100 + hr - 4}" cy="${hy + 8}" rx="15" ry="30" fill="${shade(f)}" class="ear-r"/></g>`;
    case 'pointy':
      return `<g>
        <path d="M ${100 - hr + 6} ${hy - 22} l -12 -40 l 34 20 z" fill="${f}"/>
        <path d="M ${100 - hr + 10} ${hy - 24} l -6 -24 l 20 12 z" fill="${tip}" opacity=".65"/>
        <path d="M ${100 + hr - 6} ${hy - 22} l 12 -40 l -34 20 z" fill="${f}"/>
        <path d="M ${100 + hr - 10} ${hy - 24} l 6 -24 l -20 12 z" fill="${tip}" opacity=".65"/></g>`;
    case 'long':
      return `<g class="ear-bunny">
        <ellipse cx="78" cy="${hy - 66}" rx="13" ry="42" fill="${f}" transform="rotate(-8 78 ${hy - 66})"/>
        <ellipse cx="78" cy="${hy - 66}" rx="7" ry="32" fill="#ffc9d6" transform="rotate(-8 78 ${hy - 66})"/>
        <ellipse cx="122" cy="${hy - 66}" rx="13" ry="42" fill="${f}" transform="rotate(8 122 ${hy - 66})"/>
        <ellipse cx="122" cy="${hy - 66}" rx="7" ry="32" fill="#ffc9d6" transform="rotate(8 122 ${hy - 66})"/></g>`;
    case 'round':
      return `<g>
        <circle cx="${100 - hr + 6}" cy="${hy - hr + 12}" r="17" fill="${f}"/>
        <circle cx="${100 - hr + 6}" cy="${hy - hr + 12}" r="9" fill="#ffc9d6" opacity=".8"/>
        <circle cx="${100 + hr - 6}" cy="${hy - hr + 12}" r="17" fill="${f}"/>
        <circle cx="${100 + hr - 6}" cy="${hy - hr + 12}" r="9" fill="#ffc9d6" opacity=".8"/></g>`;
    case 'tuft':
      return `<g fill="${f}">
        <path d="M 70 ${hy - 34} q -6 -26 12 -22 z"/><path d="M 130 ${hy - 34} q 6 -26 -12 -22 z"/></g>`;
    default:
      return '';
  }
}

function snout(s, mood) {
  if (s.snout === 'beak') {
    return `<path d="M -13 12 l 13 20 l 13 -20 q -13 6 -26 0 z" fill="${s.nose}"/>
            <path d="M -11 13 q 11 5 22 0" stroke="rgba(0,0,0,.2)" stroke-width="1.6" fill="none"/>`;
  }
  const muzzle = s.snout === 'dog'
    ? `<ellipse cx="0" cy="20" rx="24" ry="17" fill="${s.belly}"/>`
    : `<ellipse cx="-9" cy="22" rx="12" ry="9" fill="${s.belly}"/><ellipse cx="9" cy="22" rx="12" ry="9" fill="${s.belly}"/>`;
  const nose = s.snout === 'dog'
    ? `<ellipse cx="0" cy="10" rx="9" ry="7" fill="${s.nose}"/>`
    : `<path d="M -7 8 l 14 0 l -7 8 z" fill="${s.nose}"/>`;
  const whiskers = s.snout === 'cat'
    ? `<g stroke="rgba(60,60,80,.35)" stroke-width="1.8" stroke-linecap="round">
        <path d="M -18 20 l -18 -4"/><path d="M -18 24 l -18 4"/>
        <path d="M 18 20 l 18 -4"/><path d="M 18 24 l 18 4"/></g>` : '';
  return muzzle + nose + whiskers + mouth(mood, { y: 22, scale: 0.85 });
}

function tail(s) {
  switch (s.tail) {
    case 'wag':
      return `<g class="tail-wag" style="transform-origin:150px 200px">
        <path d="M 146 200 q 34 -6 30 -40 q -2 -12 -12 -8 q 6 26 -22 34 z" fill="${s.fur}"/></g>`;
    case 'fluffy':
      return `<path d="M 148 202 q 40 4 34 -40 q -3 -14 -14 -10 q 8 30 -22 36 z" fill="${shade(s.fur)}" class="tail-wag" style="transform-origin:150px 200px"/>`;
    case 'bushy':
      return `<g class="tail-wag" style="transform-origin:148px 202px">
        <ellipse cx="168" cy="180" rx="22" ry="34" fill="${s.fur}" transform="rotate(24 168 180)"/>
        <ellipse cx="176" cy="158" rx="14" ry="16" fill="${s.tips || '#fff'}" opacity=".85"/></g>`;
    case 'puff':
      return `<circle cx="152" cy="204" r="17" fill="#fff" opacity=".95"/>`;
    case 'feather':
      return `<g class="tail-wag" style="transform-origin:150px 200px">
        <path d="M 144 198 l 42 12 l -40 12 z" fill="${shade(s.fur)}"/></g>`;
    default:
      return '';
  }
}

function wings(s) {
  return `<g>
    <ellipse cx="52" cy="180" rx="18" ry="34" fill="${shade(s.fur)}" class="wing-l" style="transform-origin:60px 156px"/>
    <ellipse cx="148" cy="180" rx="18" ry="34" fill="${shade(s.fur)}" class="wing-r" style="transform-origin:140px 156px"/>
  </g>`;
}

function shell(s) {
  return `<g>
    <ellipse cx="100" cy="172" rx="58" ry="48" fill="${s.shell}"/>
    <ellipse cx="100" cy="172" rx="44" ry="36" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="4"/>
    <g stroke="rgba(0,0,0,.16)" stroke-width="3" fill="none">
      <path d="M 100 126 v 92"/><path d="M 56 160 q 44 20 88 0"/><path d="M 56 190 q 44 -20 88 0"/>
    </g></g>`;
}

function antlers(hy, hr) {
  return `<g stroke="#a97b52" stroke-width="7" stroke-linecap="round" fill="none">
    <path d="M 76 ${hy - hr + 6} l -12 -30 m 0 0 l -14 6 m 14 -6 l 4 -16"/>
    <path d="M 124 ${hy - hr + 6} l 12 -30 m 0 0 l 14 6 m -14 -6 l -4 -16"/>
  </g>`;
}

/** Slightly darker variant of a fur colour for ears / tails. */
function shade(hex) {
  if (!hex?.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const d = (v) => Math.max(0, Math.round(v * 0.86));
  const r = d((n >> 16) & 255), g = d((n >> 8) & 255), b = d(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
