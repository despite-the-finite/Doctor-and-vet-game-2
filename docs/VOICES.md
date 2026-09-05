# AI voice generation

Little Heroes Hospital is played by children who mostly cannot read, so the
game reads itself out loud: prompts, patients' lines, the fun facts, the
answers to every question. This document is everything about how that voice
gets made.

The one-sentence version: **`npm run generate-voices` turns the game's dialogue
into MP3s with ElevenLabs, and the game plays those files. The game never calls
ElevenLabs, and never sees your API key.**

---

## 1. How it works

```
   src/data/cases/*.js          the dialogue, exactly where it always lived
   src/dialogue/common.js       praise, nudges, the celebration screen
              │
              ▼
   src/dialogue/collect.js      collects every line the game can speak,
                                works out who says it and how it is performed
              │
              ▼
   tools/generate-voices.mjs    asks ElevenLabs for the ones that are new or
                                have changed since last time
              │
              ▼
   public/audio/…               ~2,000 MP3s + manifest.json + voice-index.json
              │
              ▼
   src/core/voice.js            the game hashes the line it is about to speak
                                and plays the matching file — or falls back to
                                the browser's own voice if there is not one
```

The trick that holds it together is in `src/dialogue/speech.js`. Both sides —
the generator and the game — put a line through the same three steps:

1. **`keyText()`** resolves `{name}`, `{species}` and `{where}` from the case's
   patient, and turns `{hero}` into the word "Doctor" (see §9).
2. **`spokenText()`** removes emoji and asterisked stage directions, which read
   terribly out loud.
3. **`lookupKey()`** lowercases it, drops punctuation and hashes it together
   with the track and the character.

That hash is the filename lookup. Nothing has to be registered, numbered or
kept in sync by hand: if the game is about to say a sentence that was recorded,
it finds the recording.

`npm run test:voices` proves it, by replaying every line in all 50 cases
through the real `voice.js` and checking each one resolves.

---

## 2. Where dialogue lives

| | |
|---|---|
| `src/data/cases/doctor.js` | the 20 Doctor cases — unchanged, still pure data |
| `src/data/cases/vet.js` | the 20 Vet cases |
| `src/data/cases/toy.js` | the 10 Toy Doctor cases |
| `src/dialogue/common.js` | praise, nudges, connectors, the results screen, the shop and level-list messages |
| `src/dialogue/doctor.js`, `vet.js`, `toyDoctor.js` | how each track is *performed* — the emotion defaults |
| `src/dialogue/characters.js` | who speaks: `who: 'nurse'` + the patient on stage → a character id |
| `src/dialogue/voices.js` | **character → ElevenLabs voice id.** The file you edit |
| `src/dialogue/emotions.js` | emotional intent → performance tag + settings nudge |
| `src/dialogue/collect.js` | the walker that finds every line (Node only) |

Case dialogue was already centralised as data, so it stayed exactly where it
is — the voice system reads the same files the game does, which means writers
carry on writing cases and never touch anything in `src/dialogue/`. What *was*
scattered (praise phrases, decoy quips, scan prompts, toast messages) moved
into `src/dialogue/common.js`; the modules that used to own those strings
import them from there now.

---

## 3. Dialogue ids

Every line has a stable id, which is also its filename:

```
doctor.doc-01.s04.tool.readout        a tool's readout in Doctor case 1, step 4
doctor.doc-01.s03.empathy.say.02      the second thing you can say, step 3
vet.vet-08.fox.s02.talk.patient       a pool case: one per possible patient
toy.toy-03.outro                      the last line of Toy case 3
vet.common.praise.03                  a shared line, in the Vet's voice
doctor.common.wrongTool.stethoscope   built from the tool catalogue
```

`mode . case . step . what` — readable, sortable, and it maps straight onto
the folder layout:

```
public/audio/doctor/doc-01/s04-tool-readout.mp3
public/audio/vet/common/praise-03.mp3
```

---

## 4. The characters

Nineteen roles across three tracks, in `src/dialogue/characters.js`:

