/*
lib/utils.ts | Shared className utility helpers | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* - - - - - - - - - - - - - - - - */
