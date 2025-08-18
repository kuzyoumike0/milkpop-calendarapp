import React from "react";
import { Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import PersonalPage from "./components/PersonalPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/share" element={<SharePage />} />
      <Route path="/share/:linkId" element={<ShareLinkPage />} />
      <Route path="/personal" element={<PersonalPage />} />
    </Routes>
  );
}
