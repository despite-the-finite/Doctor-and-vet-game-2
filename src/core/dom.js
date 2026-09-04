/**
 * Minimal DOM helpers — a hyperscript-ish `h()` plus a couple of shortcuts.
 * Small enough to read in a minute, which beats pulling in a framework for a
 * game whose "components" are mostly big friendly buttons.
 */

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'style' && typeof value === 'object') applyStyle(el, value);
    else if (key === 'html') el.innerHTML = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in el && key !== 'list' && typeof value !== 'object') {
      el[key] = value;
    } else {
      el.setAttribute(key, value === true ? '' : value);
    }
  }

  append(el, children);
  return el;
}

/** Assign styles, routing `--custom-props` through setProperty. */
function applyStyle(el, styles) {
  for (const [prop, value] of Object.entries(styles)) {
    if (value === null || value === undefined || value === '') continue;
    if (prop.startsWith('--')) el.style.setProperty(prop, value);
    else el.style[prop] = value;
  }
}

function append(parent, children) {
  for (const child of children.flat(4)) {
    if (child === null || child === undefined || child === false) continue;
    parent.appendChild(typeof child === 'object' ? child : document.createTextNode(String(child)));
  }
}

/** Build an SVG subtree from a markup string (SVG needs the right namespace). */
export function svg(markup) {
  const wrap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  wrap.innerHTML = markup;
  return wrap;
}

/** Wrap raw markup in a div — used for the hand-written SVG characters. */
export function raw(markup, className = '') {
  const el = document.createElement('div');
  el.className = className;
  el.innerHTML = markup;
  return el;
}

export const $  = (sel, scope = document) => scope.querySelector(sel);
export const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

/** Promise-based delay used to choreograph celebrations. */
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Random helpers for the ambient background life. */
export const rand  = (min, max) => min + Math.random() * (max - min);
export const randI = (min, max) => Math.floor(rand(min, max + 1));
export const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
