#!/usr/bin/env node
/**
 * Build a single-file version of the game.
 *
 *   node tools/build-standalone.mjs
 *
 * Produces two files in dist/:
 *
 *   little-heroes-hospital.html   a complete page you can double-click, email,
 *                                 or drop on any static host. No server needed.
 *   artifact.html                 the same content without the <html>/<head>/
 *                                 <body> wrapper, for hosts that supply their
 *                                 own document shell.
 *
 * The game ships as ES modules, which browsers refuse to load over file://.
 * Rather than pull in a bundler, this walks the import graph itself and wraps
 * each module in a function with a tiny CommonJS-style registry — so module
 * scopes stay separate and identically named locals in different files cannot
 * collide.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = 'src/main.js';

/* ------------------------------------------------------------------ parse */

/** `import { a, b as c } from '../x.js';` — possibly spread over lines. */
const IMPORT_RE = /^import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?/gm;

/** Turn an import specifier into a repo-relative module id. */
function resolveId(fromId, spec) {
  if (!spec.startsWith('.')) throw new Error(`${fromId}: bare import "${spec}" is not supported`);
  return relative(ROOT, resolve(ROOT, dirname(fromId), spec)).split('\\').join('/');
}

function transform(id, source) {
  const exported = new Set();
  let code = source;

  // import { a, b as c } from './x.js'  ->  const { a, b: c } = __req('x.js')
  code = code.replace(IMPORT_RE, (_m, names, spec) => {
    const bindings = names
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => {
        const [orig, alias] = n.split(/\s+as\s+/).map((s) => s.trim());
        return alias ? `${orig}: ${alias}` : orig;
      })
      .join(', ');
    return `const { ${bindings} } = __req(${JSON.stringify(resolveId(id, spec))});`;
  });

  // export { A, B };  ->  (recorded, line removed)
  code = code.replace(/^export\s*\{([^}]*)\}\s*;?\s*$/gm, (_m, names) => {
    names.split(',').map((n) => n.trim()).filter(Boolean).forEach((n) => exported.add(n));
    return '';
  });

  // export function NAME / export const NAME / export let|var|class NAME
  code = code.replace(
    /^export\s+(async\s+)?(function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm,
    (_m, asyncKw = '', kind, name) => {
      exported.add(name);
      return `${asyncKw || ''}${kind} ${name}`;
    },
  );

  if (/^export\b/m.test(code)) {
    throw new Error(`${id}: an export form this builder does not understand is still present`);
  }

  return { code, exported: [...exported] };
}

/* ------------------------------------------------------------------ crawl */

const modules = new Map();

function collect(id) {
  if (modules.has(id)) return;
  const source = readFileSync(resolve(ROOT, id), 'utf8');
  const { code, exported } = transform(id, source);
  modules.set(id, { code, exported });

  // Re-scan the original source for dependencies (the transformed code no
  // longer contains import statements).
  IMPORT_RE.lastIndex = 0;
  for (const m of source.matchAll(IMPORT_RE)) collect(resolveId(id, m[2]));
}

collect(ENTRY);

/* ------------------------------------------------------------------ emit */

const runtime = `
/* Minimal module registry: each file keeps its own scope, and modules are
   evaluated lazily the first time something requires them. */
const __mods = {};
const __cache = {};
function __def(id, factory) { __mods[id] = factory; }
function __req(id) {
  if (__cache[id]) return __cache[id];
  const factory = __mods[id];
  if (!factory) throw new Error('missing module: ' + id);
  const exports = (__cache[id] = {});
  factory(exports, __req);
  return exports;
}
`.trim();

const body = [...modules.entries()]
  .map(([id, { code, exported }]) => {
    const assign = exported.length
      ? `\n  Object.assign(__x, { ${exported.join(', ')} });`
      : '';
    return `__def(${JSON.stringify(id)}, function (__x, __req) {\n${code.trimEnd()}${assign}\n});`;
  })
  .join('\n\n');

const script = `${runtime}\n\n${body}\n\n__req(${JSON.stringify(ENTRY)});`;

const css = ['base', 'ui', 'screens', 'case']
  .map((name) => `/* ── ${name}.css ─────────────────────────────── */\n` +
                 readFileSync(resolve(ROOT, `src/styles/${name}.css`), 'utf8'))
  .join('\n\n');

const FONTS = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@600;700;800&display=swap';

const NOSCRIPT = `<noscript><div style="padding:2rem;font-family:system-ui;text-align:center">
  <h1>Little Heroes Hospital</h1>
  <p>This game needs JavaScript switched on. Please enable it and refresh.</p>
</div></noscript>`;

const content = `<div id="app" aria-live="polite"></div>
<div id="fx" aria-hidden="true"></div>
${NOSCRIPT}
<script type="module">
${script}
</script>`;

mkdirSync(resolve(ROOT, 'dist'), { recursive: true });

writeFileSync(resolve(ROOT, 'dist/little-heroes-hospital.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
<title>Little Heroes Hospital</title>
<meta name="description" content="Little Heroes Hospital — a playful game where kids become a doctor or a vet, help cute patients and grow their very own hospital." />
<meta name="theme-color" content="#39b5f0" />
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏥</text></svg>" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS}" rel="stylesheet" />
<style>
${css}
</style>
</head>
<body>
${content}
</body>
</html>
`);

// Fragment form: no document shell, for hosts that provide their own.
writeFileSync(resolve(ROOT, 'dist/artifact.html'), `<title>Little Heroes Hospital</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS}" rel="stylesheet" />
<style>
${css}
</style>
${content}
`);

const kb = (p) => (readFileSync(resolve(ROOT, p), 'utf8').length / 1024).toFixed(0);
console.log(`✅ bundled ${modules.size} modules`);
console.log(`   dist/little-heroes-hospital.html  ${kb('dist/little-heroes-hospital.html')} KB`);
console.log(`   dist/artifact.html                ${kb('dist/artifact.html')} KB`);
