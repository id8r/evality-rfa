/* components/FxProtectedAppPage.js | Authenticated app route guard and shell | Sree | 2026-06-11 */

"use client";

import { useEffect, useSyncExternalStore } from "react";

import { AppShell } from "@/components/AppShell";
import { getPageMeta, ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_SURFACE } from "@/lib/FxTheme";
import { readStoredValue } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function subscribeToAuthChange(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener("fx-auth-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("fx-auth-change", onStoreChange);
  };
}

function readStoredAuthStatus() {
  return typeof window !== "undefined" && Boolean(readStoredValue(STORAGE_KEYS.AUTH_COMPLETE));
}

export function FxProtectedAppPage({ children, pageId = "jobs", title = null, navbarLeading = null, navbarActions = null }) {
  const pageMeta = getPageMeta(pageId);
  const pageTitle = title === false ? null : title ?? pageMeta?.pageTitle ?? "Evality";
  const isAuthenticated = useSyncExternalStore(subscribeToAuthChange, readStoredAuthStatus, () => false);
  const isHydrated = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      window.location.replace(ROUTES.LANDING);
    }
  }, [isAuthenticated, isHydrated]);

  if (!isHydrated || !isAuthenticated) {
    return <div className={`min-h-screen ${FX_SURFACE.page}`} />;
  }

  return (
    <AppShell
      title={pageTitle}
      navbarLeading={navbarLeading}
      navbarActions={navbarActions}
      mainScroll={pageId === "settings" ? "hidden" : "auto"}
      contentPaddingYClassName={pageId === "settings" ? "py-0" : "py-[32px]"}
    >
      {children}
    </AppShell>
  );
}
/* - - - - - - - - - - - - - - - - */
