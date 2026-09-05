/**
 * The dialogue registry, derived from the game itself.
 *
 * Every line the game can speak is collected here — from the 50 authored
 * cases, from the shared pools in ./common.js, and from the tool and room
 * catalogues (the game says "the stethoscope is great — but not for this
 * bit!", so that sentence needs a recording too).
 *
 * This module is the contract between the game and the generation script. It
 * runs in Node only; the browser never imports it, because the browser does
 * not need to know which lines exist — it hashes the line it is about to say
 * and looks the hash up in the manifest. Both sides build that hash with
 * ./speech.js, which is why they always agree.
 *
 * IDs look like:
 *   doctor.doc-01.s04.tool.readout          a line inside a case
 *   vet.common.praise.03                    a shared line, in the Vet's voice
 *   toy.common.wrongTool.needle             built from the tool catalogue
 */
import { TRACKS } from '../data/cases/index.js';
import { TOOLS } from '../data/tools.js';
import { ROOMS } from '../data/rooms.js';
import { TOYS, isToy } from '../ui/toy.js';
import { characterFor, narratorFor, MODES } from './characters.js';
import { emotionForMood } from './emotions.js';
import { COMMON_POOLS } from './common.js';
import { DOCTOR_DIALOGUE } from './doctor.js';
import { VET_DIALOGUE } from './vet.js';
import { TOY_DIALOGUE } from './toyDoctor.js';
import {
  keyText, spokenText, lookupKey, withTranslation, showLine, affirmChoice,
  affirmFinding, foundLine, triageLine, readoutLine, tryToolLine, wrongToolLine,
} from './speech.js';
import { hash } from './hash.js';

export const DIALOGUE_MODES = {
  doctor: DOCTOR_DIALOGUE,
  vet: VET_DIALOGUE,
  toy: TOY_DIALOGUE,
};

const TOY_LABELS = {
  plush: 'soft toy', figure: 'action figure', robot: 'robot', doll: 'doll', car: 'toy car',
};

/** Mirrors caseRunner's speciesLabelFor so `{species}` resolves identically. */
function speciesLabelFor(patient) {
  if (patient.kind === 'human') return 'child';
  if (isToy(patient.kind)) return TOY_LABELS[TOYS[patient.kind].family] || 'toy';
  return patient.kind;
}

function resolvePatient(chosen) {
  return { ...chosen, speciesLabel: speciesLabelFor(chosen) };
}

