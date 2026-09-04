/**
 * The Supply Room.
 *
 * Everything here changes something the child can see: decorations appear in
 * the hospital rooms, outfits appear on the hero, and the one big-ticket item
 * physically builds a new wing.
 */
import { h, clear } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { goHome, go } from '../../core/router.js';
import { getState, buyItem, ownsItem } from '../../core/state.js';
import { CATEGORIES, itemsIn } from '../../data/shop.js';
import { hud, sectionTitle } from '../components.js';
import { confetti, sparkle, toast } from '../../core/fx.js';

export function shopScreen({ category = 'comfort' } = {}) {
  let active = category;

  const el = h('div', { class: 'screen screen--shop' });
  const bar = hud({ title: '🛒 Supply Room', back: () => goHome('hub'), dark: true, chips: ['coins'] });
  el.appendChild(bar);

  const scroll = h('div', { class: 'screen-scroll' });
  scroll.appendChild(sectionTitle('📦', 'Spend your coins', 'Everything you buy shows up in your hospital!'));

  const tabs = h('div', { class: 'shop-tabs' });
  const grid = h('div', { class: 'card-grid' });
  scroll.append(tabs, grid);
  el.appendChild(scroll);

  function renderTabs() {
    clear(tabs);
    CATEGORIES.forEach((cat) => {
      tabs.appendChild(h('button', {
        class: `shop-tab${cat.id === active ? ' shop-tab--on' : ''}`,
        onClick: () => { active = cat.id; sfx.tap(); render(); },
      }, h('span', {}, cat.icon), h('span', {}, cat.name)));
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
        h('span', { class: 'kit__icon' }, item.icon),
        h('span', { class: 'kit__name' }, item.name),
        h('span', { class: 'kit__blurb' }, item.blurb),
        h('span', { class: 'buy__price' }, owned ? '✅ Bought!' : `🪙 ${item.price}`));
      grid.appendChild(card);
    });
  }

  function buy(item, card) {
    const result = buyItem(item);
    if (result === 'owned') {
      sfx.tap();
      toast('You already own this one!', { icon: '✅', tone: 'good' });
      return;
    }
    if (result === 'poor') {
      sfx.nudge();
      toast(`You need ${item.price - getState().wallet.coins} more coins — help another patient!`, { icon: '🪙' });
      return;
    }

    sfx.unlock();
    sparkle(card, { count: 16 });
    confetti({ intensity: 0.6, duration: 1800 });

    if (item.unlocksRoom) {
      toast('A new room is being built!', { icon: '🏗️', tone: 'good', ms: 3000 });
      setTimeout(() => go('hub', { build: [item.unlocksRoom] }, { replace: true }), 900);
      return;
    }
    if (item.accessory) {
      toast('Try it on in the character creator! 🎨', { icon: '👕', tone: 'good', ms: 3000 });
    } else {
      toast('It has been added to your hospital!', { icon: '🏥', tone: 'good' });
    }
    render();
  }

  render();
  return { el, destroy: () => bar.dispose?.() };
}
