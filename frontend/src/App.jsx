import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import PersonalPage from "./components/PersonalPage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="page-container">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/sharelink" element={<ShareLinkPage />} />
            <Route path="/link" element={<LinkPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
