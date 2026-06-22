<!-- public/Rebuild_From_Scratch_Playbook.md | UI rebuild bootstrap guide | Sree | 2026-06-22 -->

# UI Rebuild Bootstrap Guide

## Purpose

This guide is for starting a fresh front-end project from scratch and rebuilding only the UI foundation cleanly.

It is intentionally limited to:

- project setup
- dependencies
- theme tokens
- dark mode
- AppShell
- Sheet
- shared UI elements
- shadcn / Radix customization
- landing page

It does not include product logic, workflows, or business features yet.

---

## What you are trying to achieve

The goal is not to copy old route code.

The goal is to centralize:

- dependencies
- tokens
- component variants
- shell behavior
- sheet behavior
- typography
- spacing
- table behavior

Then use those clean foundations to build pages later.

---

## What to extract from this current project first

Before starting a new repo, take knowledge from these files:

### Theme and tokens

- `globals.css`
- `lib/FxTheme.js`
- `FxDocs/Design_System.md`

### Core shared components

- `components/FxButton.js`
- `components/FxTabs.js`
- `components/FxInput.js`
- `components/FxSelect.js`
- `components/FxTable.js`
- `components/FxPill.js`
- `components/FxToast.js`
- `components/FxFieldState.js`
- `components/ui/sheet.js`

### Visual reference

- `/app/ds`

If you rebuild, `/app/ds` should again become your main review surface.

---

## Section 1 — Create a new Next.js app

Start with a brand new app.

```bash
pnpm create next-app@latest my-new-ui-app
```

Recommended answers:

- TypeScript: `No` if you want to stay aligned with this project’s JS + JSX approach
- ESLint: `Yes`
- Tailwind CSS: `Yes`
- `src/` directory: your choice, but keep it consistent
- App Router: `Yes`
- Turbopack: `Yes`

Then enter the project:

```bash
cd my-new-ui-app
```

---

## Section 2 — Install the base dependencies

These are the packages that matter for the UI system used in this project.

### Core project stack

This project currently relies on:

- Next.js
- React
- Tailwind CSS v4
- Radix UI primitives
- lucide-react
- `clsx`
- `tailwind-merge`
- `tailwindcss-animate`

### Install commands

```bash
pnpm add @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-radio-group @radix-ui/react-toast @radix-ui/react-tooltip clsx lucide-react react-markdown remark-breaks remark-gfm tailwind-merge
```

```bash
pnpm add -D @tailwindcss/postcss tailwindcss tailwindcss-animate eslint eslint-config-next
```

### Why these matter

- Radix gives you accessible primitives
- lucide gives you a consistent icon set
- `clsx` + `tailwind-merge` are enough for clean class composition
- Tailwind v4 gives the base styling layer
- `tailwindcss-animate` helps with shadcn / motion utilities

---

## Section 3 — Install shadcn-style building blocks

Even if you do not fully depend on stock shadcn output, use its approach:

- Radix primitives underneath
- local component files
- your own theme tokens above them

If you want the shadcn CLI initialized:

```bash
pnpm dlx shadcn@latest init
```

Then add only the primitive pieces you actually need, one by one.

Typical starting set:

```bash
pnpm dlx shadcn@latest add dialog dropdown-menu tooltip checkbox radio-group toast alert-dialog
```

Important:

Do not let shadcn define your design language.
Use it only as the accessible primitive layer.

Your design language should live in:

- `globals.css`
- `lib/FxTheme.js`
- your custom `Fx*` wrappers

---

## Section 4 — Set the folder structure early

Do this before building pages.

Suggested structure:

```text
app/
components/
  ui/
  FxButton.js
  FxInput.js
  FxSelect.js
  FxTabs.js
  FxTable.js
  FxPill.js
  FxToast.js
  FxFieldState.js
lib/
  FxTheme.js
  FxUtils.js
  FxConstants.js
public/
FxDocs/
```

Why:

- `components/ui` = Radix / shadcn base primitives
- `components/Fx*` = your branded wrappers and shared recipes
- `lib/FxTheme.js` = centralized design tokens and class recipes

---

