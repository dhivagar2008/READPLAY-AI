import {
  clientIp,
  json,
  rateLimited,
  readBody,
  callProvider,
} from "./provider.js";
import { tutorPrompt } from "./prompts.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (rateLimited(clientIp(req))) {
    json(res, 429, {
      error: "Too many questions. Please wait a minute and try again.",
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
  const question = String(body.question || "").slice(0, 500);
  const lessonTitle = String(body.lessonTitle || "").slice(0, 120);
  if (!question) {
    json(res, 400, { error: "Empty question" });
    return;
  }

  try {
    const raw = await callProvider(tutorPrompt({ question, lessonTitle }), {
      temperature: 0.5,
      maxTokens: 500,
    });
    const answer = String(raw).trim().slice(0, 2000);
    if (!answer) throw new Error("AI returned an empty answer.");
    json(res, 200, { answer });
  } catch (err) {
    json(res, err.code === 501 ? 501 : 500, {
      error:
        err.message ||
        "The tutor is sleeping right now. Try again in a moment.",
    });
  }
}
