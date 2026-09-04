/**
 * Shared UI pieces used across screens: the top bar, currency chips, the
 * modal, and the little hero portrait button.
 */
import { h } from '../core/dom.js';
import { sfx } from '../core/audio.js';
import { getState, toggleSound, soundOn } from '../core/state.js';
import { isSupported as voiceSupported, voiceOn, toggleVoice } from '../core/voice.js';
import { on } from '../core/events.js';
import { humanSVG } from './human.js';
import { ownedAccessories } from '../data/shop.js';

/** Renders the player's hero with any accessories they have bought. */
export function heroSVG(opts = {}) {
  const state = getState();
  const hero = state.hero || {};
  return humanSVG({
    ...hero,
    age: 'adult',
    extras: ownedAccessories(state.purchased),
    ...opts,
  });
}

/**
 * The top bar. `back` may be a function or false; the sound toggle is always
 * present so a child can silence the game from any screen.
 */
export function hud({ title = '', back = null, dark = false, chips = ['stars', 'coins'], extra = [] } = {}) {
  const bar = h('div', { class: `hud${dark ? ' hud--dark' : ''}` });

  if (back) {
    bar.appendChild(h('button', {
      class: 'iconbtn iconbtn--back', 'aria-label': 'Go back',
      onClick: () => { sfx.tap(); back(); },
    }, '⬅️'));
  }

  if (title) bar.appendChild(h('div', { class: 'hud__title' }, title));
  bar.appendChild(h('div', { class: 'hud__spacer' }));

  if (chips.length) bar.classList.add('hud--chips');
  const chipEls = {};
  chips.forEach((kind) => {
    const el = currencyChip(kind);
    chipEls[kind] = el;
    bar.appendChild(el);
  });

  extra.forEach((el) => bar.appendChild(el));

  if (voiceSupported) {
    const voiceBtn = h('button', {
      class: 'iconbtn', 'aria-label': 'Read the words out loud',
      title: 'Read the words out loud',
      onClick: () => { voiceBtn.textContent = toggleVoice() ? '🗣️' : '🤐'; },
    }, voiceOn() ? '🗣️' : '🤐');
    bar.appendChild(voiceBtn);
  }

  const soundBtn = h('button', {
    class: 'iconbtn', 'aria-label': 'Sound on or off',
    onClick: () => {
      const now = toggleSound();
      soundBtn.textContent = now ? '🔊' : '🔇';
      if (now) sfx.select();
    },
  }, soundOn() ? '🔊' : '🔇');
  bar.appendChild(soundBtn);

  // Keep the chips live when rewards land while the screen is open.
  const off = on('state:change', () => {
    Object.entries(chipEls).forEach(([kind, el]) => updateChip(el, kind));
  });
  bar.dispose = off;

  return bar;
}

const CHIP_META = {
  stars:    { icon: '⭐', key: 'stars',    label: 'Hero Stars' },
  kindness: { icon: '❤️', key: 'kindness', label: 'Kindness Stars' },
  coins:    { icon: '🪙', key: 'coins',    label: 'Hospital Coins' },
};

export function currencyChip(kind) {
  const meta = CHIP_META[kind];
  const el = h('div', { class: 'chip', title: meta.label, dataset: { chip: kind } },
    h('span', { class: 'chip__icon' }, meta.icon),
    h('span', { class: 'chip__value' }, String(getState().wallet[meta.key] ?? 0)));
  return el;
}

function updateChip(el, kind) {
  const meta = CHIP_META[kind];
  const valueEl = el.querySelector('.chip__value');
  const next = String(getState().wallet[meta.key] ?? 0);
  if (valueEl.textContent === next) return;
  valueEl.textContent = next;
  el.classList.remove('chip--bump');
  void el.offsetWidth;
  el.classList.add('chip--bump');
}

/** A centred modal. Returns { el, close }. */
export function modal(content, { onClose = null, dismissable = true } = {}) {
  const box = h('div', { class: 'modal' }, ...(Array.isArray(content) ? content : [content]));
  const veil = h('div', {
    class: 'modal-veil',
    onClick: (ev) => { if (dismissable && ev.target === veil) close(); },
  }, box);

  function close() {
    veil.remove();
    onClose?.();
  }

  document.body.appendChild(veil);
  return { el: veil, box, close };
}

/** Big rounded section heading used on the hub, shop and bag screens. */
export function sectionTitle(icon, text, sub = null) {
  return h('div', { class: 'section-title' },
    h('span', { class: 'section-title__icon' }, icon),
    h('div', {},
      h('h2', {}, text),
      sub ? h('p', {}, sub) : null));
}

/** Progress bar with a label. */
export function progressBar(done, total, label = null) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return h('div', { class: 'progress' },
    label ? h('div', { class: 'progress__label' }, label, h('span', {}, `${done}/${total}`)) : null,
    h('div', { class: 'bar' }, h('div', { class: 'bar__fill', style: { width: `${pct}%` } })));
}
