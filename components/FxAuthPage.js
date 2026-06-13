/*
components/FxAuthPage.js | Shared public-only auth route surface | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FxAuthDialog } from "@/components/FxAuthDialog";
import { ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_LAYOUT, FX_SURFACE } from "@/lib/FxTheme";
import { readStoredValue } from "@/lib/FxUtils";

export function FxAuthPage({ intent = "signup" }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const authFlag = readStoredValue(STORAGE_KEYS.AUTH_COMPLETE);

    if (authFlag) {
      router.replace(ROUTES.APP);
      router.refresh();
      return;
    }

    setIsReady(true);
  }, [intent, router]);

  if (!isReady) {
    return <div className={`min-h-screen ${FX_SURFACE.page}`} />;
  }

  return (
    <div className={`min-h-screen ${FX_SURFACE.page}`}>
      <div className={FX_LAYOUT.pageFrame}>
        <main className={FX_LAYOUT.authPageMain}>
          <FxAuthDialog defaultOpen showTrigger={false} intent={intent} />
        </main>
      </div>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