| Doctor | Vet | Toy Doctor |
|---|---|---|
| `doctorNarrator` | `vetNarrator` | `toyNarrator` |
| `doctorNurse` | `vetNurse` | `toyNurse` |
| `doctorHero` | `vetHero` | `toyHero` |
| `doctorPatientChild` | `vetPatientPet` | `toyPlush` |
| `doctorParent` | `vetPatientWild` | `toyFigure` |
| | `vetOwner` | `toyRobot` |
| | | `toyDoll` |
| | | `toyVehicle` |

The three tracks deliberately share **no** voices, and each has its own house
sound (`MODE_TONE` in `src/dialogue/voices.js`):

* **Doctor** — warm, calm, unhurried. Nothing on this ward is frightening.
* **Vet** — cheerful and energetic, softening whenever an animal is scared.
* **Toy Doctor** — whimsical and storybook-gentle. Playful, never zany: squeaky
  joke voices are exhausting and hard for a four-year-old to follow.

Which character speaks is worked out from the case, not written down twice:
`who: 'patient'` in a Vet case about a fox is `vetPatientWild`; in a Toy case
about a racing car it is `toyVehicle`.

---

## 5. Getting an API key

1. Sign in at <https://elevenlabs.io> → your profile → **API keys** → create one.
2. In this repository:

   ```bash
   cp .env.example .env
   ```

3. Open `.env` and paste the key after `ELEVENLABS_API_KEY=`.

`.env` is git-ignored. The key is read by `tools/generate-voices.mjs` and
`tools/list-voices.mjs` and by nothing else — there is no code path from the
browser to ElevenLabs, and `npm run validate:voices` fails the build if the
string `ELEVENLABS_API_KEY` ever appears anywhere under `src/`.

---

## 6. Choosing voices

Every character ships with a **stock placeholder** so the pipeline runs before
you have decided anything. Four ElevenLabs stock voices covering nineteen parts
sounds like exactly what it is, so this is the step that turns a working
pipeline into a game worth listening to.

```bash
npm run voices:list                 # every voice on your account, with ids
npm run voices:list -- --search kid # filter
npm run voices:check                # what is still on a placeholder
```

Then, in `src/dialogue/voices.js`:

```js
doctorPatientChild: {
  voiceId: 'PASTE_THE_ID_HERE', voiceName: 'Freya',
  settings: { stability: 0.4, style: 0.36, speed: 1.0 },
  direction: 'A child of six or seven. Chatty, wriggly, sometimes nervous.',
},
```

Delete `placeholder: true` from the ones you have chosen — that is all the flag
does, it just stops the reports nagging about them.

Each entry already carries a `direction` describing what to listen for; paste
it into the ElevenLabs voice-library search. Add the voice to your account
there, and it shows up in `npm run voices:list`.

**Auditioning quickly:** generate one character at a time.

```bash
npm run generate-voices -- --character toyRobot --case toy-05 --yes
```

---

## 7. Generating

```bash
npm run generate-voices              # everything missing or changed
npm run generate-voices:doctor       # one track
npm run generate-voices:vet
npm run generate-voices:toy
npm run generate-voices:dry          # what it WOULD do; costs nothing
```

Useful flags (after `--`):

| flag | what it does |
|---|---|
| `--dry-run`, `-n` | report only, no API calls |
| `--case doc-01` | one case |
| `--character toyRobot` | one voice |
| `--limit 20` | stop after 20 clips — a good first run |
| `--force` | regenerate even when nothing changed |
| `--prune` | delete clips nothing refers to any more |
| `--model eleven_multilingual_v2` | a different model (see §8) |
| `--yes`, `-y` | skip the confirmation (required when not in a terminal) |

It asks before spending anything, and tells you exactly how many clips and
characters that is. The whole game is about 2,000 lines / 100,000 characters.

**Nothing is regenerated unnecessarily.** Each clip records a fingerprint of
the text, voice id, model, output format, performance tag and voice settings it
was made from. Change any of those and that clip — and only that clip — is
made again. So editing

```js
outro: { text: 'Great job helping the puppy!' }
```

into

```js
outro: { text: 'Great job! The puppy is feeling much better!' }
```

and re-running regenerates one file, in about a second.

---

## 8. Models and expression

