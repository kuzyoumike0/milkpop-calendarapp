import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";

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
      <Router>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share" element={<SharePage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
