/* components/Sidebar.js | Left sidebar navigation | Sree | 2026-06-10*/

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, ChevronLeft, ChevronRight, CircleHelp, FileText, FolderOpen, Inbox, LogOut, Users } from "lucide-react";

import { useFxTheme } from "@/components/FxThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  APP_SHORT_NAME,
  DEMO_USER,
  NAV_ITEMS,
  ROUTES,
  STORAGE_KEYS,
} from "@/lib/FxConstants";
import { FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { removeStoredValue } from "@/lib/FxUtils";

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
    <div className={`flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[var(--fx-bg-soft)] ${FX_TYPOGRAPHY.metaLabel} text-[var(--fx-text)]`}>
      {initials}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

export function Sidebar({ isCollapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, handleToggleTheme } = useFxTheme();

  function handleLogout() {
    if (typeof window !== "undefined") {
      removeStoredValue(STORAGE_KEYS.AUTH_COMPLETE);
      window.dispatchEvent(new Event("fx-auth-change"));
    }

    router.replace(ROUTES.LANDING);
    router.refresh();
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-background px-[16px] py-[16px] transition-[width] duration-200 ${isCollapsed ? FX_LAYOUT.sidebarCollapsedWidth : FX_LAYOUT.sidebarExpandedWidth
        }`}
    >
      <div className={`mb-[24px] flex items-center ${isCollapsed ? "justify-center" : "justify-between"} gap-[8px]`}>
        {isCollapsed ? (
          <button
            type="button"
            className="group relative flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onToggle}
            aria-label="Expand sidebar"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/evality-logo.svg"
              alt={APP_SHORT_NAME}
              className="h-[32px] w-auto shrink-0 transition-opacity duration-150 group-hover:opacity-0"
            />
            <ChevronRight className="absolute size-[20px] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
          </button>
        ) : (
          <>
            <Link href={ROUTES.ACTION_CENTER} className="inline-flex min-w-0 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/evality-logo.svg" alt={APP_SHORT_NAME} className="h-[32px] w-auto shrink-0" />
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

      <nav className="flex flex-col gap-[8px]">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.icon];
          const isJobsRoute =
            pathname === ROUTES.APP ||
            pathname === ROUTES.JOBS ||
            pathname.startsWith(`${ROUTES.JOBS}/`);
          const isActive = item.id === "jobs" ? isJobsRoute : pathname === item.href;
          const sharedClasses = `group relative flex h-[44px] items-center rounded-[8px] px-[16px] ${FX_TYPOGRAPHY.button} transition-colors ${isCollapsed ? "justify-center" : "gap-[16px]"
            }`;

          return (
            <Link
              key={item.id}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`${sharedClasses} ${isActive
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent"
                }`}
            >
              <Icon className="size-[20px]" />
              {!isCollapsed ? <span>{item.label}</span> : null}
              {isCollapsed ? (
                <span className={`pointer-events-none absolute left-[52px] top-1/2 hidden -translate-y-1/2 rounded-[8px] border border-border bg-background px-[8px] py-[8px] ${FX_TYPOGRAPHY.metaLabel} text-foreground shadow-sm group-hover:block`}>
                  {item.label}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className={`border-t border-border pt-[16px] ${isCollapsed ? "flex justify-center" : ""}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
            className={`flex w-full cursor-pointer items-center rounded-[12px] px-[8px] py-[8px] text-left hover:bg-accent ${isCollapsed ? "justify-center" : "gap-[16px]"
                }`}
            >
              <Avatar name={DEMO_USER.name} />
              {!isCollapsed ? (
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${FX_TYPOGRAPHY.sidebarName} text-foreground`}>{DEMO_USER.name}</p>
                  <p className={`truncate ${FX_TYPOGRAPHY.sidebarEmail} text-muted-foreground`}>{DEMO_USER.email}</p>
                </div>
              ) : null}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align={isCollapsed ? "start" : "end"} side="top" className={FX_LAYOUT.accountMenuWidth}>
            <DropdownMenuItem onClick={handleToggleTheme}>
              <span>Theme</span>
              <span className={`ml-auto ${FX_TYPOGRAPHY.metaLabel} text-muted-foreground`}>
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem disabled className="cursor-default opacity-60">
              <CircleHelp className="size-[16px]" />Help
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-[16px]" />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

/* - - - - - - - - - - - - - - - - */
