export async function askTutor({ question, lessonTitle }) {
  const res = await fetch("/api/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: String(question).trim().slice(0, 500),
      lessonTitle,
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("too-many");
    throw new Error("sleeping");
  }
  const data = await res.json();
  const answer = String(data.answer || "")
    .trim()
    .slice(0, 2000);
  if (!answer) throw new Error("sleeping");
  return answer;
}
