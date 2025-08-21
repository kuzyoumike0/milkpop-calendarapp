import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import TopPage from "./components/TopPage";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "black",
        color: "white",
        fontFamily: "Poppins, 'Noto Sans JP', sans-serif",
      },
    },
  },
  colors: {
    brand: {
      pink: "#FDB9C8",
      blue: "#004CA0",
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <TopPage />
    </ChakraProvider>
  );
}

export default App;
