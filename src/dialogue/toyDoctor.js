/**
 * The Toy Doctor track's audio personality.
 *
 * Whimsical and playful, but kept firmly on the pleasant side of imaginative:
 * squeaky joke voices are exhausting for a four-year-old and impossible to
 * follow. Think bedtime story rather than Saturday-morning cartoon — the toys
 * are characters, not caricatures.
 *
 * Dialogue lives in ../data/cases/toy.js; this file is how it is performed.
 */

export const TOY_DIALOGUE = {
  id: 'toy',
  label: 'Toy Doctor',
  dir: 'toy-doctor',
  personality: 'Whimsical, playful and gentle. A storybook workshop where much-loved things get mended.',

  emotions: {
    prompt: 'encouraging',
    hint: 'encouraging',
    teach: 'teaching',
    readout: 'curious',
    reveal: 'excited',
    outro: 'proud',
    option: 'encouraging',
    empathyOption: 'gentle',
    empathyReply: 'warm',
    affirm: 'celebratory',
    nudge: 'encouraging',
    found: 'playful',
    triage: 'encouraging',
    explainer: 'teaching',
  },

  byWho: {
    narrator: 'warm',
    nurse: 'warm',
    hero: 'proud',
    patient: 'playful',
  },
};
