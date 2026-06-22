<!-- FxDocs/Temporary_Job_Workspace_Report.md | Temporary Job Workspace report for ChatGPT handoff | Sree | 2026-06-22 -->

# Evality AI - Temporary Job Workspace Report

Use this as the source brief for discussing the current `/app/jobs` Job Workspace in a fresh ChatGPT thread.

This report reflects the current code behavior in:

- `app/app/jobs/[jobId]/page.js`

It is focused on:

- stage flow
- stage filters and dropdown options
- per-stage table columns
- key row actions / bulk actions
- important naming and mapping quirks already in code

---

## 1. Entry + Scope

The main Jobs route is:

- `/app/jobs`

Clicking a job opens the Job Workspace:

- `/app/jobs/[jobId]`

This Job Workspace is candidate-pipeline focused.

Top summary actions currently include:

- Recommend Candidates
- Call Preview
- Share Job
- Edit Job

Top summary metadata currently shows:

- Client (if applicable)
- Experience
- Employment Type
- Salary Range
- Positions
- Location
- Publish Date
- Question Format

---

## 2. Current Pipeline Stages

Current visible Job Workspace stages are:

1. Unscreened
2. Pre-Screened
3. Shortlisted
4. Interviewing
5. Offered
6. Joined
7. Dropped
8. Rejected

### Important internal mapping

The code still uses some older internal keys:

- `unscreened` -> `Unscreened`
- `screened` -> `Pre-Screened`
- `shortlisted` -> `Shortlisted`
- `shared` -> `Interviewing`
- `offered` -> `Offered`
- `joined` -> `Joined`
- `dropped` -> `Dropped`
- `rejected` -> `Rejected`

### Important client-progress mapping

For client-side progression after candidates are sent/interviewing:

- internal `shared` stage + `clientStatus = Interviewing` -> shown under `Interviewing`
- internal `shared` stage + `clientStatus = Offered` -> shown under `Offered`
- internal `shared` stage + `clientStatus = Joined` -> shown under `Joined`
- internal `rejected` stage + `clientStatus = Candidate Dropped Off` -> shown under `Dropped`
- other `rejected` candidates -> shown under `Rejected`

So:

- `Interviewing`, `Offered`, `Joined`, and `Dropped` are partly derived views over shared/rejected internal statuses.

---

## 3. Overall Candidate Flow

The current intended high-level flow is:

1. Unscreened
2. Pre-Screened
3. Shortlisted
4. Interviewing
5. Offered
6. Joined

Alternative terminal outcomes:

- Rejected
- Dropped

### Current practical flow behavior in code

- Email / manual screening starts in `Unscreened`
- Successful manual pre-screening moves candidate to `Pre-Screened`
- Candidates can be shortlisted from `Pre-Screened`
- Candidates can be sent onward from `Shortlisted`
- Once in client-progress land, they are reflected across:
  - `Interviewing`
  - `Offered`
  - `Joined`
  - `Dropped`
  - `Rejected`

---

## 4. Stage-Level Filters / Dropdown Options

The toolbar below the main stage tabs currently uses a **dropdown filter control**, not visible chips.

### 4.1 Unscreened filter dropdown options

Current Unscreened filters:

- All
- Pending
- In Pre-Screening Queue
- In Progress
- Processing
- Rescheduled
- Failed

Internal keys:

- `all`
- `pending`
- `in_queue`
- `in_progress`
- `processing`
- `rescheduled`
- `failed`

### 4.2 Pre-Screened filter dropdown options

Current Pre-Screened filters:

- Ready for Review
- Interested
- Not Interested

Internal keys:

- `ready`
- `interested`
- `not_interested`

### 4.3 Interviewing / client-progress filter dropdown options

Current Interviewing-stage filter options:

- All
- Feedback Awaited
- Shortlisted
- Interviewing
- Offered
- Joined
- Rejected
- On Hold
- Candidate Dropped Off

Internal keys are the same labels, except `all`.

### 4.4 Shortlisted / Offered / Joined / Dropped / Rejected

Currently:

- `Shortlisted` has no extra sub-filter set
- `Offered` has no separate additional filter logic
- `Joined` has no separate additional filter logic
- `Dropped` has no separate additional filter logic
- `Rejected` has no separate additional filter logic

