/* app/app/jobs/page.js | Jobs placeholder and product intent | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
/* - - - - - - - - - - - - - - - - */

export default function JobsPage() {
  return (
    <FxProtectedAppPage title="Jobs">
      <section className="max-w-[800px] space-y-[16px]">
        <h1 className="text-[30px] font-medium leading-[36px]">Jobs</h1>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          The recruiter&apos;s active and historical hiring workspace.
        </p>

        <div className="space-y-[12px] text-[14px] leading-[22px]">
          <p><strong>What resides here</strong></p>
          <ul className="list-disc pl-[24px] space-y-[4px]">
            <li>Active jobs</li>
            <li>Draft jobs</li>
            <li>Shared jobs</li>
            <li>Closed jobs</li>
            <li>Job status tracking</li>
            <li>Job-level candidate management</li>
          </ul>
        </div>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          Jobs become the primary organizing object once recruiters manage
          multiple openings simultaneously.
        </p>
      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */