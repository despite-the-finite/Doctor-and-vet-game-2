#!/usr/bin/env node
/**
 * End-to-end check of the voice lookup — offline, no API key, no network.
 *
 *   node tools/voice-selftest.mjs
 *
 * The whole system rests on one promise: the string the GAME is about to speak
 * hashes to the same key the GENERATOR used when it made the clip. If those two
 * ever drift apart the game still works — it just quietly stops using any of
 * the audio and talks in the browser's voice instead, which is exactly the kind
 * of failure nobody notices for a month.
 *
 * So this test stands up a pretend browser, hands the real src/core/voice.js a
 * pretend manifest built from the real collector, replays the calls the case
 * engine makes for every case in the game, and checks that each one resolves to
 * the clip it should.
 */
import { collectDialogue } from '../src/dialogue/collect.js';
import { TRACKS } from '../src/data/cases/index.js';
import { TOOLS } from '../src/data/tools.js';
import { TOYS, isToy } from '../src/ui/toy.js';
import {
  withTranslation, showLine, affirmChoice, affirmFinding, foundLine,
  triageLine, readoutLine, tryToolLine, spokenText,
} from '../src/dialogue/speech.js';
import { CONNECTORS, SCAN_LINES, PRAISE, NUDGES } from '../src/dialogue/common.js';

/* --------------------------------------------------------- pretend browser */

const played = [];
const spokenBySynth = [];

class FakeAudio {
  constructor() { this.src = ''; this.volume = 1; this.currentTime = 0; this._handlers = {}; }
  addEventListener(type, fn) { (this._handlers[type] ||= []).push(fn); }
  removeEventListener(type, fn) {
    this._handlers[type] = (this._handlers[type] || []).filter((f) => f !== fn);
  }
  play() {
    played.push(this.src);
    // Resolve on the next tick, like a real, very short clip.
    setTimeout(() => (this._handlers.ended || []).forEach((fn) => fn()), 0);
    return Promise.resolve();
  }
  pause() {}
}

const entries = collectDialogue();
const index = { schema: 1, lines: Object.fromEntries(entries.map((e) => [e.lookup, `${e.mode}/${e.lookup}.mp3`])) };

const fakeSynth = {
  getVoices: () => [],
  addEventListener() {},
  speak(utterance) { spokenBySynth.push(utterance.text); setTimeout(() => utterance.onend?.(), 0); },
  cancel() {},
};

globalThis.window = {
  addEventListener() {},
  speechSynthesis: fakeSynth,
  __LHH_AUDIO_BASE__: 'https://test.invalid/audio/',
};
globalThis.document = { baseURI: 'https://test.invalid/' };
globalThis.Audio = FakeAudio;
// Node 22 already has a read-only `navigator`; only define one if it is absent.
if (!globalThis.navigator) globalThis.navigator = { language: 'en-GB' };
globalThis.localStorage = {
  _v: {},
  getItem(k) { return this._v[k] ?? null; },
  setItem(k, v) { this._v[k] = String(v); },
  removeItem(k) { delete this._v[k]; },
};
globalThis.speechSynthesis = fakeSynth;
globalThis.SpeechSynthesisUtterance = class {
  constructor(text) { this.text = text; }
};
globalThis.fetch = async (url) => (
  String(url).endsWith('voice-index.json')
    ? { ok: true, json: async () => index }
    : { ok: false, status: 404, json: async () => ({}) }
);

const voice = await import('../src/core/voice.js');
const { fill } = await import('../src/engine/text.js');
// Give the index fetch (kicked off when voice.js loaded) a tick to land.
await new Promise((r) => setTimeout(r, 10));

/* ---------------------------------------------------- replay the game's calls */

const TOY_LABELS = { plush: 'soft toy', figure: 'action figure', robot: 'robot', doll: 'doll', car: 'toy car' };
function speciesLabelFor(patient) {
  if (patient.kind === 'human') return 'child';
  if (isToy(patient.kind)) return TOY_LABELS[TOYS[patient.kind].family] || 'toy';
  return patient.kind;
}

