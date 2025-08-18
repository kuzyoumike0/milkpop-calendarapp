import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import PersonalPage from "./components/PersonalPage";
import LinkPage from "./components/LinkPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/share/:id" element={<ShareLinkPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/link/:id" element={<LinkPage />} />
        <Route path="*" element={<TopPage />} />
      </Routes>
    </Router>
  );
}
