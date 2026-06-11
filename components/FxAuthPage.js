/*
components/FxAuthPage.js | Shared public-only auth route surface | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FxAuthDialog } from "@/components/FxAuthDialog";
import { LAYOUT, ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_SURFACE } from "@/lib/FxTheme";

export function FxAuthPage({ intent = "signup" }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const authFlag = window.localStorage.getItem(STORAGE_KEYS.AUTH_COMPLETE);

    if (authFlag) {
      router.replace(intent === "signup" ? ROUTES.CREATE_JOB : ROUTES.ACTION_CENTER);
      router.refresh();
      return;
    }

    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return <div className={`min-h-screen ${FX_SURFACE.page}`} />;
  }

  return (
    <div className={`min-h-screen ${FX_SURFACE.page}`}>
      <div className={LAYOUT.PAGE_FRAME}>
        <main className={LAYOUT.AUTH_PAGE_MAIN}>
          <FxAuthDialog defaultOpen showTrigger={false} intent={intent} />
        </main>
      </div>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
