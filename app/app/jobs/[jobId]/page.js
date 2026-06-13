/* app/app/jobs/[jobId]/page.js | Job workspace placeholder route | Sree | 2026-06-13 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { ROUTES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import { FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";

export default function JobDetailsPage() {
  return (
    <FxProtectedAppPage
      title={PAGE_COPY.jobWorkspace.title}
      navbarLeading={
        <Link href={ROUTES.JOBS} className={`inline-flex items-center gap-[8px] ${FX_TYPOGRAPHY.button} text-foreground hover:text-primary`}>
          <ArrowLeft className="size-[16px]" />
          All Jobs
        </Link>
      }
    >
      <section className={`${FX_LAYOUT.contentWidthNarrow} space-y-[16px]`}>
        <h1 className={FX_TYPOGRAPHY.pageTitle}>{PAGE_COPY.jobWorkspace.title}</h1>
        <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>{PAGE_COPY.jobWorkspace.description}</p>
      </section>
    </FxProtectedAppPage>
  );
}
