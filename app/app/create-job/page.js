/* app/app/create-job/page.js | Create Job compatibility route via Jobs workspace | Sree | 2026-06-11 */
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { JobsWorkspace } from "@/components/JobsWorkspace";
/* - - - - - - - - - - - - - - - - */

export default function CreateJobPage() {
  return (
    <FxProtectedAppPage title="Jobs">
      <JobsWorkspace initialCreateOpen />
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
