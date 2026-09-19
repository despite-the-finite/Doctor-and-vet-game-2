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
 * Three things keep it from sounding like a robot reading a spreadsheet:
 *
 *   1. VOICE CHOICE. Every platform ships one or two genuinely good voices
 *      next to a pile of terrible ones, and the browser's default is usually
 *      one of the terrible ones. `pickVoice()` scores them instead.
 *   2. PHRASING. A whole paragraph handed to the synthesiser comes back flat
 *      and breathless. Lines are split into sentences, each spoken as its own
 *      utterance with a real pause after it — the pause is what a listener
 *      hears as "someone talking" rather than "text being processed".
 *   3. PROSODY. Who is speaking sets the pitch (the patient is small and
 *      squeaky, the narrator is warm and unhurried), questions lift at the
 *      end, exclamations speed up, and every sentence gets a touch of random
 *      wobble so two lines in a row never land identically.
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

/* ----------------------------------------------------------- voice choice */

/**
 * Voices worth using. The modern cloud/neural voices all announce themselves
 * in the name — "Natural", "Neural", "Online", "Google", "Premium",
 * "Enhanced" — and the rest of the list is the named Apple and Android
 * voices that are actually pleasant to listen to.
 */
const GOOD_VOICE = /\b(natural|neural|online|premium|enhanced|google|siri|samantha|karen|serena|moira|tessa|fiona|ava|allison|nicky|zoe|joana|libby|sonia|jenny|aria|emma|amber|nova)\b/i;

/**
 * Voices to stay away from. macOS ships a shelf of novelty voices that are
 * funny for ten seconds and unusable for a game, `espeak` is the Linux
 * fallback nobody chooses on purpose, and the "Desktop" Microsoft voices are
 * the old SAPI5 ones rather than the neural pair with the same first name.
 */
const BAD_VOICE = /\b(espeak|festival|pico|compact|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|bruce|fred|agnes|victoria|princess|hysterical|junior|ralph|kathy|rocko|shelley|grandma|grandpa|sandy|eddy|flo|reed|novelty)\b/i;

/** A warm, mid-to-high voice suits a children's game; it is a nudge, not a rule. */
const WARM_VOICE = /\b(female|woman|samantha|karen|serena|moira|tessa|fiona|ava|allison|nicky|zoe|libby|sonia|jenny|aria|emma|joana|amber|nova|kate|hazel|susan)\b/i;

function scoreVoice(v, lang) {
  const name = `${v.name || ''} ${v.voiceURI || ''}`;
  let score = 0;

  // Language first — a perfect English voice reading in the wrong accent is
  // still better than a French one, but an exact match wins outright.
  if (v.lang === lang) score += 50;
  else if (v.lang?.replace('_', '-').split('-')[0] === lang.split('-')[0]) score += 34;
  else if (v.lang?.startsWith('en')) score += 18;
  else score -= 40;

  if (GOOD_VOICE.test(name)) score += 55;
  if (/\b(natural|neural|online|premium|enhanced)\b/i.test(name)) score += 25;
  if (BAD_VOICE.test(name)) score -= 90;
  if (/\bdesktop\b/i.test(name)) score -= 25;
  if (WARM_VOICE.test(name)) score += 14;
  // A remote voice is nearly always the neural one; a local voice is nearly
  // always the fallback. Worth a nudge, never worth losing an exact language.
  if (!v.localService) score += 8;
  if (v.default) score += 4;

  return score;
}

let cachedVoice = null;
let cachedFor = null;

/** Voices load asynchronously in most browsers. */
function pickVoice() {
  if (!synth) return null;
  const voices = synth.getVoices();
  if (!voices.length) return null;
  const lang = (navigator.language || 'en-GB').replace('_', '-');
  if (cachedVoice && cachedFor === voices.length) return cachedVoice;

  const best = voices
    .map((v) => ({ v, score: scoreVoice(v, lang) }))
    .sort((a, b) => b.score - a.score)[0];

  cachedVoice = best?.v || voices[0];
  cachedFor = voices.length;
  return cachedVoice;
}

if (synth) {
  const warm = () => { ready = true; cachedVoice = null; cachedFor = null; pickVoice(); };
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
  else say('Hello! I can read everything out for you.', { interrupt: true });
  return next;
}

