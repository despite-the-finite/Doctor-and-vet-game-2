/**
 * Who is speaking.
 *
 * A case says `who: 'nurse'` and knows nothing about voices; this module turns
 * that — plus the track and the patient in front of you — into one of the
 * character ids below. Those ids are the only thing the voice registry
 * (./voices.js) and the generated audio filenames ever refer to, so adding a
 * new speaker is: add a character here, give it a voice there, regenerate.
 *
 * The three tracks deliberately share NO voices. The Doctor's ward is warm and
 * calm, the Vet's is bright and busy, the Toy Workshop is gentle and a little
 * bit magical — same game, three audio personalities.
 */
import { TOYS } from '../ui/toy.js';

/** Track id → the prefix every character in that track uses. */
export const MODES = {
  doctor: { id: 'doctor', label: 'Doctor', dir: 'doctor' },
  vet: { id: 'vet', label: 'Vet', dir: 'vet' },
  toy: { id: 'toy', label: 'Toy Doctor', dir: 'toy-doctor' },
};

export const MODE_IDS = Object.keys(MODES);

/**
 * Every voice the game can use.
 *
 * `role` groups characters that do the same job in different tracks, which is
 * what the tone defaults in ./voices.js key off.
 */
export const CHARACTERS = {
  /* ------------------------------------------------------------- doctor */
  doctorNarrator: {
    id: 'doctorNarrator', mode: 'doctor', role: 'narrator',
    label: 'Doctor — Narrator',
    description: 'The warm grown-up voice that guides the child through a checkup. Calm, unhurried, never clinical.',
  },
  doctorNurse: {
    id: 'doctorNurse', mode: 'doctor', role: 'nurse',
    label: 'Doctor — Nurse Pim',
    description: 'The friendly colleague on the ward. Practical, kind, quietly encouraging.',
  },
  doctorHero: {
    id: 'doctorHero', mode: 'doctor', role: 'hero',
    label: 'Doctor — the player',
    description: 'The child playing the doctor. Bright, curious, kind — the things they choose to say out loud.',
  },
  doctorPatientChild: {
    id: 'doctorPatientChild', mode: 'doctor', role: 'patient',
    label: 'Doctor — child patient',
    description: 'The children who come to the ward. Young, chatty, sometimes a little nervous.',
  },
  doctorParent: {
    id: 'doctorParent', mode: 'doctor', role: 'grownup',
    label: 'Doctor — grown-up patient / parent',
    description: 'A parent or grown-up patient. Reassuring, gentle, a bit tired.',
  },

  /* ---------------------------------------------------------------- vet */
  vetNarrator: {
    id: 'vetNarrator', mode: 'vet', role: 'narrator',
    label: 'Vet — Narrator',
    description: 'Cheerful and energetic, the voice of a busy, happy animal clinic.',
  },
  vetNurse: {
    id: 'vetNurse', mode: 'vet', role: 'nurse',
    label: 'Vet — Nurse Pim',
    description: 'The vet nurse. Brisk, compassionate, always on the animal\'s side.',
  },
  vetHero: {
    id: 'vetHero', mode: 'vet', role: 'hero',
    label: 'Vet — the player',
    description: 'The child playing the vet. Excited to meet every single animal.',
  },
  vetOwner: {
    id: 'vetOwner', mode: 'vet', role: 'grownup',
    label: 'Vet — pet owner',
    description: 'The person who brought the animal in. Worried at first, delighted at the end.',
  },
  vetPatientPet: {
    id: 'vetPatientPet', mode: 'vet', role: 'patient',
    label: 'Vet — pet patient',
    description: 'Dogs, cats, bunnies and hamsters. Warm and characterful — a friendly pet, not a cartoon.',
  },
  vetPatientWild: {
    id: 'vetPatientWild', mode: 'vet', role: 'patient',
    label: 'Vet — wild patient',
    description: 'Foxes, owls, deer and other wild visitors. Softer and more careful — these animals are frightened.',
  },

  /* --------------------------------------------------------- toy doctor */
  toyNarrator: {
    id: 'toyNarrator', mode: 'toy', role: 'narrator',
    label: 'Toy Doctor — Narrator',
    description: 'Whimsical and storybook-warm, like someone reading aloud at bedtime. Playful, never zany.',
  },
  toyNurse: {
    id: 'toyNurse', mode: 'toy', role: 'nurse',
    label: 'Toy Doctor — Workshop keeper',
    description: 'The toy workshop\'s keeper. Unhurried, fond of every toy that comes through the door.',
  },
  toyHero: {
    id: 'toyHero', mode: 'toy', role: 'hero',
    label: 'Toy Doctor — the player',
    description: 'The child mending the toys. Careful and proud of the work.',
  },
  toyPlush: {
    id: 'toyPlush', mode: 'toy', role: 'patient',
    label: 'Toy Doctor — soft toy',
    description: 'Teddies and plush animals. Soft, small and sleepy — well loved and slightly worn out.',
  },
  toyFigure: {
    id: 'toyFigure', mode: 'toy', role: 'patient',
    label: 'Toy Doctor — action figure',
    description: 'Action figures and knights. Brave and theatrical, played straight rather than shouted.',
  },
  toyRobot: {
    id: 'toyRobot', mode: 'toy', role: 'patient',
    label: 'Toy Doctor — robot',
    description: 'Toy robots. Bright and precise with a hint of clockwork — friendly, not machine-like.',
  },
  toyDoll: {
    id: 'toyDoll', mode: 'toy', role: 'patient',
    label: 'Toy Doctor — doll',
    description: 'Dolls and ballerinas. Light, expressive and a little bit grand.',
  },
  toyVehicle: {
    id: 'toyVehicle', mode: 'toy', role: 'patient',
    label: 'Toy Doctor — vehicle',
    description: 'Cars, vans and diggers. Zippy and eager, with an engine\'s enthusiasm.',
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS);

/** Which pets sound like pets and which animals are wild visitors. */
const WILD_SPECIES = new Set(['fox', 'owl', 'deer', 'raccoon', 'turtle', 'duck', 'bird', 'parrot']);

/** Toy body plan → the character that speaks for it. */
const TOY_FAMILY_CHARACTER = {
  plush: 'toyPlush',
  figure: 'toyFigure',
  robot: 'toyRobot',
  doll: 'toyDoll',
  car: 'toyVehicle',
};

const NARRATOR = { doctor: 'doctorNarrator', vet: 'vetNarrator', toy: 'toyNarrator' };
const NURSE = { doctor: 'doctorNurse', vet: 'vetNurse', toy: 'toyNurse' };
const HERO = { doctor: 'doctorHero', vet: 'vetHero', toy: 'toyHero' };
const GROWNUP = { doctor: 'doctorParent', vet: 'vetOwner', toy: 'toyNurse' };

/** The narrator of a track — the default voice for anything not attributed. */
export function narratorFor(mode) {
  return NARRATOR[mode] || NARRATOR.doctor;
}

/**
 * `who` (from a case step) + the patient on stage → a character id.
 *
 * Called by the generator when it writes the audio and by the game when it
 * looks it up again, so the two can never drift apart.
 */
export function characterFor({ mode = 'doctor', who = 'narrator', patient = null } = {}) {
  const track = MODES[mode] ? mode : 'doctor';
  switch (who) {
    case 'nurse': return NURSE[track];
    case 'hero': return HERO[track];
    case 'parent':
    case 'owner':
    case 'grownup': return GROWNUP[track];
    case 'patient': return patientCharacter(track, patient);
    default: return NARRATOR[track];
  }
}

/** Which voice a patient speaks with, from its species or toy family. */
export function patientCharacter(mode, patient) {
  const kind = patient?.kind || '';
  if (mode === 'toy' || TOYS[kind]) {
    const family = TOYS[kind]?.family;
    // Soft toys built on the creature body plan (teddy, plushbun…) are not in
    // TOYS at all — they are species with `toy: true`, and they are plush.
    return TOY_FAMILY_CHARACTER[family] || 'toyPlush';
  }
  if (mode === 'vet') return WILD_SPECIES.has(kind) ? 'vetPatientWild' : 'vetPatientPet';
  if (patient?.look?.age === 'adult') return 'doctorParent';
  return 'doctorPatientChild';
}

/** Every character belonging to one track. */
export function charactersForMode(mode) {
  return CHARACTER_IDS.filter((id) => CHARACTERS[id].mode === mode);
}
