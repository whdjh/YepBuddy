import primitiveTokens from "@/tokens/primitive.json"

export const primitive = primitiveTokens

export const primitiveColors = primitive.color
export const primitiveFont = primitive.font
export const primitiveSpacing = primitive.spacing
export const primitiveRadius = primitive.radius
export const primitiveSize = primitive.size
export const primitiveBorderWidth = primitive.borderWidth
export const primitiveShadow = primitive.shadow
export const primitiveDarkShadow = primitive["shadow-dark"]
export const primitiveGlass = primitive.glass

export const semanticColorTokens = {
  bg: {
    variable: "--yb-bg",
    fallback: primitiveColors.cream["50"],
  },
  fg: {
    variable: "--yb-fg",
    fallback: primitiveColors.earth["300"],
  },
  accent: {
    variable: "--yb-accent",
    fallback: primitiveColors.khaki["300"],
  },
  surface: {
    variable: "--yb-surface",
    fallback: primitiveColors.white,
  },
  surfaceMuted: {
    variable: "--yb-surface-muted",
    fallback: primitiveColors.cream["200"],
  },
  onAccent: {
    variable: "--yb-on-accent",
    fallback: primitiveColors.cream["50"],
  },
  onStrong: {
    variable: "--yb-on-strong",
    fallback: primitiveColors.cream["50"],
  },
  glassBg: {
    variable: "--yb-glass-bg",
    fallback: "rgba(255,255,255,0.65)",
  },
  ringTrack: {
    variable: "--yb-ring-track",
    fallback: primitiveColors.cream["200"],
  },
  ringFill: {
    variable: "--yb-ring-fill",
    fallback: primitiveColors.khaki["300"],
  },
  iconTint: {
    variable: "--yb-icon-tint",
    fallback: primitiveColors.khaki["300"],
  },
  heart: {
    variable: "--yb-heart",
    fallback: primitiveColors.error["600"],
  },
  statusSuccess: {
    variable: "--yb-status-success",
    fallback: primitiveColors.success["500"],
  },
  statusError: {
    variable: "--yb-status-error",
    fallback: primitiveColors.error["500"],
  },
  statusSuccessText: {
    variable: "--yb-status-success-text",
    fallback: primitiveColors.success["700"],
  },
} as const

export const cardColorTokens = {
  fg: {
    variable: "--yb-fg",
    fallback: primitiveColors.earth["300"],
  },
  fgSecondary: {
    variable: "--yb-fg-secondary",
    fallback: primitiveColors.khaki["400"],
  },
  fgDisabled: {
    variable: "--yb-fg-disabled",
    fallback: primitiveColors.neutral["400"],
  },
  accent: {
    variable: "--yb-accent",
    fallback: primitiveColors.khaki["300"],
  },
  fillPale: {
    variable: "--yb-fill-pale",
    fallback: primitiveColors.sand["50"],
  },
  glassTint: {
    variable: "--yb-surface",
    fallback: primitiveColors.white,
  },
} as const

export const statusColorTokens = {
  success: {
    bg: "--yb-status-success-bg",
    fg: "--yb-status-success-text",
    fallbackBg: primitiveColors.success["50"],
    fallbackFg: primitiveColors.success["700"],
  },
  info: {
    bg: "--yb-status-info-bg",
    fg: "--yb-status-info-text",
    fallbackBg: primitiveColors.info["50"],
    fallbackFg: primitiveColors.info["700"],
  },
  error: {
    bg: "--yb-status-error-bg",
    fg: "--yb-status-error-text",
    fallbackBg: primitiveColors.error["50"],
    fallbackFg: primitiveColors.error["700"],
  },
} as const

export const appAccentColor = primitiveColors.khaki["300"]
