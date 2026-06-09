/*
components/ui/button.tsx | Shared button primitive | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import * as React from "react";

import { cn } from "@/lib/utils";

const variantClasses = {
  default:
    "bg-foreground text-background hover:bg-foreground/90 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.45)]",
  outline:
    "border border-border bg-background text-foreground hover:bg-muted",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "bg-transparent text-foreground hover:bg-muted",
} as const;

const sizeClasses = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "size-10",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
};

export function buttonVariants({
  className,
  variant = "default",
  size = "default",
}: {
  className?: string;
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return <button className={buttonVariants({ className, variant, size })} type={type} {...props} />;
}

/* - - - - - - - - - - - - - - - - */
