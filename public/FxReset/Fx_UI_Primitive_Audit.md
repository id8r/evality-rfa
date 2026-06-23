# Fx UI Primitive Audit

Scope: UI primitive audit only. No refactor applied.

This document identifies which Evality UI pieces are genuinely product-specific and which are thin custom implementations that could instead wrap or use shadcn/Radix primitives with Evality styling.

## 1. AppShell

Observations:
- `AppShell` is a thin composition layer over custom `Sidebar` + `Navbar` + a controlled `main` scroll region.
- Sidebar collapse state is persisted via `STORAGE_KEYS.SIDEBAR_COLLAPSED`.
- The shell uses a fixed sidebar with content offset via inline `paddingLeft`, not CSS grid.
- Main scrolling is owned by `AppShell` and can be toggled between `overflow-y-auto` and `overflow-hidden`.
- The sidebar itself has an internal scroll container for nav items.
- There is no true resizable drag behavior today, only collapsed/expanded widths.
- `FxProtectedAppPage` is the actual authenticated shell entrypoint and wraps nearly all app screens with `AppShell`.

Potential shadcn/Radix support:
- shadcn `Sidebar` patterns could replace much of `Sidebar` visual structure.
- Radix itself does not provide layout shell primitives; shell composition still needs an Evality wrapper.
- `ScrollArea` could support sidebar/internal content scrolling, but current needs are basic and already satisfied by CSS overflow.
- `Resizable` is not currently needed because there is no drag-resize behavior.

| Component | Current File(s) | Current Purpose | Custom Behavior | shadcn/Radix Equivalent | Keep Custom? | Recommendation |
|---|---|---|---|---|---|---|
| AppShell | `components/AppShell.js`, `components/FxProtectedAppPage.js` | Top-level authenticated app layout with sidebar, navbar, and main scroll ownership | Persists sidebar collapsed state, offsets content using sidebar width, supports `mainScroll` mode and page-specific content padding | No direct shadcn shell primitive; could compose from shadcn Sidebar patterns + ScrollArea | Yes, as composition shell | KEEP_CUSTOM |
| Sidebar | `components/Sidebar.js`, `lib/FxConstants.js`, `lib/FxTheme.js` | Left navigation, collapse/expand, account dropdown, logout, theme toggle entry | Collapsed hover logo-to-chevron swap, pathname-specific jobs activation logic, persisted collapse state, custom footer/account menu | shadcn sidebar patterns, Radix dropdown-menu | Partially | WRAP_SHADCN |
| Navbar/Header | `components/Navbar.js`, `lib/FxTheme.js` | Sticky page header with title, optional leading/actions | Very thin Evality styling wrapper | Plain div/header or shadcn-styled toolbar pattern | Not much logic | WRAP_SHADCN |
| Main content wrapper | `components/AppShell.js` | Applies page padding, flex layout, overflow rules | `mainScroll` toggle, content padding by page | Plain layout divs | Yes, trivial but useful | KEEP_CUSTOM |
| Scroll containers | `components/AppShell.js`, `components/Sidebar.js`, `app/app/settings/page.js` | Owns viewport scroll, sidebar scroll, some section-local scrolls | Uses CSS overflow and helper classes like `fx-scrollbar-hide` / `fx-scrollbar-hidden` | shadcn `ScrollArea` could replace some inner scroll regions | Mixed | NEEDS_PRODUCT_DECISION |
| Collapsible behavior | `components/AppShell.js`, `components/Sidebar.js` | Sidebar collapsed/expanded state only | Persisted collapse, width animation, content offset sync | shadcn sidebar/collapsible patterns | Yes, but current logic is small | WRAP_SHADCN |
| Resizable behavior | None in shell | Not currently implemented | N/A | shadcn `Resizable` not needed today | No | REPLACE_WITH_SHADCN |

Usage locations:
- `components/FxProtectedAppPage.js`
- All authenticated app pages via `FxProtectedAppPage`, including jobs, candidates, clients, settings

## 2. FxTable

