/**
 * `choose` — pick the right answer.
 *
 * Wrong picks are never punished: the card gently wobbles, a warm nudge
 * appears, and after two tries the correct card starts glowing so nobody can
 * get stuck. Little Helper mode only ever shows two options.
 */
import { h, wait, shuffle } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { toast, sparkle } from '../../core/fx.js';
import { nudge, praise, TRIES_BEFORE_REVEAL } from '../hints.js';

export function runChoose(step, ctx) {
  ctx.setPrompt(step.prompt, ctx.little ? null : step.subPrompt);
  if (step.mood) ctx.setMood(step.mood);

  const options = pickOptions(step.options, ctx.little);
  const layout = step.layout || 'cards';
  const grid = h('div', { class: `choice-grid choice-grid--${layout}` });

  let solved = false;
  let tries = 0;

  options.forEach((opt) => {
    const card = h('button', { class: `choice choice--${layout}`, onClick: () => choose(opt, card) },
      h('span', { class: 'choice__icon' }, opt.icon),
      layout === 'shapes' ? null : h('span', { class: 'choice__label' }, ctx.fill(opt.label)),
      !ctx.little && opt.detail ? h('span', { class: 'choice__detail' }, opt.detail) : null);
    if (layout === 'shapes') card.setAttribute('aria-label', opt.label);
    if (opt.correct) card.dataset.correct = 'true';
    grid.appendChild(card);
  });

  ctx.bodyEl.appendChild(grid);
  // Read the answers out after the question — otherwise a child who cannot
  // read is choosing between pictures with no idea what either one says.
  ctx.speakOptions(options.map((o) => o.label));

  const idle = setTimeout(() => {
    if (!solved && step.nudge) toast(ctx.fill(step.nudge));
  }, ctx.little ? 6000 : 13000);

  async function choose(opt, card) {
    if (solved) return;

    if (!opt.correct) {
      tries++;
      ctx.noteMistake();
      sfx.nudge();
      card.classList.add('choice--wobble');
      setTimeout(() => card.classList.remove('choice--wobble'), 520);
      toast(ctx.fill(step.nudge || nudge()));
      if (tries >= TRIES_BEFORE_REVEAL) grid.querySelector('[data-correct]')?.classList.add('choice--glow');
      return;
    }

    solved = true;
    clearTimeout(idle);
    grid.querySelectorAll('.choice').forEach((c) => {
      c.disabled = true;
      if (c !== card) c.classList.add('choice--dim');
    });
    card.classList.add('choice--right');
    sparkle(card, { count: 14 });
    sfx.great();

    ctx.award({ stars: step.stars ?? 1 }, card);
    if (step.badge) {
      ctx.badge(step.badge);
      toast('New badge earned!', { tone: 'good' });
    }
    ctx.setPrompt(praise());
    if (opt.say) ctx.say('narrator', opt.say);
    else ctx.say('narrator', `Yes — ${ctx.fill(opt.label)}.`);
    ctx.react('happy');
    ctx.teach(step.teach || null);

    await wait(700);
    ctx.continueButton();
  }

  return () => clearTimeout(idle);
}

/**
 * Little Helper mode keeps the correct answer plus one distractor (preferring
 * one the author flagged `easy`), so a 4-year-old always faces a 50/50 choice.
 */
function pickOptions(all, little) {
  if (!little) return shuffle(all);
  const correct = all.find((o) => o.correct) || all[0];
  const others = all.filter((o) => o !== correct);
  const distractor = others.find((o) => o.easy) || others[0];
  return shuffle([correct, distractor].filter(Boolean));
}
