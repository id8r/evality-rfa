/*
app/jobs/page.tsx | Jobs listing placeholder screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import Link from "next/link";

import { AppScreen } from "@/components/app-screen";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs } from "@/data/mock-data";

export default function JobsPage() {
  return (
    <AppScreen>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Jobs"
          title="Jobs overview"
          meta="3 Active Roles · 279 Applicants · Last updated 2h ago"
          description="Placeholder job management surface with static data only. Actions intentionally stop at navigation."
          secondaryActions={[
            <Link key="analysis" href="/job-analysis" className={buttonVariants({ variant: "outline" })}>
              Review analysis
            </Link>,
          ]}
          primaryAction={
            <Link href="/first-job" className={buttonVariants({})}>
              Add job
            </Link>
          }
        />
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>
                      {job.client} • {job.location} • {job.mode}
                    </CardDescription>
                  </div>
                  <Badge>{job.stage}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{job.summary}</p>
                <p>{job.applicants} applicants in pipeline</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}

/* - - - - - - - - - - - - - - - - */
