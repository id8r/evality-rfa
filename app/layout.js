/*
app/layout.js | Root layout with theme and providers | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

import { APP_DESCRIPTION, APP_TITLE } from "@/lib/FxConstants";
import { FxThemeController } from "@/components/FxThemeController";
import { FxToaster } from "@/components/FxToaster";
import Script from "next/script";

import "./globals.css";

export const metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }) {
  const themeScript = `
    (function () {
      try {
        var storedTheme = window.localStorage.getItem('evality-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var shouldUseDark = storedTheme ? storedTheme === 'dark' : prefersDark;
        document.documentElement.classList.toggle('dark', shouldUseDark);
      } catch (error) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <FxToaster>
          <FxThemeController />
          {children}
        </FxToaster>
      </body>
    </html>
  );
}

/* - - - - - - - - - - - - - - - - */
