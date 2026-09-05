/**
 * Tool artwork.
 *
 * All thirty-three tools in `data/tools.js`, drawn. The data keeps its
 * authored ids, names, tints, sounds and readouts exactly as they are — the
 * emoji sticker in each entry is simply no longer what gets rendered.
 *
 * Every tool is a 60x60 viewBox, stroked 3–5.5 with round caps and joins,
 * filled in the tool's own tint with a darker tint of itself as the line.
 * Each has a resting pose here; the hover lift and the action it performs
 * are CSS on top.
 */
import { outline, star } from './parts.js';

const PAPER = '#FFF9F0';
const STEEL = '#C9C4E0';
const STEEL_DEEP = '#8C86AD';

/* Each entry takes (c, d): the tool's tint and a darker tint of it. */
const ART = {
  stethoscope: (c, d) => `<path d="M16 10 v16 a14 14 0 0 0 28 0 V10" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>
    <path d="M30 40 v6 a8 8 0 0 0 16 0 v-4" fill="none" stroke="${d}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="46" cy="38" r="8" fill="${PAPER}" stroke="${c}" stroke-width="4.5"/>
    <circle cx="16" cy="9" r="3.4" fill="${d}"/><circle cx="44" cy="9" r="3.4" fill="${d}"/>`,

  thermometer: (c, d) => `<rect x="25" y="6" width="10" height="34" rx="5" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <circle cx="30" cy="46" r="9" fill="${c}" stroke="${d}" stroke-width="3"/>
    <rect x="28" y="22" width="4" height="20" rx="2" fill="${c}"/>
    <path d="M38 14 h6 M38 21 h4 M38 28 h6" stroke="${d}" stroke-width="2.6" stroke-linecap="round"/>`,

  scale: (c, d) => `<rect x="8" y="34" width="44" height="16" rx="6" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <rect x="18" y="38" width="24" height="8" rx="4" fill="${c}" opacity=".5"/>
    <circle cx="30" cy="20" r="12" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <path d="M30 20 l6-7" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`,

  ruler: (c, d) => `<rect x="20" y="6" width="20" height="48" rx="5" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <path d="M20 16 h8 M20 26 h12 M20 36 h8 M20 46 h12" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,

  wipe: (c, d) => `<rect x="10" y="18" width="40" height="28" rx="8" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <path d="M22 18 q8-10 16 0" fill="${c}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 30 q12 6 24 0" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`,

  antiseptic: (c, d) => `<rect x="20" y="18" width="20" height="34" rx="7" fill="${c}" stroke="${d}" stroke-width="3"/>
    <rect x="25" y="8" width="10" height="12" rx="4" fill="${STEEL}" stroke="${STEEL_DEEP}" stroke-width="2.4"/>
    <path d="M24 30 h12" stroke="${PAPER}" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="46" cy="16" r="3" fill="${c}" opacity=".7"/><circle cx="52" cy="24" r="2.2" fill="${c}" opacity=".5"/>`,

  bandage: (c, d) => `<g transform="rotate(-38 30 30)">
      <rect x="6" y="22" width="48" height="16" rx="8" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
      <rect x="20" y="22" width="20" height="16" fill="${c}" opacity=".45"/>
      <circle cx="26" cy="27" r="1.6" fill="${d}"/><circle cx="34" cy="27" r="1.6" fill="${d}"/>
      <circle cx="26" cy="33" r="1.6" fill="${d}"/><circle cx="34" cy="33" r="1.6" fill="${d}"/></g>`,

  penlight: (c, d) => `<rect x="34" y="12" width="12" height="30" rx="5" fill="${c}" stroke="${d}" stroke-width="3" transform="rotate(28 40 27)"/>
    <path d="M26 38 l-14 12 M22 32 l-14 6 M30 44 l-6 12" stroke="#FFD84D" stroke-width="3.4" stroke-linecap="round"/>`,

  otoscope: (c, d) => `<rect x="30" y="10" width="12" height="24" rx="5" fill="${c}" stroke="${d}" stroke-width="3"/>
    <path d="M30 34 l-14 14 a5 5 0 0 0 7 7 l14-14z" fill="${PAPER}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="20" cy="48" r="3.4" fill="#FFD84D"/>`,

  magnifier: (c, d) => `<circle cx="26" cy="24" r="15" fill="rgba(255,255,255,.55)" stroke="${c}" stroke-width="5"/>
    <path d="M37 35 l14 14" stroke="${d}" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M19 20 q4-6 10-4" fill="none" stroke="${PAPER}" stroke-width="3" stroke-linecap="round"/>`,

  oximeter: (c, d) => `<rect x="14" y="20" width="32" height="22" rx="8" fill="${c}" stroke="${d}" stroke-width="3"/>
    <rect x="20" y="26" width="20" height="11" rx="4" fill="${PAPER}"/>
    <path d="M22 32 h4 l2-4 3 8 3-6 2 2 h4" fill="none" stroke="${d}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,

  xray: (c, d) => `<rect x="8" y="8" width="44" height="44" rx="9" fill="#1F5E68"/>
    <path d="M30 18 v24 M22 24 h16 M24 34 h12" stroke="#BDE9E5" stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="30" cy="16" r="4" fill="#BDE9E5"/>`,

  microscope: (c, d) => `<rect x="12" y="48" width="36" height="6" rx="3" fill="${d}"/>
    <rect x="22" y="42" width="16" height="6" rx="3" fill="${PAPER}"/>
    <path d="M32 42 v-13 l10-10" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="44" cy="17" r="6" fill="${PAPER}" stroke="${c}" stroke-width="4"/>
    <rect x="20" y="35" width="20" height="4" rx="2" fill="${c}"/>`,

  oxygen: (c, d) => `<path d="M16 22 q14-10 28 0 v10 a14 14 0 0 1-28 0z" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <path d="M22 30 q8 6 16 0" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M30 46 v8" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="30" cy="54" r="4" fill="${c}"/>`,

  eyechart: (c, d) => `<rect x="10" y="8" width="40" height="44" rx="7" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <circle cx="30" cy="18" r="5" fill="${c}"/>
    <path d="M24 32 h12 l-6 8z" fill="${c}"/>
    <rect x="24" y="40" width="12" height="6" rx="2" fill="${c}" opacity=".6"/>`,

  ophthalmoscope: (c, d) => `<circle cx="24" cy="30" r="14" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <circle cx="24" cy="30" r="5" fill="${c}"/>
    <rect x="36" y="26" width="16" height="9" rx="4" fill="${c}" stroke="${d}" stroke-width="2.6"/>`,

  cast: (c, d) => `<path d="M20 10 q-6 20 0 40 h20 q6-20 0-40z" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <path d="M18 22 h24 M18 32 h24 M18 42 h24" stroke="${STEEL}" stroke-width="3" stroke-linecap="round"/>
    <path d="M40 14 l8 4 M42 46 l8-4" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,

  water: (c, d) => `<path d="M18 16 h24 l-4 34 a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <path d="M19 28 h22 l-3 22 a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill="${c}" opacity=".7"/>
    <path d="M30 8 q5 5 0 8 q-5-3 0-8z" fill="${c}"/>`,

  teddy: (c, d) => `<circle cx="30" cy="34" r="15" fill="${c}" stroke="${d}" stroke-width="3"/>
    <circle cx="17" cy="18" r="7" fill="${c}" stroke="${d}" stroke-width="3"/>
    <circle cx="43" cy="18" r="7" fill="${c}" stroke="${d}" stroke-width="3"/>
    <circle cx="25" cy="32" r="2.4" fill="#2E2A44"/><circle cx="35" cy="32" r="2.4" fill="#2E2A44"/>
    <ellipse cx="30" cy="39" rx="5" ry="4" fill="${PAPER}"/>`,

  comb: (c, d) => `<rect x="10" y="14" width="40" height="10" rx="5" fill="${c}" stroke="${d}" stroke-width="3"/>
    <path d="M14 24 v18 M20 24 v18 M26 24 v18 M32 24 v18 M38 24 v18 M44 24 v18"
      stroke="${d}" stroke-width="3" stroke-linecap="round"/>`,

  treat: (c, d) => `<path d="M16 22 h28 l-3 26 a5 5 0 0 1-5 4h-12a5 5 0 0 1-5-4z" fill="${c}" stroke="${d}" stroke-width="3"/>
    <path d="M20 22 q10-12 20 0" fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="25" cy="36" r="3" fill="${PAPER}"/><circle cx="35" cy="40" r="3" fill="${PAPER}"/>`,

  wingwrap: (c, d) => `<path d="M10 34 q14-20 34-16 q6 12-6 22 q-16 8-28-6z" fill="${PAPER}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M16 34 q12-12 26-10" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M14 42 q14 6 28-4" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`,

  gloves: (c, d) => `<path d="M18 52 v-18 q-6-2-6-8 t6-6 v-8 a4 4 0 0 1 8 0 v6 a4 4 0 0 1 8 0 v2 a4 4 0 0 1 8 0 v4 q4 2 4 8 v20z"
    fill="${c}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>`,

  monitor: (c, d) => `<rect x="6" y="12" width="48" height="34" rx="8" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <rect x="11" y="17" width="38" height="24" rx="5" fill="#1F5E68"/>
    <path d="M14 30 h7 l3-8 4 16 4-11 2 3 h12" fill="none" stroke="#5FE0C4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="30" cy="50" r="3" fill="${c}"/>`,

  needle: (c, d) => `<path d="M12 48 q18-6 26-16 t10-20" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
    <path d="M44 14 l6 6 -22 22 -8 2 2-8z" fill="${STEEL}" stroke="${STEEL_DEEP}" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="47" cy="17" r="2.4" fill="${PAPER}"/>`,

  stuffing: (c, d) => `<circle cx="24" cy="30" r="13" fill="${PAPER}" stroke="${d}" stroke-width="2.6"/>
    <circle cx="38" cy="24" r="9" fill="${PAPER}" stroke="${d}" stroke-width="2.6"/>
    <circle cx="38" cy="40" r="10" fill="${PAPER}" stroke="${d}" stroke-width="2.6"/>
    <circle cx="24" cy="30" r="4" fill="${c}" opacity=".3"/>`,

  button: (c, d) => `<circle cx="30" cy="30" r="18" fill="${c}" stroke="${d}" stroke-width="3"/>
    <circle cx="24" cy="26" r="3" fill="${PAPER}"/><circle cx="36" cy="26" r="3" fill="${PAPER}"/>
    <circle cx="24" cy="36" r="3" fill="${PAPER}"/><circle cx="36" cy="36" r="3" fill="${PAPER}"/>`,

  ribbon: (c, d) => `<path d="M30 18 q-14-14-18 0 q-2 10 18 12 q20-2 18-12 q-4-14-18 0z" fill="${c}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M24 32 l-6 20 12-8 12 8 -6-20z" fill="${c}" opacity=".8" stroke="${d}" stroke-width="2.6" stroke-linejoin="round"/>`,

  washtub: (c, d) => `<path d="M10 28 h40 l-4 20 a5 5 0 0 1-5 4H19a5 5 0 0 1-5-4z" fill="${PAPER}" stroke="${d}" stroke-width="3"/>
    <path d="M14 38 h32" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="22" cy="16" r="6" fill="${c}" opacity=".55"/><circle cx="36" cy="12" r="8" fill="${c}" opacity=".4"/>
    <circle cx="44" cy="20" r="4" fill="${c}" opacity=".5"/>`,

  fluffbrush: (c, d) => `<rect x="14" y="30" width="32" height="12" rx="6" fill="${c}" stroke="${d}" stroke-width="3"/>
    <path d="M18 30 v-8 M25 30 v-11 M32 30 v-11 M39 30 v-8" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
    <rect x="26" y="42" width="8" height="12" rx="4" fill="${d}"/>`,

  screwdriver: (c, d) => `<rect x="25" y="8" width="10" height="22" rx="4" fill="${c}" stroke="${d}" stroke-width="3"/>
    <rect x="27.5" y="28" width="5" height="18" rx="2" fill="${STEEL}" stroke="${STEEL_DEEP}" stroke-width="2"/>
    <path d="M27 46 h6 l-3 6z" fill="${STEEL_DEEP}"/>`,

  battery: (c, d) => `<rect x="12" y="18" width="34" height="26" rx="7" fill="${c}" stroke="${d}" stroke-width="3"/>
    <rect x="46" y="26" width="6" height="10" rx="3" fill="${d}"/>
    <path d="M30 22 l-6 12 h6 l-4 10 10-14h-6z" fill="#FFD84D" stroke="#E0AE12" stroke-width="1.6" stroke-linejoin="round"/>`,

  oil: (c, d) => `<path d="M14 32 h22 v-8 h-8 v-4 h18 v12 h4 l8-8 v8 q0 6-8 6 h-4 v14 a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z"
      fill="${c}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="52" cy="30" r="2.6" fill="#FFD84D"/>`,
};

/** A tool's artwork, in its own tint. */
export function toolArt(tool) {
  const c = tool?.tint || '#2FA8A0';
  const d = outline(c);
  const draw = ART[tool?.id];
  const inner = draw ? draw(c, d) : star(30, 30, 15, { fill: c, stroke: d });
  return `<svg viewBox="0 0 60 60" style="width:100%;height:100%;display:block" aria-hidden="true">${inner}</svg>`;
}

/** True when a tool has its own drawing. */
export function hasToolArt(id) { return !!ART[id]; }
