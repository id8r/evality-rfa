# Fx Foundation Audit

Current UI foundation extracted from the codebase before any rebuild work.

## Theme & Design Tokens

### Colors
Status: Good
Files: `app/globals.css`, `lib/FxTheme.js`, `lib/FxDesignSystem.js`
Observations: The product already has a coherent semantic token set for background, surface, text, border, primary, AI, success, warning, and danger. Light and dark values are both defined in CSS variables and mapped into Tailwind theme tokens.

### Dark Mode
Status: Good
Files: `app/globals.css`, `components/FxThemeToggle.js`, `components/FxThemeController.js`, `lib/FxConstants.js`
Observations: Dark mode is implemented as a root `dark` class with persisted theme state. The toggle is centralized and the CSS variables switch cleanly between light and dark palettes.

### Typography
Status: Good
Files: `lib/FxTheme.js`, `app/globals.css`
Observations: Typography is already tokenized into named roles for pages, workspaces, sheets, tables, forms, dialogs, and toasts. The type scale is consistent, although some product screens still mix token-driven copy with local Tailwind classes.

### Spacing
Status: Needs Refactor
Files: `lib/FxTheme.js`, `app/globals.css`
Observations: There is a usable spacing scale for gaps, padding, and shell spacing, but many screens still rely on ad hoc pixel values. The foundation is serviceable, but the system is not fully normalized around a single spacing vocabulary.

### Radius
Status: Good
Files: `lib/FxTheme.js`, `app/globals.css`
Observations: Radius tokens are explicit and cover common UI shapes from small controls to large cards and sheets. The visual language is consistent across forms, tables, nav, and surfaces.

### Shadows
Status: Needs Refactor
Files: `lib/FxTheme.js`, `app/globals.css`
Observations: Shadows are intentionally minimal, which keeps the product clean, but the shadow system is thin. There is limited depth differentiation between cards, overlays, sheets, and dialogs.

### Sizing Scales
Status: Good
Files: `lib/FxTheme.js`, `components/FxButton.js`, `components/FxInput.js`, `components/FxSelect.js`
Observations: Common control heights, button heights, and table density are already standardized. This is one of the stronger parts of the current foundation.

## Layout

### AppShell
Status: Good
Files: `components/AppShell.js`, `components/FxProtectedAppPage.js`
Observations: The shell provides a fixed sidebar, sticky navbar, and a scrollable content region. Sidebar collapse state is persisted and the layout is stable across protected routes.

### Navbar
Status: Good
Files: `components/Navbar.js`, `lib/FxTheme.js`
Observations: The navbar is minimal, sticky, and title-led. It is intentionally generic and accepts leading content plus actions on the right.

### Sidebar
Status: Good
Files: `components/Sidebar.js`, `lib/FxTheme.js`, `lib/FxConstants.js`
Observations: Sidebar navigation supports collapse/expand, active-state styling, a user menu, and compact icon-only mode. The layout pattern is clear and reusable.

### Page Containers
Status: Good
Files: `components/AppShell.js`, `components/FxProtectedAppPage.js`, `components/FxHeader.js`, `components/FxAuthPage.js`, `components/FxOnboardingPage.js`
Observations: Public and protected pages use different container patterns, but both are consistent within their route groups. The protected app pages rely on a shared content frame.

### Content Width System
Status: Needs Refactor
Files: `lib/FxTheme.js`, `components/AppShell.js`, `components/FxHeader.js`, `components/FxAuthPage.js`, `components/FxOnboardingPage.js`
Observations: There are multiple width conventions in use, including wide app frames, medium cards, and landing-page widths. The system is workable but not fully unified across product surfaces.

### Scrolling Patterns
Status: Needs Refactor
Files: `components/AppShell.js`, `app/app/jobs/[jobId]/page.js`, `components/FxTable.js`
Observations: The shell supports both full-page scrolling and overflow-hidden modes, and individual screens sometimes manage their own scrolling internally. This is functional but requires discipline to avoid nested-scroll complexity.

## Shared UI

### Buttons
Status: Good
Files: `components/FxButton.js`, `components/FxAiButton.js`, `components/FxHeader.js`, `components/FxAuthDialog.js`, `components/FxOnboardingPage.js`
Observations: Buttons are centralized with clear variants, sizes, icon-button support, and an AI-specific treatment. The system is consistent, although some screens still add one-off Tailwind overrides.

### Inputs
Status: Good
Files: `components/FxInput.js`, `components/FxFieldState.js`, `components/FxRichTextEditor.js`
Observations: Inputs share a common frame tone model and message/label treatment. Textarea and contenteditable usage is already wrapped in reusable components.

### Selects
Status: Good
Files: `components/FxSelect.js`, `components/FxCreatableSelect.js`, `components/FxCreatableCombobox.js`
Observations: Select controls are implemented as menu-driven primitives rather than native selects. The creatable pattern is already established and reusable.

### Tabs
Status: Good
Files: `components/FxTabs.js`, `components/FxStepTabs.js`
Observations: There are two tab patterns: generic tabs and workflow step tabs. Both are lightweight and consistent with the rest of the system.

### Pills
Status: Good
Files: `components/FxPill.js`
Observations: Pills are tokenized and cover neutral, primary, and status tones. The component is simple and reusable across badges and tags.

### Sheets
Status: Good
Files: `components/ui/sheet.js`, `components/AppShell.js`, `app/app/jobs/[jobId]/page.js`
Observations: Sheet patterns are a major part of the product UI and are already used as structured workspace surfaces. The current implementation is good enough for reuse, though some book-sheet variants still differ in body structure.

### Tables
Status: Needs Refactor
Files: `components/FxTable.js`, `components/FxColumnPicker.js`
Observations: The dense table primitive is strong, with selection, sticky columns, and column persistence. The overall table strategy is good, but the product still has many table-specific overrides and column variants.

### Toasts
Status: Good
Files: `components/FxToast.js`, `components/FxToaster.js`, `components/ui/toast.js`
Observations: Toast dispatch and rendering are centralized, with success/warning/info/destructive helpers. This is a solid reusable notification layer.

### Dialogs
Status: Good
Files: `components/ui/dialog.js`, `components/ui/alert-dialog.js`, `components/FxAuthDialog.js`
Observations: Dialog and alert-dialog primitives are consistently used for confirmation and auth flows. The shell is standard enough to keep.

## Overall Notes

The foundation is already coherent. The strongest areas are theme tokens, shell layout, and the basic form control primitives. The biggest refactor pressure is in spacing consistency, sheet standardization, and table/surface variations across product screens.

