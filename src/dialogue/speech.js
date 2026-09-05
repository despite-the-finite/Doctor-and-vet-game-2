/**
 * What a line of dialogue actually *sounds* like.
 *
 * Case text is written to be read on screen: it carries emoji, stage
 * directions in asterisks (`*a small sad squeak*`) and `{name}` tokens. None
 * of that can be spoken, so every route into the voice system — the
 * pre-generation script and the game itself — passes text through the same
 * three functions here. That is the whole trick behind the system: as long as
 * both sides normalise identically, the game can find the audio file for a
 * line without ever knowing that the file exists.
 *
 *   raw case text
 *     → keyText()    tokens resolved the way the recording resolved them
 *     → spokenText() emoji and stage directions removed
 *     → lookupKey()  lowercased, punctuation-free, hashed with mode+character
 *
 * The composition helpers at the bottom exist for the same reason. The engine
 * says several *composed* sentences ("Yes — a bandage.", "Bramble's paw:
 * mended."), and the generator has to produce byte-identical strings, so the
 * composition happens in one place that both import.
 */
import { hash } from './hash.js';

/**
 * What `{hero}` becomes in recorded audio.
 *
 * The player names their own hero, so no pre-generated line can say it. Every
 * recording says "Doctor" instead, which is what the game calls the player
 * everywhere else ("Dr. Maya", "Great choice, Doctor!"). The written line on
 * screen still uses the real name — only the audio generalises.
 */
export const HERO_SPOKEN_NAME = 'Doctor';

/**
 * Resolve the tokens exactly the way the recording resolved them.
 *
 * `{name}`, `{species}` and `{where}` come from the case's own patient, so
 * they are known ahead of time and are baked into the audio. `{hero}` cannot
 * be, so it always becomes HERO_SPOKEN_NAME on both sides.
 */
export function keyText(text, patient = {}) {
  if (!text) return '';
  return String(text)
    .replaceAll('{name}', patient.name || 'your patient')
    .replaceAll('{hero}', HERO_SPOKEN_NAME)
    .replaceAll('{species}', patient.speciesLabel || patient.kind || 'animal')
    .replaceAll('{where}', patient.where || '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Emoji and asterisked stage directions read terribly out loud.
 *
 * (This is the strip() that used to live in core/voice.js, moved here so the
 * generator strips a line exactly the way the browser used to.)
 */
export function spokenText(text) {
  return String(text ?? '')
    .replace(/\*[^*]*\*/g, ' ')
    .replace(/[\p{Extended_Pictographic}️‍]/gu, ' ')
    .replace(/\s+/g, ' ')
    // Removing a stage direction can strand its punctuation ("glug… . That"),
    // which reads as an audible stumble.
    .replace(/\s+([.,!?;:…])/g, '$1')
    .replace(/([.!?…])[.,;:]+/g, '$1')
    // A line that was ONLY a stage direction ("*rattle*") strips to nothing,
    // leaving the joined translation to start with stray punctuation.
    .replace(/^[\s.,;:!?…]+/, '')
    .trim();
}

/**
 * The comparison form: case, punctuation and quote style removed.
 *
 * Two lines that differ only in a curly apostrophe or a trailing full stop are
 * the same performance, so they share one audio file — which also quietly
 * halves the bill on a game with 50 hand-written cases.
 */
export function normalise(text) {
  return spokenText(text)
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The manifest key for one spoken line.
 *
 * Scoped by mode and character on purpose: the same words said by the Vet
 * nurse and by a teddy bear are two different recordings, and the same line in
 * the Doctor and the Toy Workshop belongs to two different narrators.
 */
export function lookupKey({ mode, character, text }) {
  return hash(`${mode || 'doctor'}|${character || 'narrator'}|${normalise(text)}`);
}

/* ------------------------------------------------------------ composition */

/**
 * An animal or a toy says something wordless, then it is translated.
 * Spoken as one breath so the pause lands between the two, not inside them.
 */
export function withTranslation(text, translation) {
  if (!translation) return text || '';
  if (!text) return translation;
  return `${String(text).replace(/[\s.]+$/, '')}. ${translation}`;
}

/** `show` steps are read title-then-body. */
export function showLine(title, text) {
  return [title, text].filter(Boolean).join('. ');
}

/** The narrator confirming a correct `choose` answer. */
export function affirmChoice(label) {
  return `Yes — ${label}.`;
}

/** The narrator confirming a correct `scan` finding. */
export function affirmFinding(label) {
  return `You found it — ${label}.`;
}

/** The narrator naming something a child just tapped in a `find` step. */
export function foundLine(found, label) {
  return `${found || 'Found it!'} ${label}`;
}

/** One row of a triage queue, read out before the child picks. */
export function triageLine(label, note) {
  return `${label} — ${note}`;
}

/** What a tool's readout card says, as a sentence a child can hear. */
export function readoutLine(spec, toolName) {
  const label = spec.label || toolName;
  const value = spec.kind === 'number' || spec.kind === 'heartbeat'
    ? `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`
    : (spec.value || '');
  const head = `${label}: ${value}`.replace(/[\s.]+$/, '');
  return [head, spec.text || null].filter(Boolean).join('. ');
}

/** The idle nudge a tool step shows when nothing has been dragged yet. */
export function tryToolLine(toolName) {
  return `Try the ${toolName.toLowerCase()}!`;
}

/** The friendly "not that one" when the wrong tool is dropped. */
export function wrongToolLine(toolName) {
  return `The ${toolName.toLowerCase()} is great — but not for this bit!`;
}
