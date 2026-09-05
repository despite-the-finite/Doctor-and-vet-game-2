/**
 * The Supply Room.
 *
 * Everything here changes something the child can see: decorations appear in
 * the hospital rooms, outfits appear on the hero, and the one big-ticket item
 * physically builds a new wing.
 */
import { icon } from '../icons.js';
import { propMarkup } from '../props.js';
import { h, clear } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { goHome, go } from '../../core/router.js';
import { getState, buyItem, ownsItem } from '../../core/state.js';
import { CATEGORIES, itemsIn } from '../../data/shop.js';
import { hud, sectionTitle } from '../components.js';
import { confetti, sparkle, toast } from '../../core/fx.js';

export function shopScreen({ category = 'comfort' } = {}) {
  let active = category;

  const el = h('div', { class: 'lh-screen lh-screen--shop', 'data-world': 'doctor' });
  const bar = hud({ title: 'Supply Room', back: () => goHome('hub'), dark: true, chips: ['coins'] });
  el.appendChild(bar);

  const scroll = h('div', { class: 'lh-screen__scroll' });
  scroll.appendChild(sectionTitle(icon('bag', { size: 30 }), 'Spend your coins', 'Everything you buy shows up in your hospital!'));

  const tabs = h('div', { class: 'shop-tabs' });
  const grid = h('div', { class: 'lh-card-grid' });
  scroll.append(tabs, grid);
  el.appendChild(scroll);

  function renderTabs() {
    clear(tabs);
    CATEGORIES.forEach((cat) => {
      tabs.appendChild(h('button', {
        class: 'shop-tab',
        role: 'tab',
        'aria-selected': String(cat.id === active),
        onClick: () => { active = cat.id; sfx.tap(); render(); },
      }, h('span', { class: 'shop-tab__mark', html: propMarkup(cat.icon) }), h('span', {}, cat.name)));
    });
  }

  function render() {
    renderTabs();
    clear(grid);
    const coins = getState().wallet.coins;
    const items = itemsIn(active);

    if (!items.length) {
      grid.appendChild(h('p', { class: 'empty-note' }, 'Nothing here yet — check back soon!'));
      return;
    }

    items.forEach((item) => {
      const owned = ownsItem(item.id);
      const affordable = coins >= item.price;
      const card = h('button', {
        class: `kit buy${owned ? ' buy--owned' : ''}${!owned && !affordable ? ' buy--poor' : ''}`,
        onClick: () => buy(item, card),
      },
        h('span', { class: 'kit__icon', html: propMarkup(item.icon) }),
        h('span', { class: 'kit__name' }, item.name),
        h('span', { class: 'kit__blurb' }, item.blurb),
        h('span', { class: 'buy__price' },
        owned ? 'Bought!' : h('span', { class: 'buy__coin', html: icon('coin', { size: 22 }) }),
        owned ? '' : String(item.price)));
      grid.appendChild(card);
    });
  }

  function buy(item, card) {
    const result = buyItem(item);
    if (result === 'owned') {
      sfx.tap();
      toast('You already own this one!', { mark: 'tick', tone: 'good' });
      return;
    }
    if (result === 'poor') {
      sfx.nudge();
      toast(`You need ${item.price - getState().wallet.coins} more coins — help another patient!`, { mark: 'coin' });
      return;
    }

    sfx.unlock();
    sparkle(card, { count: 16 });
    confetti({ intensity: 0.6, duration: 1800 });

    if (item.unlocksRoom) {
      toast('A new room is being built!', { tone: 'good', ms: 3000 });
      setTimeout(() => go('hub', { build: [item.unlocksRoom] }, { replace: true }), 900);
      return;
    }
    if (item.accessory) {
      toast('Try it on in the character creator!', { tone: 'good', ms: 3000 });
    } else {
      toast('It has been added to your hospital!', { tone: 'good' });
    }
    render();
  }

  render();
  return { el, destroy: () => bar.dispose?.() };
}
