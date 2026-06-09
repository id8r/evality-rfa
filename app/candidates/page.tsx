/*
app/candidates/page.tsx | Candidates listing placeholder screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import Link from "next/link";

import { AppScreen } from "@/components/app-screen";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { candidates } from "@/data/mock-data";

export default function CandidatesPage() {
  return (
    <AppScreen>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Candidates"
          title="Candidate intelligence queue"
          meta="4 Shortlisted Profiles · 2 Interview Recommendations · Last updated 45m ago"
          description="Mock candidate data keeps the prototype concrete without adding filtering logic or state persistence."
          secondaryActions={[
            <Link key="jobs" href="/jobs" className={buttonVariants({ variant: "outline" })}>
              View jobs
            </Link>,
          ]}
          primaryAction={
            <Link href="/candidate-intelligence" className={buttonVariants({})}>
              Add candidate
            </Link>
          }
        />
        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardContent className="grid gap-4 pt-6 lg:grid-cols-[1.1fr_minmax(0,1fr)_120px] lg:items-center">
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {candidate.currentCompany} • {candidate.experience}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-2xl font-semibold">{candidate.matchScore}%</p>
                  <p className="text-sm text-muted-foreground">{candidate.status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}

/* - - - - - - - - - - - - - - - - */