let checked = 0;
let wordless = 0;
const misses = [];

/** One line, said exactly the way the engine says it. */
async function expectClip(where, text, options) {
  // Lines that are nothing but a stage direction ("*a happy bunny binky*")
  // have no words in them. The game stays silent for those and the generator
  // never records them — that is agreement, not a miss.
  if (!spokenText(text)) { wordless++; return; }
  const before = played.length;
  voice.stop();
  voice.say(fill(text, options.patient || {}), options);
  await new Promise((r) => setTimeout(r, 5));
  checked++;
  if (played.length === before) misses.push(`${where}: "${String(text).slice(0, 70)}"`);
  voice.stop();
}

for (const [mode, track] of Object.entries(TRACKS)) {
  voice.setVoiceMode(mode);
  for (const caseDef of track.cases) {
    const list = caseDef.patientPool || [caseDef.patient];
    for (const chosen of list) {
      const patient = { ...chosen, speciesLabel: speciesLabelFor(chosen) };
      const at = (i, what) => `${caseDef.id}#${i + 1} ${what}`;

      for (const [i, step] of caseDef.steps.entries()) {
        if (step.prompt) await expectClip(at(i, 'prompt'), step.prompt, { key: step.prompt, who: 'narrator', patient });
        if (step.teach) await expectClip(at(i, 'teach'), step.teach, { key: step.teach, who: 'narrator', patient });
        if (step.hint) await expectClip(at(i, 'hint'), step.hint, { key: step.hint, patient });

        switch (step.type) {
          case 'talk': {
            const line = withTranslation(step.text, step.translate);
            await expectClip(at(i, 'talk'), line, { key: line, who: step.who || 'patient', patient });
            break;
          }
          case 'empathy':
            for (const opt of step.options || []) {
              await expectClip(at(i, 'empathy option'), opt.label, { key: opt.label, who: 'hero', patient });
              if (opt.reply) await expectClip(at(i, 'empathy reply'), opt.reply, { key: opt.reply, who: 'patient', patient });
            }
            break;
          case 'tool': {
            const tool = TOOLS[step.tool];
            if (tool && !step.hint) {
              const line = tryToolLine(tool.name);
              await expectClip(at(i, 'tool nudge'), line, { key: line, patient });
            }
            if (tool && step.readout) {
              const line = readoutLine(step.readout, step.readout.label || tool.readout?.label || tool.name);
              await expectClip(at(i, 'readout'), line, { key: line, who: 'narrator', patient });
            }
            if (step.reaction?.say || step.reaction?.translate) {
              const line = withTranslation(step.reaction.say, step.reaction.translate);
              await expectClip(at(i, 'reaction'), line, { key: line, who: 'patient', patient });
            }
            break;
          }
          case 'choose':
            for (const opt of step.options || []) {
              await expectClip(at(i, 'choose option'), opt.label, { key: opt.label, who: 'narrator', patient });
              if (opt.correct) {
                const line = opt.say || affirmChoice(opt.label);
                await expectClip(at(i, 'choose yes'), line, { key: line, who: 'narrator', patient });
              }
            }
            break;
          case 'find':
            for (const t of step.targets || []) {
              if (!t.label) continue;
              const line = foundLine(step.found, t.label);
              await expectClip(at(i, 'found'), line, { key: line, who: 'narrator', patient });
            }
            break;
          case 'order':
            for (const item of step.items || []) {
              const line = triageLine(item.label, item.note);
              await expectClip(at(i, 'triage'), line, { key: line, who: 'narrator', patient });
              if (item.why) await expectClip(at(i, 'triage why'), item.why, { key: item.why, who: 'narrator', patient });
            }
            break;
          case 'scan': {
            const caption = step.revealCaption || SCAN_LINES.reveal;
            await expectClip(at(i, 'reveal'), caption, { key: caption, who: 'narrator', patient });
            for (const opt of step.findings || []) {
              await expectClip(at(i, 'finding'), opt.label, { key: opt.label, who: 'narrator', patient });
              if (opt.correct) {
                const line = opt.say || affirmFinding(opt.label);
                await expectClip(at(i, 'finding yes'), line, { key: line, who: 'narrator', patient });
              }
            }
            break;
          }
          case 'show': {
            const line = showLine(step.title, step.text);
            await expectClip(at(i, 'explainer'), line, { key: line, who: 'narrator', patient });
            break;
          }
          default: break;
        }
      }

      if (caseDef.outro?.text || caseDef.outro?.translate) {
        const line = withTranslation(caseDef.outro.text, caseDef.outro.translate);
        await expectClip(`${caseDef.id} outro`, line, { key: line, who: 'patient', patient });
      }
    }
  }

  // The shared lines, said the way hints.js and the step modules say them.
  for (const line of [...PRAISE, ...NUDGES, CONNECTORS.or, CONNECTORS.chooseLead, SCAN_LINES.question]) {
    await expectClip(`${mode} common`, line, { key: line, who: 'narrator' });
  }
}

