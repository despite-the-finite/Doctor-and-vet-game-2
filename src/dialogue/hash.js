/**
 * A tiny, dependency-free content hash.
 *
 * The same function has to run in the browser (to look a line up in the voice
 * manifest) and in Node (to write that manifest), so it cannot use anything
 * platform specific — no `crypto`, no `TextEncoder` quirks, no async
 * `subtle.digest`. FNV-1a over UTF-16 code units, run twice with different
 * offsets, gives a 64-bit value that is stable, synchronous and plenty for a
 * few thousand lines of children's dialogue.
 *
 * It is used for two different jobs:
 *   · the LOOKUP key  — mode + character + normalised text → which audio file
 *   · the CONTENT hash — the exact text and voice settings that were sent to
 *     ElevenLabs, so the generator can tell when a line has been edited and
 *     needs regenerating.
 */

const OFFSET_A = 0x811c9dc5;
const OFFSET_B = 0x01000193;
const PRIME = 0x01000193;

function fnv1a(str, seed) {
  let hash = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, PRIME) >>> 0;
    hash ^= str.charCodeAt(i) >>> 8;
    hash = Math.imul(hash, PRIME) >>> 0;
  }
  return hash >>> 0;
}

/** 16 lowercase hex characters. Same input, same output, everywhere. */
export function hash(str) {
  const text = String(str ?? '');
  const a = fnv1a(text, OFFSET_A);
  const b = fnv1a(text, OFFSET_B ^ text.length);
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}
