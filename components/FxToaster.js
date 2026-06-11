/*
components/FxToaster.js | Global toast provider shell | Sree | 2026-06-11
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { ToastProvider, ToastViewport } from "@/components/ui/toast";

export function FxToaster({ children }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}

/* - - - - - - - - - - - - - - - - */
