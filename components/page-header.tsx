/*
components/page-header.tsx | Reusable page header block | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  primaryAction,
  secondaryActions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode[];
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <Badge>{eyebrow}</Badge> : null}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
            {meta ? (
              <p className="text-sm font-medium text-muted-foreground">{meta}</p>
            ) : null}
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
          </div>
        </div>
        {(primaryAction || secondaryActions?.length) ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {secondaryActions?.map((action, index) => (
              <div key={index} className={cn("flex")}>
                {action}
              </div>
            ))}
            {primaryAction ? <div className="flex">{primaryAction}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
