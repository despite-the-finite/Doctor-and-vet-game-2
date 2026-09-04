/**
 * The Doctor Bag — the equipment collection.
 *
 * Locked tools are shown blurred rather than hidden, because "what IS that
 * one?" is half the fun of a collection screen.
 */
import { h } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { goHome } from '../../core/router.js';
import { getState, hasTool } from '../../core/state.js';
import { TOOLS, TOOL_ORDER } from '../../data/tools.js';
import { hud, sectionTitle, progressBar, modal } from '../components.js';
import { sparkle } from '../../core/fx.js';

const BADGES = {
  'medical-detective': { icon: '🕵️', name: 'Medical Detective', blurb: 'Solved a mystery from the clues alone.' },
  'hospital-hero':     { icon: '🏆', name: 'Hospital Hero', blurb: 'Completed the whole Doctor path.' },
  'master-vet':        { icon: '🏆', name: 'Master Veterinarian', blurb: 'Completed the whole Vet path.' },
  'wildlife-friend':   { icon: '🌲', name: 'Wildlife Friend', blurb: 'Helped a wild animal go home.' },
};

export function bagScreen() {
  const state = getState();
  const el = h('div', { class: 'screen screen--bag' });
  const bar = hud({ title: '🎒 My Doctor Bag', back: () => goHome('hub'), dark: true, chips: ['stars', 'kindness'] });
  el.appendChild(bar);

  const scroll = h('div', { class: 'screen-scroll' });
  const owned = TOOL_ORDER.filter(hasTool).length;

  scroll.appendChild(sectionTitle('🩺', 'My equipment', 'Every tool you have collected so far.'));
  scroll.appendChild(h('div', { style: { display: 'grid', placeItems: 'center', padding: '0 16px 12px' } },
    progressBar(owned, TOOL_ORDER.length, 'Collection')));

  const grid = h('div', { class: 'card-grid' });
  TOOL_ORDER.forEach((id) => {
    const tool = TOOLS[id];
    const got = hasTool(id);
    const card = h('button', {
      class: `kit${got ? '' : ' kit--locked'}`,
      onClick: () => (got ? showTool(tool, card) : sfx.nudge()),
    },
      h('span', { class: 'kit__icon' }, tool.icon),
      h('span', { class: 'kit__name' }, got ? tool.name : '???'),
      h('span', { class: 'kit__blurb' }, got ? tool.blurb : 'Keep helping patients to unlock this!'),
      got ? null : h('span', { class: 'kit__lock' }, '🔒'));
    grid.appendChild(card);
  });
  scroll.appendChild(grid);

  /* ------------------------------------------------------------- badges */
  scroll.appendChild(sectionTitle('🏅', 'My badges', 'Special things you have done.'));
  const badgeGrid = h('div', { class: 'card-grid' });
  Object.entries(BADGES).forEach(([id, b]) => {
    const got = state.badges.includes(id);
    badgeGrid.appendChild(h('div', { class: `kit${got ? '' : ' kit--locked'}` },
      h('span', { class: 'kit__icon' }, b.icon),
      h('span', { class: 'kit__name' }, got ? b.name : '???'),
      h('span', { class: 'kit__blurb' }, got ? b.blurb : 'Still to be earned!'),
      got ? null : h('span', { class: 'kit__lock' }, '🔒')));
  });
  scroll.appendChild(badgeGrid);

  el.appendChild(scroll);

  function showTool(tool, from) {
    sfx.select();
    sparkle(from, { count: 10 });
    const m = modal([
      h('div', { class: 'newtool' },
        toolDemo(tool),
        h('div', { class: 'newtool__name' }, tool.name),
        h('p', { class: 'newtool__blurb' }, tool.blurb),
        h('p', { class: 'newtool__demo' }, tool.demo)),
      h('button', { class: 'btn btn--sun', onClick: () => m.close() }, 'Cool! 👍'),
    ]);
  }

  /**
   * A tiny looping scene: the tool swoops in to a waiting patient, does its
   * thing, and the patient beams. Shows a non-reader exactly what it is for.
   */
  function toolDemo(tool) {
    return h('div', { class: 'tool-demo', style: { '--tint': tool.tint } },
      h('span', { class: 'tool-demo__patient' }, '🧑'),
      h('span', { class: 'tool-demo__pet' }, '🐶'),
      h('span', { class: 'tool-demo__tool' }, tool.icon),
      h('span', { class: 'tool-demo__spark tool-demo__spark--a' }, '✨'),
      h('span', { class: 'tool-demo__spark tool-demo__spark--b' }, '⭐'));
  }

  return { el, destroy: () => bar.dispose?.() };
}

export { BADGES };
