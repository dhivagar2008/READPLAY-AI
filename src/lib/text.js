export function wordIndexAtChar(text, charIndex) {
  const before = text.slice(0, charIndex + 1);
  return Math.max(0, before.trim().split(/\s+/).filter(Boolean).length - 1);
}

export function wordRange(text, index) {
  const words = text.split(/\s+/);
  let start = 0;
  for (let i = 0; i < index; i++) start += words[i].length + 1;
  return [start, start + words[index].length];
}
