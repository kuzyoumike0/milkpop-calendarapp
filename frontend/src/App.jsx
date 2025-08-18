import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import PersonalPage from "./components/PersonalPage";
import LinkPage from "./components/LinkPage";

function App() {
  return (
    <div>
      <nav style={{ margin: "10px" }}>
        <Link to="/">トップ</Link> |{" "}
        <Link to="/share">共有カレンダー</Link> |{" "}
        <Link to="/personal">個人スケジュール</Link>
      </nav>

      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/link/:id" element={<LinkPage />} />
      </Routes>
    </div>
  );
}

export default App;
