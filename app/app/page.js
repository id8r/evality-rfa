import { CreateJobForm } from "@/components/CreateJobForm";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";

export default function Page() {
  return (
    <FxProtectedAppPage title="Create Job">
      <CreateJobForm />
    </FxProtectedAppPage>
  );
}
