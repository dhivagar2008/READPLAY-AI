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
import { ToffyCat } from "../components/mascots/Mascots.jsx";

export function Login() {
  const [user, setUser] = useState(getCurrentUser);
  const buttonRef = useRef(null);

  useEffect(() => subscribeAuth(setUser), []);

  useEffect(() => {
    if (!user && buttonRef.current) renderGoogleButton(buttonRef.current);
  }, [user]);

  const configured = isGoogleConfigured();

  return (
    <MotionPage id="main" className="mx-auto max-w-xl px-4 py-10 text-center">
      <FadeUp>
        <ToffyCat className="mx-auto w-24" aria-hidden="true" />
        <h1 className="text-4xl">Sign in</h1>
        <p className="mt-1 text-text-muted">
          For grown-ups: sign in to see reading insights. Kids never need an
          account.
        </p>
      </FadeUp>

      <FadeUp className="card-clay mt-6 flex flex-col items-center gap-4">
        {!configured && (
          <p className="text-text-muted">
            Sign-in is almost ready — the grown-up who set this up still needs
            to add the Google key. Meanwhile, everything else works fine!
          </p>
        )}

        {configured && !user && (
          <>
            <div ref={buttonRef} />
            <p className="text-sm text-text-muted">
              New here? Signing in just lets us keep insights private to you.
            </p>
          </>
        )}

        {configured && user && (
          <>
            {user.picture ? (
              <img
                src={user.picture}
                alt=""
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-light font-display text-2xl font-bold">
                {user.name.charAt(0).toUpperCase() || "?"}
              </span>
            )}
            <p className="font-display text-xl font-bold">
              Hi, {user.name.split(" ")[0]}!
            </p>
            <p className="text-sm text-text-muted">
              Signed in with {user.email}
            </p>
            <Link to="/insights" className="btn-clay">
              View parent insights
            </Link>
            <button
              type="button"
              className="btn-clay btn-clay--ghost"
              onClick={signOut}
            >
              Sign out
            </button>
          </>
        )}

        <p className="text-sm text-text-muted">
          <Link to="/" className="text-primary-dark">
            ← Back to the fun stuff
          </Link>
        </p>
      </FadeUp>
    </MotionPage>
  );
}
