import { validateLesson } from "../data/validate.js";

export function isAiConfigured() {
  return Boolean(import.meta.env.VITE_AI_API_KEY);
}

export function sanitizeLesson(lesson) {
  if (!lesson || typeof lesson !== "object") return null;
  const result = validateLesson(lesson);
  if (!result.ok) return null;
  return {
    id: lesson.id,
    title: String(lesson.title).slice(0, 60),
    category: lesson.category,
    skillIds: lesson.skillIds.map(String).slice(0, 4),
    difficulty: lesson.difficulty,
    words: lesson.words.slice(0, 10),
    sentences: lesson.sentences.slice(0, 6),
    gameHints: lesson.gameHints,
  };
}

async function tryServerless(payload) {
  try {
    const res = await fetch("/api/generate-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return sanitizeLesson(await res.json());
  } catch {
    return null;
  }
}

async function tryDirectGemini({ topic, category, difficulty }) {
  const base = import.meta.env.VITE_AI_BASE_URL;
  const model = import.meta.env.VITE_AI_MODEL;
  const key = import.meta.env.VITE_AI_API_KEY;
  if (!base || !model || !key) return null;
  try {
    const res = await fetch(
      `${base}/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Create a short learning lesson JSON for a child with dyslexia (ages 5-9).
Topic: "${topic}". Category: "${category}". Difficulty: ${difficulty} of 3.
Return ONLY JSON matching exactly this schema:
{ "id": "custom-<topic-slug>", "title": "Short friendly title", "category": "${category}",
  "skillIds": ["custom.${category}"], "difficulty": ${difficulty},
  "words": ["6 to 8 short easy lowercase words about the topic"],
  "sentences": ["3 to 4 very short decodable sentences (max 10 words each) about the topic"],
  "gameHints": { "match": "...", "mixed": "...", "sight": "..." } }
Rules: words lowercase a-z and hyphens only; sentences max 10 words; no numbers in ids.`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const json = text.replace(/```json?|```/g, "").trim();
    return sanitizeLesson(JSON.parse(json));
  } catch {
    return null;
  }
}

const FALLBACK_WORDS = [
  "sun",
  "cat",
  "dog",
  "ball",
  "star",
  "bird",
  "tree",
  "book",
];

export function generateLessonOffline({ topic, category, difficulty }) {
  const base = topic
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const words = [...new Set(base)].slice(0, 8);
  for (let i = 0; words.length < 6; i++) {
    words.push(FALLBACK_WORDS[i % FALLBACK_WORDS.length]);
  }
  const sentences = [
    `Today we learn about ${topic}.`,
    "It is fun to learn new things.",
    "You are doing a great job!",
    `Tell me what you learned about ${topic}.`,
  ];
  return sanitizeLesson({
    id: `custom-${Date.now()}`,
    title: topic.trim().slice(0, 60) || "My Lesson",
    category,
    skillIds: [`custom.${category}`],
    difficulty,
    words: words.slice(0, 8),
    sentences,
    gameHints: {
      match: "Match the words from your new lesson.",
      mixed: "Spell the new words.",
      sight: "Spot the new words fast.",
    },
  });
}

export async function generateLesson({ topic, category, difficulty }) {
  const payload = {
    topic: String(topic).trim(),
    category,
    difficulty: Number(difficulty),
  };
  const serverless = await tryServerless(payload);
  if (serverless) return { lesson: serverless, source: "serverless" };
  if (isAiConfigured()) {
    const direct = await tryDirectGemini(payload);
    if (direct) return { lesson: direct, source: "gemini" };
  }
  return { lesson: generateLessonOffline(payload), source: "offline" };
}
