#!/usr/bin/env node
/**
 * List the voices on your ElevenLabs account, ready to paste.
 *
 *   npm run voices:list
 *   npm run voices:list -- --search child
 *
 * Prints each voice's id, name and the labels ElevenLabs holds for it, plus a
 * copy-pasteable snippet for src/dialogue/voices.js. This is the intended way
 * to fill in the registry: pick a voice in the ElevenLabs voice library, add it
 * to your account, run this, paste the id.
 *
 * Reads ELEVENLABS_API_KEY (see .env.example) and makes one GET request. It
 * costs nothing and generates no audio.
 */
import { requireApiKey } from './lib/env.mjs';
import { listVoices } from './lib/elevenlabs.mjs';
import { CHARACTERS } from '../src/dialogue/characters.js';
import { VOICES } from '../src/dialogue/voices.js';

const args = process.argv.slice(2);
const search = args.includes('--search') ? (args[args.indexOf('--search') + 1] || '').toLowerCase() : null;

const apiKey = requireApiKey();
const voices = await listVoices({ apiKey });

const filtered = search
  ? voices.filter((v) => `${v.name} ${v.description || ''} ${Object.values(v.labels || {}).join(' ')}`.toLowerCase().includes(search))
  : voices;

console.log(`\n${filtered.length} voice(s) on this account${search ? ` matching "${search}"` : ''}:\n`);
for (const v of filtered) {
  const labels = Object.entries(v.labels || {}).map(([k, val]) => `${k}=${val}`).join(' ');
  console.log(`  ${v.voice_id}  ${(v.name || '').padEnd(18)} ${v.category || ''} ${labels}`);
  if (v.description) console.log(`      ${String(v.description).slice(0, 110)}`);
}

console.log(`\nPaste into src/dialogue/voices.js, e.g.\n`);
const example = filtered[0];
if (example) {
  console.log(`  doctorNarrator: {`);
  console.log(`    voiceId: '${example.voice_id}', voiceName: '${example.name}',`);
  console.log(`    settings: { stability: 0.62, style: 0.14, speed: 0.94 },`);
  console.log(`    direction: '…what you are listening for…',`);
  console.log(`  },`);
}

console.log(`\nCharacters waiting for a voice of their own:\n`);
for (const [id, character] of Object.entries(CHARACTERS)) {
  if (!VOICES[id]?.placeholder) continue;
  console.log(`  ${id.padEnd(20)} ${character.description}`);
  console.log(`  ${''.padEnd(20)} search for: ${VOICES[id]?.direction || ''}`);
}
console.log('');
