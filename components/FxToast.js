/* components/FxToast.js | Central toast helpers | Sree | 2026-06-15 */

/* - - - - - - - - - - - - - - - - */

"use client";

import { clearToasts, dismissToast, toast as baseToast, useToast as useFxToastState } from "@/components/ui/use-toast";

/* - - - - - - - - - - - - - - - - */

export function showToast({ title, description, variant = "default", action, duration, id } = {}) {
  return baseToast({
    id,
    title,
    description,
    variant,
    action,
    duration,
  });
}

/* - - - - - - - - - - - - - - - - */

export function showSuccess(title, description, options = {}) {
  return showToast({ title, description, variant: "success", ...options });
}

/* - - - - - - - - - - - - - - - - */

export function showError(title, description, options = {}) {
  return showToast({ title, description, variant: "destructive", ...options });
}

/* - - - - - - - - - - - - - - - - */

export function showWarning(title, description, options = {}) {
  return showToast({ title, description, variant: "warning", ...options });
}

/* - - - - - - - - - - - - - - - - */

export function showInfo(title, description, options = {}) {
  return showToast({ title, description, variant: "info", ...options });
}

/* - - - - - - - - - - - - - - - - */

export function useFxToast() {
  return useFxToastState();
}

/* - - - - - - - - - - - - - - - - */

export { clearToasts, dismissToast };

/* - - - - - - - - - - - - - - - - */
