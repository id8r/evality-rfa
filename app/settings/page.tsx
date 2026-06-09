/*
app/settings/page.tsx | Settings placeholder screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import Link from "next/link";

import { AppScreen } from "@/components/app-screen";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <AppScreen>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Settings"
          title="Settings placeholder"
          meta="Prototype Preferences · Theme Ready · Last updated today"
          description="Navigation is present, but deeper configuration remains intentionally out of scope for the foundation phase."
          secondaryActions={[
            <Link key="team" href="/team" className={buttonVariants({ variant: "outline" })}>
              Manage team
            </Link>,
          ]}
          primaryAction={
            <Link href="/dashboard" className={buttonVariants({})}>
              Return to dashboard
            </Link>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>Future settings surface</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            Workspace preferences, automation rules, permissions, and integrations can be added later
            after stakeholder review clarifies the right recruiter-first direction.
          </CardContent>
        </Card>
      </div>
    </AppScreen>
  );
}

/* - - - - - - - - - - - - - - - - */
