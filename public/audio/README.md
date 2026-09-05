# public/audio

Generated voice-over. **Nothing in here is written by hand** — it is all
produced by:

```bash
npm run generate-voices
```

```
public/audio/
  manifest.json        every line: id, character, voice, text, hash, file
  voice-index.json     the tiny lookup the game fetches at start-up
  doctor/              one folder per case, plus common/
  vet/
  toy-doctor/
```

`voice-index.json` is committed empty so a fresh clone has nothing to 404 on;
the game falls back to the browser's own speech until you generate real audio.

## Should the MP3s be committed?

**Yes, if you host on GitHub Pages** (which this project does) — Pages serves
whatever is in the repository, and there is no build step to fetch assets from
anywhere else. A full generation is roughly 2,000 clips.

**No, if you host somewhere with a proper asset pipeline** — in that case add

```gitignore
public/audio/**/*.mp3
```

to `.gitignore`, keep `manifest.json` and `voice-index.json` committed (they are
what tells the next person what to regenerate), and upload the clips as part of
your deploy.

Either way: `manifest.json` and `voice-index.json` should always be committed.
See [docs/VOICES.md](../../docs/VOICES.md).
