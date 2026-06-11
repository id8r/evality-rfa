/*
components/FxThemeToggle.js | Light dark theme toggle | Sree | 2026-06-11
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { STORAGE_KEYS, THEMES } from "@/lib/FxConstants";

function getThemeFromDom() {
  if (typeof document === "undefined") {
    return THEMES.LIGHT;
  }

  return document.documentElement.classList.contains("dark") ? THEMES.DARK : THEMES.LIGHT;
}

export function FxThemeToggle() {
  const [theme, setTheme] = useState(THEMES.LIGHT);

  useEffect(() => {
    setTheme(getThemeFromDom());
  }, []);

  function handleToggleTheme() {
    if (typeof window === "undefined") {
      return;
    }

    const nextTheme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    const root = document.documentElement;

    root.classList.toggle("dark", nextTheme === THEMES.DARK);
    window.localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
    window.dispatchEvent(new Event("fx-theme-change"));
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={handleToggleTheme}
      className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[8px] border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
      aria-label={theme === THEMES.DARK ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === THEMES.DARK ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === THEMES.DARK ? <Sun className="size-[16px]" /> : <Moon className="size-[16px]" />}
    </button>
  );
}

/* - - - - - - - - - - - - - - - - */
