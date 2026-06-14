/* components/FxProtectedAppPage.js | Authenticated app route guard and shell | Sree | 2026-06-11 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { getPageMeta, ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_SURFACE } from "@/lib/FxTheme";
import { readStoredValue } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

export function FxProtectedAppPage({ children, pageId = "jobs", title = null, navbarLeading = null, navbarActions = null }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const pageMeta = getPageMeta(pageId);
  const pageTitle = title === false ? null : title ?? pageMeta?.pageTitle ?? "Evality";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const authFlag = readStoredValue(STORAGE_KEYS.AUTH_COMPLETE);

    if (!authFlag) {
      router.replace(ROUTES.LANDING);
      router.refresh();
      return;
    }

    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return <div className={`min-h-screen ${FX_SURFACE.page}`} />;
  }

  return (
    <AppShell title={pageTitle} navbarLeading={navbarLeading} navbarActions={navbarActions}>
      {children}
    </AppShell>
  );
}
/* - - - - - - - - - - - - - - - - */
