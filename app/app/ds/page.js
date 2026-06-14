/* app/app/ds/page.js | Design system reference route | Sree | 2026-06-13 */

import { DesignSystemPage } from "@/components/DesignSystemPage";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";

export default async function DesignSystemRoute() {
  return (
    <FxProtectedAppPage pageId="designSystem">
      <DesignSystemPage />
    </FxProtectedAppPage>
  );
}
