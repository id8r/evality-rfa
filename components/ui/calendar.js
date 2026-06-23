"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/FxUtils";

function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-[12px]",
        caption: "flex items-center justify-center pt-[4px] relative",
        caption_label: "text-[14px] leading-[20px] font-medium text-[var(--fx-text)]",
        nav: "flex items-center gap-[8px]",
        button_previous:
          "absolute left-0 inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
        button_next:
          "absolute right-0 inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
        month_caption: "flex items-center justify-center h-[32px]",
        weekdays: "grid grid-cols-7 gap-[6px]",
        weekday: "text-center text-[12px] leading-[16px] font-medium text-[var(--fx-text-muted)]",
        week: "grid grid-cols-7 gap-[6px] mt-[6px]",
        day: "h-[40px] w-full p-0",
        day_button:
          "inline-flex h-[40px] w-full items-center justify-center rounded-[8px] border border-transparent bg-transparent text-[14px] leading-[20px] text-[var(--fx-text)] transition-colors hover:bg-[var(--fx-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--fx-primary)_22%,transparent)]",
        selected:
          "bg-[color:color-mix(in_srgb,var(--fx-primary)_12%,var(--fx-surface)_88%)] text-[var(--fx-primary)] border-[color:color-mix(in_srgb,var(--fx-primary)_42%,var(--fx-border)_58%)]",
        today: "border-[var(--fx-border)] bg-[var(--fx-bg-soft)] font-medium text-[var(--fx-text)]",
        outside: "text-[var(--fx-text-disabled)] opacity-60",
        disabled: "opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-[16px]", iconClassName)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("size-[16px]", iconClassName)} {...iconProps} />
          ),
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
