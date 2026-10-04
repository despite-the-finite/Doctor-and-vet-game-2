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
import { loadVoiceIndex, clipFor, playClip, stopClip, preloadClips } from './voicePlayback.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
const canPlayFiles = typeof Audio !== 'undefined';

/** There is a voice as long as EITHER route works. */
export const isSupported = canPlayFiles || !!synth;

let ready = false;

/* ------------------------------------------------- choosing a browser voice */

/*
 * Until `npm run generate-voices` has been run, EVERY line goes through the
 * fallback below — so the fallback is not a rarely-seen edge case, it is what
 * the game sounds like out of the box, and it is worth picking a good voice
 * for.
 *
 * "Pick the first local voice in the page language" is what made it sound like
 * a machine: on Chrome the good neural voices are remote, so `localService`
 * ruled every one of them out, and on macOS the list starts with novelty
 * voices. Scoring finds the right one on all three platforms.
 */

/**
 * Voices worth using. The modern cloud/neural voices all announce themselves
 * in the name — "Natural", "Neural", "Online", "Google", "Premium",
 * "Enhanced" — and the rest are the named Apple and Android voices that are
 * actually pleasant to listen to.
 */
const GOOD_VOICE = /\b(natural|neural|online|premium|enhanced|google|siri)\b/i;

/**
 * Voices to stay away from. macOS ships a shelf of novelty voices that are
 * funny for ten seconds and unusable for a game, `espeak` is the Linux
 * fallback nobody chooses on purpose, and the "Desktop" Microsoft voices are
 * the old SAPI5 ones rather than the neural pair with the same first name.
 */
const BAD_VOICE = /\b(espeak|festival|pico|compact|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|hysterical|junior|novelty|grandma|grandpa|bahh)\b/i;

/**
 * Who a voice sounds like.
 *
 * There is no gender field on a SpeechSynthesisVoice, so the name is all
 * there is. This is only ever a PREFERENCE — the game still speaks if every
 * voice on the device is the same person — but without it the ward can end up
 * sounding like one man doing all nineteen parts, which is what happened.
 */
const FEMALE_VOICE = /\b(female|woman|samantha|karen|serena|moira|tessa|fiona|ava|allison|nicky|zoe|joana|libby|sonia|jenny|aria|emma|amber|nova|kate|hazel|susan|zira|catherine|linda|heera|eva|mia|martha|victoria|princess|agnes|kathy|shelley|sandy|flo|fiona|lisa|clara|amelie|anna|marie|alice|laura|lily|matilda|jessica|michelle|natasha|olivia|isha|swara)\b/i;

const MALE_VOICE = /\b(male|man|david|mark|george|daniel|alex|fred|thomas|oliver|rishi|aaron|arthur|gordon|reed|rocko|eddy|ralph|bruce|guy|ryan|william|james|john|paul|peter|liam|noah|brian|eric|chris|roger|callum|christopher|richard|tom|sean|gareth|rishi|prabhat|hemant|ravi)\b/i;

function scoreVoice(v, lang) {
  const name = `${v.name || ''} ${v.voiceURI || ''}`;
  let score = 0;

  // Language first — an exact match wins outright, but a good English voice
  // in the wrong accent still beats a perfect one in the wrong language.
  if (v.lang === lang) score += 50;
  else if (v.lang?.replace('_', '-').split('-')[0] === lang.split('-')[0]) score += 34;
  else if (v.lang?.startsWith('en')) score += 18;
  else score -= 200;                       // never read English in a French voice

  if (GOOD_VOICE.test(name)) score += 45;
  if (/\b(natural|neural|online|premium|enhanced)\b/i.test(name)) score += 25;
  if (BAD_VOICE.test(name)) score -= 120;
  if (/\bdesktop\b/i.test(name)) score -= 25;
  // A remote voice is nearly always the neural one; a local voice is nearly
  // always the fallback. Worth a nudge, never worth losing an exact language.
  if (!v.localService) score += 8;
  if (v.default) score += 4;

  return score;
}

/** Everything usable on this device, best first. */
function rankedVoices() {
  if (!synth) return [];
  const voices = synth.getVoices();
  if (!voices.length) return [];
  const lang = (navigator.language || 'en-GB').replace('_', '-');
  return voices
    .map((v) => ({ v, score: scoreVoice(v, lang) }))
    .filter((x) => x.score > -100)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.v);
}

