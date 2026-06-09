/*
components/onboarding-shell.tsx | Shared recruiter journey scaffold | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { recruiterJourney } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export function OnboardingShell({
  title,
  description,
  step,
  children,
  nextHref,
  nextLabel = "Continue",
  backHref,
}: {
  title: string;
  description: string;
  step: number;
  children: ReactNode;
  nextHref: string;
  nextLabel?: string;
  backHref?: string;
}) {
  const progress = Math.round((step / recruiterJourney.length) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbe7f2,transparent_38%),linear-gradient(180deg,#f7fafc_0%,#eef4f8_100%)] dark:bg-[radial-gradient(circle_at_top,#1f2937,transparent_30%),linear-gradient(180deg,#0f172a_0%,#111827_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-4">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <Card className="border-white/70 bg-white/70 dark:border-white/10 dark:bg-slate-950/50">
            <CardHeader>
              <CardTitle>Recruiter-first flow</CardTitle>
              <CardDescription>
                This prototype demonstrates guided value delivery before deep system training.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
              <div className="space-y-3">
                {recruiterJourney.map((item, index) => (
                  <div
                    key={item.href}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm",
                      index + 1 === step
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/70 bg-background/60 text-muted-foreground",
                    )}
                  >
                    <div className="font-medium">{item.title}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-slate-950/60">
            <CardHeader className="gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Phase 1 scaffold
                </p>
                <CardTitle className="text-3xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {children}
              <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {backHref ? (
                    <Link href={backHref} className={buttonVariants({ variant: "ghost" })}>
                      <ArrowLeft className="size-4" />
                      Back
                    </Link>
                  ) : null}
                </div>
                <Link href={nextHref} className={buttonVariants({ className: "justify-center" })}>
                  {nextLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
