<!-- FxDocs/Design_System.md | Design system source of truth | 14 Jun 2026 -->

# Evality AI - Design System

**Version:** 1.1 | **Date:** 14 Jun 2026 | **Status:** Approved Baseline | **Owner:** Product Team


# Principles

* Calm
* Minimal
* Dense
* Actionable
* Consistent
* High Signal


# Token Rules

* No hardcoded colors
* No hardcoded typography
* No hardcoded spacing
* No hardcoded radius values
* No hardcoded layout dimensions
* All values must come from centralized theme tokens


# Color System

## Light Theme

| Token            | Value     | Usage                            |
| ---------------- | --------- | -------------------------------- |
| Primary          | `#2563EB` | Primary actions, active links    |
| Background       | `#FFFFFF` | App shell, page background       |
| Surface          | `#FFFFFF` | Cards, tables, panels            |
| Surface Raised   | `#F8FAFC` | Sheets, dialogs, dropdowns       |
| Surface Hover    | `#F1F5F9` | Hover states                     |
| Surface Selected | `#E0ECFF` | Selected rows, active navigation |
| Border           | `#E2E8F0` | Dividers, outlines               |
| Text Primary     | `#0F172A` | Main text                        |
| Text Secondary   | `#64748B` | Secondary text                   |
| Text Disabled    | `#94A3B8` | Disabled controls and text       |
| Success          | `#16A34A` | Success states                   |
| Warning          | `#D97706` | Warning states                   |
| Danger           | `#DC2626` | Error/destructive states         |

## Dark Theme

| Token            | Value     | Usage                            |
| ---------------- | --------- | -------------------------------- |
| Primary          | `#3B82F6` | Primary actions, active links    |
| Background       | `#1E2430` | App shell, page background       |
| Surface          | `#262D3A` | Cards, tables, panels            |
| Surface Raised   | `#313948` | Sheets, dialogs, dropdowns       |
| Surface Hover    | `#394354` | Hover states                     |
| Surface Selected | `#445066` | Selected rows, active navigation |
| Border           | `#434C5E` | Dividers, outlines               |
| Text Primary     | `#F3F4F6` | Main text                        |
| Text Secondary   | `#A8B0BF` | Secondary text                   |
| Text Disabled    | `#6B7280` | Disabled controls and text       |
| Success          | `#22C55E` | Success states                   |
| Warning          | `#F59E0B` | Warning states                   |
| Danger           | `#EF4444` | Error/destructive states         |

## Dark Mode Rules

* Avoid pure black
* Avoid high-contrast borders
* Avoid glow effects
* Prefer layered surfaces over shadows
* Keep tables readable and dense
* Use accent colors only for actions and statuses


# Typography

## Font Family

font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  Helvetica,
  Arial,
  sans-serif;

## Type Scale

| Token       | Size | Line Height | Weight | Usage                                |
| ----------- | ---- | ----------- | ------ | ------------------------------------ |
| Display     | 36px | 44px        | 600    | Landing sections, major headers      |
| H1          | 28px | 36px        | 600    | Page titles                          |
| H2          | 24px | 32px        | 600    | Section titles                       |
| H3          | 20px | 28px        | 600    | Subsections                          |
| Title       | 16px | 24px        | 600    | Card titles, dialog titles           |
| Body        | 14px | 22px        | 400    | Default text                         |
| Body Medium | 14px | 22px        | 500    | Clickable data, emphasized body text |
| Label       | 13px | 20px        | 500    | Form labels                          |
| Helper      | 12px | 18px        | 400    | Helper text, validation text         |
| Meta        | 12px | 18px        | 500    | Table headers, metadata, chips       |
| Caption     | 11px | 16px        | 400    | Tiny metadata, timestamps            |

## Typography Rules

* Use Body as the default application text
* Use Label for form labels
* Use Helper for field help and validation text
* Use Meta for table headers and compact metadata
* Do not use text below 11px


# Spacing

**Base Unit:** 8px

## Approved Scale

8
16
24
32
40
48
64
80
96

## Rules

* Use 8px multiples
* Avoid arbitrary spacing values
* Use tighter spacing for dense recruiter workflows
* Use larger spacing for landing pages and empty states


# Layout

| Token                 | Value  |
| --------------------- | ------ |
| Maximum Content Width | 1440px |
| Default Content Width | 1200px |
| Expanded Sidebar      | 256px  |
| Collapsed Sidebar     | 72px   |
| Global Header Height  | 64px   |


# Radius

| Token       | Value | Usage                           |
| ----------- | ----- | ------------------------------- |
| Interactive | 6px   | Buttons, inputs, selects, chips |
| Small       | 8px   | Small cards, table containers   |
| Medium      | 12px  | Cards, panels                   |
| Large       | 16px  | Large sections, modals          |


# Shadows

box-shadow: 0 1px 2px rgba(0,0,0,0.04);

## Rules

