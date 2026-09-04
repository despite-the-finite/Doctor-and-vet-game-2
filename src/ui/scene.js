/**
 * Scenes: the four depth planes every screen is built from.
 *
 *   sky   — the gradient and whatever floats in it
 *   far   — distant scenery, hazed back so it reads as distance
 *   room  — the building, the road, the room shell: where the action is
 *   fore  — props in front of the action, plus the light and vignette
 *
 * Rooms and scenery are built from big soft organic shapes. Rectangles only
 * appear inside furniture. Nothing here is an emoji or an image: every prop
 * is drawn.
 */
import { h } from '../core/dom.js';
import { outline, sparkle, cross } from './parts.js';

/** Build a scene. Each layer is a list of markup strings. */
export function scene({ world = 'doctor', sky = [], far = [], room = [], fore = [], light = true } = {}) {
  const plane = (name, parts) =>
    h('div', { class: `lh-scene__${name}`, html: parts.filter(Boolean).join('\n') });

  const el = h('div', { class: 'lh-scene', 'data-world': world },
    plane('sky', sky),
    plane('far', far),
    plane('room', room),
    plane('fore', fore));

  if (light) {
    el.appendChild(h('div', { class: 'lh-scene__light' }));
    el.appendChild(h('div', { class: 'lh-scene__vignette' }));
  }
  return el;
}

/* ------------------------------------------------------------------ sky */

/** A soft cloud that drifts across the whole scene. */
export function cloud({ top = 80, w = 230, hgt = 74, opacity = 0.94, dur = 52, delay = 0 } = {}) {
  return `<div style="position:absolute; left:0; top:${top}px; width:${w}px; height:${hgt}px;
    border-radius:999px; background:#FFFFFF; opacity:${opacity};
    animation:lh-drift-vw ${dur}s linear infinite; animation-delay:${delay}s;"></div>`;
}

/** The sun, with its glow and a slow dashed halo. */
export function sunDisc({ right = 96, top = 60, size = 120, fill = '#FFE08A' } = {}) {
  return `<div style="position:absolute; right:${right}px; top:${top}px; width:${size}px; height:${size}px;
      border-radius:50%; background:${fill}; box-shadow:0 0 90px 40px rgba(255,224,138,.55);"></div>
    <div style="position:absolute; right:${right - 20}px; top:${top - 20}px;
      width:${size + 40}px; height:${size + 40}px; border-radius:50%;
      border:5px dashed rgba(255,255,255,.5); animation:lh-halo 7s ease-in-out infinite;"></div>`;
}

/** A little flock, drawn as two strokes each. */
export function birds({ left = 180, top = 120 } = {}) {
  const one = (w, op) => `<svg viewBox="0 0 40 20" style="width:${w}px">
    <path d="M4 12 q8-9 16 0 q8-9 16 0" fill="none" stroke="${'#2E2A44'}" stroke-width="3" stroke-linecap="round"/></svg>`;
  return `<div style="position:absolute; left:${left}px; top:${top}px; display:flex; gap:26px;
    animation:lh-bob 5s ease-in-out infinite;">${one(34)}${one(26, .8)}${one(30, .9)}</div>`;
}

/** The air ambulance, crossing high and slow. */
export function helicopter({ top = 130, w = 120 } = {}) {
  return `<div style="position:absolute; right:0; top:${top}px; width:${w}px;
      animation:lh-drift-vw 40s linear infinite reverse;">
    <svg viewBox="0 0 120 60" style="width:100%; display:block;">
      <ellipse cx="52" cy="36" rx="26" ry="15" fill="#E8556D"/>
      <path d="M74 34 q22 2 30 8 q-14 4-30 2z" fill="#C43C53"/>
      <circle cx="44" cy="34" r="8" fill="#DFF6F4"/>
      <rect x="46" y="14" width="6" height="10" rx="3" fill="#C43C53"/>
      <rect x="10" y="10" width="86" height="5" rx="2.5" fill="#2E2A44" style="animation:lh-sway .35s linear infinite"/>
      <rect x="40" y="49" width="30" height="4" rx="2" fill="#2E2A44"/>
    </svg></div>`;
}

/* ------------------------------------------------------------------ far */

/** A hill: a half-ellipse, never a rectangle. */
export function hill({ side = 'left', offset = -8, bottom = 210, w = 62, hgt = 230, fill = '#8FD9A0' } = {}) {
  return `<div style="position:absolute; ${side}:${offset}%; bottom:${bottom}px; width:${w}%; height:${hgt}px;
    border-radius:50% 50% 0 0 / 100% 100% 0 0; background:${fill};"></div>`;
}

