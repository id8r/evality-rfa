/*
components/ui/input.tsx | Shared input primitive | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

/* - - - - - - - - - - - - - - - - */
