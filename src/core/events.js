/**
 * Dead-simple pub/sub. Used for cross-cutting signals (currency changes,
 * unlocks, sound toggles) so screens don't have to know about each other.
 */
const listeners = new Map();

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  listeners.get(event)?.delete(fn);
}

export function emit(event, payload) {
  listeners.get(event)?.forEach((fn) => {
    try { fn(payload); } catch (err) { console.error(`[events] ${event}`, err); }
  });
}
