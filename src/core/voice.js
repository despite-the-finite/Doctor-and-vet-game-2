/**
 * Spoken dialogue.
 *
 * A four-year-old cannot read "Drag the stethoscope onto the chest", so the
 * game reads everything out. Lines are recorded ahead of time with ElevenLabs
 * (`npm run generate-voices`) and played from public/audio/; when a line has
 * no recording — a new case, a name the recording could not know, audio that
 * was never generated — the browser's own speech synthesis says it instead,
 * exactly as it always did. Nothing about the game depends on which of the two
 * is speaking, and nothing here ever calls a network API.
 *
 * How a line finds its recording:
 *
 *   say('Maya is wriggling.', { key: 'Maya is wriggling.', who: 'narrator' })
 *     → dialogue/speech.js normalises it and hashes it with the current track
 *       and character
 *     → voicePlayback.js looks that hash up in the generated index
 *
 * `key` is the text with its `{name}` tokens resolved the way the RECORDING
 * resolved them; the first argument is what is on screen (with the player's
 * own hero name in it). They are usually the same string.
 *
 * Lines are QUEUED rather than interrupted. A step routinely says several
 * things in a row — "Good spotting!", then what was actually found, then the
 * fun fact — and cancelling on every call meant a child only ever heard the
 * last one. Anything that genuinely replaces what came before (a new screen, a
 * new step) calls `say(..., { interrupt: true })` or `stop()`.
 */
import { getState, setVoice } from './state.js';
import { duckForSpeech, unduckAfterSpeech } from './audio.js';
import { keyText, spokenText, lookupKey } from '../dialogue/speech.js';
import { characterFor, narratorFor } from '../dialogue/characters.js';
import { loadVoiceIndex, clipFor, playClip, stopClip } from './voicePlayback.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
const canPlayFiles = typeof Audio !== 'undefined';

/** There is a voice as long as EITHER route works. */
export const isSupported = canPlayFiles || !!synth;

let ready = false;

/** Voices load asynchronously in most browsers. */
function pickVoice() {
  if (!synth) return null;
  const voices = synth.getVoices();
  if (!voices.length) return null;
  const lang = (navigator.language || 'en-GB');
  // Prefer a local voice in the page language; fall back to any English one.
  return voices.find((v) => v.localService && v.lang === lang)
    || voices.find((v) => v.lang === lang)
    || voices.find((v) => v.lang?.startsWith('en'))
    || voices[0];
}

if (synth) {
  const warm = () => { ready = true; };
  synth.addEventListener?.('voiceschanged', warm);
  // Some browsers already have voices; some only after a gesture.
  if (synth.getVoices().length) ready = true;
  ['pointerdown', 'keydown'].forEach((evt) =>
    window.addEventListener(evt, warm, { once: true, passive: true }));
}

// Start fetching the recorded-line index immediately; it is a few kilobytes
// and the title screen speaks within a second or two.
if (typeof window !== 'undefined') loadVoiceIndex();

export function voiceOn() {
  return isSupported && getState().settings.voice !== false;
}

export function toggleVoice() {
  const next = !voiceOn();
  setVoice(next);
  if (!next) stop();
  else say('Hello!', { interrupt: true });
  return next;
}

/* ------------------------------------------------------------------ scene */

/**
 * Which track's voices are speaking.
 *
 * The three tracks share no voices, so every lookup is scoped by track. It
 * follows the career the player is in, which the save file already tracks —
 * screens only need to call setVoiceMode() when they know better than the save
 * does (the case screen, which is handed a career directly).
 */
let modeOverride = null;

export function setVoiceMode(mode) { modeOverride = mode || null; }

export function currentVoiceMode() {
  return modeOverride || getState().career || 'doctor';
}

/* ----------------------------------------------------------------- queue */

/** Lines waiting to be spoken, oldest first. */
let queue = [];
let speaking = false;
/**
 * How many copies of each line are queued.
 *
 * Two code paths in one step occasionally say the same thing (the options are
 * read out, then the one the child picked is repeated), and with recorded
 * audio that plays the same file twice over the top of itself. A line is
 * dropped when it is already waiting — unless the caller passes `repeat`,
 * which the "Or:" between options needs.
 */
const pending = new Map();
/** Resolvers waiting for the queue to drain — see `whenDone()`. */
let idleWaiters = [];

function flushIdle() {
  const waiters = idleWaiters;
  idleWaiters = [];
  waiters.forEach((resolve) => resolve());
}

/**
 * Bumped by every stop(). A clip that was already in flight when the player
 * left the screen checks this before touching the queue again, so an
 * interrupted line can never restart the queue behind a new one.
 */
