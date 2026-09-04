/**
 * Celebration effects: confetti, sparkle bursts, floating "+3 ⭐" numbers and
 * the toast lane used for gentle nudges. All effects are pure DOM so they
 * inherit the page's reduced-motion settings and cost nothing to load.
 */
import { h, rand, randI, pick } from './dom.js';
import { say } from './voice.js';

let layer = null;
let toastLane = null;

export function attachFx(el) {
  layer = el;
  toastLane = h('div', { class: 'toast-lane' });
  document.body.appendChild(toastLane);
}

const CONFETTI_COLORS = ['#ff7a6b', '#ffc844', '#3fd0a6', '#39b5f0', '#a97bf0', '#ff9ec4', '#ffffff'];

/**
 * Rain confetti from the top. `intensity` scales the piece count so a small
 * "nice one" and a level-10 finale can share the same call.
 */
export function confetti({ intensity = 1, duration = 2600 } = {}) {
  if (!layer) return;
  const count = Math.round(60 * intensity);
  for (let i = 0; i < count; i++) {
    const bit = h('div', { class: 'confetti-bit' });
    const size = rand(8, 16);
    Object.assign(bit.style, {
      left: `${rand(-5, 105)}vw`,
      top: '-6vh',
      width: `${size}px`,
      height: `${size * rand(0.6, 1.6)}px`,
      background: pick(CONFETTI_COLORS),
      borderRadius: Math.random() > 0.6 ? '50%' : '3px',
      opacity: '0',
    });
    layer.appendChild(bit);

    const drift = rand(-160, 160);
    const spin = rand(-900, 900);
    const anim = bit.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px, 112vh) rotate(${spin}deg)`, opacity: 1, offset: 0.92 },
        { transform: `translate(${drift}px, 118vh) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: duration * rand(0.7, 1.25), delay: rand(0, 700), easing: 'cubic-bezier(.25,.6,.4,1)', fill: 'forwards' }
    );
    anim.onfinish = () => bit.remove();
  }
}

const SPARKLE_GLYPHS = ['✨', '⭐', '💫', '🌟'];

/** A burst of sparkles centred on a screen point (or on an element). */
export function sparkle(target, { count = 14, glyphs = SPARKLE_GLYPHS } = {}) {
  if (!layer) return;
  const { x, y } = pointOf(target);
  for (let i = 0; i < count; i++) {
    const s = h('div', { class: 'spark' }, pick(glyphs));
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.fontSize = `${randI(16, 34)}px`;
    layer.appendChild(s);
    const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3);
    const dist = rand(60, 190);
    const anim = s.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(1.15) rotate(${rand(-180, 180)}deg)`, opacity: 0 },
      ],
      { duration: rand(650, 1150), easing: 'cubic-bezier(.15,.8,.3,1)', fill: 'forwards' }
    );
    anim.onfinish = () => s.remove();
  }
}

/** Floating "+50 🪙" text that drifts up from a point. */
export function floatText(target, text, color = '#fff') {
  if (!layer) return;
  const { x, y } = pointOf(target);
  const el = h('div', { class: 'floater' }, text);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  el.style.transform = 'translate(-50%,-50%)';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

/** Small hearts puffing out — used for kindness moments. */
export function hearts(target, count = 8) {
  sparkle(target, { count, glyphs: ['❤️', '💖', '💕', '🧡'] });
}

function pointOf(target) {
  if (!target) return { x: innerWidth / 2, y: innerHeight / 2 };
  if (typeof target.getBoundingClientRect === 'function') {
    const r = target.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: target.x ?? innerWidth / 2, y: target.y ?? innerHeight / 2 };
}

/**
 * Gentle nudge / praise banner. Never says "wrong" — see the copy in
 * engine/hints.js for the encouraging phrase pool.
 */
export function toast(text, { icon = '💡', tone = 'warm', ms = 2600, speak = true } = {}) {
  if (!toastLane) return;
  if (speak) say(text);
  const el = h('div', { class: `toast toast--${tone}` }, h('span', { style: { fontSize: '28px' } }, icon), h('span', {}, text));
  toastLane.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 320);
  }, ms);
  // Keep the lane short so the screen never fills with banners.
  while (toastLane.children.length > 3) toastLane.firstChild.remove();
}

/** Full-screen colour flash for big moments (room unlocked, level cleared). */
export function flash(color = 'rgba(255,255,255,.85)', ms = 420) {
  if (!layer) return;
  const el = h('div', { style: { position: 'absolute', inset: '0', background: color } });
  layer.appendChild(el);
  const anim = el.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: ms, easing: 'ease-out', fill: 'forwards' });
  anim.onfinish = () => el.remove();
}
