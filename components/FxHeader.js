/*
components/FxHeader.js | Minimal public header | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import Link from "next/link";

import { fxButtonClassName } from "@/components/FxButton";
import { FxThemeToggle } from "@/components/FxThemeToggle";
import { APP_SHORT_NAME, LABELS, LAYOUT, ROUTES } from "@/lib/FxConstants";
import { FX_RADIUS, FX_SPACE, FX_SURFACE } from "@/lib/FxTheme";

export function FxHeader({ onAuthOpen }) {
  return (
    <header className={`${LAYOUT.HEADER_SHELL} ${FX_SURFACE.header}`}>
      <div className={`${LAYOUT.SITE_CONTAINER} ${LAYOUT.HEADER_ROW}`}>
        <Link href={ROUTES.LANDING} className="inline-flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/evality-logo.svg" alt={APP_SHORT_NAME} className="h-[44px] w-auto" />
        </Link>

        <div className={`flex items-center ${FX_SPACE.GAP_16}`}>
          <FxThemeToggle />
          <button
            type="button"
            className={fxButtonClassName({ size: "md", className: FX_RADIUS.xs })}
            onClick={() => onAuthOpen("signup")}
          >
            {LABELS.GET_STARTED}
          </button>
          <button
            type="button"
            className={fxButtonClassName({
              size: "md",
              variant: "outline",
              className: FX_RADIUS.xs,
            })}
            onClick={() => onAuthOpen("login")}
          >
            {LABELS.LOGIN}
          </button>
        </div>
      </div>
    </header>
  );
}

/* - - - - - - - - - - - - - - - - */
