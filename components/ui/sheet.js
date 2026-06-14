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
        `fixed inset-0 z-[100] transition-opacity ${FX_SHEET.overlayOpenMotion} ${FX_SHEET.overlayCloseMotion} data-[state=open]:opacity-100 data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=closed]:opacity-0`,
        FX_SURFACE.overlay,
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({ className, children, side = "right", size = "md", ...props }) {
  const sideClasses = {
    right: "inset-y-0 right-0 h-full border-l translate-x-full data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full",
    left: "inset-y-0 left-0 h-full border-r -translate-x-full data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full",
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
          `fixed z-[101] flex h-full flex-col overflow-hidden bg-[var(--fx-surface-raised)] text-foreground shadow-none transition-[transform,opacity] ${FX_SHEET.contentOpenMotion} ${FX_SHEET.contentCloseMotion} will-change-transform data-[state=open]:opacity-100 data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=closed]:opacity-0`,
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
        `flex ${FX_SHEET.footerHeight} flex-none items-center justify-between gap-[16px] border-t border-border px-[24px]`,
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
