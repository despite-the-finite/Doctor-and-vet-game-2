/**
 * Shared SVG primitives.
 *
 * One proportion rule holds across all three worlds: big head, soft body, no
 * visible foot detail. Everything drawn in the game is assembled from the
 * pieces below, so a human, an animal and a toy are the same figure with
 * different parts bolted on.
 *
 * Reference viewBoxes: humans `0 0 120 190`, animals and toys `0 0 130 190`.
 * Outlines are always a darker tint of the fill — never black, never grey.
 */

export const INK = '#2E2A44';

/** Read a hex colour, long or short form, as [r, g, b]. */
function rgb(c) {
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map((v) => v + v).join('');
  return h.match(/../g).map((v) => parseInt(v, 16));
}

const hex2 = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');

/** Mix two hex colours. `t` of 0 keeps `a`, 1 gives `b`. */
export function mix(a, b, t) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const ch = (x, y) => hex2(x + (y - x) * t);
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
}

/**
 * The outline for a fill: the same hue, taken darker.
 *
 * Mixing toward ink would drain the colour to grey, and the design is
 * explicit that an outline is a darker tint of its fill — never black,
 * never grey. So darken in HSL and leave the hue where it is.
 */
export function outline(fill, amount = 0.34) {
  const [r, g, b] = rgb(fill).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let hue = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  /* A near-neutral fill has no hue to darken into, and the design never
     wants a grey line, so it takes the warm ink-violet instead. */
  if (s < 0.08) return mix(fill, '#8C86AD', amount + 0.12);
  /* Calibrated against the design's own pair: fur #F7DDBB is outlined
     #C29061 — lightness down about a third, saturation down a little more. */
  const l2 = l * (1 - amount);
  const s2 = Math.max(0, s * (1 - amount * 1.2));
  const c = (1 - Math.abs(2 * l2 - 1)) * s2;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l2 - c / 2;
  const [rr, gg, bb] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x]
    : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return `#${hex2((rr + m) * 255)}${hex2((gg + m) * 255)}${hex2((bb + m) * 255)}`;
}

/** The soft ellipse that plants a character on the ground. */
export function contactShadow(cx, cy, rx = 34, ry = 7) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(46,42,68,.12)"/>`;
}

/** A head. Big, round, and the anchor every other part hangs off. */
export function head(cx, cy, r, fill, { line = null, lineWidth = 2.4 } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"
    stroke="${line || outline(fill)}" stroke-width="${lineWidth}"/>`;
}

/** A soft tapered body, narrower at the shoulder than the base. */
export function body(cx, top, bottom, halfTop, halfBottom, fill, { line = null } = {}) {
  const l = line || outline(fill);
  return `<path d="M ${cx - halfBottom} ${bottom}
    q ${-4} ${-(bottom - top) * 0.82} ${halfBottom - halfTop} ${-(bottom - top)}
    h ${halfTop * 2}
    q ${halfBottom - halfTop + 4} ${(bottom - top) * 0.82} ${halfBottom - halfTop} ${bottom - top} z"
    fill="${fill}" stroke="${l}" stroke-width="2.6" stroke-linejoin="round"/>`;
}

/** An ear: a rotated ellipse, leaning out from the head. */
export function ear(cx, cy, fill, { rx = 11, ry = 20, angle = 14, line = null, inner = null } = {}) {
  const l = line || outline(fill);
  const shell = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"
    stroke="${l}" stroke-width="2.2" transform="rotate(${angle} ${cx} ${cy})"/>`;
  if (!inner) return shell;
  return shell + `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.5}" ry="${ry * 0.55}" fill="${inner}"
    transform="rotate(${angle} ${cx} ${cy})"/>`;
}

/** An arm or a leg — a round-capped stroke, so there is no foot to draw. */
export function limb(d, fill, { width = 14 } = {}) {
  return `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${width}"
    stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A tail that wags. */
export function tail(d, fill, { width = 12, wag = true } = {}) {
  const anim = wag ? ' class="lh-tail-wag"' : '';
  return `<g${anim} style="transform-origin:${d.split(' ')[1]}px ${d.split(' ')[2]}px">
    <path d="${d}" fill="none" stroke="${fill}" stroke-width="${width}" stroke-linecap="round"/>
  </g>`;
}

/** A five-pointed star. The reward language of the whole game. */
export function star(cx, cy, r, { fill = '#FFD84D', stroke = '#E0AE12', width = 1.2 } = {}) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}"
    stroke-width="${width}" stroke-linejoin="round"/>`;
}

/** A four-pointed sparkle that twinkles on its own clock. */
export function sparkle(cx, cy, r, { fill = '#FFD84D', dur = '2s' } = {}) {
  return `<path d="M ${cx} ${cy - r * 2} l ${r} ${r} ${r} ${r * 0.5} -${r} ${r * 0.5} -${r} ${r * 2}
    -${r} -${r * 2} -${r} -${r * 0.5} ${r} -${r * 0.5} z" fill="${fill}" opacity=".9">
    <animate attributeName="opacity" values=".25;1;.25" dur="${dur}" repeatCount="indefinite"/>
  </path>`;
}

/** The red cross plate that marks the hospital. */
export function cross(cx, cy, size, fill = '#E8556D') {
  const t = size * 0.2;       /* arm thickness */
  const l = size * 0.733;     /* arm length */
  return `<rect x="${cx - t / 2}" y="${cy - l / 2}" width="${t}" height="${l}" rx="${t / 2}" fill="${fill}"/>
          <rect x="${cx - l / 2}" y="${cy - t / 2}" width="${l}" height="${t}" rx="${t / 2}" fill="${fill}"/>`;
}

/** The belly patch a soft toy wears, with its stitching. */
export function bellyPatch(cx, cy, fill = '#F3EBFF', { rx = 18, ry = 17, stitch = null } = {}) {
  const seam = stitch
    ? `<path d="M ${cx - rx} ${cy} a ${rx} ${ry} 0 0 0 ${rx * 2} 0" fill="none"
         stroke="${stitch}" stroke-width="2.4" stroke-dasharray="5 6" opacity=".5" stroke-linecap="round"/>`
    : '';
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>${seam}`;
}

/** A run of stitching along a seam. */
export function stitching(d, color = '#8F5FD6') {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.4"
    stroke-dasharray="5 6" stroke-linecap="round" opacity=".5"/>`;
}

/** A pair of eyes that blink on their own clock. */
export function blinker(inner, dur = '5s') {
  return `<g class="lh-blink" style="animation:lh-blink ${dur} infinite">${inner}</g>`;
}

/** Wrap a group so it breathes from its feet. */
export function breathing(inner, { dur = '3.4s', origin = 'bottom center' } = {}) {
  return `<g style="animation:lh-breathe ${dur} ease-in-out infinite; transform-origin:${origin}">${inner}</g>`;
}
