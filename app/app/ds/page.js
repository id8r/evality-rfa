/* app/app/ds/page.js | Design system route rendered from FxDocs/Design_System.md | Sree | 2026-06-14 */

import path from "node:path";
import { readFile } from "node:fs/promises";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FX_COLORS, FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";

const DESIGN_SYSTEM_DOC_PATH = path.join(process.cwd(), "FxDocs", "Design_System.md");

const markdownComponents = {
  h1: ({ children }) => <h1 className={`${FX_TYPOGRAPHY.pageTitle} text-[var(--fx-text)]`}>{children}</h1>,
  h2: ({ children }) => <h2 className={`${FX_TYPOGRAPHY.h2} mt-[32px] text-[var(--fx-text)]`}>{children}</h2>,
  h3: ({ children }) => <h3 className={`${FX_TYPOGRAPHY.h3} mt-[24px] text-[var(--fx-text)]`}>{children}</h3>,
  h4: ({ children }) => <h4 className={`${FX_TYPOGRAPHY.cardTitle} mt-[24px] text-[var(--fx-text)]`}>{children}</h4>,
  p: ({ children }) => <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{children}</p>,
  ul: ({ children }) => <ul className={`list-disc space-y-[8px] pl-[24px] ${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>{children}</ul>,
  ol: ({ children }) => <ol className={`list-decimal space-y-[8px] pl-[24px] ${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>{children}</ol>,
  li: ({ children }) => <li className="leading-[22px]">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-[var(--fx-text)]">{children}</strong>,
  em: ({ children }) => <em className="italic text-[var(--fx-text)]">{children}</em>,
  hr: () => <hr className="my-[24px] border-[var(--fx-border)]" />,
  blockquote: ({ children }) => (
    <blockquote className={`border-l-2 border-[var(--fx-border)] pl-[16px] ${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded-[4px] bg-[var(--fx-surface-hover)] px-[4px] py-[1px] font-mono text-[12px] text-[var(--fx-text)]">
        {children}
      </code>
    ) : (
      <code className="font-mono text-[12px] text-[var(--fx-text)]">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-[16px] text-[12px] leading-[18px] text-[var(--fx-text)]">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[14px] leading-[22px] text-[var(--fx-text)]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[var(--fx-bg-soft)] text-[12px] leading-[18px] font-medium uppercase text-[var(--fx-text-muted)]">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-[var(--fx-border)]">{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-[var(--fx-border)]">{children}</tr>,
  th: ({ children }) => <th className="px-[16px] py-[12px] font-medium">{children}</th>,
  td: ({ children }) => <td className="px-[16px] py-[12px] align-top">{children}</td>,
};

export default async function DesignSystemRoute() {
  const markdown = await readFile(DESIGN_SYSTEM_DOC_PATH, "utf8");

  return (
    <FxProtectedAppPage pageId="designSystem">
      <section className={`${FX_LAYOUT.contentWidthWide} min-h-0 flex-1 py-[24px]`}>
        {/* <div className="mb-[24px] space-y-[8px]">
          <p className={`${FX_TYPOGRAPHY.metaLabel} text-[var(--fx-text-muted)]`}>Design System</p>
          <h1 className={`${FX_TYPOGRAPHY.pageTitle} text-[var(--fx-text)]`}>FxDocs / Design_System.md</h1>
          <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
            Rendered directly from the markdown source so this route stays in sync with the documented baseline.
          </p>
        </div> */}

        <article className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]`}>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
            {markdown}
          </ReactMarkdown>
        </article>
      </section>
    </FxProtectedAppPage>
  );
}
