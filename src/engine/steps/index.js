/**
 * Step-type registry.
 *
 * Adding a new interaction = write a module that takes (step, ctx), call
 * `ctx.next()` when it is finished, optionally return a cleanup function,
 * then add one line here.
 */
import { runTalk } from './talk.js';
import { runEmpathy } from './empathy.js';
import { runTool } from './tool.js';
import { runChoose } from './choose.js';
import { runFind } from './find.js';
import { runOrder } from './order.js';
import { runScan } from './scan.js';
import { runShow } from './show.js';

export const STEP_RUNNERS = {
  talk: runTalk,
  empathy: runEmpathy,
  tool: runTool,
  choose: runChoose,
  find: runFind,
  order: runOrder,
  scan: runScan,
  show: runShow,
};

export const STEP_TYPES = Object.keys(STEP_RUNNERS);
