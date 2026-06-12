/*
components/FxAuthDialog.js | Unified auth dialog with welcome flow | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { fxButtonClassName } from "@/components/FxButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AUTH_COPY, AUTH_OPTIONS, LABELS, ROUTES, STORAGE_KEYS, WELCOME_COPY } from "@/lib/FxConstants";
import { FX_SURFACE, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { readStoredValue, writeStoredValue } from "@/lib/FxUtils";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.29h6.46c-.28 1.5-1.12 2.77-2.39 3.62v3.01h3.87c2.26-2.08 3.55-5.15 3.55-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3.01c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11C3.23 21.3 7.28 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.13-1.56.37-2.28V6.61H1.26A11.95 11.95 0 0 0 0 12c0 1.93.46 3.76 1.26 5.39l4.01-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.2 15.23 0 12 0 7.28 0 3.23 2.7 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.47v6.28zM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V8.98H7.1v11.47zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"
      />
    </svg>
  );
}

const AUTH_ICONS = {
  google: <GoogleIcon />,
  linkedin: <LinkedInIcon />,
};

export function FxAuthDialog({
  defaultOpen = false,
  intent = "signup",
  onOpenChange,
  open,
  showTrigger = true,
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("auth"); // "auth" | "welcome"
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : internalOpen;

  function setIsOpen(value) {
    if (!isControlled) {
      setInternalOpen(value);
    }

    if (!value) {
      setStep("auth");
      setEmail("");
    }

    onOpenChange?.(value);
  }

  function completeAuth(preference) {
    if (typeof window !== "undefined") {
      if (preference) {
        writeStoredValue(STORAGE_KEYS.HIRING_PREFERENCE, preference);
      }
      if (intent === "signup") {
        writeStoredValue(STORAGE_KEYS.JOBS_DEMO_MODE, "true");
      }
      writeStoredValue(STORAGE_KEYS.AUTH_COMPLETE, "true");
      window.dispatchEvent(new Event("fx-auth-change"));
    }
    setIsOpen(false);
    router.replace(intent === "signup" ? ROUTES.JOBS : ROUTES.ACTION_CENTER);
    router.refresh();
  }

  function handleAuthSuccess() {
    if (typeof window !== "undefined") {
      const existingPreference = readStoredValue(STORAGE_KEYS.HIRING_PREFERENCE);
      if (intent === "login") {
        completeAuth(existingPreference || null);
        return;
      }
    }

    setStep("welcome");
  }

  function handleSocialAuth() {
    handleAuthSuccess();
  }

  function handleEmailSubmit(event) {
    event.preventDefault();
    if (email) {
      handleAuthSuccess();
    }
  }

  function handleWelcomeSelect(preference) {
    completeAuth(preference);
  }

  return (
    <>
      {showTrigger ? (
        <div className="flex items-center">
          <button
            type="button"
            className={fxButtonClassName({ size: "lg" })}
            onClick={() => setIsOpen(true)}
          >
            {LABELS.GET_STARTED}
            <ArrowRight className="size-4" />
          </button>
        </div>
      ) : null}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          {/* STEP 1: Auth with email visible */}
          {step === "auth" && (
            <>
              <DialogHeader>
                <div className="mx-auto max-w-[320px]">
                  <DialogTitle>{AUTH_COPY.TITLE}</DialogTitle>
                  <DialogDescription>
                    {AUTH_COPY.DESCRIPTION}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-[12px]">
                {AUTH_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`flex h-[48px] w-full cursor-pointer items-center justify-center gap-[16px] rounded-[10px] border ${FX_TYPOGRAPHY.button} ${
                      option.id === "linkedin"
                        ? "border-[#0A66C2] bg-[#0A66C2] text-white hover:bg-[#0958A8]"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                    onClick={() => handleSocialAuth(option.id)}
                  >
                    {AUTH_ICONS[option.id]}
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[24px]">
                <div className="h-px bg-border" />
                <span className={`${FX_TYPOGRAPHY.metaLabel} uppercase text-muted-foreground`}>or</span>
                <div className="h-px bg-border" />
              </div>

              <form className="space-y-[16px]" onSubmit={handleEmailSubmit}>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`h-[48px] w-full rounded-[10px] border border-border bg-background px-[14px] ${FX_TYPOGRAPHY.input} text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring`}
                  placeholder={LABELS.EMAIL}
                />
                <button
                  type="submit"
                  className={`h-[48px] w-full cursor-pointer rounded-[10px] bg-foreground ${FX_TYPOGRAPHY.button} text-background hover:bg-foreground/90`}
                >
                  {LABELS.CONTINUE}
                </button>
              </form>
            </>
          )}

          {/* STEP 2: Welcome Question */}
          {step === "welcome" && (
            <>
              <DialogHeader>
                <div className="mx-auto max-w-[320px]">
                  <DialogTitle>{WELCOME_COPY.TITLE}</DialogTitle>
                  <DialogDescription>
                    {WELCOME_COPY.DESCRIPTION}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-[12px]">
                <button
                  type="button"
                  className={`flex h-[40px] w-full cursor-pointer items-center rounded-[10px] border border-border ${FX_SURFACE.subtleButton} px-[16px] text-left ${FX_TYPOGRAPHY.button} text-foreground transition-colors hover:border-primary/50`}
                  onClick={() => handleWelcomeSelect("clients")}
                >
                  {WELCOME_COPY.OPTION_2}
                </button>

                <button
                  type="button"
                  className={`flex h-[40px] w-full cursor-pointer items-center rounded-[10px] border border-border ${FX_SURFACE.subtleButton} px-[16px] text-left ${FX_TYPOGRAPHY.button} text-foreground transition-colors hover:border-primary/50`}
                  onClick={() => handleWelcomeSelect("company")}
                >
                  {WELCOME_COPY.OPTION_1}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* - - - - - - - - - - - - - - - - */