/* ------------------------------------------------------------- prosody */

/**
 * Who is talking. A child works out who is speaking from the voice long
 * before they work it out from the bubble, so the four speakers stay
 * recognisably different — and none of them is the browser default of
 * "rate 1, pitch 1", which is the setting that sounds most like a machine.
 */
const ROLES = {
  narrator: { rate: 0.93, pitch: 1.02 },  // the game talking to the player
  nurse:    { rate: 0.95, pitch: 1.08 },
  hero:     { rate: 0.97, pitch: 1.14 },  // the child's own hero
  patient:  { rate: 0.99, pitch: 1.26 },  // small, and usually excited
  ui:       { rate: 0.95, pitch: 1.10 },  // buttons, toasts, celebrations
};

/** How long to hold the silence after a sentence, by how it ended. */
const PAUSE = { '.': 300, '!': 330, '?': 340, '…': 420, ',': 150, ';': 220, ':': 240, '': 190 };

const jitter = (n) => n + (Math.random() - 0.5) * n * 0.05;

/* ----------------------------------------------------------------- queue */

/** Lines waiting to be spoken, oldest first. */
let queue = [];
let speaking = false;
/** Resolvers waiting for the queue to drain — see `whenDone()`. */
let idleWaiters = [];
/** Chrome stops speaking after ~15s unless it is nudged. */
let keepAlive = null;

function startKeepAlive() {
  if (keepAlive || !synth) return;
  keepAlive = setInterval(() => {
    if (!synth.speaking) return;
    // `resume()` on a synthesiser that is not paused is a no-op everywhere
    // except Chrome, where it resets the watchdog that would otherwise cut
    // a long run of lines off mid-sentence.
    try { synth.resume(); } catch { /* ignore */ }
  }, 7000);
}

function stopKeepAlive() {
  if (!keepAlive) return;
  clearInterval(keepAlive);
  keepAlive = null;
}

function flushIdle() {
  const waiters = idleWaiters;
  idleWaiters = [];
  waiters.forEach((resolve) => resolve());
}

