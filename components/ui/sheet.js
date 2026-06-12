"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { FX_PANEL, FX_SHEET, FX_SURFACE } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

function SheetOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-[220ms] data-[state=closed]:duration-[180ms]",
        FX_SURFACE.overlay,
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({ className, children, side = "right", size = "xl", ...props }) {
  const sideClasses = {
    right: "inset-y-0 right-0 h-full border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    left: "inset-y-0 left-0 h-full border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  };

  const widthClasses = {
    sm: FX_SHEET.widthSm,
    md: FX_SHEET.widthMd,
    lg: FX_SHEET.widthLg,
    xl: FX_SHEET.widthXl,
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          `fixed z-[101] flex h-full flex-col overflow-hidden bg-[var(--fx-surface-raised)] text-foreground shadow-none ${FX_PANEL.dialogTransition} data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-[220ms] data-[state=closed]:duration-[180ms]`,
          sideClasses[side],
          widthClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  title,
  description,
  actions,
  leading,
  showClose = true,
  ...props
}) {
  return (
    <div
      className={cn(
        `flex ${FX_SHEET.headerHeight} flex-none items-center justify-between gap-[16px] border-b border-border px-[24px]`,
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-[4px]">
        {leading ? <div className="flex items-center gap-[8px]">{leading}</div> : null}
        {title ? <DialogPrimitive.Title className={FX_SHEET.title}>{title}</DialogPrimitive.Title> : null}
        {description ? (
          <DialogPrimitive.Description className={cn(FX_SHEET.subtitle, "text-muted-foreground")}>
            {description}
          </DialogPrimitive.Description>
        ) : null}
      </div>

      <div className="flex items-center gap-[8px] self-center">
        {actions}
        {showClose ? (
          <DialogPrimitive.Close className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="size-[16px]" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </div>
    </div>
  );
}

function SheetBody({ className, ...props }) {
  return <div className={cn(`min-h-0 flex-1 overflow-y-auto ${FX_SHEET.bodyPadding}`, className)} {...props} />;
}

function SheetFooter({ className, left, right, children, ...props }) {
  return (
    <div
      className={cn(
        `flex ${FX_SHEET.footerHeight} flex-none items-center justify-between gap-[16px] border-t border-border px-[24px]`,
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-[12px]">{left}</div>
      {children}
      <div className="flex items-center gap-[12px]">{right}</div>
    </div>
  );
}

function SheetTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn(FX_SHEET.title, className)} {...props} />;
}

function SheetDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn(FX_SHEET.subtitle, "text-muted-foreground", className)}
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
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
