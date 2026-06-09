/*
app/layout.tsx | Root layout with theme and fonts | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Evality RFA",
  description: "Recruiter-First Approach click-through prototype for Evality AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

/* - - - - - - - - - - - - - - - - */