/** Every patient a case can put on stage (a pool case has several). */
function patientsOf(caseDef) {
  const list = caseDef.patientPool || (caseDef.patient ? [caseDef.patient] : []);
  return list.map(resolvePatient);
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Collect every recordable line.
 *
 * Returns entries in a stable order, de-duplicated by lookup key: two cases
 * that happen to use the same words in the same voice share one recording, so
 * the same line is never paid for twice.
 */
export function collectDialogue({ modes = Object.keys(DIALOGUE_MODES) } = {}) {
  const entries = [];
  const seen = new Map();

  function add({ id, mode, character, text, patient = {}, emotion = 'warm', source = {} }) {
    const resolved = keyText(text, patient);
    const spoken = spokenText(resolved);
    // A line that is nothing but a stage direction ("*rattle*") has no words
    // in it — the game already stays silent for those, so skip it.
    if (!spoken) return null;
    const lookup = lookupKey({ mode, character, text: resolved });
    const existing = seen.get(lookup);
    if (existing) {
      existing.usedBy.push(id);
      return existing;
    }
    const entry = {
      id, mode, character, emotion, lookup,
      text: spoken,
      source: { raw: String(text), ...source },
      usedBy: [id],
    };
    entry.textHash = hash(spoken);
    entries.push(entry);
    seen.set(lookup, entry);
    return entry;
  }

  for (const mode of modes) {
    const cfg = DIALOGUE_MODES[mode];
    if (!cfg) continue;
    collectCases(mode, cfg, add);
    collectCommon(mode, cfg, add);
  }

  return entries;
}

/* --------------------------------------------------------------- the cases */

function collectCases(mode, cfg, add) {
  const track = TRACKS[mode];
  if (!track) return;
  const narrator = narratorFor(mode);
  const E = cfg.emotions;

  for (const caseDef of track.cases) {
    const patients = patientsOf(caseDef);

    // Anything the narrator says is patient-independent apart from {name},
    // so a pool case records the narration once per possible patient.
    for (const patient of patients) {
      const suffix = patients.length > 1 ? `.${patient.kind}` : '';
      const at = (step, field) => `${mode}.${caseDef.id}${suffix}.s${pad(step)}.${field}`;
      const speaker = (who) => characterFor({ mode, who, patient });
      const moodOf = (mood, fallback) => emotionForMood(mood, fallback);

      caseDef.steps.forEach((step, i) => {
        const n = i + 1;
        const base = { mode, patient, source: { caseId: caseDef.id, step: n, type: step.type } };

        /* Spoken by setPrompt() at the top of nearly every step. */
        if (step.prompt) {
          add({ ...base, id: at(n, 'prompt'), character: narrator, text: step.prompt, emotion: E.prompt });
        }
        /* Spoken by the idle toast when a child has not moved for a while. */
        if (step.hint) {
          add({ ...base, id: at(n, 'hint'), character: narrator, text: step.hint, emotion: E.hint });
        }
        if (step.teach) {
          add({ ...base, id: at(n, 'teach'), character: narrator, text: step.teach, emotion: E.teach });
        }
        if (step.nudge) {
          add({ ...base, id: at(n, 'nudge'), character: narrator, text: step.nudge, emotion: E.nudge });
        }

        switch (step.type) {
          case 'talk':
            add({
              ...base, id: at(n, `talk.${step.who || 'patient'}`),
              character: speaker(step.who || 'patient'),
              text: withTranslation(step.text, step.translate),
              emotion: moodOf(step.mood, cfg.byWho[step.who || 'patient'] || 'warm'),
            });
            break;

          case 'empathy':
            (step.options || []).forEach((opt, oi) => {
              // The same recording does double duty: the narrator reads the
              // options out, and the hero says the one the child picks.
              add({
                ...base, id: at(n, `empathy.say.${pad(oi + 1)}`), character: speaker('hero'),
                text: opt.label, emotion: E.empathyOption,
              });
              if (opt.reply) {
                add({
                  ...base, id: at(n, `empathy.reply.${pad(oi + 1)}`), character: speaker('patient'),
                  text: opt.reply, emotion: moodOf(opt.mood, E.empathyReply),
                });
              }
            });
            break;

          case 'tool': {
            const tool = TOOLS[step.tool];
            if (!step.hint && tool) {
              add({
                ...base, id: at(n, 'tool.try'), character: narrator,
                text: tryToolLine(tool.name), emotion: E.hint,
              });
            }
            if (step.readout && tool) {
              add({
                ...base, id: at(n, 'tool.readout'), character: narrator,
                text: readoutLine(step.readout, step.readout.label || tool.readout?.label || tool.name),
                emotion: E.readout,
              });
            }
            if (step.reaction?.say || step.reaction?.translate) {
              add({
                ...base, id: at(n, 'tool.reaction'), character: speaker('patient'),
                text: withTranslation(step.reaction.say, step.reaction.translate),
                emotion: moodOf(step.reaction.mood, cfg.byWho.patient || 'warm'),
              });
            }
            break;
          }

          case 'choose':
            (step.options || []).forEach((opt, oi) => {
              add({
                ...base, id: at(n, `choose.option.${pad(oi + 1)}`), character: narrator,
                text: opt.label, emotion: E.option,
              });
              if (opt.correct) {
                add({
                  ...base, id: at(n, `choose.yes.${pad(oi + 1)}`), character: narrator,
                  text: opt.say || affirmChoice(opt.label), emotion: E.affirm,
                });
              }
            });
            break;

          case 'find':
            (step.targets || []).forEach((t, ti) => {
              if (!t.label) return;
              add({
                ...base, id: at(n, `find.${pad(ti + 1)}`), character: narrator,
                text: foundLine(step.found, t.label), emotion: E.found,
              });
            });
            break;

          case 'order':
            (step.items || []).forEach((item, ii) => {
              add({
                ...base, id: at(n, `order.who.${pad(ii + 1)}`), character: narrator,
                text: triageLine(item.label, item.note), emotion: E.triage,
              });
              if (item.why) {
                add({
                  ...base, id: at(n, `order.why.${pad(ii + 1)}`), character: narrator,
                  text: item.why, emotion: E.triage,
                });
              }
            });
            break;

          case 'scan':
            add({
              ...base, id: at(n, 'scan.reveal'), character: narrator,
              text: step.revealCaption || 'Look at that!', emotion: E.reveal,
            });
            (step.findings || []).forEach((opt, oi) => {
              add({
                ...base, id: at(n, `scan.option.${pad(oi + 1)}`), character: narrator,
                text: opt.label, emotion: E.option,
              });
              if (opt.correct) {
                add({
                  ...base, id: at(n, `scan.yes.${pad(oi + 1)}`), character: narrator,
                  text: opt.say || affirmFinding(opt.label), emotion: E.affirm,
                });
              }
            });
            break;

          case 'show':
            add({
              ...base, id: at(n, 'show'), character: narrator,
              text: showLine(step.title, step.text), emotion: E.explainer,
            });
            break;

          default:
            break;
        }
      });

      if (caseDef.outro?.text || caseDef.outro?.translate) {
        add({
          mode, patient,
          id: `${mode}.${caseDef.id}${suffix}.outro`,
          character: characterFor({ mode, who: 'patient', patient }),
          text: withTranslation(caseDef.outro.text, caseDef.outro.translate),
          emotion: emotionForMood(caseDef.outro.mood, cfg.emotions.outro),
          source: { caseId: caseDef.id, step: 'outro', type: 'outro' },
        });
      }
    }
  }
}

/* ------------------------------------------------------- the shared lines */

function collectCommon(mode, cfg, add) {
  const narrator = narratorFor(mode);

  COMMON_POOLS.forEach(({ pool, lines, emotion }) => {
    lines.forEach((text, i) => {
      add({
        mode, character: narrator, emotion, text,
        id: `${mode}.common.${pool}.${pad(i + 1)}`,
        source: { pool, type: 'common' },
      });
    });
  });

  // "The stethoscope is great — but not for this bit!" — one per tool the
  // track actually puts in a tray, so no recording is made for a tool a child
  // will never see in this mode.
  toolsInMode(mode).forEach((id) => {
    const tool = TOOLS[id];
    if (!tool) return;
    add({
      mode, character: narrator, emotion: cfg.emotions.nudge,
      text: wrongToolLine(tool.name),
      id: `${mode}.common.wrongTool.${id}`,
      source: { tool: id, type: 'common' },
    });
  });

  // Room unlock announcements, which can pop up on any screen.
  Object.values(ROOMS).forEach((room) => {
    if (!room?.name) return;
    add({
      mode, character: narrator, emotion: 'celebratory',
      text: `${room.name} unlocked!`,
      id: `${mode}.common.room.${room.id || room.name.toLowerCase().replace(/\W+/g, '-')}`,
      source: { room: room.id, type: 'common' },
    });
  });
}

/** Every tool id a track's cases can put in front of a child. */
function toolsInMode(mode) {
  const used = new Set();
  for (const caseDef of TRACKS[mode]?.cases || []) {
    for (const step of caseDef.steps) {
      if (step.tool) used.add(step.tool);
      (step.decoys || []).forEach((d) => { if (typeof d === 'string') used.add(d); });
    }
  }
  return [...used];
}

/** Grouped counts, for the generator's report. */
export function summarise(entries) {
  const byMode = {};
  const byCharacter = {};
  let characters = 0;
  for (const e of entries) {
    byMode[e.mode] = (byMode[e.mode] || 0) + 1;
    byCharacter[e.character] = (byCharacter[e.character] || 0) + 1;
    characters += e.text.length;
  }
  return { total: entries.length, byMode, byCharacter, characters };
}

export { MODES };
