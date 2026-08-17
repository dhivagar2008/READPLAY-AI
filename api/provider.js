const MAX_REQUESTS = 15;
const WINDOW_MS = 60 * 1000;
const rateBuckets = new Map();

export function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

export function rateLimited(ip) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (now - bucket.windowStart > WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function provider() {
  return String(process.env.AI_PROVIDER || "google").toLowerCase();
}

function model() {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  return provider() === "gemini" ? "gemini-3.6-flash" : "gpt-4o-mini";
}

export async function callProvider(
  prompt,
  { temperature = 0.6, maxTokens = 2000 } = {},
) {
  const key = process.env.AI_API_KEY;
  if (!key) {
    throw Object.assign(new Error("AI is not configured on this site yet."), {
      code: 501,
    });
  }
  const base =
    process.env.AI_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta";
  if (provider() === "gemini") {
    const res = await fetch(
      `${base}/models/${model()}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            ...(provider() === "gemini"
              ? { responseMimeType: "application/json" }
              : {}),
          },
        }),
      },
    );
    if (!res.ok) throw new Error(`AI request failed with status ${res.status}`);
    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts
        ?.filter((p) => !p.thought)
        .map((p) => p.text)
        .join("") || ""
    );
  }
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: model(),
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`AI request failed with status ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
