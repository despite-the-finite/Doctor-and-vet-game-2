/**
 * `show` — a small illustrated explainer between the hands-on bits.
 *
 * Deliberately short and always optional to read: the animation carries the
 * idea, the words are a bonus.
 */
import { h } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { showArt } from '../arts.js';

export function runShow(step, ctx) {
  ctx.setPrompt(null);

  const panel = h('div', { class: 'showcard' },
    h('div', { class: 'showcard__art', html: showArt(step.art) }),
    h('h3', { class: 'showcard__title' }, ctx.fill(step.title)),
    h('p', { class: 'showcard__text' }, ctx.fill(step.text)));
  ctx.bodyEl.appendChild(panel);
  // The explainer is pure text on screen; without this it is silent to a
  // child who cannot read, which is precisely who it is written for.
  ctx.say('narrator', `${ctx.fill(step.title)}. ${ctx.fill(step.text)}`);
  sfx.select();

  ctx.bodyEl.appendChild(h('button', {
    class: 'lh-btn lh-btn--secondary lh-btn--wide', onClick: () => { sfx.tap(); ctx.next(); },
  }, step.cta || 'Got it!'));
}
