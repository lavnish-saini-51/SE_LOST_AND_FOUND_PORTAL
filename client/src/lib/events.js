const EVENT_LOST_RESOLVED = "lf:lostResolved";

export function emitLostResolved() {
  window.dispatchEvent(new CustomEvent(EVENT_LOST_RESOLVED));
}

export function onLostResolved(handler) {
  window.addEventListener(EVENT_LOST_RESOLVED, handler);
  return () => window.removeEventListener(EVENT_LOST_RESOLVED, handler);
}

