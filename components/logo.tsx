/*
components/logo.tsx | Evality prototype brand mark | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827,#334155_55%,#64748b)] text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
        EV
      </span>
      <span className={cn("flex flex-col", compact && "sr-only")}>
        <span className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Evality AI
        </span>
        <span className="text-base font-semibold text-foreground">Recruiter-First Prototype</span>
      </span>
    </Link>
  );
}

/* - - - - - - - - - - - - - - - - */