* Use shadows sparingly
* Prefer borders and surface contrast
* Avoid decorative elevation
* Avoid glow effects


# Icons

**Library:** lucide-react

| Size | Usage                              |
| ---- | ---------------------------------- |
| 16px | Tables, buttons, compact actions   |
| 20px | Navigation, menus, common controls |
| 24px | Empty states, large actions        |


# Components

## Navigation

### Sidebar

| Property     | Value            |
| ------------ | ---------------- |
| Item Height  | 36px             |
| Hover State  | Surface Hover    |
| Active State | Surface Selected |

### Navbar

| Property   | Value              |
| ---------- | ------------------ |
| Height     | 64px               |
| Background | Surface            |
| Border     | Bottom Border Only |


# Route Manifest

Navigation and page metadata must be centralized.

Each route definition should support:

* id
* route
* navLabel
* pageTitle
* icon
* showInSidebar
* sortOrder

## Rules

* Route paths are not page titles.
* Sidebar labels are not identifiers.
* AppShell titles must come from the manifest.
* Navigation should consume the manifest.
* Use stable IDs throughout the application.

Example IDs:

* actionCenter
* jobs
* candidates
* clients
* jobWorkspace
* settings


## Buttons

| Type        | Background  | Text         | Border |
| ----------- | ----------- | ------------ | ------ |
| Primary     | Primary     | White        | None   |
| Secondary   | Surface     | Text Primary | Border |
| Ghost       | Transparent | Text Primary | None   |
| Destructive | Danger      | White        | None   |

**Specs**

* Height: 36px or 40px
* Radius: 6px
* Typography: Body Medium
* Icon Size: 16px

### States

#### Hover

* Primary: darker primary shade
* Secondary: Surface Hover
* Ghost: Surface Hover
* Destructive: darker danger shade

#### Disabled

* Use Text Disabled
* Reduce emphasis
* No hover interaction
* Cursor: not-allowed


## Status Chips

| Property   | Value  |
| ---------- | ------ |
| Height     | 24px   |
| Radius     | 9999px |
| Typography | Meta   |

**States**

* Success
* Warning
* Danger
* Neutral


## Inputs

| Property | Value  |
| -------- | ------ |
| Height   | 36px   |
| Radius   | 6px    |
| Text     | Body   |
| Label    | Label  |
| Helper   | Helper |

**States**

* Border token by default
* Primary token on focus
* Danger token for errors
* Helper text uses Text Secondary


## Selectable Cards

Used For

* Onboarding
* Persona Selection
* Workflow Selection
* Option Selection

### Specs

| Property | Value |
|----------|-------|
| Radius | 6px |
| Border | Border Token |
| Background | Surface |
| Hover | Surface Hover |
| Selected | Surface Selected + Primary Border |

### Rules

* Selected state must be visually obvious.
* Support keyboard navigation.
* Keep descriptions concise.
* Do not rely on color alone to indicate selection.
* Support light and dark themes.


## Tables

| Property       | Value       |
| -------------- | ----------- |
| Header Height  | 48px        |
| Row Height     | 56px        |
| Header Text    | Meta        |
| Cell Text      | Body        |
| Clickable Data | Body Medium |

**Rules**

* Optimize for scanning
* Clean borders
* Zebra striping enabled for dense recruiter tables
* Hover uses Surface Hover
* Selected uses Surface Selected

### Links Inside Tables

* Use Primary color
* Use pointer cursor
* Use subtle hover feedback
* Use darker shade on hover
* Avoid excessive underlines
* Underline on hover is optional.
* Prefer color change before decoration.


## Sheets

| Size   | Width |
| ------ | ----- |
| Small  | 360px |
| Medium | 480px |
| Large  | 640px |

**Rules**

* Fixed header
* Scrollable body
* Fixed action footer
* Surface Raised background
* Visible border


## Dialogs

* Surface Raised background
* Medium or Large radius
* Minimal shadow
* Clear primary and secondary actions
* Avoid oversized dialogs


## Dropdowns

* Surface Raised background
* Border token
* 6px radius
* Hover uses Surface Hover
* Selected uses Surface Selected


## Toasts

* Surface Raised background
* Border token
* Status color only for icon/accent
* Keep copy short


# Theme Coverage

All screens and components must support:

* Light Theme
* Dark Theme
* Responsive Layouts
* Keyboard Navigation
* Token-Based Styling


# Known Exceptions

Allowed brand colors:

* Google
* LinkedIn


# Design Review Checklist

```text
[ ] Supports Light Theme
[ ] Supports Dark Theme
[ ] Uses Theme Tokens
[ ] Uses Typography Tokens
[ ] Uses Spacing Tokens
[ ] Uses Radius Tokens
[ ] No Hardcoded Colors
[ ] No Hardcoded Layout Dimensions
[ ] Keyboard Accessible
[ ] Responsive
[ ] Consistent With Existing Patterns
