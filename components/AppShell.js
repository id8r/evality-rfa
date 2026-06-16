"use client";

import { useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { SIDEBAR_DIMENSIONS, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_LAYOUT } from "@/lib/FxTheme";
import { readStoredValue, writeStoredValue } from "@/lib/FxUtils";

export function AppShell({ children, title, navbarLeading = null, navbarActions = null }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return readStoredValue(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true";
  });
  const sidebarWidth = isCollapsed ? SIDEBAR_DIMENSIONS.COLLAPSED : SIDEBAR_DIMENSIONS.EXPANDED;

  function handleToggleSidebar() {
    setIsCollapsed((currentValue) => {
      const nextValue = !currentValue;

      writeStoredValue(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(nextValue));

      return nextValue;
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} width={sidebarWidth} />

      <div
        className="flex min-w-0 flex-1 flex-col overflow-hidden transition-[padding-left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ paddingLeft: sidebarWidth }}
      >
        <Navbar title={title} leading={navbarLeading} actions={navbarActions} />

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className={`${FX_LAYOUT.appContent} flex h-full min-h-0 min-w-0 flex-col overflow-hidden`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