In practice, the active filter dropdown appears only when `activeFilterItems` exists for that stage.

---

## 5. Current Table Header Labels

Base shared header labels:

- Name
- CV Match Score
- Experience
- Phone
- Email
- Interested
- Availability
- Notice Period
- Current CTC
- Expected CTC
- Screening
- Relevance
- Status
- Last Updated
- Rejection Reason
- Actions

Stage overrides currently applied:

- `Unscreened` uses `CV Match Score`
- `Pre-Screened` uses `Fit Score`
- `Shortlisted` uses `Fit Score`
- `Interviewing` uses `Fit Score`
- `Rejected` uses `Fit Score`

---

## 6. Per-Stage Table Columns

These are the current column sets from code.

### 6.1 Unscreened

Columns:

1. Name
2. CV Match Score
3. Experience
4. Phone
5. Email
6. Actions
7. Kebab menu column

Notes:

- `Name` is sticky left
- `Actions` is sticky right
- kebab menu column is sticky far right

### 6.2 Pre-Screened

Columns:

1. Name
2. Phone
3. Email
4. Relevance
5. Fit Score
6. Interested
7. Experience
8. Notice Period
9. Current CTC
10. Expected CTC
11. Screening
12. Actions
13. Kebab menu column

### 6.3 Shortlisted

Columns:

1. Name
2. Phone
3. Email
4. Fit Score
5. Interested
6. Experience
7. Notice Period
8. Current CTC
9. Expected CTC
10. Screening
11. Actions
12. Kebab menu column

### 6.4 Interviewing

Columns:

1. Name
2. Fit Score
3. Interested
4. Availability
5. Current CTC
6. Expected CTC
7. Screening
8. Status
9. Last Updated
10. Kebab menu column

### 6.5 Offered

Columns:

1. Name
2. Fit Score
3. Interested
4. Availability
5. Current CTC
6. Expected CTC
7. Screening
8. Status
9. Last Updated
10. Kebab menu column

### 6.6 Joined

Columns:

1. Name
2. Fit Score
3. Interested
4. Availability
5. Current CTC
6. Expected CTC
7. Screening
8. Status
9. Last Updated
10. Kebab menu column

### 6.7 Dropped

Columns:

1. Name
2. Fit Score
3. Interested
4. Availability
5. Current CTC
6. Expected CTC
7. Screening
8. Status
9. Last Updated
10. Kebab menu column

### 6.8 Rejected

Columns:

1. Name
2. Fit Score
3. Interested
4. Experience
5. Notice Period
6. Current CTC
7. Expected CTC
8. Screening
9. Rejection Reason
10. Actions
11. Kebab menu column

---

## 7. Sorting

Current sortable columns come from clickable header labels.

Observed sortable keys in code include:

- Name
- Match Score / Fit Score
- Experience
- Interested
- Availability
- Notice Period
- Current CTC
- Expected CTC
- Last Updated

### Current sort behavior

- there is table-level sort state
- active sorted column is styled in the header
- sorting is stage-dependent because visible columns change by stage

### Important note

The report should treat sort behavior as present but still worth validating manually per stage, especially:

- Fit Score / Match Score
- Experience
- Last Updated

---

## 8. Current Row-Level Actions by Stage

### 8.1 Unscreened visible row actions

Visible row action icons:

- Email Pre-Screening
- Manual Screening
- Kebab menu

Email icon tooltip:

- Email Pre-Screening

Manual icon tooltip:

- Manual Screening

### 8.2 Pre-Screened visible row actions

Visible row action:

- Shortlist

Plus kebab menu.

### 8.3 Shortlisted visible row actions

Visible row action:

- Send to Client

Plus kebab menu.

### 8.4 Interviewing / Offered / Joined / Dropped

No dedicated visible action CTA column like Shortlist/Send to Client.

The main row workflow control here is:

- inline Status dropdown
- activity/comments icon next to it
- kebab menu

### 8.5 Rejected

Rejected includes an `Actions` column in the current table config.

Stage-specific recovery / movement actions are mainly exposed through menus and bulk handlers.

---

## 9. Current Kebab Menu by Stage

### 9.1 Shared/common menu base

Common items often include:

- Open Candidate / View Candidate
- View Resume
- Download Resume

### 9.2 Pre-Screened menu

Current items include:

