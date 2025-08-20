import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/link" element={<LinkPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/share/:linkid" element={<ShareLinkPage />} />
      </Routes>
    </Router>
  );
}
