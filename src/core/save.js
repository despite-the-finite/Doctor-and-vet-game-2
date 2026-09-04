/**
 * Persistence layer.
 *
 * Everything the game stores goes through `load()` / `persist()` here, so
 * swapping localStorage for a cloud backend later means replacing only this
 * file: the shape of the save blob is a plain JSON document with an explicit
 * `schema` version and a `migrate()` chain.
 */

const KEY = 'littleHeroesHospital.save.v1';
export const SCHEMA = 5;

/** The canonical empty save. Every field the game reads must exist here. */
export function freshSave() {
  return {
    schema: SCHEMA,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    migratedAt: Date.now(),

    /** null until the player finishes the character creator */
    hero: null,           // { name, skin, hair, hairColor, glasses, coatColor, scrubs, shoes, accessory }
    difficulty: 'little', // 'little' | 'explorer'
    career: null,         // 'doctor' | 'vet'  (current focus — freely switchable)

    progress: {
      doctor: { level: 1, completed: [] }, // completed = array of case ids
      vet:    { level: 1, completed: [] },
      toy:    { level: 1, completed: [] },
    },

    wallet: { stars: 0, kindness: 0, coins: 0 },

    unlocked: {
      tools: ['stethoscope', 'thermometer'], // starter kit
      rooms: ['reception', 'doctor', 'vet', 'toyshop', 'supply'],
    },

    /** purchased shop item ids -> quantity (decor can be bought once) */
    purchased: {},

    /** ids of badges/awards earned, e.g. 'medical-detective' */
    badges: [],

    /** `voice` is filled in from the chosen difficulty in the creator. */
    settings: { sound: true, music: true, voice: true },

    /** small flags: tutorial seen, celebrations shown, etc. */
    flags: {},
  };
}

/** Upgrade older saves in place. Add a new `if (save.schema < N)` block per bump. */
function migrate(save) {
  if (!save || typeof save !== 'object') return freshSave();

  if (save.schema < 2) {
    save.badges = save.badges || [];
    save.schema = 2;
  }
  if (save.schema < 3) {
    save.wallet.kindness = save.wallet.kindness || 0;
    save.flags = save.flags || {};
    save.schema = 3;
  }
  if (save.schema < 4) {
    // Spoken prompts arrived in schema 4; default them from the age mode.
    save.settings = save.settings || {};
    if (save.settings.voice === undefined) save.settings.voice = save.difficulty !== 'explorer';
    save.schema = 4;
  }
  if (save.schema < 5) {
    // The Toy Doctor track arrived in schema 5. reconcile() fills in the
    // progress row and the room from the fresh save, so there is nothing to
    // copy here — but an existing player should not have to earn a room that
    // new players are simply given.
    save.unlocked = save.unlocked || {};
    save.unlocked.rooms = [...new Set([...(save.unlocked.rooms || []), 'toyshop'])];
    save.schema = 5;
  }
  return save;
}

/** Fill in anything a hand-edited or partial save is missing. */
function reconcile(save) {
  const base = freshSave();
  const merged = { ...base, ...save };
  // Every track in the fresh save gets a progress row, so adding a career
  // never needs a line here again.
  merged.progress = Object.fromEntries(Object.keys(base.progress).map((career) =>
    [career, { ...base.progress[career], ...(save.progress?.[career] || {}) }]));
  merged.wallet = { ...base.wallet, ...(save.wallet || {}) };
  merged.unlocked = {
    tools: [...new Set([...base.unlocked.tools, ...(save.unlocked?.tools || [])])],
    rooms: [...new Set([...base.unlocked.rooms, ...(save.unlocked?.rooms || [])])],
  };
  merged.settings = { ...base.settings, ...(save.settings || {}) };
  merged.purchased = { ...(save.purchased || {}) };
  merged.flags = { ...(save.flags || {}) };
  merged.badges = [...new Set(save.badges || [])];
  merged.schema = SCHEMA; // reconcile() brings everything up to the current shape
  return merged;
}

/**
 * True when the blob that came out of storage was not already in the current
 * shape — either an older schema or a save missing fields. state.js uses this
 * to write the upgraded version straight back, so what is on disk always
 * matches what the game is running.
 */
let upgraded = false;
export function wasUpgraded() { return upgraded; }

export function load() {
  upgraded = false;
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    if (!raw) return freshSave();
    const result = reconcile(migrate(JSON.parse(raw)));
    upgraded = JSON.stringify({ ...result, updatedAt: 0, migratedAt: 0 })
            !== JSON.stringify({ ...JSON.parse(raw), updatedAt: 0, migratedAt: 0 });
    return result;
  } catch (err) {
    console.warn('[save] could not read save, starting fresh', err);
    upgraded = !!raw; // a corrupt blob is worth replacing
    return freshSave();
  }
}

export function persist(save) {
  try {
    save.updatedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(save));
    return true;
  } catch (err) {
    // Private-browsing / quota. The game must keep playing regardless.
    console.warn('[save] could not write save', err);
    return false;
  }
}

export function wipe() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Handy for a future "export my hospital" button or cloud sync. */
export function serialize(save) { return JSON.stringify(save, null, 2); }
