import { wordDistance } from "./feedback.js";

export const BUDDY_WORDS = [
  "cat",
  "dog",
  "sun",
  "hat",
  "run",
  "fun",
  "big",
  "red",
  "sit",
  "top",
  "map",
  "hen",
];

export function buddyReply(text) {
  const t = String(text || "")
    .trim()
    .toLowerCase();
  if (!t) {
    return { speech: "Say something to me!", mood: "curious" };
  }
  if (/\b(bye|goodbye|good night|see you)\b/.test(t)) {
    return {
      speech: "Bye bye! Come play with me again soon!",
      mood: "happy",
    };
  }
  if (/\b(how are you|how's it going|hows it going|how are u)\b/.test(t)) {
    return {
      speech: "I am happy because you are here! How are you?",
      mood: "curious",
    };
  }
  if (/\b(thank|thanks|thx)\b/.test(t)) {
    return { speech: "You are welcome! You are so kind.", mood: "happy" };
  }
  if (/\b(what's your name|whats your name|who are you)\b/.test(t)) {
    return {
      speech: "I am Toffy the cat, and my best friend is Jummi the mouse!",
      mood: "curious",
    };
  }
  if (/\b(i love you|love you)\b/.test(t)) {
    return {
      speech: "Aww! I love you too. You make reading fun!",
      mood: "happy",
    };
  }
  if (/\b(silly|funny|joke|jokes)\b/.test(t)) {
    return {
      speech:
        "Why did the mouse read a book? Because every word is a treat! Hee hee!",
      mood: "happy",
    };
  }
  if (/\b(read|word|teach|practice)\b/.test(t)) {
    return {
      speech:
        "Let's read together! Try Word Practice and I will cheer for you.",
      mood: "curious",
    };
  }
  if (/\b(play|game|games)\b/.test(t)) {
    return {
      speech: "Games are my favourite! I will cheer for you in every one.",
      mood: "happy",
    };
  }
  if (/\b(yes|yeah|yep|ok|okay|sure)\b/.test(t)) {
    return {
      speech: "Great! Let's keep going, champion!",
      mood: "encouraging",
    };
  }
  if (/\b(no|nope|nuh)\b/.test(t)) {
    return {
      speech: "That's okay! We can take it slow. I am right here.",
      mood: "encouraging",
    };
  }
  if (/\b(hungry|food|eat|snack)\b/.test(t)) {
    return {
      speech:
        "Cheese for Jummi, fish for me. But words are the best snack of all!",
      mood: "happy",
    };
  }
  if (/\b(tired|sleep|sleepy|nap)\b/.test(t)) {
    return {
      speech: "A little rest is good. I will be here when you wake up.",
      mood: "encouraging",
    };
  }
  if (/\b(hi|hello|hey|yo|hola)\b/.test(t)) {
    return {
      speech: "Hello, friend! I am Toffy the cat. What shall we do today?",
      mood: "curious",
    };
  }
  if (/^[a-z]+$/.test(t) && t.length <= 12) {
    return {
      speech: `"${t}" is a great word! You said it so well.`,
      mood: "happy",
    };
  }
  return {
    speech: "Wow, you are talking so well! Tell me more!",
    mood: "curious",
  };
}

export function buddyWordRound(spoken, target) {
  const distance = wordDistance(spoken, target);
  if (distance === 0) {
    return {
      status: "correct",
      mood: "happy",
      speech: "Perfect! You read it! You are a star!",
    };
  }
  if (distance <= 1) {
    return {
      status: "close",
      mood: "encouraging",
      speech: `So close! Say it with me: ${target}.`,
    };
  }
  return {
    status: "missed",
    mood: "encouraging",
    speech: `That one is tricky! Let's try it slowly: ${target}.`,
  };
}

export function pickBuddyWord(avoid) {
  const pool = BUDDY_WORDS.filter((w) => w !== avoid);
  return pool[Math.floor(Math.random() * pool.length)] || BUDDY_WORDS[0];
}
