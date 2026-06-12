/* app/app/jobs/[jobId]/page.js | Dedicated job workspace route | Sree | 2026-06-12 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { JobWorkspace } from "@/components/JobWorkspace";
import { ROUTES } from "@/lib/FxConstants";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

export default function JobDetailsPage({ params }) {
  return (
    <FxProtectedAppPage
      title=""
      navbarLeading={
        <Link href={ROUTES.JOBS} className={`inline-flex items-center gap-[8px] ${FX_TYPOGRAPHY.button} text-foreground hover:text-primary`}>
          <ArrowLeft className="size-[16px]" />
          All Jobs
        </Link>
      }
    >
      <JobWorkspace jobId={params.jobId} />
    </FxProtectedAppPage>
  );
}
