import { loadStore, recordEvent, saveStore } from "./progress.js";

export function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function takeN(items, n) {
  return shuffle(items).slice(0, n);
}

export function scrambleWord(word) {
  const letters = [...word];
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const scrambled = letters.join("");
  return scrambled === word ? scrambleWord(word) : scrambled;
}

export function recordGameResult(lessonId, skillIds, game, score, total) {
  const store = recordEvent(loadStore(), {
    type: "game_result",
    lessonId,
    skillIds,
    meta: { game, score, total },
  });
  saveStore(store);
}
