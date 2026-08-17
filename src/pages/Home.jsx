import { Link } from "react-router-dom";
import { FadeUp, MotionPage } from "../lib/motion.jsx";
import {
  ToffyCat,
  JummiMouse,
  HootyOwl,
  DizzyDog,
  BunboRabbit,
} from "../components/mascots/Mascots.jsx";

export function Home() {
  return (
    <MotionPage id="main" className="mx-auto max-w-6xl px-4 py-10">
      <FadeUp className="flex flex-col items-center gap-8 pb-8 text-center">
        <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">
          Learn to read like it&apos;s <span className="text-accent">play</span>
        </h1>
        <p className="max-w-xl text-lg text-text-muted">
          Small steps, big encouragement. PlayLearn AI grows with your child —
          with stories, games, and a patient AI tutor made for dyslexic
          learners.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/lessons" className="btn-clay">
            Start a lesson
          </Link>
          <Link to="/games" className="btn-clay btn-clay--ghost">
            Play a game
          </Link>
        </div>
        <div className="flex items-end gap-3 sm:gap-5" aria-hidden="true">
          <DizzyDog className="w-16 sm:w-20" />
          <JummiMouse className="w-16 sm:w-20" />
          <ToffyCat className="w-20 sm:w-24" />
          <HootyOwl className="w-16 sm:w-20" />
          <BunboRabbit className="w-16 sm:w-20" />
        </div>
      </FadeUp>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            emoji: "📚",
            title: "Gentle lessons",
            text: "Short, phonics-first lessons in reading, math, science, and more.",
          },
          {
            emoji: "🎮",
            title: "Playful games",
            text: "Practice words and sounds through games that celebrate every try.",
          },
          {
            emoji: "🤖",
            title: "Patient AI tutor",
            text: "A friendly helper that explains, encourages, and never gets tired.",
          },
        ].map((card) => (
          <FadeUp key={card.title} className="card-clay">
            <p className="text-3xl" aria-hidden="true">
              {card.emoji}
            </p>
            <h2 className="mt-2 text-xl">{card.title}</h2>
            <p className="mt-1 text-text-muted">{card.text}</p>
          </FadeUp>
        ))}
      </div>
    </MotionPage>
  );
}
