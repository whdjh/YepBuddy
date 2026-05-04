import primitiveTokens from "@/tokens/primitive.json"
import { useUnstableNativeVariable } from "nativewind"

const PRIMITIVE_COLORS = primitiveTokens.color

// SwiftUI modifier에는 실제 색상값이 필요하므로 semantic CSS 변수를 먼저 읽고,
// 런타임 변수가 없을 때만 primitive token 원천값을 fallback으로 사용한다.
const CARD_COLOR_TOKENS = {
  fg: {
    variable: "--yb-fg",
    fallback: PRIMITIVE_COLORS.earth["300"],
  },
  fgSecondary: {
    variable: "--yb-fg-secondary",
    fallback: PRIMITIVE_COLORS.khaki["400"],
  },
  fgDisabled: {
    variable: "--yb-fg-disabled",
    fallback: PRIMITIVE_COLORS.neutral["400"],
  },
  accent: {
    variable: "--yb-accent",
    fallback: PRIMITIVE_COLORS.khaki["300"],
  },
  fillPale: {
    variable: "--yb-fill-pale",
    fallback: PRIMITIVE_COLORS.sand["50"],
  },
  glassTint: {
    variable: "--yb-surface",
    fallback: PRIMITIVE_COLORS.white,
  },
} as const

// 현재 NativeWind/CSS 변수 스코프에서 카드 색상 하나를 해석한다.
function useColorToken(token: (typeof CARD_COLOR_TOKENS)[keyof typeof CARD_COLOR_TOKENS]) {
  return (
    (useUnstableNativeVariable(token.variable) as unknown as string) ||
    token.fallback
  )
}

// SwiftUI 기반 카드 표면과 입력 필드가 공유하는 카드 팔레트다.
export function useCardColors() {
  return {
    fg: useColorToken(CARD_COLOR_TOKENS.fg),
    fgSecondary: useColorToken(CARD_COLOR_TOKENS.fgSecondary),
    fgDisabled: useColorToken(CARD_COLOR_TOKENS.fgDisabled),
    accent: useColorToken(CARD_COLOR_TOKENS.accent),
    fillPale: useColorToken(CARD_COLOR_TOKENS.fillPale),
    glassTint: useColorToken(CARD_COLOR_TOKENS.glassTint),
  }
}
