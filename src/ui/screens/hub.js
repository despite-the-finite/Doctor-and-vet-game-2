/**
 * The hospital hub — an illustrated cutaway building.
 *
 * Locked rooms are visible on purpose ("what's behind that door?"), and when
 * one unlocks it gets a little construction animation before the room itself
 * appears. Purchased decorations are drawn straight into the rooms so every
 * upgrade is immediately, obviously visible.
 */
import { h, wait } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { go } from '../../core/router.js';
import {
  getState, hasRoom, careerCompletion, isCareerFinished, heroTitle,
} from '../../core/state.js';
import { FLOORS, ROOMS } from '../../data/rooms.js';
import { placedItemsFor } from '../../data/shop.js';
import { TRACKS, CAREERS } from '../../data/cases/index.js';
import { hud, heroSVG, modal } from '../components.js';
import { confetti, sparkle, toast, flash } from '../../core/fx.js';

export function hubScreen({ build = null, highlight = null } = {}) {
  const state = getState();

  const el = h('div', { class: 'screen screen--hub' });
  const bar = hud({ title: 'My Hospital', chips: ['stars', 'kindness', 'coins'], dark: true });
  el.appendChild(bar);

  const scroll = h('div', { class: 'screen-scroll hub-scroll' });
  el.appendChild(scroll);

  /* ------------------------------------------------------- hero + status */
  // One line per track, built from the registry so a new career shows up here
  // without anybody remembering to add it.
  const trackLine = CAREERS
    .map((id) => {
      const { done, total } = careerCompletion(id);
      return `${TRACKS[id].icon} ${TRACKS[id].verb} ${done}/${total}`;
    })
    .join('   •   ');

  scroll.appendChild(h('div', { class: 'hub-hero' },
    h('div', { class: 'hub-hero__art', html: heroSVG({ mood: 'happy' }) }),
    h('div', { class: 'hub-hero__text' },
      h('h3', {}, heroTitle()),
      h('p', {}, trackLine)),
    h('button', { class: 'iconbtn', 'aria-label': 'Change my hero', onClick: () => go('creator') }, '🎨')));

  /* ------------------------------------------------------------ building */
  const building = h('div', { class: 'building-wrap' });
  building.appendChild(h('div', { class: 'roof-cap' }, 'LITTLE HEROES HOSPITAL'));

  FLOORS.forEach((floorDef) => {
    const floor = h('div', { class: `floor floor--${floorDef.rooms.length}` });
    floorDef.rooms.forEach((id) => floor.appendChild(roomTile(ROOMS[id], id === highlight)));
    building.appendChild(floor);
  });

  building.appendChild(h('div', { class: 'hub-ground' }));
  scroll.appendChild(building);

  /* ------------------------------------------------------------ actions */
  scroll.appendChild(h('div', { class: 'hub-actions' },
    h('button', { class: 'btn btn--ghost', onClick: () => go('bag') }, '🎒 Doctor Bag'),
    h('button', { class: 'btn btn--ghost', onClick: () => go('shop') }, '🛒 Supply Room')));

  if (CAREERS.every(isCareerFinished)) {
    scroll.appendChild(h('p', { class: 'empty-note' },
      '🏆 You have helped every single patient. You are a true Little Hero!'));
  }

  /* --------------------------------------------------------- room tiles */
  function roomTile(room, isHighlight) {
    const unlocked = hasRoom(room.id);
    const tile = h('button', {
      class: `room${unlocked ? '' : ' room--locked'}${room.roof ? ' room--roof' : ''}`,
      style: { '--tint': room.tint, '--wall': room.wall },
      dataset: { room: room.id },
      'aria-label': unlocked ? room.name : `${room.name} — locked`,
      onClick: () => openRoom(room, unlocked),
    });

    tile.appendChild(h('div', { class: 'room__wall' }));
    tile.appendChild(h('div', { class: 'room__floorline' }));

    if (unlocked) {
      const props = [...(room.props || []), ...placedItemsFor(room.id, state.purchased).map((i) => ({
        emoji: i.icon, x: i.place.x, y: i.place.y, size: i.place.size, anim: i.place.anim,
      }))];
      props.forEach((p) => {
        tile.appendChild(h('span', {
          class: `room__prop${p.anim ? ` ${p.anim}` : ''}`,
          style: {
            left: `${p.x}%`, top: `${p.y}%`, fontSize: `${p.size || 26}px`,
            animation: p.anim ? `${p.anim} ${3 + Math.random() * 2}s ease-in-out infinite` : '',
          },
        }, p.emoji));
      });

      tile.appendChild(h('div', { class: 'room__label' }, h('span', {}, room.icon), h('span', {}, room.name)));

      if (room.action?.startsWith('levels:')) {
        const career = room.action.split(':')[1];
        const { done, total } = careerCompletion(career);
        tile.appendChild(h('div', { class: 'room__count' }, `⭐ ${done}/${total}`));
      }
      tile.appendChild(h('div', { class: 'room__go' }, room.action === 'shop' ? '🛒' : room.action === 'bag' ? '🎒' : '👉'));
    } else {
      tile.appendChild(h('div', { class: 'room__lock' },
        h('div', { class: 'room__lock-icon' }, '🔒'),
        h('div', { class: 'room__lock-name' }, room.name),
        h('div', { class: 'room__lock-how' }, room.unlock?.text || 'Keep helping patients!')));
    }

    if (isHighlight) {
      tile.classList.add('level-card--next');
      setTimeout(() => tile.scrollIntoView({ behavior: 'smooth', block: 'center' }), 260);
    }
    return tile;
  }

  function openRoom(room, unlocked) {
    sfx.tap();
    if (!unlocked) {
      sfx.nudge();
      toast(room.unlock?.text || 'Help more patients to open this room!', { icon: '🔒' });
      return;
    }
    if (room.action === 'shop') return go('shop');
    if (room.action === 'bag') return go('bag');
    if (room.action?.startsWith('levels:')) return go('levels', { career: room.action.split(':')[1] });
    showRoomInfo(room);
  }

  function showRoomInfo(room) {
    const usedBy = Object.values(TRACKS)
      .flatMap((t) => t.cases.filter((c) => c.room === room.id).map((c) => `${t.icon} ${c.title}`));
    modal([
      h('div', { style: { fontSize: '62px' } }, room.icon),
      h('h2', {}, room.name),
      h('p', {}, room.blurb),
      usedBy.length ? h('div', { class: 'unlock-strip' },
        ...usedBy.slice(0, 4).map((u) => h('span', { class: 'unlock-chip' }, u))) : null,
      h('button', { class: 'btn btn--sun', onClick: () => document.querySelector('.modal-veil')?.remove() }, 'Nice! 👍'),
    ]);
  }

  /* ------------------------------------------- construction celebration */
  async function playConstruction(roomIds) {
    for (const id of roomIds) {
      const tile = building.querySelector(`[data-room="${id}"]`);
      if (!tile) continue;
      tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const site = h('div', { class: 'construction' }, h('span', {}, '🚧'));
      tile.appendChild(site);
      sfx.build();
      await wait(500);
      site.firstChild.textContent = '🔨';
      await wait(500);
      site.firstChild.textContent = '🏗️';
      await wait(500);
      site.remove();
      flash('rgba(255,255,255,.6)', 400);
      sfx.unlock();
      sparkle(tile, { count: 20 });
      confetti({ intensity: 0.8, duration: 2000 });
      toast(`${ROOMS[id].icon} ${ROOMS[id].name} is open!`, { icon: '🎉', tone: 'good', ms: 3200 });
      await wait(900);
    }
  }

  return {
    el,
    onEnter() { if (build?.length) playConstruction(build); },
    destroy: () => bar.dispose?.(),
  };
}
