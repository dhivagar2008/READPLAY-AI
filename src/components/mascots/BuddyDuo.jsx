import { AnimatePresence, motion } from "framer-motion";
import { ToffyBody, JummiBody } from "./Mascots.jsx";

const CAT_ANIM = {
  idle: {
    y: [0, -8, 0],
    rotate: 0,
    transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
  },
  curious: {
    y: [0, -16, 0],
    rotate: [-5, 5, -5],
    transition: { duration: 1.3, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    y: [0, -36, 0, -20, 0],
    rotate: [-7, 7, -7, 7, 0],
    transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
  },
  encouraging: {
    x: [-8, 8, -8],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const MOUSE_ANIM = {
  idle: {
    y: [0, -5, 0],
    transition: { duration: 2.1, repeat: Infinity, ease: "easeInOut" },
  },
  curious: {
    y: [0, -9, 0],
    transition: { duration: 1.3, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    scale: [1, 1.25, 1],
    rotate: [-8, 8, -8],
    transition: { duration: 0.55, repeat: Infinity, ease: "easeInOut" },
  },
  encouraging: {
    x: [5, -5, 5],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};

export function BuddyDuo({ mood = "idle", speech = "", speaking = false }) {
  const safeMood = CAT_ANIM[mood] ? mood : "idle";
  return (
    <div
      className="relative flex items-end justify-center gap-4 sm:gap-8"
      aria-label="Toffy the cat and Jummi the mouse"
    >
      <AnimatePresence mode="wait">
        {speech && (
          <motion.div
            key={speech}
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="absolute -top-4 left-1/2 z-10 w-64 -translate-x-1/2 -translate-y-full sm:w-80"
            role="status"
          >
            <div className="rounded-2xl border-2 border-border bg-surface px-4 py-3 text-center shadow-lg">
              <p className="font-display text-base font-bold leading-snug sm:text-lg">
                {speech}
              </p>
            </div>
            <div
              className="mx-auto h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-border"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={CAT_ANIM[safeMood]}
        style={{ width: 160, height: 160, color: "#f97316" }}
        aria-hidden="true"
      >
        <motion.svg
          viewBox="0 0 120 120"
          width="100%"
          height="100%"
          animate={speaking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        >
          <ToffyBody />
        </motion.svg>
      </motion.div>

      <motion.div
        animate={MOUSE_ANIM[safeMood]}
        style={{ width: 110, height: 110, color: "#ec4899" }}
        aria-hidden="true"
      >
        <motion.svg
          viewBox="0 0 120 120"
          width="100%"
          height="100%"
          animate={speaking ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        >
          <JummiBody />
        </motion.svg>
      </motion.div>
    </div>
  );
}
