/**
 * Low-level child-friendly input helpers.
 *
 * Everything here is Pointer Events, so mouse / touch / pen behave the same.
 * The guiding rule: nothing should ever need precision. Targets are huge,
 * drags are forgiving, and every drag also works as two taps.
 */
import { h } from '../core/dom.js';
import { sfx } from '../core/audio.js';

const HIT_PADDING = 26; // makes every hotspot much bigger than it looks

/**
 * Make a tool chip draggable onto one of several hotspots.
 * Also supports tap-the-tool → tap-the-patient, which younger children
 * find far easier than a sustained drag.
 */
export function makeDraggable(chip, { getTargets, onPick, onDrop, onCancel, layer }) {
  let ghost = null;
  let armed = false;
  let startX = 0, startY = 0, moved = false;
  let activeTarget = null;

  const targetsNow = () => getTargets() || [];

  function makeGhost(x, y) {
    ghost = h('div', { class: 'tool-ghost' }, chip.dataset.icon || '🔧');
    (layer || document.body).appendChild(ghost);
    moveGhost(x, y);
  }

  function moveGhost(x, y) {
    if (!ghost) return;
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
  }

  function hitTest(x, y) {
    for (const t of targetsNow()) {
      const r = t.el.getBoundingClientRect();
      if (x >= r.left - HIT_PADDING && x <= r.right + HIT_PADDING &&
          y >= r.top - HIT_PADDING && y <= r.bottom + HIT_PADDING) return t;
    }
    return null;
  }

  function highlight(target) {
    if (activeTarget === target) return;
    activeTarget?.el.classList.remove('spot--over');
    activeTarget = target;
    activeTarget?.el.classList.add('spot--over');
  }

  function cleanup() {
    ghost?.remove();
    ghost = null;
    highlight(null);
    chip.classList.remove('tool--dragging');
  }

  function disarm() {
    armed = false;
    chip.classList.remove('tool--armed');
    document.removeEventListener('pointerdown', armedTap, true);
    cleanup();
    onCancel?.();
  }

  function armedTap(ev) {
    const target = hitTest(ev.clientX, ev.clientY);
    if (target) {
      ev.preventDefault();
      ev.stopPropagation();
      armed = false;
      chip.classList.remove('tool--armed');
      document.removeEventListener('pointerdown', armedTap, true);
      cleanup();
      onDrop(target, ev);
    } else if (!chip.contains(ev.target)) {
      disarm();
    }
  }

  function onPointerDown(ev) {
    if (chip.dataset.disabled === 'true') return;
    if (armed) { disarm(); return; }
    ev.preventDefault();
    chip.setPointerCapture?.(ev.pointerId);
    startX = ev.clientX; startY = ev.clientY; moved = false;
    chip.classList.add('tool--dragging');
    makeGhost(ev.clientX, ev.clientY);
    sfx.pickup();
    onPick?.();
    chip.addEventListener('pointermove', onPointerMove);
    chip.addEventListener('pointerup', onPointerUp);
    chip.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(ev) {
    if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) moved = true;
    moveGhost(ev.clientX, ev.clientY);
    highlight(hitTest(ev.clientX, ev.clientY));
  }

  function onPointerUp(ev) {
    chip.removeEventListener('pointermove', onPointerMove);
    chip.removeEventListener('pointerup', onPointerUp);
    chip.removeEventListener('pointercancel', onPointerUp);
    chip.releasePointerCapture?.(ev.pointerId);

    const target = hitTest(ev.clientX, ev.clientY);
    if (target) {
      cleanup();
      onDrop(target, ev);
      return;
    }

    if (!moved) {
      // A tap: arm the tool and wait for a tap on the patient.
      armed = true;
      chip.classList.add('tool--armed');
      cleanup();
      setTimeout(() => document.addEventListener('pointerdown', armedTap, true), 0);
      return;
    }

    cleanup();
    onCancel?.();
  }

  chip.addEventListener('pointerdown', onPointerDown);

  return () => {
    chip.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('pointerdown', armedTap, true);
    cleanup();
  };
}

