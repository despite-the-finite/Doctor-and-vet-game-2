# 🏥 Little Heroes Hospital

> **People or pets — everyone needs a hero.**

A colourful browser game for children of roughly **4–10** who want to be a
doctor or a vet. Cute patients arrive, the child examines them, chooses tools,
works out what is wrong, treats them — and every patient helped makes their
hospital bigger.

**No dependencies. No binary assets.** Every character, room, X-ray and
microscope slide in the game is drawn with inline SVG and CSS. The source runs
unbundled in the browser; the one build script simply folds it into a single
portable file.

---

## Playing it

**Easiest — no tools at all.** Open
[`dist/little-heroes-hospital.html`](dist/little-heroes-hospital.html). It is
the whole game in one file: double-click it, email it, or drop it on any
static host. Nothing to install and no server required.

**From source**, ES modules need `http(s)` rather than `file://`:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

**Hosted on Anthropic** — [play it here](https://claude.ai/code/artifact/99cca5d5-0412-4b49-bd70-d9f21978e0bc).
Private until shared from the page's share menu.

**On the web** — enable **GitHub Pages** for this repository (branch `main`,
folder `/`). `index.html` is at the root and `.nojekyll` is committed, so it
works with no configuration.

Rebuild the single-file version after changing anything:

```bash
node tools/build-standalone.mjs
```

---

## What is in the first pass

| | |
|---|---|
| 🎬 Title screen | A living little town: ambulance, helicopter, birds, butterflies, a dog at the vet window, a blinking hospital sign |
| 🎨 Character creator | Skin, hair style & colour, glasses, scrubs, lab coat, shoes, accessories, plus a "surprise me" die |
| 🩺🐾🧸 Three careers | Doctor, Vet and Toy Doctor. Each is a room you walk into, and switching never costs progress |
| 🧸🦸🤖🪆🏎️ Five kinds of toy | The Toy Workshop takes soft toys, action figures, robots, dolls and vehicles — each with its own body plan and its own hotspots |
| 🏥 Hospital hub | An illustrated cutaway building; locked rooms are visible and unlock with a construction animation |
| 📋 50 levels | 20 Doctor + 20 Vet + 10 Toy Doctor cases, all authored as data |
| 🎒 Doctor Bag | 33 collectable tools, each with an icon, name, description and what it does |
| 🛒 Supply Room | Decor, comfy furniture, patient toys, outfits and one buildable new wing |
| ⭐❤️🪙 Rewards | Hero Stars, Kindness Stars and Hospital Coins |
| 🎚️ Two age modes | *Little Helper* (~4–6) and *Medical Explorer* (~7–10) — the same game, adapted |
| 💾 Save system | `localStorage`, versioned and migratable |

---

## Project layout

```
index.html                 entry point, loads src/main.js as a module
dist/                      generated single-file builds (see below)
src/
  main.js                  registers screens with the router and boots
  core/
    state.js               the only place the save file is mutated
    save.js                localStorage read/write, schema + migrations
    router.js              screen stack, back button, history
    audio.js               synthesised sound effects (no audio files)
    fx.js                  confetti, sparkles, toasts, floating rewards
    dom.js                 h(), small helpers
    events.js              tiny pub/sub
  data/
    tools.js               equipment catalogue
    rooms.js               the hospital building + floor layout
    shop.js                Supply Room catalogue
    characters.js          character-creator options
    cases/
      index.js             track registry
      doctor.js            20 Doctor cases (data only)
      vet.js               20 Vet cases (data only)
      toy.js               10 Toy Doctor cases (data only)
      README.md            ← how to author a new patient
  engine/
    caseRunner.js          plays a case's steps, owns the stage
    interactions.js        drag / hold / rub input helpers
    arts.js                explainer animations + X-ray & microscope plates
    hints.js               encouraging language (never "wrong")
    text.js                {name} / {hero} token replacement
    steps/                 one module per step type
  ui/
    screens/               title, creator, hub, levels, case, results, bag, shop
    human.js               parametric human character (hero + people patients)
    creature.js            parametric animal patients
    toy.js                 toy patients: plush, action figure, robot, doll, car
    faces.js               shared eyes / mouths / blush per mood
    patients.js            patient factory
    backdrop.js            illustrated room interiors
    components.js          HUD, chips, modal, progress bar
  styles/                  base.css, ui.css, screens.css, case.css
tools/
  validate-cases.mjs       data checks for patient cases
  build-standalone.mjs     bundles everything into dist/
```

---

## Development

There is nothing to build and nothing to install. Edit a file, refresh the
page.

```bash
python3 -m http.server 8000        # serve the source
node tools/validate-cases.mjs      # check every case's data
node tools/build-standalone.mjs    # rebuild dist/ (single-file version)
```

`validate-cases.mjs` catches the mistakes that are easy to make when writing a
new patient: a tool id that does not exist, a hotspot the species does not
have, a `choose` step with no correct answer (or no Little-Helper-friendly
distractor), an `order` step whose urgencies do not run `1..n`, an unknown
`show` artwork, and so on. It exits non-zero on failure, so it drops straight
into CI.

`build-standalone.mjs` walks the import graph and wraps each module in its own
function with a small CommonJS-style registry, so module scopes stay separate
and same-named locals in different files cannot collide. It writes two files:
a complete page, and a `<head>`-less fragment for hosts that supply their own
document shell.

There is one debug hook: `window.__go('hub')` jumps to any screen by name,
which is handy when you are working on a level near the end of a track.

---

## Adding a patient

Cases are **pure data** — see [`src/data/cases/README.md`](src/data/cases/README.md).
A new patient is one object appended to `doctor.js`, `vet.js` or `toy.js`; the engine
needs no changes at all.

```js
{
  id: 'doc-11', career: 'doctor', level: 11,
  title: 'The Wobbly Tooth', tagline: 'Sasha has news. Big news.',
  icon: '🦷', room: 'doctor', teaches: ['Teeth', 'Growing up'],
  patient: { kind: 'human', name: 'Sasha', look: { hair: 'bun', skin: 'skin2' } },
  reward: { stars: 3, coins: 80 },
  unlocks: { tools: [], rooms: [] },
  outro: { text: 'It came OUT!', mood: 'giggle' },
  steps: [
    { type: 'talk', who: 'patient', mood: 'happy', text: 'Look. LOOK. It wobbles.' },
    { type: 'tool', tool: 'penlight', target: 'mouth', stars: 1,
      prompt: 'Have a look inside.', readout: { kind: 'text', value: 'One very wobbly tooth.' } },
    { type: 'choose', prompt: 'What happens next?', stars: 1, options: [
      { icon: '🦷', label: 'A grown-up tooth grows in', correct: true },
      { icon: '🩹', label: 'A bandage', easy: true },
    ] },
  ],
}
```

Step types available today: `talk`, `empathy`, `tool`, `choose`, `find`,
`order`, `scan`, `show`.

---

## Safety & tone

This is an **imaginative game**, not medical advice — it says so on the title
screen. Medical ideas are simplified but broadly accurate. There are no
graphic injuries, no blood, no needles, no frightening emergencies and no
death. Mistakes are never punished: the game says *"Hmm… let's try another
tool!"* and, after two tries, quietly shows the answer.

---

## Accessibility

* Every interactive target is at least 56 px and every drag also works as
  two taps.
* Nothing depends on reading: icons, colour, animation and (synthesised) sound
  carry the meaning.
* Sound is off-by-default quiet, synthesised at low gain, and there is a mute
  button on every single screen.
* `prefers-reduced-motion` drops the ambient animation.
* Back and Home are always visible — a child cannot get stuck on a screen.