/* ------------------------------------------------------- a few behaviours */

const behaviours = [];
function check(name, ok) { behaviours.push({ name, ok }); }

voice.setVoiceMode('doctor');

// The same line asked for twice in a row plays once, not twice over itself.
played.length = 0;
voice.stop();
voice.say(PRAISE[0], { key: PRAISE[0] });
voice.say(PRAISE[0], { key: PRAISE[0] });
await new Promise((r) => setTimeout(r, 20));
check('a repeated line only plays once', played.length === 1);

// A line with no recording still speaks — with the browser voice.
played.length = 0;
spokenBySynth.length = 0;
voice.stop();
voice.say('A line that was never recorded, honestly.', {});
await new Promise((r) => setTimeout(r, 20));
check('an unrecorded line falls back to speech synthesis', spokenBySynth.length === 1 && played.length === 0);

// Leaving a screen stops the queue.
voice.stop();
voice.say(PRAISE[1], { key: PRAISE[1] });
voice.say(PRAISE[2], { key: PRAISE[2] });
voice.stop();
played.length = 0;
await new Promise((r) => setTimeout(r, 20));
check('stop() empties the queue', played.length === 0);

// The same words in two tracks are two different recordings.
voice.setVoiceMode('vet');
voice.stop();
played.length = 0;
voice.say(PRAISE[0], { key: PRAISE[0] });
await new Promise((r) => setTimeout(r, 20));
const vetClip = played[0];
voice.setVoiceMode('toy');
voice.stop();
played.length = 0;
voice.say(PRAISE[0], { key: PRAISE[0] });
await new Promise((r) => setTimeout(r, 20));
check('each track has its own recording of a shared line', vetClip && played[0] && vetClip !== played[0]);

/* ------------------------------------------------------------------ report */

console.log(`\n🎙  voice self-test`);
console.log(`   ${checked} spoken lines replayed from the real case data`);
console.log(`   ${wordless} wordless stage directions correctly left silent`);
behaviours.forEach((b) => console.log(`   ${b.ok ? '✔' : '✖'} ${b.name}`));

const failed = behaviours.filter((b) => !b.ok);
if (misses.length || failed.length) {
  if (misses.length) {
    console.error(`\n✖ ${misses.length} line(s) the game would say have no matching clip:`);
    misses.slice(0, 25).forEach((m) => console.error(`   ${m}`));
    if (misses.length > 25) console.error(`   …and ${misses.length - 25} more`);
    console.error('\n  The engine and src/dialogue/collect.js have drifted apart: a line is');
    console.error('  composed differently in one of them, or spoken by a different character.');
  }
  console.error('');
  process.exit(1);
}
console.log('   every line the engine speaks resolves to a clip\n');
