import { useUnstableNativeVariable } from "nativewind"

type ColorToken = {
  fallback: string
  variable: string
}

export function useResolvedColorToken(
  variableOrToken: string | ColorToken,
  fallback?: string,
) {
  const variable =
    typeof variableOrToken === "string"
      ? variableOrToken
      : variableOrToken.variable
  const resolvedFallback =
    typeof variableOrToken === "string"
      ? (fallback ?? "")
      : variableOrToken.fallback

  return (
    (useUnstableNativeVariable(variable) as unknown as string) ||
    resolvedFallback
  )
}
