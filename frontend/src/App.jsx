import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import LinkPage from "./components/LinkPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">トップ</Link> | 
        <Link to="/link">日程登録</Link> | 
        <Link to="/personal">個人日程</Link>
      </nav>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/link" element={<LinkPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/sharelink/:id" element={<ShareLinkPage />} />
      </Routes>
    </Router>
  );
}

export default App;
