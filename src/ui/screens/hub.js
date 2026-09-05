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
import { hud, heroSVG, modal, progressBar } from '../components.js';
import { confetti, sparkle, toast, flash } from '../../core/fx.js';
import { icon } from '../icons.js';
import { propMarkup, isLivingProp } from '../props.js';

export function hubScreen({ build = null, highlight = null } = {}) {
  const state = getState();

  const el = h('div', { class: 'lh-screen lh-screen--hub', 'data-world': 'doctor' });
  const bar = hud({ title: 'My Hospital', chips: ['stars', 'kindness', 'coins'], dark: true });
  el.appendChild(bar);

  const scroll = h('div', { class: 'lh-screen__scroll hub-scroll' });
  el.appendChild(scroll);

  /* ------------------------------------------------------- hero + status */
  // One line per track, built from the registry so a new career shows up here
  // without anybody remembering to add it.
  const trackLine = CAREERS
    .map((id) => {
      const { done, total } = careerCompletion(id);
      return `${TRACKS[id].verb} ${done}/${total}`;
    })
    .join(' · ');

  scroll.appendChild(h('div', { class: 'hub-hero' },
    h('div', { class: 'hub-hero__art', html: heroSVG({ mood: 'happy' }) }),
    h('div', { class: 'hub-hero__text' },
      h('h3', {}, heroTitle()),
      h('p', {}, trackLine)),
    h('button', {
      class: 'lh-btn lh-btn--icon', 'aria-label': 'Change my hero',
      html: icon('palette'), onClick: () => go('creator'),
    })));

  /* ------------------------------------------------------- world doors */
  // Three drawn room mouths, each in its world's hue. A child knows where
  // they are before reading a word.
  const doors = h('div', { class: 'hub-doors' });
  CAREERS.forEach((id) => {
    const track = TRACKS[id];
    const { done, total } = careerCompletion(id);
    doors.appendChild(h('button', {
      class: 'hub-door', 'data-world': id,
      'aria-label': `${track.name} — ${done} of ${total} helped`,
      onClick: () => { sfx.select(); go('levels', { career: id }); },
    },
      h('div', { class: 'hub-door__room', html: doorRoom(id) }),
      h('div', { class: 'hub-door__head' },
        h('span', { class: 'hub-door__mark', html: icon(id, { size: 26 }) }),
        h('div', {},
          h('div', { class: 'hub-door__title' }, track.name),
          h('div', { class: 'hub-door__sub' }, `${track.blurb.replace(/\.$/, '')} · ${done}/${total}`))),
      h('span', { class: 'hub-door__go' }, done ? 'Continue' : 'Start')));
  });

  scroll.appendChild(h('div', { class: 'hub-top' },
    doors,
    h('div', { class: 'lh-panel lh-panel--float hub-progress' },
      h('h3', {}, 'Your hospital is growing'),
      progressBar(openRooms(), Object.keys(ROOMS).length, 'Rooms open'))));

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
    h('button', { class: 'lh-btn lh-btn--quiet', onClick: () => go('bag') },
      h('span', { class: 'lh-btn__mark', html: icon('kit', { size: 26 }) }), 'Doctor Bag'),
    h('button', { class: 'lh-btn lh-btn--quiet', onClick: () => go('shop') },
      h('span', { class: 'lh-btn__mark', html: icon('bag', { size: 26 }) }), 'Supply Room')));

  if (CAREERS.every(isCareerFinished)) {
    scroll.appendChild(h('p', { class: 'empty-note' },
      'You have helped every single patient. You are a true Little Hero!'));
  }

  function openRooms() { return Object.keys(ROOMS).filter((id) => hasRoom(id)).length; }

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
        const size = (p.size || 26) * (isLivingProp(p.emoji) ? 2.6 : 1.8);
        tile.appendChild(h('span', {
          class: `room__prop${isLivingProp(p.emoji) ? ' room__prop--living' : ''}`,
          style: {
            left: `${p.x}%`, top: `${p.y}%`, width: `${size}px`, height: `${size}px`,
            animation: p.anim ? `${p.anim} ${3 + Math.random() * 2}s ease-in-out infinite` : '',
          },
          html: propMarkup(p.emoji, { accent: room.tint }),
        }));
      });

      tile.appendChild(h('div', { class: 'room__label' }, room.name));

      if (room.action?.startsWith('levels:')) {
        const career = room.action.split(':')[1];
        const { done, total } = careerCompletion(career);
        tile.appendChild(h('div', { class: 'room__count' }, `${done}/${total}`));
      }
      tile.appendChild(h('div', {
        class: 'room__go',
        html: icon(room.action === 'shop' ? 'bag' : room.action === 'bag' ? 'kit' : 'play', { size: 24 }),
      }));
    } else {
      tile.appendChild(h('div', { class: 'room__lock' },
        h('div', { class: 'room__lock-icon', html: icon('lock', { size: 34 }) }),
        h('div', { class: 'room__lock-name' }, room.name),
        h('div', { class: 'room__lock-how' }, room.unlock?.text || 'Keep helping patients!')));
    }

    if (isHighlight) {
      tile.classList.add('lh-case--next');
      setTimeout(() => tile.scrollIntoView({ behavior: 'smooth', block: 'center' }), 260);
    }
    return tile;
  }

  function openRoom(room, unlocked) {
    sfx.tap();
    if (!unlocked) {
      sfx.nudge();
      toast(room.unlock?.text || 'Help more patients to open this room!');
      return;
    }
    if (room.action === 'shop') return go('shop');
    if (room.action === 'bag') return go('bag');
    if (room.action?.startsWith('levels:')) return go('levels', { career: room.action.split(':')[1] });
    showRoomInfo(room);
  }

  function showRoomInfo(room) {
    const usedBy = Object.values(TRACKS)
      .flatMap((t) => t.cases.filter((c) => c.room === room.id).map((c) => c.title));
    modal([
      h('div', { class: 'room-info__art', html: propMarkup(room.props?.[0]?.emoji || room.icon, { accent: room.tint }) }),
      h('h2', {}, room.name),
      h('p', {}, room.blurb),
      usedBy.length ? h('div', { class: 'unlock-strip' },
        ...usedBy.slice(0, 4).map((u) => h('span', { class: 'unlock-chip' }, u))) : null,
      h('button', { class: 'lh-btn lh-btn--secondary', onClick: () => document.querySelector('.lh-modal__veil')?.remove() }, 'Nice!'),
    ]);
  }

  /* ------------------------------------------- construction celebration */
  async function playConstruction(roomIds) {
    for (const id of roomIds) {
      const tile = building.querySelector(`[data-room="${id}"]`);
      if (!tile) continue;
      tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const site = h('div', { class: 'construction', html: propMarkup('🧰', { accent: ROOMS[id].tint }) });
      tile.appendChild(site);
      sfx.build();
      await wait(1500);
      site.remove();
      flash('rgba(255,255,255,.6)', 400);
      sfx.unlock();
      sparkle(tile, { count: 20 });
      confetti({ intensity: 0.8, duration: 2000 });
      toast(`${ROOMS[id].name} is open!`, { tone: 'good', ms: 3200 });
      await wait(900);
    }
  }

  return {
    el,
    onEnter() { if (build?.length) playConstruction(build); },
    destroy: () => bar.dispose?.(),
  };
}