/**
 * Press-and-hold gauge. Progress is kept if the child lets go, so nobody has
 * to start over — releasing just pauses.
 */
export function holdGauge(host, { ms = 1500, label = 'Hold still…', icon = '🩺', onDone }) {
  const ring = h('div', { class: 'gauge gauge--hold' },
    h('div', { class: 'gauge__icon' }, icon),
    h('svg', { class: 'gauge__ring', viewBox: '0 0 100 100', html:
      `<circle cx="50" cy="50" r="43" class="gauge__track"/>
       <circle cx="50" cy="50" r="43" class="gauge__fill"/>` }),
    h('div', { class: 'gauge__label' }, label));
  host.appendChild(ring);

  const fill = ring.querySelector('.gauge__fill');
  const LEN = 2 * Math.PI * 43;
  fill.style.strokeDasharray = LEN;
  fill.style.strokeDashoffset = LEN;

  let progress = 0, last = 0, raf = 0, holding = false, done = false;

  const tick = (t) => {
    if (done) return;
    if (last) {
      const dt = t - last;
      progress = Math.max(0, Math.min(1, progress + (holding ? dt / ms : -dt / (ms * 2.5))));
      fill.style.strokeDashoffset = LEN * (1 - progress);
      if (progress >= 1) {
        done = true;
        ring.classList.add('gauge--done');
        setTimeout(() => { ring.remove(); onDone?.(); }, 260);
        return;
      }
    }
    last = t;
    raf = requestAnimationFrame(tick);
  };

  const start = (ev) => { ev.preventDefault(); holding = true; ring.classList.add('gauge--pressing'); };
  const stop = () => { holding = false; ring.classList.remove('gauge--pressing'); };

  ring.addEventListener('pointerdown', start);
  document.addEventListener('pointerup', stop);
  document.addEventListener('pointercancel', stop);
  raf = requestAnimationFrame(tick);

  return () => {
    done = true;
    cancelAnimationFrame(raf);
    document.removeEventListener('pointerup', stop);
    document.removeEventListener('pointercancel', stop);
    ring.remove();
  };
}

/**
 * Swipe-back-and-forth gauge (cleaning, combing, wrapping).
 * Counts direction changes rather than distance, so a small wiggly finger
 * works just as well as a big confident swipe.
 */
export function rubGauge(host, { strokes = 6, label = 'Rub gently!', icon = '🧼', onStroke, onDone }) {
  const pad = h('div', { class: 'gauge gauge--rub' },
    h('div', { class: 'gauge__icon gauge__icon--rub' }, icon),
    h('div', { class: 'gauge__label' }, label),
    h('div', { class: 'gauge__pips' }, ...Array.from({ length: strokes }, () => h('i'))));
  host.appendChild(pad);

  const pips = [...pad.querySelectorAll('.gauge__pips i')];
  const glyph = pad.querySelector('.gauge__icon--rub');
  let count = 0, dir = 0, lastX = null, travel = 0, active = false, done = false;

  const down = (ev) => { active = true; lastX = ev.clientX; ev.preventDefault(); };
  const up = () => { active = false; lastX = null; };

  const move = (ev) => {
    if (!active || done) return;
    const rect = pad.getBoundingClientRect();
    glyph.style.transform = `translateX(${Math.max(-70, Math.min(70, ev.clientX - rect.left - rect.width / 2))}px) rotate(${(ev.clientX % 30) - 15}deg)`;
    if (lastX === null) { lastX = ev.clientX; return; }
    const dx = ev.clientX - lastX;
    if (Math.abs(dx) < 2) return;
    const nd = Math.sign(dx);
    travel += Math.abs(dx);
    if (dir !== 0 && nd !== dir && travel > 24) {
      count++; travel = 0;
      pips[count - 1]?.classList.add('on');
      onStroke?.(count);
      if (count >= strokes) {
        done = true;
        pad.classList.add('gauge--done');
        setTimeout(() => { pad.remove(); onDone?.(); }, 260);
        return;
      }
    }
    dir = nd;
    lastX = ev.clientX;
  };

  pad.addEventListener('pointerdown', down);
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', up);

  return () => {
    done = true;
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
    pad.remove();
  };
}
