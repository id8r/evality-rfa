/*
app/team/page.tsx | Team invite prototype screen | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import Link from "next/link";
import { MailPlus } from "lucide-react";

import { AppScreen } from "@/components/app-screen";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TeamPage() {
  return (
    <AppScreen>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Team"
          title="Invite teammates"
          meta="6 Team Seats · 2 Pending Invites · Last updated 1h ago"
          description="This screen stays independently shareable for demos while still using the shared product shell."
          secondaryActions={[
            <Link key="workspace" href="/workspace" className={buttonVariants({ variant: "outline" })}>
              View workspace
            </Link>,
          ]}
          primaryAction={
            <Link href="/dashboard" className={buttonVariants({})}>
              Finish prototype
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MailPlus className="size-4" />
                Invitation placeholders
              </CardTitle>
              <CardDescription>No submission logic is attached in this phase.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input placeholder="teammate@evality.ai" />
              <Input placeholder="hiring.manager@client.com" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Why this route exists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Recruiters can see collaboration value before learning settings, permissions, or workflow automation.</p>
              <p>The route remains top-level so it can be reordered or deep-linked during stakeholder reviews.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppScreen>
  );
}

/* - - - - - - - - - - - - - - - - */