Default: **`eleven_v3`**, ElevenLabs' most expressive model. It understands
inline performance tags, so `src/dialogue/emotions.js` puts one at the front of
each line based on where it appears in the game:

```
[gently]      I did not mean to. I was only being cuddled.
[excited]     Look at that!
[encouraging] Have a good close look at that paw.
[cheerfully]  Perfect!
```

A patient with `mood: 'sad'` is spoken gently, a `choose` prompt is
encouraging, praise is celebratory, a fun fact is warm and slower. Each emotion
also nudges the voice settings a little — less stability means more emotional
range, more style means a bigger performance. The nudges are deliberately
small: this is a game for four-year-olds, and an over-acted line is harder to
follow than a flat one.

Other models (`--model`): `eleven_multilingual_v2` (steady, no tags),
`eleven_turbo_v2_5`, `eleven_flash_v2_5` (cheaper and faster, less expressive).
Tags are only added for models that understand them — on the others they would
be read out as words, so the generator leaves them off.

---

## 9. What the audio cannot say

Two things are impossible to record ahead of time, and the game handles both:

* **The player's name.** `{hero}` is whatever the child typed in the character
  creator. Every recording says **"Doctor"** instead — which is what the game
  calls the player everywhere else. The written line on screen still uses their
  real name.
* **Numbers that change every run.** The results screen shows "+7 Hero Stars";
  the spoken version is "Great job, Doctor! … Look at all those stars!". The
  numbers are on screen, in big pills, animating.

Anything else with no recording — a case you have just written, a clip that
failed to generate, a line with a room name in it — is spoken by the browser's
built-in speech synthesis exactly as it was before. Nothing crashes and nothing
goes silent.

---

## 10. Adding a new voice

1. **A new character**, e.g. a Vet receptionist:

   ```js
   // src/dialogue/characters.js
   vetReceptionist: {
     id: 'vetReceptionist', mode: 'vet', role: 'grownup',
     label: 'Vet — receptionist',
     description: 'Front desk. Brisk, funny, knows every animal by name.',
   },
   ```

   Route `who` to it in `characterFor()` (there is already a `case 'owner'`
   branch to copy), give it a voice in `src/dialogue/voices.js`, then write
   `{ type: 'talk', who: 'receptionist', text: '…' }` in a case and run
   `npm run generate-voices`.

2. **A new track** — add it to `MODES` and `CHARACTERS` in
   `src/dialogue/characters.js`, add a `src/dialogue/<track>.js` performance
   config, register it in `DIALOGUE_MODES` in `src/dialogue/collect.js`, and
   give its characters voices. The generator picks it up with no other changes.

3. **A new case** — write it as data, exactly as before
   (`src/data/cases/README.md`), then `npm run generate-voices`. Only the new
   lines are generated.

Run `npm test` afterwards: it validates the case data, the voice registry, and
replays every line through the real playback code.

---

## 11. What to commit

| commit | do not commit |
|---|---|
| `src/dialogue/**` — including the voice ids, which are public identifiers | `.env` — **ever** |
| `public/audio/manifest.json` and `voice-index.json` | any file with an API key in it |
| `public/audio/**/*.mp3` — see the note in `public/audio/README.md` | |

Voice ids are not secrets; they identify a voice, they do not authorise
anything. The API key is the secret, and it lives only in `.env`.

---

## 12. Playback behaviour

Built into `src/core/voice.js` and `src/core/voicePlayback.js`:

* Lines **queue** rather than interrupt, so a step that says three things in a
  row is heard in order.
* The **same line never plays over itself** — a repeat is dropped while the
  first is still speaking.
* Changing screen **stops** whatever was being said (`core/router.js`), so a
  half-finished line never follows a child out of a case.
* **Replaying a level replays the audio**, from a small in-memory pool of
  `<audio>` elements, so a second run starts instantly.
* Sound effects **duck** to about a third of their volume while anyone is
  speaking (`core/audio.js`), so bleeps never bury the words.
* The existing **voice toggle** (the microphone button on every screen) still
  turns all of it off, and is still separate from the sound toggle.
* If a clip 404s, fails to decode, or the browser refuses to autoplay it, the
  line is spoken by the browser instead. The game does not care which happened.
