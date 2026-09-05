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
import { patientMarkup } from '../patients.js';
import { icon, starRow } from '../icons.js';

export function levelsScreen({ career = 'doctor' } = {}) {
  const track = TRACKS[career];
  if (getState().career !== career) setCareer(career);

  const el = h('div', { class: 'lh-screen lh-screen--levels', 'data-world': career });
  // The world header: its drawn mark in a chip, then the world's name.
  const bar = hud({
    back: () => goHome('hub'),
    chips: ['stars', 'coins'],
    extra: [],
  });
  bar.classList.add('levels-header');
  bar.insertBefore(h('div', { class: 'levels-world' },
    h('span', { class: 'levels-world__mark', html: icon(career, { size: 30 }) }),
    h('div', { class: 'lh-hud__title' }, track.name)), bar.querySelector('.lh-hud__spacer'));
  el.appendChild(bar);

  const scroll = h('div', { class: 'lh-screen__scroll' });
  const { done, total } = careerCompletion(career);

  scroll.appendChild(h('div', { style: { padding: '4px 16px 14px', width: 'min(96vw, 760px)', margin: '0 auto' } },
    progressBar(done, total, `${track.blurb}`)));

  const list = h('div', { class: 'level-list' });

  // Exactly one card wears the "PLAY NEXT" badge: the first one still to do.
  const nextUp = track.cases.find(
    (c) => isLevelUnlocked(career, c.level) && !isLevelCompleted(career, c.id));

  track.cases.forEach((caseDef) => {
    const unlocked = isLevelUnlocked(career, caseDef.level);
    const completed = isLevelCompleted(career, caseDef.id);
    const isNext = caseDef === nextUp;

    // Locked copy is the requirement, never a scold.
    const tagline = unlocked
      ? caseDef.tagline
      : `Finish ${track.name} Level ${caseDef.level - 1}`;

    const card = h('button', {
      class: `lh-case${completed ? ' lh-case--done' : ''}${isNext ? ' lh-case--next' : ''}${unlocked ? '' : ' lh-case--locked'}`,
      'aria-disabled': String(!unlocked),
      onClick: () => start(caseDef, unlocked),
    },
      isNext ? h('span', { class: 'lh-case__flag' }, 'PLAY NEXT') : null,
      h('span', {
        class: 'lh-case__art',
        html: unlocked
          ? patientMarkup(caseDef.patient || caseDef.patientPool?.[0], completed ? 'happy' : 'calm')
          : icon('lock', { size: 38 }),
      }),
      h('div', { class: 'lh-case__body' },
        h('div', { class: 'lh-case__title' }, `${caseDef.level}. ${caseDef.title}`),
        h('div', { class: 'lh-case__tagline' }, tagline),
        h('div', { class: 'lh-case__teaches' },
          ...(unlocked ? caseDef.teaches : []).map((t) => h('span', { class: 'lh-case__tag' }, t)))),
      h('span', {
        class: 'lh-case__state',
        html: completed ? starRow(caseDef.reward?.stars ?? 3)
          : unlocked ? `<span class="lh-case__go">${icon('play', { size: 26 })}</span>`
          : icon('lock', { size: 26 }),
      }),
      completed ? h('span', { class: 'lh-case__done' }, 'Helped!') : null);

    list.appendChild(card);
  });

  scroll.appendChild(list);
  el.appendChild(scroll);

  function start(caseDef, unlocked) {
    if (!unlocked) {
      sfx.nudge();
      toast('Finish the level before this one first!', { mark: 'lock' });
      return;
    }
    sfx.select();
    go('case', { career, caseId: caseDef.id });
  }

  return { el, destroy: () => bar.dispose?.() };
}
