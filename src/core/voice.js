/**
 * Optional spoken prompts.
 *
 * A four-year-old cannot read "Drag the stethoscope onto the chest", so the
 * game can read it out. This uses the browser's built-in speech synthesis —
 * no audio files, no network, no dependency — and degrades to silence
 * wherever it is unavailable.
 *
 * It is a separate toggle from the sound effects on purpose: a parent may
 * want the bleeps without the talking, or the talking without the bleeps.
 *
 * Lines are QUEUED rather than interrupted. A step routinely says several
 * things in a row — "Good spotting!", then what was actually found, then the
 * fun fact — and cancelling on every call meant a child only ever heard the
 * last one, usually the generic praise. Anything that genuinely replaces what
 * came before (a new screen, a new step) calls `say(..., { interrupt: true })`
 * or `stop()`.
 */
import { getState, setVoice } from './state.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
export const isSupported = !!synth;

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

/* ----------------------------------------------------------------- queue */

/** Lines waiting to be spoken, oldest first. */
let queue = [];
let speaking = false;
/** Resolvers waiting for the queue to drain — see `whenDone()`. */
let idleWaiters = [];

function flushIdle() {
  const waiters = idleWaiters;
  idleWaiters = [];
  waiters.forEach((resolve) => resolve());
}

function pump() {
  if (speaking) return;
  const item = queue.shift();
  if (!item) { speaking = false; flushIdle(); return; }

  speaking = true;
  try {
    const utter = new SpeechSynthesisUtterance(item.text);
    const voice = ready ? pickVoice() : null;
    if (voice) { utter.voice = voice; utter.lang = voice.lang; }
    utter.rate = item.rate;
    utter.pitch = item.pitch;
    utter.volume = 0.9;
    // `onend` does not fire if the utterance errors or is cancelled, so both
    // paths have to release the queue or the voice would stop for good.
    utter.onend = () => { speaking = false; pump(); };
    utter.onerror = () => { speaking = false; pump(); };
    synth.speak(utter);
  } catch (err) {
    console.warn('[voice] could not speak', err);
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
 */
export function say(text, { rate = 0.94, pitch = 1.12, interrupt = false } = {}) {
  if (!voiceOn() || !text) return;
  const clean = strip(text);
  if (!clean) return;
  if (interrupt) hardStop();
  queue.push({ text: clean, rate, pitch });
  pump();
}

/** Speak several lines in order, with a short breath between each. */
export function sayAll(lines, opts = {}) {
  (Array.isArray(lines) ? lines : [lines])
    .filter(Boolean)
    .forEach((line, i) => say(line, i === 0 ? opts : { ...opts, interrupt: false }));
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
  queue = [];
  speaking = false;
  try { synth?.cancel(); } catch { /* ignore */ }
}

export function stop() {
  hardStop();
  flushIdle();
}

/** Emoji and asterisked stage directions read terribly out loud. */
function strip(text) {
  return String(text)
    .replace(/\*[^*]*\*/g, ' ')
    .replace(/[\p{Extended_Pictographic}️‍]/gu, ' ')
    .replace(/\s+/g, ' ')
    // Removing a stage direction can strand its punctuation ("glug… . That"),
    // which a screen reader voice pronounces as an audible stumble.
    .replace(/\s+([.,!?;:…])/g, '$1')
    .replace(/([.!?…])[.,;:]+/g, '$1')
    // A line that was ONLY a stage direction ("*rattle*") strips to nothing,
    // leaving the joined translation to start with stray punctuation.
    .replace(/^[\s.,;:!?…]+/, '')
    .trim();
}
