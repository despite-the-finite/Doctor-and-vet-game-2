/**
 * Screen router.
 *
 * A "screen" is a factory: (params) => { el, destroy?, onEnter? }.
 * Only one is mounted at a time. A shallow history stack powers the always
 * present Back button so a child can never get stuck.
 */
const registry = new Map();
const stack = [];
let current = null;
let root = null;

export function registerScreen(name, factory) { registry.set(name, factory); }

export function attach(el) { root = el; }

export function go(name, params = {}, { replace = false } = {}) {
  const factory = registry.get(name);
  if (!factory) { console.error(`[router] unknown screen "${name}"`); return; }

  if (current) {
    try { current.instance.destroy?.(); } catch (e) { console.error(e); }
    current.instance.el.remove();
    if (!replace) stack.push({ name: current.name, params: current.params });
  }

  const instance = factory(params);
  current = { name, params, instance };
  root.appendChild(instance.el);
  // Let the browser paint the initial state before entry hooks animate.
  requestAnimationFrame(() => instance.onEnter?.());
  document.documentElement.dataset.screen = name;
}

/** Go back one step, or to `fallback` when there's nothing to go back to. */
export function back(fallback = 'hub') {
  const prev = stack.pop();
  if (prev) {
    go(prev.name, prev.params, { replace: true });
  } else {
    go(fallback, {}, { replace: true });
  }
}

/** Jump home and forget the history — used by the hospital button. */
export function goHome(name = 'hub', params = {}) {
  stack.length = 0;
  go(name, params, { replace: true });
}

export function currentScreen() { return current?.name; }
