import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/share/:linkId" element={<ShareLinkPage />} />
        <Route path="*" element={<TopPage />} />
      </Routes>
    </Router>
  );
}
