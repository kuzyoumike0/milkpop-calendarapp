import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./TopPage";
import PersonalPage from "./PersonalPage";
import SharePage from "./SharePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share/:shareId" element={<SharePage />} />
      </Routes>
    </Router>
  );
}

export default App;
