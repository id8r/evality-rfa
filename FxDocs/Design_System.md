# Evality AI - Design System

Version: 1.0
Status: Approved Baseline
Owner: Product Team

---

# Design Philosophy

Evality is a recruiting workspace built for recruiters, agencies, and talent acquisition teams.

The interface should prioritize:

* Speed
* Clarity
* Density
* Actionability

Modernize recruiter workflows without fighting recruiter behavior.

---

## Inspiration

* ChatGPT
* Linear
* Vercel

---

## Keywords

* Calm
* Minimal
* Professional
* Focused
* Fast
* High Signal

---

## Avoid

* Heavy enterprise styling
* Decorative shadows
* Excessive gradients
* Glow effects
* Dashboard overload
* ATS-style clutter

---

# Theme Architecture

Theme implementation is centralized.

## Core Files

```text
app/globals.css
lib/FxTheme.js
lib/FxConstants.js
lib/FxUtils.js
lib/FxCopy.js
lib/FxStore.js

components/FxThemeToggle.js
components/FxThemeController.js
```

## Rules

* No hardcoded colors
* No hardcoded typography
* No hardcoded spacing
* No hardcoded radius values
* No hardcoded layout dimensions

All values should originate from centralized theme tokens.

---

# Typography

## Font Family

Inter

Fallback Stack:

```text
Inter,
ui-sans-serif,
system-ui,
-apple-system,
BlinkMacSystemFont,
Segoe UI,
Roboto,
Helvetica,
Arial,
sans-serif
```

---

## Type Scale

| Style              | Size | Line Height | Weight |
| ------------------ | ---- | ----------- | ------ |
| Hero               | 56   | 64          | 700    |
| Display            | 36   | 40          | 600    |
| H1 / Page Title    | 28   | 36          | 600    |
| H2                 | 24   | 32          | 500    |
| H3 / Section Title | 20   | 28          | 600    |
| Card Title         | 16   | 24          | 600    |
| Body               | 14   | 22          | 400    |
| Clickable Data     | 14   | 22          | 500    |
| Button Label       | 14   | 22          | 500    |
| Helper Text        | 13   | 20          | 400    |
| Meta Label         | 12   | 18          | 500    |
| Table Header       | 12   | 18          | 500    |
| Caption            | 12   | 18          | 400    |

---

# Spacing System

Base Unit

8px

---

## Approved Scale

```text
8
16
24
32
40
48
64
80
96
```

Rule:

Use 8px multiples.

Avoid arbitrary spacing values.

---

# Layout Standards

Maximum Content Width

```text
1440px
```

Default Content Width

```text
1200px
```

Expanded Sidebar

```text
256px
```

Collapsed Sidebar

```text
72px
```

Global Header Height

```text
64px
```

---

# Sheet System

Default Sheet Width

```text
480px
```

Sizes

```text
Small  = 360px
Medium = 480px
Large  = 640px
```

All sheets use:

* Fixed Header
* Scrollable Body
* Fixed Action Footer

---

# Border Radius

## Interactive Elements

```text
rounded-ev-interactive = 6px
```

Used for:

* Buttons
* Inputs
* Selects
* Chips
* Small controls

---

## Structural Radius

```text
rounded-ev-s = 8px
rounded-ev-m = 12px
rounded-ev-l = 16px
```

---

# Color System

## Light Theme

| Token          | Value   |
| -------------- | ------- |
| Primary        | #2563EB |
| Background     | #FFFFFF |
| Surface        | #FFFFFF |
| Surface Raised | #F8FAFC |
| Border         | #E2E8F0 |
| Text Primary   | #0F172A |
| Text Secondary | #64748B |
| Success        | #16A34A |
| Warning        | #D97706 |
| Danger         | #DC2626 |

---

## Dark Theme

| Token          | Value   |
| -------------- | ------- |
| Primary        | #3B82F6 |
| Background     | #0B0F19 |
| Surface        | #111827 |
| Surface Raised | #1F2937 |
| Border         | #374151 |
| Text Primary   | #F9FAFB |
| Text Secondary | #9CA3AF |
| Success        | #22C55E |
| Warning        | #F59E0B |
| Danger         | #EF4444 |

---

# Buttons

## Primary

* Primary background
* White text
* 6px radius

## Secondary

* Surface background
* Border visible
* Text Primary

## Ghost

* Transparent background

## Destructive

* Danger background
* White text

---

# Inputs

Typography

```text
14 / 22
```

Radius

```text
6px
```

Behavior

* Border token by default
* Primary token on focus

---

# Tables

Recruiters spend most of their time in tables.

Tables should optimize for:

* Fast scanning
* Density
* Clarity
* Low visual noise

---

## Standards

Header Height

```text
48px
```

Row Height

```text
56px
```

---

## Visual Style

* Clean borders
* Zebra striping enabled
* Minimal decoration
* No heavy shadows

---

## Links Inside Tables

Interactive links should:

* Use Primary color
* Transition to a darker shade on hover
* Show pointer cursor

Avoid excessive hover decoration.

---

# Shadows

Default Shadow

```text
0 1px 2px rgba(0,0,0,0.04)
```

Rule

Use shadows sparingly.

Prefer:

* Borders
* Contrast
* Structure

Over elevation.

---

# Icons

Library

```text
lucide-react
```

Sizes

```text
16px
20px
24px
```

Use consistently.

---

# Dark Mode

Status

Implemented

Architecture

```text
CSS Variables
Tailwind Mapping
html.dark
LocalStorage Persistence
```

Coverage Required

* Landing
* Authentication
* App Shell
* Sidebar
* Navbar
* Jobs
* Candidates
* Clients
* Sheets
* Dialogs
* Dropdowns
* Toasts

All future components must support both themes.

---

# Known Exceptions

Allowed Brand Colors

* Google
* LinkedIn

These may retain official brand colors.

---

# Design Freeze

Approved

* Typography System
* Spacing System
* Layout System
* Radius System
* Light Theme
* Dark Theme
* Color System
* Sheet System

Future Revisit

* Brand refresh
* Additional themes
* Alternative accent colors

---

# Development Rule

Before creating any new component:

1. Use existing typography tokens.
2. Use existing spacing tokens.
3. Use existing color tokens.
4. Use existing radius tokens.
5. Support light mode.
6. Support dark mode.
7. Follow established interaction patterns.

Consistency is preferred over local optimization.