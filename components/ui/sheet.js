"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { FX_SHEET, FX_SURFACE } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

function SheetOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      forceMount
      className={cn(
        "fixed inset-0 z-[100] bg-slate-950/10 backdrop-blur-[2px] duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        FX_SURFACE.overlay,
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({ className, children, side = "right", size = "md", widthPx, style, ...props }) {
  const sideClasses = {
    right: "inset-y-0 right-0 h-full border-l border-l-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] shadow-[-6px_0_18px_rgba(15,23,42,0.04)] data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    left: "inset-y-0 left-0 h-full border-r border-r-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] shadow-[6px_0_18px_rgba(15,23,42,0.04)] data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
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
        forceMount
        className={cn(
          "fixed z-[101] flex h-full flex-col overflow-hidden bg-[var(--fx-surface-raised)] text-foreground shadow-none duration-500 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:pointer-events-none",
          sideClasses[side],
          widthClasses[size],
          className,
        )}
        style={widthPx ? { ...style, width: `${widthPx}px`, maxWidth: "none" } : style}
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
  descriptionClassName = "",
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
          <DialogPrimitive.Description className={cn(FX_SHEET.subtitle, "text-muted-foreground", descriptionClassName)}>
            {description}
          </DialogPrimitive.Description>
        ) : null}
      </div>

      <div className="flex items-center gap-[8px] self-center">
        {actions}
        {showClose ? (
          <DialogPrimitive.Close className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent hover:text-foreground">
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
        `flex ${FX_SHEET.footerHeight} flex-none items-center justify-between gap-[16px] border-t border-border bg-[var(--fx-surface-subtle)] px-[24px]`,
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-[16px]">{left}</div>
      {children}
      <div className="flex items-center gap-[16px]">{right}</div>
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