/**
 * `empathy` — the kindness mechanic.
 *
 * There is no wrong answer here on purpose: every option is a caring thing to
 * say. The point is to make "how does my patient feel?" part of the gameplay
 * rather than a lecture at the end.
 */
import { h, wait } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { kindPraise } from '../hints.js';

export function runEmpathy(step, ctx) {
  ctx.setPrompt(step.prompt, '💗 Every answer here is a kind one.');
  if (step.mood) ctx.setMood(step.mood);

  const options = ctx.little ? step.options.slice(0, 2) : step.options;
  const grid = h('div', { class: 'choice-grid choice-grid--empathy' });

  options.forEach((opt) => {
    const card = h('button', { class: 'choice choice--empathy', onClick: () => choose(opt, card) },
      h('span', { class: 'choice__icon' }, opt.icon),
      h('span', { class: 'choice__label' }, ctx.fill(opt.label)));
    grid.appendChild(card);
  });

  ctx.bodyEl.appendChild(grid);
  ctx.speakOptions(options.map((o) => o.label), { lead: 'You could say:' });

  let done = false;
  async function choose(opt, card) {
    if (done) return;
    done = true;
    grid.querySelectorAll('.choice').forEach((c) => { c.disabled = true; });
    card.classList.add('choice--picked');
    sfx.good();

    ctx.award({ kindness: step.kindness ?? 1 }, card);
    ctx.say('hero', opt.label);
    await wait(1100);
    if (opt.reply) {
      ctx.say('patient', opt.reply, { mood: opt.mood || 'happy' });
      ctx.react('happy');
    }
    ctx.teach(step.teach || kindPraise());
    await wait(1500);
    ctx.next();
  }
}
