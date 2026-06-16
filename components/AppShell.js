"use client";

import { useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { SIDEBAR_DIMENSIONS, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_LAYOUT } from "@/lib/FxTheme";
import { cn, readStoredValue, writeStoredValue } from "@/lib/FxUtils";

export function AppShell({
  children,
  title,
  navbarLeading = null,
  navbarActions = null,
  mainScroll = "auto",
  contentPaddingYClassName = "py-[32px]",
  shellClassName = "bg-[var(--fx-bg-soft)]",
  sidebarClassName = "",
  navbarClassName = "",
  contentClassName = "",
}) {
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
    <div className={cn("flex h-screen overflow-hidden text-foreground", shellClassName)}>
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} width={sidebarWidth} className={sidebarClassName} />

      <div
        className="flex min-w-0 flex-1 flex-col overflow-hidden transition-[padding-left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ paddingLeft: sidebarWidth }}
      >
        <Navbar title={title} leading={navbarLeading} actions={navbarActions} className={navbarClassName} />

        <main className={mainScroll === "hidden" ? "min-h-0 flex-1 overflow-hidden overflow-x-hidden" : "min-h-0 flex-1 overflow-y-auto overflow-x-hidden"}>
          <div className={cn(`${FX_LAYOUT.appContent} ${contentPaddingYClassName} flex h-full min-h-0 min-w-0 flex-col`, contentClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
