/**
 * Case registry.
 *
 * Add a new track by importing it here and registering it in TRACKS —
 * nothing else in the game needs to know about it.
 */
import { DOCTOR_CASES } from './doctor.js';
import { VET_CASES } from './vet.js';
import { TOY_CASES } from './toy.js';

export const TRACKS = {
  doctor: {
    id: 'doctor', name: 'Doctor', verb: 'Doctor', icon: '🩺',
    blurb: 'Help people feel better.', tint: '#39b5f0',
    room: 'doctor', cases: DOCTOR_CASES,
    previewPatients: ['🧒', '👧', '👦', '🧑', '👶'],
  },
  vet: {
    id: 'vet', name: 'Veterinarian', verb: 'Vet', icon: '🐾',
    blurb: 'Help animals feel better.', tint: '#3fd0a6',
    room: 'vet', cases: VET_CASES,
    previewPatients: ['🐶', '🐱', '🐰', '🐦', '🦊', '🐢'],
  },
  toy: {
    id: 'toy', name: 'Toy Doctor', verb: 'Toy Doctor', icon: '🧸',
    blurb: 'Mend much-loved toys.', tint: '#ff9ec4',
    room: 'toyshop', cases: TOY_CASES,
    previewPatients: ['🧸', '🤖', '🦸', '🪆', '🏎️', '🩰'],
  },
};

export const CAREERS = Object.keys(TRACKS);

export function getTrack(career) { return TRACKS[career]?.cases || []; }

export function getCase(career, level) {
  return getTrack(career).find((c) => c.level === level) || null;
}

export function getCaseById(id) {
  for (const career of CAREERS) {
    const found = getTrack(career).find((c) => c.id === id);
    if (found) return found;
  }
  return null;
}

/** Every tool a case will put in the tray (needed tools + decoys). */
export function toolsUsedBy(caseDef) {
  const used = new Set();
  for (const step of caseDef.steps) {
    if (step.tool) used.add(step.tool);
    step.decoys?.forEach((d) => used.add(d));
  }
  return [...used];
}

/** Total stars a perfect run of a case can award (steps + completion bonus). */
export function maxStarsFor(caseDef) {
  const stepStars = caseDef.steps.reduce((sum, s) => sum + (s.stars || 0), 0);
  const kindness = caseDef.steps.filter((s) => s.type === 'empathy').length;
  return { stepStars, kindness, bonus: caseDef.reward.stars };
}
