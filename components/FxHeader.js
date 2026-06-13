/*
components/FxHeader.js | Minimal public header | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import Link from "next/link";

import { FxButton } from "@/components/FxButton";
import { FxThemeToggle } from "@/components/FxThemeToggle";
import { APP_SHORT_NAME, ROUTES } from "@/lib/FxConstants";
import { FX_LAYOUT, FX_SPACE, FX_SURFACE } from "@/lib/FxTheme";
import { LANDING_COPY } from "@/lib/FxCopy";

export function FxHeader({ onAuthOpen }) {
  return (
    <header className={`${FX_LAYOUT.headerShell} ${FX_SURFACE.header}`}>
      <div className={`${FX_LAYOUT.siteContainer} ${FX_LAYOUT.headerRow}`}>
        <Link href={ROUTES.LANDING} className="inline-flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/evality-logo.svg" alt={APP_SHORT_NAME} className="h-[44px] w-auto" />
        </Link>

        <nav className="hidden items-center gap-[24px] md:flex lg:gap-[32px]">
          {LANDING_COPY.navLinks.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full px-[10px] py-[6px] text-[14px] leading-[22px] font-medium text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-bg-soft)] hover:text-[var(--fx-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className={`flex items-center ${FX_SPACE.GAP_16}`}>
          <FxThemeToggle />
          <FxButton size="md" className="min-w-[120px] whitespace-nowrap" onClick={() => onAuthOpen("signup")}>
            {LANDING_COPY.hero.cta}
          </FxButton>
          <FxButton
            size="md"
            variant="outline"
            className="min-w-[96px] whitespace-nowrap"
            onClick={() => onAuthOpen("login")}
          >
            {LANDING_COPY.hero.login}
          </FxButton>
        </div>
      </div>
    </header>
  );
}

/* - - - - - - - - - - - - - - - - */
