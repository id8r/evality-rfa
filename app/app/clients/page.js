/* app/app/clients/page.js | Clients workspace table and add-client sheet | Sree | 2026-06-19 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Archive, FolderOpen, MoreHorizontal, Plus, RotateCcw, Trash2 } from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxEmptyState } from "@/components/FxEmptyState";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxSelect } from "@/components/FxSelect";
import { FxTable } from "@/components/FxTable";
import { showSuccess, showWarning } from "@/components/FxToast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { archiveStoredClient, deleteStoredClient, readStoredCandidates, readStoredClients, readStoredJobs, restoreStoredClient, upsertStoredClient } from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const INDUSTRY_OPTIONS = [
  "General",
  "Technology Staffing",
  "Consulting",
  "SaaS",
  "Analytics",
  "Fintech",
  "Product Services",
  "Cloud Infrastructure",
  "Venture Studio",
];

const STATUS_OPTIONS = ["Active", "Archived"];

function normalizeKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function formatRelativeTime(value) {
  if (!value) {
    return "—";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "—";
  }

  const diffDays = Math.max(0, Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)));

  if (diffDays === 0) {
    return "Today";
  }

  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function countMatchingCandidates(jobRows, candidateRows, clientName) {
  const jobIds = new Set(
    jobRows
      .filter((job) => normalizeKey(job.client ?? job.company) === normalizeKey(clientName))
      .map((job) => job.id),
  );

  return candidateRows.filter((candidate) => jobIds.has(candidate.jobId)).length;
}

function getClientMetrics(client, jobRows, candidateRows) {
  const matchingJobs = jobRows.filter((job) => normalizeKey(job.client ?? job.company) === normalizeKey(client.name));
  const openJobs = matchingJobs.filter((job) => job.status !== "Archived" && !job.isArchived).length;
  const candidates = countMatchingCandidates(jobRows, candidateRows, client.name);
  const timestamps = [
    client.updatedAt,
    ...matchingJobs.map((job) => job.updatedAt),
    ...candidateRows
      .filter((candidate) => matchingJobs.some((job) => job.id === candidate.jobId))
      .map((candidate) => candidate.updatedAt),
  ]
    .map((value) => new Date(value).getTime())
    .filter((value) => !Number.isNaN(value));

  const lastActivity = timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : client.updatedAt;

  return { openJobs, candidates, lastActivity };
}

function ClientStatusPill({ status }) {
  const isArchived = status === "Archived";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-[10px] py-[4px] text-[12px] font-medium",
        isArchived
          ? "bg-[color-mix(in_srgb,var(--fx-text-muted)_12%,var(--fx-surface)_88%)] text-[var(--fx-text-muted)]"
          : "bg-[color-mix(in_srgb,var(--fx-success)_14%,var(--fx-surface)_86%)] text-[var(--fx-success)]",
      )}
    >
      {isArchived ? "Archived" : "Active"}
    </span>
  );
}

function createEmptyClientForm() {
  return {
    id: null,
    name: "",
    industry: "General",
    owner: "",
    website: "",
    email: "",
    status: "Active",
    notes: "",
  };
}

function buildClientForm(client) {
  if (!client) {
    return createEmptyClientForm();
  }

  return {
    id: client.id,
    name: client.name ?? "",
    industry: client.industry ?? "General",
    owner: client.owner ?? "",
    website: client.website ?? "",
    email: client.email ?? "",
    status: client.status === "Archived" || client.archived ? "Archived" : "Active",
    notes: client.notes ?? "",
  };
}

export default function ClientsPage() {
  const [clientRows, setClientRows] = useState(() => readStoredClients());
  const [jobRows, setJobRows] = useState(() => readStoredJobs());
  const [candidateRows, setCandidateRows] = useState(() => readStoredCandidates());
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "updatedAt", direction: "desc" });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [clientForm, setClientForm] = useState(createEmptyClientForm());
  const [clientToDelete, setClientToDelete] = useState(null);
  const searchInputRef = useRef(null);
  const tableSurfaceRef = useRef(null);

  useEffect(() => {
    function syncClients() {
      setClientRows(readStoredClients());
      setJobRows(readStoredJobs());
      setCandidateRows(readStoredCandidates());
    }

    syncClients();
    window.addEventListener("storage", syncClients);
    window.addEventListener("fx-storage-change", syncClients);

    return () => {
      window.removeEventListener("storage", syncClients);
      window.removeEventListener("fx-storage-change", syncClients);
    };
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event) {
      const target = event.target;
      const isSearchFocused = target === searchInputRef.current;
      const isTypingField =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);

      if (isTypingField && !isSearchFocused) {
        return;
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && !isSearchFocused) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (event.key === "Escape" && isSearchFocused) {
        if (searchTerm) {
          setSearchTerm("");
          searchInputRef.current?.focus();
          event.preventDefault();
          return;
        }

        if (tableSurfaceRef.current) {
          tableSurfaceRef.current.focus();
          event.preventDefault();
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [searchTerm]);

  const counts = useMemo(() => {
    const archived = clientRows.filter((client) => client.status === "Archived" || client.archived);

    return {
      active: clientRows.length - archived.length,
      archived: archived.length,
    };
  }, [clientRows]);

  const visibleClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const nextClients = clientRows
      .filter((client) => {
        const isArchived = client.status === "Archived" || client.archived;
        return selectedTab === "archived" ? isArchived : !isArchived;
      })
      .filter((client) => {
        if (!query) {
          return true;
        }

        const haystack = [
          client.name,
          client.industry,
          client.owner,
          client.website,
          client.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      });

    return [...nextClients].sort((left, right) => {
      const leftMetrics = getClientMetrics(left, jobRows, candidateRows);
      const rightMetrics = getClientMetrics(right, jobRows, candidateRows);

      if (sortConfig.key === "updatedAt") {
        const leftDate = new Date(leftMetrics.lastActivity).getTime();
        const rightDate = new Date(rightMetrics.lastActivity).getTime();
        return sortConfig.direction === "asc" ? leftDate - rightDate : rightDate - leftDate;
      }

      if (sortConfig.key === "openJobs" || sortConfig.key === "candidates") {
        const leftValue = sortConfig.key === "openJobs" ? leftMetrics.openJobs : leftMetrics.candidates;
        const rightValue = sortConfig.key === "openJobs" ? rightMetrics.openJobs : rightMetrics.candidates;
        return sortConfig.direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
      }

      return sortConfig.direction === "asc"
        ? String(left[sortConfig.key] ?? "").localeCompare(String(right[sortConfig.key] ?? ""))
        : String(right[sortConfig.key] ?? "").localeCompare(String(left[sortConfig.key] ?? ""));
    });
  }, [candidateRows, clientRows, jobRows, searchTerm, selectedTab, sortConfig]);

  function handleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }

      return { key, direction: key === "updatedAt" ? "desc" : "asc" };
    });
  }

  function handleCreateClient() {
    setClientForm(createEmptyClientForm());
    setIsSheetOpen(true);
  }

  function handleEditClient(client) {
    setClientForm(buildClientForm(client));
    setIsSheetOpen(true);
  }

  function handleSaveClient(event) {
    event.preventDefault();

    if (!clientForm.name.trim()) {
      showWarning("Client name required", "Add a client name before saving.");
      return;
    }

    const nextClient = upsertStoredClient({
      id: clientForm.id ?? undefined,
      name: clientForm.name.trim(),
      industry: clientForm.industry.trim(),
      owner: clientForm.owner.trim() || "Unassigned",
      website: clientForm.website.trim(),
      email: clientForm.email.trim(),
      status: clientForm.status,
      notes: clientForm.notes.trim(),
    });

    setClientForm(buildClientForm(nextClient));
    setIsSheetOpen(false);
    showSuccess(clientForm.id ? "Client updated" : "Client added", `${nextClient.name} is now in the clients table.`);
  }

  function handleArchiveClient(client) {
    archiveStoredClient(client.id);
    showSuccess("Client archived", `${client.name} moved to archived clients.`);
  }

  function handleRestoreClient(client) {
    restoreStoredClient(client.id);
    showSuccess("Client restored", `${client.name} moved back to active clients.`);
  }

  function handleDeleteClient() {
    if (!clientToDelete) {
      return;
    }

    deleteStoredClient(clientToDelete.id);
    showSuccess("Client deleted", `${clientToDelete.name} was removed from the workspace.`);
    setClientToDelete(null);
  }

  const rows = visibleClients.map((client) => {
    const metrics = getClientMetrics(client, jobRows, candidateRows);
    const isArchived = client.status === "Archived" || client.archived;

    return {
      id: client.id,
      name: (
        <div className="flex min-w-0 items-center gap-[10px]">
          <button
            type="button"
            className={`block min-w-0 truncate text-left ${FX_TYPOGRAPHY.clickableData} text-[var(--fx-primary)] hover:text-[var(--fx-text)]`}
            title={client.name}
            onClick={() => handleEditClient(client)}
          >
            {client.name}
          </button>
        </div>
      ),
      industry: <span className="block truncate text-[var(--fx-text)]">{client.industry || "General"}</span>,
      openJobs: <span className="tabular-nums text-[var(--fx-text)]">{metrics.openJobs}</span>,
      candidates: <span className="tabular-nums text-[var(--fx-text)]">{metrics.candidates}</span>,
      owner: <span className="block truncate text-[var(--fx-text)]">{client.owner || "Unassigned"}</span>,
      status: <ClientStatusPill status={isArchived ? "Archived" : "Active"} />,
      updatedAt: (
        <span className="block truncate text-[var(--fx-text-muted)]" title={new Date(metrics.lastActivity).toLocaleString()}>
          {formatRelativeTime(metrics.lastActivity)}
        </span>
      ),
      actions: (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center ${FX_RADIUS.xs} text-[var(--fx-text-muted)] hover:bg-[var(--fx-bg-soft)] hover:text-[var(--fx-text)]`}
              >
                <MoreHorizontal className="size-[16px]" />
                <span className="sr-only">Open actions</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem onClick={() => handleEditClient(client)}>Edit Client</DropdownMenuItem>
              {isArchived ? (
                <DropdownMenuItem onClick={() => handleRestoreClient(client)}>
                  <RotateCcw className="mr-[8px] size-[14px]" />
                  Restore Client
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleArchiveClient(client)}>
                  <Archive className="mr-[8px] size-[14px]" />
                  Archive Client
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-[var(--fx-danger)]" onClick={() => setClientToDelete(client)}>
                <Trash2 className="mr-[8px] size-[14px]" />
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    };
  });

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: (
          <button type="button" className="inline-flex cursor-pointer items-center gap-[8px] text-left text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]" onClick={() => handleSort("name")}>
            <span>Client</span>
            <ArrowUpDown className="size-[14px]" />
          </button>
        ),
        width: 260,
        minWidth: 220,
        grow: 2,
        required: true,
        locked: true,
        hideable: false,
      },
      {
        key: "industry",
        label: "Industry",
        width: 180,
        minWidth: 160,
        maxWidth: 220,
      },
      {
        key: "openJobs",
        label: "Open Jobs",
        width: 104,
        minWidth: 96,
        maxWidth: 120,
        align: "center",
      },
      {
        key: "candidates",
        label: (
          <button type="button" className="inline-flex cursor-pointer items-center gap-[8px] text-left text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]" onClick={() => handleSort("candidates")}>
            <span>Candidates</span>
            <ArrowUpDown className="size-[14px]" />
          </button>
        ),
        width: 112,
        minWidth: 100,
        maxWidth: 132,
        align: "center",
      },
      {
        key: "owner",
        label: "Owner",
        width: 170,
        minWidth: 150,
        maxWidth: 220,
      },
      {
        key: "status",
        label: "Status",
        width: 120,
        minWidth: 112,
        maxWidth: 132,
        align: "center",
      },
      {
        key: "updatedAt",
        label: (
          <button type="button" className="inline-flex cursor-pointer items-center gap-[8px] text-left text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]" onClick={() => handleSort("updatedAt")}>
            <span>Last Activity</span>
            <ArrowUpDown className="size-[14px]" />
          </button>
        ),
        width: 132,
        minWidth: 120,
        maxWidth: 144,
        align: "right",
      },
      {
        key: "actions",
        label: null,
        width: 64,
        minWidth: 64,
        maxWidth: 64,
        align: "right",
        required: true,
        locked: true,
        hideable: false,
      },
    ],
    [],
  );

  const isEmpty = visibleClients.length === 0;
  const showTableEmptyState = isEmpty && searchTerm.trim().length > 0;

  return (
    <FxProtectedAppPage pageId="clients" contentClassName="bg-[var(--fx-surface)]">
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden`}>
        <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-hidden">
          <div className="grid min-w-0 flex-none grid-cols-[minmax(0,1fr)_auto] items-end gap-[16px]">
            <div className="flex min-w-0 items-end gap-[24px]">
              <button
                type="button"
                className={`relative cursor-pointer pb-[8px] ${selectedTab === "active" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                onClick={() => setSelectedTab("active")}
              >
                Active ({counts.active})
                {selectedTab === "active" ? <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
              </button>
              <button
                type="button"
                className={`relative cursor-pointer pb-[8px] ${selectedTab === "archived" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                onClick={() => setSelectedTab("archived")}
              >
                Archived ({counts.archived})
                {selectedTab === "archived" ? <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
              </button>
            </div>

            <div className="flex min-w-0 shrink-0 items-center gap-[12px] justify-self-end">
              <div className="w-full min-w-0 max-w-[320px]">
                <FxInput
                  ref={searchInputRef}
                  aria-label="Search clients"
                  className="border-[color:color-mix(in_srgb,var(--fx-border)_72%,var(--fx-text)_28%)]"
                  placeholder="Search clients, owners, or industries..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  rightElement={(
                    <span className="inline-flex h-[24px] min-w-[24px] items-center justify-center rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[8px] text-[12px] leading-[18px] font-medium text-[var(--fx-text-muted)]">
                      /
                    </span>
                  )}
                />
              </div>
              <FxButton className="shrink-0 gap-[8px]" onClick={handleCreateClient}>
                <Plus className="size-[16px]" />
                Add Client
              </FxButton>
            </div>
          </div>

          <div
            ref={tableSurfaceRef}
            tabIndex={0}
            className="min-h-0 flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-primary)]/20"
          >
            {isEmpty && !searchTerm.trim() ? (
              <div className={`flex h-full min-h-0 items-center justify-center border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)] px-[24px] py-[24px]`}>
                <div className="w-full max-w-[560px]">
                  <FxEmptyState
                    icon={FolderOpen}
                    title="Start building your client workspace"
                    body="Create client records to track owners, open jobs, and the hiring activity tied to each account."
                    action={<FxButton onClick={handleCreateClient}>Add Client</FxButton>}
                  />
                </div>
              </div>
            ) : showTableEmptyState ? (
              <FxTable
                columns={columns}
                rows={[]}
                stickyHeader
                stickyFirstColumn
                stickyLastColumn
                scrollX
                className="h-full min-h-0"
                sortedColumnKey={sortConfig.key}
                sortedColumnDirection={sortConfig.direction}
                emptyMessage="No clients match the current search."
                enableColumnPicker
                storageKey="fx-clients-table-columns"
              />
            ) : (
              <FxTable
                columns={columns}
                rows={rows}
                stickyHeader
                stickyFirstColumn
                stickyLastColumn
                scrollX
                className="h-full min-h-0"
                sortedColumnKey={sortConfig.key}
                sortedColumnDirection={sortConfig.direction}
                emptyMessage="No clients to display."
                enableColumnPicker
                storageKey="fx-clients-table-columns"
              />
            )}
          </div>
        </div>
      </section>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent size="lg">
          <SheetHeader
            title={clientForm.id ? "Edit Client" : "Add Client"}
            description="Keep the client record, ownership, and hiring metadata in one place."
          />
          <SheetBody>
            <form className="space-y-[24px]" onSubmit={handleSaveClient}>
              <div className="grid gap-[16px] md:grid-cols-2">
                <FxInput
                  label="Client Name"
                  required
                  value={clientForm.name}
                  onChange={(event) => setClientForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="ThinkJS"
                />
                <FxSelect
                  label="Industry"
                  value={clientForm.industry}
                  options={INDUSTRY_OPTIONS}
                  onChange={(event) => setClientForm((current) => ({ ...current, industry: event.target.value }))}
                />
                <FxInput
                  label="Owner"
                  value={clientForm.owner}
                  onChange={(event) => setClientForm((current) => ({ ...current, owner: event.target.value }))}
                  placeholder="John Doe"
                />
                <FxSelect
                  label="Status"
                  value={clientForm.status}
                  options={STATUS_OPTIONS}
                  onChange={(event) => setClientForm((current) => ({ ...current, status: event.target.value }))}
                />
                <FxInput
                  label="Website"
                  value={clientForm.website}
                  onChange={(event) => setClientForm((current) => ({ ...current, website: event.target.value }))}
                  placeholder="thinkjs.ai"
                />
                <FxInput
                  label="Contact Email"
                  value={clientForm.email}
                  onChange={(event) => setClientForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="hello@thinkjs.ai"
                />
              </div>
              <FxInput
                label="Notes"
                textarea
                value={clientForm.notes}
                onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Key hiring focus, account context, or client-side notes."
              />
            </form>
          </SheetBody>
          <SheetFooter
            left={(
              <FxButton type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </FxButton>
            )}
            right={(
              <FxButton type="button" onClick={handleSaveClient}>
                {clientForm.id ? "Update Client" : "Save Client"}
              </FxButton>
            )}
          />
        </SheetContent>
      </Sheet>

      <div>
        {/* Delete confirmation is intentionally lightweight to keep the page moving. */}
        {clientToDelete ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[color:color-mix(in_srgb,var(--fx-text)_16%,transparent)] p-[24px]">
            <div className={`w-full max-w-[420px] rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.14)]`}>
              <div className="space-y-[8px]">
                <h2 className={FX_TYPOGRAPHY.cardTitle}>Delete client?</h2>
                <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                  {clientToDelete.name} will be removed from the client list. This action can be reversed only if you create the record again.
                </p>
              </div>
              <div className="mt-[24px] flex items-center justify-end gap-[8px]">
                <FxButton variant="outline" onClick={() => setClientToDelete(null)}>
                  Cancel
                </FxButton>
                <FxButton
                  variant="destructive"
                  onClick={() => {
                    handleDeleteClient();
                  }}
                >
                  Delete Client
                </FxButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
