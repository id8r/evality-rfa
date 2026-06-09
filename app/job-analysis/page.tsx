/*
app/job-analysis/page.tsx | AI job analysis prototype screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { Sparkles } from "lucide-react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { jobs } from "@/data/mock-data";

export default function JobAnalysisPage() {
  const activeJob = jobs[0];

  return (
    <OnboardingShell
      title="AI analyzes the job description"
      description="The prototype surfaces helpful interpretation immediately instead of hiding intelligence behind menus or background tasks."
      step={4}
      nextHref="/candidate-intelligence"
      backHref="/first-job"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Role clarity", value: 92 },
            { label: "Skill signal", value: 88 },
            { label: "Search readiness", value: 95 },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <CardTitle className="text-base">{item.label}</CardTitle>
                <CardDescription>Static prototype metric</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-semibold">{item.value}%</div>
                <Progress value={item.value} />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="xl:row-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="size-4" />
              AI summary
            </div>
            <CardTitle>{activeJob.title}</CardTitle>
            <CardDescription>{activeJob.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <Badge>Leadership potential is a major differentiator</Badge>
            <Badge>TypeScript and design systems should rank highly</Badge>
            <Badge>Candidate experience should stay under 10 days</Badge>
          </CardContent>
        </Card>
      </div>
    </OnboardingShell>
  );
}

/* - - - - - - - - - - - - - - - - */
