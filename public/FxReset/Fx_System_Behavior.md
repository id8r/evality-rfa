# Fx System Behavior Audit

This document captures actual observed system behavior from the current codebase. It is intentionally focused on runtime structure, ownership, persistence, and implementation patterns rather than styling.

---

## AppShell

### Overall structure

Authenticated app routes render through [FxProtectedAppPage](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxProtectedAppPage.js:31), which wraps content in [AppShell](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/AppShell.js:11). `AppShell` composes:

1. fixed left sidebar
2. sticky top navbar
3. scroll-owning main content region

Root layout mounting order is:

1. [app/layout.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/app/layout.js:18) mounts `<html>` and `<body>`
2. `FxToaster` wraps the app tree
3. `FxThemeController` mounts globally
4. route content renders inside that shell

### Layout hierarchy

Observed hierarchy:

```txt
RootLayout
  FxToaster
    FxThemeController
    Route Page
      FxProtectedAppPage
        AppShell
          Sidebar (fixed)
          Content Wrapper (padding-left = sidebar width)
            Navbar (sticky)
            Main Scroll Region
              Page Content Container
```

### Mounting order and ownership

- `AppShell` owns viewport-height layout with `h-screen overflow-hidden`.
- [Sidebar](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/Sidebar.js:37) is `fixed` and therefore removed from normal flow.
- `AppShell` compensates by applying `paddingLeft` equal to current sidebar width on the content wrapper.
- [Navbar](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/Navbar.js:14) is inside the content wrapper, not global to `<body>`.
- The `<main>` region owns app-page scrolling.

### Content container rules

`AppShell` applies [FX_LAYOUT.appContent](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxTheme.js) to the inner page container and also applies per-page vertical padding via `contentPaddingYClassName`. `FxProtectedAppPage` sets default vertical padding to `py-[32px]`, except settings which use `py-0` at [FxProtectedAppPage](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxProtectedAppPage.js:64).

### Width constraints

- Sidebar width is owned by [SIDEBAR_DIMENSIONS](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxConstants.js:177) and toggles between `200` and `72`.
- Main content width is effectively `viewport width - sidebar width`.
- Page content width and horizontal page padding are centralized through `FX_LAYOUT` usage in `AppShell` and `Navbar`.

### Height constraints

- `AppShell` sets `h-screen`.
- Sidebar also sets `h-screen`.
- Main region is `flex-1 min-h-0`, which is critical to allow inner scrolling instead of overflow growth.
- Sheet and dialog overlays also use full-height or viewport-fixed primitives.

### Scroll boundaries

Observed scroll ownership:

- Authenticated app pages: `<main>` inside `AppShell`
- Sidebar: its own internal nav container
- Sheets: `SheetBody`
- Dialogs: dialog content itself if needed

`AppShell` prevents double scrolling by combining:

- outer shell `overflow-hidden`
- content wrapper `overflow-hidden`
- scroll only on `<main>` when `mainScroll !== "hidden"`

This is the main anti-double-scroll mechanism in the app.

### Sticky regions

- Navbar is `sticky top-0 z-40` at [Navbar](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/Navbar.js:14)
- Sidebar is `fixed left-0 top-0`
- Some tables can enable sticky headers and sticky columns via [FxTable](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxTable.js:154)

### Responsive behavior

There is no separate mobile shell implementation. The current shell relies on fixed sidebar widths and desktop-oriented layout assumptions. The same structure is reused for all authenticated pages.

### Sidebar behavior

Sidebar behavior is owned by [Sidebar](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/Sidebar.js:37):

- collapse state is initialized from `evality-sidebar-collapsed`
- toggling writes back to localStorage
- jobs nav item is active for `/app`, `/app/jobs`, and `/app/jobs/*`
- user menu owns theme toggle access and logout action
- logout clears auth/onboarding keys and redirects to `/`

### Navbar behavior

Navbar is deliberately thin:

