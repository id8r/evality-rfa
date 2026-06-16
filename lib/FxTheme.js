/*
lib/FxTheme.js | Visual design tokens and Tailwind class recipes | Sree | 2026-06-10
*/

export const FONT_FAMILY =
  'font-[Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe_UI",Roboto,Helvetica,Arial,sans-serif]';

export const TYPE = {
  hero: "text-[36px] leading-[44px] font-semibold",
  display: "text-[36px] leading-[44px] font-semibold",
  h1: "text-[28px] leading-[36px] font-semibold",
  h2: "text-[24px] leading-[32px] font-semibold",
  h3: "text-[20px] leading-[28px] font-semibold",
  pageTitle: "text-[28px] leading-[36px] font-semibold",
  navTitle: "text-[24px] leading-[36px] font-semibold",
  workspaceTitle: "text-[24px] leading-[32px] font-semibold",
  workspaceSubtitle: "text-[14px] leading-[22px] font-normal",
  sectionTitle: "text-[20px] leading-[28px] font-semibold",
  sectionSubtitle: "text-[14px] leading-[22px] font-normal",
  fieldLabel: "text-[13px] leading-[20px] font-normal",
  fieldHint: "text-[13px] leading-[20px] font-normal",
  input: "text-[14px] leading-[22px] font-normal",
  tableHeader: "text-[12px] leading-[18px] font-medium",
  tableCell: "text-[14px] leading-[22px] font-normal",
  clickableData: "text-[14px] leading-[22px] font-medium",
  stepLabel: "text-[13px] leading-[20px] font-medium",
  stepCounter: "text-[12px] font-medium",
  sheetTitle: "text-[20px] leading-[28px] font-medium",
  sheetSubtitle: "text-[13px] leading-[20px] font-normal",
  dialogTitle: "text-[24px] leading-[32px] font-semibold",
  dialogSubtitle: "text-[14px] leading-[22px] font-normal",
  toastTitle: "text-[14px] leading-[20px] font-medium",
  toastDescription: "text-[13px] leading-[20px] font-normal",
  bodyLg: "text-[14px] leading-[22px] font-normal",
  body: "text-[14px] leading-[22px] font-normal",
  small: "text-[13px] leading-[20px] font-normal",
  caption: "text-[11px] leading-[16px] font-normal",
  button: "text-[14px] leading-[22px] font-medium",
  metaLabel: "text-[12px] leading-[18px] font-medium",
  cardTitle: "text-[16px] leading-[24px] font-semibold",
  cardSubtitle: "text-[14px] leading-[22px] font-normal",
  dropdownHeader: "text-[12px] leading-[18px] font-medium camelcase",
  dropdownItem: "text-[14px] leading-[22px] font-normal",
  sidebarName: "text-[14px] leading-[22px] font-medium",
  sidebarEmail: "text-[13px] leading-[20px] font-normal",
  emptyStateTitle: "text-[16px] leading-[24px] font-semibold",
  emptyStateBody: "text-[14px] leading-[22px] font-normal",
};

export const TYPOGRAPHY = {
  fontFamily: FONT_FAMILY,
  hero: TYPE.hero,
  display: TYPE.display,
  h1: TYPE.h1,
  h2: TYPE.h2,
  h3: TYPE.h3,
  pageTitle: TYPE.pageTitle,
  navTitle: TYPE.navTitle,
  workspaceTitle: TYPE.workspaceTitle,
  workspaceSubtitle: TYPE.workspaceSubtitle,
  sectionTitle: TYPE.sectionTitle,
  sectionSubtitle: TYPE.sectionSubtitle,
  fieldLabel: TYPE.fieldLabel,
  fieldHint: TYPE.fieldHint,
  input: TYPE.input,
  tableHeader: TYPE.tableHeader,
  tableCell: TYPE.tableCell,
  clickableData: TYPE.clickableData,
  stepLabel: TYPE.stepLabel,
  stepCounter: TYPE.stepCounter,
  sheetTitle: TYPE.sheetTitle,
  sheetSubtitle: TYPE.sheetSubtitle,
  dialogTitle: TYPE.dialogTitle,
  dialogSubtitle: TYPE.dialogSubtitle,
  toastTitle: TYPE.toastTitle,
  toastDescription: TYPE.toastDescription,
  bodyLg: TYPE.bodyLg,
  body: TYPE.body,
  small: TYPE.small,
  caption: TYPE.caption,
  metaLabel: TYPE.metaLabel,
  button: TYPE.button,
  cardTitle: TYPE.cardTitle,
  cardSubtitle: TYPE.cardSubtitle,
  dropdownHeader: TYPE.dropdownHeader,
  dropdownItem: TYPE.dropdownItem,
  sidebarName: TYPE.sidebarName,
  sidebarEmail: TYPE.sidebarEmail,
  emptyStateTitle: TYPE.emptyStateTitle,
  emptyStateBody: TYPE.emptyStateBody,
};