## Section 4A — Exact file creation order

If you want a clean bootstrap with minimum rework, create files in this order.

### Phase 1 — setup and core utilities

1. `app/layout.js`
2. `app/page.js`
3. `globals.css`
4. `lib/FxUtils.js`
5. `lib/FxTheme.js`
6. `lib/FxConstants.js`

Why:

- `layout.js` sets the global shell hook points
- `globals.css` and `FxTheme.js` become the token source of truth
- `FxUtils.js` should provide your shared `cn()` helper early

### Phase 2 — primitive Radix / shadcn layer

7. `components/ui/dialog.js`
8. `components/ui/sheet.js`
9. `components/ui/dropdown-menu.js`
10. `components/ui/tooltip.js`
11. `components/ui/checkbox.js`
12. `components/ui/radio-group.js`
13. `components/ui/alert-dialog.js`
14. `components/ui/toast.js`
15. `components/ui/use-toast.js`

Why:

These are low-level accessibility primitives. They should exist before the `Fx*` wrappers.

### Phase 3 — branded shared wrappers

16. `components/FxButton.js`
17. `components/FxFieldState.js`
18. `components/FxInput.js`
19. `components/FxSelect.js`
20. `components/FxPill.js`
21. `components/FxTabs.js`
22. `components/FxToast.js`
23. `components/FxToaster.js`
24. `components/FxEmptyState.js`

Why:

These define the visual language most pages will inherit.

### Phase 4 — layout system

25. `components/Navbar.js`
26. `components/Sidebar.js`
27. `components/AppShell.js`
28. `components/FxThemeToggle.js`
29. `components/FxThemeController.js`

Why:

At this point you can validate shell, dark mode, and spacing without any product page logic.

### Phase 5 — richer input / content primitives

30. `components/FxTagInput.js`
31. `components/FxMultiSelectInput.js`
32. `components/FxCreatableSelect.js`
33. `components/FxCreatableCombobox.js`
34. `components/FxRichTextEditor.js`
35. `components/FxAiButton.js`

Why:

These are more advanced controls. Keep them after the basics are stable.

### Phase 6 — data presentation primitives

36. `components/FxColumnPicker.js`
37. `components/FxTable.js`
38. `components/FxStepTabs.js`

Why:

The table system depends on earlier token, button, input, dropdown, pill, and tabs work.

### Phase 7 — showcase and validation surfaces

39. `components/DesignSystemPage.js`
40. `app/app/ds/page.js`
41. `app/app/ds/md/page.js`
42. `FxDocs/Design_System.md`

Why:

This is where you verify the whole UI system before feature work.

### Phase 8 — non-product shell validation pages

43. `components/FxLandingPage.js`
44. `components/HomePage.js`
45. `components/FxAuthPage.js`
46. `components/FxAuthDialog.js`
47. `components/FxOnboardingPage.js`

Why:

These let you prove the UI system across page types before you touch product-specific routes.

---

## Section 5 — Centralize the design system first

Before building even one product page, create:

- theme colors
- dark mode colors
- typography tokens
- border tokens
- radius scale
- spacing scale
- component heights
- sheet widths

### Source of truth

Keep those centralized in:

- `globals.css`
- `lib/FxTheme.js`

### What to define

At minimum:

- `--fx-bg`
- `--fx-bg-soft`
- `--fx-surface`
- `--fx-surface-subtle`
- `--fx-surface-raised`
- `--fx-table-header`
- `--fx-table-row-alt`
- `--fx-surface-hover`
- `--fx-surface-selected`
- `--fx-text`
- `--fx-text-muted`
- `--fx-text-disabled`
- `--fx-border`
- `--fx-primary`
- `--fx-primary-foreground`
- `--fx-success`
- `--fx-warning`
- `--fx-danger`
- `--fx-disabled-bg`
- `--fx-disabled-text`
- `--fx-disabled-border`

And the dark-mode equivalents.

---

## Section 6 — Build dark mode before pages

Do not postpone dark mode.

If you build light mode first and “convert later,” you will end up patching components repeatedly.

Define dark mode tokens up front.

What to preserve from this project:

