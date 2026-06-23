# Fx Rebuild Roadmap

Recommended rebuild sequence for a reset.

## Phase 1: Foundation

Goals:
- Inventory the current app routes, shared shells, tokens, and primitives.
- Freeze the current component and token contracts.
- Identify which screens are route-level compositions versus true reusable primitives.

Dependencies:
- Source audit complete.
- Current design tokens documented.

Risks:
- Confusing feature screens with reusable UI primitives.
- Missing token drift that later leaks into the rebuild.

Recommended Order:
- Audit first.
- Lock naming.
- Classify reusable components before rewriting anything.

## Phase 2: Theme System

Goals:
- Rebuild the semantic token layer.
- Define color, typography, radius, spacing, and elevation from a single source of truth.

Dependencies:
- Foundation inventory.
- Agreement on visual roles and dark-mode behavior.

Risks:
- Copying today’s inconsistencies into a new token layer.
- Overfitting tokens to current screens.

Recommended Order:
- Colors first.
- Typography second.
- Spacing and radius third.
- Elevation last.

## Phase 3: Primitives

Goals:
- Rebuild the atomic controls and field state helpers.
- Standardize buttons, inputs, selects, pills, tabs, toasts, dialogs, and empty states.

Dependencies:
- Theme system.
- Shared control heights and field tones.

Risks:
- Rebuilding controls before token decisions are stable.
- Creating near-duplicate variants across primitives.

Recommended Order:
- Buttons.
- Field states.
- Inputs and selects.
- Tabs and pills.
- Toasts and dialogs.

## Phase 4: Shell

Goals:
- Rebuild AppShell, Navbar, Sidebar, and route wrappers.
- Stabilize authenticated page framing and public page framing.

Dependencies:
- Primitives.
- Theme tokens.

Risks:
- Layout regressions across route groups.
- Scroll-container conflicts.

Recommended Order:
- AppShell.
- Sidebar.
- Navbar.
- Protected shell wrappers.

## Phase 5: Data Presentation Components

Goals:
- Rebuild tables, column pickers, step tabs, and dense data-view surfaces.
- Establish list/detail patterns and pagination or scroll conventions.

Dependencies:
- Shell.
- Primitives.

Risks:
- Table complexity creeping into unrelated controls.
- Column visibility state becoming fragmented.

Recommended Order:
- Table.
- Column picker.
- Step tabs.
- Empty states and surface cards.

## Phase 6: Advanced Components

Goals:
- Rebuild rich text editing, creatable selects, multi-selects, tag input, and specialized field helpers.

Dependencies:
- Primitives.
- Stable field-state behavior.

Risks:
- Hard-to-test editor behavior.
- Duplicate input variants with overlapping roles.

Recommended Order:
- Creatable selects.
- Multi-select and tag input.
- Rich text editor.
- Field-state utilities.

## Phase 7: Feature Components

Goals:
- Rebuild app-specific but reusable composite components such as auth dialogs, onboarding screens, and themed public headers.

Dependencies:
- Shell.
- Advanced components.

Risks:
- Feature components getting treated as primitives.
- Business logic leaking into UI modules.

Recommended Order:
- Auth surfaces.
- Onboarding surfaces.
- Landing/public header.
- Theme toggle and other shared utilities.

## Phase 8: Product Screens

Goals:
- Rebuild actual app screens on top of the new system.
- Apply the shell, primitive, and data-view patterns consistently.

Dependencies:
- All earlier phases.

Risks:
- Screen-specific overrides becoming permanent exceptions.
- Reintroducing layout drift under deadline pressure.

Recommended Order:
- Landing and auth.
- Jobs workspace.
- Candidates workspace.
- Clients and action center.
- Settings.
- Any remaining secondary screens.

## Final Recommendation

- Do not start with product screens.
- Rebuild the token layer and primitives first.
- Then rebuild the shell.
- Only after that should the app screens be recreated.
- Keep the rebuild order strict so design drift does not re-enter through feature work.

