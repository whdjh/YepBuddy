import primitiveTokens from "../../mobile/src/tokens/primitive.json"
import semanticTokens from "../../mobile/src/tokens/semantic.json"
import componentTokens from "../../mobile/src/tokens/component.json"

export const mobilePrimitiveTokens = primitiveTokens
export const mobileSemanticTokens = semanticTokens
export const mobileComponentTokens = componentTokens

export type MobilePrimitiveTokens = typeof mobilePrimitiveTokens
export type MobileSemanticTokens = typeof mobileSemanticTokens
export type MobileComponentTokens = typeof mobileComponentTokens

