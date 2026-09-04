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

function boot() {
  const app = document.getElementById('app');
  attach(app);
  attachFx(document.getElementById('fx'));

  Object.entries(SCREENS).forEach(([name, factory]) => registerScreen(name, factory));

  // A returning player with a hero still starts on the title screen — it is
  // the friendliest "front door" and the Carry On button is right there.
  go('title', {}, { replace: true });

  // Small hook so end-to-end tests can jump straight to a screen.
  window.__go = go;

  // Global unlock announcements, wherever they happen.
  on('unlock:room', (room) => toast(`${room.icon} ${room.name} unlocked!`, { icon: '🎉', tone: 'good' }));

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
