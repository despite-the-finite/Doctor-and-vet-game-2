/**
 * Toy patients.
 *
 * The Toy Workshop takes in more than teddies, and a toy car is not a round
 * sitting animal — so this file owns every toy the game knows about and
 * routes each one to the right body plan:
 *
 *   plush   → the parametric creature (a soft toy IS a round sitting animal),
 *             drawn with `toy: true` so it gets button eyes, a seam and a patch
 *   figure  → a chunky articulated action figure, ball joints showing
 *   robot   → boxes, an antenna and a chest panel with working lights
 *   doll    → a slim fashion doll with hair that can be brushed or tangled
 *   car     → a side-on toy vehicle, eyes in the windscreen
 *
 * Every family draws into the same 200×250 viewBox as the animals, so the
 * stage, the hotspot overlay and the drop targets need no special cases.
 *
 * Each entry declares the hotspots its body plan actually has. A toy car has
 * no `paw` and an action figure has no `wheel`, and `tools/validate-cases.mjs`
 * checks a case's `target` against that list rather than one shared vocabulary.
 */
import { creatureSVG, SPECIES } from './creature.js';
import { eyes, mouth, blush, moodAura } from './faces.js';

const PLUSH_SPOTS = ['head', 'eye', 'ear', 'mouth', 'nose', 'chest', 'tummy', 'back', 'paw', 'leg', 'wing', 'tail', 'fur'];
const FIGURE_SPOTS = ['head', 'eye', 'mouth', 'chest', 'tummy', 'back', 'arm', 'hand', 'leg', 'foot', 'joint'];
const ROBOT_SPOTS = ['head', 'eye', 'mouth', 'chest', 'panel', 'back', 'arm', 'hand', 'leg', 'foot', 'antenna'];
const DOLL_SPOTS = ['head', 'eye', 'mouth', 'hair', 'chest', 'tummy', 'back', 'arm', 'hand', 'leg', 'foot'];
const CAR_SPOTS = ['roof', 'eye', 'mouth', 'chest', 'back', 'wheel', 'light'];

/**
 * Every toy in the workshop.
 *
 *   family  which body plan draws it
 *   species (plush only) the SPECIES entry to hand to the creature renderer
 *   spots   the hotspots this body plan has — the authoring vocabulary
 */
