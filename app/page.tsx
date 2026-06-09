/*
app/page.tsx | Landing page for the Evality RFA concept | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { recruiterJourney } from "@/data/mock-data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbe6ef,transparent_35%),linear-gradient(180deg,#f8fbfd_0%,#eef4f8_100%)] dark:bg-[radial-gradient(circle_at_top,#1e293b,transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-4">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="grid flex-1 gap-8 py-10 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-center">
          <section className="space-y-8">
            <Badge className="bg-white/80 text-foreground dark:bg-slate-900/60 dark:text-foreground">
              Evality AI • Recruiter-First Approach
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Show recruiters value before asking them to learn the product.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                This click-through prototype reframes Evality around guided onboarding, visible
                momentum, and early AI assistance instead of hidden actions and fragmented menus.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={buttonVariants({ className: "justify-center" })}>
                Start prototype journey
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/dashboard" className={buttonVariants({ variant: "outline", className: "justify-center" })}>
                Jump to dashboard
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                "Clear route structure for onboarding and product shell",
                "Static recruiter data for jobs, candidates, and clients",
                "Responsive dark-mode foundation for iterative UX reviews",
              ].map((item) => (
                <Card key={item} className="border-white/80 bg-white/75 dark:border-white/10 dark:bg-slate-950/60">
                  <CardContent className="pt-6 text-sm leading-6 text-muted-foreground">{item}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Card className="border-white/80 bg-white/78 dark:border-white/10 dark:bg-slate-950/60">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="size-4" />
                Prototype flow map
              </div>
              <CardTitle>Phase 1 shell only</CardTitle>
              <CardDescription>
                The current build is intentionally limited to structure, navigation, and
                high-signal placeholders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recruiterJourney.map((item, index) => (
                <div
                  key={item.href}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.href}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">0{index + 1}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
