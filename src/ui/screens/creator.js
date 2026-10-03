/**
 * Character creator.
 *
 * Deliberately operable by a 4-year-old: every choice is a big round swatch
 * that instantly changes the picture. There is no "confirm" on any individual
 * option — only one big DONE button at the end.
 *
 * The options are built ONCE and then updated in place. Rebuilding the whole
 * list on every tap looked harmless and was not: it threw away the button the
 * child had just pressed (so focus vanished), it threw away the name field
 * mid-word, and because the list briefly emptied the scroller jumped — tapping
 * a shoe colour could fling you to a different part of the screen. Now a tap
 * changes exactly two things: the pressed state inside that one group, and
 * the picture.
 */
import { h, clear, pick } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { go } from '../../core/router.js';
import { getState, setHero, setDifficulty, hasHero, setVoice } from '../../core/state.js';
import { hud, heroSVG } from '../components.js';
import { sparkle } from '../../core/fx.js';
import { icon } from '../icons.js';
import {
  SKIN_TONES, HAIR_COLORS, HAIR_STYLES, SCRUB_COLORS, COAT_COLORS,
  SHOE_COLORS, GLASSES, ACCESSORIES, ACCESSORY_LABELS, NAME_SUGGESTIONS, defaultHero,
} from '../../data/characters.js';
import { ownedAccessories } from '../../data/shop.js';