- title on the left
- optional leading controls before title
- optional action controls on the right

It does not own routing, search, or state. Those are passed in per page.

### Route rendering behavior

Authenticated routes use `FxProtectedAppPage`. Public routes use dedicated surfaces such as [FxAuthPage](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxAuthPage.js:17) and [FxOnboardingPage](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxOnboardingPage.js:39).

If auth is not ready or missing, protected pages temporarily render a blank page surface and then redirect to landing.

### Simplified architecture diagram

```txt
Browser
  -> app/layout.js
    -> FxToaster
      -> FxThemeController
      -> Public Route Surface
         or
      -> FxProtectedAppPage
        -> AppShell
          -> Sidebar
          -> Navbar
          -> Main Scroll Region
            -> Feature Page
              -> Tables / Sheets / Dialogs / Forms
```

---

## Theme System

### Source of truth files

Primary theme ownership is split across:

- [app/globals.css](/Users/Sree/Coding/Git%20id8r/evality-rfa/app/globals.css:1)
- [lib/FxTheme.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxTheme.js:1)
- [components/FxThemeController.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxThemeController.js:1)
- [components/FxThemeToggle.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxThemeToggle.js:1)

### Token ownership

- CSS custom properties in `globals.css` are the runtime color source of truth.
- `FxTheme.js` exports semantic class bundles and token groupings consumed by components.
- Components usually consume classes from `FxTheme.js`, not raw numeric values directly.

### Token usage patterns

Observed pattern:

1. CSS variables define color and radius values
2. `FxTheme.js` maps product semantics to utility class strings
3. components import `FX_*` groups and compose them with local layout classes

This is a semantic wrapper approach rather than a component-library token engine.

### Dark mode activation flow

Dark mode is enabled by adding the `dark` class to `document.documentElement`.

- [FxThemeToggle](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxThemeToggle.js:20) toggles the DOM class and writes the selected theme
- [FxThemeController](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxThemeController.js:20) continuously resyncs DOM state from storage

### Theme persistence behavior

- selected theme is stored in `evality-theme`
- `FxThemeController` listens to:
  - `storage`
  - `focus`
  - `fx-theme-change`
  - `visibilitychange`
- it also polls every 400ms to resync theme state

The polling loop is unusual and indicates the app does not trust event-only synchronization.

### Theme switching behavior

Theme switching is immediate and local. There is no server roundtrip and no cookie/session ownership. This is purely client persistence.

---

## Navigation System

### Route structure

Route constants and manifest live in [lib/FxConstants.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxConstants.js:8).

Observed route groups:

- public: `/`, `/login`, `/signup`, `/welcome`
- app: `/app`, `/app/jobs`, `/app/jobs/[jobId]`, `/app/candidates`, `/app/candidates/[candidateId]`, `/app/clients`, `/app/action-center`, `/app/settings`, `/app/ds`

### Navigation ownership

- route metadata comes from `PAGE_MANIFEST`
- sidebar items come from `getSidebarNavItems()`
- page title defaults also come from the manifest

This centralizes labels and route-to-page metadata reasonably well.

### Sidebar configuration source

[getSidebarNavItems](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxConstants.js:94) filters `PAGE_MANIFEST` by `showInSidebar`, sorts by `sortOrder`, and maps to `id`, `label`, `href`, and `icon`.

### Active route handling

Active route handling is mostly exact-match, with one exception:

- jobs item is active for `/app`, `/app/jobs`, and nested `/app/jobs/*`

This exception is hardcoded in [Sidebar](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/Sidebar.js:100).

### Route guards

[FxProtectedAppPage](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxProtectedAppPage.js:31) is the main authenticated route guard.

- subscription source: `storage` and `fx-auth-change`
- store read: `evality-auth-complete`
- unauthenticated users are redirected with `window.location.replace(ROUTES.LANDING)`

### Auth redirects

