"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, MoreHorizontal } from "lucide-react";

import { FxButton, fxButtonClassName, fxIconButtonClassName } from "@/components/FxButton";
import { FxEmptyState } from "@/components/FxEmptyState";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxSelect } from "@/components/FxSelect";
import { FxTagInput } from "@/components/FxTagInput";
import { useFxTheme } from "@/components/FxThemeToggle";
import { FxTable } from "@/components/FxTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  FX_COLORS,
  FX_LAYOUT,
  FX_SHADOW,
  FX_TYPOGRAPHY,
} from "@/lib/FxTheme";
import {
  DESIGN_SYSTEM_COLORS,
  DESIGN_SYSTEM_TYPOGRAPHY,
} from "@/lib/FxDesignSystem";
import { cn } from "@/lib/FxUtils";
import { THEMES } from "@/lib/FxConstants";

const TABLE_COLUMNS = [
  { key: "jobId", label: "Job ID", width: 120, minWidth: 112, maxWidth: 136, defaultVisible: true },
  { key: "jobTitle", label: "Job Title", width: 260, minWidth: 220, grow: 2, defaultVisible: true },
  { key: "client", label: "Client", width: 160, minWidth: 140, maxWidth: 200, defaultVisible: true },
  { key: "status", label: "Status", width: 120, minWidth: 104, maxWidth: 136, align: "center", defaultVisible: true },
  { key: "lastUpdated", label: "Last Updated", width: 160, minWidth: 140, maxWidth: 180, defaultVisible: true },
  { key: "actions", label: "", width: 56, minWidth: 56, maxWidth: 56, align: "right", required: true, locked: true, hideable: false },
];

