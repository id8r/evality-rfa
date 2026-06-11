/* components/Sidebar.js | Left sidebar navigation | Sree | 2026-06-10*/

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ChevronLeft, ChevronRight, FileText, FolderOpen, Inbox, Users } from "lucide-react";

import { useRouter } from "next/navigation";

import {
  APP_SHORT_NAME,
  DEMO_USER,
  NAV_ITEMS,
  ROUTES,
  SIDEBAR_COLLAPSED_WIDTH_CLASS,
  SIDEBAR_EXPANDED_WIDTH_CLASS,
  STORAGE_KEYS
} from "@/lib/FxConstants";

const NAV_ICONS = {
  briefcase: Briefcase,
  fileText: FileText,
  users: Users,
  folderOpen: FolderOpen,
  inbox: Inbox,
};

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[var(--fx-bg-soft)] text-[13px] font-semibold text-[var(--fx-text)]">
      {initials}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */



export function Sidebar({ isCollapsed, onToggle }) {
  const pathname = usePathname();

  const router = useRouter();

function handleLogout() {
  window.localStorage.removeItem(STORAGE_KEYS.AUTH_COMPLETE);
  router.push(ROUTES.LANDING);
}

/* - - - - - - - - - - - - - - - - */

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-background px-[12px] py-[16px] transition-[width] duration-200 ${
        isCollapsed ? SIDEBAR_COLLAPSED_WIDTH_CLASS : SIDEBAR_EXPANDED_WIDTH_CLASS
      }`}
    >
      <div className={`mb-[24px] flex items-center ${isCollapsed ? "justify-center" : "justify-between"} gap-[8px]`}>
        {isCollapsed ? (
          <button
            type="button"
            className="group relative flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onToggle}
            aria-label="Expand sidebar"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.evality.ai/logo.svg"
              alt={APP_SHORT_NAME}
              className="h-[32px] w-auto shrink-0 transition-opacity duration-150 group-hover:opacity-0"
            />
            <ChevronRight className="absolute size-[20px] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
          </button>
        ) : (
          <>
            <Link href={ROUTES.LANDING} className="inline-flex min-w-0 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.evality.ai/logo.svg" alt={APP_SHORT_NAME} className="h-[32px] w-auto shrink-0" />
            </Link>

            <button
              type="button"
              className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={onToggle}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-[20px]" />
            </button>
          </>
        )}
      </div>

      <nav className="flex flex-col gap-[4px]">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.icon];
          const isCreateJobRoute = pathname === ROUTES.APP || pathname === ROUTES.CREATE_JOB;
          const isActive = item.id === "create-job" ? isCreateJobRoute : pathname === item.href;
          const sharedClasses = `group relative flex h-[44px] items-center rounded-[10px] px-[12px] text-sm font-medium transition-colors ${
            isCollapsed ? "justify-center" : "gap-[12px]"
          }`;

          return (
            <Link
              key={item.id}
              href={item.disabled ? ROUTES.LANDING : item.href}
              title={isCollapsed ? item.label : undefined}
              className={`${sharedClasses} ${
                item.disabled
                  ? "cursor-not-allowed text-muted-foreground opacity-50"
                  : isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
              }`}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="size-[20px]" />
              {!isCollapsed ? <span>{item.label}</span> : null}
              {isCollapsed ? (
                <span className="pointer-events-none absolute left-[52px] top-1/2 hidden -translate-y-1/2 rounded-[8px] border border-border bg-background px-[10px] py-[6px] text-[12px] font-medium text-foreground shadow-sm group-hover:block">
                  {item.label}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className={`border-t border-border pt-[16px] ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-[12px]"}`}>
          <Avatar name={DEMO_USER.name} />
          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground">{DEMO_USER.name}</p>
              <p className="truncate text-[12px] text-muted-foreground">{DEMO_USER.email}</p>
              <button
  type="button"
  onClick={handleLogout}
  className="mt-[4px] text-left text-[12px] text-muted-foreground hover:text-foreground"
>
  Logout
</button>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

/* - - - - - - - - - - - - - - - - */