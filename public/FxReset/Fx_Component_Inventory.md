# Fx Component Inventory

Master catalog of reusable UI components and helper components currently present in the codebase.

## Core Shell Components

### `AppShell`
Purpose: Shared protected app frame with sidebar, navbar, and content canvas.
Variants: Sidebar collapsed/expanded, scrollable or hidden main content.
Key Props: `children`, `title`, `navbarLeading`, `navbarActions`, `mainScroll`, `contentPaddingYClassName`, `shellClassName`, `sidebarClassName`, `navbarClassName`, `contentClassName`.
Dependencies: `Sidebar`, `Navbar`, `lib/FxConstants`, `lib/FxTheme`, `lib/FxUtils`.
Used In: `components/FxProtectedAppPage.js`.
Keep / Merge / Delete: Keep.
Notes: This is the root reusable shell for authenticated routes.

### `Navbar`
Purpose: Sticky top navigation bar for title and utility actions.
Variants: Title-only with optional leading content and right-side actions.
Key Props: `title`, `leading`, `actions`, `className`.
Dependencies: `lib/FxTheme`, `lib/FxUtils`.
Used In: `components/AppShell.js`.
Keep / Merge / Delete: Keep.
Notes: Good minimal layout primitive.

### `Sidebar`
Purpose: Primary left navigation with collapse support and account menu.
Variants: Expanded, collapsed.
Key Props: `isCollapsed`, `onToggle`, `width`, `className`.
Dependencies: `lib/FxConstants`, `lib/FxTheme`, `lib/FxUtils`, dropdown menu, theme toggle.
Used In: `components/AppShell.js`.
Keep / Merge / Delete: Keep.
Notes: Central app navigation component.

### `FxProtectedAppPage`
Purpose: Route guard and shell wrapper for authenticated app pages.
Variants: Page title override, content class override.
Key Props: `children`, `pageId`, `title`, `navbarLeading`, `navbarActions`, `contentClassName`.
Dependencies: `AppShell`, `lib/FxConstants`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Protected app routes.
Keep / Merge / Delete: Keep.
Notes: Pairs route protection with shared shell.

## Buttons and Actions

### `FxButton`
Purpose: Base button component for primary and utility actions.
Variants: `primary`, `secondary`, `outline`, `ghost`, `auth`, `destructive`; sizes `sm`, `md`, `lg`.
Key Props: `variant`, `size`, `type`, `className`.
Dependencies: `lib/FxTheme`, `lib/FxUtils`.
Used In: Most app screens and dialogs.
Keep / Merge / Delete: Keep.
Notes: Foundational button primitive.

### `fxButtonClassName`
Purpose: Shared class generator for button styling.
Variants: Same as `FxButton`.
Key Props: `className`, `variant`, `size`.
Dependencies: `lib/FxTheme`, `lib/FxUtils`.
Used In: `FxButton`, `FxAuthDialog`, `FxHeader`, `FxColumnPicker`.
Keep / Merge / Delete: Keep.
Notes: Useful for consistent button styling.

### `fxIconButtonClassName`
Purpose: Shared class generator for icon-only buttons.
Variants: `outline`, `ghost`.
Key Props: `className`, `variant`, `size`.
Dependencies: `lib/FxTheme`, `lib/FxUtils`.
Used In: `FxThemeToggle`, `FxColumnPicker`, navbar and sheet actions.
Keep / Merge / Delete: Keep.
Notes: Works well for small utility controls.

### `FxAiButton`
Purpose: AI-branded action button with sparkle treatment.
Variants: `sm`, `md`, `lg`.
Key Props: `icon`, `children`, `size`, `type`, `className`.
Dependencies: `lucide-react`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Job create/edit, screening flows, recommendations.
Keep / Merge / Delete: Keep.
Notes: Distinct AI action style.

## Inputs and Form Controls

### `FxInput`
Purpose: Text input and textarea wrapper with label and validation state.
Variants: Input or textarea, optional right element.
Key Props: `label`, `helperText`, `validationMessage`, `state`, `textarea`, `rightElement`, `required`, `optional`, `hideRequiredMark`.
Dependencies: `FxFieldState`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Most forms across jobs, settings, auth, onboarding.
Keep / Merge / Delete: Keep.
Notes: Core field primitive.

### `FxSelect`
Purpose: Dropdown select built on menu primitives.
Variants: Default select with option menu.
Key Props: `options`, `value`, `onChange`, `placeholder`, `disabled`, `helperText`, `validationMessage`, `state`.
Dependencies: `FxFieldState`, `DropdownMenu`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Settings and job forms.
Keep / Merge / Delete: Keep.
Notes: Good replacement for native select in product UI.

