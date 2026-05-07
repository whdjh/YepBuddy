import type { ReactNode } from "react"
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { GlassBackground } from "./GlassBackground"

interface GlassSurfaceProps extends Omit<ViewProps, "children"> {
  children: ReactNode
  cornerRadius?: number
  minHeight?: number
  paddingSize?: number
  className?: string
  contentStyle?: StyleProp<ViewStyle>
  fallbackClassName?: string
}

export function GlassSurface({
  children,
  cornerRadius = 16,
  minHeight,
  paddingSize = 0,
  className,
  contentStyle,
  fallbackClassName = "bg-yb-surface/95",
  style,
  ...rest
}: GlassSurfaceProps) {
  return (
    <View
      className={`border border-yb-glass-border${className ? ` ${className}` : ""}`}
      style={[
        styles.container,
        {
          borderRadius: cornerRadius,
          minHeight,
        },
        style,
      ]}
      {...rest}
    >
      <GlassBackground
        cornerRadius={cornerRadius}
        fallbackClassName={fallbackClassName}
      />
      <View
        style={[
          styles.content,
          paddingSize > 0 ? { padding: paddingSize } : null,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  content: {
    width: "100%",
  },
})
