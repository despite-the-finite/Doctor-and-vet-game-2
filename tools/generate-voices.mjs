#!/usr/bin/env node
/**
 * Turn the game's dialogue into voice clips.
 *
 *   npm run generate-voices                 everything that is missing or changed
 *   npm run generate-voices:doctor          one track
 *   npm run generate-voices -- --dry-run    what WOULD be generated, costs nothing
 *   npm run generate-voices -- --case doc-01
 *   npm run generate-voices -- --character toyRobot --force
 *
 * What it does:
 *
 *   1. collects every line the game can speak      (src/dialogue/collect.js)
 *   2. works out who says each one                 (src/dialogue/characters.js)
 *   3. looks up that character's voice             (src/dialogue/voices.js)
 *   4. compares it against what was generated last (public/audio/manifest.json)
 *   5. generates ONLY what is new or has changed   (ElevenLabs)
 *   6. writes the clips, the manifest and the runtime index
 *
 * Step 4 is the important one: every clip records a fingerprint of the exact
 * text, voice, model and settings it was made from, so editing one sentence
 * regenerates one sentence and leaves the other 1,960 alone.
 *
 * The API key is read from ELEVENLABS_API_KEY (see .env.example). It is used
 * here and nowhere else — the game itself never talks to ElevenLabs.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { dirname, resolve, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

import { collectDialogue, summarise, DIALOGUE_MODES } from '../src/dialogue/collect.js';
import { CHARACTERS, MODES } from '../src/dialogue/characters.js';
import { VOICES, voiceSettingsFor, placeholderVoices } from '../src/dialogue/voices.js';
import { emotion } from '../src/dialogue/emotions.js';
import { hash } from '../src/dialogue/hash.js';
import { loadEnv, requireApiKey } from './lib/env.mjs';
import { textToSpeech, MODELS, DEFAULT_MODEL, DEFAULT_FORMAT } from './lib/elevenlabs.mjs';

// .env is read up front so ELEVENLABS_MODEL can act as a default; the key
// itself is only touched when a clip is actually about to be generated.
loadEnv();

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = resolve(ROOT, 'public/audio');
const MANIFEST = resolve(AUDIO_DIR, 'manifest.json');
const INDEX = resolve(AUDIO_DIR, 'voice-index.json');

/* ------------------------------------------------------------ arguments */

function parseArgs(argv) {
  const opts = {
    modes: null, case: null, character: null, limit: null,
    model: process.env.ELEVENLABS_MODEL || DEFAULT_MODEL, format: DEFAULT_FORMAT, concurrency: 3,
    force: false, dryRun: false, yes: false, prune: false, check: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => argv[++i];
    switch (arg) {
      case '--mode': case '-m': opts.modes = (opts.modes || []).concat(next().split(',')); break;
      case '--case': case '-c': opts.case = next(); break;
      case '--character': opts.character = next(); break;
      case '--limit': opts.limit = Number(next()); break;
      case '--model': opts.model = next(); break;
      case '--format': opts.format = next(); break;
      case '--concurrency': opts.concurrency = Math.max(1, Number(next())); break;
      case '--force': opts.force = true; break;
      case '--dry-run': case '-n': opts.dryRun = true; break;
      case '--yes': case '-y': opts.yes = true; break;
      case '--prune': opts.prune = true; break;
      case '--check': opts.check = true; break;
      case '--help': case '-h': usage(); process.exit(0); break;
      default:
        console.error(`Unknown option "${arg}". Try --help.`);
        process.exit(2);
    }
  }
  // The track ids the game uses are doctor / vet / toy; "toy-doctor" is the
  // folder name, so accept it too rather than failing on a reasonable guess.
  if (opts.modes) {
    opts.modes = opts.modes.map((m) => (m === 'toy-doctor' || m === 'toydoctor' ? 'toy' : m));
    const unknown = opts.modes.filter((m) => !DIALOGUE_MODES[m]);
    if (unknown.length) {
      console.error(`Unknown track(s): ${unknown.join(', ')}. Known: ${Object.keys(DIALOGUE_MODES).join(', ')}`);
      process.exit(2);
    }
  }
  if (!MODELS[opts.model]) {
    console.error(`Unknown model "${opts.model}". Known: ${Object.keys(MODELS).join(', ')}`);
    process.exit(2);
  }
  return opts;
}

