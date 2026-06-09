/*
app/first-job/page.tsx | First job creation prototype screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { jobs } from "@/data/mock-data";
import { OnboardingShell } from "@/components/onboarding-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FirstJobPage() {
  const featuredJob = jobs[0];

  return (
    <OnboardingShell
      title="Add the first job"
      description="Recruiters should be able to anchor the experience around an urgent role they already care about."
      step={3}
      nextHref="/job-analysis"
      backHref="/workspace"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job title</label>
            <Input placeholder={featuredJob.title} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Input placeholder={featuredJob.client} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Role summary</label>
            <Input placeholder={featuredJob.summary} />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suggested starter role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge>{featuredJob.mode}</Badge>
            <p className="text-sm text-muted-foreground">{featuredJob.location}</p>
            <p className="text-sm leading-6 text-muted-foreground">{featuredJob.summary}</p>
          </CardContent>
        </Card>
      </div>
    </OnboardingShell>
  );
}

/* - - - - - - - - - - - - - - - - */