export const TOYS = {
  /* -------------------------------------------------------------- plush */
  ...Object.fromEntries(Object.entries(SPECIES)
    .filter(([, s]) => s.toy)
    .map(([id, s]) => [id, {
      id, family: 'plush', species: id, spots: PLUSH_SPOTS,
      emoji: s.emoji, sound: 'squeak',
    }])),

  /* ----------------------------------------------------- action figures */
  figure: {
    id: 'figure', family: 'figure', spots: FIGURE_SPOTS, emoji: '🦸', sound: 'select',
    suit: '#3f7fd8', trim: '#ffcd45', skin: '#e8b183', hair: '#3a2a1e', boots: '#2b3f63',
    emblem: '★',
  },
  knight: {
    id: 'knight', family: 'figure', spots: FIGURE_SPOTS, emoji: '🛡️', sound: 'select',
    suit: '#9aa6bd', trim: '#d8dee9', skin: '#c98a5b', hair: '#2f2a33', boots: '#5c6880',
    emblem: '🛡',
  },
  spacefigure: {
    id: 'spacefigure', family: 'figure', spots: FIGURE_SPOTS, emoji: '🧑‍🚀', sound: 'select',
    suit: '#f2f5fb', trim: '#ff7a6b', skin: '#9a6238', hair: '#2f2a33', boots: '#cfd8e8',
    emblem: '🚀', visor: true,
  },

  /* -------------------------------------------------------------- robots */
  robot: {
    id: 'robot', family: 'robot', spots: ROBOT_SPOTS, emoji: '🤖', sound: 'select',
    shell: '#8fa6c4', shell2: '#6d86a8', panel: '#2b3f63', glow: '#5fe3c0', trim: '#ffcd45',
  },
  tinbot: {
    id: 'tinbot', family: 'robot', spots: ROBOT_SPOTS, emoji: '🤖', sound: 'select',
    shell: '#e0a44c', shell2: '#bd8434', panel: '#4a3527', glow: '#ff7a6b', trim: '#f2e2c0',
  },
  scoutbot: {
    id: 'scoutbot', family: 'robot', spots: ROBOT_SPOTS, emoji: '🤖', sound: 'select',
    shell: '#7fd0a0', shell2: '#5aa87e', panel: '#25473a', glow: '#ffe27a', trim: '#dff5e8',
  },

  /* -------------------------------------------------------- fashion dolls */
  doll: {
    id: 'doll', family: 'doll', spots: DOLL_SPOTS, emoji: '🪮', sound: 'squeak',
    skin: '#e8b183', hair: '#3a2a1e', dress: '#ff7fb0', trim: '#ffd9e8', shoes: '#ffffff',
    hairStyle: 'long',
  },
  ballerina: {
    id: 'ballerina', family: 'doll', spots: DOLL_SPOTS, emoji: '🩰', sound: 'squeak',
    skin: '#9a6238', hair: '#2f2a33', dress: '#c3a4f5', trim: '#f0e4ff', shoes: '#ffc0d8',
    hairStyle: 'bun',
  },
  popdoll: {
    id: 'popdoll', family: 'doll', spots: DOLL_SPOTS, emoji: '💃', sound: 'squeak',
    skin: '#ffe0c2', hair: '#f0c15c', dress: '#4fc3e8', trim: '#dff5ff', shoes: '#ff9ec4',
    hairStyle: 'ponytail',
  },

  /* ----------------------------------------------------------- toy cars */
  racer: {
    id: 'racer', family: 'car', spots: CAR_SPOTS, emoji: '🏎️', sound: 'whoosh',
    body: '#ff5b5b', body2: '#d63a3a', glass: '#bfe6ff', trim: '#ffd75e', shape: 'racer',
  },
  van: {
    id: 'van', family: 'car', spots: CAR_SPOTS, emoji: '🚐', sound: 'whoosh',
    body: '#5fb8f0', body2: '#3d94cc', glass: '#dff2ff', trim: '#ffffff', shape: 'van',
  },
  digger: {
    id: 'digger', family: 'car', spots: CAR_SPOTS, emoji: '🚜', sound: 'whoosh',
    body: '#ffc02e', body2: '#dfa016', glass: '#cfe8ff', trim: '#3a3f57', shape: 'digger',
  },
};

export const TOY_KINDS = Object.keys(TOYS);
export function isToy(kind) { return !!TOYS[kind]; }
export function toySpots(kind) { return TOYS[kind]?.spots || PLUSH_SPOTS; }

/** Draw a toy patient. */
export function toySVG(opts = {}) {
  const { kind = 'teddy', mood = 'happy', idle = true } = opts;
  const t = TOYS[kind] || TOYS.teddy;
  if (t.family === 'plush') return creatureSVG({ species: t.species, mood, idle, ...opts });

  const draw = { figure: figureSVG, robot: robotSVG, doll: dollSVG, car: carSVG }[t.family];
  return draw(t, mood, idle);
}

/* ------------------------------------------------------------- wrappers */

const frame = (inner, spots, idle) => `
<svg viewBox="0 0 200 250" class="charsvg" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <ellipse cx="100" cy="240" rx="52" ry="8" fill="rgba(44,51,80,.16)"/>
  <g class="${idle ? 'char-idle' : ''}">${inner}</g>
  <g class="spots" fill="transparent">${spots}</g>
</svg>`;

const spot = (name, cx, cy, r) => `<circle data-spot="${name}" cx="${cx}" cy="${cy}" r="${r}"/>`;

/* ═══════════════════════════════════════════════════════ action figure ══ */

