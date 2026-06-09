/*
app/candidate-intelligence/page.tsx | Candidate insights prototype screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { ArrowUpRight } from "lucide-react";

import { OnboardingShell } from "@/components/onboarding-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { candidates } from "@/data/mock-data";

export default function CandidateIntelligencePage() {
  return (
    <OnboardingShell
      title="AI presents candidate intelligence"
      description="Recruiters see a ranked shortlist with clear reasoning before they have to learn complex filtering or buried actions."
      step={5}
      nextHref="/screening-setup"
      backHref="/job-analysis"
    >
      <div className="grid gap-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id}>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-[auto_minmax(0,1fr)_140px] md:items-center">
              <div className="flex items-center gap-3">
                <Avatar initials={candidate.name.slice(0, 2).toUpperCase()} />
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">{candidate.currentCompany}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {candidate.experience} experience • {candidate.status}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 md:justify-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Match</p>
                  <p className="text-2xl font-semibold">{candidate.matchScore}%</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground md:hidden" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </OnboardingShell>
  );
}

/* - - - - - - - - - - - - - - - - */
