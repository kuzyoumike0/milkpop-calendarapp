// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/personal" element={<PersonalPage />} />
      <Route path="/share/:shareId" element={<SharePage />} />
      <Route path="/share-links" element={<ShareLinkPage />} />
      <Route path="/link" element={<LinkPage />} />
    </Routes>
  );
}

export default App;
