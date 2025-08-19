import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import ShareLinkPage from "./components/ShareLinkPage";
import SharePage from "./components/SharePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/link" element={<ShareLinkPage />} />
        <Route path="/share/:linkId" element={<SharePage />} />
      </Routes>
    </Router>
  );
}