### `FxCreatableSelect`
Purpose: Searchable select that can create new entries.
Variants: Single-select, multi-select, clearable, creatable.
Key Props: `options`, `value`, `defaultValue`, `onChange`, `onCreate`, `allowCreate`, `multiple`, `maxSelections`, `clearable`, `loading`.
Dependencies: `FxFieldState`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Forms that need creatable pickers.
Keep / Merge / Delete: Keep.
Notes: Strong reusable pattern for user-entered vocabularies.

### `FxMultiSelectInput`
Purpose: Tokenized multi-select field with inline search and chip removal.
Variants: Chip list, suggestion dropdown.
Key Props: `label`, `value`, `onChange`, `options`, `placeholder`, `helperText`, `validationMessage`, `state`, `required`, `optional`, `disabled`.
Dependencies: `FxFieldState`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Settings and job setup forms.
Keep / Merge / Delete: Keep.
Notes: Good reusable chip-input pattern.

### `FxTagInput`
Purpose: Freeform token input for comma/newline-separated tags.
Variants: Chip-based token entry.
Key Props: `value`, `onChange`, `label`, `helperText`, `validationMessage`, `state`, `placeholder`, `maxTags`, `disabled`.
Dependencies: `FxFieldState`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Job skill fields and similar list inputs.
Keep / Merge / Delete: Keep.
Notes: Similar purpose to `FxMultiSelectInput` but for freeform tokens.

### `FxFieldLabel`, `FxFieldMessage`, field tone helpers
Purpose: Shared field label, message, and validation tone system.
Variants: Default, error, warning, success.
Key Props: `required`, `optional`, `state`, `className`.
Dependencies: `lib/FxTheme`, `lib/FxUtils`.
Used In: All field primitives.
Keep / Merge / Delete: Keep.
Notes: Structural dependency for form consistency.

### `FX_FIELD_STATES`, `getFieldFrameToneClassName`, `getFieldLabelToneClassName`, `getFieldMessageToneClassName`
Purpose: Validation state constants and tone helpers.
Variants: default, error, warning, success.
Key Props: State string.
Dependencies: `lib/FxTheme`.
Used In: Field primitives and composed forms.
Keep / Merge / Delete: Keep.
Notes: Shared validation styling layer.

## Content and Data Presentation

### `FxTabs`
Purpose: Generic tab switcher.
Variants: `underlined`, `compact`, `regular`, `rounded`, plus aliases.
Key Props: `tabs`, `items`, `active`, `value`, `onChange`, `onValueChange`, `variant`, `showBorder`.
Dependencies: `lib/FxTheme`, `lib/FxUtils`.
Used In: Job workspace sheets and settings screens.
Keep / Merge / Delete: Keep.
Notes: Main tab primitive for product screens.

### `FxStepTabs`
Purpose: Workflow step tab/navigation component.
Variants: Active, completed, error, disabled states.
Key Props: `steps`, `activeStep`, `onChange`, `ariaLabel`.
Dependencies: `lucide-react`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Job creation and guided workflows.
Keep / Merge / Delete: Keep.
Notes: Good for wizard flows.

### `FxTable`
Purpose: Dense, scrollable table with sticky columns and persistence.
Variants: Comfortable/compact density, sticky header, sticky first/last column, row selection, column picker.
Key Props: `columns`, `rows`, `stickyHeader`, `stickyFirstColumn`, `stickyLastColumn`, `scrollX`, `density`, `visibleColumnKeys`, `enableColumnPicker`, `enableRowSelection`.
Dependencies: `FxColumnPicker`, `ui/checkbox`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Jobs, candidates, clients, and workspace lists.
Keep / Merge / Delete: Keep.
Notes: One of the most important reusable components in the codebase.

### `FxColumnPicker`
Purpose: Column visibility menu for tables.
Variants: Icon-only or labeled trigger.
Key Props: `columns`, `visibleColumnKeys`, `onVisibleColumnKeysChange`, `buttonLabel`, `buttonProps`.
Dependencies: `FxButton`, `ui/dropdown-menu`, `ui/checkbox`.
Used In: `FxTable`.
Keep / Merge / Delete: Keep.
Notes: Supports table personalization.

### `FxPill`
Purpose: Compact pill/badge label.
Variants: `full` or `rect`; tones `neutral`, `subtle`, `primary`, `success`, `warning`, `danger`.
Key Props: `asChild`, `shape`, `tone`, `className`.
Dependencies: `lib/FxTheme`, `lib/FxUtils`.
Used In: Tables, cards, and metadata badges.
Keep / Merge / Delete: Keep.
Notes: Good lightweight status badge primitive.

### `FxEmptyState`
Purpose: Empty-state card with icon, title, body, and action.
Variants: Optional icon and action slot.
Key Props: `icon`, `title`, `body`, `action`.
Dependencies: `lib/FxTheme`.
Used In: Empty list and empty panel states.
Keep / Merge / Delete: Keep.
Notes: Simple and reusable.

