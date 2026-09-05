/**
 * Celebration effects: confetti, sparkle bursts, floating reward text and
 * the toast lane used for gentle nudges. All effects are pure DOM so they
 * inherit the page's reduced-motion settings and cost nothing to load.
 */
import { h, rand, randI, pick } from './dom.js';
import { icon } from '../ui/icons.js';
import { star, sparkle as sparkleMark } from '../ui/parts.js';
import { say } from './voice.js';

let layer = null;
let toastLane = null;

export function attachFx(el) {
  layer = el;
  toastLane = h('div', { class: 'lh-toast-lane' });
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
    const bit = h('div', { class: 'lh-confetti' });
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

/* Drawn marks, never typed: a four-pointed twinkle, a star, a heart. */
const MARKS = {
  spark: (r) => `<svg viewBox="0 0 24 24" style="width:${r}px">${sparkleMark(12, 12, 5)}</svg>`,
  star: (r) => `<svg viewBox="0 0 24 24" style="width:${r}px">${star(12, 12, 9)}</svg>`,
  heart: (r) => `<svg viewBox="0 0 24 24" style="width:${r}px"><path d="M12 20.5 C4 14 5.5 7 10 7c2.2 0 3.4 1.4 2 3 1.4-1.6 4.6-3 6.6-1 C22 11 20 16 12 20.5z" fill="#FF5F8D" stroke="#D8558C" stroke-width="1.2"/></svg>`,
};

/** A burst of sparkles centred on a screen point (or on an element). */
export function sparkle(target, { count = 14, mark = 'spark' } = {}) {
  if (!layer) return;
  const draw = MARKS[mark] || MARKS.spark;
  const { x, y } = pointOf(target);
  for (let i = 0; i < count; i++) {
    const s = h('div', { class: 'lh-spark', html: draw(randI(18, 34)) });
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
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

/** Floating reward text that drifts up from a point. */
export function floatText(target, text, color = '#fff') {
  if (!layer) return;
  const { x, y } = pointOf(target);
  const el = h('div', { class: 'lh-floater' }, text);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  el.style.transform = 'translate(-50%,-50%)';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

/** Small hearts puffing out — used for kindness moments. */
export function hearts(target, count = 8) {
  sparkle(target, { count, mark: 'heart' });
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
export function toast(text, { mark = null, tone = 'warm', ms = 2600, speak = true } = {}) {
  if (!toastLane) return;
  if (speak) say(text);
  // Drawn, never typed: a good-news toast ticks, a nudge lights a lamp.
  const el = h('div', { class: `lh-toast lh-toast--${tone}` },
    h('span', { class: 'lh-toast__mark', html: icon(mark || (tone === 'good' ? 'tick' : 'hint'), { size: 30 }) }),
    h('span', {}, text));
  toastLane.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
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


/**
 * One celebration language, everywhere: a star burst from the patient, then
 * three stars stamping in one at a time. Confetti is not fired here — it is
 * reserved for a new level or a new room.
 */
export function starBurst(target, count = 3) {
  if (!layer) return;
  const { x, y } = pointOf(target);
  for (let i = 0; i < 10; i++) {
    const el = h('div', { class: 'lh-spark', html: `<svg viewBox="0 0 24 24" style="width:26px">${star(12, 12, 9)}</svg>` });
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    layer.appendChild(el);
    const a = (Math.PI * 2 * i) / 10 + rand(-0.3, 0.3);
    const dist = rand(70, 150);
    el.animate([
      { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * dist * 0.5}px), calc(-50% + ${Math.sin(a) * dist * 0.5}px)) scale(1.1)`, opacity: 1, offset: 0.4 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(.5)`, opacity: 0 },
    ], { duration: 900, easing: 'cubic-bezier(.2,.9,.3,1)' }).onfinish = () => el.remove();
  }

  // Three stamps, .16s apart, rising — the reward beat of every case.
  const row = h('div', { class: 'lh-stamp-row' });
  for (let i = 0; i < count; i++) {
    row.appendChild(h('div', {
      class: 'lh-star-stamp',
      html: `<svg viewBox="0 0 24 24" style="width:54px">${star(12, 12, 10)}</svg>`,
    }));
  }
  row.style.left = `${x}px`;
  row.style.top = `${y}px`;
  layer.appendChild(row);
  setTimeout(() => row.remove(), 1800);
}
