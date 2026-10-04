/**
 * Emotional intent.
 *
 * Every line carries one of these, worked out from where it appears — a
 * patient with `mood: 'sad'` is spoken gently, a praise line is celebratory, a
 * question is encouraging. The generator turns that into two things:
 *
 *   · an inline performance tag (Eleven v3 reads `[gently]` as direction and
 *     does not say it) — skipped automatically on models that would read the
 *     tag out loud, see MODELS in ../../tools/lib/elevenlabs.mjs
 *   · a small nudge to the voice settings: less stability means more emotional
 *     range, more style means a bigger performance
 *
 * The nudges are deliberately small. This is a game for four-year-olds: the
 * words have to stay clear, and an over-acted line is harder to follow than a
 * flat one.
 */

export const EMOTIONS = {
  warm: { tag: 'warmly', stability: 0, style: 0, speed: 0, note: 'The default: friendly and unhurried.' },
  reassuring: { tag: 'reassuringly', stability: 0.05, style: 0, speed: -0.03, note: 'Nothing to worry about — used when a patient is frightened.' },
  gentle: { tag: 'gently', stability: 0.05, style: -0.05, speed: -0.05, note: 'Quiet and careful. Sad or sleepy moments.' },
  encouraging: { tag: 'encouraging', stability: -0.05, style: 0.05, speed: 0, note: 'Questions and prompts — "you can do this".' },
  excited: { tag: 'excited', stability: -0.1, style: 0.15, speed: 0.04, note: 'Something has just been discovered.' },
  celebratory: { tag: 'cheerfully', stability: -0.1, style: 0.2, speed: 0.03, note: 'Praise, rewards, the end of a case.' },
  playful: { tag: 'playfully', stability: -0.1, style: 0.15, speed: 0.02, note: 'Jokes, giggles, silly toys.' },
  curious: { tag: 'curious', stability: -0.05, style: 0.05, speed: 0, note: 'Wondering aloud — readouts and explainers.' },
  concerned: { tag: 'concerned', stability: 0.05, style: 0.05, speed: -0.03, note: 'Something is wrong. Never frightening.' },
  proud: { tag: 'proudly', stability: -0.05, style: 0.1, speed: 0, note: 'The patient at the end, standing tall.' },
  sleepy: { tag: 'sleepily', stability: 0.1, style: 0, speed: -0.08, note: 'Tired patients and bedtime lines.' },
  teaching: { tag: 'warmly', stability: 0.05, style: -0.05, speed: -0.04, note: 'The fun fact. Clear beats characterful.' },
};

export const EMOTION_IDS = Object.keys(EMOTIONS);

export const DEFAULT_EMOTION = 'warm';

export function emotion(name) {
  return EMOTIONS[name] || EMOTIONS[DEFAULT_EMOTION];
}

/**
 * Mood on a case step → how the line should be performed.
 * Moods come from the character art (see ui/faces.js), so this is the one
 * place that translates "what the face is doing" into "how it sounds".
 */
export const MOOD_EMOTION = {
  happy: 'warm',
  proud: 'proud',
  giggle: 'playful',
  love: 'warm',
  calm: 'reassuring',
  shy: 'gentle',
  sad: 'gentle',
  scared: 'reassuring',
  sick: 'gentle',
  sleepy: 'sleepy',
  surprised: 'excited',
  worried: 'concerned',
  hurt: 'concerned',
  cross: 'concerned',
};

export function emotionForMood(mood, fallback = DEFAULT_EMOTION) {
  return MOOD_EMOTION[mood] || fallback;
}
