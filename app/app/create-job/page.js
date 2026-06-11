/* app/app/create-job/page.js | Create Job route | Sree | 2026-06-11 */
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { CreateJobForm } from "@/components/CreateJobForm";
/* - - - - - - - - - - - - - - - - */

export default function CreateJobPage() {
  return (
    <FxProtectedAppPage title="Create Job">
      <CreateJobForm />
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
