/*
components/app-shell.tsx | Shared product navigation shell | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, Search } from "lucide-react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { primaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dce6ef,transparent_24%),linear-gradient(180deg,#f8fbfd_0%,#eef4f7_100%)] dark:bg-[radial-gradient(circle_at_top_left,#1e293b,transparent_20%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/60 lg:flex">
          <div className="pb-8">
            <Logo />
          </div>
          <nav className="space-y-2">
            {primaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-3xl border border-border/70 bg-background/70 p-5">
            <p className="text-sm font-semibold">Prototype scope</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Navigation, mock data, and layout primitives only. No backend or hidden workflows.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-4 z-20 mb-6 rounded-[1.75rem] border border-white/70 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 lg:hidden">
                <Logo compact />
                <span className="text-sm font-medium text-muted-foreground">Evality RFA</span>
              </div>
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-11" placeholder="Search jobs, candidates, or client context" />
              </div>
              <div className="flex items-center gap-3">
                <Link href="/first-job" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Add job
                </Link>
                <Link href="/candidate-intelligence" className={buttonVariants({ size: "sm" })}>
                  View AI flow
                </Link>
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                </button>
                <ThemeToggle />
                <Avatar initials="SR" />
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {primaryNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap",
                    pathname === item.href
                      ? "bg-foreground text-background"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
