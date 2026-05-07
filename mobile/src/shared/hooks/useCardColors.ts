import { cardColorTokens } from "@/shared/lib/designTokens"
import { useResolvedColorToken } from "./useResolvedColorToken"

// 현재 NativeWind/CSS 변수 스코프에서 카드 색상 하나를 해석한다.
function useColorToken(
  token: (typeof cardColorTokens)[keyof typeof cardColorTokens],
) {
  return useResolvedColorToken(token)
}

// SwiftUI modifier에는 실제 색상값이 필요하므로 semantic CSS 변수를 먼저 읽고,
// 런타임 변수가 없을 때만 primitive token 원천값을 fallback으로 사용한다.
export function useCardColors() {
  return {
    fg: useColorToken(cardColorTokens.fg),
    fgSecondary: useColorToken(cardColorTokens.fgSecondary),
    fgDisabled: useColorToken(cardColorTokens.fgDisabled),
    accent: useColorToken(cardColorTokens.accent),
    fillPale: useColorToken(cardColorTokens.fillPale),
    glassTint: useColorToken(cardColorTokens.glassTint),
  }
}
