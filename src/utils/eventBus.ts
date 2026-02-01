

type Listener = (payload?: any) => void;

const listeners: Record<string, Set<Listener>> = {};

export function on(event: string, cb: Listener) {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(cb);
  return () => off(event, cb);
}

export function off(event: string, cb: Listener) {
  if (!listeners[event]) return;
  listeners[event].delete(cb);
  if (listeners[event].size === 0) delete listeners[event];
}

export function emit(event: string, payload?: any) {
  if (!listeners[event]) return;
  for (const cb of Array.from(listeners[event])) {
    try { cb(payload); } catch (e) {  }
  }
}

export default { on, off, emit };