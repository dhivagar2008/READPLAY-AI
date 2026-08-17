import { useEffect, useState } from "react";

const STORAGE_KEY = "playlearn:a11y";
const FONT_ATTR = "data-font";
const SIZE_ATTR = "data-size";

export function useA11y() {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore corrupt storage */
    }
    return { font: "friendly", size: "medium" };
  });

  useEffect(() => {
    document.documentElement.setAttribute(FONT_ATTR, settings.font);
    document.documentElement.setAttribute(SIZE_ATTR, settings.size);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable — settings still apply this session */
    }
  }, [settings]);

  const cycleSize = () => {
    const order = ["small", "medium", "large"];
    const next = order[(order.indexOf(settings.size) + 1) % order.length];
    setSettings((s) => ({ ...s, size: next }));
  };

  const toggleFont = () =>
    setSettings((s) => ({
      ...s,
      font: s.font === "friendly" ? "readable" : "friendly",
    }));

  return { ...settings, cycleSize, toggleFont };
}
