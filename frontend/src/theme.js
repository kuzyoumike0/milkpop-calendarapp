// frontend/src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      pink: "#FDB9C8",
      blue: "#004CA0",
      black: "#000000",
      lightPink: "#FFF0F5",
    },
  },
  styles: {
    global: {
      "html, body": {
        margin: 0,
        padding: 0,
        bg: "#FFF0F5",  // 薄いピンク背景
        color: "black",
        fontFamily: "'Zen Maru Gothic', 'M PLUS Rounded 1c', 'Poppins', sans-serif",
        lineHeight: "1.7",
      },
      h1: {
        fontWeight: "bold",
        color: "#ff5fa2",
        textShadow: "1px 1px 4px rgba(0,0,0,0.2)",
      },
      h2: {
        fontWeight: "bold",
        color: "#ff5fa2",
        textShadow: "1px 1px 4px rgba(0,0,0,0.2)",
      },
      header: {
        bgGradient: "linear(90deg, #FDB9C8, #004CA0)",
        color: "white",
      },
      footer: {
        bg: "black",
        color: "white",
      },
    },
  },
});

export default theme;