export function creatorScreen() {
  const state = getState();
  const draft = { ...defaultHero(), ...(state.hero || {}) };
  let difficulty = state.difficulty || 'little';
  const editing = hasHero();

  const el = h('div', { class: 'lh-screen lh-screen--creator', 'data-world': 'doctor' });
  const bar = hud({
    title: editing ? 'Change my hero' : 'Create your hero',
    back: editing ? () => go('hub', {}, { replace: true }) : () => go('title', {}, { replace: true }),
    dark: true, chips: [],
  });
  el.appendChild(bar);

  const preview = h('div', { class: 'hero-preview' });
  const art = h('div', { class: 'hero-preview__art' });
  const nameLabel = h('div', { class: 'hero-preview__name' });
  preview.append(art, nameLabel);

  const options = h('div', { class: 'creator-options' });
  const grid = h('div', { class: 'creator-grid' }, preview, options);
  const scroll = h('div', { class: 'lh-screen__scroll' }, grid);
  el.appendChild(scroll);

  el.appendChild(h('div', { class: 'creator-bar' },
    h('button', { class: 'lh-btn lh-btn--quiet', onClick: randomise }, 'Surprise me!'),
    h('button', { class: 'lh-btn lh-btn--primary creator-bar__go', onClick: done },
      editing ? 'SAVE' : "THAT'S ME!"),
    h('span', { class: 'creator-bar__note' }, 'You can change any of this later.')));

  /* ------------------------------------------------------------- preview */
  function redraw() {
    art.innerHTML = heroSVG({ ...draft, mood: 'happy', age: 'adult' });
    clear(nameLabel);
    nameLabel.append(h('span', {}, `Dr. ${draft.name || '…'}`));
  }

  /* ---------------------------------------------------- live option state */
  // Every option button registers itself here so a tap can repaint just the
  // buttons that changed, instead of the whole column.
  const buttons = [];
  let nameInput = null;
  const diffCards = [];

  /** Repaint the pressed state everywhere — no DOM is created or destroyed. */
  function syncPressed() {
    buttons.forEach(({ el: btn, key, id }) =>
      btn.setAttribute('aria-pressed', String(draft[key] === id)));
    diffCards.forEach(({ el: card, id }) =>
      card.setAttribute('aria-pressed', String(difficulty === id)));
  }

  function choose(key, id, btn) {
    if (draft[key] === id) return;   // already chosen: no flicker, no re-draw
    draft[key] = id;
    sfx.select();
    sparkle(btn, { count: 6 });
    syncPressed();
    redraw();
  }

  /* ------------------------------------------------------- option groups */
  function group(title, rowEls, { wide = false } = {}) {
    return h('div', { class: `lh-optgroup${wide ? ' lh-optgroup--wide' : ''}` },
      h('div', { class: 'lh-optgroup__label' }, title),
      h('div', { class: 'lh-optgroup__row' }, ...rowEls));
  }

  // A colour is a swatch; a named choice ("Curly", "No coat") is a pill.
  function swatch(key, id, styles, content = null, wide = false, large = false) {
    const btn = h('button', {
      class: wide ? 'lh-pillopt' : `lh-swatch${large ? ' lh-swatch--lg' : ''}`,
      'aria-pressed': String(draft[key] === id),
      style: styles,
      'aria-label': String(content || id),
      onClick: () => choose(key, id, btn),
    }, content);
    buttons.push({ el: btn, key, id });
    return btn;
  }

  function nameGroup() {
    const input = h('input', {
      class: 'name-input', type: 'text', maxLength: 12,
      value: draft.name, 'aria-label': 'Your hero\'s name', placeholder: 'Your name',
      onInput: (ev) => { draft.name = ev.target.value.slice(0, 12); redraw(); },
    });
    nameInput = input;

    // Setting a name from a button must not steal the caret out of the field
    // a child may still be typing in — it writes the value and moves on.
    const setName = (value) => {
      draft.name = value;
      input.value = value;
      redraw();
    };

    const dice = h('button', {
      class: 'lh-btn lh-btn--icon', 'aria-label': 'Pick a name for me',
      onClick: () => { setName(pick(NAME_SUGGESTIONS)); sfx.select(); },
      html: icon('dice', { size: 28 }),
    });

    const chips = h('div', { class: 'name-chips' },
      ...NAME_SUGGESTIONS.slice(0, 8).map((n) => h('button', {
        class: 'name-chip',
        onClick: () => { setName(n); sfx.tap(); },
      }, n)));

    return h('div', { class: 'lh-optgroup lh-optgroup--wide' },
      h('div', { class: 'lh-optgroup__label' }, 'My name is…'),
      h('div', { class: 'name-row' }, input, dice),
      chips);
  }

  function difficultyGroup() {
    const card = (id, title, ages, bullets) => {
      const btn = h('button', {
        class: 'diff-card',
        'aria-pressed': String(difficulty === id),
        onClick: () => {
          if (difficulty === id) return;
          difficulty = id;
          // Little Helpers get the prompts read aloud by default; explorers do
          // not. Either way it stays a toggle in the top bar.
          setVoice(id === 'little');
          sfx.select();
          syncPressed();
        },
      },
        h('div', {},
          h('h3', {}, title),
          h('p', { class: `diff-card__ages diff-card__ages--${id}` }, ages),
          h('p', {}, bullets)));
      diffCards.push({ el: btn, id });
      return btn;
    };

    return h('div', { class: 'lh-optgroup lh-optgroup--wide' },
      h('div', { class: 'lh-optgroup__label' }, 'How much help would you like?'),
      h('div', { class: 'difficulty-row' },
        card('little', 'Little Helper', 'Ages about 4–6',
          'Arrows and glowing hints, the right tool sparkles, and only two answers to choose from.'),
        card('explorer', 'Medical Explorer', 'Ages about 7–10',
          'More tools, more answers, real medical words and fewer hints. You can change this any time.')));
  }

  /** Built once, on the way in. */
  function build() {
    buttons.length = 0;
    diffCards.length = 0;
    clear(options);
    const shopAccessories = ownedAccessories(getState().purchased)
      .map((a) => ACCESSORY_LABELS[a]).filter(Boolean);

    // The design's order, and every option id read straight from
    // data/characters.js — never re-authored here.
    options.append(
      nameGroup(),
      group('Skin', SKIN_TONES.map((s) => swatch('skin', s.id, { background: s.value }, null, false, true))),
      group('Hair colour', HAIR_COLORS.map((c) => swatch('hairColor', c.id, { background: c.value }))),
      group('Hair style', HAIR_STYLES.map((s) => swatch('hair', s.id, {}, s.label, true)), { wide: true }),
      group('Scrubs', SCRUB_COLORS.map((c) => swatch('scrubs', c.id, { background: c.value }))),
      group('Lab coat', COAT_COLORS.map((c) => c.value
        ? swatch('coat', c.id, { background: c.value })
        : swatch('coat', c.id, {}, c.label, true))),
      group('Glasses', GLASSES.map((g) => swatch('glasses', g.id, {}, g.label, true))),
      group('Shoes', SHOE_COLORS.map(swatchShoe)),
      group('Something fun', [...ACCESSORIES, ...shopAccessories]
        .map((a) => swatch('accessory', a.id, {}, a.label, true)), { wide: true }),
      difficultyGroup(),
    );
    redraw();
  }

  function swatchShoe(c) {
    const btn = h('button', {
      class: `lh-swatch${c.value === 'rainbow' ? ' lh-swatch--rainbow' : ''}`,
      'aria-pressed': String(draft.shoes === c.id),
      style: c.value === 'rainbow' ? {} : { background: c.value },
      'aria-label': c.id,
      onClick: () => choose('shoes', c.id, btn),
    });
    buttons.push({ el: btn, key: 'shoes', id: c.id });
    return btn;
  }

  function randomise() {
    sfx.great();
    Object.assign(draft, {
      name: pick(NAME_SUGGESTIONS),
      skin: pick(SKIN_TONES).id,
      hair: pick(HAIR_STYLES).id,
      hairColor: pick(HAIR_COLORS).id,
      glasses: pick(GLASSES).id,
      scrubs: pick(SCRUB_COLORS).id,
      coat: pick(COAT_COLORS).id,
      shoes: pick(SHOE_COLORS).id,
      accessory: pick(ACCESSORIES).id,
    });
    // The name field is a separate element from the swatches, so it has to be
    // told too — this was the one control a "surprise me" could leave stale.
    if (nameInput) nameInput.value = draft.name;
    syncPressed();
    redraw();
    sparkle(art, { count: 18 });
  }

  function done() {
    if (!draft.name?.trim()) draft.name = pick(NAME_SUGGESTIONS);
    setHero(draft);
    setDifficulty(difficulty);
    sfx.fanfare();
    sparkle(art, { count: 22 });
    // Straight to the hospital. Asking "doctor or vet?" up front was a choice
    // with no consequence — every track is a room you can walk into, and the
    // level list is where the real picking happens.
    setTimeout(() => go('hub', {}, { replace: true }), 320);
  }

  build();
  return { el, destroy: () => bar.dispose?.() };
}
