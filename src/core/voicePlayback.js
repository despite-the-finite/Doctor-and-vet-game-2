/**
 * Playing the pre-generated voice clips.
 *
 * The game never talks to ElevenLabs. `npm run generate-voices` writes MP3s
 * into public/audio/ plus a tiny index — hash of the line → filename — and
 * this module is the only thing that knows those files exist. Everything it
 * does degrades to "no clip": a missing index, a missing file, a browser that
 * refuses to autoplay. In every one of those cases voice.js falls back to the
 * browser's own speech synthesis and the game carries on.
 */

const INDEX_FILE = 'voice-index.json';

/** lookup hash → file path, relative to the audio base. */
let index = null;
let indexPromise = null;
let base = null;

/** Where public/audio/ is, seen from wherever this module was loaded. */
function candidateBases() {
  const out = [];
  try { out.push(new URL('../../public/audio/', import.meta.url).href); } catch { /* bundled */ }
  try { out.push(new URL('public/audio/', document.baseURI).href); } catch { /* no document */ }
  return [...new Set(out)];
}

/**
 * Load the index once. Never rejects — a game that cannot find its audio has
 * to keep working, it just talks with the browser's voice instead.
 */
export function loadVoiceIndex() {
  if (indexPromise) return indexPromise;
  const override = typeof window !== 'undefined' ? window.__LHH_AUDIO_BASE__ : null;
  const bases = override ? [override] : candidateBases();

  indexPromise = (async () => {
    for (const candidate of bases) {
      try {
        const res = await fetch(`${candidate}${INDEX_FILE}`, { cache: 'no-cache' });
        if (!res.ok) continue;
        const data = await res.json();
        if (!data || typeof data.lines !== 'object') continue;
        base = candidate;
        index = data.lines;
        console.info(`[voice] ${Object.keys(index).length} recorded lines available`);
        return index;
      } catch { /* try the next base */ }
    }
    index = {};
    console.info('[voice] no generated audio found — using the browser voice');
    return index;
  })();

  return indexPromise;
}

/** True once the index has been loaded (successfully or not). */
export function indexLoaded() { return index !== null; }

/** The URL of the clip for a line, or null when there is no recording. */
export function clipFor(lookup) {
  if (!index || !lookup) return null;
  const file = index[lookup];
  return file ? `${base}${file}` : null;
}

/* --------------------------------------------------------------- playback */

/**
 * A small pool of <audio> elements, keyed by URL.
 *
 * Replaying a level replays its lines, so keeping the elements around means
 * the second run of a case is instant. The cap stops a long session from
 * holding on to every clip in the game.
 */
const POOL_LIMIT = 48;
const pool = new Map();

function element(url) {
  const cached = pool.get(url);
  if (cached) {
    // Refresh its position in the map so the busiest clips survive eviction.
    pool.delete(url);
    pool.set(url, cached);
    return cached;
  }
  const audio = new Audio();
  audio.src = url;
  audio.preload = 'auto';
  pool.set(url, audio);
  if (pool.size > POOL_LIMIT) {
    const oldest = pool.keys().next().value;
    const dead = pool.get(oldest);
    try { dead.pause(); dead.src = ''; } catch { /* ignore */ }
    pool.delete(oldest);
  }
  return audio;
}

/** The clip playing right now, and how to settle its promise. */
let current = null;

/**
 * Play one clip. Resolves when it finishes, is stopped, or fails — never
 * rejects, so a broken file can never wedge the dialogue queue.
 *
 * Resolves `false` when the clip did not actually play (a 404, or a browser
 * that has not seen a gesture yet), which lets the caller fall back.
 */
export function playClip(url, { volume = 1 } = {}) {
  return new Promise((resolve) => {
    let audio;
    try {
      audio = element(url);
    } catch {
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onErr);
      if (current?.audio === audio) current = null;
      resolve(ok);
    };
    const onEnd = () => finish(true);
    const onErr = () => finish(false);

    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onErr);
    audio.volume = Math.max(0, Math.min(1, volume));
    try { audio.currentTime = 0; } catch { /* not seekable yet */ }

    current = { audio, finish };
    const started = audio.play();
    if (started && typeof started.catch === 'function') {
      started.catch(() => finish(false));
    }
  });
}

/** Stop whatever is playing right now. */
export function stopClip() {
  if (!current) return;
  const { audio, finish } = current;
  current = null;
  try { audio.pause(); audio.currentTime = 0; } catch { /* ignore */ }
  // Pausing fires neither `ended` nor `error`, so the promise has to be
  // settled by hand — otherwise the dialogue queue would wait for a clip that
  // is never going to finish.
  finish(true);
}

/** Warm the browser cache for lines that are about to be needed. */
export function preloadClips(lookups = []) {
  if (!index) return;
  lookups.slice(0, 12).forEach((lookup) => {
    const url = clipFor(lookup);
    if (url) element(url);
  });
}
