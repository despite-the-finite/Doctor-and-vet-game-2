/**
 * Little Heroes Hospital — bootstrap.
 *
 * Registers the screens with the router and starts the game. Everything else
 * lives in its own module:
 *   core/    state, save, router, audio, effects, DOM helpers
 *   data/    tools, rooms, shop, characters, patient cases
 *   engine/  the case runner and its step types
 *   ui/      screens and character artwork
 */
import { registerScreen, attach, go } from './core/router.js';
import { attachFx, toast } from './core/fx.js';
import { getState, hasHero } from './core/state.js';
import { on } from './core/events.js';
import { music } from './core/music.js';

import { titleScreen } from './ui/screens/title.js';
import { creatorScreen } from './ui/screens/creator.js';
import { hubScreen } from './ui/screens/hub.js';
import { levelsScreen } from './ui/screens/levels.js';
import { caseScreen } from './ui/screens/casescreen.js';
import { resultsScreen } from './ui/screens/results.js';
import { bagScreen } from './ui/screens/bag.js';
import { shopScreen } from './ui/screens/shop.js';

const SCREENS = {
  title: titleScreen,
  creator: creatorScreen,
  hub: hubScreen,
  levels: levelsScreen,
  case: caseScreen,
  results: resultsScreen,
  bag: bagScreen,
  shop: shopScreen,
};

/*
 * The menu loop plays across every menu screen and fades out for a case.
 * Keeping it to the title screen meant the tap that started it was nearly
 * always "Carry on", which faded it straight back out — nobody heard it.
 */
const MENU_SCREENS = new Set(['title', 'creator', 'hub', 'levels', 'bag', 'shop']);
let currentScreen = null;
let identDone = !window.EntropicIdent;

function syncMusic() {
  if (!MENU_SCREENS.has(currentScreen)) { if (music.playing()) music.stop(1.0); return; }
  if (music.playing() || !identDone) return;
  // Browsers only let audio start after a gesture; the tap that started the
  // opening ident counts. Safari has no userActivation, so it just tries —
  // music.js resumes a suspended context on the next tap.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  music.start('lobby');
}

function boot() {
  const app = document.getElementById('app');
  attach(app);
  attachFx(document.getElementById('fx'));

  Object.entries(SCREENS).forEach(([name, factory]) => registerScreen(name, (params) => {
    currentScreen = name;
    syncMusic();
    return factory(params);
  }));
  Promise.resolve(window.EntropicIdent?.done).then(() => { identDone = true; syncMusic(); });
  window.addEventListener('pointerdown', syncMusic, { capture: true, passive: true });
  window.addEventListener('keydown', syncMusic, { capture: true, passive: true });

  // A returning player with a hero still starts on the title screen — it is
  // the friendliest "front door" and the Carry On button is right there.
  go('title', {}, { replace: true });

  // Small hook so end-to-end tests can jump straight to a screen.
  window.__go = go;

  // Global unlock announcements, wherever they happen.
  on('unlock:room', (room) => toast(`${room.name} unlocked!`, { tone: 'good' }));

  // Keep the layout honest when a phone rotates or a keyboard opens.
  const setVH = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => setTimeout(setVH, 200));

  // Nothing here should ever silently swallow an error in a child's face —
  // log it, and keep the game running.
  window.addEventListener('error', (ev) => console.error('[game]', ev.error || ev.message));
  window.addEventListener('unhandledrejection', (ev) => console.error('[game]', ev.reason));

  if (hasHero()) {
    console.info(`[Little Heroes Hospital] Welcome back, Dr. ${getState().hero.name}.`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
