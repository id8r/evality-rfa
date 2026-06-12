"use client";

import { useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { LAYOUT, SIDEBAR_COLLAPSED_OFFSET_CLASS, SIDEBAR_EXPANDED_OFFSET_CLASS, STORAGE_KEYS } from "@/lib/FxConstants";
import { readStoredValue, writeStoredValue } from "@/lib/FxUtils";

export function AppShell({ children, title, navbarLeading = null, navbarActions = null }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return readStoredValue(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true";
  });

  function handleToggleSidebar() {
    setIsCollapsed((currentValue) => {
      const nextValue = !currentValue;

      writeStoredValue(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(nextValue));

      return nextValue;
    });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-[padding-left] duration-200 ${
          isCollapsed ? SIDEBAR_COLLAPSED_OFFSET_CLASS : SIDEBAR_EXPANDED_OFFSET_CLASS
        }`}
      >
        <Navbar title={title} leading={navbarLeading} actions={navbarActions} />

        <main className="min-h-0 flex-1 overflow-auto">
          <div className={LAYOUT.APP_CONTENT}>{children}</div>
        </main>
      </div>
    </div>
  );
}
