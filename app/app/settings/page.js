/* app/app/settings/page.js | Settings route | Sree | 2026-06-14 */

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { getPageMeta } from "@/lib/FxConstants";
import { FX_COLORS, FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";

function SettingCard({ title, body }) {
  return (
    <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
      <h2 className={FX_TYPOGRAPHY.cardTitle}>{title}</h2>
      <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>{body}</p>
    </section>
  );
}

export default function SettingsPage() {
  const pageMeta = getPageMeta("settings");

  return (
    <FxProtectedAppPage pageId="settings">
      <section className={`${FX_LAYOUT.contentWidthMedium} space-y-[24px]`}>
        <div className="space-y-[6px]">
          <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Settings</p>
          <h1 className={FX_TYPOGRAPHY.pageTitle}>{pageMeta?.pageTitle ?? "Settings"}</h1>
          <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
            Workspace-level preferences, recruiting defaults, and account settings will live here.
          </p>
        </div>

        <div className="grid gap-[16px] md:grid-cols-2">
          <SettingCard title="Workspace Defaults" body="Choose the default recruiting context, role visibility, and job routing behavior." />
          <SettingCard title="Account" body="Update profile, email, and sign-in preferences." />
          <SettingCard title="Notifications" body="Tune how and when updates are surfaced across the product." />
          <SettingCard title="Privacy" body="Manage sharing behavior and other workspace-level controls." />
        </div>
      </section>
    </FxProtectedAppPage>
  );
}
