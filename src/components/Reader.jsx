import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeech } from "../hooks/useSpeech.js";
import { wordIndexAtChar } from "../lib/text.js";

const FALLBACK_MS_PER_WORD = 450;

export function Reader({ sentences, onCompleted, autoPlay = false }) {
  const { speak, stop } = useSpeech();
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const fallbackTimer = useRef(null);
  const doneRef = useRef(false);

  const sentence = sentences[sentenceIdx] ?? "";

  const clearFallback = () => {
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  };

  const playSentence = useCallback(
    (index, startFromBeginning = true) => {
      const text = sentences[index];
      if (!text) return;
      clearFallback();
      setSentenceIdx(index);
      setWordIdx(startFromBeginning ? 0 : 0);
      setPlaying(true);
      speak(text, {
        onBoundary: (event) => {
          setWordIdx(
            Math.min(
              wordIndexAtChar(text, event.charIndex),
              text.split(/\s+/).length - 1,
            ),
          );
        },
        onEnd: () => {
          setPlaying(false);
          if (index < sentences.length - 1) {
            setSentenceIdx(index + 1);
            setWordIdx(0);
          } else if (!doneRef.current) {
            doneRef.current = true;
            onCompleted?.();
          }
        },
      });
      const wordCount = text.split(/\s+/).length;
      fallbackTimer.current = setTimeout(() => {
        setPlaying(false);
        if (index < sentences.length - 1) {
          setSentenceIdx(index + 1);
          setWordIdx(0);
        } else if (!doneRef.current) {
          doneRef.current = true;
          onCompleted?.();
        }
      }, wordCount * FALLBACK_MS_PER_WORD);
    },
    [sentences, speak, onCompleted],
  );

  const togglePlay = () => {
    if (playing) {
      clearFallback();
      stop();
      setPlaying(false);
      return;
    }
    doneRef.current = false;
    playSentence(sentenceIdx);
  };

  const jumpTo = (index) => {
    stop();
    setPlaying(false);
    setSentenceIdx(index);
    setWordIdx(0);
  };

  useEffect(() => {
    if (autoPlay) playSentence(0);
    return () => clearFallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const words = sentence ? sentence.split(/\s+/) : [];

  return (
    <div>
      <p className="text-center text-sm text-text-muted">
        Sentence {sentenceIdx + 1} of {sentences.length}
      </p>
      <div className="card-clay mt-2 flex flex-wrap items-center justify-center gap-2 p-6">
        {words.map((word, index) => {
          const isActive = playing && index === wordIdx;
          return (
            <button
              key={`${index}-${word}`}
              type="button"
              onClick={() => {
                stop();
                setPlaying(false);
                speak(word);
              }}
              aria-label={`Hear the word ${word}`}
              className={`rounded-lg px-2 py-1 font-display text-2xl font-bold leading-relaxed transition ${
                isActive
                  ? "bg-primary-light text-primary-dark"
                  : "text-text hover:bg-surface-strong"
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="btn-clay"
          onClick={togglePlay}
          aria-pressed={playing}
        >
          {playing ? "⏸ Pause" : "▶ Listen"}
        </button>
        <button
          type="button"
          className="btn-clay btn-clay--ghost"
          onClick={() => jumpTo(Math.max(0, sentenceIdx - 1))}
          disabled={sentenceIdx === 0}
        >
          ◀ Previous
        </button>
        <button
          type="button"
          className="btn-clay btn-clay--ghost"
          onClick={() =>
            jumpTo(Math.min(sentences.length - 1, sentenceIdx + 1))
          }
          disabled={sentenceIdx === sentences.length - 1}
        >
          Next ▶
        </button>
        <button
          type="button"
          className="btn-clay btn-clay--ghost"
          onClick={() => jumpTo(0)}
        >
          ↺ Restart
        </button>
      </div>
    </div>
  );
}
