export const CATEGORIES = ["phonics", "reading", "math", "science", "social"];

export function validateLesson(lesson, knownIds = new Set()) {
  const errors = [];
  if (!lesson || typeof lesson !== "object")
    return { ok: false, errors: ["lesson is not an object"] };
  if (typeof lesson.id !== "string" || !/^[a-z0-9-]+$/.test(lesson.id))
    errors.push(`bad id: ${String(lesson.id)}`);
  if (knownIds.has(lesson.id)) errors.push(`duplicate id: ${lesson.id}`);
  if (typeof lesson.title !== "string" || lesson.title.trim().length < 3)
    errors.push(`bad title: ${lesson.title}`);
  if (!CATEGORIES.includes(lesson.category))
    errors.push(`bad category: ${lesson.category}`);
  if (!Array.isArray(lesson.skillIds) || lesson.skillIds.length === 0)
    errors.push("skillIds must be a non-empty array");
  if (
    !Number.isInteger(lesson.difficulty) ||
    lesson.difficulty < 1 ||
    lesson.difficulty > 3
  )
    errors.push(`bad difficulty: ${lesson.difficulty}`);
  if (!Array.isArray(lesson.words) || lesson.words.length < 5)
    errors.push("needs at least 5 words");
  else {
    const dupes = lesson.words.filter((w, i) => lesson.words.indexOf(w) !== i);
    if (dupes.length > 0) errors.push(`duplicate words: ${dupes.join(", ")}`);
    for (const w of lesson.words) {
      if (typeof w !== "string" || !/^[a-z'-]+$/.test(w))
        errors.push(`bad word: ${String(w)}`);
    }
  }
  if (!Array.isArray(lesson.sentences) || lesson.sentences.length < 2)
    errors.push("needs at least 2 sentences");
  else {
    for (const s of lesson.sentences) {
      if (typeof s !== "string" || s.split(" ").length > 12)
        errors.push(`sentence too long or invalid: ${String(s).slice(0, 40)}`);
    }
  }
  if (!lesson.gameHints || typeof lesson.gameHints !== "object")
    errors.push("gameHints must be an object");
  return { ok: errors.length === 0, errors };
}

export function validateCatalog(catalog) {
  const errors = [];
  const seen = new Set();
  const counts = {};
  for (const l of catalog) {
    const result = validateLesson(l, seen);
    if (l) {
      seen.add(l.id);
      counts[l.category] = (counts[l.category] || 0) + 1;
    }
    for (const e of result.errors) errors.push(`${l?.id ?? "?"}: ${e}`);
  }
  const missing = CATEGORIES.filter((c) => (counts[c] || 0) < 1);
  if (missing.length > 0)
    errors.push(`categories with no lessons: ${missing.join(", ")}`);
  if (catalog.length < 15)
    errors.push(`only ${catalog.length} lessons (need 15+)`);
  return { ok: errors.length === 0, errors, counts, total: catalog.length };
}

export function findLesson(catalog, id) {
  return catalog.find((l) => l.id === id);
}
