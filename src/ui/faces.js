/**
 * Shared face parts for every character in the game (heroes, kids, puppies,
 * owls…). Keeping eyes and mouths in one place means a new mood instantly
 * works on every species.
 *
 * All parts are drawn around an origin at the centre of the face, so callers
 * just translate to wherever the head is.
 */

export const MOODS = [
  'happy', 'calm', 'sad', 'scared', 'sick', 'sleepy',
  'giggle', 'surprised', 'love', 'proud', 'confused', 'itchy',
];

/** Eyes for a mood. `w` is the horizontal spread. */
export function eyes(mood, { w = 15, y = 0, color = '#2c3350', scale = 1 } = {}) {
  const L = -w, R = w;
  const r = 5.4 * scale;

  const dot = (x, ry = r) => `
    <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${ry}" fill="${color}"/>
    <circle cx="${x + r * 0.38}" cy="${y - ry * 0.42}" r="${r * 0.34}" fill="#fff" opacity=".95"/>`;

  const arc = (x, dir = 1) =>
    `<path d="M ${x - r * 1.3} ${y + 1.5 * dir} q ${r * 1.3} ${-6 * dir} ${r * 2.6} 0"
       stroke="${color}" stroke-width="${3.2 * scale}" fill="none" stroke-linecap="round"/>`;

  switch (mood) {
    case 'happy':
    case 'proud':
      return arc(L) + arc(R);
    case 'giggle':
      return arc(L) + arc(R) + sparkleEye(L - 16, y - 6) + sparkleEye(R + 16, y - 6);
    case 'love':
      return heartEye(L, y) + heartEye(R, y);
    case 'sleepy':
      return arc(L, -1) + arc(R, -1);
    case 'sad':
      return dot(L, r * 1.15) + dot(R, r * 1.15) + tear(R + 6, y + 6);
    case 'scared':
      return dot(L, r * 1.4) + dot(R, r * 1.4) +
        `<path d="M ${L - 10} ${y - 13} q 10 -6 20 -2" stroke="${color}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
         <path d="M ${R + 10} ${y - 13} q -10 -6 -20 -2" stroke="${color}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    case 'sick':
      return `<path d="M ${L - 6} ${y - 4} l 12 10 M ${L + 6} ${y - 4} l -12 10" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/>
              <path d="M ${R - 6} ${y - 4} l 12 10 M ${R + 6} ${y - 4} l -12 10" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/>`;
    case 'surprised':
      return dot(L, r * 1.5) + dot(R, r * 1.5);
    case 'confused':
      return arc(L) + dot(R, r * 1.2);
    case 'itchy':
      return `<path d="M ${L - 7} ${y} q 7 -8 14 0" stroke="${color}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
              <path d="M ${R - 7} ${y} q 7 -8 14 0" stroke="${color}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    default: // calm
      return dot(L) + dot(R);
  }
}

function heartEye(x, y) {
  return `<path d="M ${x} ${y + 6} C ${x - 9} ${y - 2} ${x - 7} ${y - 10} ${x} ${y - 5}
    C ${x + 7} ${y - 10} ${x + 9} ${y - 2} ${x} ${y + 6} Z" fill="#ff5f8d"/>`;
}

function tear(x, y) {
  return `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="5" fill="#7ed0ff" opacity=".95">
    <animate attributeName="cy" values="${y};${y + 14};${y}" dur="2.4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite"/>
  </ellipse>`;
}

function sparkleEye(x, y) {
  return `<text x="${x}" y="${y}" font-size="13" text-anchor="middle">✨</text>`;
}

/** Mouth for a mood. */
export function mouth(mood, { y = 20, color = '#2c3350', scale = 1 } = {}) {
  const sw = 3.4 * scale;
  switch (mood) {
    case 'happy':
    case 'proud':
      return `<path d="M -11 ${y} q 11 12 22 0" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    case 'giggle':
      return `<path d="M -13 ${y - 2} q 13 18 26 0 z" fill="${color}"/>
              <path d="M -7 ${y + 6} q 7 6 14 0 z" fill="#ff8fa6"/>`;
    case 'love':
      return `<path d="M -9 ${y} q 9 11 18 0" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    case 'sad':
      return `<path d="M -10 ${y + 6} q 10 -11 20 0" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    case 'scared':
      return `<ellipse cx="0" cy="${y + 3}" rx="7" ry="8.5" fill="${color}"/>`;
    case 'sick':
      return `<path d="M -11 ${y + 4} q 5.5 -8 11 0 q 5.5 8 11 0" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    case 'sleepy':
      return `<ellipse cx="0" cy="${y + 2}" rx="5" ry="6" fill="${color}" opacity=".85"/>`;
    case 'surprised':
      return `<ellipse cx="0" cy="${y + 2}" rx="6" ry="7" fill="${color}"/>`;
    case 'confused':
      return `<path d="M -9 ${y + 2} q 9 6 18 -3" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    case 'itchy':
      return `<path d="M -9 ${y + 2} q 9 -7 18 3" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M -8 ${y + 1} q 8 6 16 0" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
  }
}

/** Rosy cheeks — the single biggest "cute" lever there is. */
export function blush(mood, { w = 30, y = 14, color = '#ff9eb0', opacity = 0.55 } = {}) {
  const strong = mood === 'sick' || mood === 'love' || mood === 'giggle';
  return `<ellipse cx="${-w}" cy="${y}" rx="9" ry="6" fill="${strong ? '#ff8095' : color}" opacity="${strong ? 0.8 : opacity}"/>
          <ellipse cx="${w}" cy="${y}" rx="9" ry="6" fill="${strong ? '#ff8095' : color}" opacity="${strong ? 0.8 : opacity}"/>`;
}

/** Little floating symbol above the head (zzz, sweat, question mark…). */
export function moodAura(mood, { y = -70 } = {}) {
  const glyph = {
    sleepy: '💤', sick: '🥴', scared: '😟', confused: '❓',
    love: '💕', proud: '⭐', itchy: '💢', giggle: '😆',
  }[mood];
  if (!glyph) return '';
  return `<text x="34" y="${y}" font-size="24" text-anchor="middle" opacity=".9">
      ${glyph}
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -7; 0 0" dur="2.6s" repeatCount="indefinite"/>
    </text>`;
}

/** Complete face bundle at the given origin. */
export function face(mood, opts = {}) {
  return eyes(mood, opts) + blush(mood, opts) + mouth(mood, opts);
}
