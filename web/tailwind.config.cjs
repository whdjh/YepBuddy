const tokens = require("./src/tokens/web.json")

module.exports = {
  theme: {
    extend: {
      colors: tokens.color,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      spacing: tokens.spacing,
      maxWidth: tokens.maxWidth,
      borderRadius: tokens.borderRadius,
      borderWidth: tokens.borderWidth,
      boxShadow: tokens.boxShadow,
      backgroundImage: tokens.backgroundImage,
      aspectRatio: tokens.aspectRatio,
      screens: tokens.screens,
      transitionDuration: tokens.transitionDuration,
    },
  },
}
