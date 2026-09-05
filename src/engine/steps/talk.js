/**
 * `talk` — a line of dialogue. Tap anywhere to continue.
 * Animal patients get a translation bubble underneath so a child who cannot
 * read still gets the joke from the icons and the sound.
 */
import { icon } from '../../ui/icons.js';
import { h } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';

const WHO_LABEL = {
  patient: null,
  hero: 'You',
  nurse: 'Nurse Pim',
  narrator: null,
};

export function runTalk(step, ctx) {
  ctx.say(step.who || 'patient', step.text, {
    translate: step.translate,
    mood: step.mood,
    sfxName: step.sfx,
  });

  if (step.who === 'patient' && step.mood) ctx.react(step.mood === 'happy' ? 'happy' : 'wiggle');

  const label = WHO_LABEL[step.who];
  ctx.setPrompt(label ? `${label} says…` : null, null, { spoken: false });

  const btn = h('button', { class: 'lh-btn lh-btn--secondary lh-btn--wide', onClick: go },
    h('span', {}, 'Next'), h('span', { class: 'lh-btn__arrow', html: icon('play', { size: 22, color: '#fff' }) }));
  ctx.bodyEl.appendChild(btn);

  // The whole stage is a "next" target too — much easier for small fingers.
  const stageTap = (ev) => { if (!ev.target.closest('button')) go(); };
  ctx.stage.addEventListener('click', stageTap);

  let done = false;
  function go() {
    if (done) return;
    done = true;
    sfx.tap();
    ctx.next();
  }

  return () => ctx.stage.removeEventListener('click', stageTap);
}
