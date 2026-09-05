/**
 * `scan` — the X-ray machine and the microscope.
 *
 * Two phases:
 *   1. line it up  (drag a frame over the body part, or twist a focus dial)
 *   2. fire it     (a big satisfying button, a whirr, a reveal)
 * then the child reads the picture and says what they can see.
 */
import { icon } from '../../ui/icons.js';
import { h, wait, shuffle } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { sparkle, toast, flash } from '../../core/fx.js';
import { scanArt } from '../arts.js';
import { praise, nudge, TRIES_BEFORE_REVEAL } from '../hints.js';

export function runScan(step, ctx) {
  const cleanups = [];
  ctx.setPrompt(step.prompt, ctx.little ? null : step.aimHint);

  const machine = h('div', { class: `scanner scanner--${step.mode}` });
  ctx.bodyEl.appendChild(machine);

  if (step.mode === 'micro') aimMicroscope(); else aimXray();

  /* ---------------------------------------------------------- aiming: X-ray */
  function aimXray() {
    const spot = ctx.hotspot(step.target || 'chest') || ctx.patientEl.querySelector('[data-spot="chest"]');
    const frame = h('div', { class: 'xray-frame' },
      h('div', { class: 'xray-frame__corner tl' }), h('div', { class: 'xray-frame__corner tr' }),
      h('div', { class: 'xray-frame__corner bl' }), h('div', { class: 'xray-frame__corner br' }),
      h('div', { class: 'xray-frame__hint' }));

    // Show the child exactly where the camera needs to end up.
    const marker = h('div', { class: 'spot-marker' },
      h('div', { class: 'spot-marker__ring' }), h('div', { class: 'spot-marker__dot' }, '🎯'));
    const placeMarker = () => {
      if (!spot) return;
      const s = spot.getBoundingClientRect();
      const o = ctx.overlay.getBoundingClientRect();
      marker.style.left = `${s.left + s.width / 2 - o.left}px`;
      marker.style.top = `${s.top + s.height / 2 - o.top}px`;
    };
    ctx.overlay.append(marker, frame);
    placeMarker();
    window.addEventListener('resize', placeMarker);
    // Same as the tool step: the panel grows under the stage, so the target
    // has to be re-placed rather than measured once and left behind.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(placeMarker) : null;
    ro?.observe(ctx.overlay);
    cleanups.push(() => {
      ro?.disconnect();
      window.removeEventListener('resize', placeMarker);
      marker.remove();
    });

    // Start away from the target — but low, clear of the speech bubbles.
    let pos = { x: 20, y: 66 };
    const apply = () => { frame.style.left = `${pos.x}%`; frame.style.top = `${pos.y}%`; };
    apply();

    let dragging = false;
    const rectOf = () => ctx.overlay.getBoundingClientRect();

    const down = (ev) => { dragging = true; frame.setPointerCapture?.(ev.pointerId); ev.preventDefault(); sfx.pickup(); };
    const move = (ev) => {
      if (!dragging) return;
      const r = rectOf();
      pos = { x: ((ev.clientX - r.left) / r.width) * 100, y: ((ev.clientY - r.top) / r.height) * 100 };
      apply();
      frame.classList.toggle('xray-frame--locked', isOver());
    };
    const up = () => { dragging = false; if (isOver()) sfx.select(); };

    function isOver() {
      if (!spot) return true;
      const s = spot.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      return Math.hypot((f.left + f.width / 2) - (s.left + s.width / 2),
                        (f.top + f.height / 2) - (s.top + s.height / 2)) < 90;
    }

    frame.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);

    const fire = h('button', { class: 'lh-btn lh-btn--toy lh-btn--wide scan-fire', onClick: () => {
      if (!isOver()) { toast('Line the camera up with the glowing spot first!', {}); return; }
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      frame.classList.add('xray-frame--firing');
      marker.remove();
      shoot(() => frame.remove());
    } }, 'TAKE THE PICTURE');
    machine.appendChild(fire);

    cleanups.push(() => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      frame.remove();
    });
  }

  /* ----------------------------------------------------- aiming: microscope */
  function aimMicroscope() {
    const view = h('div', { class: 'micro-view' }, h('div', { class: 'micro-blur', html: scanArt(step.revealArt) }));
    const dial = h('input', { class: 'micro-dial', type: 'range', min: '0', max: '100', value: '4', 'aria-label': 'Focus dial' });
    const blur = view.querySelector('.micro-blur');

    const onInput = () => {
      const v = Number(dial.value);
      // Sharpest at 72 — the child hunts for the sweet spot.
      const off = Math.abs(v - 72) / 72;
      blur.style.filter = `blur(${(off * 14).toFixed(1)}px)`;
      blur.style.opacity = String(0.55 + (1 - off) * 0.45);
      const sharp = off < 0.09;
      view.classList.toggle('micro-view--sharp', sharp);
      fire.disabled = !sharp;
      fire.textContent = sharp ? 'LOOK CLOSER!' : 'Keep twisting the dial…';
    };
    dial.addEventListener('input', onInput);

    const fire = h('button', { class: 'lh-btn lh-btn--primary lh-btn--wide scan-fire', onClick: () => shoot(() => {}) }, 'Keep twisting the dial…');
    machine.appendChild(view);
    machine.appendChild(h('div', { class: 'micro-dial-wrap' },
      h('span', { class: 'micro-dial__mark', html: icon('magnify-small') }), dial,
      h('span', { class: 'micro-dial__mark', html: icon('magnify-big') })));
    machine.appendChild(fire);
    onInput();
  }

  /* ------------------------------------------------------------- the reveal */
  async function shoot(cleanupAim) {
    sfx.scan();
    ctx.setPrompt(step.mode === 'micro' ? 'Focusing…' : 'Whirrrr… hold still…');
    machine.innerHTML = '';
    machine.appendChild(h('div', { class: 'scan-loading' },
      h('div', { class: 'scan-loading__bar' }, h('i')),
      h('div', {}, step.mode === 'micro' ? 'zooming in…' : 'taking the picture…')));

    await wait(1200);
    cleanupAim();
    flash('rgba(180,225,255,.7)', 420);
    machine.innerHTML = '';

    const plate = h('div', { class: `scan-plate scan-plate--${step.mode}`, html: scanArt(step.revealArt) });
    machine.appendChild(plate);
    machine.appendChild(h('div', { class: 'scan-caption' }, ctx.fill(step.revealCaption || 'Look at that!')));
    ctx.say('narrator', step.revealCaption || 'Look at that!');
    sparkle(plate, { count: 12, glyphs: ['✨', '💫'] });

    await wait(700);
    askFinding();
  }

  function askFinding() {
    ctx.setPrompt('What can you see?');
    const options = ctx.little ? littleOptions(step.findings) : shuffle(step.findings);
    const row = h('div', { class: 'choice-grid choice-grid--chips' });
    let tries = 0, solved = false;

    options.forEach((opt) => {
      const card = h('button', { class: 'choice choice--chips', onClick: () => pickFinding(opt, card) },
        h('span', { class: 'choice__icon' }, opt.icon),
        h('span', { class: 'choice__label' }, ctx.fill(opt.label)));
      if (opt.correct) card.dataset.correct = 'true';
      row.appendChild(card);
    });
    machine.appendChild(row);
    ctx.speakOptions(options.map((o) => o.label), { lead: 'Is it:' });

    async function pickFinding(opt, card) {
      if (solved) return;
      if (!opt.correct) {
        tries++;
        ctx.noteMistake();
        sfx.nudge();
        card.classList.add('choice--wobble');
        setTimeout(() => card.classList.remove('choice--wobble'), 520);
        toast(ctx.fill(step.nudge || nudge()));
        if (tries >= TRIES_BEFORE_REVEAL) row.querySelector('[data-correct]')?.classList.add('choice--glow');
        return;
      }
      solved = true;
      row.querySelectorAll('.choice').forEach((c) => { c.disabled = true; if (c !== card) c.classList.add('choice--dim'); });
      card.classList.add('choice--right');
      sfx.great();
      sparkle(card, { count: 16 });
      ctx.award({ stars: step.stars ?? 2 }, card);
      ctx.setPrompt(praise());
      if (opt.say) ctx.say('narrator', opt.say);
      else ctx.say('narrator', `You found it — ${ctx.fill(opt.label)}.`);
      ctx.teach(step.teach || null);
      ctx.react('happy');
      await wait(600);
      ctx.continueButton('Next', machine);
    }
  }

  function littleOptions(all) {
    const correct = all.find((o) => o.correct) || all[0];
    const other = all.filter((o) => o !== correct).find((o) => o.easy) || all.find((o) => o !== correct);
    return shuffle([correct, other].filter(Boolean));
  }

  return () => cleanups.forEach((c) => c());
}
