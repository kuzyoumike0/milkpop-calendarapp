import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import SharedLink from "./components/SharedLink";  // ✅ ファイル名と一致させる
import PersonalPage from "./components/PersonalPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/shared" element={<SharePage />} />
        <Route path="/shared/:linkId" element={<SharedLink />} />
        <Route path="/personal" element={<PersonalPage />} />
      </Routes>
    </Router>
  );
}
