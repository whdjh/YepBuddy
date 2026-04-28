import type { ReactNode } from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface MainProps {
  children: ReactNode
  className?: string
}

export function Main({ children, className }: MainProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className={`h-full w-full bg-yb-bg ${className ?? ""}`}
      style={{ paddingTop: insets.top }}
    >
      {children}
    </View>
  )
}
