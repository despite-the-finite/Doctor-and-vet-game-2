/**
 * Token replacement for case text.
 *   {name}     the patient's name
 *   {hero}     the player's name
 *   {species}  the patient's species (animals only)
 *   {where}    situational text from a patientPool entry
 */
import { getState } from '../core/state.js';

export function fill(text, patient = {}) {
  if (!text) return '';
  const hero = getState().hero?.name || 'Hero';
  return String(text)
    .replaceAll('{name}', patient.name || 'your patient')
    .replaceAll('{hero}', hero)
    .replaceAll('{species}', patient.speciesLabel || patient.kind || 'animal')
    .replaceAll('{where}', patient.where || '');
}
