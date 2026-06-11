/* app/app/jobs/page.js | Jobs workspace route | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { JobsWorkspace } from "@/components/JobsWorkspace";
/* - - - - - - - - - - - - - - - - */

export default function JobsPage() {
  return (
    <FxProtectedAppPage title="Jobs">
      <JobsWorkspace />
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