### `FxRichTextEditor`
Purpose: Contenteditable rich text field with formatting toolbar.
Variants: Toolbar top or bottom.
Key Props: `value`, `onChange`, `label`, `placeholder`, `disabled`, `minHeight`, `toolbarPlacement`, `helperText`, `validationMessage`.
Dependencies: `FxButton`, `FxFieldState`, `lib/FxTheme`, `lib/FxUtils`.
Used In: Job descriptions, notes, email drafts.
Keep / Merge / Delete: Keep.
Notes: Functional but older-school DOM execCommand implementation.

### `FxHeader`
Purpose: Public landing-page header.
Variants: None beyond injected auth action handling.
Key Props: `onAuthOpen`.
Dependencies: `FxButton`, `FxThemeToggle`, `lib/FxConstants`, `lib/FxTheme`, `lib/FxCopy`.
Used In: Landing page.
Keep / Merge / Delete: Keep.
Notes: Public-facing shell header.

### `FxLandingPage`, `FxAuthPage`, `FxOnboardingPage`, `HomePage`, `DesignSystemPage`
Purpose: Route-level reusable page shells / full-screen views.
Variants: Route-specific.
Key Props: Page-specific props only.
Dependencies: Shell, forms, constants, copy, store helpers.
Used In: Public routes and app entry flows.
Keep / Merge / Delete: Keep, but treat as route-level compositions rather than low-level primitives.
Notes: These are reusable screens, not atomic UI primitives.

## Utilities and Supporting Components

### `FxThemeToggle`
Purpose: Theme switcher for light/dark mode.
Variants: None.
Key Props: None.
Dependencies: `fxIconButtonClassName`, theme storage, `FxConstants`.
Used In: Sidebar and landing header.
Keep / Merge / Delete: Keep.
Notes: Small but central.

### `FxToaster`
Purpose: Global toast host.
Variants: Variant-colored toasts.
Key Props: `children`.
Dependencies: `ui/toast`, `components/ui/use-toast`.
Used In: Root layout.
Keep / Merge / Delete: Keep.
Notes: Global notification surface.

### `FxToast` helpers
Purpose: Programmatic toast API wrappers.
Variants: `showToast`, `showSuccess`, `showError`, `showWarning`, `showInfo`.
Key Props: title, description, variant, action, duration, id.
Dependencies: `components/ui/use-toast`.
Used In: Multiple app screens.
Keep / Merge / Delete: Keep.
Notes: Good abstraction over toast state.

### `FxAuthDialog`
Purpose: Login/signup modal with social and email auth entry points.
Variants: Controlled or uncontrolled open state.
Key Props: `defaultOpen`, `intent`, `onOpenChange`, `open`, `showTrigger`.
Dependencies: `FxButton`, `ui/dialog`, `FxStore`, `FxConstants`, `FxCopy`.
Used In: Landing page auth entry.
Keep / Merge / Delete: Keep.
Notes: Route-bootstrapping auth modal.

### `FxOnboardingPage`
Purpose: Persona/workspace onboarding route shell.
Variants: None.
Key Props: None.
Dependencies: `FxButton`, `FxCreatableCombobox`, store helpers, constants, copy.
Used In: First-run onboarding route.
Keep / Merge / Delete: Keep as route shell.
Notes: High-level screen rather than atomic UI.

### `FxThemeController`
Purpose: Syncs theme from persisted state into the DOM.
Variants: None.
Key Props: None.
Dependencies: storage helpers, constants.
Used In: Root layout.
Keep / Merge / Delete: Keep.
Notes: Needed for theme persistence.

### `FxCreatableCombobox`
Purpose: Alternate creatable chooser control.
Variants: Searchable dropdown combobox.
Key Props: Similar to other select controls.
Dependencies: `lib/FxTheme`, `lib/FxUtils`, menu primitives.
Used In: Onboarding and any creatable choice flows.
Keep / Merge / Delete: Keep.
Notes: Similar category to `FxCreatableSelect`, but combobox behavior.

## Recommended Classification

- Keep: `AppShell`, `Navbar`, `Sidebar`, `FxProtectedAppPage`, `FxButton`, `FxAiButton`, `FxInput`, `FxSelect`, `FxCreatableSelect`, `FxMultiSelectInput`, `FxTagInput`, `FxTabs`, `FxStepTabs`, `FxPill`, `FxTable`, `FxColumnPicker`, `FxRichTextEditor`, `FxEmptyState`, `FxToast`, `FxToaster`, `FxThemeToggle`, `FxAuthDialog`, `FxHeader`, `FxFieldState` helpers.
- Merge later if needed: `FxSelect` and `FxCreatableSelect` share a close relationship; `FxTagInput` and `FxMultiSelectInput` overlap in use cases but are both currently useful.
- Delete later only if replaced by a stronger redesign: none recommended at this stage.

