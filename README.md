# 🏥 Little Heroes Hospital

> **People or pets — everyone needs a hero.**

A colourful browser game for children of roughly **4–10** who want to be a
doctor or a vet. Cute patients arrive, the child examines them, chooses tools,
works out what is wrong, treats them — and every patient helped makes their
hospital bigger.

**No dependencies.** Every character, room, X-ray and microscope slide in the
game is drawn with inline SVG and CSS, and every sound effect is synthesised.
The source runs unbundled in the browser; the one build script simply folds it
into a single portable file.

The one set of binary assets is the spoken dialogue: pre-generated ElevenLabs
voice clips in `public/audio/`, produced by `npm run generate-voices` and played
as plain MP3s. The game falls back to the browser's own speech synthesis
wherever a clip is missing, so it works perfectly well with none of them — see
[AI voice generation](#ai-voice-generation).

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
  dialogue/                the voice system (see "AI voice generation" below)
    speech.js              how a written line becomes a spoken one, and its id
    characters.js          who speaks: 19 roles across the three tracks
    voices.js              ← character → ElevenLabs voice id. The file you edit
    emotions.js            emotional intent → performance tag + settings
    common.js              praise, nudges, connectors, celebration lines
    doctor.js vet.js toyDoctor.js   how each track is performed
    collect.js             finds every line the game can speak (Node only)
    hash.js                the content hash both the game and the script use
  styles/                  base.css, ui.css, screens.css, case.css
public/
  audio/                   generated voice clips + manifest (see its README)
tools/
  validate-cases.mjs       data checks for patient cases
  validate-voices.mjs      offline checks on the voice registry and manifest
  voice-selftest.mjs       replays every spoken line through the real player
  generate-voices.mjs      dialogue → ElevenLabs → public/audio/
  list-voices.mjs          your ElevenLabs voices, ready to paste
  build-standalone.mjs     bundles everything into dist/
```

---

## Development

There is nothing to build and nothing to install. Edit a file, refresh the
page.

```bash
npm start                          # serve the source on :8000
npm test                           # case data + voice registry + voice playback
npm run build                      # rebuild dist/ (single-file version)
```

(There is still nothing to install — `package.json` has no dependencies at all,
and every script is plain Node. The bare commands work too:
`python3 -m http.server 8000`, `node tools/validate-cases.mjs`,
`node tools/build-standalone.mjs`.)

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

## AI voice generation

The game reads itself out loud — every prompt, every patient's line, every fun
fact — because most of the children playing it cannot read yet. Those lines are
recorded ahead of time with **ElevenLabs** and shipped as ordinary MP3s.

**The game never calls ElevenLabs.** It plays files. The API key is used by one
script, on your machine, and is never part of anything the browser loads.

```bash
cp .env.example .env                 # then paste your ELEVENLABS_API_KEY
npm run voices:list                  # see your voices, choose the cast
npm run generate-voices:dry          # what would be generated — costs nothing
npm run generate-voices              # generate it
```

### How it works

```
src/data/cases/*.js      the dialogue, where it has always lived
src/dialogue/common.js   praise, nudges, the celebration screen
        │
        ├─ src/dialogue/collect.js      every line, who says it, how
        ├─ src/dialogue/characters.js   19 characters across three tracks
        ├─ src/dialogue/voices.js       character → ElevenLabs voice id
        ▼
tools/generate-voices.mjs               only what is new or has changed
        ▼
public/audio/**.mp3 + manifest.json + voice-index.json
        ▼
src/core/voice.js                       plays the clip, or falls back to the
                                        browser's own voice if there isn't one
```

The game finds a clip by hashing the line it is about to speak together with
the track and the character. The generator hashed it the same way, with the
same functions (`src/dialogue/speech.js`), so nothing has to be registered or
kept in sync by hand — and `npm run test:voices` replays all 1,800-odd spoken
lines through the real player to prove it.

### Three tracks, three casts

The Doctor's ward is warm, calm and reassuring; the Vet's clinic is cheerful
and energetic and softens whenever an animal is frightened; the Toy Workshop is
whimsical and storybook-gentle — playful, never zany. They share no voices.
Each line is performed with an emotion worked out from where it appears: a
patient with `mood: 'sad'` is spoken `[gently]`, praise is `[cheerfully]`, a
question is `[encouraging]`.

### Editing dialogue afterwards

Change a line and re-run `npm run generate-voices`: every clip carries a
fingerprint of the exact text, voice, model and settings it was made from, so
turning *"Great job helping the puppy!"* into *"Great job! The puppy is feeling
much better!"* regenerates one file and leaves the other two thousand alone.

### What still needs you

Every character ships with a **stock placeholder voice** so the pipeline runs
before you have chosen anything — which means the whole cast currently sounds
like four people doing nineteen parts. Picking the real voices is the step that
makes it good: `npm run voices:check` lists what is still on a placeholder.

**Full documentation: [docs/VOICES.md](docs/VOICES.md)** — the API key, choosing
voices, the id scheme, adding a character, models and expression, and what
should and should not be committed.

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
* Nothing depends on reading: icons, colour, animation and spoken dialogue
  carry the meaning. Every line on screen is read out loud.
* Sound is off-by-default quiet, synthesised at low gain, and there is a mute
  button on every single screen. Effects duck under spoken dialogue, and the
  voice has its own separate toggle.
* `prefers-reduced-motion` drops the ambient animation.
* Back and Home are always visible — a child cannot get stuck on a screen.
