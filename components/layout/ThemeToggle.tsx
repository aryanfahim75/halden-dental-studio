"use client";

import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";
const KEY = "halden.theme";
const ORDER: Mode[] = ["system", "light", "dark"];

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY) as Mode | null;
      if (saved && ORDER.includes(saved)) setMode(saved);
    } catch {
      setMode("system");
    }
  }, []);

  const apply = (m: Mode) => {
    const root = document.documentElement;
    if (m === "system") delete root.dataset.theme;
    else root.dataset.theme = m;
  };

  useEffect(() => {
    apply(mode);
    try {
      window.localStorage.setItem(KEY, mode);
    } catch {}
  }, [mode]);

  const next = () => setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);

  return (
    <button type="button" className="theme-toggle" onClick={next}>
      Theme: {mode}
    </button>
  );
}