function Section({ title, description, action, className = "", children }) {
  return (
    <section className={cn("space-y-[16px] border-t border-[var(--fx-border)] pt-[24px] first:border-t-0 first:pt-0", className)}>
      <div className="space-y-[4px]">
        <h2 className={FX_TYPOGRAPHY.sectionTitle}>{title}</h2>
        {description || action ? (
          <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px]">
            {description ? <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{description}</p> : null}
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ label, token, className }) {
  const textClassName =
    token === "--fx-text" || token === "--fx-primary" || token === "--fx-success" || token === "--fx-danger"
      ? "text-white"
      : "text-[var(--fx-text)]";

  return (
    <div className={`flex items-center gap-[12px] overflow-hidden rounded-[8px] border-[0.5px] border-[var(--fx-border)] bg-[var(--fx-surface)] p-[12px]`}>
      <div className={`size-[56px] shrink-0 rounded-full border-[0.5px] border-[var(--fx-border)] ${className}`} />
      <div className="min-w-0 space-y-[4px]">
        <div className={`${FX_TYPOGRAPHY.button} ${textClassName}`}>{label}</div>
        <div className={`${FX_TYPOGRAPHY.caption} truncate text-[var(--fx-text-muted)]`}>{token}</div>
      </div>
    </div>
  );
}

function ThemeColorGrid({ title, subtitle, themeClassName = "" }) {
  return (
    <div className={cn("space-y-[12px] rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]", themeClassName)}>
      <div className="space-y-[4px]">
        <div className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>{title}</div>
        <div className={`${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)]`}>{subtitle}</div>
      </div>
      <div className="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
        {DESIGN_SYSTEM_COLORS.map((swatch) => (
          <Swatch key={`${title}-${swatch.token}`} {...swatch} />
        ))}
      </div>
    </div>
  );
}

function TypographyRow({ name, sample, token, source }) {
  return (
    <div className={`grid gap-[12px] rounded-[10px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[12px] md:grid-cols-[180px_minmax(0,1fr)_240px] md:items-center`}>
      <div className={`${FX_TYPOGRAPHY.metaLabel} text-[var(--fx-text-muted)]`}>{name}</div>
      <div className={`${token} text-[var(--fx-text)]`}>{sample}</div>
      <div className={`${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)]`}>{source}</div>
    </div>
  );
}

function TableActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={fxIconButtonClassName({ variant: "ghost", size: "sm" })} aria-label="Open row actions">
          <MoreHorizontal className="size-[16px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Move</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[var(--fx-danger)]">Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DesignSystemRoute() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tags, setTags] = useState(["React", "Tailwind"]);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(TABLE_COLUMNS.map((column) => column.key));
  const [recruitingMode, setRecruitingMode] = useState("internal");
  const { theme, handleToggleTheme } = useFxTheme();

  const tableRows = [
    {
      id: "JOB-1024",
      jobId: "JOB-1024",
      jobTitle: "Senior Frontend Engineer",
      client: "ThinkJS",
      status: <span className="rounded-full bg-[var(--fx-primary)]/10 px-[10px] py-[4px] text-[var(--fx-primary)]">Published</span>,
      lastUpdated: "2h ago",
      actions: <TableActionsMenu />,
    },
    {
      id: "JOB-2048",
      jobId: "JOB-2048",
      jobTitle: "Product Designer",
      client: "Northstar Labs",
      status: <span className="rounded-full bg-[var(--fx-warning)]/10 px-[10px] py-[4px] text-[var(--fx-warning)]">Draft</span>,
      lastUpdated: "5h ago",
      actions: <TableActionsMenu />,
    },
    {
      id: "JOB-3096",
      jobId: "JOB-3096",
      jobTitle: "Backend Engineer",
      client: "SignalDesk",
      status: <span className="rounded-full bg-[var(--fx-success)]/10 px-[10px] py-[4px] text-[var(--fx-success)]">Active</span>,
      lastUpdated: "1d ago",
      actions: <TableActionsMenu />,
    },
  ];

  return (
    <FxProtectedAppPage pageId="designSystem" title="Design System">
      <section className={`${FX_LAYOUT.contentWidthWide} min-h-0 flex-1 py-[24px]`}>
        <div className="space-y-[24px]">
          <div className="flex items-start justify-between gap-[16px]">
            <div className="space-y-[8px]">
              <h1 className={FX_TYPOGRAPHY.pageTitle}>Evality AI Design System</h1>
              <p className={`${FX_TYPOGRAPHY.body} max-w-[72ch] text-[var(--fx-text-muted)]`}>
                Visual reference for Evality tokens, primitives, and reusable components.
              </p>
            </div>
            <Link
              href="/app/ds/md"
              target="_blank"
              rel="noreferrer"
              className={fxButtonClassName({ variant: "outline", size: "sm" })}
            >
              Open Design System MD
            </Link>
          </div>

          <Section title="Colors" description="Tokens from FxTheme and CSS variables only.">
            <div className="mb-[12px] flex items-center justify-between gap-[16px] rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[16px] py-[12px]">
              <div className="space-y-[2px]">
                <div className={FX_TYPOGRAPHY.cardTitle}>Theme preview</div>
                <div className={`${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)]`}>Switch the app chrome while keeping both token groups visible.</div>
              </div>
              <label className="flex items-center gap-[10px]">
                <Checkbox
                  checked={theme === THEMES.DARK}
                  onCheckedChange={(checked) => {
                    const shouldBeDark = checked === true;
                    if (shouldBeDark !== (theme === THEMES.DARK)) {
                      handleToggleTheme();
                    }
                  }}
                />
                <span className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>Use dark app theme</span>
              </label>
            </div>

            <div className="grid gap-[16px] lg:grid-cols-2">
              <ThemeColorGrid
                title="Light Theme"
                subtitle="Current default token set."
              />
              <ThemeColorGrid
                title="Dark Theme"
                subtitle="Rendered with the dark token set."
                themeClassName="dark"
              />
            </div>
          </Section>

          <Section title="Typography" description="Actual type tokens used across the app.">
            <div className="space-y-[10px]">
              {DESIGN_SYSTEM_TYPOGRAPHY.map((row) => (
                <TypographyRow key={row.name} {...row} />
              ))}
            </div>
          </Section>

          <Section title="Buttons" description="Existing FxButton variants and sizes.">
            <div className="space-y-[12px]">
              <div className="flex flex-wrap items-center gap-[8px]">
                <FxButton>Primary</FxButton>
                <FxButton variant="secondary">Secondary</FxButton>
                <FxButton variant="outline">Outline</FxButton>
                <FxButton variant="ghost">Ghost</FxButton>
                <FxButton variant="destructive">Danger</FxButton>
                <FxButton disabled>Disabled</FxButton>
              </div>
              <div className="flex flex-wrap items-center gap-[8px]">
                <FxButton size="sm">Small</FxButton>
                <FxButton size="md">Medium</FxButton>
                <FxButton size="lg">Large</FxButton>
              </div>
            </div>
          </Section>

          <Section title="Inputs" description="Built form controls already used in the product.">
            <div className="grid gap-[16px] lg:grid-cols-2">
              <div className="space-y-[12px] rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
                <FxInput label="Company Name" defaultValue="Evality" />
                <FxInput label="About Company" textarea defaultValue="Recruiter-first workspace for jobs, candidates, and screening." className="min-h-[104px]" />
                <FxSelect
                  label="Company Size"
                  value="11-50"
                  onChange={() => {}}
                  options={["1-10", "11-50", "51-200", "201-500", "500+"]}
                />
              </div>
              <div className="space-y-[12px] rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
                <FxTagInput label="Tags" value={tags} onChange={setTags} />
                <div className="space-y-[8px]">
                  <div className={FX_TYPOGRAPHY.fieldLabel}>Recruiting Mode</div>
                  <RadioGroup value={recruitingMode} onValueChange={setRecruitingMode} className="grid gap-[8px]">
                    {[
                      ["internal", "Hiring for My Company"],
                      ["clients", "Hiring for Clients"],
                      ["both", "Both"],
                    ].map(([value, label]) => (
                      <label key={value} className="flex items-center gap-[10px] rounded-[8px] border border-[var(--fx-border)] px-[12px] py-[10px]">
                        <RadioGroupItem value={value} />
                        <span className={FX_TYPOGRAPHY.body}>{label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <label className="flex items-center gap-[10px] rounded-[8px] border border-[var(--fx-border)] px-[12px] py-[10px]">
                  <Checkbox checked />
                  <span className={FX_TYPOGRAPHY.body}>Use AI-assisted screening</span>
                </label>
              </div>
            </div>
          </Section>

          <Section title="Table" description="Small realistic Jobs table with column picker and actions.">
            <div className={`h-[320px] rounded-[10px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[12px]`}>
              <FxTable
                columns={TABLE_COLUMNS}
                rows={tableRows}
                visibleColumnKeys={visibleColumnKeys}
                onVisibleColumnKeysChange={setVisibleColumnKeys}
                enableColumnPicker
                stickyHeader
                stickyFirstColumn
                stickyLastColumn
                scrollX
                storageKey={null}
              />
            </div>
          </Section>

          <Section title="Surfaces" description="Cards, empty states, and lightweight content containers.">
            <div className="grid gap-[16px] lg:grid-cols-2">
              <div className={`rounded-[10px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px] ${FX_SHADOW.card}`}>
                <div className="space-y-[8px]">
                  <div className={FX_TYPOGRAPHY.cardTitle}>Simple content card</div>
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                    Use these surfaces for compact summaries, status blocks, or grouped settings.
                  </p>
                </div>
                <div className="mt-[16px] flex items-center gap-[8px]">
                  <FxButton size="sm">Primary action</FxButton>
                  <FxButton size="sm" variant="outline">Secondary</FxButton>
                </div>
              </div>
              <FxEmptyState
                icon={Inbox}
                title="No records yet"
                body="Empty states should stay simple and actionable."
                action={<FxButton size="sm" variant="outline">Create record</FxButton>}
              />
            </div>
          </Section>

          <Section title="Sheets, Dialogs, Menus" description="Overlay primitives that already exist in the product." className="pb-[32px]">
            <div className="flex flex-wrap items-center gap-[8px]">
              <FxButton variant="outline" size="sm" onClick={() => setIsSheetOpen(true)}>
                Open Sheet
              </FxButton>
              <FxButton variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                Open Dialog
              </FxButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={fxIconButtonClassName({ variant: "outline", size: "sm" })}>
                    <MoreHorizontal className="size-[16px]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  <DropdownMenuItem>Action one</DropdownMenuItem>
                  <DropdownMenuItem>Action two</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[var(--fx-danger)]">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetContent size="sm">
                <SheetHeader title="Sheet sample" description="Compact sidebar-style overlay." />
                <SheetBody>
                  <div className="space-y-[12px]">
                    <FxInput label="Title" defaultValue="New role" />
                    <FxInput label="Note" textarea defaultValue="Use sheets for focused editing." className="min-h-[96px]" />
                  </div>
                </SheetBody>
                <SheetFooter right={<FxButton size="sm" onClick={() => setIsSheetOpen(false)}>Save</FxButton>} />
              </SheetContent>
            </Sheet>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog sample</DialogTitle>
                  <DialogDescription>Use dialogs for confirmations or tight edits.</DialogDescription>
                </DialogHeader>
                <div className="space-y-[12px]">
                  <div className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-[12px]">
                    <div className={FX_TYPOGRAPHY.cardTitle}>Confirm action</div>
                    <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>Keep modal content brief.</p>
                  </div>
                  <div className="flex justify-end gap-[8px]">
                    <FxButton variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </FxButton>
                    <FxButton size="sm" onClick={() => setIsDialogOpen(false)}>
                      Confirm
                    </FxButton>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Section>

          {/* <Section
            className="pb-[32px]"
            title="Markdown"
            description="The raw Design_System.md source remains accessible."
            action={
              <Link
                href="/app/ds/md"
                target="_blank"
                rel="noreferrer"
                className={`${fxButtonClassName({ variant: "ghost", size: "sm" })} inline-flex`}
              >
                Open Design System MD
              </Link>
            }
          >
          </Section> */}
        </div>
      </section>
    </FxProtectedAppPage>
  );
}
