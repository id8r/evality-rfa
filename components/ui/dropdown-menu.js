/*
components/ui/dropdown-menu.js | shadcn DropdownMenu primitive | Sree | 2026-06-11
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/FxUtils";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

function DropdownMenu(props) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(props) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({ className, sideOffset = 8, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-[120] min-w-[160px] overflow-hidden rounded-[12px] border border-border bg-[var(--fx-surface-raised)] p-[2px] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuLabel({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-[8px] py-[8px] text-muted-foreground", FX_TYPOGRAPHY.dropdownHeader, className)}
      {...props}
    />
  );
}

function DropdownMenuItem({ className, inset, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-[12px] rounded-[6px] px-[8px] py-[8px] outline-none transition-colors hover:bg-accent focus:bg-accent",
        FX_TYPOGRAPHY.dropdownItem,
        inset && "pl-[32px]",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-[12px] rounded-[6px] pl-[32px] pr-[12px] py-[8px] outline-none transition-colors hover:bg-accent focus:bg-accent",
        FX_TYPOGRAPHY.dropdownItem,
        className,
      )}
      {...props}
    >
      <DropdownMenuPrimitive.ItemIndicator className="absolute left-[10px] top-1/2 flex size-[16px] -translate-y-1/2 items-center justify-center">
        <svg viewBox="0 0 12 12" className="size-[12px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6l2.5 2.5L10 3" />
        </svg>
      </DropdownMenuPrimitive.ItemIndicator>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-[2px] my-[4px] h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(
        "flex cursor-pointer select-none items-center gap-[12px] rounded-[6px] px-[8px] py-[8px] outline-none transition-colors hover:bg-accent focus:bg-accent",
        FX_TYPOGRAPHY.dropdownItem,
        inset && "pl-[32px]",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-[16px]" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
};

/* - - - - - - - - - - - - - - - - */
