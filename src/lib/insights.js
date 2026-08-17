export function activitySummary(store) {
  const summary = {
    lessonsStarted: 0,
    lessonsCompleted: 0,
    gamesPlayed: 0,
    wordsRead: 0,
    wordsMissed: 0,
  };
  for (const event of store.events) {
    if (event.type === "lesson_started") summary.lessonsStarted += 1;
    if (event.type === "lesson_completed") summary.lessonsCompleted += 1;
    if (event.type === "game_result") summary.gamesPlayed += 1;
    if (event.type === "reading_scored" && event.score) {
      summary.wordsRead += event.score.total || 0;
      summary.wordsMissed +=
        (event.score.missed || 0) + (event.score.close || 0);
    }
  }
  summary.accuracy =
    summary.wordsRead > 0
      ? Math.round(
          ((summary.wordsRead - summary.wordsMissed) / summary.wordsRead) * 100,
        )
      : null;
  return summary;
}

export function weeklyActivity(store, days = 7) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const buckets = Array.from({ length: days }, (_, i) => {
    const day = new Date(now - (days - 1 - i) * dayMs);
    day.setHours(0, 0, 0, 0);
    return {
      key: day.toDateString(),
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      lessonsStarted: 0,
      wordsRead: 0,
    };
  });
  for (const event of store.events) {
    const day = new Date(event.ts || now);
    day.setHours(0, 0, 0, 0);
    const bucket = buckets.find((b) => b.key === day.toDateString());
    if (!bucket) continue;
    if (event.type === "lesson_started") bucket.lessonsStarted += 1;
    if (event.type === "reading_scored" && event.score) {
      bucket.wordsRead += event.score.total || 0;
    }
  }
  return buckets;
}

export function skillBreakdown(store) {
  const map = {};
  for (const event of store.events) {
    if (!event.skillIds) continue;
    for (const skillId of event.skillIds) {
      map[skillId] = map[skillId] || {
        attempts: 0,
        completed: 0,
        words: 0,
        misses: 0,
      };
      if (event.type === "lesson_started") map[skillId].attempts += 1;
      if (event.type === "lesson_completed") map[skillId].completed += 1;
      if (event.type === "reading_scored" && event.score) {
        map[skillId].words += event.score.total || 0;
        map[skillId].misses +=
          (event.score.missed || 0) + (event.score.close || 0);
      }
    }
  }
  return Object.entries(map)
    .map(([skillId, s]) => ({
      skillId,
      ...s,
      missRate: s.words > 0 ? Math.round((s.misses / s.words) * 100) : null,
    }))
    .sort((a, b) => (b.missRate ?? -1) - (a.missRate ?? -1));
}
