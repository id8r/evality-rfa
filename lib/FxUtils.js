/* lib/FxUtils.js | Shared utility helpers | Sree | 2026-06-10 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
/* - - - - - - - - - - - - - - - - */

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function dispatchStoredChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("fx-storage-change"));
}

export function readStoredValue(key) {
  if (!canUseLocalStorage()) {
    return null;
  }

  return window.localStorage.getItem(key);
}

export function writeStoredValue(key, value) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(key, value);
  dispatchStoredChange();
}

export function removeStoredValue(key) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
  dispatchStoredChange();
}

export function hasStoredValue(key) {
  return Boolean(readStoredValue(key));
}

export function readStoredJSON(key) {
  const raw = readStoredValue(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeStoredJSON(key, value) {
  writeStoredValue(key, JSON.stringify(value));
}

/* - - - - - - - - - - - - - - - - */