let epoch = 0;

async function pump() {
  if (speaking) return;
  const item = queue.shift();
  if (!item) {
    speaking = false;
    unduckAfterSpeech();
    flushIdle();
    return;
  }

  const era = epoch;
  speaking = true;
  duckForSpeech();

  const url = clipFor(item.lookup);
  let played = false;
  if (url) {
    try {
      played = await playClip(url);
    } catch (err) {
      console.warn('[voice] clip failed', err);
    }
  }
  if (era !== epoch) return; // stopped while that clip was playing

  if (played) {
    release(item);
    speaking = false;
    pump();
    return;
  }

  speakWithSynth(item, era);
}

/**
 * A line stays "pending" until it has actually finished, not merely until it
 * starts — otherwise the second of two identical calls would queue up behind
 * the first and say the same thing twice in a row.
 */
function release(item) {
  const left = (pending.get(item.lookup) || 1) - 1;
  if (left > 0) pending.set(item.lookup, left); else pending.delete(item.lookup);
}

/** The fallback: the browser's own voice, exactly as before. */
function speakWithSynth(item, era = epoch) {
  if (!synth) { release(item); speaking = false; pump(); return; }
  try {
    const utter = new SpeechSynthesisUtterance(item.text);
    const voice = ready ? pickVoice() : null;
    if (voice) { utter.voice = voice; utter.lang = voice.lang; }
    utter.rate = item.rate;
    utter.pitch = item.pitch;
    utter.volume = 0.9;
    // `onend` does not fire if the utterance errors or is cancelled, so both
    // paths have to release the queue or the voice would stop for good.
    const next = () => { if (era !== epoch) return; release(item); speaking = false; pump(); };
    utter.onend = next;
    utter.onerror = next;
    synth.speak(utter);
  } catch (err) {
    console.warn('[voice] could not speak', err);
    release(item);
    speaking = false;
    pump();
  }
}

/**
 * Speak a line.
 *
 * By default it waits its turn behind whatever is already queued, so a run of
 * lines is heard in the order the game said them. `interrupt: true` clears
 * the queue first — for a new screen or a new step, where the previous line
 * is no longer about anything on screen.
 *
 * Options:
 *   key        the text as the RECORDING resolved it (defaults to `text`)
 *   who        'narrator' | 'nurse' | 'hero' | 'patient' — who is speaking
 *   character  a dialogue character id, when `who` is not enough
 *   patient    the patient on stage, so `{name}` and species resolve
 *   mode       override the current track
 */
export function say(text, {
  rate = 0.94, pitch = 1.12, interrupt = false,
  key = null, who = 'narrator', character = null, patient = null, mode = null,
  repeat = false,
} = {}) {
  if (!voiceOn() || !text) return;
  const display = spokenText(text);
  if (!display) return;

  const track = mode || currentVoiceMode();
  const speaker = character
    || (who === 'narrator' ? narratorFor(track) : characterFor({ mode: track, who, patient }));
  const lookup = lookupKey({
    mode: track, character: speaker, text: keyText(key ?? text, patient || {}),
  });

  if (interrupt) hardStop();
  else if (!repeat && pending.has(lookup)) return;

  pending.set(lookup, (pending.get(lookup) || 0) + 1);
  queue.push({ text: display, lookup, rate, pitch });
  pump();
}

/** Speak several lines in order, with a short breath between each. */
export function sayAll(lines, opts = {}) {
  (Array.isArray(lines) ? lines : [lines])
    .filter(Boolean)
    .forEach((line, i) => {
      const spec = typeof line === 'string' ? { text: line } : line;
      say(spec.text, {
        ...opts,
        ...spec.options,
        key: spec.key ?? opts.key ?? null,
        interrupt: i === 0 ? !!opts.interrupt : false,
      });
    });
}

/**
 * Resolves once everything queued has been spoken.
 *
 * Always resolves: it gives up after `timeout` so a browser that never fires
 * `onend` (or has speech switched off entirely) can never wedge the game on a
 * screen the child cannot leave.
 */
export function whenDone({ timeout = 12000 } = {}) {
  if (!voiceOn() || (!speaking && !queue.length)) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const done = () => { if (settled) return; settled = true; resolve(); };
    idleWaiters.push(done);
    setTimeout(done, timeout);
  });
}

function hardStop() {
  epoch++;
  queue = [];
  pending.clear();
  speaking = false;
  stopClip();
  try { synth?.cancel(); } catch { /* ignore */ }
  unduckAfterSpeech();
}

export function stop() {
  hardStop();
  flushIdle();
}
