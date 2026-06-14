/*
app/layout.js | Root layout with theme and providers | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

import { APP_DESCRIPTION, APP_TITLE } from "@/lib/FxConstants";
import { FxThemeController } from "@/components/FxThemeController";
import { FxToaster } from "@/components/FxToaster";

import "./globals.css";

export const metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <FxToaster>
          <FxThemeController />
          {children}
        </FxToaster>
      </body>
    </html>
  );
}

/* - - - - - - - - - - - - - - - - */
