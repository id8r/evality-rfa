/*
app/clients/page.tsx | Clients listing placeholder screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import Link from "next/link";

import { AppScreen } from "@/components/app-screen";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clients } from "@/data/mock-data";

export default function ClientsPage() {
  return (
    <AppScreen>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Clients"
          title="Client portfolio"
          meta="3 Active Clients · 12 Open Jobs · Last updated today"
          description="A simple client list keeps account context visible without building deep CRM behavior into the prototype."
          secondaryActions={[
            <Link key="team" href="/team" className={buttonVariants({ variant: "outline" })}>
              Share update
            </Link>,
          ]}
          primaryAction={
            <Link href="/jobs" className={buttonVariants({})}>
              Add client
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <CardTitle>{client.name}</CardTitle>
                <CardDescription>{client.industry}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{client.activeJobs} active jobs</p>
                <p>{client.openCandidates} candidates in motion</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}

/* - - - - - - - - - - - - - - - - */
