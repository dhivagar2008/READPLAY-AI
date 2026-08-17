import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_RATE = 0.9;
const DEFAULT_PITCH = 1.05;

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const tokenRef = useRef(0);

  useEffect(() => {
    const token = ++tokenRef.current;
    return () => {
      tokenRef.current = token + 1;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (
      text,
      { rate = DEFAULT_RATE, pitch = DEFAULT_PITCH, onBoundary, onEnd } = {},
    ) => {
      if (!("speechSynthesis" in window)) return false;
      const token = ++tokenRef.current;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.onboundary = (event) => {
        if (token === tokenRef.current) onBoundary?.(event);
      };
      const finish = () => {
        if (token === tokenRef.current) {
          setSpeaking(false);
          onEnd?.();
        }
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      setSpeaking(true);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [],
  );

  const stop = useCallback(() => {
    tokenRef.current += 1;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
