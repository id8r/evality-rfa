/*
app/signup/page.tsx | Recruiter signup prototype screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { OnboardingShell } from "@/components/onboarding-shell";

export default function SignupPage() {
  return (
    <OnboardingShell
      title="Create recruiter profile"
      description="Collect only the essentials needed to start the guided workflow and show progress immediately."
      step={1}
      nextHref="/workspace"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full name</label>
          <Input placeholder="Sree Recruiter" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Work email</label>
          <Input placeholder="sree@evality.ai" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <Input placeholder="Evality AI" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hiring volume</label>
          <Input placeholder="10 to 25 roles per quarter" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Badge>Static inputs only</Badge>
        <Badge>No submission logic</Badge>
        <Badge>UX concept scaffold</Badge>
      </div>
    </OnboardingShell>
  );
}

/* - - - - - - - - - - - - - - - - */
