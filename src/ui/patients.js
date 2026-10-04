/**
 * Patient factory — turns the `patient` block of a case into a DOM element.
 *
 * A patient is just data:
 *   { kind: 'human' | <species>, name, look: {...}, voice }
 * so a new patient never needs new rendering code.
 */
import { humanSVG } from './human.js';
import { creatureSVG, SPECIES } from './creature.js';
import { toySVG, TOYS, isToy } from './toy.js';
import { raw } from '../core/dom.js';

/**
 * Draw a patient.
 *
 * `portrait: true` returns the same artwork cropped to head and shoulders,
 * for the little round thumbnails on the level list, the case name tag and
 * the results screen. Those used to be "cropped" by blowing the full-body
 * drawing up to 185% inside a 76px box and hoping — which framed the top of
 * the head and nothing else. Every renderer now declares the box that
 * actually contains its face (`data-portrait`), so a thumbnail is a real
 * crop: it is framed the same whether the patient is a child, a hedgehog, a
 * robot or a toy car, and it stays framed if the artwork ever moves.
 */
export function patientMarkup(patient, mood = 'happy', { portrait = false } = {}) {
  const svg = draw(patient, mood);
  return portrait ? cropToPortrait(svg) : svg;
}

function draw(patient, mood) {
  // Cases that pick from a `patientPool` have no single patient until the
  // runner chooses one, so callers can legitimately have nothing to draw.
  if (!patient?.kind) return humanSVG({ mood });
  if (patient.kind === 'human') {
    return humanSVG({ ...(patient.look || {}), mood });
  }
  // Toys come in five body plans — plush, action figure, robot, doll and car —
  // so they route through their own renderer rather than the animal one.
  if (isToy(patient.kind)) {
    return toySVG({ kind: patient.kind, mood, ...(patient.look || {}) });
  }
  return creatureSVG({ species: patient.kind, mood, ...(patient.look || {}) });
}

/** Swap the root viewBox for the renderer's declared head-and-shoulders box. */
function cropToPortrait(svg) {
  const box = svg.match(/data-portrait="([^"]+)"/)?.[1];
  if (!box) return svg;
  // Only the first viewBox — the root element's — is ever replaced.
  return svg.replace(/viewBox="[^"]*"/, `viewBox="${box}" preserveAspectRatio="xMidYMid meet"`);
}

export function patientElement(patient, mood = 'happy') {
  const el = raw(patientMarkup(patient, mood), 'patient-art');
  el.dataset.kind = patient.kind;
  return el;
}

/** Swap the artwork in-place when a mood changes, keeping the wrapper. */
export function setMood(el, patient, mood) {
  el.innerHTML = patientMarkup(patient, mood);
  el.dataset.mood = mood;
}

/** The noise this patient makes — used for reactions. */
export function patientSound(patient) {
  if (patient.kind === 'human') return 'squeak';
  if (isToy(patient.kind)) return TOYS[patient.kind].sound || 'squeak';
  return SPECIES[patient.kind]?.sound || 'squeak';
}

export function patientEmoji(patient) {
  if (patient.kind === 'human') return patient.emoji || '🧒';
  if (isToy(patient.kind)) return TOYS[patient.kind].emoji || '🧸';
  return SPECIES[patient.kind]?.emoji || '🐾';
}
