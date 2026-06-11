/* app/app/create-job/page.js | Create Job placeholder and product intent | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import Link from "next/link";
/* - - - - - - - - - - - - - - - - */

export default function CreateJobPage() {
  return (
    <FxProtectedAppPage title="Create Job">
      <section className="max-w-[800px] space-y-[16px]">
        <h1 className="text-[30px] font-medium leading-[36px]">Create Job</h1>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          The first meaningful action inside Evality. Recruiters should be able
          to describe a hiring need naturally and quickly convert it into a
          structured job.
        </p>

        <div className="space-y-[12px] text-[14px] leading-[22px]">
          <p><strong>What resides here</strong></p>
          <ul className="list-disc pl-[24px] space-y-[4px]">
            <li>Prompt-based job creation</li>
            <li>Role intent capture</li>
            <li>Job summary generation</li>
            <li>Hiring mode context</li>
            <li>Structured job details</li>
            <li>Job sharing actions</li>
          </ul>
        </div>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          V1 focus: become the fastest path from hiring need to published job.
        </p>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          New users should land on <b>Create Job</b> after registration. Returning users should land on{" "}
          <Link href="/app/action-center" className="underline underline-offset-[3px]">
            Action Center
          </Link>{" "}
          after login once there is real recruiting activity to manage.
        </p>

      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */