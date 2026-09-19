/**
 * The celebration screen.
 *
 * Order matters here — reward pills land one at a time, then new tools get
 * their own "NEW TOOL!" moment, then new rooms send the player back to the
 * hospital to watch them being built.
 */
import { icon } from '../icons.js';
import { toolArt } from '../toolart.js';
import { h, wait } from '../../core/dom.js';
import { sfx } from '../../core/audio.js';
import { go, goHome } from '../../core/router.js';
import { getCase } from '../../data/cases/index.js';
import { isLevelUnlocked, getState } from '../../core/state.js';
import { TOOLS } from '../../data/tools.js';
import { ROOMS } from '../../data/rooms.js';
import { patientMarkup } from '../patients.js';
import { modal } from '../components.js';
import { confetti, sparkle, flash } from '../../core/fx.js';
import { sayAll } from '../../core/voice.js';
import { BADGES } from './bag.js';

/** "1 kindness star", "3 kindness stars" — it is read aloud, so it must scan. */
function plural(n, word) { return `${n} ${word}${n === 1 ? '' : 's'}`; }

/** "a, b and c" — a spoken list, so the last join is a word and not a comma. */
function listed(items) {
  const parts = items.filter(Boolean);
  if (parts.length < 2) return parts[0] || '';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function resultsScreen({ career, caseDef, result, newTools = [], newRooms = [], progress, replay }) {
  const el = h('div', { class: 'lh-screen lh-screen--results', 'data-world': career });
  // Level 1 of either track is somebody's very first patient — say so.
  const firstEver = caseDef.level === 1 && progress?.firstTime;

  const card = h('div', { class: 'results-card' });
  el.appendChild(card);

  const heroName = getState().hero?.name || '';

  const heading = result.perfect
    ? `⭐ PERFECT CHECKUP, DR. ${(heroName || 'HERO').toUpperCase()}! ⭐`
    : `GREAT JOB, DR. ${(heroName || 'HERO').toUpperCase()}!`;
  // The banner shouts and abbreviates because that is what a banner does; the
  // spoken version says the title in full, because "Dr." out loud is "Drive".
  const spokenHeading = result.perfect
    ? `Perfect checkup, Doctor ${heroName || 'Hero'}!`
    : `Great job, Doctor ${heroName || 'Hero'}!`;

  card.append(
    h('div', { class: 'results-patient', html: patientMarkup(result.patient, 'proud') }),
    h('h2', {}, heading),
    h('p', { class: 'results-card__sub' },
      firstEver
        ? `You helped your first patient — well done!`
        : `You helped ${result.patient.name} feel much better!`),
  );

  const rewards = h('div', { class: 'results-rewards' });
  card.appendChild(rewards);

  const pills = [
    { mark: 'star', value: `+${result.stars}`, label: 'Hero Stars' },
    result.kindness ? { mark: 'kindness', value: `+${result.kindness}`, label: 'Kindness Stars' } : null,
    { mark: 'coin', value: `+${result.coins}`, label: 'Hospital Coins' },
  ].filter(Boolean);

  pills.forEach((p, i) => {
    rewards.appendChild(h('div', {
      class: 'reward-pill', style: { animationDelay: `${0.25 + i * 0.22}s` },
    },
      h('span', { class: 'reward-pill__icon', html: icon(p.mark) }),
      h('span', { class: 'reward-pill__value' }, p.value),
      h('span', { class: 'reward-pill__label' }, p.label)));
  });

  if (replay) {
    card.appendChild(h('p', { style: { fontSize: '13px', color: 'var(--lh-ink-soft)', margin: '0 0 8px' } },
      '🔁 Practice run — fewer coins, but every star still counts!'));
  }

  if (result.badges?.length) {
    card.appendChild(h('div', { class: 'badge-strip' },
      ...result.badges.map((b) => h('span', { class: 'badge-pill' },
        `${BADGES[b]?.name || b}`))));
  }

  const unlockStrip = h('div', { class: 'unlock-strip' });
  card.appendChild(unlockStrip);

  if (progress?.newLevel) {
    const next = getCase(career, progress.unlockedLevel);
    const nextPatient = next?.patient || next?.patientPool?.[0] || null;
    if (next) {
      unlockStrip.appendChild(h('div', { class: 'unlock-chip' },
        // Some cases pick their patient from a pool, so there may be no
        // single one to draw — show the first of the pool when that happens.
        h('span', { class: 'unlock-chip__icon',
                    html: nextPatient ? patientMarkup(nextPatient, 'happy', { portrait: true }) : icon('tick') }),
        h('span', {}, `New patient: ${next.title}`)));
    }
  }
  newRooms.forEach((r) => unlockStrip.appendChild(h('div', { class: 'unlock-chip' },
    h('span', { class: 'unlock-chip__icon', html: icon('tick') }),
    h('span', {}, `${ROOMS[r]?.name || r} unlocked!`))));

  const actions = h('div', { class: 'lh-row lh-gap-m lh-wrap', style: { justifyContent: 'center', marginTop: '16px' } });
  card.appendChild(actions);

  const nextCase = getCase(career, caseDef.level + 1);
  const canPlayNext = nextCase && isLevelUnlocked(career, nextCase.level);

  if (canPlayNext) {
    actions.appendChild(h('button', {
      class: 'lh-btn lh-btn--primary', onClick: () => { sfx.select(); go('case', { career, caseId: nextCase.id }, { replace: true }); },
    }, 'Next patient'));
  }
  actions.appendChild(h('button', {
    class: 'lh-btn lh-btn--secondary', onClick: goToHospital,
  }, '🏥 My hospital'));
  actions.appendChild(h('button', {
    class: 'lh-btn lh-btn--quiet', onClick: () => { sfx.tap(); go('levels', { career }, { replace: true }); },
  }, '📋 All patients'));

  function goToHospital() {
    sfx.tap();
    goHome('hub', newRooms.length ? { build: newRooms } : {});
  }

  /* ------------------------------------------------------ entry sequence */
  async function celebrate() {
    sfx.fanfare();
    confetti({ intensity: result.perfect ? 2 : 1.3, duration: 3000 });
    flash('rgba(255,255,255,.55)', 500);

    // Read the celebration out. This is the payoff screen, and it was silent.
    // The rewards are one sentence, not three: read as three, the pause after
    // each one landed in the middle of a list and sounded like a stutter.
    sayAll([
      spokenHeading,
      firstEver
        ? 'You helped your very first patient. Well done!'
        : `You helped ${result.patient.name} feel much better!`,
      `You earned ${listed([
        plural(result.stars, 'hero star'),
        result.kindness ? plural(result.kindness, 'kindness star') : null,
        plural(result.coins, 'hospital coin'),
      ])}.`,
    ], { role: 'ui', interrupt: true });

    await wait(500);
    sparkle(card, { count: 20 });

    // Each new tool gets its own moment.
    for (const id of newTools) {
      await wait(700);
      await showNewTool(TOOLS[id]);
    }
  }

  function showNewTool(tool) {
    if (!tool) return Promise.resolve();
    return new Promise((resolve) => {
      sfx.unlock();
      confetti({ intensity: 0.7, duration: 2000 });
      sayAll(['A new tool!', tool.name, tool.blurb], { role: 'ui' });
      const m = modal([
        h('div', { class: 'newtool' },
          h('div', { class: 'newtool__kicker' }, 'NEW TOOL!'),
          h('div', { class: 'newtool__icon', html: toolArt(tool) }),
          h('div', { class: 'newtool__name' }, tool.name.toUpperCase()),
          h('p', { class: 'newtool__blurb' }, `"${tool.blurb}"`)),
        h('button', {
          class: 'lh-btn lh-btn--secondary lh-btn--lg',
          onClick: () => { sfx.select(); m.close(); resolve(); },
        }, 'ADD TO MY BAG'),
      ], { dismissable: false, onClose: resolve });
      sparkle(m.box, { count: 18 });
    });
  }

  return { el, onEnter: celebrate };
}
