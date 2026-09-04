#!/usr/bin/env node
/**
 * Case data validator.
 *
 *   node tools/validate-cases.mjs
 *
 * Catches the mistakes that are easy to make when authoring a new patient:
 * a tool id that does not exist, a hotspot the species does not have, a
 * `choose` step with no correct answer or no Little-Helper-friendly
 * distractor, an `order` step whose urgencies do not run 1..n, and so on.
 * Exits non-zero when anything is wrong, so it drops straight into CI.
 */
import { TRACKS } from '../src/data/cases/index.js';
import { TOOLS } from '../src/data/tools.js';
import { ROOMS } from '../src/data/rooms.js';
import { SHOP_ITEMS } from '../src/data/shop.js';
import { SPECIES } from '../src/ui/creature.js';
import { TOYS, isToy, toySpots } from '../src/ui/toy.js';

const HUMAN_SPOTS = ['head','eye','ear','mouth','chest','tummy','arm','hand','back','knee','foot'];
const ANIMAL_SPOTS = ['head','eye','ear','mouth','nose','chest','tummy','back','paw','leg','wing','tail','fur'];
const STEP_TYPES = ['talk','empathy','tool','choose','find','order','scan','show'];
const SHOW_ARTS = ['heart','lungs','germs','cells','bones','eye','teeth','wing','flea','stitches'];
const SCAN_ARTS = ['arm-break','leg-crack','wing-crack','chest-infection','tummy-duck','toy-inside','robot-inside','bacteria','mites','blood'];

const problems = [];
const ids = new Set();

for (const list of Object.values(TRACKS).map((t) => t.cases)) {
  list.forEach((c, i) => {
    const at = `${c.id}`;
    if (ids.has(c.id)) problems.push(`${at}: duplicate id`);
    ids.add(c.id);
    if (c.level !== i + 1) problems.push(`${at}: level ${c.level} but index ${i}`);
    if (!ROOMS[c.room]) problems.push(`${at}: unknown room "${c.room}"`);
    const kinds = c.patientPool ? c.patientPool.map(p => p.kind) : [c.patient.kind];
    kinds.forEach(k => {
      if (k !== 'human' && !SPECIES[k] && !TOYS[k]) problems.push(`${at}: unknown species "${k}"`);
    });
    // A toy car has no paw and an action figure has no wheel, so each toy
    // declares the hotspots its own body plan actually has.
    const spots = kinds[0] === 'human' ? HUMAN_SPOTS
      : isToy(kinds[0]) ? toySpots(kinds[0])
      : ANIMAL_SPOTS;
    (c.unlocks?.tools || []).forEach(t => { if (!TOOLS[t]) problems.push(`${at}: unlocks unknown tool "${t}"`); });
    (c.unlocks?.rooms || []).forEach(r => { if (!ROOMS[r]) problems.push(`${at}: unlocks unknown room "${r}"`); });

    c.steps.forEach((s, j) => {
      const w = `${at} step ${j} (${s.type})`;
      if (!STEP_TYPES.includes(s.type)) problems.push(`${w}: unknown step type`);
      if (s.tool && !TOOLS[s.tool]) problems.push(`${w}: unknown tool "${s.tool}"`);
      if (s.type === 'tool' || s.type === 'scan') {
        (s.decoys || []).forEach(d => { if (!TOOLS[d]) problems.push(`${w}: unknown decoy tool "${d}"`); });
      }
      if (s.type === 'tool' && !spots.includes(s.target)) problems.push(`${w}: target "${s.target}" is not a hotspot on a ${kinds[0]} (has: ${spots.join(' ')})`);
      if (s.type === 'scan' && s.target && !spots.includes(s.target)) problems.push(`${w}: scan target "${s.target}" invalid`);
      if (s.type === 'choose' || s.type === 'scan') {
        const opts = s.options || s.findings || [];
        if (!opts.length) problems.push(`${w}: no options`);
        if (!opts.some(o => o.correct)) problems.push(`${w}: no correct option`);
        if (opts.filter(o => o.correct).length > 1) problems.push(`${w}: more than one correct option`);
        if (opts.length > 1 && !opts.filter(o => !o.correct).some(o => o.easy)) {
          problems.push(`${w}: no option flagged easy: for Little Helper mode`);
        }
      }
      if (s.type === 'find' && !(s.targets || []).length) problems.push(`${w}: no targets`);
      if (s.type === 'order') {
        const u = (s.items || []).map(i => i.urgency).sort();
        if (u.join() !== u.map((_, k) => k + 1).join()) problems.push(`${w}: urgencies must be 1..n, got ${u}`);
      }
      if (s.type === 'show' && !SHOW_ARTS.includes(s.art)) problems.push(`${w}: unknown art "${s.art}"`);
      if (s.type === 'scan' && !SCAN_ARTS.includes(s.revealArt)) problems.push(`${w}: unknown revealArt "${s.revealArt}"`);
      if (s.type === 'empathy' && !(s.options || []).length) problems.push(`${w}: no empathy options`);
    });
  });
}

SHOP_ITEMS.forEach(i => {
  if (i.unlocksRoom && !ROOMS[i.unlocksRoom]) problems.push(`shop ${i.id}: unknown room`);
  if (i.place && !ROOMS[i.place.room]) problems.push(`shop ${i.id}: places into unknown room`);
});

console.log(problems.length ? problems.join('\n') : '✅ all case data valid');
const counts = Object.values(TRACKS).map((t) => `${t.cases.length} ${t.id}`).join(' + ');
console.log(`\n${counts} cases, ${Object.keys(TOOLS).length} tools, ${Object.keys(ROOMS).length} rooms, ${SHOP_ITEMS.length} shop items`);

if (problems.length) process.exit(1);
