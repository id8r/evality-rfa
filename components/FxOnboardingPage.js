/*
components/FxOnboardingPage.js | Persona onboarding route | Sree | 2026-06-13
*/

"use client";

import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { FxButton } from "@/components/FxButton";
import { PERSONAS, ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { ONBOARDING_COPY } from "@/lib/FxCopy";
import {
  hasStoredPersona,
  readStoredOnboardingContext,
  writeStoredOnboardingContext,
  writeStoredPersona,
} from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_SPACE, FX_SURFACE, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { readStoredValue } from "@/lib/FxUtils";

const PERSONA_VALUE_MAP = {
  recruiter: PERSONAS.INDEPENDENT_RECRUITER,
  "recruitment-agency": PERSONAS.RECRUITING_AGENCY,
  founder: PERSONAS.INTERNAL_TALENT_TEAM,
  "hiring-manager": PERSONAS.INTERNAL_TALENT_TEAM,
  "talent-acquisition": PERSONAS.INTERNAL_TALENT_TEAM,
  other: PERSONAS.INTERNAL_TALENT_TEAM,
};

export function FxOnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [purpose, setPurpose] = useState("");

  const roleCopy = useMemo(() => {
    return ONBOARDING_COPY.roleOptions.find((option) => option.value === role)?.label ?? "";
  }, [role]);

  useEffect(() => {
    const authFlag = readStoredValue(STORAGE_KEYS.AUTH_COMPLETE);

    if (!authFlag) {
      router.replace(ROUTES.LANDING);
      router.refresh();
      return;
    }

    if (hasStoredPersona()) {
      router.replace(ROUTES.JOBS);
      router.refresh();
      return;
    }

    const storedContext = readStoredOnboardingContext();
    if (storedContext) {
      setRole(storedContext.role ?? "");
      setPurpose(storedContext.purpose ?? "");
    }
  }, [router]);

  function handleContinue() {
    const persona = PERSONA_VALUE_MAP[role] ?? PERSONAS.INDEPENDENT_RECRUITER;
    writeStoredPersona(persona);
    writeStoredOnboardingContext({
      role,
      roleLabel: roleCopy,
      purpose: purpose || null,
    });
    router.replace(ROUTES.JOBS);
    router.refresh();
  }

  function handleBack() {
    router.replace(ROUTES.LANDING);
    router.refresh();
  }

  const canContinue = Boolean(role);

  return (
    <div className={`min-h-screen ${FX_SURFACE.page}`}>
      <div className={FX_LAYOUT.pageFrame}>
        <main className="flex min-h-screen items-center justify-center py-[96px]">
          <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-[28px]">
            <div className="flex flex-col items-center gap-[12px] text-center">
              <div className={`flex size-[56px] items-center justify-center rounded-[16px] bg-[var(--fx-primary)]/[0.08] ${FX_COLORS.primaryText}`}>
                <BriefcaseBusiness className="size-[24px]" />
              </div>
              <div className="space-y-[8px]">
                <h1 className={`${FX_TYPOGRAPHY.h2} text-[var(--fx-text)]`}>{ONBOARDING_COPY.title}</h1>
                <p className={`${FX_TYPOGRAPHY.body} ${FX_SURFACE.mutedText}`}>{ONBOARDING_COPY.subtitle}</p>
              </div>
            </div>

            <div className={`w-full rounded-[20px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
              <div className="space-y-[20px]">
                <div className="space-y-[8px]">
                  <label className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`} htmlFor="role">
                    {ONBOARDING_COPY.roleLabel}
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className={`h-[48px] w-full rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-bg)] px-[16px] ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`}
                  >
                    {ONBOARDING_COPY.roleOptions.map((option) => (
                      <option key={option.value || "placeholder"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-[12px]">
                  <div className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>{ONBOARDING_COPY.purposeLabel}</div>
                  <div className="grid gap-[10px] md:grid-cols-2">
                    {ONBOARDING_COPY.purposeOptions.map((option) => {
                      const active = purpose === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPurpose(option.value)}
                          className={`rounded-[14px] border p-[14px] text-left transition-colors ${
                            active
                              ? "border-[var(--fx-primary)] bg-[var(--fx-primary)]/[0.08]"
                              : `${FX_COLORS.border} bg-[var(--fx-bg)] hover:bg-[var(--fx-bg-soft)]`
                          }`}
                        >
                          <span className={`${FX_TYPOGRAPHY.button} block text-[var(--fx-text)]`}>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className={`${FX_TYPOGRAPHY.small} ${FX_SURFACE.mutedText}`}>{ONBOARDING_COPY.helperText}</p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-[16px]">
              <FxButton variant="outline" className="rounded-full px-[16px]" onClick={handleBack}>
                <ArrowLeft className="size-[16px]" />
                {ONBOARDING_COPY.back}
              </FxButton>

              <FxButton className="rounded-full px-[20px]" disabled={!canContinue} onClick={handleContinue}>
                {ONBOARDING_COPY.continue}
              </FxButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
