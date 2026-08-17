import { motion } from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const pop = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", stiffness: 300, damping: 18 },
};

export function MotionPage({ children, ...props }) {
  return (
    <motion.main
      variants={stagger}
      initial="hidden"
      animate="visible"
      exit="hidden"
      {...props}
    >
      {children}
    </motion.main>
  );
}

export function FadeUp({ children, ...props }) {
  return (
    <motion.div variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}