export const COLORS = {
  bg: "bg-[var(--fx-bg)]",
  bgSoft: "bg-[var(--fx-bg-soft)]",
  surface: "bg-[var(--fx-surface)]",
  surfaceRaised: "bg-[var(--fx-surface-raised)]",
  surfaceHover: "bg-[var(--fx-surface-hover)]",
  surfaceSelected: "bg-[var(--fx-surface-selected)]",
  text: "text-[var(--fx-text)]",
  textMuted: "text-[var(--fx-text-muted)]",
  textDisabled: "text-[var(--fx-text-disabled)]",
  border: "border-[var(--fx-border)]",
  primaryBg: "bg-[var(--fx-primary)]",
  primaryText: "text-[var(--fx-primary)]",
  successText: "text-[var(--fx-success)]",
  warningText: "text-[var(--fx-warning)]",
  dangerText: "text-[var(--fx-danger)]",
};

export const RADIUS = {
  xs: "rounded-[6px]",
  sm: "rounded-[8px]",
  md: "rounded-[12px]",
  lg: "rounded-[16px]",
  xl: "rounded-[20px]",
};

export const SHADOWS = {
  card: "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
  dialog: "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
};

export const SPACE = {
  GAP_8: "gap-[8px]",
  GAP_16: "gap-[16px]",
  GAP_24: "gap-[24px]",
  GAP_32: "gap-[32px]",
  GAP_48: "gap-[48px]",
  P_16: "p-[16px]",
  P_24: "p-[24px]",
  P_32: "p-[32px]",
  P_40: "p-[40px]",
  P_48: "p-[48px]",
  PX_16: "px-[16px]",
  PX_24: "px-[24px]",
  PX_40: "px-[40px]",
  PY_8: "py-[8px]",
  PY_16: "py-[16px]",
  PY_24: "py-[24px]",
  PY_40: "py-[40px]",
  PY_64: "py-[64px]",
  PT_64: "pt-[64px]",
  PT_96: "pt-[96px]",
  PB_16: "pb-[16px]",
};

export const BUTTON_HEIGHT = {
  sm: "h-[30px]",
  md: "h-[34px]",
  lg: "h-[40px]",
};

export const BUTTON_PADDING_X = {
  sm: "px-[12px]",
  md: "px-[14px]",
  lg: "px-[16px]",
};

export const CONTROL_HEIGHT = {
  sm: "h-[34px]",
  md: "h-[40px]",
  lg: "h-[40px]",
};

export const SURFACE = {
  page: `${COLORS.bg} ${COLORS.text}`,
  card: `border ${COLORS.border} ${COLORS.surface} text-[var(--fx-text)]`,
  raised: COLORS.surfaceRaised,
  mutedText: COLORS.textMuted,
  header: `border-b ${COLORS.border} bg-[var(--fx-bg)]/85 backdrop-blur-md`,
  overlay: "bg-slate-950/[0.06] backdrop-blur-[2px]",
  subtleButton: "bg-[var(--fx-surface-hover)]",
};

export const NAVIGATION = {
  itemBase:
    "group relative flex h-[44px] items-center overflow-visible rounded-[8px] transition-[background-color,color,padding,gap] duration-200",
  itemActive: "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]",
  itemInactive: "text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
  iconSlot: "flex w-[24px] shrink-0 items-center justify-center",
  itemLabel: "text-[14px] leading-[20px] font-medium",
  itemPaddingExpanded: "px-[12px]",
  itemPaddingCollapsed: "px-0",
  itemGapExpanded: "gap-[12px]",
  itemGapCollapsed: "justify-center",
  footerSeparator: "border-t border-[color:color-mix(in_srgb,var(--fx-border)_84%,transparent)]",
  footerStack: "space-y-[8px]",
  footerAction:
    "flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-border)_84%,transparent)] bg-[var(--fx-surface)] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
  footerButton: "flex w-full cursor-pointer items-center text-left",
  footerButtonCollapsed: "justify-center",
  footerButtonExpanded: "gap-[12px]",
};

