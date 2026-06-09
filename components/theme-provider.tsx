/*
components/theme-provider.tsx | App theme provider wrapper | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

/* - - - - - - - - - - - - - - - - */
