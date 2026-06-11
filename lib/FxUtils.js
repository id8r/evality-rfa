/*
lib/FxUtils.js | Shared utility helpers | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateValue) {
  const date = new Date(dateValue);
  const diff = Math.max(0, Date.now() - date.getTime());
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) {
    return "Updated just now";
  }

  if (hours < 24) {
    return `Updated ${hours}h ago`;
  }

  return `Updated ${days}d ago`;
}

export function makeHandle(name) {
  return `@${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "")}`;
}

/* - - - - - - - - - - - - - - - - */
