/**
 * Equipment catalogue.
 *
 * Tools are pure data. A case references a tool by id; the case runner looks
 * it up here for the icon, colour, the noise it makes and the little readout
 * it shows after use. Adding a tool = adding one entry (plus unlocking it
 * from a case's `unlocks` list).
 *
 *   id       stable key, used in save data — never rename an existing one
 *   name     shown to the player
 *   icon     emoji sticker (no image assets to load or break)
 *   tint     CSS colour for the sticker background
 *   blurb    one child-friendly sentence for the Doctor Bag
 *   demo     what the animation in the Doctor Bag is showing
 *   sound    key from core/audio.js sfx
 *   readout  optional { kind, label } describing the little result panel
 */

export const TOOLS = {
  stethoscope: {
    id: 'stethoscope', name: 'Stethoscope', icon: '🩺', tint: '#39b5f0',
    blurb: 'Listen to a heart go thump-thump and lungs go whoosh.',
    demo: 'Hold it on a chest and the heartbeat appears!',
    sound: 'heartbeat', readout: { kind: 'heartbeat', label: 'Heartbeat' },
  },
  thermometer: {
    id: 'thermometer', name: 'Thermometer', icon: '🌡️', tint: '#ff7a6b',
    blurb: 'Checks if someone is too warm. Warm can mean poorly!',
    demo: 'Pop it under an arm and watch the number climb.',
    sound: 'squeak', readout: { kind: 'number', label: 'Temperature' },
  },
  scale: {
    id: 'scale', name: 'Weighing Scale', icon: '⚖️', tint: '#a97bf0',
    blurb: 'How heavy is my patient today? Hop on and find out!',
    demo: 'The needle spins and stops on a number.',
    sound: 'drop', readout: { kind: 'number', label: 'Weight' },
  },
  ruler: {
    id: 'ruler', name: 'Height Chart', icon: '📏', tint: '#3fd0a6',
    blurb: 'Stand up tall! We measure how much you have grown.',
    demo: 'A little bar slides down onto the top of a head.',
    sound: 'select', readout: { kind: 'number', label: 'Height' },
  },
  wipe: {
    id: 'wipe', name: 'Cleaning Wipe', icon: '🧼', tint: '#39b5f0',
    blurb: 'Washes away dirt and germs. Cleaning first is the golden rule.',
    demo: 'Rub, rub, rub — the germ bubbles pop away.',
    sound: 'whoosh',
  },
  antiseptic: {
    id: 'antiseptic', name: 'Antiseptic', icon: '🧴', tint: '#3fd0a6',
    blurb: 'A cool spray that stops germs from having a party.',
    demo: 'Psshht! Sparkles chase the germs off.',
    sound: 'whoosh',
  },
  bandage: {
    id: 'bandage', name: 'Bandages', icon: '🩹', tint: '#ffc844',
    blurb: 'A soft cover that keeps a sore spot safe while it mends.',
    demo: 'Smooth it on and it sticks with a happy sparkle.',
    sound: 'good',
  },
  penlight: {
    id: 'penlight', name: 'Pen Light', icon: '🔦', tint: '#ffc844',
    blurb: 'A tiny torch for peeking into eyes, ears and throats.',
    demo: 'Click! A beam lights up the dark corners.',
    sound: 'select', readout: { kind: 'text', label: 'What I see' },
  },
  otoscope: {
    id: 'otoscope', name: 'Otoscope', icon: '👂', tint: '#ff9ec4',
    blurb: 'Looks right inside an ear. Ears are surprisingly curly!',
    demo: 'Peek inside and the ear tunnel appears.',
    sound: 'select', readout: { kind: 'text', label: 'Inside the ear' },
  },
  magnifier: {
    id: 'magnifier', name: 'Magnifying Glass', icon: '🔍', tint: '#a97bf0',
    blurb: 'Makes tiny things look BIG. Perfect for detective work.',
    demo: 'Slide it across and hidden things pop into view.',
    sound: 'select', readout: { kind: 'text', label: 'Found it' },
  },
  oximeter: {
    id: 'oximeter', name: 'Pulse Oximeter', icon: '💓', tint: '#ff7a6b',
    blurb: 'A gentle clip that counts heartbeats and measures oxygen.',
    demo: 'Clip it on a finger or paw — numbers dance on screen.',
    sound: 'heartbeat', readout: { kind: 'number', label: 'Oxygen' },
  },
  xray: {
    id: 'xray', name: 'X-Ray Machine', icon: '🩻', tint: '#7f4fd0',
    blurb: 'Takes a photograph of the bones hiding inside you.',
    demo: 'Whirr… flash… a glowing skeleton picture appears.',
    sound: 'scan', readout: { kind: 'image', label: 'X-ray picture' },
  },
  microscope: {
    id: 'microscope', name: 'Microscope', icon: '🔬', tint: '#3fd0a6',
    blurb: 'There is a whole tiny world hiding inside a single drop!',
    demo: 'Twist the dial until the blurry blobs turn sharp.',
    sound: 'scan', readout: { kind: 'image', label: 'Under the lens' },
  },
  oxygen: {
    id: 'oxygen', name: 'Oxygen Mask', icon: '🫁', tint: '#39b5f0',
    blurb: 'Extra fresh air for lungs that are working hard.',
    demo: 'Soft mist flows in and breathing gets easy again.',
    sound: 'breath',
  },
  eyechart: {
    id: 'eyechart', name: 'Shape Eye Chart', icon: '👁️', tint: '#ffc844',
    blurb: 'Point at the shapes you can see. No reading needed!',
    demo: 'Big shapes at the top, teeny ones at the bottom.',
    sound: 'select', readout: { kind: 'text', label: 'Eye test' },
  },
  ophthalmoscope: {
    id: 'ophthalmoscope', name: 'Ophthalmoscope', icon: '🔭', tint: '#a97bf0',
    blurb: 'A special lens that looks at the back of an eye.',
    demo: 'Look through it and see tiny rivers of blood vessels.',
    sound: 'select', readout: { kind: 'text', label: 'Inside the eye' },
  },
  cast: {
    id: 'cast', name: 'Plaster Cast', icon: '🦴', tint: '#ffffff',
    blurb: 'A strong sleeve that holds a poorly bone still while it heals.',
    demo: 'Wrap, wrap, wrap — then everyone signs it!',
    sound: 'good',
  },
  water: {
    id: 'water', name: 'Water Cup', icon: '🥤', tint: '#39b5f0',
    blurb: 'Sipping water helps a poorly body feel better.',
    demo: 'Glug glug — the cheeks go rosy again.',
    sound: 'squeak',
  },
  teddy: {
    id: 'teddy', name: 'Comfort Teddy', icon: '🧸', tint: '#ff9ec4',
    blurb: 'Not medicine — but a brave patient deserves a cuddle.',
    demo: 'Hand it over and watch a worried face turn happy.',
    sound: 'good',
  },
  comb: {
    id: 'comb', name: 'Flea Comb', icon: '🪮', tint: '#3fd0a6',
    blurb: 'Combs itchy little visitors right out of a fluffy coat.',
    demo: 'Comb through the fur and out they hop.',
    sound: 'whoosh',
  },
  treat: {
    id: 'treat', name: 'Treat Pouch', icon: '🦴', tint: '#ffc844',
    blurb: 'A tasty reward makes a nervous animal trust you.',
    demo: 'Offer a treat — ears go up, tail goes wag.',
    sound: 'good',
  },
  wingwrap: {
    id: 'wingwrap', name: 'Wing Wrap', icon: '🪽', tint: '#ff9ec4',
    blurb: 'A soft sling that keeps a poorly wing tucked and cosy.',
    demo: 'Fold the wing gently and wrap it up.',
    sound: 'good',
  },
  gloves: {
    id: 'gloves', name: 'Safety Gloves', icon: '🧤', tint: '#a97bf0',
    blurb: 'Wild animals are not pets — gloves keep everyone safe.',
    demo: 'Snap them on before meeting a wild patient.',
    sound: 'select',
  },
  monitor: {
    id: 'monitor', name: 'Heart Monitor', icon: '❤️', tint: '#ff7a6b',
    blurb: 'Draws the heartbeat as a wiggly line you can watch.',
    demo: 'Beep… beep… the line hops across the screen.',
    sound: 'heartbeat', readout: { kind: 'ecg', label: 'Heart rhythm' },
  },

  /* ---------------------------------------------------- the toy repair kit
     Toys are mended, not medicated. These belong to the Toy Doctor track and
     are unlocked by it, but the bag makes no distinction — a child who has
     earned the needle can see it next to the stethoscope. */
  needle: {
    id: 'needle', name: 'Needle and Thread', icon: '🪡', tint: '#ff9ec4',
    blurb: 'Sews a split seam shut with tiny neat stitches.',
    demo: 'In, out, in, out — the gap closes up.',
    sound: 'select', readout: { kind: 'text', label: 'The mend' },
  },
  stuffing: {
    id: 'stuffing', name: 'Soft Stuffing', icon: '🧶', tint: '#a97bf0',
    blurb: 'Fluffy filling for a toy that has gone flat and floppy.',
    demo: 'Tuck it in and the squashy bit puffs back up.',
    sound: 'good',
  },
  button: {
    id: 'button', name: 'Button Box', icon: '🔘', tint: '#39b5f0',
    blurb: 'Spare eyes and noses. Never quite matching, always loved.',
    demo: 'Choose one, sew it on, and a face is whole again.',
    sound: 'select',
  },
  ribbon: {
    id: 'ribbon', name: 'Ribbon Roll', icon: '🎀', tint: '#ffc844',
    blurb: 'A bow to finish a mend — or a sling for a floppy arm.',
    demo: 'Loop, loop, pull — and a very smart bow appears.',
    sound: 'good',
  },
  washtub: {
    id: 'washtub', name: 'Bubble Bath', icon: '🫧', tint: '#39b5f0',
    blurb: 'A warm soapy soak for a toy that has been very well loved.',
    demo: 'Swish it about and years of adventures wash away.',
    sound: 'whoosh',
  },
  fluffbrush: {
    id: 'fluffbrush', name: 'Fluff Brush', icon: '🪥', tint: '#3fd0a6',
    blurb: 'Teases flattened fur back into a proper fluff — and doll hair too.',
    demo: 'Brush, brush — squashed fur springs up again.',
    sound: 'whoosh',
  },
  screwdriver: {
    id: 'screwdriver', name: 'Little Screwdriver', icon: '🪛', tint: '#8fa6c4',
    blurb: 'Opens a battery hatch, and tightens a joint that has gone wobbly.',
    demo: 'Half a turn one way opens it, half a turn back closes it.',
    sound: 'select', readout: { kind: 'text', label: 'Inside the hatch' },
  },
  battery: {
    id: 'battery', name: 'Fresh Batteries', icon: '🔋', tint: '#5fe3c0',
    blurb: 'Most toys that have "stopped working" have simply run out.',
    demo: 'Old ones out, new ones in the right way round — and the lights come on.',
    sound: 'good', readout: { kind: 'text', label: 'Power' },
  },
  oil: {
    id: 'oil', name: 'Oil Can', icon: '🛢️', tint: '#ffc844',
    blurb: 'One drop frees a stiff joint or a wheel that has stopped spinning.',
    demo: 'A single drop, a wiggle, and it turns freely again.',
    sound: 'whoosh',
  },
};

export const TOOL_ORDER = Object.keys(TOOLS);

export function getTool(id) {
  const tool = TOOLS[id];
  if (!tool) console.warn(`[tools] unknown tool "${id}"`);
  return tool;
}