function pump() {
  if (speaking) return;
  const item = queue.shift();
  if (!item) { speaking = false; stopKeepAlive(); flushIdle(); return; }

  speaking = true;
  startKeepAlive();
  try {
    const utter = new SpeechSynthesisUtterance(item.text);
    const voice = ready ? pickVoice() : null;
    if (voice) { utter.voice = voice; utter.lang = voice.lang; }
    utter.rate = item.rate;
    utter.pitch = item.pitch;
    utter.volume = 0.9;
    // The pause AFTER a sentence is what stops a paragraph sounding like one
    // long exhale, so the queue waits before it starts the next line.
    const next = () => {
      speaking = false;
      if (item.gap) setTimeout(pump, item.gap);
      else pump();
    };
    // `onend` does not fire if the utterance errors or is cancelled, so both
    // paths have to release the queue or the voice would stop for good.
    utter.onend = next;
    utter.onerror = next;
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
 *
 * `role` picks the speaker's pitch and pace; `rate`/`pitch` still override it
 * for the rare line that wants something of its own.
 */
export function say(text, { role = 'narrator', rate = null, pitch = null, interrupt = false } = {}) {
  if (!voiceOn() || !text) return;
  const clean = strip(text);
  if (!clean) return;
  if (interrupt) hardStop();

  const base = ROLES[role] || ROLES.narrator;
  const pieces = sentences(clean);

  pieces.forEach((piece, i) => {
    const ends = piece.slice(-1);
    // A question lifts and slows; an exclamation is quicker and brighter.
    const lift = ends === '?' ? 0.07 : ends === '!' ? 0.05 : 0;
    const hurry = ends === '?' ? -0.02 : ends === '!' ? 0.04 : 0;
    queue.push({
      text: piece,
      rate: clamp(jitter((rate ?? base.rate) + hurry), 0.5, 1.6),
      pitch: clamp(jitter((pitch ?? base.pitch) + lift), 0.6, 1.9),
      gap: i === pieces.length - 1 ? Math.round(PAUSE[ends] ?? PAUSE['']) * 0.8 : (PAUSE[ends] ?? PAUSE['']),
    });
  });

  // Chrome occasionally swallows an utterance queued in the same tick as a
  // `cancel()`, so an interrupting line gets a beat before it starts.
  if (interrupt) setTimeout(pump, 60);
  else pump();
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
  stopKeepAlive();
  try { synth?.cancel(); } catch { /* ignore */ }
}

export function stop() {
  hardStop();
  flushIdle();
}

/* -------------------------------------------------------------- the text */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/**
 * Abbreviations a synthesiser gets wrong.
 *
 * "Dr." is the one that mattered: every celebration screen ends on
 * "GREAT JOB, DR. INDRA!" and the synthesiser read it as "Drive Indra",
 * because `Dr.` is also the abbreviation for Drive in a street address.
 * Spelling the word out is the only reliable fix — there is no markup for
 * "this abbreviation, not that one".
 */
function expand(text) {
  return text
    .replace(/\bDrs\.?(?=\s|$)/gi, 'Doctors')
    .replace(/\bDr\.?(?=\s|$)/gi, 'Doctor')
    .replace(/\bMrs\.?(?=\s|$)/gi, 'Missus')
    .replace(/\bMr\.?(?=\s|$)/gi, 'Mister')
    .replace(/\bMs\.?(?=\s|$)/gi, 'Miz')
    .replace(/\bSt\.?(?=\s[A-Z])/g, 'Saint')
    .replace(/\bvs\.?(?=\s|$)/gi, 'versus')
    .replace(/\betc\.?(?=\s|$)/gi, 'et cetera')
    .replace(/\s&\s/g, ' and ')
    .replace(/(\d)\s*-\s*(\d)/g, '$1 to $2')   // "3-4 days" reads as a range
    .replace(/\bx-ray/gi, 'X-ray');
}

/**
 * ALL-CAPS headings.
 *
 * The screen shouts on purpose — "PERFECT CHECKUP!", "NEW TOOL!", "WOOF!" —
 * but a synthesiser handed a capitalised word may spell it out one letter at
 * a time. Anything three letters or longer is turned back into a word; pairs
 * (OK, TV, and "Dr", which `expand` deals with next) are left alone.
 */
function unshout(text) {
  return text.replace(/\b[A-Z][A-Z']{2,}\b/g, (word) =>
    word.charAt(0) + word.slice(1).toLowerCase());
}

/** Emoji and asterisked stage directions read terribly out loud. */
function strip(text) {
  return expand(unshout(String(text)))
    .replace(/\*[^*]*\*/g, ' ')
    .replace(/[\p{Extended_Pictographic}️‍]/gu, ' ')
    .replace(/\s+/g, ' ')
    // Removing a stage direction can strand its punctuation ("glug… . That"),
    // which a screen reader voice pronounces as an audible stumble.
    .replace(/\s+([.,!?;:…])/g, '$1')
    .replace(/([.!?…])[.,;:]+/g, '$1')
    // "!!!" and "?!" are shouted typography, not three separate sentences.
    .replace(/([!?])[!?]+/g, '$1')
    // A line that was ONLY a stage direction ("*rattle*") strips to nothing,
    // leaving the joined translation to start with stray punctuation.
    .replace(/^[\s.,;:!?…]+/, '')
    .trim();
}

/**
 * Break a line into the pieces it should be spoken in.
 *
 * One sentence per utterance is what buys the pause between them. A sentence
 * long enough to run out of breath is split again at a comma, because a
 * synthesiser given eighty words in one go flattens out completely near the
 * end.
 */
const LONG = 140;

function sentences(text) {
  const out = [];
  // Keep the terminator: it is what sets the pause length and the intonation.
  const parts = text.match(/[^.!?…]+[.!?…]*/g) || [text];
  parts.map((s) => s.trim()).filter(Boolean).forEach((s) => {
    if (s.length <= LONG) { out.push(s); return; }
    let buffer = '';
    (s.match(/[^,;:]+[,;:]*/g) || [s]).forEach((clause) => {
      const piece = clause.trim();
      if (!piece) return;
      if ((buffer + ' ' + piece).trim().length > LONG && buffer) { out.push(buffer.trim()); buffer = piece; }
      else buffer = `${buffer} ${piece}`.trim();
    });
    if (buffer.trim()) out.push(buffer.trim());
  });
  return out.length ? out : [text];
}