- white / surface remains the main working layer in light mode
- dark mode uses distinct surface tokens, not inverted light mode
- border contrast is separately tuned
- header / table / hover states are explicitly tokenized

---

## Section 7 — Build `FxTheme.js`

This is one of the most important files in the system.

It should centralize:

### Typography roles

- page title
- nav title
- workspace title
- workspace subtitle
- section title
- section subtitle
- field label
- field hint
- input
- table header
- table cell
- clickable data
- sheet title
- sheet subtitle
- dialog title
- dialog subtitle
- body
- button

### Structural tokens

- radius
- spacing
- button heights
- control heights
- sheet widths
- shadows
- navigation item styles
- table typography

This prevents pages from inventing local styling repeatedly.

---

## Section 8 — Build the AppShell before product pages

Your AppShell should be completed before any jobs, candidates, or settings route exists.

It should define:

- sidebar
- navbar
- content viewport
- page padding
- scroll boundaries
- background layering

What to preserve from this project:

- outer app canvas can use soft background
- cards / panels / tables remain on surface
- nested areas should scroll correctly using `min-h-0` and constrained height
- content width rules should be centralized

If the shell is wrong, every page will require hacks later.

---

## Section 9 — Build the Sheet system

Do this early.

This project depends heavily on right-side sheets.

### Recommended structure

- header
- body
- footer
- sticky footer
- body scroll only
- reusable width tokens

### Recommended widths

Based on the current direction:

- `sm`: `480px`
- `md`: `540px`
- `lg`: `600px`
- `xl`: `660px`

Allow optional custom pixel width when necessary.

### Keep centralized

Do not let page files define custom sheet structure repeatedly.

The sheet primitive should live in:

- `components/ui/sheet.js`

---

## Section 10 — Build the base UI elements

This is the order I recommend.

### 1. Button

Build:

- primary
- secondary
- outline
- ghost
- destructive
- icon button

Keep:

- consistent sizes
- readable disabled state
- centralized variant map

### 2. Input

Build:

- text input
- textarea
- right element support
- left element support if needed
- label + hint + validation state

### 3. Select

Build:

- standard select
- shared trigger height
- same text sizing as input

### 4. Checkbox and radio

Use Radix primitives wrapped in your own visual rules.

Do not leave browser-native styling.

### 5. Tabs

Formalize variants early.

This project already implies these useful variants:

- `underlined`
- `rounded`
- `compact`
- `regular`

Do not invent new tab styles page by page.

### 6. Pills

You already have two strong pill directions:

- full rounded
- small rectangular

Keep both centralized.

### 7. Toasts

Centralize:

- placement
- typography
- one-line vs two-line content rules

---

## Section 10A — Full UI element inventory to carry forward

This is the broad inventory of UI elements and UI infrastructure already created, customized, or shaped in this project.

Treat this as your rebuild checklist.

### A. Foundation and tokens

- global CSS tokens
- light mode token set
- dark mode token set
- typography roles
- radius scale
- spacing scale
- button heights
- control heights
- layout widths
- sheet widths
- table recipes
- navigation recipes

### B. Shell and layout

- AppShell
- Navbar
- Sidebar
- Protected page shell
- content-width system
- page padding system
- nested scroll behavior
- theme controller
- theme toggle

### C. shadcn / Radix base primitives in local form

- dialog
- sheet
- dropdown menu
- tooltip
- checkbox
- radio group
- toast
- alert dialog

These should be considered part of your UI system even though they originate from Radix/shadcn.

### D. Wrapped / branded shared primitives

- `FxButton`
- `FxAiButton`
- `FxInput`
- `FxSelect`
- `FxFieldState`
- `FxTabs`
- `FxPill`
- `FxToast`
- `FxToaster`
- `FxEmptyState`

### E. Advanced form and composition elements

- `FxTagInput`
- `FxMultiSelectInput`
- `FxCreatableSelect`
- `FxCreatableCombobox`
- `FxRichTextEditor`

### F. Data and navigation elements

- `FxTable`
- `FxColumnPicker`
- `FxStepTabs`

