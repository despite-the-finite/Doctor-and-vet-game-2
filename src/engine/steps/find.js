/**
 * `find` — tap to discover hidden things (clues, fleas, thorns, threads).
 *
 * Targets and decoys are positioned as a percentage of the stage, so the
 * layout works at any screen size. Tapping a decoy is harmless and gets a
 * playful response.
 */
import { h, wait } from '../../core/dom.js';
import { sfx, play } from '../../core/audio.js';
import { sparkle, toast } from '../../core/fx.js';
import { praise } from '../hints.js';

const DECOY_QUIPS = [
  'Ooh — pretty, but not a clue!',
  'Nice spot! Not what we need though.',
  'Ha! That one is just decoration.',
  'Good eyes! Keep looking.',
];

export function runFind(step, ctx) {
  const total = step.targets.length;
  ctx.setPrompt(step.prompt, ctx.little ? null : step.hint);
  if (step.mood) ctx.setMood(step.mood);

  const counter = h('div', { class: 'find-counter' },
    h('span', { class: 'find-counter__num' }, '0'),
    h('span', {}, ` / ${total}`));
  ctx.bodyEl.appendChild(counter);
  const numEl = counter.querySelector('.find-counter__num');

  let found = 0;
  const spots = [];

  const place = (item, isTarget) => {
    const node = h('button', {
      class: `find-spot${isTarget ? ' find-spot--target' : ' find-spot--decoy'}`,
      style: { left: `${item.x}%`, top: `${item.y}%` },
      'aria-label': isTarget ? (item.label || 'A clue') : 'Something else',
      onClick: (ev) => { ev.stopPropagation(); tap(node, item, isTarget); },
    }, h('span', { class: 'find-spot__icon' }, item.icon));
    // Little Helper mode gives the real clues a soft halo.
    if (ctx.little && isTarget) node.classList.add('find-spot--halo');
    ctx.overlay.appendChild(node);
    spots.push(node);
  };

  step.targets.forEach((t) => place(t, true));
  (step.decoys || []).forEach((d) => place(d, false));

  async function tap(node, item, isTarget) {
    if (node.dataset.done) return;

    if (!isTarget) {
      sfx.nudge();
      node.classList.add('find-spot--wobble');
      setTimeout(() => node.classList.remove('find-spot--wobble'), 500);
      toast(DECOY_QUIPS[Math.floor(Math.random() * DECOY_QUIPS.length)], { icon: item.icon });
      return;
    }

    node.dataset.done = 'true';
    node.classList.add('find-spot--found');
    sparkle(node, { count: 10 });
    play('select');
    found++;
    numEl.textContent = String(found);
    counter.classList.remove('chip--bump'); void counter.offsetWidth; counter.classList.add('chip--bump');

    if (item.label) ctx.say('narrator', `${step.found || 'Found it!'} ${item.label}`);

    if (found >= total) {
      sfx.great();
      ctx.award({ stars: step.stars ?? 1 }, ctx.patientWrap);
      ctx.setPrompt(praise());
      ctx.teach(step.teach || null);
      ctx.react('happy');
      await wait(600);
      ctx.continueButton();
    }
  }

  return () => spots.forEach((s) => s.remove());
}