/** The haze that pushes a plane back into the distance. */
export function haze({ bottom = 196, hgt = 260, strength = 0.3 } = {}) {
  return `<div style="position:absolute; left:0; bottom:${bottom}px; width:100%; height:${hgt}px;
    pointer-events:none; background:linear-gradient(180deg, rgba(255,255,255,0) 0%,
    rgba(255,255,255,${strength}) 78%, rgba(255,255,255,${Math.min(1, strength + 0.1)}) 100%);"></div>`;
}

/** A round-canopy tree. */
export function treeRound({ side = 'left', offset = 96, bottom = 214, w = 96, fill = '#4FBF6E', dur = 8 } = {}) {
  const lite = '#5FCB7C';
  return `<div style="position:absolute; ${side}:${offset}px; bottom:${bottom}px; width:${w}px;
      animation:lh-sway ${dur}s ease-in-out infinite; transform-origin:bottom center;">
    <svg viewBox="0 0 100 130" style="width:100%; display:block;">
      <rect x="44" y="70" width="14" height="56" rx="7" fill="#8A5A3B"/>
      <circle cx="50" cy="52" r="34" fill="${fill}"/>
      <circle cx="28" cy="66" r="22" fill="${lite}"/>
      <circle cx="72" cy="66" r="22" fill="${lite}"/>
    </svg></div>`;
}

/** A pine. */
export function treePine({ side = 'right', offset = 120, bottom = 206, w = 74, dur = 10 } = {}) {
  return `<div style="position:absolute; ${side}:${offset}px; bottom:${bottom}px; width:${w}px;
      animation:lh-sway ${dur}s ease-in-out infinite; transform-origin:bottom center;">
    <svg viewBox="0 0 100 130" style="width:100%; display:block;">
      <rect x="44" y="74" width="12" height="52" rx="6" fill="#8A5A3B"/>
      <path d="M50 8 L84 78 H16 Z" fill="#3EA85D"/>
      <path d="M50 30 L78 86 H22 Z" fill="#4FBF6E"/>
    </svg></div>`;
}

/* ----------------------------------------------------------------- room */

/**
 * The hospital: a white block under a teal sign band, a cross plate on the
 * roof, lit windows, a glass door and a marigold wing.
 */
export function hospital({ bottom = 150, w = 640, hgt = 400 } = {}) {
  const win = (fill, twinkleDur) => `<div style="width:60px; height:74px; border-radius:14px;
    background:${fill}; box-shadow:inset 0 0 0 6px #FFFFFF;
    ${twinkleDur ? `animation:lh-twinkle ${twinkleDur}s ease-in-out infinite;` : ''}"></div>`;

  return `<div style="position:absolute; left:50%; bottom:${bottom}px; transform:translateX(-50%);
      width:${w}px; height:${hgt}px;">
    <div style="position:absolute; left:60px; bottom:0; width:520px; height:260px;
      border-radius:26px 26px 12px 12px; background:linear-gradient(180deg,#FFFFFF,#F4EFE6);
      box-shadow:0 12px 0 #D9CFC0, 0 26px 44px rgba(46,42,68,.2);"></div>
    <div style="position:absolute; left:30px; bottom:248px; width:580px; height:74px;
      border-radius:26px 26px 8px 8px; background:linear-gradient(180deg,#3FB8AF,#2FA8A0);
      box-shadow:0 8px 0 #1F7E78;"></div>
    <div style="position:absolute; left:50%; bottom:306px; transform:translateX(-50%);
      width:112px; height:112px; border-radius:30px; background:#FFFFFF;
      box-shadow:0 8px 0 #D9CFC0; display:grid; place-items:center;">
      <svg viewBox="0 0 60 60" style="width:74px">${cross(30, 30, 60)}</svg>
    </div>
    <div style="position:absolute; left:50%; bottom:296px; transform:translateX(-50%);
      width:150px; height:150px; border-radius:50%; background:rgba(255,216,77,.45);
      animation:lh-pulse 3.4s ease-out infinite;"></div>

    <div style="position:absolute; left:96px; bottom:150px; display:flex; gap:22px;">
      ${win('#FFE08A')}${win('#FFD05A', 6)}${win('#FFE08A')}${win('#D9F3F1')}${win('#FFE08A', 8)}
    </div>

    <div style="position:absolute; left:106px; bottom:66px; width:120px; height:82px;
      border-radius:16px; background:#C9F0EC; box-shadow:inset 0 0 0 7px #FFFFFF;"></div>

    <div style="position:absolute; right:96px; bottom:0; width:150px; height:170px;
      border-radius:24px 24px 0 0; background:linear-gradient(180deg,#FFE08A,#FFD05A);
      box-shadow:inset 0 0 0 8px #FFFFFF;"></div>
    <div style="position:absolute; right:130px; bottom:110px; width:82px; height:44px;
      border-radius:12px; background:#2FA8A0; display:grid; place-items:center;
      font-family:var(--lh-font-display); font-weight:800; font-size:16px;
      color:#FFF9F0; letter-spacing:1px;">OPEN</div>
  </div>`;
}

