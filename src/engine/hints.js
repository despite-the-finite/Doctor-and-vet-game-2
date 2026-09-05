/**
 * Encouraging language.
 *
 * There is no "WRONG" anywhere in this game. Every unsuccessful attempt gets
 * a warm nudge and a suggestion — after a couple of tries the game simply
 * shows the child what to do.
 */
import { pick } from '../core/dom.js';
// The phrases themselves live with the rest of the dialogue, so the voice
// generator can find them — this module is just how they are chosen.
import { NUDGES, PRAISE, KIND_PRAISE } from '../dialogue/common.js';
import { wrongToolLine } from '../dialogue/speech.js';

export const nudge = () => pick(NUDGES);
export const praise = () => pick(PRAISE);
export const kindPraise = () => pick(KIND_PRAISE);

/** Wrong-tool responses that name the tool, so the child learns what it is for. */
export function wrongToolMessage(tool) {
  if (!tool) return nudge();
  return wrongToolLine(tool.name);
}

/** After this many tries the game highlights the answer instead of hinting. */
export const TRIES_BEFORE_REVEAL = 2;
