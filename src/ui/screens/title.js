/**
 * Title screen.
 *
 * The brief was "the screen should immediately feel alive", so the background
 * is a living little town: an ambulance pulls up, a helicopter crosses the
 * sky, a dog watches from the vet window, birds and butterflies drift past
 * and the hospital sign blinks.
 */
import { h, randI } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { go } from '../../core/router.js';
import { getState, hasHero, resetEverything } from '../../core/state.js';
import { modal } from '../components.js';
import { confetti } from '../../core/fx.js';

export function titleScreen() {
  const state = getState();
  const returning = hasHero();

  const el = h('div', { class: 'screen screen--title' });

  el.appendChild(h('div', { class: 'town', html: townMarkup() }));

  const stack = h('div', { class: 'title-stack' },
    h('div', { class: 'title-badge' }, '🏥'),
    h('h1', { class: 'title-word' },
      ...'LITTLE'.split('').map((c, i) => h('span', { style: { animationDelay: `${i * 0.06}s` } }, c))),
    h('h1', { class: 'title-word title-word--big' },
      ...'HEROES'.split('').map((c, i) => h('span', { style: { animationDelay: `${0.2 + i * 0.06}s` } }, c))),
    h('h1', { class: 'title-word' },
      ...'HOSPITAL'.split('').map((c, i) => h('span', { style: { animationDelay: `${0.45 + i * 0.05}s` } }, c))),
    h('p', { class: 'title-sub' }, 'People or pets — everyone needs a hero.'),
    h('button', {
      class: 'btn btn--sun btn--huge title-cta',
      onClick: start,
    }, returning ? '▶️ CARRY ON' : '✨ START MY ADVENTURE'),
    returning ? h('div', { class: 'title-returning' },
      h('span', {}, `Welcome back, Dr. ${state.hero.name}!`),
      h('button', { class: 'btn btn--ghost btn--small', onClick: confirmReset }, '🔄 Start again')) : null,
  );
  el.appendChild(stack);

  el.appendChild(h('div', { class: 'title-foot' }, 'A make-believe hospital. Not real medical advice. 💛'));

  function start() {
    sfx.fanfare();
    confetti({ intensity: 0.7, duration: 2000 });
    setTimeout(() => go(returning ? 'hub' : 'creator', {}, { replace: true }), 260);
  }

  function confirmReset() {
    sfx.tap();
    const m = modal([
      h('div', { style: { fontSize: '58px' } }, '🔄'),
      h('h2', {}, 'Start a brand new hospital?'),
      h('p', {}, 'Your hero, your stars, your coins and all your rooms will be cleared.'),
      h('div', { class: 'row gap-m', style: { justifyContent: 'center', flexWrap: 'wrap' } },
        h('button', { class: 'btn btn--ghost', onClick: () => m.close() }, 'No, keep playing'),
        h('button', { class: 'btn btn--coral', onClick: () => {
          resetEverything();
          m.close();
          go('title', {}, { replace: true });
        } }, 'Yes, start again')),
    ]);
  }

  return { el };
}

/* ----------------------------------------------------------------- scene */

function townMarkup() {
  const stars = Array.from({ length: 18 }, () =>
    `<span class="tw" style="left:${randI(2, 98)}%;top:${randI(4, 46)}%;animation-delay:${(Math.random() * 3).toFixed(1)}s">✦</span>`).join('');

  const butterflies = Array.from({ length: 3 }, (_, i) =>
    `<span class="flutter" style="--y:${randI(52, 74)}%;animation-delay:${i * 5}s;animation-duration:${18 + i * 6}s">🦋</span>`).join('');

  return `
  <div class="sky">
    <div class="sun">☀️</div>
    ${stars}
    <div class="cloud cloud--1"></div>
    <div class="cloud cloud--2"></div>
    <div class="cloud cloud--3"></div>
    <div class="heli">🚁</div>
    <div class="birds">
      <span style="animation-delay:0s">🐦</span>
      <span style="animation-delay:1.1s">🐦</span>
      <span style="animation-delay:2.2s">🐦</span>
    </div>
  </div>

  <div class="hill hill--back"></div>
  <div class="hill hill--front"></div>

  <div class="tree tree--1">🌳</div>
  <div class="tree tree--2">🌲</div>
  <div class="tree tree--3">🌳</div>

  <div class="building">
    <div class="roofline">
      <span class="sign">🏥</span>
      <span class="cross">✚</span>
    </div>
    <div class="windows">
      ${Array.from({ length: 8 }, (_, i) => `<span class="win" style="animation-delay:${i * 0.7}s"></span>`).join('')}
    </div>
    <div class="vetwindow">
      <span class="vetdog">🐶</span>
    </div>
    <div class="doorway">
      <span class="doorglow"></span>
    </div>
    <span class="walker walker--1">🚶</span>
    <span class="walker walker--2">🚶</span>
  </div>

  <div class="road"></div>
  <div class="ambulance">🚑</div>
  <div class="paws">
    ${Array.from({ length: 6 }, (_, i) => `<span style="left:${8 + i * 15}%;animation-delay:${(5 - i) * 0.45}s">🐾</span>`).join('')}
  </div>
  <div class="patients">
    <span class="patient-walk patient-walk--1">🚶</span>
    <span class="patient-walk patient-walk--2">🐕</span>
  </div>
  ${butterflies}
  `;
}
