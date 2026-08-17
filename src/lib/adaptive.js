export function skillsFromStore(store) {
  const map = {};
  for (const event of store.events) {
    if (!event.skillIds) continue;
    for (const skillId of event.skillIds) {
      map[skillId] = map[skillId] || {
        attempts: 0,
        completed: 0,
        misses: 0,
        words: 0,
      };
      if (event.type === "lesson_started") map[skillId].attempts += 1;
      if (event.type === "lesson_completed") map[skillId].completed += 1;
      if (event.type === "reading_scored") {
        map[skillId].misses += event.score.missed + event.score.close;
        map[skillId].words += event.score.total;
      }
    }
  }
  return map;
}

export function skillMissRate(skills, skillId) {
  const s = skills[skillId];
  if (!s || s.words === 0) return 0;
  return s.misses / s.words;
}

export function recommendedDifficulty(store) {
  const skills = skillsFromStore(store);
  const entries = Object.values(skills).filter((s) => s.words > 0);
  if (entries.length === 0) return 1;
  const avgMiss =
    entries.reduce((sum, s) => sum + s.misses / s.words, 0) / entries.length;
  if (avgMiss >= 0.45) return 1;
  if (avgMiss <= 0.15 && entries.every((s) => s.completed >= 1)) return 3;
  return 2;
}

export function suggestNextLesson(store, lessons) {
  const skills = skillsFromStore(store);
  const done = new Set(
    store.events
      .filter((e) => e.type === "lesson_completed")
      .map((e) => e.lessonId),
  );
  const inProgress = new Set(
    store.events
      .filter((e) => e.type === "lesson_started" && !done.has(e.lessonId))
      .map((e) => e.lessonId),
  );

  const unstarted = lessons.filter(
    (l) => !done.has(l.id) && !inProgress.has(l.id),
  );

  if (unstarted.length > 0) {
    const struggling = unstarted.find((l) =>
      l.skillIds.some((sid) => skillMissRate(skills, sid) >= 0.3),
    );
    if (struggling) return { lesson: struggling, reason: "practice-more" };
    const easiest = [...unstarted].sort(
      (a, b) => a.difficulty - b.difficulty,
    )[0];
    return { lesson: easiest, reason: "fresh-start" };
  }

  const continuing = lessons.filter((l) => inProgress.has(l.id));
  if (continuing.length > 0) {
    const pick = [...continuing].sort((a, b) => a.difficulty - b.difficulty)[0];
    return { lesson: pick, reason: "keep-going" };
  }

  const allDone = [...lessons].sort((a, b) => a.difficulty - b.difficulty);
  return { lesson: allDone[0], reason: "all-done" };
}

export function personalizedPath(store, lessons) {
  const first = suggestNextLesson(store, lessons);
  const rest = lessons
    .filter((l) => l.id !== first.lesson.id)
    .sort((a, b) => a.difficulty - b.difficulty);
  return [first.lesson.id, ...rest.map((l) => l.id)];
}
