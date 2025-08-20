import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import App from "./App";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <App>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/link" element={<LinkPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share/:linkid" element={<SharePage />} />
        <Route path="/sharelink" element={<ShareLinkPage />} />
      </Routes>
    </App>
  </Router>
);
