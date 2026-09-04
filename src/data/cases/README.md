# Authoring patient cases

Every level in Little Heroes Hospital is **data**, not code. A case is a plain
object with a list of steps; `src/engine/caseRunner.js` plays them in order.
To add a patient you add an object to `doctor.js`, `vet.js` or `toy.js` (or a
new track file registered in `index.js`) — you never touch the engine.

## Case shape

```js
{
  id: 'doc-01',            // stable, stored in the save file — never rename
  career: 'doctor',        // 'doctor' | 'vet' | 'toy'
  level: 1,                // position in the track (1-based, no gaps)
  title: 'The Checkup',
  tagline: 'Maya is here to see how much she has grown.',
  icon: '🧒',
  room: 'doctor',          // room skin used as the background
  teaches: ['Heartbeat', 'Temperature'],   // shown on the level card
  patient: {
    kind: 'human',         // 'human' or any species id from ui/creature.js
    name: 'Maya',
    look: { skin: 'skin3', hair: 'braids', ... },  // renderer options
  },
  reward: { stars: 3, coins: 60 },
  unlocks: { tools: ['scale', 'ruler'], rooms: [] },
  outro: { text: 'I grew THREE centimetres!', mood: 'proud', react: 'happy' },
  steps: [ ... ],
}
```

Any `{name}` token inside step text is replaced with the patient's name, and
`{hero}` with the player's name.

## Step types

| type | what the child does | key fields |
|---|---|---|
| `talk` | taps to read/hear a line | `who`, `text`, `translate`, `mood`, `sfx` |
| `empathy` | picks a kind thing to say | `prompt`, `options[{icon,label,reply}]` |
| `tool` | drags a tool onto the patient | `tool`, `target`, `mode`, `readout`, `reaction` |
| `choose` | picks an answer | `prompt`, `options[{icon,label,correct}]`, `nudge` |
| `find` | taps to discover hidden things | `targets[{x,y,icon}]`, `decoys` |
| `order` | taps patients in priority order | `items[{icon,label,urgency}]` |
| `scan` | lines up a machine and fires it | `mode:'xray'\|'micro'`, `revealArt`, `findings` |
| `show` | watches a small explainer animation | `art`, `title`, `text` |

### `tool` modes
* `drop` (default) — drag it onto the glowing spot
* `hold` — drag it there, then keep holding (`holdMs`)
* `rub` — drag it there, then scrub back and forth (`rubs`)

`target` is a hotspot name defined by the character renderer:
humans → `head eye ear mouth chest tummy arm hand back knee foot`
animals *and toys* → `head eye ear mouth nose chest tummy back paw leg wing tail fur`

Toys are their own thing. `ui/toy.js` holds every toy the game knows about and
routes each to one of five body plans — **plush** (the parametric creature with
`toy: true`, which swaps in sewn-on button eyes, a seam and a patch),
**figure**, **robot**, **doll** and **car**. A toy car has no `paw` and an
action figure has no `wheel`, so each entry in `TOYS` declares the hotspots its
body plan actually has, and the validator checks a case's `target` against that
list rather than one shared vocabulary:

| family | hotspots |
|---|---|
| `plush` | `head eye ear mouth nose chest tummy back paw leg wing tail fur` |
| `figure` | `head eye mouth chest tummy back arm hand leg foot joint` |
| `robot` | `head eye mouth chest panel back arm hand leg foot antenna` |
| `doll` | `head eye mouth hair chest tummy back arm hand leg foot` |
| `car` | `roof eye mouth chest back wheel light` |

## Difficulty

The engine adapts automatically, so cases are authored once:

* **Little Helper** — `choose` steps are trimmed to two options, the right tool
  glows, arrow hints appear straight away.
* **Medical Explorer** — every option is offered, `detail` medical vocabulary
  is shown, hints wait until the child has tried twice.

Mark an option `easy: true` to make it the distractor kept in Little Helper
mode; otherwise the engine keeps the first one it finds.

## Rewards

`stars` on a step is added when that step is solved. `reward` on the case is
the completion bonus. Nothing is ever deducted for a wrong guess — the engine
shows an encouraging nudge instead.
