/**
 * `order` — very gentle triage.
 *
 * The child taps patients in the order they should be helped. Picking the
 * wrong one simply explains why someone else is more urgent — nothing is lost
 * and the queue never becomes frightening.
 */
import { h, wait, shuffle } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { toast, sparkle } from '../../core/fx.js';
import { praise } from '../hints.js';

export function runOrder(step, ctx) {
  ctx.setPrompt(step.prompt, ctx.little ? null : step.hint);

  const queue = h('div', { class: 'triage' });
  const items = shuffle(step.items);
  let expect = 1;
  let solved = false;

  items.forEach((item) => {
    const card = h('button', { class: 'triage__card', onClick: () => tap(item, card) },
      h('span', { class: 'triage__rank' }, ''),
      h('span', { class: 'triage__icon' }, item.icon),
      h('span', { class: 'triage__body' },
        h('strong', {}, ctx.fill(item.label)),
        h('em', {}, ctx.fill(item.note))));
    if (ctx.little && item.urgency === 1) card.classList.add('triage__card--halo');
    queue.appendChild(card);
  });

  ctx.bodyEl.appendChild(queue);
  // Who is waiting, and what is wrong with each of them.
  ctx.speakOptions(items.map((i) => `${ctx.fill(i.label)} — ${ctx.fill(i.note)}`),
    { lead: 'Here is who is waiting:' });

  async function tap(item, card) {
    if (solved || card.dataset.done) return;

    if (item.urgency !== expect) {
      ctx.noteMistake();
      sfx.nudge();
      card.classList.add('choice--wobble');
      setTimeout(() => card.classList.remove('choice--wobble'), 520);
      const shouldBe = items.find((i) => i.urgency === expect);
      toast(ctx.fill(shouldBe?.why || step.hint || 'Someone else needs you a little sooner.'), {});
      queue.querySelectorAll('.triage__card').forEach((c, i) => {
        if (items[i].urgency === expect) c.classList.add('triage__card--halo');
      });
      return;
    }

    card.dataset.done = 'true';
    card.classList.add('triage__card--done');
    card.querySelector('.triage__rank').textContent = String(expect);
    sparkle(card, { count: 10 });
    sfx.select();
    if (item.why) ctx.say('narrator', item.why);
    expect++;

    if (expect > items.length) {
      solved = true;
      sfx.great();
      ctx.award({ stars: step.stars ?? 2 }, ctx.patientWrap);
      ctx.setPrompt(praise());
      ctx.teach(step.teach || null);
      await wait(800);
      ctx.continueButton();
    }
  }
}
