/**
 * The Doctor track's audio personality.
 *
 * Warm, friendly, reassuring — a paediatric ward where nothing is frightening.
 * The narrator never hurries, praise is genuine rather than loud, and anything
 * to do with a poorly patient is spoken gently.
 *
 * The dialogue ITSELF lives in ../data/cases/doctor.js, which is where the
 * game reads it too; this file says how those lines should be performed and
 * which are spoken by whom. Keeping the two apart means a writer can rewrite a
 * case without touching the voice system, and the generator will notice the
 * change on its own.
 */

export const DOCTOR_DIALOGUE = {
  id: 'doctor',
  label: 'Doctor',
  dir: 'doctor',
  personality: 'Warm, friendly and reassuring. A paediatric clinic where a child is always safe.',

  /** Default performance for each kind of line in a case. */
  emotions: {
    prompt: 'encouraging',
    hint: 'encouraging',
    teach: 'teaching',
    readout: 'curious',
    reveal: 'excited',
    outro: 'proud',
    option: 'encouraging',
    empathyOption: 'reassuring',
    empathyReply: 'warm',
    affirm: 'celebratory',
    nudge: 'encouraging',
    found: 'excited',
    triage: 'encouraging',
    explainer: 'teaching',
  },

  /** Default performance by speaker, before a step's own mood overrides it. */
  byWho: {
    narrator: 'warm',
    nurse: 'warm',
    hero: 'encouraging',
    patient: 'warm',
    parent: 'reassuring',
  },
};