function figureSVG(t, mood, idle) {
  const joint = (x, y, r = 9) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(0,0,0,.18)"/>
     <circle cx="${x}" cy="${y}" r="${r - 3}" fill="${t.trim}" opacity=".9"/>`;

  const inner = `
    <!-- legs and boots -->
    <g>
      <rect x="76" y="182" width="20" height="40" rx="9" fill="${t.suit}"/>
      <rect x="104" y="182" width="20" height="40" rx="9" fill="${t.suit}"/>
      <rect x="70" y="216" width="28" height="20" rx="8" fill="${t.boots}"/>
      <rect x="102" y="216" width="28" height="20" rx="8" fill="${t.boots}"/>
    </g>
    ${joint(86, 186)}${joint(114, 186)}

    <!-- torso -->
    <path d="M 66 132 q 34 -12 68 0 l -6 54 q -28 8 -56 0 z" fill="${t.suit}"/>
    <rect x="70" y="170" width="60" height="12" rx="5" fill="${t.boots}"/>
    <rect x="92" y="170" width="16" height="12" rx="4" fill="${t.trim}"/>
    <text x="100" y="158" font-size="22" text-anchor="middle">${t.emblem}</text>

    <!-- arms -->
    <g>
      <rect x="40" y="134" width="20" height="46" rx="9" fill="${t.suit}" transform="rotate(-9 50 134)"/>
      <rect x="140" y="134" width="20" height="46" rx="9" fill="${t.suit}" transform="rotate(9 150 134)"/>
      <circle cx="45" cy="186" r="12" fill="${t.skin}"/>
      <circle cx="155" cy="186" r="12" fill="${t.skin}"/>
    </g>
    ${joint(62, 136)}${joint(138, 136)}

    <!-- head -->
    <g class="char-head">
      <path d="M 72 84 q 28 -22 56 0 l 2 -12 q -30 -18 -60 0 z" fill="${t.hair}"/>
      <circle cx="100" cy="98" r="30" fill="${t.skin}"/>
      <path d="M 70 92 q 30 -26 60 0 q -6 -22 -30 -22 q -24 0 -30 22 z" fill="${t.hair}"/>
      ${t.visor ? `<rect x="70" y="86" width="60" height="26" rx="13" fill="#bfe6ff" opacity=".55"/>` : ''}
      <g transform="translate(100 100)">
        ${eyes(mood, { w: 12, y: -2, scale: .9 })}
        ${blush(mood, { w: 21, y: 10 })}
        ${mouth(mood, { y: 14, scale: .8 })}
        ${moodAura(mood, { y: -50 })}
      </g>
    </g>`;

  const spots = [
    spot('head', 100, 90, 26), spot('eye', 100, 98, 20), spot('mouth', 100, 116, 15),
    spot('chest', 100, 146, 24), spot('tummy', 100, 172, 20), spot('back', 100, 152, 24),
    spot('arm', 50, 152, 18), spot('hand', 45, 186, 16),
    spot('leg', 86, 200, 18), spot('foot', 84, 226, 16),
    spot('joint', 138, 136, 16),
  ].join('');
  return frame(inner, spots, idle);
}

/* ═══════════════════════════════════════════════════════════════ robot ══ */

function robotSVG(t, mood, idle) {
  const lit = mood !== 'sleepy' && mood !== 'sick';
  const inner = `
    <!-- legs -->
    <rect x="74" y="196" width="22" height="30" rx="6" fill="${t.shell2}"/>
    <rect x="104" y="196" width="22" height="30" rx="6" fill="${t.shell2}"/>
    <rect x="66" y="220" width="34" height="16" rx="6" fill="${t.panel}"/>
    <rect x="100" y="220" width="34" height="16" rx="6" fill="${t.panel}"/>

    <!-- body -->
    <rect x="60" y="126" width="80" height="76" rx="14" fill="${t.shell}"/>
    <rect x="60" y="126" width="80" height="18" rx="9" fill="${t.shell2}" opacity=".55"/>
    <!-- chest panel -->
    <rect x="74" y="150" width="52" height="38" rx="8" fill="${t.panel}"/>
    <circle cx="88" cy="169" r="9" fill="${t.glow}" opacity="${lit ? 1 : .25}">
      ${lit ? '<animate attributeName="opacity" values="1;.45;1" dur="2.2s" repeatCount="indefinite"/>' : ''}
    </circle>
    <g fill="${t.trim}">
      <circle cx="108" cy="160" r="4" opacity="${lit ? .95 : .2}"/>
      <circle cx="118" cy="160" r="4" opacity="${lit ? .6 : .2}"/>
      <rect x="102" y="174" width="20" height="6" rx="3" opacity=".8"/>
    </g>

    <!-- arms -->
    <rect x="38" y="134" width="18" height="34" rx="8" fill="${t.shell2}"/>
    <rect x="144" y="134" width="18" height="34" rx="8" fill="${t.shell2}"/>
    <circle cx="47" cy="174" r="12" fill="${t.shell}"/>
    <circle cx="153" cy="174" r="12" fill="${t.shell}"/>

    <!-- head -->
    <g class="char-head">
      <rect x="96" y="46" width="8" height="18" rx="4" fill="${t.shell2}"/>
      <circle cx="100" cy="44" r="8" fill="${t.glow}">
        <animate attributeName="r" values="8;6.4;8" dur="2.6s" repeatCount="indefinite"/>
      </circle>
      <rect x="66" y="62" width="68" height="56" rx="16" fill="${t.shell}"/>
      <rect x="72" y="70" width="56" height="30" rx="12" fill="${t.panel}"/>
      <g transform="translate(100 86)">
        ${eyes(mood, { w: 14, y: -2, color: t.glow, scale: 1.05 })}
      </g>
      <g transform="translate(100 104)">
        ${mouth(mood, { y: 0, color: t.shell2, scale: .8 })}
      </g>
      <g fill="${t.shell2}"><rect x="58" y="80" width="8" height="18" rx="4"/><rect x="134" y="80" width="8" height="18" rx="4"/></g>
      ${moodAura(mood, { y: 16 })}
    </g>`;

  const spots = [
    spot('head', 100, 88, 28), spot('antenna', 100, 46, 16), spot('eye', 100, 84, 20),
    spot('mouth', 100, 106, 14), spot('chest', 100, 140, 22), spot('panel', 100, 169, 22),
    spot('back', 100, 150, 24), spot('arm', 47, 150, 16), spot('hand', 47, 174, 14),
    spot('leg', 85, 208, 16), spot('foot', 83, 228, 15),
  ].join('');
  return frame(inner, spots, idle);
}

/* ══════════════════════════════════════════════════════════ fashion doll ══ */

function dollSVG(t, mood, idle) {
  const hairBack = t.hairStyle === 'bun'
    ? `<circle cx="100" cy="60" r="18" fill="${t.hair}"/>`
    : `<path d="M 66 88 q -10 66 8 96 q 26 -10 52 0 q 18 -30 8 -96 z" fill="${t.hair}"/>`;
  const hairSide = t.hairStyle === 'ponytail'
    ? `<path d="M 132 84 q 30 22 20 66 q -4 16 -16 12 q 10 -40 -12 -64 z" fill="${t.hair}"/>`
    : '';

  const inner = `
    ${hairBack}${hairSide}

    <!-- legs -->
    <rect x="86" y="182" width="11" height="48" rx="5" fill="${t.skin}"/>
    <rect x="103" y="182" width="11" height="48" rx="5" fill="${t.skin}"/>
    <path d="M 84 226 q 8 10 16 0 z" fill="${t.shoes}"/>
    <path d="M 101 226 q 8 10 16 0 z" fill="${t.shoes}"/>
    <ellipse cx="91" cy="230" rx="10" ry="6" fill="${t.shoes}"/>
    <ellipse cx="109" cy="230" rx="10" ry="6" fill="${t.shoes}"/>

    <!-- dress -->
    <path d="M 80 126 q 20 -8 40 0 l 18 62 q -38 12 -76 0 z" fill="${t.dress}"/>
    <path d="M 80 126 q 20 -8 40 0 l 3 12 q -23 -7 -46 0 z" fill="${t.trim}" opacity=".8"/>
    <rect x="86" y="160" width="28" height="5" rx="2" fill="${t.trim}" opacity=".85"/>

    <!-- arms -->
    <rect x="60" y="130" width="10" height="44" rx="5" fill="${t.skin}" transform="rotate(-12 65 130)"/>
    <rect x="130" y="130" width="10" height="44" rx="5" fill="${t.skin}" transform="rotate(12 135 130)"/>
    <circle cx="59" cy="176" r="7" fill="${t.skin}"/>
    <circle cx="141" cy="176" r="7" fill="${t.skin}"/>

    <!-- head -->
    <g class="char-head">
      <circle cx="100" cy="92" r="27" fill="${t.skin}"/>
      <path d="M 73 90 q 8 -32 27 -32 q 19 0 27 32 q -6 -16 -27 -16 q -21 0 -27 16 z" fill="${t.hair}"/>
      <g transform="translate(100 94)">
        ${eyes(mood, { w: 11, y: -2, scale: 1.15 })}
        ${blush(mood, { w: 18, y: 9 })}
        ${mouth(mood, { y: 13, scale: .75 })}
        ${moodAura(mood, { y: -46 })}
      </g>
    </g>`;

  const spots = [
    spot('head', 100, 86, 24), spot('eye', 100, 92, 18), spot('mouth', 100, 108, 14),
    spot('hair', 70, 120, 22), spot('chest', 100, 134, 20), spot('tummy', 100, 162, 20),
    spot('back', 100, 148, 22), spot('arm', 64, 150, 15), spot('hand', 59, 176, 13),
    spot('leg', 91, 204, 16), spot('foot', 91, 230, 14),
  ].join('');
  return frame(inner, spots, idle);
}

/* ═════════════════════════════════════════════════════════════ toy car ══ */

function carSVG(t, mood, idle) {
  const wheel = (cx) => `<g>
    <circle cx="${cx}" cy="206" r="26" fill="#3a3f57"/>
    <circle cx="${cx}" cy="206" r="14" fill="#d8dee9"/>
    <circle cx="${cx}" cy="206" r="6" fill="#9aa4b8"/>
  </g>`;

  const shell = {
    racer: `<path d="M 22 196 q 2 -34 30 -38 l 20 -30 q 30 -10 58 0 l 18 30 q 30 6 30 38 z" fill="${t.body}"/>
            <path d="M 22 190 h 156 q 2 6 0 8 H 22 z" fill="${t.body2}"/>`,
    van:   `<path d="M 26 198 q 0 -70 26 -74 q 48 -8 96 0 q 26 4 26 74 z" fill="${t.body}"/>
            <path d="M 26 188 h 152 v 10 H 26 z" fill="${t.body2}"/>`,
    digger:`<path d="M 30 198 q 0 -46 24 -50 q 40 -8 66 0 l 6 -28 q 26 4 26 78 z" fill="${t.body}"/>
            <path d="M 30 188 h 152 v 10 H 30 z" fill="${t.body2}"/>`,
  }[t.shape];

  const inner = `
    ${shell}
    <!-- windscreen: the face lives here -->
    <path d="M 66 160 q 34 -8 68 0 l -6 -28 q -28 -8 -56 0 z" fill="${t.glass}"/>
    <!-- char-head is animated in CSS, and a CSS transform on an SVG element
         replaces the transform attribute — so the positioning goes on an inner
         group, where the animation cannot overwrite it. -->
    <g class="char-head"><g transform="translate(100 146)">
      ${eyes(mood, { w: 15, y: -2, scale: 1 })}
      ${mouth(mood, { y: 12, scale: .8 })}
    </g></g>
    ${moodAura(mood, { y: 92 })}
    <!-- lights and trim -->
    <circle cx="172" cy="178" r="9" fill="${t.trim}"/>
    <circle cx="172" cy="178" r="4" fill="#fff" opacity=".8"/>
    <rect x="26" y="176" width="12" height="10" rx="4" fill="${t.trim}" opacity=".9"/>
    ${t.shape === 'digger' ? `<path d="M 150 122 q 26 8 30 34" stroke="${t.trim}" stroke-width="8" fill="none" stroke-linecap="round"/>` : ''}
    ${wheel(62)}${wheel(142)}`;

  const spots = [
    spot('roof', 100, 128, 24), spot('eye', 100, 146, 22), spot('mouth', 100, 162, 16),
    spot('chest', 100, 184, 26), spot('back', 44, 182, 20),
    spot('wheel', 62, 206, 26), spot('light', 172, 178, 16),
  ].join('');
  return frame(inner, spots, idle);
}
