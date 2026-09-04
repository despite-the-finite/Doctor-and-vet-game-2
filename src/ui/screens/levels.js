/**
 * Level select for one career track.
 * Completed cases can always be replayed (they just award fewer coins).
 */
import { h } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { go, goHome } from '../../core/router.js';
import { isLevelUnlocked, isLevelCompleted, careerCompletion, setCareer, getState } from '../../core/state.js';
import { TRACKS } from '../../data/cases/index.js';
import { hud, progressBar } from '../components.js';
import { toast } from '../../core/fx.js';

export function levelsScreen({ career = 'doctor' } = {}) {
  const track = TRACKS[career];
  if (getState().career !== career) setCareer(career);

  const el = h('div', { class: `screen screen--levels${career === 'vet' ? ' is-vet' : ''}` });
  const bar = hud({
    title: `${track.icon} ${track.name}`,
    back: () => goHome('hub'),
    dark: true,
    chips: ['stars', 'coins'],
  });
  el.appendChild(bar);

  const scroll = h('div', { class: 'screen-scroll' });
  const { done, total } = careerCompletion(career);

  scroll.appendChild(h('div', { style: { display: 'grid', placeItems: 'center', padding: '4px 16px 14px' } },
    progressBar(done, total, `${track.blurb}`)));

  const list = h('div', { class: 'level-list' });

  // Exactly one card wears the "PLAY NEXT" badge: the first one still to do.
  const nextUp = track.cases.find(
    (c) => isLevelUnlocked(career, c.level) && !isLevelCompleted(career, c.id));

  track.cases.forEach((caseDef) => {
    const unlocked = isLevelUnlocked(career, caseDef.level);
    const completed = isLevelCompleted(career, caseDef.id);
    const isNext = caseDef === nextUp;

    const card = h('button', {
      class: `level-card${completed ? ' level-card--done' : ''}${isNext ? ' level-card--next' : ''}${unlocked ? '' : ' level-card--locked'}`,
      onClick: () => start(caseDef, unlocked),
    },
      isNext ? h('span', { class: 'level-badge' }, 'PLAY NEXT') : null,
      h('span', { class: 'level-card__num' }, unlocked ? caseDef.icon : '🔒'),
      h('div', { class: 'level-card__body' },
        h('h3', {}, `${caseDef.level}. ${caseDef.title}`),
        h('p', {}, unlocked ? caseDef.tagline : 'Finish the level before this one to meet this patient!'),
        h('div', { class: 'level-card__teaches' },
          ...(unlocked ? caseDef.teaches : []).map((t) => h('span', {}, t)))),
      h('span', { class: 'level-card__state' }, completed ? '⭐' : unlocked ? '▶️' : '🔒'));

    list.appendChild(card);
  });

  scroll.appendChild(list);
  el.appendChild(scroll);

  function start(caseDef, unlocked) {
    if (!unlocked) {
      sfx.nudge();
      toast('Finish the level before this one first!', { icon: '🔒' });
      return;
    }
    sfx.select();
    go('case', { career, caseId: caseDef.id });
  }

  return { el, destroy: () => bar.dispose?.() };
}
