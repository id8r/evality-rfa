/*
components/FxOnboardingPage.js | Persona onboarding route | Sree | 2026-06-13
*/

"use client";

import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FxButton } from "@/components/FxButton";
import { FxCreatableCombobox } from "@/components/FxCreatableCombobox";
import { PERSONAS, ROUTES, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { ONBOARDING_COPY } from "@/lib/FxCopy";
import {
  hasStoredPersona,
  markOnboardingComplete,
  readStoredOnboardingContext,
  writeStoredWorkspaceType,
  writeStoredOnboardingContext,
  writeStoredPersona,
} from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_SURFACE, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { readStoredValue } from "@/lib/FxUtils";

const PERSONA_VALUE_MAP = {
  recruiter: PERSONAS.INDEPENDENT_RECRUITER,
  "recruitment-lead": PERSONAS.RECRUITING_AGENCY,
  "hiring-manager": PERSONAS.INTERNAL_TALENT_TEAM,
  founder: PERSONAS.INTERNAL_TALENT_TEAM,
  "hr-team": PERSONAS.INTERNAL_TALENT_TEAM,
};

const PURPOSE_WORKSPACE_TYPE_MAP = {
  internal: WORKSPACE_TYPES.MY_COMPANY,
  agency: WORKSPACE_TYPES.CLIENTS,
  both: WORKSPACE_TYPES.BOTH,
};

const ROLE_OPTIONS = ONBOARDING_COPY.roleOptions.slice(1);

export function FxOnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [purpose, setPurpose] = useState("internal");

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
      /* eslint-disable react-hooks/set-state-in-effect */
      setRole(storedContext.role ?? "");
      setPurpose(storedContext.purpose ?? "internal");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [router]);

  function handleContinue() {
    const persona = PERSONA_VALUE_MAP[role] ?? PERSONAS.INDEPENDENT_RECRUITER;
    const workspaceType = PURPOSE_WORKSPACE_TYPE_MAP[purpose] ?? WORKSPACE_TYPES.MY_COMPANY;
    writeStoredPersona(persona);
    writeStoredWorkspaceType(workspaceType);
    markOnboardingComplete();
    writeStoredOnboardingContext({
      role,
      roleLabel: (ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role) || "Recruiter",
      purpose,
      workspaceType,
    });
    router.replace(ROUTES.JOBS);
    router.refresh();
  }

  function handleBack() {
    router.replace(ROUTES.LANDING);
    router.refresh();
  }

  return (
    <div className={`min-h-screen ${FX_SURFACE.page}`}>
      <div className={FX_LAYOUT.pageFrame}>
        <main className="flex min-h-screen items-center justify-center py-[96px]">
          <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-[24px]">
            <div className="flex flex-col items-center gap-[12px] text-center">
              <div className={`flex size-[56px] items-center justify-center rounded-[16px] bg-[var(--fx-primary)]/[0.08] ${FX_COLORS.primaryText}`}>
                <BriefcaseBusiness className="size-[24px]" />
              </div>
              <div className="space-y-[8px]">
                <h1 className={`${FX_TYPOGRAPHY.h1} text-[var(--fx-text)]`}>{ONBOARDING_COPY.title}</h1>
                <p className={`${FX_TYPOGRAPHY.body} ${FX_SURFACE.mutedText}`}>{ONBOARDING_COPY.subtitle}</p>
              </div>
            </div>

            <div className={`w-full rounded-[20px] border border-[color-mix(in_oklab,var(--fx-border)_75%,var(--fx-text)_25%)] bg-[var(--fx-surface)] p-[24px]`}>
              <div className="space-y-[24px]">
                <div className="space-y-[12px]">
                  <div className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>
                    {ONBOARDING_COPY.roleLabel}
                  </div>
                  <FxCreatableCombobox
                    value={role}
                    placeholder="Select your role"
                    options={ROLE_OPTIONS}
                    onChange={setRole}
                    onCreate={(nextRole) => nextRole}
                    allowCreate
                    createLabel="Create new role"
                    className="max-w-[320px]"
                    contentClassName="w-[320px]"
                  />
                </div>

                <div className="space-y-[12px]">
                  <div className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>{ONBOARDING_COPY.purposeLabel}</div>
                  <div className="space-y-[10px]">
                    {ONBOARDING_COPY.purposeOptions.map((option) => {
                      const active = purpose === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPurpose(option.value)}
                          className={`flex min-h-[40px] w-full items-center rounded-[8px] border px-[12px] py-[7px] text-left transition-colors ${
                            active
                              ? "border-[var(--fx-primary)] bg-[var(--fx-primary)]/[0.08]"
                              : "border-[color-mix(in_oklab,var(--fx-border)_75%,var(--fx-text)_25%)] bg-[var(--fx-bg)] hover:bg-[var(--fx-bg-soft)]"
                          }`}
                        >
                          <div className="flex items-start gap-[12px]">
                            <div
                              className={`mt-[3px] size-[16px] shrink-0 rounded-full border ${
                                active ? "border-[var(--fx-primary)] bg-[var(--fx-primary)] ring-4 ring-[var(--fx-primary)]/10" : FX_COLORS.border
                              }`}
                            />
                            <div className="space-y-[2px]">
                              <span className={`${FX_TYPOGRAPHY.button} block text-[var(--fx-text)]`}>{option.title}</span>
                              <span className={`${FX_TYPOGRAPHY.body} ${FX_SURFACE.mutedText}`}>{option.description}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
                    {ONBOARDING_COPY.helperText}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-[16px]">
              <FxButton variant="outline" className="gap-[8px] rounded-[6px] px-[14px]" onClick={handleBack}>
                <ArrowLeft className="size-[16px]" />
                {ONBOARDING_COPY.back}
              </FxButton>

              <FxButton variant="secondary" className="gap-[8px] rounded-[6px] px-[16px]" disabled={!role} onClick={handleContinue}>
                {ONBOARDING_COPY.continue}
              </FxButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
