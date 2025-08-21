import React from "react";
import { ChakraProvider, extendTheme, Box, Heading } from "@chakra-ui/react";
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
      <Box as="header" bg="rgba(0,0,0,0.6)" p={4} textAlign="center" borderBottom="2px solid" borderColor="brand.blue">
        <Heading size="lg" color="brand.pink">MilkPOP Calendar</Heading>
      </Box>
      <TopPage />
    </ChakraProvider>
  );
}

export default App;
