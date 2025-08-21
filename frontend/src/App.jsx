// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TopPage />} />
        <Route path="link" element={<LinkPage />} />
        <Route path="personal" element={<PersonalPage />} />
        <Route path="share/:linkid" element={<SharePage />} />
        <Route path="sharelink/:linkid" element={<ShareLinkPage />} />
      </Route>
    </Routes>
  );
}

export default App;
