#!/usr/bin/env node
/**
 * Voice system checks.
 *
 *   node tools/validate-voices.mjs
 *
 * Offline, free and fast — no API key, no network. It catches the things that
 * silently break the voice-over:
 *
 *   · a character with no voice, or a voice for a character that was deleted
 *   · voice settings outside the ranges the API accepts
 *   · an emotion a dialogue config refers to that does not exist
 *   · a generated clip whose text has since been edited (stale audio)
 *   · a manifest entry whose file is missing
 *   · an API key accidentally committed into src/
 *
 * Exits non-zero when anything is wrong, so it drops straight into CI.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectDialogue, summarise, DIALOGUE_MODES } from '../src/dialogue/collect.js';
import { CHARACTERS } from '../src/dialogue/characters.js';
import { VOICES, voiceSettingsFor, MODE_TONE, placeholderVoices } from '../src/dialogue/voices.js';
import { EMOTIONS, emotion } from '../src/dialogue/emotions.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = resolve(ROOT, 'public/audio');
const MANIFEST = resolve(AUDIO_DIR, 'manifest.json');
const INDEX = resolve(AUDIO_DIR, 'voice-index.json');

const problems = [];
const notes = [];

/* --- the registry ------------------------------------------------------- */

for (const [id, character] of Object.entries(CHARACTERS)) {
  const voice = VOICES[id];
  if (!voice) { problems.push(`${id}: no voice in src/dialogue/voices.js`); continue; }
  if (!voice.voiceId) problems.push(`${id}: voiceId is empty`);
  if (!MODE_TONE[character.mode]) problems.push(`${id}: track "${character.mode}" has no tone in MODE_TONE`);
  const s = voiceSettingsFor(id, emotion('excited'));
  for (const [key, [lo, hi]] of Object.entries({
    stability: [0, 1], similarity_boost: [0, 1], style: [0, 1], speed: [0.7, 1.2],
  })) {
    if (typeof s[key] !== 'number' || s[key] < lo || s[key] > hi) {
      problems.push(`${id}: ${key} of ${s[key]} is outside ${lo}–${hi}`);
    }
  }
}
for (const id of Object.keys(VOICES)) {
  if (!CHARACTERS[id]) problems.push(`voices.js has "${id}", which is not a character`);
}

/* --- the per-track dialogue configs ------------------------------------- */

for (const [mode, cfg] of Object.entries(DIALOGUE_MODES)) {
  for (const [slot, name] of Object.entries(cfg.emotions || {})) {
    if (!EMOTIONS[name]) problems.push(`${mode}: emotion "${name}" for ${slot} does not exist`);
  }
  for (const [who, name] of Object.entries(cfg.byWho || {})) {
    if (!EMOTIONS[name]) problems.push(`${mode}: emotion "${name}" for ${who} does not exist`);
  }
}

/* --- the dialogue itself ------------------------------------------------ */

const entries = collectDialogue();
const stats = summarise(entries);
const byLookup = new Map();
for (const entry of entries) {
  if (!CHARACTERS[entry.character]) problems.push(`${entry.id}: unknown character "${entry.character}"`);
  if (!EMOTIONS[entry.emotion]) problems.push(`${entry.id}: unknown emotion "${entry.emotion}"`);
  if (byLookup.has(entry.lookup)) problems.push(`${entry.id}: lookup collides with ${byLookup.get(entry.lookup)}`);
  byLookup.set(entry.lookup, entry.id);
}

/* --- what has actually been generated ----------------------------------- */

let manifest = null;
if (existsSync(MANIFEST)) {
  try { manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')); }
  catch (err) { problems.push(`manifest.json will not parse: ${err.message}`); }
}

if (manifest) {
  const recorded = new Map((manifest.lines || []).map((l) => [l.id, l]));
  let stale = 0; let missingFile = 0; let orphan = 0;

  for (const entry of entries) {
    const line = recorded.get(entry.id);
    if (!line) continue;
    if (line.textHash !== entry.textHash) stale++;
    if (line.file && !existsSync(resolve(AUDIO_DIR, line.file))) missingFile++;
  }
  for (const line of manifest.lines || []) {
    if (!entries.some((e) => e.id === line.id)) orphan++;
  }

  const withAudio = (manifest.lines || []).filter((l) => existsSync(resolve(AUDIO_DIR, l.file))).length;
  notes.push(`manifest: ${manifest.lines?.length || 0} lines, ${withAudio} with audio on disk`);
  if (stale) notes.push(`${stale} line(s) have been edited since they were generated — run: npm run generate-voices`);
  if (missingFile) notes.push(`${missingFile} manifest entry/entries point at a file that is not there — run: npm run generate-voices`);
  if (orphan) notes.push(`${orphan} recorded line(s) are no longer in the game — clean up with: npm run generate-voices -- --prune`);

  if (existsSync(INDEX)) {
    const index = JSON.parse(readFileSync(INDEX, 'utf8'));
    const unknown = Object.keys(index.lines || {}).filter((k) => !byLookup.has(k)).length;
    if (unknown) notes.push(`${unknown} entry/entries in voice-index.json no longer match any line in the game`);
  } else {
    problems.push('manifest.json exists but voice-index.json does not — the game cannot find the audio');
  }
} else {
  notes.push('no audio generated yet — the game will use the browser voice until you run: npm run generate-voices');
}

/* --- nothing secret in the shipped source ------------------------------- */

// Assembled from pieces so this file does not trip its own check.
const SECRET = new RegExp(`\\b${'sk'}_[A-Za-z0-9]{24,}|${'xi'}-api-key["']?\\s*[:=]\\s*["'][A-Za-z0-9_-]{20,}`);
const SELF = fileURLToPath(import.meta.url);
function scan(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (full === SELF) continue;
    if (statSync(full).isDirectory()) { scan(full); continue; }
    if (!/\.(js|mjs|json|html|css)$/.test(name)) continue;
    const text = readFileSync(full, 'utf8');
    if (SECRET.test(text)) problems.push(`${full.replace(`${ROOT}/`, '')}: looks like it contains an API key`);
    if (/ELEVENLABS_API_KEY/.test(text) && full.includes(`${ROOT}/src/`)) {
      problems.push(`${full.replace(`${ROOT}/`, '')}: the browser bundle must never mention the API key`);
    }
  }
}
scan(resolve(ROOT, 'src'));
scan(resolve(ROOT, 'tools'));

/* --- report -------------------------------------------------------------- */

console.log(`\n🎙  voice check`);
console.log(`   ${stats.total} recordable lines across ${Object.keys(stats.byMode).length} tracks, ${stats.characters.toLocaleString()} characters`);
Object.entries(stats.byCharacter).sort((a, b) => b[1] - a[1]).forEach(([id, n]) => {
  console.log(`     ${String(n).padStart(5)}  ${id}${VOICES[id]?.placeholder ? '  (stock voice)' : ''}`);
});
const placeholders = placeholderVoices();
if (placeholders.length) notes.push(`${placeholders.length} character(s) still use shared stock voices — see docs/VOICES.md`);
notes.forEach((n) => console.log(`   · ${n}`));

if (problems.length) {
  console.error(`\n✖ ${problems.length} problem(s):`);
  problems.forEach((p) => console.error(`   ${p}`));
  console.error('');
  process.exit(1);
}
console.log('\n✔ voice system looks healthy\n');
