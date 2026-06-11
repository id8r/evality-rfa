/* app/app/clients/page.js | Clients placeholder and product intent | Sree | 2026-06-11 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
/* - - - - - - - - - - - - - - - - */

export default function ClientsPage() {
  return (
    <FxProtectedAppPage title="Clients">
      <section className="max-w-[800px] space-y-[16px]">
        <h1 className="text-[30px] font-medium leading-[36px]">Clients</h1>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          A dedicated workspace for recruiters hiring on behalf of clients.
        </p>

        <div className="space-y-[12px] text-[14px] leading-[22px]">
          <p><strong>What resides here</strong></p>
          <ul className="list-disc pl-[24px] space-y-[4px]">
            <li>Client records</li>
            <li>Client contacts</li>
            <li>Client jobs</li>
            <li>Submitted candidates</li>
            <li>Feedback tracking</li>
            <li>Client-side follow-ups</li>
          </ul>
        </div>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          Evality is intentionally designed to support independent and
          client-facing recruiters, making this a first-class area.
        </p>
      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */