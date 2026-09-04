/**
 * Shared face parts for every character in the game (heroes, kids, puppies,
 * owls…). Keeping eyes and mouths in one place means a new mood instantly
 * works on every species.
 *
 * All parts are drawn around an origin at the centre of the face, so callers
 * just translate to wherever the head is.
 *
 * The twelve expressions come from the design's expression sheet, which draws
 * them in an 80x80 box on a face of r=34 with the eyes at x=29 and x=51.
 * Here every measurement is expressed as a fraction of the caller's eye
 * spread instead, so one table of moods fits a human, an animal and a toy
 * without a special case anywhere.
 */

export const MOODS = [
  'happy', 'calm', 'sad', 'scared', 'sick', 'sleepy',
  'giggle', 'surprised', 'love', 'proud', 'confused', 'itchy',
];

const INK = '#2E2A44';
const MUTE = '#8C86AD';       /* the ? and Z glyphs */
const BLUSH = '#FF9EB0';
const BLUSH_STRONG = '#FF8095';
const TEAR = '#7ED0FF';
const HEART = '#FF5F8D';
const STAR = '#FFD84D';
const STAR_EDGE = '#E0AE12';
const ITCH = '#E8556D';

/** The face fill a mood asks for. Only `sick` changes it — it goes sallow. */
export function faceTint(mood, base) {
  return mood === 'sick' ? '#EDD9B4' : base;
}

/** Eyes for a mood. `w` is the horizontal spread. */
export function eyes(mood, { w = 15, y = 0, color = INK, scale = 1 } = {}) {
  const L = -w, R = w;
  const sw = 3.2 * scale;
  /* Proportions lifted from the sheet: an eye arc spans 0.64 of the spread
     either side and rises 0.73 of it; a round eye is 0.455 of it across. */
  const half = 0.64 * w;
  const rise = 0.73 * w;
  const rx = 0.455 * w * scale;

  /* An open, lidded eye — round pupil with a highlight up and to the right. */
  const dot = (x, ry = rx) => `
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}"/>
    <circle cx="${x + rx * 0.4}" cy="${y - ry * 0.4}" r="${rx * 0.36}" fill="#fff"/>`;

  /* A closed, happy eye. dir 1 arches up, dir -1 droops. */
  const arc = (x, dir = 1) =>
    `<path d="M ${x - half} ${y + rise * 0.25 * dir} q ${half} ${-rise * dir} ${half * 2} 0"
       fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;

  switch (mood) {
    case 'happy':
      return arc(L) + arc(R);
    case 'proud':
      return arc(L) + arc(R);
    case 'giggle':
      return arc(L) + arc(R);
    case 'itchy':
      /* squeezed a little tighter than happy — the scrunch of a good scratch */
      return arc(L, 1.12) + arc(R, 1.12);
    case 'love':
      return heartEye(L, y, w) + heartEye(R, y, w);
    case 'sleepy':
      return arc(L, -1) + arc(R, -1);
    case 'sad':
      return dot(L, rx * 1.2) + dot(R, rx * 1.2) + tear(R + w * 0.64, y + w * 1.1, w);
    case 'scared':
      return dot(L, rx * 1.4) + dot(R, rx * 1.4) +
        `<path d="M ${L - w * 0.82} ${y - w * 1.18} q ${w * 0.73} ${-w * 0.45} ${w * 1.36} ${-w * 0.18}"
           fill="none" stroke="${color}" stroke-width="${2.8 * scale}" stroke-linecap="round"/>
         <path d="M ${R + w * 0.82} ${y - w * 1.18} q ${-w * 0.73} ${-w * 0.45} ${-w * 1.36} ${-w * 0.18}"
           fill="none" stroke="${color}" stroke-width="${2.8 * scale}" stroke-linecap="round"/>`;
    case 'sick':
      return crossEye(L, y, w, color, sw) + crossEye(R, y, w, color, sw);
    case 'surprised':
      return dot(L, rx * 1.5) + dot(R, rx * 1.5);
    case 'confused':
      return arc(L) + dot(R, rx * 1.2);
    default: // calm
      return dot(L) + dot(R);
  }
}

/** The X of a poorly patient's eye. */
function crossEye(x, y, w, color, sw) {
  const a = w * 0.55;
  return `<path d="M ${x - a} ${y - a * 0.8} l ${a * 2} ${a * 1.6} M ${x + a} ${y - a * 0.8} l ${-a * 2} ${a * 1.6}"
    stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
}

function heartEye(x, y, w) {
  const s = w / 11;   /* the sheet draws this heart against a spread of 11 */
  return `<path d="M ${x} ${y + 3 * s}
    C ${x - 8 * s} ${y - 5 * s} ${x - 6 * s} ${y - 12 * s} ${x} ${y - 8 * s}
    C ${x + 6 * s} ${y - 12 * s} ${x + 8 * s} ${y - 5 * s} ${x} ${y + 3 * s} Z" fill="${HEART}"/>`;
}

