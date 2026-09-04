/**
 * The single source of truth for the whole game.
 *
 * Screens never mutate the save blob directly — they call the small action
 * functions below, which mutate, persist and emit. That keeps saving
 * automatic and makes it easy to log/replay changes later.
 */
import { load, persist, freshSave, wipe, wasUpgraded } from './save.js';
import { emit } from './events.js';
import { TOOLS } from '../data/tools.js';
import { ROOMS } from '../data/rooms.js';
import { getTrack } from '../data/cases/index.js';

let save = load();

// A save loaded from an older schema (or one missing fields) is normalised in
// memory by load(). Write it straight back so what is on disk always matches
// what the game is running — otherwise the upgrade only lands the next time
// something happens to change state.
if (wasUpgraded()) {
  save.migratedAt = Date.now();
  persist(save);
}

export function getState() { return save; }

function commit(reason) {
  persist(save);
  emit('state:change', { reason, state: save });
}

/* ---------------------------------------------------------------- profile */

export function hasHero() { return !!save.hero; }

export function setHero(hero) {
  save.hero = { ...(save.hero || {}), ...hero };
  commit('hero');
}

export function setDifficulty(difficulty) {
  save.difficulty = difficulty;
  commit('difficulty');
}

export function setCareer(career) {
  save.career = career;
  commit('career');
}

/** True when the UI should hold the player's hand (ages ~4–6). */
export function isLittle() { return save.difficulty === 'little'; }

/** Doctors and vets are both "Dr." — children love the title either way. */
export function heroTitle() {
  return `Dr. ${save.hero?.name || 'Hero'}`;
}

/* ------------------------------------------------------------- currencies */

export function addStars(n) {
  if (!n) return;
  save.wallet.stars += n;
  commit('stars');
  emit('reward:stars', n);
}

export function addKindness(n) {
  if (!n) return;
  save.wallet.kindness += n;
  commit('kindness');
  emit('reward:kindness', n);
}

export function addCoins(n) {
  if (!n) return;
  save.wallet.coins += n;
  commit('coins');
  emit('reward:coins', n);
}

export function spendCoins(n) {
  if (save.wallet.coins < n) return false;
  save.wallet.coins -= n;
  commit('coins');
  emit('reward:coins', -n);
  return true;
}

/* ---------------------------------------------------------------- unlocks */

export function hasTool(id) { return save.unlocked.tools.includes(id); }

export function unlockTool(id) {
  if (!TOOLS[id] || hasTool(id)) return false;
  save.unlocked.tools.push(id);
  commit('tools');
  emit('unlock:tool', TOOLS[id]);
  return true;
}

export function hasRoom(id) { return save.unlocked.rooms.includes(id); }

export function unlockRoom(id) {
  if (!ROOMS[id] || hasRoom(id)) return false;
  save.unlocked.rooms.push(id);
  commit('rooms');
  emit('unlock:room', ROOMS[id]);
  return true;
}

export function ownsItem(id) { return !!save.purchased[id]; }

export function buyItem(item) {
  if (ownsItem(item.id)) return 'owned';
  if (save.wallet.coins < item.price) return 'poor';
  save.wallet.coins -= item.price;
  save.purchased[item.id] = 1;
  if (item.unlocksRoom) unlockRoom(item.unlocksRoom);
  commit('purchase');
  emit('shop:bought', item);
  return 'ok';
}

export function awardBadge(id) {
  if (save.badges.includes(id)) return false;
  save.badges.push(id);
  commit('badge');
  return true;
}

/* -------------------------------------------------------------- progress */

export function trackProgress(career) { return save.progress[career]; }

/** A level is playable if it's the next one up, or already beaten. */
export function isLevelUnlocked(career, levelNumber) {
  return levelNumber <= save.progress[career].level;
}

export function isLevelCompleted(career, caseId) {
  return save.progress[career].completed.includes(caseId);
}

/**
 * Record a finished case. Returns { firstTime, newLevel } so the results
 * screen can decide how big a party to throw.
 */
export function completeCase(career, caseDef) {
  const track = save.progress[career];
  const firstTime = !track.completed.includes(caseDef.id);
  if (firstTime) track.completed.push(caseDef.id);

  const nextLevel = caseDef.level + 1;
  const total = getTrack(career).length;
  const newLevel = firstTime && nextLevel > track.level && nextLevel <= total;
  if (newLevel) track.level = nextLevel;

  commit('progress');
  return { firstTime, newLevel, unlockedLevel: newLevel ? nextLevel : null };
}

export function careerCompletion(career) {
  const total = getTrack(career).length;
  return { done: save.progress[career].completed.length, total };
}

export function isCareerFinished(career) {
  const { done, total } = careerCompletion(career);
  return done >= total;
}

/* --------------------------------------------------------------- settings */

export function toggleSound() {
  save.settings.sound = !save.settings.sound;
  commit('settings');
  emit('settings:sound', save.settings.sound);
  return save.settings.sound;
}

export function soundOn() { return save.settings.sound; }

/** Spoken prompts. Defaults on for Little Helper, off for Medical Explorer. */
export function setVoice(on) {
  save.settings.voice = on;
  commit('settings');
  emit('settings:voice', on);
}

/* ------------------------------------------------------------------ flags */

export function flag(name) { return !!save.flags[name]; }
export function setFlag(name, value = true) {
  save.flags[name] = value;
  commit('flag');
}

/* ------------------------------------------------------------------ reset */

export function resetEverything() {
  wipe();
  save = freshSave();
  commit('reset');
}
