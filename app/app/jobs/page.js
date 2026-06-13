/* app/app/jobs/page.js | Jobs placeholder route | Sree | 2026-06-13 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { PAGE_COPY } from "@/lib/FxCopy";
import { FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";

export default function JobsPage() {
  return (
    <FxProtectedAppPage title={PAGE_COPY.jobs.title}>
      <section className={`${FX_LAYOUT.contentWidthNarrow} space-y-[16px]`}>
        <h1 className={FX_TYPOGRAPHY.pageTitle}>{PAGE_COPY.jobs.title}</h1>
        <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>{PAGE_COPY.jobs.description}</p>
      </section>
    </FxProtectedAppPage>
  );
}
