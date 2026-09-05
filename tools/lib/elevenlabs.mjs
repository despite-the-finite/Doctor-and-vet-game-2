/**
 * The ElevenLabs REST client — about eighty lines of `fetch`.
 *
 * Verified against ElevenLabs' current API (December 2025 / 2026 docs and the
 * official @elevenlabs/elevenlabs-js SDK, which is where the exact field names
 * below come from):
 *
 *   POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 *        ?output_format=mp3_44100_128
 *        header  xi-api-key: <key>
 *        body    { text, model_id, voice_settings, language_code,
 *                  apply_text_normalization, previous_text, next_text, seed }
 *        returns audio/mpeg
 *
 *   GET  https://api.elevenlabs.io/v2/voices?page_size=100
 *
 * Node 18+ has `fetch` built in, so this file — and the whole voice pipeline —
 * needs no npm dependencies at all.
 */

export const API_BASE = 'https://api.elevenlabs.io';

/**
 * The models worth using for a children's game.
 *
 * `audioTags` is the one that matters: Eleven v3 reads `[warmly]` as a stage
 * direction, every other model reads it out loud as the word "warmly". The
 * generator only emits tags for models that understand them.
 */
export const MODELS = {
  eleven_v3: {
    id: 'eleven_v3',
    label: 'Eleven v3 — the most expressive model, understands performance tags',
    audioTags: true,
    languageCode: true,
    maxChars: 3000,
  },
  eleven_multilingual_v2: {
    id: 'eleven_multilingual_v2',
    label: 'Multilingual v2 — the steady, long-established quality model',
    audioTags: false,
    languageCode: false,
    maxChars: 9500,
  },
  eleven_turbo_v2_5: {
    id: 'eleven_turbo_v2_5',
    label: 'Turbo v2.5 — faster and cheaper, a little less expressive',
    audioTags: false,
    languageCode: true,
    maxChars: 9500,
  },
  eleven_flash_v2_5: {
    id: 'eleven_flash_v2_5',
    label: 'Flash v2.5 — cheapest and fastest, least expressive',
    audioTags: false,
    languageCode: true,
    maxChars: 9500,
  },
};

export const DEFAULT_MODEL = 'eleven_v3';
export const DEFAULT_FORMAT = 'mp3_44100_128';

class ElevenLabsError extends Error {
  constructor(status, body) {
    super(`ElevenLabs API ${status}: ${body}`.slice(0, 500));
    this.status = status;
    this.body = body;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Retries on rate limits and transient server errors, backing off politely. */
async function withRetry(fn, { attempts = 4, label = 'request' } = {}) {
  let wait = 1500;
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const retryable = err instanceof ElevenLabsError
        ? (err.status === 429 || err.status >= 500)
        : true; // network blips
      if (!retryable || i >= attempts) throw err;
      console.warn(`   ↻ ${label} failed (${err.status || err.code || 'network'}) — retrying in ${wait / 1000}s`);
      await sleep(wait);
      wait *= 2;
    }
  }
}

/**
 * Turn one line into an MP3.
 *
 * Returns a Buffer. `text` should already carry its performance tag (if the
 * model supports one) — see tools/generate-voices.mjs.
 */
export async function textToSpeech({
  apiKey, voiceId, text, model = DEFAULT_MODEL, voiceSettings,
  format = DEFAULT_FORMAT, languageCode = 'en', seed = null,
}) {
  const spec = MODELS[model] || MODELS[DEFAULT_MODEL];
  const body = {
    text,
    model_id: spec.id,
    voice_settings: voiceSettings,
    apply_text_normalization: 'auto',
  };
  if (spec.languageCode && languageCode) body.language_code = languageCode;
  if (seed != null) body.seed = seed;

  return withRetry(async () => {
    const res = await fetch(`${API_BASE}/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(format)}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'content-type': 'application/json',
        accept: 'audio/mpeg',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ElevenLabsError(res.status, await res.text());
    return Buffer.from(await res.arrayBuffer());
  }, { label: 'text-to-speech' });
}

/** Every voice on the account, newest API (v2) first, falling back to v1. */
export async function listVoices({ apiKey }) {
  const get = async (path) => {
    const res = await fetch(`${API_BASE}${path}`, { headers: { 'xi-api-key': apiKey } });
    if (!res.ok) throw new ElevenLabsError(res.status, await res.text());
    return res.json();
  };
  try {
    const data = await withRetry(() => get('/v2/voices?page_size=100'), { label: 'list voices' });
    return data.voices || [];
  } catch (err) {
    if (err.status !== 404) throw err;
    const data = await withRetry(() => get('/v1/voices'), { label: 'list voices (v1)' });
    return data.voices || [];
  }
}

/** Whoami — used as a cheap credential check before spending anything. */
export async function fetchUserInfo({ apiKey }) {
  const res = await fetch(`${API_BASE}/v1/user/subscription`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) throw new ElevenLabsError(res.status, await res.text());
  return res.json();
}

export { ElevenLabsError };
