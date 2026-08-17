import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { lessons } from "../data/lessons.js";
import { CATEGORY_META, categoryMeta } from "../data/categories.js";
import { loadStore } from "../lib/progress.js";
import { recommendedDifficulty, suggestNextLesson } from "../lib/adaptive.js";
import { FadeUp, MotionPage } from "../lib/motion.jsx";
import { ToffyCat, DizzyDog } from "../components/mascots/Mascots.jsx";

function DifficultyStars({ level }) {
  return (
    <span
      aria-label={`Difficulty ${level} of 3`}
      title={`Difficulty ${level} of 3`}
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i <= level ? "text-accent" : "text-slate-200"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function Lessons() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  const store = useMemo(() => loadStore(), []);
  const suggestion = useMemo(() => suggestNextLesson(store, lessons), [store]);
  const level = useMemo(() => recommendedDifficulty(store), [store]);
  const hasProgress = store.events.length > 0;

  const shown = useMemo(
    () =>
      active === "all" ? lessons : lessons.filter((l) => l.category === active),
    [active],
  );

  const setCategory = (value) => {
    setSearchParams(value === "all" ? {} : { category: value }, {
      replace: true,
    });
  };

  const chips = [
    { value: "all", label: "All" },
    ...Object.entries(CATEGORY_META).map(([value, meta]) => ({
      value,
      label: meta.label,
    })),
  ];

  return (
    <MotionPage id="main" className="mx-auto max-w-6xl px-4 py-10">
      <FadeUp className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-4xl">Lessons</h1>
          <p className="mt-1 text-text-muted">
            Pick one, and let&apos;s play and learn together.
          </p>
        </div>
        <ToffyCat className="w-16" aria-hidden="true" />
      </FadeUp>

      {hasProgress && (
        <FadeUp className="card-clay mt-6 flex flex-wrap items-center gap-4">
          <DizzyDog className="w-14" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-2xl">Suggested for you</h2>
            <p className="mt-1 text-text-muted">
              {suggestion.reason === "practice-more"
                ? "You are doing so well — let's give a tricky skill one more go."
                : suggestion.reason === "keep-going"
                  ? "Let's finish what you started — you are almost there!"
                  : suggestion.reason === "all-done"
                    ? "You finished everything! One more victory lap?"
                    : `A fresh start at ${level} star difficulty.`}
            </p>
          </div>
          <Link to={`/lessons/${suggestion.lesson.id}`} className="btn-clay">
            {suggestion.lesson.title} →
          </Link>
        </FadeUp>
      )}

      <FadeUp
        className="mt-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter lessons by subject"
      >
        {chips.map((c) => (
          <button
            key={c.value}
            type="button"
            className="chip"
            aria-pressed={active === c.value}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </FadeUp>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((lesson) => {
          const meta = categoryMeta(lesson.category);
          return (
            <FadeUp key={lesson.id}>
              <Link
                to={`/lessons/${lesson.id}`}
                className="card-clay block h-full no-underline transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`chip border-0 ${meta.tone}`}
                    aria-label={meta.label}
                  >
                    <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                  </span>
                  <DifficultyStars level={lesson.difficulty} />
                </div>
                <h2 className="mt-3 text-2xl">{lesson.title}</h2>
                <p className="mt-1 text-sm text-text-muted">
                  {lesson.words.length} words · {lesson.sentences.length}{" "}
                  sentences
                </p>
                <span className="mt-4 inline-block text-primary-dark font-display font-bold">
                  Start lesson →
                </span>
              </Link>
            </FadeUp>
          );
        })}
      </div>

      {shown.length === 0 && (
        <p className="mt-10 text-center text-text-muted">
          No lessons here yet — try another subject.
        </p>
      )}
    </MotionPage>
  );
}
