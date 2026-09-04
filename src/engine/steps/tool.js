/**
 * `tool` — drag a piece of equipment onto the patient.
 *
 * This is the signature interaction of the game, so it is the most forgiving:
 * huge hotspots, drag OR two taps, the right tool glows in Little Helper mode,
 * and picking the wrong tool just gets a friendly "not that one!".
 */
import { h, wait } from '../../core/dom.js';
import { sfx, play } from '../../core/audio.js';
import { sparkle, toast } from '../../core/fx.js';
import { getTool } from '../../data/tools.js';
import { makeDraggable, holdGauge, rubGauge } from '../interactions.js';
import { praise, wrongToolMessage, TRIES_BEFORE_REVEAL } from '../hints.js';
import { readout } from './readout.js';

export function runTool(step, ctx) {
  const tool = getTool(step.tool);
  if (!tool) { ctx.next(); return; }

  ctx.setPrompt(step.prompt, ctx.little ? null : step.hint);
  if (step.mood) ctx.setMood(step.mood);

  /* --- glowing target on the patient -----------------------------------
     If a case names a hotspot this species does not have, fall back to the
     whole patient rather than leaving a child with nowhere to drop the tool. */
  let spot = ctx.hotspot(step.target);
  if (!spot) {
    console.warn(`[tool] "${step.target}" is not a hotspot on this patient — using the whole patient instead`);
    spot = ctx.patientEl.querySelector('[data-spot="chest"]') || ctx.patientWrap;
  }
  const marker = h('div', { class: 'spot-marker' },
    h('div', { class: 'spot-marker__ring' }),
    h('div', { class: 'spot-marker__dot' }, tool.icon));
  ctx.overlay.appendChild(marker);
  const positionMarker = () => {
    // Changing the patient's mood re-renders the SVG, so the old hotspot node
    // can be detached by the time a resize fires.
    if (!spot.isConnected) return;
    const s = spot.getBoundingClientRect();
    const o = ctx.overlay.getBoundingClientRect();
    marker.style.left = `${s.left + s.width / 2 - o.left}px`;
    marker.style.top = `${s.top + s.height / 2 - o.top}px`;
  };
  positionMarker();
  const onResize = () => positionMarker();
  window.addEventListener('resize', onResize);
  /* The stage shrinks as the panel below it fills up — the tray, then a
     readout card — and the marker was placed against the taller stage, so the
     glowing target ended up ~50px below the hotspot it was supposed to mark.
     Watching the overlay keeps the glow on the spot the drop actually tests. */
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
  ro?.observe(ctx.overlay);

  /* --- the tool tray ---------------------------------------------------- */
  const tray = h('div', { class: 'tool-tray' });
  const trayTools = buildTray(step, ctx.little);
  const cleaners = [];
  let solved = false;
  let tries = 0;

  trayTools.forEach((id) => {
    const t = getTool(id);
    if (!t) return;
    const chip = h('button', {
      class: 'tool' + (id === step.tool ? ' tool--needed' : ''),
      dataset: { icon: t.icon, tool: id },
      style: { '--tool-tint': t.tint },
      title: t.name,
    }, h('span', { class: 'tool__icon' }, t.icon), h('span', { class: 'tool__name' }, t.name));

    // Little Helper mode literally points at the right tool.
    if (ctx.little && id === step.tool) chip.classList.add('tool--glow');

    cleaners.push(makeDraggable(chip, {
      layer: document.getElementById('fx'),
      getTargets: () => [{ el: spot, name: step.target }],
      onDrop: () => onDrop(id, chip),
    }));

    tray.appendChild(chip);
  });

  ctx.bodyEl.appendChild(tray);
  // On a short screen the panel can open already scrolled past the tray.
  requestAnimationFrame(() => tray.scrollIntoView({ block: 'nearest' }));

  // A nudge if nothing happens for a while — never blocking, just helpful.
  const idleTimer = setTimeout(() => {
    if (!solved) {
      toast(ctx.fill(step.hint || `Try the ${tool.name.toLowerCase()}!`), { icon: tool.icon });
      tray.querySelector('.tool--needed')?.classList.add('tool--glow');
    }
  }, ctx.little ? 5000 : 11000);

  async function onDrop(id, chip) {
    if (solved) return;

    if (id !== step.tool) {
      tries++;
      ctx.noteMistake();
      sfx.nudge();
      chip.classList.add('tool--shake');
      setTimeout(() => chip.classList.remove('tool--shake'), 500);
      toast(wrongToolMessage(getTool(id)), { icon: '💡' });
      if (tries >= TRIES_BEFORE_REVEAL) tray.querySelector('.tool--needed')?.classList.add('tool--glow');
      return;
    }

    solved = true;
    clearTimeout(idleTimer);
    tray.querySelectorAll('.tool').forEach((c) => { c.dataset.disabled = 'true'; c.classList.add('tool--away'); });
    marker.classList.add('spot-marker--hit');
    sfx.drop();

    // Stick the tool to the patient while it does its job.
    const stuck = h('div', { class: 'tool-stuck' }, tool.icon);
    stuck.style.left = marker.style.left;
    stuck.style.top = marker.style.top;
    ctx.overlay.appendChild(stuck);

    const mode = step.mode || 'drop';
    if (mode === 'hold') {
      holdGauge(ctx.bodyEl, {
        ms: step.holdMs || 1500, icon: tool.icon,
        label: ctx.little ? 'Press and hold!' : 'Hold still…',
        onDone: complete,
      });
    } else if (mode === 'rub') {
      rubGauge(ctx.bodyEl, {
        strokes: step.rubs || 6, icon: tool.icon,
        label: ctx.little ? 'Swipe side to side!' : 'Gently, back and forth…',
        onStroke: () => { sparkle(stuck, { count: 4, glyphs: ['✨', '🫧'] }); play('whoosh'); },
        onDone: complete,
      });
    } else {
      await wait(320);
      complete();
    }
  }

  async function complete() {
    sparkle(stuckOrMarker(), { count: 14 });
    play(tool.sound || 'good');
    ctx.award({ stars: step.stars ?? 0 }, ctx.patientWrap);

    if (step.reaction?.mood) ctx.setMood(step.reaction.mood);
    ctx.react(step.reaction?.react || 'wiggle');
    if (step.reaction?.sfx) play(step.reaction.sfx);

    if (step.readout) {
      const card = readout(step.readout, tool, ctx);
      ctx.bodyEl.appendChild(card);
      requestAnimationFrame(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
      // Say what the tool actually found, not just "well done".
      ctx.say('narrator', readoutLine(step.readout, tool, ctx));
    }

    ctx.setPrompt(praise());
    if (step.reaction?.say) {
      ctx.say('patient', step.reaction.say, { translate: step.reaction.translate });
    }
    ctx.teach(step.teach || null);

    ctx.continueButton();
  }

  function stuckOrMarker() { return ctx.overlay.querySelector('.tool-stuck') || ctx.patientWrap; }

  return () => {
    clearTimeout(idleTimer);
    ro?.disconnect();
    window.removeEventListener('resize', onResize);
    cleaners.forEach((c) => c());
    marker.remove();
    ctx.overlay.querySelectorAll('.tool-stuck').forEach((s) => s.remove());
  };
}

/** What the readout card says, as a sentence a child can hear. */
function readoutLine(spec, tool, ctx) {
  const label = spec.label || tool.readout?.label || tool.name;
  const value = spec.kind === 'number' || spec.kind === 'heartbeat'
    ? `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`
    : ctx.fill(spec.value || '');
  const head = `${label}: ${value}`.replace(/[\s.]+$/, '');
  return [head, spec.text ? ctx.fill(spec.text) : null].filter(Boolean).join('. ');
}

/**
 * Which tools appear in the tray. Little Helper mode gets the right tool plus
 * a single decoy; explorers get the full set, shuffled.
 */
function buildTray(step, little) {
  const decoys = step.decoys || [];
  if (little) return shuffleStable([step.tool, decoys[0]].filter(Boolean));
  return shuffleStable([step.tool, ...decoys]);
}

/** Deterministic-ish shuffle so the layout doesn't jump on a re-render. */
function shuffleStable(list) {
  const out = [...new Set(list)];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