Observations:
- `FxTable` is a real custom data presentation primitive, not a thin wrapper.
- It handles:
  - persisted column visibility via storage key
  - optional column picker
  - optional row selection
  - sticky first/last columns
  - sticky header
  - horizontal overflow indicators
  - custom width resolution strategy
  - empty state rendering
- It does not own data operations like sorting/filtering/search/pagination. Those are implemented in page components such as `app/app/jobs/[jobId]/page.js`.
- The current table API expects precomputed `columns` and already-rendered `rows`, so it is view-layer focused.
- There is no generic row click API; row interactivity is mostly implemented via buttons/links inside cell content.

Should it stay custom?
- The sticky/width/column-visibility logic is non-trivial and tailored to Evality.
- TanStack Table would be a stronger foundation for long-term feature growth, especially if sorting/filtering/pagination should become centralized.
- If rebuilding, `FxTable` should likely become a styled wrapper around TanStack instead of remaining a completely standalone engine.

| Component | Current File(s) | Current Purpose | Custom Behavior | shadcn/Radix Equivalent | Keep Custom? | Recommendation |
|---|---|---|---|---|---|---|
| FxTable | `components/FxTable.js` | Dense reusable table primitive for app data grids | Column width architecture, sticky columns, sticky header, row selection, persisted visible columns, overflow edge gradients, empty state | shadcn Data Table examples typically wrap TanStack Table; Radix has no table engine | Custom behavior is substantial | NEEDS_PRODUCT_DECISION |
| FxColumnPicker | `components/FxColumnPicker.js` | Toggle optional table columns | Uses dropdown menu + checkbox, prevents menu close while toggling, supports icon-only or labeled trigger | Radix dropdown-menu + checkbox item | Thin behavioral wrapper | WRAP_SHADCN |
| Checkbox in table selection | `components/ui/checkbox.js`, `components/FxTable.js` | Row selection controls | Used for header select-all and row selection, supports indeterminate | Radix checkbox | Thin wrapper | WRAP_SHADCN |

Usage locations:
- `app/app/jobs/[jobId]/page.js`
- `app/app/jobs/page.js`
- `app/app/candidates/page.js`
- `app/app/clients/page.js`
- `app/app/ds/page.js`

Current feature split:
- Centralized in `FxTable`:
  - rendering
  - selection
  - column visibility
  - sticky positioning
  - empty state
- Duplicated in pages:
  - sorting logic
  - filtering logic
  - search logic
  - row action content
  - pagination decisions (or lack of pagination)

## 3. FxTabs

Observations:
- `FxTabs` is not based on Radix Tabs. It is a custom button-group/tab-strip component.
- It supports multiple visual variants:
  - `rounded`
  - `regular`
  - `compact`
  - `underlined`
  - aliases: `stage`, `filter`, `segmented`
- It is essentially a controlled segmented control, not a full tab-panel primitive.
- It does not manage panel mounting, keyboard roving focus, or ARIA tab semantics beyond `aria-pressed`.

Could shadcn Tabs handle this?
- Yes for panel-based cases.
- For segmented controls/filters, shadcn Tabs or ToggleGroup could likely cover the same behavior with variant classNames.
- Current component is visually useful but semantically lighter than Radix Tabs.

| Component | Current File(s) | Current Purpose | Custom Behavior | shadcn/Radix Equivalent | Keep Custom? | Recommendation |
|---|---|---|---|---|---|---|
| FxTabs | `components/FxTabs.js` | Reusable tab/segmented/filter switcher | Multiple style variants, count rendering, alias resolution (`stage`, `filter`, `segmented`) | Radix Tabs or ToggleGroup with styled variants | Logic is light; styling is the main value | WRAP_SHADCN |

Usage locations:
- `app/app/jobs/page.js`
- `app/app/clients/page.js`
- `app/app/candidates/page.js`
- `app/app/jobs/[jobId]/page.js`
- `app/app/ds/page.js`

## 4. Sheets / Dialog / Popover

