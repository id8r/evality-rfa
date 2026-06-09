/*
components/ui/avatar.tsx | Shared avatar primitive | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}

/* - - - - - - - - - - - - - - - - */
