/**
 * ══════════════════════════════════════════════════════════════════════════
 *  THE VOICE REGISTRY — this is the file you edit to choose how the game
 *  sounds. Paste ElevenLabs voice ids into `voiceId` below.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * How to fill it in:
 *
 *   1. npm run voices:list          lists every voice on your ElevenLabs
 *                                   account with its id, ready to paste
 *   2. paste an id into `voiceId`   for each character below
 *   3. delete `placeholder: true`   from the ones you have chosen yourself
 *   4. npm run generate-voices      only the changed characters regenerate
 *
 * Every character ships with a WORKING placeholder id from ElevenLabs'
 * premade library, so `npm run generate-voices` runs end to end before you
 * have chosen anything, and no two characters in the same track share one.
 * They are still stand-ins — a cast you picked yourself will always beat a
 * cast picked from a public list. `npm run voices:check` shows what is still
 * on a placeholder, and verifies every id against your account.
 *
 * This file is READ BY THE GENERATOR ONLY. It never reaches the browser and
 * it contains no secrets — voice ids are public identifiers, the API key
 * lives in .env and is never committed. See docs/VOICES.md.
 */
import { CHARACTERS, CHARACTER_IDS } from './characters.js';

/* ---------------------------------------------------------------- stock ids
   ElevenLabs' premade voices — public ids that exist on every account, so
   `npm run generate-voices` works before anyone has made a voice of their own.

   There used to be four of these, shared between all nineteen parts, and the
   sharing was not spread out: in the Doctor ward the NARRATOR and the CHILD
   PATIENT were the same voice, and so were the nurse and the hero — the two
   pairs most likely to speak to each other. A child cannot follow a scene
   where the person asking the question and the person answering it are the
   same person. Every character now has a voice nothing else in its track
   uses.

   These are still stand-ins. `npm run voices:list` shows your own voices and
   docs/VOICES.md explains swapping them in; `npm run generate-voices --check`
   verifies every id against your account before anything is spent. */
const STOCK = {
  // female
  sarah: 'EXAVITQu4vr4xnSDxMaL',    // soft, gentle
  charlotte: 'XB0fDUnXU5powFXDhCwa',// conversational, bright
  laura: 'FGY2WhTYpPnrIDTdsKH5',    // upbeat, young
  lily: 'pFZP5JQG7iQjIQuC4Bku',     // British, warm
  alice: 'Xb7hH8MSUJpSbSDYk0k2',    // British, confident
  matilda: 'XrExE9yKIg1WjnnlVkGX',  // warm, friendly
  jessica: 'cgSgspJ2msm6clMCkdW9',  // expressive, young
  // male
  george: 'JBFqnCBsd6RMkjVDRZzb',   // British, narrative, storybook
  daniel: 'onwK4e9ZLuTAKqWW03F9',   // British, grounded, grown-up
  brian: 'nPczCjzI2devNBz1zQrb',    // deep, narrator
  will: 'bIHbv24MWmeRgasZH58o',     // friendly
  eric: 'cjVigY5qzO86Huf0OWal',     // friendly, grown-up
  chris: 'iP95p4xoKVk53GoZ742B',    // casual
  liam: 'TX3LPaxmHKxFdv7VOQHJ',     // young
  roger: 'CwhRBWXzGAHq8TQ4Fs17',    // steady
  callum: 'N2lVS1w4EtoT3dr4eOWO',   // quiet, intense
  // non-binary
  river: 'SAz9YHcvj6GT2YYXdXww',    // clear, even
};

/**
 * The house sound of each track — applied to every character in it before
 * that character's own settings and the line's emotion are layered on top.
 *
 * Doctor  · warm, calm, unhurried. A ward where nothing is scary.
 * Vet     · cheerful and energetic. A busy clinic full of animals.
 * Toy     · whimsical and soft. A workshop where things get mended.
 */
