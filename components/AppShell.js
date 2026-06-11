/*
components/AppShell.js | Main app shell with sidebar and navbar | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

// import { useEffect, useState } from "react";
import { useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { LAYOUT, SIDEBAR_COLLAPSED_OFFSET_CLASS, SIDEBAR_EXPANDED_OFFSET_CLASS, STORAGE_KEYS } from "@/lib/FxConstants";

export function AppShell({ children, title }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true";
});

function handleToggleSidebar() {
  setIsCollapsed((currentValue) => {
    const nextValue = !currentValue;

    window.localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(nextValue));

    return nextValue;
  });
}

/* - - - - - - - - - - - - - - - - */

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-[padding-left] duration-200 ${
          isCollapsed ? SIDEBAR_COLLAPSED_OFFSET_CLASS : SIDEBAR_EXPANDED_OFFSET_CLASS
        }`}
      >
        <Navbar title={title} />

        <main className="min-h-0 flex-1 overflow-auto">
          <div className={LAYOUT.APP_CONTENT}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
