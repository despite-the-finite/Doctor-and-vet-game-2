/**
 * Title screen — the front door.
 *
 * The town is alive before the child touches anything: clouds drift, the air
 * ambulance crosses, an ambulance pulls up at the kerb, a dog watches from
 * the vet window and the hero breathes on the pavement. Four depth planes,
 * every prop drawn — there is not an emoji in the scene.
 */
import { h } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { go } from '../../core/router.js';
import { getState, hasHero, resetEverything } from '../../core/state.js';
import { modal, heroSVG } from '../components.js';
import { confetti } from '../../core/fx.js';
import { cross } from '../parts.js';
import {
  scene, cloud, sunDisc, birds, helicopter, hill, haze,
  treeRound, treePine, hospital, windowDog, road, ambulance,
} from '../scene.js';

export function titleScreen() {
  const state = getState();
  const returning = hasHero();

  const el = h('div', { class: 'lh-screen lh-screen--title', 'data-world': 'doctor' });

  el.appendChild(scene({
    world: 'doctor',
    sky: [
      sunDisc({ right: 96, top: 60 }),
      cloud({ top: 88, w: 230, hgt: 74, opacity: .94, dur: 52 }),
      cloud({ top: 172, w: 150, hgt: 52, opacity: .8, dur: 74, delay: -26 }),
      cloud({ top: 44, w: 110, hgt: 40, opacity: .7, dur: 96, delay: -60 }),
      helicopter({ top: 130 }),
      birds({ left: 180, top: 120 }),
    ],
    far: [
      hill({ side: 'left', offset: -8, bottom: 210, w: 62, hgt: 230, fill: '#8FD9A0' }),
      hill({ side: 'right', offset: -12, bottom: 196, w: 58, hgt: 190, fill: '#79CB8D' }),
      haze({ bottom: 196, hgt: 260, strength: .22 }),
      treeRound({ side: 'left', offset: 96, bottom: 214 }),
      treePine({ side: 'right', offset: 120, bottom: 206 }),
    ],
    room: [
      hospital({ bottom: 150 }),
      `<div style="position:absolute; left:calc(50% - 214px); bottom:216px;">${windowDog({ left: 0, bottom: 0 })}</div>`,
    ],
    fore: [
      road(),
      ambulance(),
    ],
  }));

  /* The hero stands right of centre on the pavement, clear of both the
     wordmark and the primary button. */
  el.appendChild(h('div', { class: 'title-hero', html: `<div class="title-hero__art">${heroSVG({ mood: 'happy' })}</div>` }));

  /* ---------------------------------------------------------- the words */
  const stack = h('div', { class: 'title-stack' },
    h('div', { class: 'title-kicker' },
      h('span', { class: 'title-kicker__mark', html: `<svg viewBox="0 0 40 40">${cross(20, 20, 40, '#fff')}</svg>` }),
      h('span', {}, 'AGES 4–10')),
    h('h1', { class: 'title-wordmark' },
      h('span', { class: 'title-word title-word--1' }, 'LITTLE'),
      h('span', { class: 'title-word title-word--2' }, 'HEROES'),
      h('span', { class: 'title-word title-word--3' }, 'HOSPITAL')),
    h('p', { class: 'title-sub' }, 'People or pets — everyone needs a hero.'),
    h('div', { class: 'title-actions' },
      h('button', { class: 'lh-btn lh-btn--secondary lh-btn--lg', onClick: start },
        returning ? 'Carry on' : 'Start my adventure'),
      returning ? h('div', { class: 'title-returning' },
        h('button', { class: 'lh-btn lh-btn--quiet lh-btn--sm', onClick: confirmReset }, 'Start again'),
        h('span', {}, `Welcome back, Dr. ${state.hero.name}!`)) : null));
  el.appendChild(stack);

  el.appendChild(h('div', { class: 'title-foot' },
    'A make-believe hospital. Not real medical advice.'));

  function start() {
    sfx.fanfare();
    confetti({ intensity: 0.7, duration: 2000 });
    setTimeout(() => go(returning ? 'hub' : 'creator', {}, { replace: true }), 260);
  }

  function confirmReset() {
    sfx.tap();
    const m = modal([
      h('h2', {}, 'Start a brand new hospital?'),
      h('p', {}, 'Your hero, your stars, your coins and all your rooms will be cleared.'),
      h('div', { class: 'lh-row lh-gap-m', style: { justifyContent: 'center', flexWrap: 'wrap' } },
        h('button', { class: 'lh-btn lh-btn--quiet', onClick: () => m.close() }, 'No, keep playing'),
        h('button', { class: 'lh-btn lh-btn--alert', onClick: () => {
          resetEverything();
          m.close();
          go('title', {}, { replace: true });
        } }, 'Yes, start again')),
    ]);
  }

  return { el };
}
