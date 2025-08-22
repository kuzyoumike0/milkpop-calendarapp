import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      pink: "#FDB9C8",
      blue: "#004CA0",
      black: "#000000",
    },
  },
  styles: {
    global: {
      body: {
        bg: "brand.black",
        color: "white",
      },
    },
  },
});

export default theme;