- [FxAuthPage](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxAuthPage.js:17) redirects authenticated users to `/app`
- [FxOnboardingPage](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxOnboardingPage.js:44) redirects unauthenticated users to `/`
- onboarding also redirects users with persona already set to `/app/jobs`

### Logout redirects

Logout is owned by `Sidebar.handleLogout()`:

1. clear auth and onboarding state
2. dispatch `fx-auth-change`
3. redirect to `/`

---

## Sheet System

### Opening mechanism

Sheet primitive is in [components/ui/sheet.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/ui/sheet.js:1) and is built on `@radix-ui/react-dialog`.

Opening is not globally managed. Each feature page owns its own `open` state and passes it to `<Sheet open={...} onOpenChange={...}>`.

### State ownership

Sheet state is page-local, not centralized. Examples:

- jobs page create/edit sheet in [app/app/jobs/page.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/app/app/jobs/page.js:430)
- clients sheet in [app/app/clients/page.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/app/app/clients/page.js:142)
- multiple workspace sheets in [app/app/jobs/[jobId]/page.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/app/app/jobs/%5BjobId%5D/page.js:6174)

### Width system

`SheetContent` supports:

- `size="sm" | "md" | "lg" | "xl"`
- optional explicit `widthPx`
- `side="left" | "right"`

That means width behavior is shared, but content layout is feature-defined.

### Header structure

Shared header shape comes from `SheetHeader`:

- optional leading region
- title
- optional description
- custom action slot
- close button

The close button is supplied automatically unless `showClose={false}`.

### Footer structure

`SheetFooter` is a shared primitive with:

- left slot
- children
- right slot

Usage is not standardized across features. Some screens treat footer as navigation, some as final action zone.

### Scrolling behavior

- `SheetContent` itself is `overflow-hidden`
- `SheetBody` is `flex-1 overflow-y-auto`

This means the sheet shell stays fixed while only the body scrolls.

### Close behavior

Radix owns overlay and escape/default dismissal behavior. Feature pages can intercept closure through `onOpenChange`.

Representative implementation:

- jobs page uses `handleSheetOpenChange`
- closing the job sheet triggers `requestSheetClose()`
- dirty forms open a discard confirmation instead of immediate close

See [app/app/jobs/page.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/app/app/jobs/page.js:704).

### Dirty-state handling

Dirty-state handling is duplicated per feature. It is not part of the shared sheet primitive.

Observed example:

- jobs create/edit sheet checks `isJobFormDirty`
- if dirty, it stores a pending action of `discard-sheet`
- confirmation happens via `AlertDialog`

There is no shared unsaved-changes abstraction for sheets.

### Keyboard behavior

Keyboard behavior is primarily inherited from Radix dialog behavior. The codebase does not currently expose a shared custom keyboard contract for sheets.

One practical side effect is that feature components can conflict with default escape behavior if they expect `Escape` to cancel field editing separately.

### Overlay behavior

`SheetOverlay` is:

- full-screen fixed overlay
- `z-[100]`
- translucent background
- slight backdrop blur

Sheet content is `z-[101]`, so the overlay and panel are consistently layered.

### Sheet patterns currently in use

Observed sheet patterns:

- create/edit job sheet
- client create/edit sheet
- design-system sample sheet
- candidate workspace sheets inside job workspace
- share job sheet
- send to client sheets
- client status update sheet
- pre-screen result sheet
- share for review sheet
- CV match breakdown sheet
- email screening sheet
- manual screening sheet

Most of these are feature-specific variants rather than a single standardized behavioral pattern.

---

## Table System

### Data flow

[FxTable](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxTable.js:154) is the main shared table primitive.

The common pattern is:

1. page computes filtered/sorted rows with `useMemo`
2. page passes static column definitions plus rows into `FxTable`
3. `FxTable` handles rendering, sticky behavior, selection, and column visibility

### Sorting

Sorting state is generally page-owned, not table-owned.

