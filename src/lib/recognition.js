export function isRecognitionSupported() {
  return Boolean(
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition),
  );
}

const ERROR_MESSAGES = {
  "not-allowed":
    "Mic permission is blocked. Tap the lock icon in the address bar and allow the microphone.",
  "service-not-allowed":
    "Mic permission is blocked. Tap the lock icon in the address bar and allow the microphone.",
  "audio-capture":
    "No microphone was found. Check that one is connected, then try again.",
  network:
    "Voice chat needs the internet. Check your connection and try again.",
  "no-speech": "I did not hear you. Speak a little louder, then try again.",
  aborted: null,
};

export function listenOnce({
  onStart,
  onResult,
  onError,
  timeoutMs = 9000,
} = {}) {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  let settled = false;
  let timer = null;

  const finish = (fn) => {
    if (settled) return;
    settled = true;
    if (timer) clearTimeout(timer);
    fn?.();
  };

  rec.onstart = () => {
    if (!settled) onStart?.();
  };
  rec.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((r) => r[0].transcript)
      .join(" ");
    finish(() => onResult?.(transcript));
  };
  rec.onerror = (event) => {
    const code = event?.error;
    const message =
      ERROR_MESSAGES[code] === null
        ? null
        : ERROR_MESSAGES[code] ||
          "I could not hear you. Check the microphone and try again.";
    finish(() => onError?.(code, message));
  };
  rec.onend = () => finish();

  timer = setTimeout(
    () =>
      finish(() =>
        onError?.(
          "timeout",
          "I could not hear anything. Check the microphone and try again.",
        ),
      ),
    timeoutMs,
  );

  rec.start();
  return {
    stop: () => {
      finish(() => rec.stop());
    },
    isActive: () => !settled,
  };
}
