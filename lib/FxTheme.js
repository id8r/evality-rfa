/*
lib/FxTheme.js | Visual design tokens and Tailwind class recipes | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

export const FONT_FAMILY =
  'font-[Inter,ui-sans-serif,system-ui,"Segoe_UI",Helvetica,Arial,sans-serif]';

export const TYPE = {
  display: "text-[36px] leading-[40px] font-semibold",
  h1: "text-[30px] leading-[36px] font-medium",
  h2: "text-[24px] leading-[32px] font-medium",
  h3: "text-[20px] leading-[28px] font-medium",
  bodyLg: "text-[16px] leading-[24px] font-normal",
  body: "text-[14px] leading-[22px] font-normal",
  small: "text-[13px] leading-[20px] font-normal",
  caption: "text-[12px] leading-[18px] font-normal",
  button: "text-[14px] leading-[22px] font-medium",
};

export const COLORS = {
  bg: "bg-[var(--fx-bg)]",
  bgSoft: "bg-[var(--fx-bg-soft)]",
  text: "text-[var(--fx-text)]",
  textMuted: "text-[var(--fx-text-muted)]",
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
  card: "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
  dialog: "shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
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
  md: "h-[38px]",
  lg: "h-[38px]",
};

export const SURFACE = {
  page: `${COLORS.bg} ${COLORS.text}`,
  card: `border ${COLORS.border} ${COLORS.bg} text-[var(--fx-text)]`,
  mutedText: COLORS.textMuted,
  header: `border-b ${COLORS.border} bg-[var(--fx-bg)]/85 backdrop-blur-md`,
  overlay: "bg-black/[0.04]",
  subtleButton: "bg-[var(--fx-bg-soft)]",
};

export const FX_COLORS = COLORS;
export const FX_TYPE = TYPE;
export const FX_RADIUS = RADIUS;
export const FX_SHADOW = SHADOWS;
export const FX_SPACE = SPACE;
export const FX_BUTTON_HEIGHT = BUTTON_HEIGHT;
export const FX_SURFACE = SURFACE;

/* - - - - - - - - - - - - - - - - */