const sounds = (v, re) => re.test(`${v.name || ''} ${v.voiceURI || ''}`);

/**
 * Cast the speakers.
 *
 * The game used to run every character through ONE voice and tell them apart
 * by pitch. That failed twice over: on a device whose best voice is male,
 * every child in the hospital is a man; and shifting a synthesiser's pitch
 * away from its natural range is the single fastest way to make it sound like
 * a machine. Giving each speaker a genuinely different voice sounds better
 * AND costs nothing — the voices are already installed.
 *
 * Preferences, in order, per speaker. Anything already cast is skipped, so
 * the parts stay distinct as long as the device has the voices for it; a
 * device with only one usable voice falls back to it for everybody, and then
 * (and only then) pitch does the work.
 */
function castVoices() {
  const ranked = rankedVoices();
  if (!ranked.length) return {};

  const taken = new Set();
  const take = (...tests) => {
    for (const test of tests) {
      const found = ranked.find((v) => !taken.has(v) && test(v));
      if (found) { taken.add(found); return found; }
    }
    return null;
  };

  const female = (v) => sounds(v, FEMALE_VOICE);
  const male = (v) => sounds(v, MALE_VOICE);
  const any = () => true;

  // The narrator carries most of the game, so it gets first pick of the best
  // warm voice. The child patients and the hero should not be the narrator.
  const narrator = take(female, (v) => !male(v), any);
  const patient = take(female, (v) => !male(v), any);
  const hero = take(female, (v) => !male(v), any);
  // A grown-up in the chair by the bed is the one part a lower voice suits.
  const grownup = take(male, any);
  const nurse = take(female, any);

  const fallback = narrator || ranked[0];
  return {
    narrator: narrator || fallback,
    patient: patient || fallback,
    hero: hero || fallback,
    grownup: grownup || fallback,
    parent: grownup || fallback,
    owner: grownup || fallback,
    nurse: nurse || fallback,
  };
}

let cast = null;
let castFor = null;

/** The voice for one speaker. Voices load asynchronously in most browsers. */
function pickVoice(who = 'narrator') {
  if (!synth) return null;
  const voices = synth.getVoices();
  if (!voices.length) return null;
  if (!cast || castFor !== voices.length) {
    cast = castVoices();
    castFor = voices.length;
  }
  return cast[who] || cast.narrator || voices[0];
}

