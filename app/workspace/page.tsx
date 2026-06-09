/*
app/workspace/page.tsx | Recruiter workspace creation screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { Building2, Users } from "lucide-react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function WorkspacePage() {
  return (
    <OnboardingShell
      title="Create your recruiting workspace"
      description="Give recruiters one clear starting point instead of dropping them into an already-complex dashboard."
      step={2}
      nextHref="/first-job"
      backHref="/signup"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace name</label>
            <Input placeholder="Evality Talent Pod" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary hiring focus</label>
            <Input placeholder="Product, engineering, and design roles" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4" />
              What this screen proves
            </CardTitle>
            <CardDescription>
              Workspace setup can stay light and directional before deeper system configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              Future team collaboration is visible early.
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="size-4" />
              Clients and jobs can attach after value appears.
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingShell>
  );
}

/* - - - - - - - - - - - - - - - - */
