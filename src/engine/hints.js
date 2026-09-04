/**
 * Encouraging language.
 *
 * There is no "WRONG" anywhere in this game. Every unsuccessful attempt gets
 * a warm nudge and a suggestion — after a couple of tries the game simply
 * shows the child what to do.
 */
import { pick } from '../core/dom.js';

const NUDGES = [
  'Hmm… let\'s try another tool!',
  'Good thinking — not quite that one though.',
  'Close! Have another look.',
  'Nearly! What else could we use?',
  'That\'s a fair guess. Let\'s try again.',
  'Ooh, almost. One more go!',
];

const PRAISE = [
  'Perfect!', 'Lovely work!', 'Exactly right!', 'Brilliant!',
  'That\'s it!', 'Beautifully done!', 'Great choice, Doctor!', 'Spot on!',
];

const KIND_PRAISE = [
  'That was so kind.', 'What a thoughtful thing to say.',
  'Your patient feels safer already.', 'Kindness is medicine too.',
  'That is what a great doctor does.',
];

export const nudge = () => pick(NUDGES);
export const praise = () => pick(PRAISE);
export const kindPraise = () => pick(KIND_PRAISE);

/** Wrong-tool responses that name the tool, so the child learns what it is for. */
export function wrongToolMessage(tool) {
  if (!tool) return nudge();
  return `The ${tool.name.toLowerCase()} is great — but not for this bit!`;
}

/** After this many tries the game highlights the answer instead of hinting. */
export const TRIES_BEFORE_REVEAL = 2;
