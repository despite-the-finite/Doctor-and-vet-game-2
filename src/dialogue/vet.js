/**
 * The Vet track's audio personality.
 *
 * Cheerful, energetic, compassionate — a busy clinic where every animal is the
 * best animal anyone has ever seen. Brighter and quicker than the Doctor's
 * ward, but it softens the moment an animal is frightened: wild patients are
 * spoken about quietly, because they are quiet.
 *
 * Dialogue lives in ../data/cases/vet.js; this file is how it is performed.
 */

export const VET_DIALOGUE = {
  id: 'vet',
  label: 'Vet',
  dir: 'vet',
  personality: 'Cheerful, energetic and compassionate. A clinic that loves every animal through the door.',

  emotions: {
    prompt: 'encouraging',
    hint: 'encouraging',
    teach: 'teaching',
    readout: 'curious',
    reveal: 'excited',
    outro: 'celebratory',
    option: 'encouraging',
    empathyOption: 'reassuring',
    empathyReply: 'warm',
    affirm: 'celebratory',
    nudge: 'encouraging',
    found: 'excited',
    triage: 'concerned',
    explainer: 'teaching',
  },

  byWho: {
    narrator: 'warm',
    nurse: 'warm',
    hero: 'excited',
    patient: 'playful',
    owner: 'concerned',
  },
};
