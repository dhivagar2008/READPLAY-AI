const STORAGE_KEY = "playlearn:progress";
const STORE_VERSION = 1;

export function createStore() {
  return { v: STORE_VERSION, events: [] };
}

export function recordEvent(store, event) {
  return {
    ...store,
    events: [...store.events, { ...event, ts: Date.now() }],
  };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createStore();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.events)) return createStore();
    return parsed;
  } catch {
    return createStore();
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function eventsForLesson(store, lessonId) {
  return store.events.filter((e) => e.lessonId === lessonId);
}

export function hasEvent(store, lessonId, type) {
  return store.events.some((e) => e.lessonId === lessonId && e.type === type);
}

export function starsForLesson(store, lessonId) {
  const events = eventsForLesson(store, lessonId);
  if (events.some((e) => e.type === "lesson_completed")) return 2;
  if (events.some((e) => e.type === "lesson_started")) return 1;
  return 0;
}

export function totalStars(store) {
  return store.events.reduce((sum, e) => {
    if (e.type === "lesson_completed") return sum + 2;
    if (e.type === "lesson_started") return sum + 1;
    return sum;
  }, 0);
}
