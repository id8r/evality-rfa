/*
components/Navbar.js | Top navbar with page title only | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { NAVBAR_HEIGHT_CLASS, PAGE_PADDING_X_CLASS } from "@/lib/FxConstants";

export function Navbar({ title }) {
  return (
    <header className={`sticky top-0 z-20 flex ${NAVBAR_HEIGHT_CLASS} items-center justify-between border-b border-border bg-background ${PAGE_PADDING_X_CLASS}`}>
      <h1 className="text-[20px] font-medium text-foreground">{title}</h1>
      <div />
    </header>
  );
}

/* - - - - - - - - - - - - - - - - */
