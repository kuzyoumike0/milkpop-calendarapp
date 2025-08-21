// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Router>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/link" element={<LinkPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share/:linkid" element={<SharePage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
