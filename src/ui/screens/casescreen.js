/**
 * Thin screen wrapper around the case engine.
 *
 * Its only jobs: find the case, mount the runner, and turn the runner's
 * result into save-file changes (stars, coins, unlocks, badges) before
 * handing over to the results screen.
 */
import { h } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { go, goHome } from '../../core/router.js';
import {
  addStars, addKindness, addCoins, completeCase, unlockTool, unlockRoom,
  awardBadge, hasTool, hasRoom, isLevelCompleted,
} from '../../core/state.js';
import { getCaseById } from '../../data/cases/index.js';
import { createCaseRunner } from '../../engine/caseRunner.js';
import { hud, modal } from '../components.js';

export function caseScreen({ career, caseId }) {
  const caseDef = getCaseById(caseId);
  const el = h('div', { class: 'lh-screen', 'data-world': career });

  if (!caseDef) {
    el.appendChild(h('p', { class: 'empty-note' }, 'That patient could not be found.'));
    el.appendChild(h('button', { class: 'lh-btn', onClick: () => goHome('hub') }, 'Back to my hospital'));
    return { el };
  }

  const replay = isLevelCompleted(career, caseDef.id);

  const bar = hud({
    title: caseDef.title,
    back: confirmQuit,
    dark: true,
    chips: [],
  });
  el.appendChild(bar);

  const runner = createCaseRunner(caseDef, { onFinish });
  el.appendChild(runner.el);

  function confirmQuit() {
    const m = modal([
      h('h2', {}, 'Leave this patient?'),
      h('p', {}, 'You can come back and start them again any time.'),
      h('div', { class: 'lh-row lh-gap-m', style: { justifyContent: 'center', flexWrap: 'wrap' } },
        h('button', { class: 'lh-btn lh-btn--primary', onClick: () => m.close() }, 'Keep helping'),
        h('button', { class: 'lh-btn lh-btn--quiet', onClick: () => { m.close(); goHome('hub'); } }, 'Leave')),
    ]);
  }

  function onFinish(result) {
    // Replays are worth fewer coins so the shop still means something,
    // but stars and kindness always count — practice should never be punished.
    const coinMultiplier = replay ? 0.3 : 1;
    const coins = Math.round(result.coins * coinMultiplier);

    addStars(result.stars);
    addKindness(result.kindness);
    addCoins(coins);

    const newTools = (caseDef.unlocks?.tools || []).filter((t) => !hasTool(t));
    const newRooms = (caseDef.unlocks?.rooms || []).filter((r) => !hasRoom(r));
    newTools.forEach(unlockTool);
    newRooms.forEach(unlockRoom);
    result.badges.forEach(awardBadge);

    const progress = completeCase(career, caseDef);

    sfx.great();
    go('results', {
      career, caseDef, result: { ...result, coins },
      newTools, newRooms, progress, replay,
    }, { replace: true });
  }

  return { el, destroy: () => { runner.destroy(); bar.dispose?.(); } };
}
