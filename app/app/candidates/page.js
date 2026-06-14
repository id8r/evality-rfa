/* app/app/candidates/page.js | Candidates placeholder and product intent | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { getPageMeta } from "@/lib/FxConstants";
import { FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";
/* - - - - - - - - - - - - - - - - */

export default function CandidatesPage() {
  const pageMeta = getPageMeta("candidates");

  return (
    <FxProtectedAppPage pageId="candidates">
      <section className={`${FX_LAYOUT.contentWidthNarrow} space-y-[16px]`}>
        <h1 className={FX_TYPOGRAPHY.pageTitle}>{pageMeta?.pageTitle}</h1>
        <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>{pageMeta?.description}</p>
      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