if (synth) {
  const warm = () => { ready = true; cast = null; castFor = null; pickVoice(); };
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
  else say('Hello! I can read everything out for you.', { interrupt: true });
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

/* ------------------------------------------------------------- prosody */

/*
 * Only the browser-voice fallback uses any of this — a recorded clip already
 * carries its own performance (see dialogue/emotions.js). It matters because
 * until the clips are generated, the fallback is the whole voice-over.
 */

/**
 * Who is talking. A child works out who is speaking from the voice long
 * before they work it out from the bubble, so the speakers stay recognisably
 * different — and none of them is the browser default of "rate 1, pitch 1",
 * which is the setting that sounds most like a machine. The keys are the
 * same `who` values a case step uses.
 */
const ROLES = {
  narrator: { rate: 0.96, pitch: 1.00 },  // the game talking to the player
  nurse:    { rate: 0.98, pitch: 1.04 },
  grownup:  { rate: 0.96, pitch: 0.98 },
  parent:   { rate: 0.96, pitch: 0.98 },
  owner:    { rate: 0.96, pitch: 0.98 },
  hero:     { rate: 1.00, pitch: 1.06 },  // the child's own hero
  patient:  { rate: 1.00, pitch: 1.10 },  // small, and usually excited
};

/*
 * Pitch stays NEAR 1. Each speaker already has a different voice (see
 * castVoices), so pitch only has to nudge them apart — and a synthesiser
 * pushed far from its natural pitch is resampled rather than re-performed,
 * which is what "robotic" actually sounds like. The first version of this
 * file ran the patient at 1.26 and it was audibly worse than the flat voice
 * it replaced.
 *
 * There is deliberately no random wobble between lines either. Real speech
 * varies WITHIN a sentence, which a synthesiser already does; varying the
 * rate and pitch randomly BETWEEN sentences just sounds unsteady.
 */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/**
 * A line is spoken as ONE utterance wherever it can be.
 *
 * Splitting every sentence into its own utterance and inserting a pause
 * between them seemed like it would sound more natural and did the opposite:
 * the engine plans intonation across a whole utterance, so cutting a line into
 * pieces throws that away and restarts flat on each piece, with an
 * unnaturally even gap in between. Only a line long enough to genuinely run
 * out of breath is split, and then at a sentence end with a short gap.
 */
const LONG = 220;
const GAP = 140;

function sentences(text) {
  if (text.length <= LONG) return [text];
  const out = [];
  let buffer = '';
  (text.match(/[^.!?…]+[.!?…]*/g) || [text]).forEach((part) => {
    const piece = part.trim();
    if (!piece) return;
    if ((`${buffer} ${piece}`).trim().length > LONG && buffer) { out.push(buffer.trim()); buffer = piece; }
    else buffer = `${buffer} ${piece}`.trim();
  });
  if (buffer.trim()) out.push(buffer.trim());
  return out.length ? out : [text];
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
  // Warm the lines already waiting behind this one. Fetching a clip only when
  // its turn arrives puts a download in the gap between every two sentences,
  // which is exactly where a pause is most audible.
  if (queue.length) preloadClips(queue.map((q) => q.lookup));

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

/**
 * The fallback: the browser's own voice.
 *
 * The queue still holds ONE item per line — that is what a recording is made
 * of and what a clip is looked up by — but the synthesiser is handed one
 * SENTENCE at a time, with a real pause between them, because a paragraph
 * given to it in a single go comes back flat and breathless. The line is only
 * released back to the queue once its last sentence has finished.
 */
function speakWithSynth(item, era = epoch) {
  if (!synth) { release(item); speaking = false; pump(); return; }

  const pieces = sentences(item.text);
  const base = ROLES[item.who] || ROLES.narrator;

  const done = () => {
    if (era !== epoch) return;
    release(item);
    speaking = false;
    stopKeepAlive();
    pump();
  };

  const speakPiece = (i) => {
    if (era !== epoch) return;
    const piece = pieces[i];
    if (piece === undefined) { done(); return; }


    try {
      const utter = new SpeechSynthesisUtterance(piece);
      // Each speaker has its OWN voice, so `who` selects the voice as well as
      // the pitch — this is what stops the whole ward sounding like one person.
      const voice = ready ? pickVoice(item.who) : null;
      if (voice) { utter.voice = voice; utter.lang = voice.lang; }
      utter.rate = clamp(item.rate ?? base.rate, 0.6, 1.4);
      utter.pitch = clamp(item.pitch ?? base.pitch, 0.8, 1.4);
      utter.volume = 0.9;
      // `onend` does not fire if the utterance errors or is cancelled, so both
      // paths have to move the line on or the voice would stop for good.
      const after = () => {
        if (era !== epoch) return;
        if (i === pieces.length - 1) { done(); return; }
        setTimeout(() => speakPiece(i + 1), GAP);
      };
      utter.onend = after;
      utter.onerror = after;
      startKeepAlive();
      synth.speak(utter);
    } catch (err) {
      console.warn('[voice] could not speak', err);
      done();
    }
  };

  speakPiece(0);
}

/**
 * Chrome stops speaking after about fifteen seconds unless it is nudged, and
 * a celebration screen can easily run past that. `resume()` on a synthesiser
 * that is not paused does nothing anywhere else.
 */
let keepAlive = null;

function startKeepAlive() {
  if (keepAlive || !synth) return;
  keepAlive = setInterval(() => {
    if (!synth.speaking) return;
    try { synth.resume(); } catch { /* ignore */ }
  }, 7000);
}

function stopKeepAlive() {
  if (!keepAlive) return;
  clearInterval(keepAlive);
  keepAlive = null;
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
  rate = null, pitch = null, interrupt = false,
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
  // `who` rides along so the browser-voice fallback knows whose pitch to use;
  // a recorded clip ignores it, because the recording already is that voice.
  queue.push({ text: display, lookup, rate, pitch, who });
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
  stopKeepAlive();
  stopClip();
  try { synth?.cancel(); } catch { /* ignore */ }
  unduckAfterSpeech();
}

export function stop() {
  hardStop();
  flushIdle();
}