function usage() {
  console.log(`
Little Heroes Hospital — voice generation

  node tools/generate-voices.mjs [options]

  --mode <id>         only this track: doctor | vet | toy   (repeatable)
  --case <id>         only this case, e.g. doc-01, vet-07, toy-03
  --character <id>    only this character, e.g. toyRobot
  --limit <n>         stop after n clips (handy for a first run)
  --model <id>        ${Object.keys(MODELS).join(' | ')}
  --format <id>       output format (default ${DEFAULT_FORMAT})
  --concurrency <n>   parallel requests (default 3)
  --force             regenerate even when nothing has changed
  --prune             delete audio files nothing refers to any more
  --dry-run, -n       report what would happen; makes no API calls
  --check             validate the voice registry and exit
  --yes, -y           do not ask for confirmation
`);
}

/* ---------------------------------------------------------------- helpers */

const readJson = (file, fallback) => {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return fallback; }
};

/** doctor.doc-01.s04.tool.readout → doctor/doc-01/s04-tool-readout.mp3 */
function fileFor(entry) {
  const dir = MODES[entry.mode]?.dir || entry.mode;
  const parts = entry.id.split('.');
  const scope = parts[1] || 'misc';
  const leaf = parts.slice(2).join('-').replace(/[^A-Za-z0-9._-]/g, '-') || 'line';
  return `${dir}/${scope}/${leaf}.mp3`;
}

/**
 * Everything that decides what a clip sounds like.
 *
 * Change the words, the voice, the emotion, the model or the settings and the
 * fingerprint changes — which is exactly when the clip has to be made again.
 */
function fingerprintOf(entry, { voiceId, model, format, settings, tag }) {
  return hash([entry.text, voiceId, model, format, tag || '', JSON.stringify(settings)].join('\u0000'));
}

/** The performance tag, on models that understand one. */
function tagFor(entry, model) {
  if (!MODELS[model]?.audioTags) return null;
  return emotion(entry.emotion).tag;
}

function textFor(entry, tag) {
  return tag ? `[${tag}] ${entry.text}` : entry.text;
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`${question} [y/N] `)).trim().toLowerCase();
  rl.close();
  return answer === 'y' || answer === 'yes';
}

/** A tiny worker pool — enough parallelism to be quick, not enough to be rude. */
async function pool(items, size, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
}

/* -------------------------------------------------------------------- run */

const opts = parseArgs(process.argv.slice(2));
const modes = opts.modes || Object.keys(DIALOGUE_MODES);

/* --- the voice registry has to make sense before anything else happens --- */
const registryProblems = [];
for (const id of Object.keys(CHARACTERS)) {
  const voice = VOICES[id];
  if (!voice) registryProblems.push(`${id}: no entry in src/dialogue/voices.js`);
  else if (!voice.voiceId) registryProblems.push(`${id}: voiceId is empty — paste one in src/dialogue/voices.js`);
}
for (const id of Object.keys(VOICES)) {
  if (!CHARACTERS[id]) registryProblems.push(`${id}: a voice for a character that does not exist`);
}

if (opts.check || registryProblems.length) {
  const placeholders = placeholderVoices();
  console.log('\nVoice registry — src/dialogue/voices.js\n');
  for (const id of Object.keys(CHARACTERS)) {
    const v = VOICES[id] || {};
    const mark = !v.voiceId ? '✖ missing  ' : v.placeholder ? '·  stock   ' : '✔ chosen   ';
    console.log(`  ${mark} ${id.padEnd(20)} ${(v.voiceName || '—').padEnd(12)} ${v.voiceId || ''}`);
  }
  if (placeholders.length) {
    console.log(`\n  ${placeholders.length} character(s) are still using shared stock voices.`);
    console.log('  Run "npm run voices:list" to see your own voices, paste the ids into');
    console.log('  src/dialogue/voices.js, and remove `placeholder: true`. docs/VOICES.md explains it.');
  }
  if (registryProblems.length) {
    console.error('\n✖ Problems:\n' + registryProblems.map((p) => `   ${p}`).join('\n') + '\n');
    process.exit(1);
  }
  if (opts.check) { console.log(''); process.exit(0); }
}

