/**
 * The world's smallest .env reader.
 *
 * The game has no dependencies and this keeps it that way. Real environment
 * variables always win, so CI can export ELEVENLABS_API_KEY without a file.
 */
import { readFileSync, existsSync } from 'node:fs';

export function loadEnv(file = '.env') {
  if (!existsSync(file)) return {};
  const out = {};
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
    out[key] = value;
  }
  return out;
}

/**
 * The API key, or a clear explanation of where to put one.
 *
 * Never logged, never written to a file, never shipped to the browser — it is
 * used by this script and nothing else.
 */
export function requireApiKey() {
  loadEnv();
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    console.error(`
✖ No ELEVENLABS_API_KEY found.

  1. Get a key:  https://elevenlabs.io  →  your profile  →  API keys
  2. Put it in a .env file at the root of this repository:

       cp .env.example .env
       # then edit .env and paste the key after ELEVENLABS_API_KEY=

  .env is git-ignored. Never commit the key, and never put it in any file
  under src/ — the browser must never see it.
`);
    process.exit(1);
  }
  return key;
}
