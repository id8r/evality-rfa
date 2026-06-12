/* app/app/candidates/page.js | Candidates placeholder and product intent | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
/* - - - - - - - - - - - - - - - - */

export default function CandidatesPage() {
  return (
    <FxProtectedAppPage title="Candidates">
      <section className="max-w-[800px] space-y-[16px]">
        <h1 className={FX_TYPOGRAPHY.pageTitle}>Candidates</h1>

        <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>
          The recruiter&apos;s talent database and relationship workspace.
        </p>

        <div className={`space-y-[12px] ${FX_TYPOGRAPHY.body}`}>
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

        <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>
          Candidates become increasingly valuable as recruiter activity and
          talent history accumulate.
        </p>
      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
