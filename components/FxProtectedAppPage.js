/* components/FxProtectedAppPage.js | Authenticated app route guard and shell | Sree | 2026-06-11 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { getPageMeta, ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_SURFACE } from "@/lib/FxTheme";
import { ensureDemoStore } from "@/lib/FxStore";
import { readStoredValue } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

export function FxProtectedAppPage({ children, pageId = "jobs", title = null, navbarLeading = null, navbarActions = null }) {
  const router = useRouter();
  const pageMeta = getPageMeta(pageId);
  const pageTitle = title === false ? null : title ?? pageMeta?.pageTitle ?? "Evality";
  const isAuthenticated = typeof window !== "undefined" && Boolean(readStoredValue(STORAGE_KEYS.AUTH_COMPLETE));

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.LANDING);
      router.refresh();
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    ensureDemoStore();
  }

  if (!isAuthenticated) {
    return <div className={`min-h-screen ${FX_SURFACE.page}`} />;
  }

  return (
    <AppShell title={pageTitle} navbarLeading={navbarLeading} navbarActions={navbarActions}>
      {children}
    </AppShell>
  );
}
/* - - - - - - - - - - - - - - - - */
