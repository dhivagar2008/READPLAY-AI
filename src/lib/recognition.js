export function isRecognitionSupported() {
  return Boolean(
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition),
  );
}

export function createRecognizer() {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}
