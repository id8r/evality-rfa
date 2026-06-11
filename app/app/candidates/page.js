/* app/app/candidates/page.js | Candidates placeholder and product intent | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
/* - - - - - - - - - - - - - - - - */

export default function CandidatesPage() {
  return (
    <FxProtectedAppPage title="Candidates">
      <section className="max-w-[800px] space-y-[16px]">
        <h1 className="text-[30px] font-medium leading-[36px]">Candidates</h1>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          The recruiter&apos;s talent database and relationship workspace.
        </p>

        <div className="space-y-[12px] text-[14px] leading-[22px]">
          <p><strong>What resides here</strong></p>
          <ul className="list-disc pl-[24px] space-y-[4px]">
            <li>Candidate records</li>
            <li>Candidate profiles</li>
            <li>Resume and CV details</li>
            <li>Skills and experience</li>
            <li>Job associations</li>
            <li>Notes and follow-ups</li>
          </ul>
        </div>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          Candidates become increasingly valuable as recruiter activity and
          talent history accumulate.
        </p>
      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */