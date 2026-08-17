export const CATEGORY_META = {
  phonics: {
    label: "Phonics",
    emoji: "🔤",
    color: "teal",
    tone: "bg-teal-100 text-teal-700",
  },
  reading: {
    label: "Reading",
    emoji: "📖",
    color: "orange",
    tone: "bg-orange-100 text-orange-600",
  },
  math: {
    label: "Math",
    emoji: "🔢",
    color: "pink",
    tone: "bg-pink-100 text-pink-500",
  },
  science: {
    label: "Science",
    emoji: "🔬",
    color: "green",
    tone: "bg-green-100 text-green-600",
  },
  social: {
    label: "Social Studies",
    emoji: "🌍",
    color: "purple",
    tone: "bg-purple-100 text-purple-500",
  },
};

export function categoryMeta(category) {
  return (
    CATEGORY_META[category] ?? {
      label: category,
      emoji: "📚",
      tone: "bg-slate-100 text-slate-600",
    }
  );
}
