import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { JobsWorkspace } from "@/components/JobsWorkspace";

export default function Page() {
  return (
    <FxProtectedAppPage title="Jobs">
      <JobsWorkspace />
    </FxProtectedAppPage>
  );
}