/* ------------------------------------------------------------ the doors */

/**
 * A world door is a drawn room mouth: a floor, a band of the world's own
 * light, and whoever is waiting in there. Big soft shapes only —
 * rectangles appear inside furniture, not as the room itself.
 */
function doorRoom(world) {
  if (world === 'doctor') {
    return `
      <div style="position:absolute;left:0;bottom:0;width:100%;height:57%;
        background:linear-gradient(180deg,#DFF6F4,#C4EDE9)"></div>
      <div style="position:absolute;left:0;bottom:52%;width:100%;height:12px;background:#FFB13B"></div>
      <div style="position:absolute;left:8%;bottom:16%;width:42%;height:23%;
        border-radius:16px 16px 6px 6px;background:#FFF9F0;box-shadow:0 5px 0 #CFE4E1"></div>
      <div style="position:absolute;left:11%;bottom:34%;width:36%;height:8%;
        border-radius:9px;background:#5EC8F0"></div>
      <div style="position:absolute;right:9%;bottom:15%;width:28%;
        animation:lh-bob-slow 3.4s ease-in-out infinite">${propMarkup('🧑‍⚕️')}</div>`;
  }
  if (world === 'vet') {
    return `
      <div style="position:absolute;left:0;bottom:0;width:100%;height:55%;
        background:linear-gradient(180deg,#E4F7E9,#CCEFCF)"></div>
      <div style="position:absolute;left:-10%;bottom:48%;width:70%;height:24%;
        border-radius:50% 50% 0 0 / 100% 100% 0 0;background:#9BDC5A"></div>
      <div style="position:absolute;right:-8%;bottom:46%;width:58%;height:19%;
        border-radius:50% 50% 0 0 / 100% 100% 0 0;background:#7FCF8C"></div>
      <div style="position:absolute;left:6%;bottom:13%;width:30%;
        animation:lh-bob 3s ease-in-out infinite">${propMarkup('🐕')}</div>
      <div style="position:absolute;right:8%;bottom:14%;width:24%;
        animation:lh-bob-slow 4.2s ease-in-out infinite">${propMarkup('🐈')}</div>`;
  }
  return `
    <div style="position:absolute;left:0;bottom:0;width:100%;height:55%;
      background:linear-gradient(180deg,#F3EBFF,#E4D4FA)"></div>
    <div style="position:absolute;left:-6%;bottom:50%;width:112%;height:16%;
      border-radius:50% 50% 0 0 / 100% 100% 0 0;background:#C9A0F5"></div>
    <div style="position:absolute;left:8%;bottom:15%;width:40%;height:20%;
      border-radius:14px;background:#FFF9F0;box-shadow:0 5px 0 #DCC8F2"></div>
    <div style="position:absolute;right:10%;bottom:14%;width:28%;
      animation:lh-bob 3.2s ease-in-out infinite">${propMarkup('🧸')}</div>`;
}