/** A dog watching from the window of the vet wing. */
export function windowDog({ left = 124, bottom = 72, w = 64 } = {}) {
  return `<div style="position:absolute; left:${left}px; bottom:${bottom}px; width:${w}px;
      animation:lh-bob 3.6s ease-in-out infinite;">
    <svg viewBox="0 0 80 70" style="width:100%; display:block;">
      <ellipse cx="40" cy="52" rx="22" ry="16" fill="#F2CFA6" stroke="#C29061" stroke-width="2.4"/>
      <ellipse cx="19" cy="28" rx="8" ry="13" fill="#E0AE7C" stroke="#C29061" stroke-width="2.2" transform="rotate(-18 19 28)"/>
      <ellipse cx="61" cy="28" rx="8" ry="13" fill="#E0AE7C" stroke="#C29061" stroke-width="2.2" transform="rotate(18 61 28)"/>
      <circle cx="40" cy="28" r="21" fill="#F7DDBB" stroke="#C29061" stroke-width="2.4"/>
      <g style="animation:lh-blink 4.4s infinite"><circle cx="33" cy="25" r="3.4" fill="#2E2A44"/><circle cx="47" cy="25" r="3.4" fill="#2E2A44"/></g>
      <ellipse cx="40" cy="33" rx="5" ry="3.8" fill="#8A5A3B"/>
      <path d="M35 40 q5 4 10 0" fill="none" stroke="#8A5A3B" stroke-width="2.2" stroke-linecap="round"/>
    </svg></div>`;
}

/* ----------------------------------------------------------------- fore */

/** Grass, then road, then the dashes down the middle of it. */
export function road({ grass = 152, kerb = 44, hgt = 64 } = {}) {
  return `<div style="position:absolute; left:0; bottom:0; width:100%; height:${grass}px;
      background:linear-gradient(180deg,#6DBE85,#57A96F);"></div>
    <div style="position:absolute; left:0; bottom:${kerb}px; width:100%; height:${hgt}px; background:#8C87A8;"></div>
    <div style="position:absolute; left:0; bottom:${kerb + 28}px; width:100%; height:8px;
      background:repeating-linear-gradient(90deg,#FFF9F0 0 46px, transparent 46px 92px);"></div>`;
}

/** The ambulance pulling up outside. */
export function ambulance({ bottom = 46, w = 190 } = {}) {
  return `<div style="position:absolute; left:0; bottom:${bottom}px; width:${w}px;
      animation:lh-drive-in 9s cubic-bezier(.25,.9,.3,1) infinite;">
    <svg viewBox="0 0 190 90" style="width:100%; display:block;">
      <rect x="14" y="26" width="150" height="42" rx="14" fill="#FFF9F0" stroke="#D9CFC0" stroke-width="3"/>
      <path d="M112 26 h34 q16 0 20 16 v12 h-54z" fill="#FFF9F0" stroke="#D9CFC0" stroke-width="3"/>
      <rect x="118" y="32" width="26" height="18" rx="6" fill="#C9F0EC"/>
      <rect x="30" y="38" width="20" height="8" rx="4" fill="#E8556D"/>
      <rect x="36" y="32" width="8" height="20" rx="4" fill="#E8556D"/>
      <rect x="60" y="40" width="44" height="6" rx="3" fill="#2FA8A0"/>
      <rect x="86" y="14" width="22" height="12" rx="6" fill="#5EC8F0" style="animation:lh-twinkle 1.2s infinite"/>
      <circle cx="52" cy="72" r="14" fill="#2E2A44"/><circle cx="52" cy="72" r="6" fill="#8C87A8"/>
      <circle cx="132" cy="72" r="14" fill="#2E2A44"/><circle cx="132" cy="72" r="6" fill="#8C87A8"/>
    </svg></div>`;
}

/** Motes of light for the toy world's dusk. */
export function motes(count = 14) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = (i * 83) % 100, y = (i * 47) % 90, r = 2 + (i % 3);
    out += `<svg viewBox="0 0 20 20" style="position:absolute; left:${x}%; top:${y}%; width:${r * 6}px;
      animation:lh-twinkle ${3 + (i % 5)}s ease-in-out infinite; animation-delay:-${i * 0.7}s;">
      ${sparkle(10, 10, 4, { fill: '#FFE08A' })}</svg>`;
  }
  return out;
}
