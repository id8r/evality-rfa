/* app/app/clients/page.js | Clients placeholder and product intent | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { PAGE_COPY } from "@/lib/FxCopy";
/* - - - - - - - - - - - - - - - - */

export default function ClientsPage() {
  return (
    <FxProtectedAppPage title={PAGE_COPY.clients.title}>
      <section className={`${FX_LAYOUT.contentWidthNarrow} space-y-[16px]`}>
        <h1 className={FX_TYPOGRAPHY.pageTitle}>{PAGE_COPY.clients.title}</h1>

        <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>{PAGE_COPY.clients.description}</p>
      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
