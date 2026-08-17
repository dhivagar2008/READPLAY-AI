import { Link } from "react-router-dom";

const SUBJECTS = [
  { label: "Phonics", to: "/lessons?category=phonics" },
  { label: "Reading", to: "/lessons?category=reading" },
  { label: "Math", to: "/lessons?category=math" },
  { label: "Science", to: "/lessons?category=science" },
  { label: "Social Studies", to: "/lessons?category=social" },
];

const LINKS = [
  { label: "Games", to: "/games" },
  { label: "Make a Lesson", to: "/create" },
  { label: "Tutor", to: "/tutor" },
  { label: "My Stars", to: "/progress" },
  { label: "For Parents", to: "/insights" },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-extrabold text-primary-dark">
            PlayLearn AI
          </p>
          <p className="mt-1 text-sm text-text-muted">
            A gentle, AI-assisted reading companion for children with dyslexia.
          </p>
        </div>
        <nav aria-label="Subjects" className="flex flex-col gap-1">
          <p className="font-display font-bold text-text">Subjects</p>
          {SUBJECTS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="text-sm text-text-muted no-underline hover:text-primary-dark"
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="More" className="flex flex-col gap-1">
          <p className="font-display font-bold text-text">More</p>
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-text-muted no-underline hover:text-primary-dark"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-border py-3 text-center text-xs text-text-muted">
        Where learning to read feels like play.
      </p>
    </footer>
  );
}
