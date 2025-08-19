import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import ShareLinkPage from "./components/ShareLinkPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/links/:linkId" element={<ShareLinkPage />} />
      </Routes>
    </Router>
  );
}
