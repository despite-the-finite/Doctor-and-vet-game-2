/**
 * Little Heroes Hospital — synthesised menu music.
 *
 * Like audio.js, this ships no audio files: every instrument is a handful of
 * oscillators and filtered noise. Songs are pure data (chords, 16-step drum
 * strings, a bass rhythm relative to each chord, a melody list), played by a
 * look-ahead scheduler so timing is sample-accurate and loops are seamless.
 *
 *   const music = createMusic({ isEnabled: soundOn });
 *   music.start('lobby');   // the main-menu loop
 *   music.stop(1.2);        // fade out in seconds
 */
import { soundOn, musicOn } from './state.js';

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = (s) => { const r = /^([A-G])([#b]?)(-?\d)$/.exec(s); return NOTE[r[1]] + (r[2] === '#' ? 1 : r[2] === 'b' ? -1 : 0) + (+r[3] + 1) * 12; };
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/* ------------------------------------------------------------------ songs */

// Main menu — lo-fi hip hop in the waiting room. Rhodes + marimba + upright + brushes.
const lobby = {
  name: 'Waiting Room Lo-fi', bpm: 85, swing: 0.16, bars: 12, sections: 'AAAABBBBAAAA',
  chords: [
    { name: 'Cmaj7', root: 'C2', notes: ['E3', 'G3', 'B3', 'D4'] },
    { name: 'Am9',   root: 'A1', notes: ['C3', 'G3', 'B3', 'E4'] },
    { name: 'Fmaj7', root: 'F2', notes: ['A3', 'C4', 'E4', 'G4'] },
    { name: 'G13',   root: 'G2', notes: ['F3', 'B3', 'E4', 'A4'] },
    { name: 'Fmaj7', root: 'F2', notes: ['A3', 'C4', 'E4', 'G4'] },
    { name: 'Em7',   root: 'E2', notes: ['G3', 'B3', 'D4', 'F#4'] },
    { name: 'Dm9',   root: 'D2', notes: ['F3', 'A3', 'C4', 'E4'] },
    { name: 'G7sus', root: 'G2', notes: ['F3', 'A3', 'C4', 'D4'] },
    { name: 'Cmaj7', root: 'C2', notes: ['E3', 'G3', 'B3', 'D4'] },
    { name: 'Am9',   root: 'A1', notes: ['C3', 'G3', 'B3', 'E4'] },
    { name: 'Fmaj7', root: 'F2', notes: ['A3', 'C4', 'E4', 'G4'] },
    { name: 'G13',   root: 'G2', notes: ['F3', 'B3', 'E4', 'A4'] },
  ],
  drums: {
    kick:  { A: 'x.....x...x.....', B: 'x.....x...x..x..' },
    snare: { A: '....x.......x...', B: '....x.......x.-.' },
    hat:   { A: 'x.x.x.x.x.x.x.-.', B: 'x.-.x.x.x.-.x.o.' },
  },
  bass: { rhythm: [[0, 'r', 3], [7, 'r', 2], [10, '5', 4], [14, 'app', 2]] },
  comp: { inst: 'rhodes', hits: [[0, 6], [7, 3], [10, 5]] },
  pad: { sections: 'B', gain: 0.8 },
  melody: [
    { inst: 'marimba', notes: [
      [0, 2, 'G4', 2], [0, 4, 'E5', 2], [0, 6, 'D5', 2], [0, 10, 'G4', 4],
      [1, 0, 'E5', 3], [1, 4, 'C5', 2], [1, 8, 'A4', 6],
      [2, 6, 'A4', 2], [2, 8, 'C5', 2], [2, 10, 'E5', 4],
      [3, 0, 'D5', 4], [3, 8, 'B4', 2], [3, 10, 'G4', 4],
      [8, 2, 'G4', 2], [8, 4, 'E5', 2], [8, 6, 'D5', 2], [8, 10, 'C5', 4],
      [9, 0, 'E5', 3], [9, 4, 'G5', 3], [9, 8, 'E5', 6],
      [10, 0, 'A4', 2], [10, 2, 'C5', 2], [10, 4, 'E5', 4], [10, 8, 'F5', 4], [10, 12, 'E5', 4],
      [11, 0, 'D5', 6], [11, 8, 'G4', 4], [11, 12, 'B4', 2], [11, 14, 'D5', 2],
    ] },
    { inst: 'flute', notes: [
      [4, 0, 'A4', 6], [4, 8, 'C5', 4], [4, 12, 'D5', 4],
      [5, 0, 'E5', 8], [5, 10, 'D5', 2], [5, 12, 'B4', 4],
      [6, 0, 'A4', 4], [6, 4, 'F4', 4], [6, 8, 'A4', 6],
      [7, 2, 'G4', 3], [7, 6, 'D5', 6], [7, 12, 'B4', 4],
    ] },
  ],
};

export const SONGS = { lobby };

/* ----------------------------------------------------------------- engine */

export function createMusic({ isEnabled = () => true, volume = 0.5 } = {}) {
  let ctx = null, master = null, bus = null, verb = null, noiseBuf = null;
  const over = {}; // live overrides: bpm, swing

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 3; comp.attack.value = 0.012; comp.release.value = 0.3;
    master.connect(comp).connect(ctx.destination);
    // Whole-mix warmth: a gentle roll-off keeps the synths from sounding glassy.
    const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 8500; warm.Q.value = 0.4;
    bus = ctx.createGain(); bus.connect(warm).connect(master);
    // Shared room reverb (generated impulse, nothing downloaded).
    verb = ctx.createConvolver(); verb.buffer = impulse(2.0, 2.6);
    const vg = ctx.createGain(); vg.gain.value = 0.32; verb.connect(vg).connect(bus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function impulse(sec, decay) {
    const n = ctx.sampleRate * sec, b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  }

  /* -- voice helpers -- */
  const out = (node, send = 0.2) => { node.connect(bus); if (send) { const s = ctx.createGain(); s.gain.value = send; node.connect(s).connect(verb); } };
  const osc = (type, f, t, end, detune = 0) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune; o.start(t); o.stop(end + 0.05); return o; };
  const noise = (t, end) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.start(t); s.stop(end + 0.05); return s; };
  const filt = (type, f, q = 1) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  // ADSR on a gain node; returns the moment the voice is silent.
  function adsr(g, t, a, d, s, r, len, peak) {
    const floor = 0.0001, sus = Math.max(peak * s, floor);
    g.gain.setValueAtTime(floor, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(sus, t + a + d);
    const off = Math.max(t + len, t + a + d);
    g.gain.setValueAtTime(sus, off);
    g.gain.exponentialRampToValueAtTime(floor, off + r);
    return off + r;
  }
  function pluckEnv(g, t, decay, peak) {
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    return t + decay;
  }
  function vibrato(o, t, rate, depth, delay = 0.12) {
    const l = ctx.createOscillator(); l.frequency.value = rate;
    const lg = ctx.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(depth, t + delay + 0.25);
    l.connect(lg).connect(o.detune); l.start(t); return l;
  }

  /* -- drums -- */
  const DRUM = {
    kick(t, v) {
      const g = ctx.createGain(), o = osc('sine', 150, t, t + 0.35);
      o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
      pluckEnv(g, t + 0.004, 0.33, 0.9 * v); g.gain.setValueAtTime(0.0001, t);
      o.connect(g); out(g, 0.04);
    },
    snare(t, v) {
      const n = noise(t, t + 0.3), bp = filt('bandpass', 1900, 0.9), g = ctx.createGain();
      pluckEnv(g, t, 0.17, 0.42 * v); n.connect(bp).connect(g); out(g, 0.22);
      const o = osc('sine', 195, t, t + 0.12), og = ctx.createGain();
      o.frequency.exponentialRampToValueAtTime(120, t + 0.08); pluckEnv(og, t, 0.1, 0.35 * v); o.connect(og); out(og, 0);
      // brush swish
      const b = noise(t, t + 0.4), hp = filt('highpass', 3600), bg = ctx.createGain();
      adsr(bg, t, 0.03, 0.2, 0.001, 0.05, 0.2, 0.14 * v); b.connect(hp).connect(bg); out(bg, 0.15);
    },
    hat(t, v, open) {
      const n = noise(t, t + 0.4), hp = filt('highpass', 7600), g = ctx.createGain();
      pluckEnv(g, t, open ? 0.3 : 0.05, 0.19 * v); n.connect(hp).connect(g); out(g, 0.04);
    },
    shaker(t, v) {
      const n = noise(t, t + 0.2), bp = filt('bandpass', 5600, 1.6), g = ctx.createGain();
      adsr(g, t, 0.015, 0.08, 0.001, 0.02, 0.08, 0.18 * v); n.connect(bp).connect(g); out(g, 0.08);
    },
    rim(t, v) {
      const o = osc('sine', 840, t, t + 0.08), g = ctx.createGain(); pluckEnv(g, t, 0.05, 0.3 * v); o.connect(g); out(g, 0.15);
      const n = noise(t, t + 0.05), bp = filt('bandpass', 3200, 2), ng = ctx.createGain(); pluckEnv(ng, t, 0.03, 0.3 * v); n.connect(bp).connect(ng); out(ng, 0.15);
    },
  };

  /* -- pitched instruments: (t, midi, lenSec, vel) -- */
  const INST = {
    bass(t, midi, len, v) {
      const f = hz(midi), g = ctx.createGain(), lp = filt('lowpass', f * 6, 1.2);
      lp.frequency.exponentialRampToValueAtTime(f * 2.2, t + 0.25);
      const end = adsr(g, t, 0.006, 0.28, 0.45, 0.12, len, 0.6 * v);
      const o1 = osc('triangle', f * 1.03, t, end); o1.frequency.exponentialRampToValueAtTime(f, t + 0.045); // finger slide in
      const o2 = osc('sine', f, t, end), sg = ctx.createGain(); sg.gain.value = 0.7;
      o1.connect(lp); o2.connect(sg).connect(lp); lp.connect(g); out(g, 0.06);
    },
    marimba(t, midi, len, v) {
      const f = hz(midi), decay = Math.min(1.1, Math.max(0.28, 1.0 - (midi - 60) * 0.012));
      const g = ctx.createGain(), end = pluckEnv(g, t, decay, 0.5 * v);
      osc('sine', f, t, end).connect(g);
      const g2 = ctx.createGain(); pluckEnv(g2, t, 0.09, 0.22 * v); osc('sine', f * 4, t, t + 0.1).connect(g2).connect(bus);
      const n = noise(t, t + 0.02), bp = filt('bandpass', f * 2, 3), ng = ctx.createGain(); pluckEnv(ng, t, 0.012, 0.1 * v); n.connect(bp).connect(ng); out(ng, 0.1);
      out(g, 0.3);
    },
    vibes(t, midi, len, v) {
      const f = hz(midi), decay = Math.min(2.0, len + 0.5), g = ctx.createGain(), end = pluckEnv(g, t, decay, 0.42 * v);
      const trem = ctx.createGain(); trem.gain.value = 0.75;
      const l = osc('sine', 4.6, t, end), lg = ctx.createGain(); lg.gain.value = 0.25; l.connect(lg).connect(trem.gain);
      osc('sine', f, t, end).connect(trem);
      const g2 = ctx.createGain(); pluckEnv(g2, t, 0.35, 0.14 * v); osc('sine', f * 4, t, t + 0.4).connect(g2).connect(trem);
      trem.connect(g); out(g, 0.4);
    },
    rhodes(t, midi, len, v) {
      const f = hz(midi), g = ctx.createGain(), lp = filt('lowpass', 2600, 0.6);
      const end = adsr(g, t, 0.004, 0.5, 0.35, 0.25, len, 0.34 * v);
      const car = osc('sine', f, t, end);
      const mod = osc('sine', f, t, end), mg = ctx.createGain(); // 1:1 FM, index decays → tine attack
      mg.gain.setValueAtTime(f * 1.3, t); mg.gain.exponentialRampToValueAtTime(f * 0.12, t + 0.35);
      mod.connect(mg).connect(car.frequency);
      car.connect(lp).connect(g); out(g, 0.3);
    },
    pluck(t, midi, len, v) {
      const f = hz(midi), g = ctx.createGain(), lp = filt('lowpass', f * 9, 1.5);
      lp.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.3);
      const end = adsr(g, t, 0.002, 0.42, 0.03, 0.1, Math.min(len, 0.42), 0.4 * v);
      osc('triangle', f, t, end).connect(lp);
      const sg = ctx.createGain(); sg.gain.value = 0.3; osc('sawtooth', f, t, end, 4).connect(sg).connect(lp);
      lp.connect(g); out(g, 0.25);
    },
    flute(t, midi, len, v) {
      const f = hz(midi), g = ctx.createGain(), end = adsr(g, t, 0.07, 0.12, 0.8, 0.16, len, 0.3 * v);
      const o = osc('sine', f, t, end); vibrato(o, t, 5.2, 7); o.connect(g);
      const tg = ctx.createGain(); tg.gain.value = 0.22; osc('triangle', f, t, end).connect(tg).connect(g);
      const n = noise(t, end), bp = filt('bandpass', f, 9), ng = ctx.createGain(); ng.gain.value = 0.06; n.connect(bp).connect(ng).connect(g);
      out(g, 0.42);
    },
    clarinet(t, midi, len, v) {
      const f = hz(midi), g = ctx.createGain(), lp = filt('lowpass', f * 3.2, 0.8);
      const end = adsr(g, t, 0.05, 0.15, 0.75, 0.14, len, 0.17 * v);
      const o = osc('square', f, t, end); vibrato(o, t, 4.8, 5, 0.2); o.connect(lp);
      const sg = ctx.createGain(); sg.gain.value = 0.35; osc('sine', f, t, end).connect(sg).connect(lp);
      lp.connect(g); out(g, 0.35);
    },
    pad(t, midi, len, v) {
      const f = hz(midi), g = ctx.createGain(), lp = filt('lowpass', 1000, 0.7);
      const end = adsr(g, t, 0.6, 0.4, 0.8, 1.0, len, 0.055 * v);
      const l = osc('sine', 0.18, t, end), lg = ctx.createGain(); lg.gain.value = 320; l.connect(lg).connect(lp.frequency);
      osc('sawtooth', f, t, end, -7).connect(lp); osc('sawtooth', f, t, end, 7).connect(lp);
      const tg = ctx.createGain(); tg.gain.value = 0.6; osc('triangle', f * 0.5, t, end).connect(tg).connect(lp);
      lp.connect(g); out(g, 0.55);
    },
  };

  /* -- scheduler -- */
  const LOOK = 0.16, TICK = 30;
  let song = null, timer = null, next = 0, step = 0;
  const listeners = new Set();
  const bpm = () => over.bpm || song.bpm;
  const swing = () => (over.swing ?? song.swing);

  function bassNote(tok, bar) {
    const root = m(song.chords[bar].root), nextRoot = m(song.chords[(bar + 1) % song.bars].root);
    switch (tok) {
      case '5': return root + 7; case 'r+': return root + 12; case 'b7': return root + 10; case '3': return root + 4;
      case 'app': return nextRoot === root ? root + 7 : nextRoot - 1;
      default: return root;
    }
  }
  function scheduleStep(bar, s, t) {
    const spb = 60 / bpm() / 4, ch = song.chords[bar], sec = song.sections[bar];
    for (const [name, pats] of Object.entries(song.drums)) {
      const c = (pats[sec] || pats.A)[s]; if (c === '.') continue;
      DRUM[name](t, c === '-' ? 0.38 : 1, c === 'o');
    }
    for (const [st, tok, len] of song.bass.rhythm) if (st === s) INST.bass(t, bassNote(tok, bar), len * spb * 0.9, 1);
    for (const [st, len, dir] of song.comp.hits) if (st === s) {
      const notes = dir === 'u' ? [...ch.notes].reverse() : ch.notes;
      notes.forEach((n, i) => INST[song.comp.inst](t + i * (dir ? 0.016 : 0.004), m(n), len * spb * 0.9, 1 - i * 0.05));
    }
    if (song.pad && s === 0 && song.pad.sections.includes(sec)) ch.notes.forEach((n) => INST.pad(t, m(n), 16 * spb, song.pad.gain));
    for (const tr of song.melody) for (const n of tr.notes) if (n[0] === bar && n[1] === s) INST[tr.inst](t, m(n[2]), n[3] * spb * 0.92, 1);
  }
  function tick() {
    const c = ctx, spb = 60 / bpm() / 4;
    const on = isEnabled();
    master.gain.setTargetAtTime(on ? volume : 0, c.currentTime, 0.08);
    // A background tab throttles timers to ~1 s. Skip the missed steps rather
    // than firing them all at once when the tab comes back.
    while (next < c.currentTime) { step = (step + 1) % (song.bars * 16); next += spb; }
    while (next < c.currentTime + LOOK) {
      const bar = Math.floor(step / 16), s = step % 16;
      const t = next + (s % 2 ? swing() * spb : 0);
      if (on) scheduleStep(bar, s, t);
      const ms = Math.max(0, (t - c.currentTime) * 1000);
      listeners.forEach((fn) => setTimeout(() => fn(bar, s, song), ms));
      step = (step + 1) % (song.bars * 16);
      next += spb;
    }
  }

  function start(name) {
    const c = ensure(); if (!c) return false;
    c.resume?.();
    if (timer) { clearInterval(timer); timer = null; }
    song = SONGS[name]; if (!song) return false;
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(0, c.currentTime);
    step = 0; next = c.currentTime + 0.1;
    timer = setInterval(tick, TICK); tick();
    return true;
  }
  function stop(fade = 1.0) {
    if (!ctx || !timer) return;
    clearInterval(timer); timer = null;
    const c = ctx, s = song; song = null;
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(master.gain.value, c.currentTime);
    master.gain.linearRampToValueAtTime(0, c.currentTime + fade);
    listeners.forEach((fn) => setTimeout(() => fn(-1, -1, s), fade * 1000));
  }
  return {
    start, stop,
    playing: () => (song ? Object.keys(SONGS).find((k) => SONGS[k] === song) : null),
    set: (o) => Object.assign(over, o),
    onStep: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    songs: SONGS,
  };
}

/* ------------------------------------------------------------ game glue */

/** The one shared player. Respects the sound and music toggles on every tick. */
export const music = createMusic({ isEnabled: () => soundOn() && musicOn(), volume: 0.5 });
