/*
app/dashboard/page.tsx | Recruiter dashboard shell screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { ArrowRight, Building2, Users } from "lucide-react";
import Link from "next/link";

import { AppScreen } from "@/components/app-screen";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { candidates, clients, dashboardMetrics, jobs } from "@/data/mock-data";

export default function DashboardPage() {
  return (
    <AppScreen>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard"
          title="Recruiter command center"
          meta="12 Open Jobs · 48 Qualified Candidates · Last updated 2h ago"
          description="A visible, recruiter-first dashboard scaffold that makes active work obvious without forcing discovery through hidden UI."
          secondaryActions={[
            <Link key="intelligence" href="/candidate-intelligence" className={buttonVariants({ variant: "outline" })}>
              Review AI insights
            </Link>,
          ]}
          primaryAction={
            <Link href="/candidates" className={buttonVariants({})}>
              Add candidate
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader>
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{metric.detail}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Active jobs</CardTitle>
              <CardDescription>Static mock roles used across the prototype flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.client} • {job.location} • {job.mode}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{job.stage}</Badge>
                    <span className="text-sm text-muted-foreground">{job.applicants} applicants</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4" />
                  Candidate snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidates.slice(0, 3).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between rounded-2xl bg-background/70 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.currentCompany}</p>
                    </div>
                    <span className="text-sm font-semibold">{candidate.matchScore}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="size-4" />
                  Client portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-2xl bg-background/70 px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{client.name}</span>
                    <span className="text-muted-foreground">{client.activeJobs} active jobs</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppScreen>
  );
}

/* - - - - - - - - - - - - - - - - */
