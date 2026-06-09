/*
app/screening-setup/page.tsx | Screening configuration prototype screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { CheckCircle2 } from "lucide-react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { screeningStages } from "@/data/mock-data";

export default function ScreeningSetupPage() {
  return (
    <OnboardingShell
      title="Configure the screening workflow"
      description="Use visible stages and clear defaults instead of fragmented setup hidden behind tooltips and secondary menus."
      step={6}
      nextHref="/team"
      backHref="/candidate-intelligence"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {screeningStages.map((stage) => (
          <Card key={stage.id}>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="size-4" />
                Included stage
              </div>
              <CardTitle className="text-base">{stage.title}</CardTitle>
              <CardDescription>{stage.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Buttons in later phases can expand this into deeper workflow controls.
            </CardContent>
          </Card>
        ))}
      </div>
    </OnboardingShell>
  );
}

/* - - - - - - - - - - - - - - - - */
