/*
components/FxOnboardingPage.js | Persona onboarding route | Sree | 2026-06-13
*/

"use client";

import { ArrowLeft, BriefcaseBusiness, Building2, Users2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FxButton } from "@/components/FxButton";
import { PERSONAS, ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { ONBOARDING_COPY } from "@/lib/FxCopy";
import { hasStoredPersona, writeStoredPersona } from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_SPACE, FX_SURFACE, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { readStoredValue } from "@/lib/FxUtils";

const PERSONA_ICONS = {
  [PERSONAS.INDEPENDENT_RECRUITER]: BriefcaseBusiness,
  [PERSONAS.RECRUITING_AGENCY]: Users2,
  [PERSONAS.INTERNAL_TALENT_TEAM]: Building2,
};

export function FxOnboardingPage() {
  const router = useRouter();

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
    }
  }, [router]);

  function handleSelectPersona(persona) {
    writeStoredPersona(persona);
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
          <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-[24px]">

            <div className="flex flex-col items-center gap-[12px] text-center">
              <div className={`flex size-[56px] items-center justify-center rounded-[16px] bg-[var(--fx-primary)]/[0.08] ${FX_COLORS.primaryText}`}>
                <BriefcaseBusiness className="size-[24px]" />
              </div>
              <div className="space-y-[8px]">
                <h1 className={`${FX_TYPOGRAPHY.h2} text-[var(--fx-text)]`}>{ONBOARDING_COPY.title}</h1>
                <p className={`${FX_TYPOGRAPHY.body} ${FX_SURFACE.mutedText}`}>{ONBOARDING_COPY.question}</p>
              </div>
            </div>

            <div className="w-full space-y-[16px]">
              {ONBOARDING_COPY.options.map((option) => {
                const Icon = PERSONA_ICONS[option.id];

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectPersona(option.id)}
                    className={`flex w-full cursor-pointer items-start gap-[16px] border ${FX_COLORS.border} ${FX_RADIUS.lg} bg-[var(--fx-surface)] p-[20px] text-left transition-colors hover:bg-[var(--fx-bg-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                  >
                    <div className={`flex size-[48px] shrink-0 items-center justify-center rounded-[12px] bg-[var(--fx-primary)]/[0.08] ${FX_COLORS.primaryText}`}>
                      <Icon className="size-[22px]" />
                    </div>
                    <div className={`flex flex-1 flex-col ${FX_SPACE.GAP_8}`}>
                      <span className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>{option.title}</span>
                      <span className={`${FX_TYPOGRAPHY.body} ${FX_SURFACE.mutedText}`}>{option.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex w-full items-center justify-start pt-[8px]">
              <FxButton variant="outline" className="rounded-full px-[16px]" onClick={handleBack}>
                <ArrowLeft className="size-[16px]" />
                Back
              </FxButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