Observations:
- `components/ui/sheet.js` is already a custom-styled wrapper over Radix Dialog, effectively a shadcn-style sheet.
- `components/ui/dialog.js` is a thin styled Radix Dialog wrapper.
- `components/ui/popover.js` is a thin styled Radix Popover wrapper.
- The value currently lives more in consistent Evality surface tokens and header/footer APIs than in unique interaction behavior.
- Most feature screens still compose their own sheet internals directly inside page files, especially in `app/app/jobs/[jobId]/page.js`.
- There is not yet a higher-level Evality DS sheet abstraction despite the pending `FxSheet` direction.

| Component | Current File(s) | Current Purpose | Custom Behavior | shadcn/Radix Equivalent | Keep Custom? | Recommendation |
|---|---|---|---|---|---|---|
| Sheet primitives | `components/ui/sheet.js` | Sliding right/left panel surface | Evality width tokens, header/footer helpers, width override via `widthPx`, custom close button placement | shadcn Sheet built on Radix Dialog | Thin wrapper with useful theme integration | WRAP_SHADCN |
| Dialog primitives | `components/ui/dialog.js` | Centered modal dialogs | Evality panel spacing/radius/close-button treatment | shadcn Dialog built on Radix Dialog | Thin wrapper | WRAP_SHADCN |
| Popover primitives | `components/ui/popover.js` | Anchored small floating surfaces | Mostly styling only | shadcn Popover built on Radix Popover | Very thin | REPLACE_WITH_SHADCN |
| Alert dialog primitives | `components/ui/alert-dialog.js` | Destructive confirmation dialogs | Minimal styling wrapper | shadcn Alert Dialog / Radix AlertDialog | Very thin | REPLACE_WITH_SHADCN |

Usage locations:
- Sheets:
  - `app/app/jobs/[jobId]/page.js`
  - `app/app/jobs/page.js`
  - `app/app/clients/page.js`
  - `app/app/ds/page.js`
- Dialogs:
  - `app/app/jobs/[jobId]/page.js`
  - `app/app/jobs/page.js`
- Popovers:
  - `app/app/jobs/[jobId]/page.js`

Evality-specific behavior worth keeping:
- `SheetHeader`, `SheetBody`, `SheetFooter` shell conventions
- `size` token mapping and `widthPx` escape hatch
- consistent close-button placement and surface treatment

## 5. Forms / Inputs / Buttons

Observations:
- Some form primitives are genuinely shared styling layers.
- Others are product-specific interaction components that should stay custom.
- There is a lot of overlap with what shadcn primitives can provide when styled.

| Component | Current File(s) | Current Purpose | Custom Behavior | shadcn/Radix Equivalent | Keep Custom? | Recommendation |
|---|---|---|---|---|---|---|
| FxButton | `components/FxButton.js` | Shared button styling API | Variant map, icon-button helper classes, Evality disabled treatment | Plain button with shadcn button variant pattern | Thin styling wrapper | WRAP_SHADCN |
| FxAiButton | `components/FxAiButton.js` | Branded AI CTA button | Gradient AI surface, icon sizing, AI-specific focus/disabled styling | Could be a `Button` variant | Mostly style-only | WRAP_SHADCN |
| FxInput | `components/FxInput.js`, `components/FxFieldState.js` | Shared text input / textarea with label and helper state | Label/message composition, field-state tones, optional `rightElement`, textarea mode | shadcn Input + Textarea + FormField patterns | Useful composition wrapper | WRAP_SHADCN |
| FxSelect | `components/FxSelect.js` | Styled single select | Uses dropdown-menu instead of Radix Select, selected checkmark rendering, event-like `onChange` payload | shadcn Select / Radix Select | Current implementation is close to a reimplementation | REPLACE_WITH_SHADCN |
| FxRichTextEditor | `components/FxRichTextEditor.js` | Lightweight rich text editor | Uses `contentEditable` + `document.execCommand`, custom toolbar, link prompt | No direct shadcn primitive; would need editor lib or keep custom | Behavior is product-level but implementation is fragile | NEEDS_PRODUCT_DECISION |
| FxTagInput | `components/FxTagInput.js` | Tokenized free-entry tag field | Paste/comma/newline parsing, dedupe, chip removal, max tags | No direct shadcn primitive | Product-specific enough | KEEP_CUSTOM |
| FxMultiSelectInput | `components/FxMultiSelectInput.js` | Tokenized multi-select with suggestions | Suggestion menu, chip rendering, backspace deletion, free typing | Could use Combobox + badges but not directly out-of-box | Product-specific enough | KEEP_CUSTOM |
| FxCreatableSelect | `components/FxCreatableSelect.js` | Searchable creatable single/multi select | Click-outside handling, create flow, multiple mode, async create support | Could be rebuilt with Popover + Command/Combobox patterns | More custom than needed | NEEDS_PRODUCT_DECISION |
| FxCreatableCombobox | `components/FxCreatableCombobox.js` | Simpler creatable combobox | Search/create/select in dropdown menu | Combobox/Command pattern | Overlaps with `FxCreatableSelect` | DELETE_DUPLICATE |
| FxFieldState helpers | `components/FxFieldState.js` | Shared label/helper/tone helpers | Field tone mapping, required/optional decoration | Form composition helpers only | Useful shared layer | KEEP_CUSTOM |

