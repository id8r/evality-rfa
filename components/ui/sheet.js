"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/FxUtils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

function SheetOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[100] bg-slate-950/10 data-[state=open]:animate-in data-[state=closed]:animate-out",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({ className, children, side = "right", ...props }) {
  const sideClasses = {
    right:
      "inset-y-0 right-0 h-full w-full border-l sm:max-w-[520px] data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    left:
      "inset-y-0 left-0 h-full w-full border-r sm:max-w-[520px] data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-[101] flex flex-col gap-[24px] bg-[var(--fx-surface-raised)] p-[24px] text-foreground shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-[16px] right-[16px] flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground hover:bg-accent hover:text-foreground">
          <X className="size-[16px]" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }) {
  return <div className={cn("space-y-[8px]", className)} {...props} />;
}

function SheetFooter({ className, ...props }) {
  return <div className={cn("mt-auto flex items-center justify-end gap-[12px]", className)} {...props} />;
}

function SheetTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn("text-[24px] leading-[32px] font-medium", className)} {...props} />;
}

function SheetDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn("text-[14px] leading-[22px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
