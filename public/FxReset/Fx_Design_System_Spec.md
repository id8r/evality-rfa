# Fx Design System Spec

Current design decisions implemented across the product.

## Color System

- The system is token-first and uses CSS variables for semantic roles.
- Core light-mode tokens live in `app/globals.css` and are mirrored by dark-mode overrides.
- Primary semantic tokens:
  - `--fx-bg`
  - `--fx-bg-soft`
  - `--fx-surface`
  - `--fx-surface-subtle`
  - `--fx-surface-raised`
  - `--fx-surface-hover`
  - `--fx-surface-selected`
  - `--fx-text`
  - `--fx-text-muted`
  - `--fx-text-disabled`
  - `--fx-border`
  - `--fx-primary`
  - `--fx-ai`
  - `--fx-success`
  - `--fx-warning`
  - `--fx-danger`
- Tailwind theme aliases map these variables into standard utility names in `app/globals.css`.
- Table chrome also has dedicated tokens for headers and alternating rows.

## Typography System

- Typography is centralized in `lib/FxTheme.js`.
- The product uses named roles instead of raw font-size decisions in most shared components.
- Main roles:
  - Display and page titles
  - Workspace titles and subtitles
  - Section/card/sheet/dialog titles
  - Field labels and hints
  - Table headers and cells
  - Button and meta text
  - Toast title and description
  - Empty state copy
- Font family is Inter with sane system fallbacks.

## Spacing System

- Spacing is tokenized in `lib/FxTheme.js` but implementation still mixes tokens with hardcoded pixel values.
- Existing scale includes common gaps and paddings such as 8, 16, 24, 32, 48, 64, and 96.
- Control sizing is also tokenized separately from content spacing.
- Current state: usable, but not fully normalized.

## Border & Radius System

- Radius is standardized with small, medium, large, extra-large, and pill-like treatments.
- Most controls use the small radius, while cards, sheets, and dialogs use medium to large radii.
- Pills and badges use a dedicated pill token system.

## Elevation System

- Elevation is intentionally subtle.
- The system relies more on borders, surface color, and selected-state backgrounds than on strong shadow depth.
- Current shadow usage is mostly a light card/dialog shadow.
- This keeps the product flat and readable, but limits hierarchy depth.

## Sheet Standards

- Sheets are a major workspace surface.
- Standard sheet pattern in product:
  - header
  - body
  - footer
- Common sheet behaviors:
  - title in the header
  - utility actions in the header
  - main content in a two-pane or single-pane body
  - final actions in the footer
- The current implementation supports book-sheet style workflows, but variants are still uneven across product screens.

## Table Standards

- Tables are dense and scrollable.
- Common expectations:
  - sticky headers
  - optional sticky first/last columns
  - selectable rows
  - persisted column visibility
  - compact and comfortable density modes
- Column sizing is treated as structural for action and selection columns, and fluid for content columns.
- The table system is strong and reusable, but some screens still add per-page exceptions.

## Form Standards

- Forms use labeled field wrappers and field-state tones.
- The system supports:
  - default
  - error
  - warning
  - success
- Inputs and selects are visually aligned with the same border, background, and focus behavior.
- Textareas and rich text editing are wrapped in the same field language.
- Validation and helper copy are shown consistently below fields.

## Navigation Standards

- App navigation is sidebar-led.
- The sidebar supports collapse and persistence.
- The navbar is sticky and title-focused.
- Public pages use a separate top header pattern instead of the protected app shell.

## Interaction Standards

- Hover, selected, and active states are handled via semantic surface colors.
- Buttons and interactive elements use fast transitions, but the system avoids excessive motion.
- Toasts are non-blocking notification surfaces.
- Dialogs and sheets are used for confirmation and workflow expansion.

## Responsive Strategy

- The app shell uses a fixed sidebar plus a fluid content region.
- Main content is designed to stretch across the available frame while preserving max-width boundaries where needed.
- Sheets and tables use responsive breakpoints to switch between stacked and split-pane layouts.
- Dense admin-style layouts are optimized for desktop first, with mobile support handled through stacking and overflow.

## Reusable Visual Decisions

- Clean surfaces with restrained elevation.
- Strong semantic color usage instead of decorative palettes.
- Consistent 8px-based radius language.
- Form controls and tables share the same border vocabulary.
- Primary actions are visually stronger than secondary or ghost actions.

