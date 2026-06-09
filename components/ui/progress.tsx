/*
components/ui/progress.tsx | Shared static progress meter | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
