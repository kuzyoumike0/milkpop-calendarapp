import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Layoutで全ページ共通UI（ヘッダー等）をラップ */}
        <Route element={<Layout />}>
          <Route path="/" element={<TopPage />} />
          <Route path="/link" element={<LinkPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share/:linkid" element={<SharePage />} />
          <Route path="/sharelink/:linkid" element={<ShareLinkPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
