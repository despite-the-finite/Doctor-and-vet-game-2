/**
 * Illustrated room interiors used as the stage behind a patient.
 *
 * Pure CSS + emoji props: walls, skirting, a window with a live sky, and a
 * few pieces of furniture. Each room has its own palette so the X-Ray Room
 * genuinely feels different from the Vet Room.
 */
import { h } from '../core/dom.js';

const SCENES = {
  doctor:    { wall: '#dff2ff', wall2: '#bfe4ff', floor: '#f4dfc4', props: ['🪴', '🧸', '📋'], poster: '🌈', sky: 'day' },
  vet:       { wall: '#dffaf0', wall2: '#bdf0dd', floor: '#f6e3c8', props: ['🦴', '🐾', '🧺'], poster: '🐕', sky: 'day' },
  toyshop:   { wall: '#ffe6f1', wall2: '#ffc9e0', floor: '#f0dcc4', props: ['🧶', '🪛', '🔋'], poster: '🧸', sky: 'day' },
  xray:      { wall: '#e6e0ff', wall2: '#cdbff7', floor: '#dcd6ea', props: ['🖥️', '🩻'], poster: '🦴', sky: 'none' },
  lab:       { wall: '#ddf9ec', wall2: '#bdefd8', floor: '#e2eee8', props: ['🧪', '🧫', '📗'], poster: '🔬', sky: 'none' },
  emergency: { wall: '#ffe6e2', wall2: '#ffcac1', floor: '#f0dcd8', props: ['🚑', '🩺', '⏱️'], poster: '❤️', sky: 'night' },
  recovery:  { wall: '#fff1da', wall2: '#ffe0b4', floor: '#f6e0c2', props: ['🛌', '🧺', '🪴'], poster: '🌙', sky: 'night' },
  surgery:   { wall: '#e4f1ff', wall2: '#c6e2ff', floor: '#dde8f4', props: ['💡', '⚕️', '🧤'], poster: '⭐', sky: 'none' },
  reception: { wall: '#fff1de', wall2: '#ffe0ba', floor: '#f2d9b8', props: ['🛎️', '🪴', '🪑'], poster: '🏥', sky: 'day' },
};

export function backdrop(roomId) {
  const s = SCENES[roomId] || SCENES.doctor;

  const el = h('div', { class: 'backdrop', style: {
    '--wall': s.wall, '--wall2': s.wall2, '--floor': s.floor,
  } });

  el.innerHTML = `
    <div class="backdrop__wall"></div>
    <div class="backdrop__floor"></div>
    ${s.sky !== 'none' ? `<div class="backdrop__window backdrop__window--${s.sky}">
      <div class="win-sun">${s.sky === 'night' ? '🌙' : '☀️'}</div>
      <div class="win-cloud win-cloud--a"></div>
      <div class="win-cloud win-cloud--b"></div>
      ${s.sky === 'day' ? '<div class="win-bird">🕊️</div>' : '<div class="win-star">✨</div>'}
    </div>` : `<div class="backdrop__screen"><div class="screen-line"></div><div class="screen-line"></div></div>`}
    <div class="backdrop__poster">${s.poster}</div>
    <div class="backdrop__shelf">
      ${s.props.map((p, i) => `<span class="backdrop__prop" style="animation-delay:${i * 0.4}s">${p}</span>`).join('')}
    </div>
    <div class="backdrop__table"></div>
  `;
  return el;
}
