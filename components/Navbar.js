/*
components/Navbar.js | Top navbar with page title only | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { NAVBAR_HEIGHT_CLASS, PAGE_PADDING_X_CLASS } from "@/lib/FxConstants";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

export function Navbar({ title, leading = null, actions = null }) {
  return (
    <header className={`sticky top-0 z-20 flex ${NAVBAR_HEIGHT_CLASS} items-center justify-between border-b border-border bg-background ${PAGE_PADDING_X_CLASS}`}>
      <div className="flex min-w-0 items-center gap-[12px]">
        {leading ? <div className="flex shrink-0 items-center">{leading}</div> : null}
        {title ? <h1 className={`${FX_TYPOGRAPHY.navTitle} min-w-0 truncate text-foreground`}>{title}</h1> : null}
      </div>
      <div className="flex items-center gap-[12px]">{actions}</div>
    </header>
  );
}

/* - - - - - - - - - - - - - - - - */
