import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./pages/TopPage";
import PersonalPage from "./pages/PersonalPage";
import SharedPage from "./pages/SharedPage";
import Banner from "./components/Banner";

export default function App() {
  return (
    <Router>
      <div className="app">
        <Banner />
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/shared" element={<SharedPage />} />
        </Routes>
      </div>
    </Router>
  );
}