### G. Validation and messaging elements

- field label + error state system
- helper text system
- destructive confirmation dialog
- success / warning / error / info toasts

### H. Demo / showcase pages that are part of the UI system

- Design System page
- Design System markdown reference
- landing page
- auth page
- onboarding page

### Important note

Yes, the Design System itself should be treated as part of the rebuild scope.

Broadly, your UI system includes:

1. tokens
2. primitives
3. variants
4. showcase page
5. documentation markdown

That is the correct broader interpretation.

---

## Section 11 — Build the Table primitive carefully

This is a major investment area.

Do not build product tables separately first.

Build one strong shared table.

### It should support

- sticky header
- sticky first column
- sticky last column
- deterministic widths
- sorting
- column visibility
- empty state
- row actions
- optional selection column

### Important lesson from this project

Column width behavior and sticky behavior must be solved in the table component itself, not patched in page files.

---

## Section 12 — Build `/app/ds` immediately after primitives

This route is your review lab.

Show:

- colors
- typography
- buttons
- inputs
- selects
- tabs variants
- pills
- table
- sheet examples
- toasts

This is where you freeze the visual language before building actual pages.

---

## Section 13 — Stop at the landing page

For the clean rebuild, stop product work at:

1. design tokens
2. AppShell
3. sheet system
4. shared primitives
5. design system page
6. one simple landing page using your own theme and components

Do not jump into Jobs / Settings / Candidates yet.

The landing page is only a proof that:

- theme works
- shell works
- dark mode works
- buttons / inputs / tabs / sheets render correctly
- code structure is clean

---

## Section 14 — What to tell a new front-end developer

If the developer is junior or new to the codebase, give them this sequence:

### Step 1

Create the Next app and install the UI dependencies.

### Step 2

Set up:

- `globals.css`
- `lib/FxTheme.js`
- `components/ui/*`
- `components/Fx*`

### Step 3

Implement only the shared UI primitives.

### Step 4

Build `/app/ds` and review every primitive there.

### Step 5

Only after UI is stable, start building feature pages.

This keeps code clean and central.

---

## Section 15 — Suggested prompt strategy for a fresh Codex CLI

Do not begin with “build Jobs page.”

Begin with:

### Prompt 1

> Create a new Next.js app UI foundation. Set up Tailwind v4, Radix primitives, lucide-react, and a centralized theme system. Build only tokens, dark mode, AppShell, Sheet, Button, Input, Select, Tabs, Table, Pills, Toast, and a `/app/ds` route.

### Prompt 2

> Use `globals.css` and `lib/FxTheme.js` as the only sources of truth for design tokens and shared class recipes. Do not put page-specific visual styling into route files unless absolutely necessary.

### Prompt 3

> Create tab variants named `underlined`, `rounded`, `compact`, and `regular`. Show them in `/app/ds` side by side.

### Prompt 4

> Build the shared table primitive with sticky header, sticky edge columns, sorting, column visibility, and deterministic widths.

### Prompt 5

> Build a simple landing page using the new theme and primitives. Do not add product logic yet.

---

## Section 16 — Realistic effort

If you stay disciplined and stop at the landing page:

### Setup + tokens

- 0.5 to 1 day

### AppShell + Sheet

- 0.5 to 1 day

### Shared primitives

- 1 to 2 days

### Table primitive

- 1 to 2 days

### `/app/ds` + landing page

- 0.5 to 1 day

### Total

Roughly:

- 3 to 6 focused days

That is enough to create a clean UI system base for later product work.

---

## Section 17 — The actual point of the rebuild

Your rebuild is not mainly about prettier code.

It is about:

- removing hardcoded styling from feature pages
- moving variants into primitives
- moving dimensions into theme tokens
- centralizing the UI stack
- reducing rework when product pages evolve

That is the correct reason to restart.

---

## Final recommendation

If you do this rebuild:

1. start with a new Next app
2. install only the UI stack first
3. centralize all tokens and primitive recipes
4. freeze `/app/ds`
5. stop at one landing page
6. only then begin actual product pages in a later phase

That will give you the cleanest base and the least long-term friction.
