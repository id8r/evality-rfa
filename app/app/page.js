import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/FxConstants";

export default function AppPage() {
  redirect(ROUTES.JOBS);
}
/* - - - - - - - - - - - - - - - - */