function tear(x, y, w) {
  const rx = w * 0.31, ry = w * 0.45;
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${TEAR}">
    <animate attributeName="cy" values="${y};${y + ry * 2.8};${y}" dur="2.4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite"/>
  </ellipse>`;
}

/** Mouth for a mood. */
export function mouth(mood, { y = 20, color = INK, scale = 1 } = {}) {
  const sw = 3.2 * scale;
  const s = scale;
  const line = (d) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;

  switch (mood) {
    case 'happy':
      return line(`M ${-11 * s} ${y} q ${11 * s} ${10 * s} ${22 * s} 0`);
    case 'proud':
      return line(`M ${-9 * s} ${y} q ${9 * s} ${11 * s} ${18 * s} 0`);
    case 'love':
      return line(`M ${-9 * s} ${y} q ${9 * s} ${11 * s} ${18 * s} 0`);
    case 'giggle':
      /* open laugh, with a tongue behind it */
      return `<path d="M ${-12 * s} ${y - 3 * s} q ${12 * s} ${16 * s} ${24 * s} 0 z" fill="${color}"/>
              <path d="M ${-6 * s} ${y + 3 * s} q ${6 * s} ${6 * s} ${12 * s} 0 z" fill="#FF8FA6"/>`;
    case 'sad':
      return line(`M ${-8 * s} ${y + 5 * s} q ${8 * s} ${-7 * s} ${16 * s} 0`);
    case 'scared':
      return `<ellipse cx="0" cy="${y + 5 * s}" rx="${6 * s}" ry="${7.5 * s}" fill="${color}"/>`;
    case 'sick':
      /* the queasy wave */
      return line(`M ${-11 * s} ${y + 5 * s} q ${5.5 * s} ${-8 * s} ${11 * s} 0 q ${5.5 * s} ${8 * s} ${11 * s} 0`);
    case 'sleepy':
      return `<ellipse cx="0" cy="${y + 3 * s}" rx="${5 * s}" ry="${6 * s}" fill="${color}" opacity=".85"/>`;
    case 'surprised':
      return `<ellipse cx="0" cy="${y + 4 * s}" rx="${6 * s}" ry="${7 * s}" fill="${color}"/>`;
    case 'confused':
      /* one corner up, one down */
      return line(`M ${-9 * s} ${y + 2 * s} q ${9 * s} ${6 * s} ${18 * s} ${-3 * s}`);
    case 'itchy':
      return line(`M ${-9 * s} ${y + 3 * s} q ${9 * s} ${-7 * s} ${18 * s} ${3 * s}`);
    default: // calm
      return line(`M ${-8 * s} ${y + 1 * s} q ${8 * s} ${6 * s} ${16 * s} 0`);
  }
}

/** Rosy cheeks — the single biggest "cute" lever there is. */
export function blush(mood, { w = 30, y = 14, color = BLUSH, opacity = 0.55 } = {}) {
  /* Moods that run hot get a deeper, wider flush. */
  const strong = mood === 'sick' || mood === 'love' || mood === 'giggle';
  const fill = strong ? BLUSH_STRONG : color;
  const op = strong ? 0.8 : opacity;
  const rx = w * (strong ? 0.28 : 0.245), ry = w * (strong ? 0.19 : 0.175);
  const cheek = (x) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${op}"/>`;
  /* sad and scared faces drain rather than flush */
  if (mood === 'sad' || mood === 'scared' || mood === 'surprised') return '';
  return cheek(-w) + cheek(w);
}

/**
 * The little drawn mark a mood wears beside the head — the sleeper's Z, the
 * puzzled ?, the proud star, the itch marks, the giggle's sparkles. Drawn,
 * never typed: there is no emoji anywhere in the rendered game.
 */
export function moodAura(mood, { y = -70, x = 24, scale = 1 } = {}) {
  const s = scale;
  switch (mood) {
    case 'sleepy':
      return `<path d="M ${x} ${y} h ${9 * s} l ${-9 * s} ${8 * s} h ${9 * s}"
        fill="none" stroke="${MUTE}" stroke-width="${2.6 * s}" stroke-linecap="round" stroke-linejoin="round">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -7; 0 0" dur="2.6s" repeatCount="indefinite"/>
      </path>`;
    case 'confused':
      return `<path d="M ${x} ${y + 2 * s} q ${7 * s} ${-4 * s} ${7 * s} ${3 * s} t ${-6 * s} ${4 * s} v ${3 * s}"
        fill="none" stroke="${MUTE}" stroke-width="${2.8 * s}" stroke-linecap="round">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -6; 0 0" dur="2.8s" repeatCount="indefinite"/>
      </path>`;
    case 'proud':
      return star(0, y, 7 * s);
    case 'itchy':
      return `<path d="M ${x} ${y + 6 * s} l ${6 * s} ${-6 * s} M ${x} ${y + 14 * s} h ${8 * s} M ${x - 2 * s} ${y} l ${3 * s} ${-7 * s}"
        stroke="${ITCH}" stroke-width="${2.8 * s}" stroke-linecap="round" fill="none"/>`;
    case 'giggle':
      return twinkle(-x - 4 * s, y + 4 * s, 2.4 * s, '1.8s') + twinkle(x + 4 * s, y, 2.4 * s, '2.2s');
    case 'love':
      return `<path d="M ${x} ${y + 8 * s} c ${-6 * s} ${-8 * s} ${-4 * s} ${-14 * s} ${0} ${-9 * s}
        c ${4 * s} ${-5 * s} ${6 * s} ${1 * s} ${0} ${9 * s} z" fill="${HEART}" opacity=".9">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="2.6s" repeatCount="indefinite"/>
      </path>`;
    default:
      return '';
  }
}

/** A five-pointed star, used for `proud` and for rewards. */
export function star(cx, cy, r, fill = STAR, stroke = STAR_EDGE) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`;
}

/** A four-pointed sparkle on the design's twinkle. */
function twinkle(cx, cy, r, dur) {
  return `<path d="M ${cx} ${cy - r * 2} l ${r} ${r} ${r} ${r * 0.5} -${r} ${r * 0.5} -${r} ${r * 2}
    -${r} -${r * 2} -${r} -${r * 0.5} ${r} -${r * 0.5} z" fill="${STAR}" opacity=".9">
    <animate attributeName="opacity" values=".25;1;.25" dur="${dur}" repeatCount="indefinite"/>
  </path>`;
}

/** Complete face bundle at the given origin. */
export function face(mood, opts = {}) {
  return eyes(mood, opts) + blush(mood, opts) + mouth(mood, opts);
}