- pages hold `sortConfig`
- pages transform rows before rendering
- `FxTable` receives `sortedColumnKey` and `sortedColumnDirection` mainly for visual state

This means sorting behavior is duplicated at page level.

### Filtering

Filtering is page-local. `FxTable` does not implement generic filter logic.

Observed pattern:

- tab selection filters rows
- search input filters rows
- additional status/segment filters are computed in page `useMemo` blocks

### Column visibility

Column visibility is semi-centralized:

- `FxTable` supports visible column keys and persistence
- [FxColumnPicker](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxColumnPicker.js:46) is the shared menu UI
- persistence is optional through `storageKey`

This is one of the more centralized table behaviors in the app.

### Sticky columns

Sticky support is shared in `FxTable`:

- sticky first column
- sticky last column
- per-column sticky overrides
- internally computed left/right sticky offsets

### Row actions

Row action UIs are page-defined through column renderers. `FxTable` does not standardize action menus or action semantics.

### Pagination strategy

There is no shared pagination system observed in the current app. Tables appear to render full filtered datasets inside scroll containers.

### Search behavior

Search is implemented per page through normal React state and memoized filtering. There is no shared search controller.

### Centralized vs duplicated behavior

Centralized in `FxTable`:

- rendering shell
- density
- sticky columns
- scroll indicators
- column visibility persistence
- row selection mechanics
- minimum-width logic

Duplicated in pages:

- sorting rules
- filter logic
- search matching logic
- action menus
- empty-state messaging strategy

---

## Form System

### Validation approach

Validation is a mix of:

- shared utility validators in [lib/FxValidation.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxValidation.js:1)
- feature-specific schema validators such as [lib/FxJobSchema.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxJobSchema.js)
- inline conditional logic inside feature pages

There is no form library such as React Hook Form in the current code.

### Field state handling

Field UI state is standardized through:

- [FxInput](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxInput.js:20)
- [FxSelect](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxSelect.js:44)
- [FxFieldState](/Users/Sree/Coding/Git%20id8r/evality-rfa/components/FxFieldState.js:1)

These components accept label, helper, error, and state-oriented props, but actual field values remain page-owned.

### Error handling

Error handling is generally local-state based:

- page computes `validationErrors`
- fields consume error strings or tone props
- submit handlers stop persistence when invalid

The jobs page is the clearest example of this pattern.

### Helper text patterns

Helper text is handled consistently at the primitive level through `FxFieldState` helpers and the shared input/select wrappers.

### Submit behavior

Submit behavior is manual:

- forms call `event.preventDefault()`
- page runs validation
- page writes to localStorage-backed stores
- success and warning feedback use toast helpers when applicable

There is no shared async submit state machine.

---

## Data Layer

### JSON sources

The system is local-first and demo-data driven. Main data ownership sits in [lib/FxStore.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxStore.js:1).

Primary seeded datasets:

- `DEMO_JOBS`
- `DEMO_CANDIDATES`
- `DEMO_CLIENTS`
- `DEMO_RECRUITERS`

### LocalStorage usage

Low-level storage helpers are in [lib/FxUtils.js](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxUtils.js:1).

Persistence covers:

- auth state
- onboarding state
- theme
- sidebar collapsed state
- jobs
- candidates
- clients
- jobs page state
- jobs view mode
- table column visibility
- organization/profile settings
- email and calendar settings
- screening settings

### Hydration flow

Hydration is client-only.

- components guard with `typeof window !== "undefined"` where needed
- route guards use `useSyncExternalStore`
- pages read from localStorage on mount or lazy state initialization

There is no server data hydration path in the current implementation.

### Persistence flow

Normal persistence flow:

1. page mutates local React state
2. submit or action handler calls `FxStore` helper
3. helper writes JSON or string values to localStorage
4. some flows emit custom events such as `fx-storage-change` or `fx-auth-change`

