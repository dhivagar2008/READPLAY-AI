import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCurrentUser,
  isGoogleConfigured,
  renderGoogleButton,
  signOut,
  subscribeAuth,
} from "../lib/auth.js";
import { FadeUp, MotionPage } from "../lib/motion.jsx";

const BENEFITS = [
  { icon: "📊", text: "See your child's reading progress and weekly rhythm" },
  {
    icon: "🎯",
    text: "Spot skills to practice with a gentle nudge, never a grade",
  },
  { icon: "🔒", text: "Insights stay private to your Google account" },
];

export function Login() {
  const [user, setUser] = useState(getCurrentUser);
  const buttonRef = useRef(null);

  useEffect(() => subscribeAuth(setUser), []);

  useEffect(() => {
    if (!user && buttonRef.current) renderGoogleButton(buttonRef.current);
  }, [user]);

  const configured = isGoogleConfigured();

  return (
    <MotionPage
      id="main"
      className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-4 py-10"
    >
      <FadeUp>
        <div className="mx-auto flex flex-col items-center gap-4 text-center">
          <img
            src="/favicon.svg"
            alt=""
            className="h-20 w-20 rounded-3xl shadow-lg"
          />
          <div>
            <h1 className="text-4xl">
              PlayLearn <span className="text-accent">AI</span>
            </h1>
            <p className="mt-1 text-text-muted">
              Sign in as a grown-up to open the parent insights.
            </p>
          </div>
        </div>
      </FadeUp>

      <FadeUp className="card-clay mt-8 p-6 sm:p-8">
        {!configured && (
          <div className="text-center">
            <p className="font-display text-lg font-bold">Almost ready</p>
            <p className="mt-2 text-text-muted">
              The grown-up who set this up still needs to add the Google key.
              Everything else works fine in the meantime!
            </p>
            <Link to="/" className="btn-clay mt-6">
              Back to learning
            </Link>
          </div>
        )}

        {configured && !user && (
          <>
            <div ref={buttonRef} className="flex justify-center" />
            <p className="mt-4 text-center text-sm text-text-muted">
              Signing in only unlocks the parents-only pages. Kids never need an
              account.
            </p>
          </>
        )}

        {configured && user && (
          <div className="flex flex-col items-center gap-3 text-center">
            {user.picture ? (
              <img
                src={user.picture}
                alt=""
                className="h-20 w-20 rounded-full shadow-md"
              />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-full bg-primary-light font-display text-3xl font-bold">
                {user.name.charAt(0).toUpperCase() || "?"}
              </span>
            )}
            <p className="font-display text-2xl font-bold">
              Hi, {user.name.split(" ")[0]}!
            </p>
            <p className="text-sm text-text-muted">
              Signed in with {user.email}
            </p>
            <Link to="/insights" className="btn-clay w-full sm:w-auto">
              View parent insights
            </Link>
            <button
              type="button"
              className="btn-clay btn-clay--ghost w-full sm:w-auto"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        )}
      </FadeUp>

      {configured && (
        <FadeUp className="mt-8 grid gap-3 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.text} className="card-clay flex items-center gap-3 p-4">
              <span className="text-2xl" aria-hidden="true">
                {b.icon}
              </span>
              <p className="text-sm text-text-muted">{b.text}</p>
            </div>
          ))}
        </FadeUp>
      )}

      <FadeUp className="mt-8 text-center">
        <Link to="/" className="text-sm text-text-muted no-underline">
          ← Keep learning without signing in
        </Link>
      </FadeUp>
    </MotionPage>
  );
}
