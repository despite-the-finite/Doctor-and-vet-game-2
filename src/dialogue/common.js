/**
 * Dialogue that does not belong to any one patient.
 *
 * Praise, nudges, the little connectors that hold a read-out-loud question
 * together, the celebration screen. It used to be scattered across
 * engine/hints.js, the step modules and the results screen; it lives here now
 * so the generation script can find it, and so the words a child hears most
 * often in the whole game are in one file you can read in one sitting.
 *
 * Every one of these is recorded in all three tracks, because the Doctor's
 * narrator and the Toy Workshop's narrator are different people.
 */

/** Never "wrong" — a warm nudge and another go. */
export const NUDGES = [
  'Hmm… let\'s try another tool!',
  'Good thinking — not quite that one though.',
  'Close! Have another look.',
  'Nearly! What else could we use?',
  'That\'s a fair guess. Let\'s try again.',
  'Ooh, almost. One more go!',
];

export const PRAISE = [
  'Perfect!', 'Lovely work!', 'Exactly right!', 'Brilliant!',
  'That\'s it!', 'Beautifully done!', 'Great choice, Doctor!', 'Spot on!',
];

export const KIND_PRAISE = [
  'That was so kind.', 'What a thoughtful thing to say.',
  'Your patient feels safer already.', 'Kindness is medicine too.',
  'That is what a great doctor does.',
];

/** Tapping something in a `find` step that is not a clue. */
export const DECOY_QUIPS = [
  'Ooh — pretty, but not a clue!',
  'Nice spot! Not what we need though.',
  'Ha! That one is just decoration.',
  'Good eyes! Keep looking.',
];

/**
 * The words that hold a spoken question together.
 *
 * `or` is its own recording rather than part of each option, because the
 * options are shuffled — an option has to sound the same whether it comes
 * first or last.
 */
export const CONNECTORS = {
  chooseLead: 'You can pick:',
  empathyLead: 'You could say:',
  triageLead: 'Here is who is waiting:',
  findingLead: 'Is it:',
  or: 'Or:',
};

/** Fixed lines the scan step says while the machine is working. */
export const SCAN_LINES = {
  focusing: 'Focusing…',
  shooting: 'Whirrrr… hold still…',
  question: 'What can you see?',
  lineUp: 'Line the camera up with the glowing spot first!',
  reveal: 'Look at that!',
};

/** The triage step, when someone else needs you first. */
export const ORDER_LINES = {
  sooner: 'Someone else needs you a little sooner.',
};

/**
 * The celebration screen.
 *
 * These are deliberately name-free and number-free. The screen still shows
 * "PERFECT CHECKUP, DR. MAYA!" and the exact star count — but a recorded line
 * cannot know either, and half a sentence in a different voice sounds worse
 * than a warm generic one. See docs/VOICES.md → "What the audio cannot say".
 */
export const RESULTS_LINES = {
  perfect: 'Perfect checkup, Doctor!',
  great: 'Great job, Doctor!',
  firstPatient: 'You helped your very first patient. Well done!',
  helped: 'You helped your patient feel so much better!',
  rewards: 'Look at all those stars!',
};

export const TOAST_LINES = {
  newBadge: 'New badge earned!',
};

/**
 * Fixed lines from the screens outside a case — the level list, the hospital,
 * the supply room. Anything with a number or a name in it (how many coins are
 * missing, which room just opened) cannot be recorded and is read by the
 * browser voice instead.
 */
export const UI_LINES = {
  levelLocked: 'Finish the level before this one first!',
  roomLocked: 'Help more patients to open this room!',
  alreadyOwned: 'You already own this one!',
  buildingRoom: 'A new room is being built!',
  tryItOn: 'Try it on in the character creator!',
  addedToHospital: 'It has been added to your hospital!',
};

/**
 * Everything above, flattened for the generator.
 *
 * The ids are stable — they are what the audio files are named after — so
 * append to a pool rather than reordering it if you want to keep the audio
 * you have already paid for.
 */
export const COMMON_POOLS = [
  { pool: 'praise', lines: PRAISE, emotion: 'celebratory', who: 'narrator' },
  { pool: 'nudge', lines: NUDGES, emotion: 'encouraging', who: 'narrator' },
  { pool: 'kindness', lines: KIND_PRAISE, emotion: 'reassuring', who: 'narrator' },
  { pool: 'decoy', lines: DECOY_QUIPS, emotion: 'playful', who: 'narrator' },
  { pool: 'connector', lines: Object.values(CONNECTORS), emotion: 'encouraging', who: 'narrator' },
  { pool: 'scan', lines: Object.values(SCAN_LINES), emotion: 'curious', who: 'narrator' },
  { pool: 'order', lines: Object.values(ORDER_LINES), emotion: 'encouraging', who: 'narrator' },
  { pool: 'results', lines: Object.values(RESULTS_LINES), emotion: 'celebratory', who: 'narrator' },
  { pool: 'toast', lines: Object.values(TOAST_LINES), emotion: 'excited', who: 'narrator' },
  { pool: 'ui', lines: Object.values(UI_LINES), emotion: 'encouraging', who: 'narrator' },
];
