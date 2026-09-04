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
import { icon } from './icons.js';

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
  const bar = h('div', { class: `lh-hud${dark ? ' lh-hud--dark' : ''}` });

  if (back) {
    bar.appendChild(h('button', {
      class: 'lh-btn lh-btn--icon', 'data-role': 'back', 'aria-label': 'Go back',
      html: icon('back'),
      onClick: () => { sfx.tap(); back(); },
    }));
  }

  if (title) bar.appendChild(h('div', { class: 'lh-hud__title' }, title));
  bar.appendChild(h('div', { class: 'lh-hud__spacer' }));

  if (chips.length) bar.classList.add('lh-hud--chips');
  const chipEls = {};
  chips.forEach((kind) => {
    const el = currencyChip(kind);
    chipEls[kind] = el;
    bar.appendChild(el);
  });

  extra.forEach((el) => bar.appendChild(el));

  if (voiceSupported) {
    const voiceBtn = h('button', {
      class: 'lh-btn lh-btn--icon', 'aria-label': 'Read the words out loud',
      title: 'Read the words out loud',
      'aria-pressed': String(voiceOn()),
      html: icon(voiceOn() ? 'voiceOn' : 'voiceOff'),
      onClick: () => {
        const now = toggleVoice();
        voiceBtn.innerHTML = icon(now ? 'voiceOn' : 'voiceOff');
        voiceBtn.setAttribute('aria-pressed', String(now));
      },
    });
    bar.appendChild(voiceBtn);
  }

  const soundBtn = h('button', {
    class: 'lh-btn lh-btn--icon', 'aria-label': 'Sound on or off',
    'aria-pressed': String(soundOn()),
    html: icon(soundOn() ? 'soundOn' : 'soundOff'),
    onClick: () => {
      const now = toggleSound();
      soundBtn.innerHTML = icon(now ? 'soundOn' : 'soundOff');
      soundBtn.setAttribute('aria-pressed', String(now));
      if (now) sfx.select();
    },
  });
  bar.appendChild(soundBtn);

  // Keep the chips live when rewards land while the screen is open.
  const off = on('state:change', () => {
    Object.entries(chipEls).forEach(([kind, el]) => updateChip(el, kind));
  });
  bar.dispose = off;

  return bar;
}

const CHIP_META = {
  stars:    { mark: 'star',     key: 'stars',    label: 'Hero Stars' },
  kindness: { mark: 'kindness', key: 'kindness', label: 'Kindness Stars' },
  coins:    { mark: 'coin',     key: 'coins',    label: 'Hospital Coins' },
};

export function currencyChip(kind) {
  const meta = CHIP_META[kind];
  const el = h('div', { class: 'lh-chip', title: meta.label, dataset: { chip: kind } },
    h('span', { class: 'lh-chip__icon', html: icon(meta.mark) }),
    h('span', { class: 'lh-chip__num' }, String(getState().wallet[meta.key] ?? 0)));
  return el;
}

function updateChip(el, kind) {
  const meta = CHIP_META[kind];
  const valueEl = el.querySelector('.lh-chip__num');
  const next = String(getState().wallet[meta.key] ?? 0);
  if (valueEl.textContent === next) return;
  valueEl.textContent = next;
  el.classList.remove('is-bumping');
  void el.offsetWidth;
  el.classList.add('is-bumping');
}

/** A centred modal. Returns { el, close }. */
export function modal(content, { onClose = null, dismissable = true } = {}) {
  const box = h('div', { class: 'lh-modal' }, ...(Array.isArray(content) ? content : [content]));
  const veil = h('div', {
    class: 'lh-modal__veil',
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
  return h('div', { class: 'lh-section-title' },
    h('span', { class: 'lh-section-title__icon' }, icon),
    h('div', {},
      h('h2', {}, text),
      sub ? h('p', {}, sub) : null));
}

/** A raised surface. `float` is the translucent panel used over a scene. */
export function panel(children = [], { float = false, dark = false } = {}) {
  const kind = `${float ? ' lh-panel--float' : ''}${dark ? ' lh-panel--dark' : ''}`;
  return h('div', { class: `lh-panel${kind}` }, ...(Array.isArray(children) ? children : [children]));
}

/** The meter: a label beside a shining track. */
export function progressBar(done, total, label = null) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return h('div', { class: 'lh-meter', role: 'progressbar',
                    'aria-valuenow': String(done), 'aria-valuemin': '0', 'aria-valuemax': String(total),
                    'aria-label': label || 'Progress' },
    label ? h('div', { class: 'lh-meter__label' }, label) : null,
    h('div', { class: 'lh-meter__track' }, h('div', { class: 'lh-meter__fill', style: { width: `${pct}%` } })),
    h('div', { class: 'lh-meter__label' }, `${done}/${total}`));
}
