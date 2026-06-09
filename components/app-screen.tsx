/*
components/app-screen.tsx | Shareable top-level screen wrapper | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

export function AppScreen({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

/* - - - - - - - - - - - - - - - - */
