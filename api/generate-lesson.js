import {
  clientIp,
  json,
  rateLimited,
  readBody,
  callProvider,
} from "./provider.js";
import { lessonPrompt } from "./prompts.js";

function extractJson(text) {
  const match = String(text).match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI did not return a valid JSON lesson.");
  return JSON.parse(match[0]);
}

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (rateLimited(clientIp(req))) {
    json(res, 429, {
      error: "Too many requests. Please wait a minute and try again.",
    });
    return;
  }
  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    json(res, 400, { error: err.message });
    return;
  }
  const topic = String(body.topic || "").slice(0, 120);
  const category = String(body.category || "reading").slice(0, 30);
  const difficulty = Number(body.difficulty) || 2;
  if (!topic) {
    json(res, 400, { error: "Empty topic" });
    return;
  }

  try {
    const raw = await callProvider(
      lessonPrompt({ topic, category, difficulty }),
      {
        temperature: 0.6,
        maxTokens: 2000,
      },
    );
    const lesson = extractJson(raw);
    json(res, 200, {
      id: String(lesson.id || `custom-${Date.now()}`).slice(0, 60),
      title: String(lesson.title || topic).slice(0, 60),
      category,
      skillIds: (lesson.skillIds || [`custom.${category}`])
        .map(String)
        .slice(0, 4),
      difficulty,
      words: (lesson.words || [])
        .map((w) => String(w).slice(0, 30))
        .slice(0, 10),
      sentences: (lesson.sentences || [])
        .map((s) => String(s).slice(0, 160))
        .slice(0, 6),
      gameHints: lesson.gameHints || {},
    });
  } catch (err) {
    json(res, err.code === 501 ? 501 : 500, {
      error: err.message || "The AI could not make a lesson right now.",
    });
  }
}