- View Candidate
- View Resume
- View Pre-Screen Result
- Share For Review
- Download Resume
- Reject Candidate

Shortlist is intentionally not repeated in kebab here.

### 9.3 Shortlisted menu

Current items include:

- Open Candidate
- View Resume
- View Pre-Screen Result
- Send to Client
- Download Resume
- Move back to Pre-Screened
- Remove from Job
- Reject Candidate

### 9.4 Interviewing / client-progress stages menu

Current items include:

- Open Candidate
- View Resume
- Download Resume
- Move back to Shortlisted
- Reject Candidate

`Remove from Job` is removed in client-progress stages.

### 9.5 Rejected menu

Current items include recovery actions such as:

- Move to Pre-Screened
- Move to Shortlisted

Depending on status context.

---

## 10. Bulk Actions by Stage

### 10.1 Unscreened bulk actions

Current bulk buttons:

- Start Pre-Screening
- Manual Screening-related movement depends on candidate action flow
- Remove from Job
- Mark Not Interested
- Reject
- Download Resume

### 10.2 Pre-Screened bulk actions

Current bulk buttons:

- Shortlist
- Mark Not Interested
- Reject
- Download

### 10.3 Shortlisted bulk actions

Current bulk buttons:

- Send to Client
- Reject
- Download

### 10.4 Interviewing / client-progress stages

Current bulk actions are more status/update driven and tied to client progression logic.

Notably, the inline status dropdown is more central than a heavy bulk-action workflow in these stages.

### 10.5 Rejected

Current rejected bulk actions include restoration-type actions such as:

- Move to Pre-Screened
- Move to Shortlisted

depending on current implementation branch.

---

## 11. Stage-Specific Sheets / Flows

### 11.1 Candidate Details Sheet

Opened from:

- candidate name
- kebab -> Open Candidate / View Candidate

Purpose:

- candidate overview
- resume
- notes
- current-job journey

### 11.2 CV Match Score Sheet

Opened from:

- Fit Score / CV Match Score cell

Purpose:

- breakdown of score sections
- overall score
- recruiter review aid

### 11.3 Email Pre-Screening Sheet

Opened from:

- email action in Unscreened

Purpose:

- candidate summary
- editable email field
- email template
- send/start screening

### 11.4 Manual Pre-Screening Sheet

Opened from:

- manual screening icon in Unscreened

Purpose:

- step flow:
  - Resume
  - Interview Questions
  - Pre-Screening Form

### 11.5 Pre-Screening Result Sheet

Opened from:

- Screening / Result cell

Supports:

- Manual Screening result flow
- AI Voice Screening result flow

Manual flow tabs:

- Details Retrieved
- Resume

AI Voice flow tabs:

- Details Retrieved
- AI Call Analysis
- Transcript
- Voice Recording
- Resume

### 11.6 Share Candidate for Review Sheet

Opened from:

- Pre-Screened kebab -> Share For Review

Purpose:

- share candidate with reviewer email(s)
- optional note

### 11.7 Send to Client flow

Opened from:

- Shortlisted row CTA
- Shortlisted kebab
- Shortlisted bulk action

There is also:

- Send to Client email draft / sharing-related flow

---

## 12. Interviewing / Client Status Workflow

Current client-status options:

- Feedback Awaited
- Shortlisted
- Interviewing
- Offered
- Joined
- Rejected
- On Hold
- Candidate Dropped Off

### Current visible behavior

- status is shown inline in the row
- current implementation uses a native `<select>`
- changing it opens the status activity/comment flow

### Status colors currently mapped

- Feedback Awaited -> primary / neutral blue
- Shortlisted -> green
- Interviewing -> warning/orange
- Offered -> amber/yellow
- Joined -> success green
- On Hold -> gray
- Rejected -> red
- Candidate Dropped Off -> muted red

### Activity / comment affordance

There is a comment/history icon beside the status control.

Purpose:

- open client activity history / status update flow

---

## 13. Empty State Behavior

Empty state copy exists per stage.

Examples:

- Unscreened: "No unscreened candidates yet"
- Pre-Screened: "No pre-screened candidates yet"
- Shortlisted: "No shortlisted candidates yet"
- Interviewing: "No interviewing candidates yet"
- Offered: "No offered candidates yet"
- Joined: "No joined candidates yet"
- Dropped: "No dropped candidates yet"
- Rejected: "No rejected candidates yet"

