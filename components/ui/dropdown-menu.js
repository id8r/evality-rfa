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
          "z-[120] min-w-[280px] overflow-hidden rounded-[16px] border border-border bg-[var(--fx-surface-raised)] p-[8px] text-foreground shadow-sm",
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
      className={cn("px-[12px] py-[8px] text-muted-foreground", FX_TYPOGRAPHY.dropdownHeader, className)}
      {...props}
    />
  );
}

function DropdownMenuItem({ className, inset, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-[12px] rounded-[10px] px-[12px] py-[10px] outline-none transition-colors hover:bg-accent focus:bg-accent",
        FX_TYPOGRAPHY.dropdownItem,
        inset && "pl-[40px]",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-[8px] my-[8px] h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(
        "flex cursor-pointer select-none items-center gap-[12px] rounded-[10px] px-[12px] py-[10px] outline-none transition-colors hover:bg-accent focus:bg-accent",
        FX_TYPOGRAPHY.dropdownItem,
        inset && "pl-[40px]",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-[14px]" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
};

/* - - - - - - - - - - - - - - - - */
