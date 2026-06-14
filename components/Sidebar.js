/* components/Sidebar.js | Left sidebar navigation | Sree | 2026-06-10*/

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleHelp, LogOut, Settings2 } from "lucide-react";

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
  getSidebarNavItems,
  ROUTES,
} from "@/lib/FxConstants";
import { FX_LAYOUT, FX_NAVIGATION, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { clearAuthAndOnboardingState } from "@/lib/FxStore";

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
  const navItems = getSidebarNavItems();

  function handleLogout() {
    clearAuthAndOnboardingState();
    window.dispatchEvent(new Event("fx-auth-change"));

    router.replace(ROUTES.LANDING);
    router.refresh();
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-background px-[16px] py-[16px] transition-[width] duration-200 ${isCollapsed ? FX_LAYOUT.sidebarCollapsedWidth : FX_LAYOUT.sidebarExpandedWidth
        }`}
    >
      <div className="mb-[24px] flex items-center justify-between gap-[8px] overflow-hidden">
        {isCollapsed ? (
          <button
            type="button"
            className="group relative flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onToggle}
            aria-label="Expand sidebar"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/evality-logo.svg"
              alt={APP_SHORT_NAME}
              className="h-[24px] w-auto shrink-0 transition-opacity duration-150 group-hover:opacity-0"
            />
            <ChevronRight className="absolute size-[24px] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
          </button>
        ) : (
          <>
            <Link href={ROUTES.ACTION_CENTER} className="inline-flex h-[40px] min-w-0 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/evality-logo.svg" alt={APP_SHORT_NAME} className="h-[32px] w-auto shrink-0" />
            </Link>

            <button
              type="button"
              className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={onToggle}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-[24px]" />
            </button>
          </>
        )}
      </div>

      <nav className="flex flex-col gap-[8px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isJobsRoute =
            pathname === ROUTES.APP ||
            pathname === ROUTES.JOBS ||
            pathname.startsWith(`${ROUTES.JOBS}/`);
          const isActive = item.id === "jobs" ? isJobsRoute : pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`${FX_NAVIGATION.itemBase} ${FX_TYPOGRAPHY.button} ${isActive ? FX_NAVIGATION.itemActive : FX_NAVIGATION.itemInactive}`}
            >
              <span className={FX_NAVIGATION.iconSlot}>
                <Icon className="size-[24px] shrink-0" />
              </span>
              <span
                className={`whitespace-nowrap transition-[opacity,transform] duration-200 ${isCollapsed
                  ? "pointer-events-none translate-x-[-8px] opacity-0"
                  : "translate-x-0 opacity-100"
                  }`}
              >
                {item.label}
              </span>
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

      <div className="space-y-[8px]">
        <Link
          href={ROUTES.SETTINGS}
          title={isCollapsed ? "Settings" : undefined}
          className={`${FX_NAVIGATION.footerButton} ${isCollapsed ? FX_NAVIGATION.footerButtonCollapsed : FX_NAVIGATION.footerButtonExpanded} ${pathname === ROUTES.SETTINGS ? FX_NAVIGATION.itemActive : FX_NAVIGATION.itemInactive}`}
        >
          <span className={FX_NAVIGATION.iconSlot}>
            <Settings2 className="size-[16px]" />
          </span>
          <span
            className={`whitespace-nowrap transition-[opacity,transform] duration-200 ${isCollapsed
              ? "pointer-events-none translate-x-[-8px] opacity-0"
              : "translate-x-0 opacity-100"
              }`}
          >
            Settings
          </span>
        </Link>

        <div className={`${FX_NAVIGATION.footerSeparator} pt-[16px] ${isCollapsed ? "flex justify-center" : ""}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`${FX_NAVIGATION.footerButton} ${isCollapsed ? FX_NAVIGATION.footerButtonCollapsed : FX_NAVIGATION.footerButtonExpanded}`}
              >
                <Avatar name={DEMO_USER.name} />
                <div
                  className={`min-w-0 flex-1 transition-[opacity,transform] duration-200 ${isCollapsed
                    ? "pointer-events-none translate-x-[-8px] opacity-0"
                    : "translate-x-0 opacity-100"
                    }`}
                >
                  <p className={`truncate ${FX_TYPOGRAPHY.sidebarName} text-[var(--fx-text)]`}>{DEMO_USER.name}</p>
                  <p className={`truncate ${FX_TYPOGRAPHY.sidebarEmail} text-[var(--fx-text-muted)]`}>{DEMO_USER.email}</p>
                </div>
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
      </div>
    </aside>
  );
}

/* - - - - - - - - - - - - - - - - */
