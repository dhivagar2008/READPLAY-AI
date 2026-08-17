import { useMemo, useState } from "react";
import { loadStore } from "../lib/progress.js";
import {
  activitySummary,
  skillBreakdown,
  weeklyActivity,
} from "../lib/insights.js";
import { FadeUp, MotionPage } from "../lib/motion.jsx";
import { BunboRabbit } from "../components/mascots/Mascots.jsx";

function Stat({ label, value, hint }) {
  return (
    <div className="card-clay p-4 text-center">
      <p className="text-3xl font-display font-bold">{value}</p>
      <p className="text-sm font-semibold text-text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-text-faint">{hint}</p>}
    </div>
  );
}

export function Insights() {
  const [store, setStore] = useState(loadStore);
  const summary = useMemo(() => activitySummary(store), [store]);
  const week = useMemo(() => weeklyActivity(store), [store]);
  const skills = useMemo(() => skillBreakdown(store), [store]);
  const hasActivity = store.events.length > 0;

  const clearData = () => {
    localStorage.removeItem("playlearn:progress");
    setStore(loadStore());
  };

  return (
    <MotionPage id="main" className="mx-auto max-w-4xl px-4 py-10">
      <FadeUp className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-4xl">For Parents</h1>
          <p className="mt-1 text-text-muted">
            A gentle look at your child&apos;s reading journey. No grades, no
            pressure — just progress.
          </p>
        </div>
        <BunboRabbit className="w-16" aria-hidden="true" />
      </FadeUp>

      {!hasActivity && (
        <FadeUp className="card-clay mt-6 text-center">
          <p className="font-display text-xl font-bold">Nothing here yet</p>
          <p className="mt-1 text-text-muted">
            Once your child starts a lesson, their activity will show up here.
          </p>
        </FadeUp>
      )}

      {hasActivity && (
        <>
          <FadeUp className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Lessons started"
              value={summary.lessonsStarted}
              hint={`${summary.lessonsCompleted} finished`}
            />
            <Stat label="Games played" value={summary.gamesPlayed} />
            <Stat label="Words read aloud" value={summary.wordsRead} />
            <Stat
              label="Reading accuracy"
              value={summary.accuracy === null ? "—" : `${summary.accuracy}%`}
              hint="Words read correctly while practising"
            />
          </FadeUp>

          <FadeUp className="mt-6">
            <h2 className="font-display text-xl font-bold">This week</h2>
            <div className="card-clay mt-3 flex items-end justify-between gap-2 p-4">
              {week.map((day) => (
                <div
                  key={day.key}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-xs text-text-muted">{day.label}</span>
                  <span
                    className="w-full max-w-8 rounded-md bg-primary-light"
                    style={{
                      height: `${Math.max(4, day.wordsRead * 6)}px`,
                    }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold">
                    {day.lessonsStarted > 0
                      ? `${day.lessonsStarted} lesson`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>

          {skills.length > 0 && (
            <FadeUp className="mt-6">
              <h2 className="font-display text-xl font-bold">
                Skills to watch
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {skills.slice(0, 5).map((s) => (
                  <li
                    key={s.skillId}
                    className="card-clay flex items-center gap-3 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{s.skillId}</p>
                      <p className="text-xs text-text-muted">
                        {s.words} words read · {s.completed} lesson
                        {s.completed === 1 ? "" : "s"} finished
                      </p>
                    </div>
                    <span
                      className={`chip border-0 ${
                        s.missRate === null || s.missRate < 30
                          ? "bg-green-100 text-green-600"
                          : s.missRate < 50
                            ? "bg-yellow-100 text-warning"
                            : "bg-pink-100 text-pink-500"
                      }`}
                    >
                      {s.missRate === null
                        ? "not read yet"
                        : `${s.missRate}% missed`}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeUp>
          )}

          <FadeUp className="mt-10 text-center">
            <button
              type="button"
              className="btn-clay btn-clay--danger"
              onClick={clearData}
            >
              Clear all progress on this device
            </button>
            <p className="mt-2 text-xs text-text-faint">
              This only removes data stored in this browser. There is no account
              data to delete.
            </p>
          </FadeUp>
        </>
      )}
    </MotionPage>
  );
}
