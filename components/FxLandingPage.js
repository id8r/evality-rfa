/*
components/FxLandingPage.js | Landing page auth surface | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { useState } from "react";

import { FxAuthDialog } from "@/components/FxAuthDialog";
import { FxButton } from "@/components/FxButton";
import { FxHeader } from "@/components/FxHeader";
import { APP_TAGLINE, LANDING_CONTENT_WIDTH_CLASS, LANDING_HEADLINE, LABELS, LAYOUT } from "@/lib/FxConstants";
import { FX_SPACE, FX_SURFACE } from "@/lib/FxTheme";

export function FxLandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState("signup");

  function handleAuthOpen(intent = "signup") {
    setAuthIntent(intent);
    setIsAuthOpen(true);
  }

  return (
    <div className={`min-h-screen ${FX_SURFACE.page}`}>
      <div className={LAYOUT.PAGE_FRAME}>
        <FxHeader onAuthOpen={handleAuthOpen} />

        <main className={LAYOUT.LANDING_MAIN}>
          <section className="w-full">
            <div className={`${LANDING_CONTENT_WIDTH_CLASS} ${FX_SPACE.GAP_24} flex flex-col`}>
              <h1 className="text-5xl font-semibold text-foreground sm:text-6xl">{LANDING_HEADLINE}</h1>
              <p className={`max-w-[560px] text-lg leading-8 ${FX_SURFACE.mutedText}`}>{APP_TAGLINE}</p>
              <div className="flex items-center">
                <FxButton
                  className="h-[44px] rounded-full bg-primary px-[24px] text-primary-foreground hover:bg-primary/90"
                  size="lg"
                  onClick={() => handleAuthOpen("signup")}
                >
                  {LABELS.GET_STARTED}
                </FxButton>
              </div>
            </div>
          </section>
        </main>
      </div>

      <FxAuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} showTrigger={false} intent={authIntent} />
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