### Important current behavior

Search is stage-specific.

If a search term is active and no rows match:

- empty title becomes `No results for "<query>"`
- body says search only applies to the current stage

---

## 14. Fresh / New Candidate Indicator

There is a subtle new-candidate treatment in table selection metadata:

- fresh/unviewed candidates can get a subtle left-edge cue in the selection area

Logic is based on:

- not viewed yet
- or created/updated within the last 2 days

---

## 15. Important Current Naming / UX Quirks

These are useful to call out in a new chat:

1. The UI label says `Interviewing`, but the internal pipeline key is still `shared`.
2. `Dropped` is derived from rejected candidates whose `clientStatus` is `Candidate Dropped Off`.
3. `Screening` column label is already simplified from older `Result` naming.
4. Unscreened still uses `CV Match Score`, while later stages use `Fit Score`.
5. Filters are currently dropdown-based, not visible chips.
6. Table columns change significantly by stage.
7. `Name` is consistently the first visible primary column.
8. Right-side sticky columns are:
   - `Actions` when present
   - kebab menu column at far right

---

## 16. Suggested Prompt for a Fresh ChatGPT Thread

Use something like this:

> I need help rationalizing the current Evality AI Job Workspace for `/app/jobs/[jobId]`. Below is the current implemented state from code. Please help me:
>
> 1. validate the stage flow
> 2. validate which stages should have dropdown filters vs chips vs no sub-filters
> 3. evaluate whether the per-stage table columns are correct
> 4. propose a cleaner stage-by-stage workflow model
> 5. identify where internal legacy naming like `shared` is leaking into a now-`Interviewing` UX
> 6. recommend what to freeze for V1 vs leave for later
>
> Current implemented state:
> [paste sections 2 through 15 from this report]

---

## 17. File Reference

Primary source:

- `app/app/jobs/[jobId]/page.js`

---

# Job Workspace State-Transition Table

| Action | Current Stage | Resulting Stage | Resulting Status |
| --- | --- | --- | --- |
| Email Pre-Screening | Unscreened | Unscreened | In Progress |
| Manual Screening | Unscreened | Pre-Screened | Passed |
| Shortlist | Pre-Screened | Shortlisted | Shortlisted |
| Send To Client | Shortlisted | Interviewing | Feedback Awaited |
| Update Status -> Feedback Awaited | Interviewing | Interviewing | Feedback Awaited |
| Update Status -> Shortlisted | Interviewing | Interviewing | Shortlisted |
| Update Status -> Interviewing | Interviewing | Interviewing | Interviewing |
| Update Status -> Offered | Interviewing | Offered | Offered |
| Update Status -> Joined | Interviewing | Joined | Joined |
| Update Status -> On Hold | Interviewing | Interviewing | On Hold |
| Update Status -> Rejected | Interviewing | Rejected | Rejected |
| Update Status -> Candidate Dropped Off | Interviewing | Dropped | Candidate Dropped Off |
| Reject Candidate | Unscreened | Rejected | Rejected |
| Reject Candidate | Pre-Screened | Rejected | Rejected |
| Reject Candidate | Shortlisted | Rejected | Rejected |
| Reject Candidate | Interviewing | Rejected | Rejected |
| Reject Candidate | Offered | Rejected | Rejected |
| Reject Candidate | Joined | Rejected | Rejected |
| Restore Candidate | Rejected | Pre-Screened | Passed |
| Restore Candidate | Rejected | Shortlisted | Shortlisted |
| Move Back To Shortlisted | Interviewing | Shortlisted | Shortlisted |
| Move Back To Shortlisted | Offered | Shortlisted | Shortlisted |
| Move Back To Shortlisted | Joined | Shortlisted | Shortlisted |
| Move Back To Shortlisted | Dropped | Shortlisted | Shortlisted |
| Move Back To Pre-Screened | Shortlisted | Pre-Screened | Passed |
| Mark Not Interested | Unscreened | Unscreened | Not Interested |
| Mark Not Interested | Pre-Screened | Pre-Screened | Not Interested |
| Remove From Job | Unscreened | Removed | Removed From Job |
| Remove From Job | Pre-Screened | Removed | Removed From Job |
| Remove From Job | Shortlisted | Removed | Removed From Job |
