/*
components/Navbar.js | Top navbar with page title only | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { cn } from "@/lib/FxUtils";
import { FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";

export function Navbar({ title, leading = null, actions = null, className = "" }) {
  return (
    <header
      className={cn(
        `sticky top-0 z-40 flex ${FX_LAYOUT.navbarHeight} items-center justify-between border-b border-border bg-background ${FX_LAYOUT.pagePaddingX}`,
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-[16px]">
        {leading ? <div className="flex shrink-0 items-center">{leading}</div> : null}
        {title ? <h1 className={`${FX_TYPOGRAPHY.navTitle} min-w-0 truncate text-foreground`}>{title}</h1> : null}
      </div>
      <div className="flex items-center gap-[16px]">{actions}</div>
    </header>
  );
}

/* - - - - - - - - - - - - - - - - */