export const MODE_TONE = {
  doctor: { stability: 0.58, similarityBoost: 0.8, style: 0.18, speed: 0.95, useSpeakerBoost: true },
  vet: { stability: 0.46, similarityBoost: 0.8, style: 0.38, speed: 1.02, useSpeakerBoost: true },
  toy: { stability: 0.44, similarityBoost: 0.8, style: 0.42, speed: 0.98, useSpeakerBoost: true },
};

/**
 * character id → the voice that plays it.
 *
 *   voiceId      the ElevenLabs voice. THIS is the bit you paste.
 *   voiceName    a human label, only ever used in logs and reports
 *   placeholder  true while this is still a stock stand-in
 *   settings     overrides on top of MODE_TONE for this character
 *   direction    what you are listening for when auditioning a voice —
 *                paste it into ElevenLabs' voice search
 */
export const VOICES = {
  /* ------------------------------------------------------------- doctor */
  doctorNarrator: {
    voiceId: STOCK.lily, voiceName: 'Lily', placeholder: true,
    settings: { stability: 0.62, style: 0.14, speed: 0.94 },
    direction: 'Warm female narrator, mid-30s, gentle and reassuring. A paediatric nurse reading a picture book.',
  },
  doctorNurse: {
    voiceId: STOCK.matilda, voiceName: 'Matilda', placeholder: true,
    settings: { stability: 0.54, style: 0.22, speed: 0.98 },
    direction: 'Friendly, practical, a little brisk. Someone who is very good with children and has done this a thousand times.',
  },
  doctorHero: {
    voiceId: STOCK.laura, voiceName: 'Laura', placeholder: true,
    settings: { stability: 0.45, style: 0.3, speed: 1.0 },
    direction: 'Bright young voice — the child playing the doctor. Curious and kind.',
  },
  doctorPatientChild: {
    voiceId: STOCK.jessica, voiceName: 'Jessica', placeholder: true,
    settings: { stability: 0.4, style: 0.36, speed: 1.0 },
    direction: 'A child of six or seven. Chatty, wriggly, sometimes nervous. NOT a squeaky cartoon child.',
  },
  doctorParent: {
    voiceId: STOCK.brian, voiceName: 'Brian', placeholder: true,
    settings: { stability: 0.6, style: 0.16, speed: 0.96 },
    direction: 'A calm grown-up. Slightly tired, very fond. The parent in the chair by the bed.',
  },

  /* ---------------------------------------------------------------- vet */
  vetNarrator: {
    voiceId: STOCK.alice, voiceName: 'Alice', placeholder: true,
    settings: { stability: 0.46, style: 0.4, speed: 1.03 },
    direction: 'Cheerful, energetic female narrator. Loves animals, delighted by all of them.',
  },
  vetNurse: {
    voiceId: STOCK.sarah, voiceName: 'Sarah', placeholder: true,
    settings: { stability: 0.5, style: 0.32, speed: 1.0 },
    direction: 'Compassionate and capable. Talks about animals the way people talk about their own pets.',
  },
  vetHero: {
    voiceId: STOCK.charlotte, voiceName: 'Charlotte', placeholder: true,
    settings: { stability: 0.42, style: 0.42, speed: 1.04 },
    direction: 'The child playing the vet — thrilled to meet every single animal.',
  },
  vetOwner: {
    voiceId: STOCK.eric, voiceName: 'Eric', placeholder: true,
    settings: { stability: 0.55, style: 0.28, speed: 0.99 },
    direction: 'The person who brought their pet in. Anxious at the start, over the moon at the end.',
  },
  vetPatientPet: {
    voiceId: STOCK.will, voiceName: 'Will', placeholder: true,
    settings: { stability: 0.4, style: 0.46, speed: 1.0 },
    direction: 'The voice a dog would have if dogs talked: warm, eager, a bit daft. Characterful, not a cartoon.',
  },
  vetPatientWild: {
    voiceId: STOCK.callum, voiceName: 'Callum', placeholder: true,
    settings: { stability: 0.55, style: 0.26, speed: 0.94 },
    direction: 'A wild animal — wary, quiet, watching you. Softer and slower than the pets.',
  },

  /* --------------------------------------------------------- toy doctor */
  toyNarrator: {
    voiceId: STOCK.george, voiceName: 'George', placeholder: true,
    settings: { stability: 0.5, style: 0.36, speed: 0.96 },
    direction: 'Storybook narrator. Whimsical and unhurried, like a bedtime story about a workshop.',
  },
  toyNurse: {
    voiceId: STOCK.daniel, voiceName: 'Daniel', placeholder: true,
    settings: { stability: 0.56, style: 0.26, speed: 0.95 },
    direction: 'The keeper of the toy workshop. Fond of every toy that comes through the door.',
  },
  toyHero: {
    voiceId: STOCK.liam, voiceName: 'Liam', placeholder: true,
    settings: { stability: 0.44, style: 0.38, speed: 1.0 },
    direction: 'The child mending the toys. Careful, proud of the work.',
  },
  toyPlush: {
    voiceId: STOCK.matilda, voiceName: 'Matilda', placeholder: true,
    settings: { stability: 0.46, style: 0.4, speed: 0.92 },
    direction: 'A very old teddy bear. Small, soft, sleepy, enormously loved. Gentle — never babyish.',
  },
  toyFigure: {
    voiceId: STOCK.roger, voiceName: 'Roger', placeholder: true,
    settings: { stability: 0.4, style: 0.52, speed: 1.0 },
    direction: 'An action figure being heroic. Theatrical but played straight — brave, not shouty.',
  },
  toyRobot: {
    voiceId: STOCK.river, voiceName: 'River', placeholder: true,
    settings: { stability: 0.62, style: 0.34, speed: 1.02 },
    direction: 'A friendly toy robot. Precise and bright with a hint of clockwork. Do NOT use a vocoder-style voice.',
  },
  toyDoll: {
    voiceId: STOCK.charlotte, voiceName: 'Charlotte', placeholder: true,
    settings: { stability: 0.42, style: 0.46, speed: 1.0 },
    direction: 'A doll or ballerina. Light, expressive, a little bit grand.',
  },
  toyVehicle: {
    voiceId: STOCK.chris, voiceName: 'Chris', placeholder: true,
    settings: { stability: 0.38, style: 0.5, speed: 1.06 },
    direction: 'A little racing car. Zippy and eager, always halfway to somewhere.',
  },
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** The voice entry for a character, or null when the id is unknown. */
export function voiceFor(characterId) {
  return VOICES[characterId] || null;
}

/** Characters that have no usable voice id — the generator skips these. */
export function missingVoices() {
  return CHARACTER_IDS.filter((id) => !VOICES[id]?.voiceId);
}

/** Characters still on a premade stand-in rather than a chosen voice. */
export function placeholderVoices() {
  return CHARACTER_IDS.filter((id) => VOICES[id]?.placeholder);
}

/**
 * MODE_TONE + the character's own settings + the line's emotional nudge,
 * clamped to the ranges the API accepts.
 *
 * Returned in the REST API's snake_case shape, ready to send.
 */
export function voiceSettingsFor(characterId, emotionDelta = {}) {
  const character = CHARACTERS[characterId];
  const tone = MODE_TONE[character?.mode] || MODE_TONE.doctor;
  const own = VOICES[characterId]?.settings || {};
  const base = { ...tone, ...own };
  return {
    stability: clamp((base.stability ?? 0.5) + (emotionDelta.stability || 0), 0, 1),
    similarity_boost: clamp(base.similarityBoost ?? 0.8, 0, 1),
    style: clamp((base.style ?? 0) + (emotionDelta.style || 0), 0, 1),
    use_speaker_boost: base.useSpeakerBoost !== false,
    speed: clamp((base.speed ?? 1) + (emotionDelta.speed || 0), 0.7, 1.2),
  };
}
