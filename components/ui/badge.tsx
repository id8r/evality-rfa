/*
components/ui/badge.tsx | Shared badge primitive | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/* - - - - - - - - - - - - - - - - */
