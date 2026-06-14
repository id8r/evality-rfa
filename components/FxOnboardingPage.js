/*
components/FxOnboardingPage.js | Persona onboarding route | Sree | 2026-06-13
*/

"use client";

import { ArrowLeft, BriefcaseBusiness, Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FxButton } from "@/components/FxButton";
import { PERSONAS, ROUTES, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { ONBOARDING_COPY } from "@/lib/FxCopy";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      setRole(storedContext.role ?? "");
      setPurpose(storedContext.purpose ?? "internal");
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
      roleLabel: ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "Recruiter",
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`flex h-[40px] w-full max-w-[320px] items-center justify-between rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg)] px-[14px] ${FX_TYPOGRAPHY.input} ${role ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} outline-none transition-colors hover:bg-[var(--fx-bg-soft)] focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`}
                      >
                        <span className="truncate">
                          {ONBOARDING_COPY.roleOptions.find((option) => option.value === role)?.label ??
                            ONBOARDING_COPY.roleOptions[0].label}
                        </span>
                        <ChevronDown className="ml-[12px] size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[320px]">
                      {ONBOARDING_COPY.roleOptions.map((option) => {
                        const isSelected = role === option.value;

                        return (
                          <DropdownMenuItem
                            key={option.value || "placeholder"}
                            className={isSelected ? "bg-accent" : ""}
                            onSelect={() => setRole(option.value)}
                          >
                            <span className="flex min-w-0 flex-1 items-center gap-[12px]">
                              <span className={option.value ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"}>
                                {option.label}
                              </span>
                            </span>
                            {isSelected ? <Check className="ml-auto size-[16px]" /> : null}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