Product-specific form behavior examples:
- tag parsing and dedupe
- multi-select chips
- async create flows
- rich text editing behavior

Likely replaceable with shadcn primitives plus styling:
- basic buttons
- basic inputs
- basic selects

## 6. Calendar / Scheduling Pieces

Observations:
- Current scheduling UI lives entirely inside `ScheduleInterviewSheet` in `app/app/jobs/[jobId]/page.js`.
- It is custom and feature-local, not a reusable primitive.
- The repo now has:
  - `components/ui/popover.js`
  - `components/ui/calendar.js`
  - `react-day-picker` dependency
- But the current scheduling flow no longer uses `components/ui/calendar.js`; it uses a custom weekly tile board plus popovers.
- Settings contains calendar connection/preferences UI, but that is form configuration, not reusable scheduling UI.

Could shadcn Calendar + Popover + Select/Input support V1?
- Yes for the previously discussed month-calendar V1.
- For the current lightweight week-board requirement, shadcn Calendar is not necessary.
- A custom weekly board is justified if the product requirement is “week glance with day tiles and strips” rather than “pick any date from a calendar”.

| Component | Current File(s) | Current Purpose | Custom Behavior | shadcn/Radix Equivalent | Keep Custom? | Recommendation |
|---|---|---|---|---|---|---|
| ScheduleInterviewSheet scheduling board | `app/app/jobs/[jobId]/page.js` | Feature-level interview scheduling inside shortlisted workflow | Weekly board tiles, anchored popover per day, inline interview strips | Popover can stay Radix; board itself is custom | Yes, if week-board stays | KEEP_CUSTOM |
| Calendar wrapper | `components/ui/calendar.js` | Styled `react-day-picker` wrapper | Evality classNames + icon override | shadcn Calendar / react-day-picker wrapper | Currently unused by scheduling UI | NEEDS_PRODUCT_DECISION |
| Popover for scheduling | `components/ui/popover.js`, `app/app/jobs/[jobId]/page.js` | Small anchored scheduling form | Thin wrapper only; feature logic is in sheet | shadcn Popover | No need for custom behavior | REPLACE_WITH_SHADCN |
| Calendar settings UI | `app/app/settings/page.js` | Calendar provider preferences and availability config | Product-specific settings forms and availability rows | Mix of existing form primitives | Yes as feature UI | KEEP_CUSTOM |

## Summary Recommendations

Strong candidates to keep custom:
- `AppShell`
- `FxTable` only if staying view-layer focused; otherwise rebuild around TanStack
- `FxTagInput`
- `FxMultiSelectInput`
- scheduling week-board if that weekly glance requirement remains

Strong candidates to wrap shadcn/Radix instead of owning bespoke implementations:
- `Sidebar`
- `Navbar`
- `FxTabs`
- `FxButton`
- `FxInput`
- `Sheet` / `Dialog`

Strong candidates to replace with direct shadcn primitives:
- `FxSelect`
- `Popover`
- `AlertDialog`

Likely duplicates / consolidation targets:
- `FxCreatableCombobox` vs `FxCreatableSelect`
- `components/ui/calendar.js` if the product stays on the weekly board instead of month-picker scheduling
