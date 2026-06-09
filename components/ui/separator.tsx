/*
components/ui/separator.tsx | Shared separator primitive | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { cn } from "@/lib/utils";

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border/80", className)} />;
}

/* - - - - - - - - - - - - - - - - */
