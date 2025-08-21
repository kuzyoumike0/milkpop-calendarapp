// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brandPink: "#FDB9C8",
    brandBlue: "#004CA0",
    brandNavy: "#003580", // Hoverや濃いブルー用
    brandGray: "#f5f5f5", // 背景用に追加
  },
  fonts: {
    heading: `'Soleil', sans-serif`,
    body: `'Soleil', sans-serif`,
  },
});

export default theme;
