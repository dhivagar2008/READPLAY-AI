import { useMemo } from "react";
import { Link } from "react-router-dom";
import { lessons } from "../data/lessons.js";
import { CATEGORY_META } from "../data/categories.js";
import { loadStore, starsForLesson, totalStars } from "../lib/progress.js";
import { FadeUp, MotionPage } from "../lib/motion.jsx";
import { DizzyDog } from "../components/mascots/Mascots.jsx";

function StarRow({ filled, label }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={label}>
      {[1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i <= filled ? "text-star" : "text-text-faint"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function Progress() {
  const store = useMemo(() => loadStore(), []);
  const total = totalStars(store);
  const started = store.events.filter(
    (e) => e.type === "lesson_started",
  ).length;

  const byCategory = useMemo(() => {
    const map = {};
    for (const lesson of lessons) {
      const stars = starsForLesson(store, lesson.id);
      if (!stars) continue;
      const meta = CATEGORY_META[lesson.category];
      map[lesson.category] = map[lesson.category] || {
        meta,
        count: 0,
        stars: 0,
      };
      map[lesson.category].count += 1;
      map[lesson.category].stars += stars;
    }
    return Object.values(map).sort((a, b) => b.stars - a.stars);
  }, [store]);

  const doneLessons = lessons.filter((l) => starsForLesson(store, l.id) === 2);

  return (
    <MotionPage id="main" className="mx-auto max-w-3xl px-4 py-10">
      <FadeUp>
        <h1 className="text-4xl">My Stars</h1>
        <p className="mt-1 text-text-muted">
          Every star is a little win. Keep collecting them!
        </p>
      </FadeUp>

      <FadeUp className="card-clay mt-6 text-center">
        <p className="text-6xl text-star" aria-hidden="true">
          ★
        </p>
        <p className="mt-1 font-display text-3xl font-bold">{total}</p>
        <p className="text-text-muted">
          stars so far — from {started} lesson{started === 1 ? "" : "s"}
        </p>
      </FadeUp>

      {byCategory.length > 0 && (
        <FadeUp className="mt-6">
          <h2 className="font-display text-xl font-bold">How you are doing</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {byCategory.map(({ meta, count, stars }) => (
              <li key={meta.id} className="card-clay flex items-center gap-4">
                <span className="text-3xl" aria-hidden="true">
                  {meta.emoji}
                </span>
                <div className="flex-1">
                  <p className="font-display font-bold">{meta.label}</p>
                  <p className="text-sm text-text-muted">
                    {count} lesson{count === 1 ? "" : "s"} · {stars} star
                    {stars === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: count }).map((_, i) => (
                    <span key={i} className="text-star">
                      ★
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </FadeUp>
      )}

      {doneLessons.length > 0 && (
        <FadeUp className="mt-6">
          <h2 className="font-display text-xl font-bold">Finished lessons</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {doneLessons.map((lesson) => (
              <li key={lesson.id} className="card-clay flex items-center gap-3">
                <StarRow filled={2} label={`${lesson.title}: 2 stars`} />
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="flex-1 font-semibold no-underline"
                >
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </FadeUp>
      )}

      <FadeUp className="mt-8 text-center">
        <DizzyDog className="mx-auto w-16" aria-hidden="true" />
        {total === 0 ? (
          <p className="mt-2 text-text-muted">
            No stars yet —{" "}
            <Link to="/lessons" className="text-primary-dark">
              start your first lesson
            </Link>
            !
          </p>
        ) : (
          <p className="mt-2 text-text-muted">
            {started === doneLessons.length ? (
              "Everything started is finished — amazing!"
            ) : (
              <Link to="/lessons" className="text-primary-dark">
                Keep going
              </Link>
            )}
          </p>
        )}
      </FadeUp>
    </MotionPage>
  );
}
