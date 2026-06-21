# Evality AI - Design System

**Version:** 1.3 | **Date:** 20 Jun 2026 | **Status:** Approved Baseline | **Path:** FxDocs/Design_System.md | **Need:** Source of Truth for Dev | **Last Updated:** 20 Jun 2026


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
| Primary          | `#2060E8` | Primary actions, active links    |
| AI               | `#C737F0` | AI-specific accents and cues     |
| Background       | `#FFFFFF` | App shell background             |
| Background Soft  | `#F5F7FA` | Outer app canvas, page background |
| Surface          | `#FFFFFF` | Cards, tables, panels, chrome    |
| Surface Subtle   | `#F7F9FC` | Low-emphasis grouped surfaces    |
| Surface Raised   | `#FAFBFD` | Sheets, dialogs, dropdowns       |
| Table Header     | `#F6F8FB` | Table header rows                |
| Table Row Alt    | `#F9FBFD` | Alternate table rows             |
| Surface Hover    | `#EEF2F7` | Hover states                     |
| Surface Selected | `#E0ECFF` | Selected rows, active navigation |
| Border           | `#D6DEE8` | Dividers, outlines               |
| Text Primary     | `#0F172A` | Main text                        |
| Text Secondary   | `#64748B` | Secondary text                   |
| Text Disabled    | `#94A3B8` | Disabled controls and text       |
| Success          | `#16A34A` | Success states                   |
| Warning          | `#D97706` | Warning states                   |
| Danger           | `#DC2626` | Error/destructive states         |

## Dark Theme

| Token            | Value     | Usage                            |
| ---------------- | --------- | -------------------------------- |
| Primary          | `#6C98FF` | Primary actions, active links    |
| AI               | `#D06AF4` | AI-specific accents and cues     |
| Background       | `#1E2430` | App shell background             |
| Background Soft  | `#202735` | Outer app canvas, page background |
| Surface          | `#262D3A` | Cards, tables, panels, chrome    |
| Surface Subtle   | `#283140` | Low-emphasis grouped surfaces    |
| Surface Raised   | `#2B3443` | Sheets, dialogs, dropdowns       |
| Table Header     | `#2D3544` | Table header rows                |
| Table Row Alt    | `#293140` | Alternate table rows             |
| Surface Hover    | `#343F52` | Hover states                     |
| Surface Selected | `#334B73` | Selected rows, active navigation |
| Border           | `#465366` | Dividers, outlines               |
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

| Token              | Size | Line Height | Weight | Usage                                      |
| ------------------ | ---- | ----------- | ------ | ------------------------------------------ |
| Display            | 36px | 44px        | 600    | Landing sections, major headers            |
| Nav Title          | 24px | 36px        | 600    | App navbar titles                          |
| Page Title         | 28px | 36px        | 600    | Page titles                                |
| Workspace Title    | 24px | 32px        | 600    | Job workspace and large in-app workspaces  |
| Workspace Subtitle | 14px | 22px        | 400    | Supporting workspace context               |
| Section Title      | 20px | 28px        | 600    | Section titles                             |
| Card Title         | 16px | 24px        | 600    | Card titles and compact panel headers      |
| Sheet Title        | 16px | 24px        | 600    | Right-side workspace sheets                |
| Sheet Subtitle     | 13px | 20px        | 400    | Sheet helper and supporting copy           |
| Dialog Title       | 20px | 32px        | 600    | Modal and confirmation dialog titles       |
| Dialog Subtitle    | 14px | 22px        | 400    | Dialog helper copy                         |
| Body               | 14px | 22px        | 400    | Default text                               |
| Field Label        | 13px | 20px        | 400    | Form labels                                |
| Field Hint         | 13px | 20px        | 400    | Helper text, validation text               |
| Button             | 14px | 22px        | 500    | Primary and secondary actions              |
| Meta Label         | 12px | 18px        | 500    | Chips, compact status, metadata            |
| Table Header       | 13px | 20px        | 500    | Table headers and dense structured labels  |
| Table Cell         | 14px | 22px        | 400    | Table cells                                |
| Caption            | 11px | 16px        | 400    | Tiny metadata, timestamps                  |

## Typography Rules

* Use Body as the default application text
* Use Field Label for form labels
* Use Field Hint for field help and validation text
* Use Table Header for table headers and dense structured labels
* Use Meta Label for chips, compact state, and tiny metadata
* Use Sheet Title and Sheet Subtitle for right-side workspace sheets
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

## Sheet Widths

| Token      | Value |
| ---------- | ----- |
| Sheet Sm   | 480px |
| Sheet Md   | 540px |
| Sheet Lg   | 600px |
| Sheet Xl   | 660px |


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

## Tabs

Use the shared `FxTabs` primitive. Do not hand-roll tab styles inside pages unless a new variant is being designed and then back-ported into `FxTabs`.

### Variants

| Variant       | Usage                                         |
| ------------- | --------------------------------------------- |
| `underlined`  | Page-level workflow tabs and recruiter stages |
| `rounded`     | Grouped step tabs inside sheets and forms     |
| `compact`     | Dense in-sheet secondary tab switching        |

### Rules

* Use `underlined` for top-level workspace flows such as candidate stages.
* Use `rounded` for grouped multi-step form flows such as Create Job.
* Use `compact` for smaller sheet-level context switches.
* Old aliases `stage`, `filter`, and `segmented` may exist temporarily for backward compatibility, but new code should use the named variants above.


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
* Typography: Button
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
