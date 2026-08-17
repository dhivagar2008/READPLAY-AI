export function normalizeWord(word) {
  return String(word)
    .toLowerCase()
    .replace(/[^a-z0-9']/g, "");
}

export function wordDistance(a, b) {
  const x = normalizeWord(a);
  const y = normalizeWord(b);
  if (x === y) return 0;
  const m = x.length;
  const n = y.length;
  if (Math.abs(m - n) > 2) return Math.max(m, n);
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

export function scoreReading(transcript, expectedWords) {
  const heard = String(transcript || "")
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
  const expected = expectedWords.map(normalizeWord).filter(Boolean);
  const results = [];
  let cursor = 0;
  for (const word of expected) {
    let best = null;
    for (let i = cursor; i < Math.min(heard.length, cursor + 3); i++) {
      const d = wordDistance(word, heard[i]);
      if (best === null || d < best.distance) best = { distance: d, index: i };
    }
    if (best && best.distance === 0) {
      results.push({
        expected: word,
        heard: heard[best.index],
        status: "correct",
      });
      cursor = best.index + 1;
    } else if (best && best.distance <= 1) {
      results.push({
        expected: word,
        heard: heard[best.index],
        status: "close",
      });
      cursor = best.index + 1;
    } else {
      results.push({ expected: word, heard: "", status: "missed" });
    }
  }
  const correct = results.filter((r) => r.status === "correct").length;
  const close = results.filter((r) => r.status === "close").length;
  const missed = results.filter((r) => r.status === "missed").length;
  return { results, correct, close, missed, total: expected.length };
}