/* --- collect ------------------------------------------------------------ */

const collected = collectDialogue({ modes });
const stats = summarise(collected);

const targets = collected.filter((e) => {
  if (opts.case && e.source?.caseId !== opts.case) return false;
  if (opts.character && e.character !== opts.character) return false;
  return true;
});

if (opts.case && !targets.length) {
  console.error(`No dialogue found for case "${opts.case}".`);
  process.exit(1);
}

/* --- what already exists ------------------------------------------------ */

const previous = readJson(MANIFEST, { lines: [] });
const previousById = new Map((previous.lines || []).map((l) => [l.id, l]));

const model = opts.model;
const format = opts.format;

const plan = [];        // clips to generate
const records = [];     // every line's manifest record, generated or not
const targetIds = new Set(targets.map((e) => e.id));

for (const entry of collected) {
  const voice = VOICES[entry.character];
  const settings = voiceSettingsFor(entry.character, emotion(entry.emotion));
  const tag = tagFor(entry, model);
  const file = fileFor(entry);
  const fingerprint = fingerprintOf(entry, { voiceId: voice.voiceId, model, format, settings, tag });
  const old = previousById.get(entry.id);
  const onDisk = existsSync(resolve(AUDIO_DIR, file));

  const record = {
    id: entry.id,
    mode: entry.mode,
    character: entry.character,
    voiceId: voice.voiceId,
    voiceName: voice.voiceName || null,
    emotion: entry.emotion,
    tag,
    text: entry.text,
    textHash: entry.textHash,
    lookup: entry.lookup,
    file,
    model,
    format,
    settings,
    fingerprint,
    usedBy: entry.usedBy,
    source: entry.source,
    generatedAt: old?.generatedAt || null,
    bytes: old?.bytes || null,
    missing: true,
  };

  const unchanged = old && old.fingerprint === fingerprint && old.file === file && onDisk;
  if (unchanged && !opts.force) {
    record.missing = false;
    records.push(record);
    continue;
  }
  if (!targetIds.has(entry.id)) {
    // Out of scope for this run: keep whatever audio is already there rather
    // than dropping the line out of the index.
    record.missing = !onDisk;
    if (onDisk && old) { record.fingerprint = old.fingerprint; record.file = old.file; record.tag = old.tag ?? tag; }
    records.push(record);
    continue;
  }
  records.push(record);
  plan.push({ entry, record, settings, tag, voice });
}

// Lines outside the selected tracks keep the records they already had.
for (const old of previous.lines || []) {
  if (modes.includes(old.mode)) continue;
  if (records.some((r) => r.id === old.id)) continue;
  records.push({ ...old, missing: !existsSync(resolve(AUDIO_DIR, old.file)) });
}

const limited = opts.limit ? plan.slice(0, opts.limit) : plan;
const chars = limited.reduce((n, p) => n + textFor(p.entry, p.tag).length, 0);

/* --- report ------------------------------------------------------------- */

console.log(`\n🎙  Little Heroes Hospital — voice generation`);
console.log(`   tracks      ${modes.join(', ')}`);
console.log(`   model       ${model}  (${MODELS[model].label})`);
console.log(`   format      ${format}`);
console.log(`   dialogue    ${stats.total} lines, ${stats.characters.toLocaleString()} characters`);
Object.entries(stats.byMode).forEach(([m, n]) => console.log(`               ${String(n).padStart(5)}  ${DIALOGUE_MODES[m]?.label || m}`));
console.log(`   up to date  ${records.filter((r) => !r.missing && !plan.some((p) => p.record.id === r.id)).length}`);
console.log(`   to generate ${limited.length} clips, ${chars.toLocaleString()} characters`);
if (opts.limit && plan.length > limited.length) console.log(`               (--limit ${opts.limit}: ${plan.length - limited.length} more waiting)`);

if (!limited.length) {
  console.log('\n✔ Everything is already up to date.\n');
  writeManifest();
  process.exit(0);
}

