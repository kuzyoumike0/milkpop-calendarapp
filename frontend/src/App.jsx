import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import TopPage from "./components/TopPage";

const theme = extendTheme({
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
