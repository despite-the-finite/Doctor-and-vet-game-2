/**
 * The hospital building.
 *
 * FLOORS describes the cutaway dollhouse from the roof down. Each room is a
 * data entry with its own colour, props and what tapping it does, so adding a
 * Dentistry wing later means adding one room + one floor row.
 *
 *   action  'levels:doctor' | 'levels:vet' | 'shop' | 'bag' | 'info'
 *   unlock  how the room is earned — shown on the locked door
 *   props   emoji furniture drawn inside the room (position is % of the room)
 */

export const ROOMS = {
  reception: {
    id: 'reception', name: 'Reception', icon: '🛎️', tint: '#ffd9a8', wall: '#ffeccd',
    blurb: 'Where every patient says hello.',
    action: 'bag', wide: true,
    props: [
      { emoji: '🛎️', x: 22, y: 62, size: 30 },
      { emoji: '🪑', x: 62, y: 66, size: 30 },
      { emoji: '🪴', x: 88, y: 62, size: 32 },
      { emoji: '🧑‍⚕️', x: 36, y: 58, size: 34, anim: 'bob-slow' },
    ],
  },
  supply: {
    id: 'supply', name: 'Supply Room', icon: '📦', tint: '#c9e6ff', wall: '#e2f2ff',
    blurb: 'Shelves full of shiny new things to buy.',
    action: 'shop',
    props: [
      { emoji: '📦', x: 26, y: 66, size: 30 },
      { emoji: '🧰', x: 58, y: 66, size: 28 },
      { emoji: '🧻', x: 82, y: 64, size: 26 },
    ],
  },
  doctor: {
    id: 'doctor', name: 'Doctor Room', icon: '🩺', tint: '#bfe6ff', wall: '#ddf3ff',
    blurb: 'Where people patients get better.',
    action: 'levels:doctor',
    props: [
      { emoji: '🛏️', x: 30, y: 66, size: 32 },
      { emoji: '🩺', x: 62, y: 52, size: 26, anim: 'sway' },
      { emoji: '🧸', x: 84, y: 66, size: 24 },
    ],
  },
  vet: {
    id: 'vet', name: 'Vet Room', icon: '🐾', tint: '#c9f4e3', wall: '#e0fbf1',
    blurb: 'Where furry, feathery patients get better.',
    action: 'levels:vet',
    props: [
      { emoji: '🐕', x: 30, y: 66, size: 32, anim: 'bob' },
      { emoji: '🐈', x: 60, y: 66, size: 28, anim: 'bob-slow' },
      { emoji: '🦴', x: 84, y: 70, size: 22 },
    ],
  },
  toyshop: {
    id: 'toyshop', name: 'Toy Workshop', icon: '🧸', tint: '#ffd8e8', wall: '#ffecf4',
    blurb: 'Where much-loved toys are mended and sent home.',
    action: 'levels:toy', wide: true,
    props: [
      { emoji: '🧸', x: 22, y: 66, size: 30, anim: 'bob' },
      { emoji: '🤖', x: 46, y: 62, size: 26 },
      { emoji: '🚗', x: 68, y: 68, size: 26 },
      { emoji: '🪛', x: 88, y: 60, size: 22, anim: 'sway' },
    ],
  },
  xray: {
    id: 'xray', name: 'X-Ray Room', icon: '🩻', tint: '#d9cdf7', wall: '#ebe3ff',
    blurb: 'Take a photo of the bones inside!',
    action: 'info', locked: true,
    unlock: { text: 'Finish Doctor Level 5 or Vet Level 5', career: 'doctor', level: 5 },
    props: [
      { emoji: '🩻', x: 34, y: 58, size: 34, anim: 'twinkle' },
      { emoji: '🖥️', x: 68, y: 64, size: 28 },
    ],
  },
  lab: {
    id: 'lab', name: 'Laboratory', icon: '🔬', tint: '#c6f0dd', wall: '#dffaee',
    blurb: 'A tiny world under the lens.',
    action: 'info', locked: true,
    unlock: { text: 'Finish Doctor Level 7 or Vet Level 8', career: 'doctor', level: 7 },
    props: [
      { emoji: '🔬', x: 30, y: 60, size: 32 },
      { emoji: '🧪', x: 58, y: 62, size: 26, anim: 'sway' },
      { emoji: '🧫', x: 80, y: 66, size: 24 },
    ],
  },
  imaging: {
    id: 'imaging', name: 'Imaging Centre', icon: '🖼️', tint: '#ffd6e6', wall: '#ffe8f1',
    blurb: 'Big machines that see everything.',
    action: 'info', locked: true,
    unlock: { text: 'Buy it in the Supply Room', shop: true },
    props: [
      { emoji: '🖼️', x: 34, y: 60, size: 30 },
      { emoji: '🧲', x: 68, y: 62, size: 28, anim: 'twinkle' },
    ],
  },
  recovery: {
    id: 'recovery', name: 'Animal Recovery', icon: '🛌', tint: '#ffe2b8', wall: '#fff0d8',
    blurb: 'Cosy beds for animals having a rest.',
    action: 'info', locked: true,
    unlock: { text: 'Finish Vet Level 6', career: 'vet', level: 6 },
    props: [
      { emoji: '🐇', x: 28, y: 66, size: 28, anim: 'bob' },
      { emoji: '🛌', x: 56, y: 66, size: 30 },
      { emoji: '🐦', x: 82, y: 58, size: 24, anim: 'bob-slow' },
    ],
  },
  emergency: {
    id: 'emergency', name: 'Emergency Room', icon: '🚑', tint: '#ffcfc9', wall: '#ffe3df',
    blurb: 'Help the patient who needs you most, first.',
    action: 'info', locked: true,
    unlock: { text: 'Finish Doctor Level 9 or Vet Level 9', career: 'doctor', level: 9 },
    props: [
      { emoji: '🚑', x: 30, y: 64, size: 32, anim: 'bob' },
      { emoji: '❤️', x: 62, y: 56, size: 26, anim: 'twinkle' },
      { emoji: '🧑‍⚕️', x: 84, y: 62, size: 26 },
    ],
  },
  surgery: {
    id: 'surgery', name: 'Surgery', icon: '⚕️', tint: '#c8e2ff', wall: '#e3f1ff',
    blurb: 'The most important room in the hospital.',
    action: 'info', locked: true, wide: true,
    unlock: { text: 'Become a Hospital Hero — Doctor Level 10', career: 'doctor', level: 10 },
    props: [
      { emoji: '💡', x: 34, y: 46, size: 30, anim: 'twinkle' },
      { emoji: '🛏️', x: 50, y: 66, size: 34 },
      { emoji: '⚕️', x: 72, y: 56, size: 28 },
    ],
  },
  helipad: {
    id: 'helipad', name: 'Helipad', icon: '🚁', tint: '#cfe9ff', wall: 'transparent',
    blurb: 'Rescue missions land right on the roof!',
    action: 'info', locked: true, roof: true,
    unlock: { text: 'Become a Master Vet — Vet Level 10', career: 'vet', level: 10 },
    props: [{ emoji: '🚁', x: 50, y: 40, size: 42, anim: 'bob' }],
  },
};

/** Top-to-bottom cutaway layout. */
export const FLOORS = [
  { id: 'roof', rooms: ['helipad'] },
  { id: 'f4',   rooms: ['surgery'] },
  { id: 'f3',   rooms: ['emergency', 'recovery'] },
  { id: 'f2',   rooms: ['xray', 'lab'] },
  { id: 'f1b',  rooms: ['imaging', 'supply'] },
  { id: 'f1',   rooms: ['doctor', 'vet'] },
  { id: 'f0',   rooms: ['toyshop'] },
  { id: 'g',    rooms: ['reception'] },
];

export function getRoom(id) { return ROOMS[id]; }

export const ALL_ROOM_IDS = Object.keys(ROOMS);
