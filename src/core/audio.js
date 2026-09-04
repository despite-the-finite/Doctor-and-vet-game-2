/**
 * Tiny WebAudio "instrument".
 *
 * The game ships no audio files on purpose: every sound is synthesised, so
 * there is nothing to download, nothing to 404, and nothing that can blast a
 * child at full volume. The context is created lazily on the first real user
 * gesture, which is also what browsers require.
 */
import { soundOn } from './state.js';

let ctx = null;
let master = null;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.14; // deliberately gentle
  master.connect(ctx.destination);
  return ctx;
}

// Browsers suspend the context until a gesture happens.
['pointerdown', 'keydown', 'touchstart'].forEach((evt) =>
  window.addEventListener(evt, () => { ensure()?.resume?.(); }, { once: true, passive: true })
);

function tone(freq, { dur = 0.16, type = 'sine', at = 0, gain = 1, slideTo = null } = {}) {
  if (!soundOn()) return;
  const c = ensure();
  if (!c || c.state === 'suspended') return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(0.55 * gain, t0 + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise({ dur = 0.25, gain = 0.5, at = 0, filterFreq = 900 } = {}) {
  if (!soundOn()) return;
  const c = ensure();
  if (!c || c.state === 'suspended') return;
  const t0 = c.currentTime + at;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buf;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = filterFreq;
  const env = c.createGain();
  env.gain.value = gain;
  src.connect(lp).connect(env).connect(master);
  src.start(t0);
}

const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5, E6 = 1318.5, G6 = 1568;

export const sfx = {
  tap:      () => tone(660, { dur: 0.07, type: 'triangle' }),
  select:   () => { tone(E5, { dur: 0.09, type: 'triangle' }); tone(G5, { dur: 0.1, type: 'triangle', at: 0.05 }); },
  pickup:   () => tone(520, { dur: 0.1, type: 'square', gain: 0.5, slideTo: 900 }),
  drop:     () => tone(300, { dur: 0.12, type: 'sine', slideTo: 180 }),
  good:     () => [C5, E5, G5].forEach((f, i) => tone(f, { dur: 0.16, type: 'triangle', at: i * 0.07 })),
  great:    () => [C5, E5, G5, C6].forEach((f, i) => tone(f, { dur: 0.2, type: 'triangle', at: i * 0.075 })),
  fanfare:  () => [C5, E5, G5, C6, E6, G6].forEach((f, i) => tone(f, { dur: 0.32, type: 'triangle', at: i * 0.09, gain: 0.9 })),
  nudge:    () => { tone(430, { dur: 0.13, type: 'sine' }); tone(360, { dur: 0.16, type: 'sine', at: 0.1 }); },
  star:     () => tone(A5, { dur: 0.18, type: 'triangle', slideTo: 1760 }),
  coin:     () => { tone(1180, { dur: 0.06, type: 'square', gain: .6 }); tone(1560, { dur: 0.1, type: 'square', at: 0.05, gain: .6 }); },
  unlock:   () => { noise({ dur: 0.3, filterFreq: 1600, gain: 0.35 }); [D5, G5, C6].forEach((f, i) => tone(f, { dur: 0.26, type: 'triangle', at: 0.1 + i * 0.09 })); },
  heartbeat:() => { tone(88, { dur: 0.13, type: 'sine', gain: 1.5 }); tone(72, { dur: 0.17, type: 'sine', at: 0.19, gain: 1.2 }); },
  breath:   () => noise({ dur: 0.6, filterFreq: 520, gain: 0.28 }),
  woof:     () => tone(300, { dur: 0.16, type: 'sawtooth', gain: .55, slideTo: 170 }),
  meow:     () => tone(620, { dur: 0.4, type: 'sawtooth', gain: .4, slideTo: 900 }),
  chirp:    () => { tone(1500, { dur: 0.08, type: 'sine', slideTo: 2300 }); tone(1800, { dur: 0.08, type: 'sine', at: .11, slideTo: 2600 }); },
  squeak:   () => tone(1100, { dur: 0.1, type: 'triangle', slideTo: 1500 }),
  whoosh:   () => noise({ dur: 0.35, filterFreq: 2200, gain: 0.3 }),
  scan:     () => { tone(220, { dur: 0.7, type: 'sine', slideTo: 660, gain: .7 }); noise({ dur: .7, filterFreq: 400, gain: .18 }); },
  build:    () => [0, .12, .24, .36].forEach((at) => noise({ dur: 0.12, filterFreq: 700, gain: 0.45, at })),
};

/** Play one of the sfx by name, ignoring unknown names. */
export function play(name) { sfx[name]?.(); }