### Seed data loading

[ensureDemoStore](/Users/Sree/Coding/Git%20id8r/evality-rfa/lib/FxStore.js:1405), `seedDemoJobsStore()`, and related helpers maintain demo state.

Observed behavior:

- recruiters, jobs, candidates, and clients are seeded if missing
- jobs are normalized through `normalizeJobRecord`
- candidates are resynced against jobs via `syncCandidatesWithJobs`

### Demo-mode behavior

Demo experience is explicitly tracked.

- `evality-demo-experience` stores mode
- auth flow chooses between `get-started` and `login`
- jobs page derives initial empty/table mode from stored demo experience and jobs-view state

This means demo experience affects startup behavior even though there is no backend.

---

## Component Relationships

### High-level hierarchy

```txt
RootLayout
  FxToaster
    FxThemeController
    Public Pages
      FxLandingPage
      FxAuthPage
      FxOnboardingPage
    Protected Pages
      FxProtectedAppPage
        AppShell
          Sidebar
          Navbar
          Feature Page
            FxTabs / FxTable / FxInput / FxSelect / Sheets / Dialogs
```

### Reusable primitives

Core reusable UI primitives observed:

- `FxButton`
- `FxInput`
- `FxSelect`
- `FxTabs`
- `FxStepTabs`
- `FxPill`
- `FxTable`
- `FxColumnPicker`
- `FxTagInput`
- `FxMultiSelectInput`
- `FxCreatableSelect`
- `FxRichTextEditor`
- `FxEmptyState`
- `FxToast` and `FxToaster`
- `Sheet`, `Dialog`, `AlertDialog` wrappers

### Feature-specific wrappers

Feature wrappers and route surfaces include:

- `FxProtectedAppPage`
- `FxAuthPage`
- `FxOnboardingPage`
- `AppShell`
- page-local sheets in jobs and clients screens

These wrappers mix structural concerns with feature workflow behavior.

### Dependency graph summary

Observed dependency direction is mostly:

`constants/utils/theme/store -> primitives -> shell wrappers -> route pages`

This is a sensible top-down dependency shape, though some route pages have become large enough to act like internal subsystems.

---

## Technical Debt

### Duplicated patterns

- sheet close and dirty-state logic is repeated per feature
- page-level sort/filter/search logic is repeated around each `FxTable`
- localStorage read/write patterns are duplicated between store helpers and direct page usage

### Competing implementations

- tabs exist as `FxTabs` and `FxStepTabs`
- form selection exists across `FxSelect`, `FxCreatableSelect`, `FxTagInput`, `FxMultiSelectInput`, and combobox variants with overlapping responsibilities
- overlay patterns are split between `Sheet`, `Dialog`, and `AlertDialog`, with workflow logic pushed into pages rather than normalized wrappers

### Dead or low-signal surfaces

- the design system route is partly documentation/demo surface rather than runtime product infrastructure
- some constants and showcase data in `FxDesignSystem.js` describe the system but do not power it directly

### Hardcoded design decisions in behavior

- jobs-route active-state special casing is hardcoded in `Sidebar`
- theme sync depends on a 400ms polling loop
- jobs page owns a large amount of sheet workflow state directly in one route file
- demo experience rules are embedded in route logic rather than separated into an app-state layer

### Places needing consolidation

- shared unsaved-changes controller for sheets and dialogs
- centralized table controller for sort/filter/search conventions
- stricter boundary between storage adapters and page-level feature logic
- lighter route files, especially jobs and job workspace

---

## Summary

The current system is a client-rendered, localStorage-backed demo application with a reasonably centralized shell, theme token layer, and table primitive. Structural concerns are handled consistently at the app-shell level, but workflow behavior is still heavily page-owned. The largest concentration of behavioral complexity lives in the jobs surfaces, where sheets, validation, routing, persistence, and workflow state are composed directly inside route files rather than through reusable controllers.