export const LAYOUT = {
  maxContentWidth: "max-w-[1440px]",
  contentWidthNarrow: "max-w-[800px]",
  contentWidthMedium: "max-w-[1200px]",
  contentWidthWide: "max-w-[1440px]",
  landingContentWidth: "max-w-[1200px]",
  authDialogWidth: "max-w-[480px]",
  pagePaddingX: "px-[40px]",
  pagePaddingY: "py-[40px]",
  accountMenuRadius: "!rounded-[16px]",
  navbarHeight: "h-[64px]",
  siteContainer: "mx-auto w-full max-w-[1440px] px-[40px]",
  pageFrame: "mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-[40px]",
  headerRow: "flex items-center justify-between h-[64px]",
  headerShell: "fixed top-0 left-0 z-40 w-full",
  landingMain: "flex min-h-screen items-center pt-[96px]",
  authPageMain: "flex min-h-screen items-center justify-center pt-[64px]",
  appContent: "w-full px-[40px] py-[40px]",
};

export const SHEET = {
  headerHeight: "h-[64px]",
  footerHeight: "h-[56px]",
  bodyPadding: "px-[24px] py-[24px]",
  widthSm: "w-[360px] max-w-none",
  widthMd: "w-[480px] max-w-none",
  widthLg: "w-[640px] max-w-none",
  widthXl: "w-[840px] max-w-none",
  openDurationMs: 280,
  closeDurationMs: 220,
  backdropDurationMs: 220,
  openEaseBezier: "cubic-bezier(0.16, 1, 0.3, 1)",
  closeEaseBezier: "cubic-bezier(0.4, 0, 1, 1)",
  backdropEase: "ease-out",
  contentOpenMotion:
    "data-[state=open]:duration-[280ms] data-[state=open]:ease-[cubic-bezier(0.16,1,0.3,1)]",
  contentCloseMotion:
    "data-[state=closed]:duration-[220ms] data-[state=closed]:ease-[cubic-bezier(0.4,0,1,1)]",
  overlayOpenMotion: "data-[state=open]:duration-[220ms] data-[state=open]:ease-out",
  overlayCloseMotion: "data-[state=closed]:duration-[220ms] data-[state=closed]:ease-out",
  title: TYPE.sheetTitle,
  subtitle: TYPE.sheetSubtitle,
};

export const PANEL = {
  dialogWidth: "max-w-[480px]",
  dialogBodyPadding: "p-[32px]",
  dialogGap: "gap-[24px]",
  dialogRadius: "rounded-[16px]",
  dialogTransition: "duration-[200ms] ease-out",
  sheetBackdrop: SURFACE.overlay,
};

export const TABLE = {
  container:
    `w-full min-w-0 overflow-hidden border ${COLORS.border} ${RADIUS.sm} bg-[var(--fx-surface)]`,
  stickyContainer:
    `flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border ${COLORS.border} ${RADIUS.sm} bg-[var(--fx-surface)]`,
  headerWrap: "shrink-0 overflow-hidden",
  bodyWrap: "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
  headerTable: "w-full table-fixed border-collapse",
  bodyTable: "w-full table-fixed border-collapse",
  headerRowHeight: "h-[48px]",
  headerCell:
    "h-[48px] border-b border-[var(--fx-border)] px-[16px] py-0 align-middle text-left text-[var(--fx-text-muted)]",
  bodyCell: "px-[16px] py-[8px] align-middle text-[var(--fx-text)]",
  row: "odd:bg-[var(--fx-surface)] even:bg-[var(--fx-bg-soft)]/70 hover:bg-[var(--fx-surface-hover)]",
  emptyCell: "px-[16px] py-[16px] text-[var(--fx-text-muted)]",
};

export const FX_COLORS = COLORS;
export const FX_TYPE = TYPE;
export const FX_TYPOGRAPHY = TYPOGRAPHY;
export const FX_RADIUS = RADIUS;
export const FX_SHADOW = SHADOWS;
export const FX_SPACE = SPACE;
export const FX_BUTTON_HEIGHT = BUTTON_HEIGHT;
export const FX_BUTTON_PADDING_X = BUTTON_PADDING_X;
export const FX_CONTROL_HEIGHT = CONTROL_HEIGHT;
export const FX_SURFACE = SURFACE;
export const FX_NAVIGATION = NAVIGATION;
export const FX_LAYOUT = LAYOUT;
export const FX_SHEET = SHEET;
export const FX_PANEL = PANEL;
export const FX_TABLE = TABLE;

/* - - - - - - - - - - - - - - - - */
