import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import RegisterPage from "./components/RegisterPage";

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
          <Route path="/register" element={<RegisterPage />} /> {/* 日程登録ページ */}
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