if (opts.dryRun) {
  console.log('\n--dry-run: nothing was generated. First few lines that would be:\n');
  limited.slice(0, 12).forEach((p) => {
    console.log(`   ${p.record.id}`);
    console.log(`     ${p.record.character} · ${p.record.emotion} → ${textFor(p.entry, p.tag).slice(0, 96)}`);
  });
  console.log('');
  process.exit(0);
}

if (!opts.yes) {
  if (!process.stdin.isTTY) {
    console.error('\n✖ This will spend ElevenLabs credits. Re-run with --yes (or use --dry-run).\n');
    process.exit(1);
  }
  const go = await confirm(`\nGenerate ${limited.length} clips (${chars.toLocaleString()} characters)?`);
  if (!go) { console.log('Nothing generated.\n'); process.exit(0); }
}

/* --- generate ----------------------------------------------------------- */

const apiKey = requireApiKey();
let done = 0;
let failed = 0;

await pool(limited, opts.concurrency, async (job) => {
  const { entry, record, settings, tag, voice } = job;
  const target = resolve(AUDIO_DIR, record.file);
  try {
    const audio = await textToSpeech({
      apiKey,
      voiceId: voice.voiceId,
      text: textFor(entry, tag),
      model,
      format,
      voiceSettings: settings,
    });
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, audio);
    record.bytes = audio.length;
    record.generatedAt = new Date().toISOString();
    record.missing = false;
    done++;
    const pct = String(Math.round((done / limited.length) * 100)).padStart(3);
    console.log(`   ${pct}%  ${record.file}  ${entry.text.slice(0, 60)}`);
  } catch (err) {
    failed++;
    console.error(`   ✖ ${record.id}: ${err.message}`);
  }
});

writeManifest();

console.log(`\n✔ ${done} clip(s) generated${failed ? `, ${failed} failed` : ''}.`);
if (failed) console.log('  Re-run the same command — clips that worked are not regenerated.');
const stillPlaceholder = placeholderVoices();
if (stillPlaceholder.length) {
  console.log(`\n  ⚠ ${stillPlaceholder.length} character(s) still use shared stock voices:`);
  console.log(`     ${stillPlaceholder.join(', ')}`);
  console.log('     npm run voices:list  →  paste ids into src/dialogue/voices.js  →  regenerate');
}
console.log('');
process.exit(failed ? 1 : 0);

/* ------------------------------------------------------------- manifests */

function writeManifest() {
  mkdirSync(AUDIO_DIR, { recursive: true });
  const usable = records.filter((r) => !r.missing);

  const manifest = {
    schema: 1,
    generatedAt: new Date().toISOString(),
    provider: 'elevenlabs',
    model,
    format,
    totals: {
      lines: records.length,
      withAudio: usable.length,
      characters: records.reduce((n, r) => n + r.text.length, 0),
      byMode: records.reduce((acc, r) => ({ ...acc, [r.mode]: (acc[r.mode] || 0) + 1 }), {}),
      byCharacter: records.reduce((acc, r) => ({ ...acc, [r.character]: (acc[r.character] || 0) + 1 }), {}),
    },
    lines: records.sort((a, b) => a.id.localeCompare(b.id)),
  };
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  // The runtime only needs "which file plays this line" — a few tens of
  // kilobytes rather than the whole manifest, fetched once when the game boots.
  const index = {
    schema: 1,
    generatedAt: manifest.generatedAt,
    lines: Object.fromEntries(usable.map((r) => [r.lookup, r.file])),
  };
  writeFileSync(INDEX, `${JSON.stringify(index)}\n`);

  console.log(`   manifest    public/audio/manifest.json (${manifest.lines.length} lines)`);
  console.log(`   index       public/audio/voice-index.json (${usable.length} playable)`);

  if (opts.prune) prune(new Set(usable.map((r) => r.file)));
}

/** Delete clips nothing points at any more (renamed cases, rewritten lines). */
function prune(keep) {
  let removed = 0;
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!name.endsWith('.mp3')) continue;
      const rel = relative(AUDIO_DIR, full).split('\\').join('/');
      if (keep.has(rel)) continue;
      unlinkSync(full);
      removed++;
    }
    try { if (!readdirSync(dir).length) rmdirSync(dir); } catch { /* not empty */ }
  };
  walk(AUDIO_DIR);
  if (removed) console.log(`   pruned      ${removed} unused clip(s)`);
}
