/*
components/FxThemeController.js | Root theme synchronizer | Sree | 2026-06-11
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { useEffect } from "react";

import { STORAGE_KEYS, THEMES } from "@/lib/FxConstants";
import { readStoredValue } from "@/lib/FxUtils";

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === THEMES.DARK);
}

function getStoredTheme() {
  return readStoredValue(STORAGE_KEYS.THEME);
}

export function FxThemeController() {
  useEffect(() => {
    function syncTheme() {
      const storedTheme = getStoredTheme();

      if (storedTheme === THEMES.DARK || storedTheme === THEMES.LIGHT) {
        applyTheme(storedTheme);
      }
    }

    syncTheme();

    const intervalId = window.setInterval(syncTheme, 400);

    window.addEventListener("storage", syncTheme);
    window.addEventListener("focus", syncTheme);
    window.addEventListener("fx-theme-change", syncTheme);
    document.addEventListener("visibilitychange", syncTheme);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("focus", syncTheme);
      window.removeEventListener("fx-theme-change", syncTheme);
      document.removeEventListener("visibilitychange", syncTheme);
    };
  }, []);

  return null;
}

/* - - - - - - - - - - - - - - - - */
