import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useA11y } from "../hooks/useA11y.js";
import { getCurrentUser, subscribeAuth } from "../lib/auth.js";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/lessons", label: "Lessons" },
  { to: "/games", label: "Games" },
  { to: "/create", label: "Make a Lesson" },
  { to: "/tutor", label: "Tutor" },
  { to: "/progress", label: "My Stars" },
  { to: "/insights", label: "For Parents" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser);
  const { font, size, toggleFont, cycleSize } = useA11y();

  useEffect(() => subscribeAuth(setUser), []);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-surface">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2"
      >
        <Link
          to="/"
          className="flex items-center gap-2 no-underline"
          onClick={close}
        >
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-full bg-primary font-display text-xl font-extrabold text-white shadow-md"
          >
            P
          </span>
          <span className="font-display text-xl font-extrabold text-primary-dark">
            PlayLearn <span className="text-accent">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex" role="list">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              role="listitem"
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 font-display text-sm font-bold no-underline transition ${
                  isActive
                    ? "bg-primary-light text-primary-dark"
                    : "text-text-muted hover:bg-surface-alt hover:text-text"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="chip min-h-11"
            onClick={toggleFont}
            aria-pressed={font === "readable"}
            aria-label={
              font === "readable"
                ? "Switch to friendly font"
                : "Switch to reading font"
            }
            title="Swap reading font"
          >
            <span aria-hidden="true">Aa</span>
          </button>
          <button
            type="button"
            className="chip min-h-11"
            onClick={cycleSize}
            aria-label={`Text size: ${size}. Click to change.`}
            title={`Text size: ${size}`}
          >
            <span aria-hidden="true">
              {size === "small" ? "A" : size === "medium" ? "A+" : "A++"}
            </span>
          </button>
          <Link
            to="/login"
            className="btn-clay hidden px-4 py-1.5 text-sm sm:inline-flex"
          >
            {user ? `Hi, ${user.name.split(" ")[0]}` : "Sign in"}
          </Link>
          <button
            type="button"
            className="chip min-h-11 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t-2 border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={close}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 font-display text-base font-bold no-underline ${
                    isActive
                      ? "bg-primary-light text-primary-dark"
                      : "text-text hover:bg-surface-alt"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/login" onClick={close} className="btn-clay mt-2 w-full">
              {user ? `Hi, ${user.name.split(" ")[0]}` : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
