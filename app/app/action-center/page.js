/* app/app/action-center/page.js | Action Center placeholder and product intent | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import Link from "next/link";
/* - - - - - - - - - - - - - - - - */

export default function ActionCenterPage() {
  return (
    <FxProtectedAppPage title="Action Center">
      <section className="max-w-[800px] space-y-[16px]">
        <h1 className="text-[30px] font-medium leading-[36px]">Action Center</h1>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          The recruiter&apos;s daily command center and future default landing page for returning users.
          This page will answer one question first: what needs my attention now? It will surface
          follow-ups, candidates needing review, pending client actions, interview reminders,
          and jobs that need attention.
        </p>
        <p className="text-[14px] leading-[22px] text-muted-foreground">
          New users should land on{" "}
          <Link href="/app/create-job" className="underline underline-offset-[3px]">
            Create Job
          </Link>{" "}
          after registration. Returning users should land on <b>Action Center</b> 
          after login once there is real recruiting activity to manage.
        </p>
      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */