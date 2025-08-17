import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import TopPage from "./pages/TopPage";
import PersonalPage from "./pages/PersonalPage";
import SharedPage from "./pages/SharedPage";

export default function App() {
  return (
    <>
      <div className="banner">MilkpopCalendar</div>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/shared" element={<SharedPage />} />
      </Routes>
    </>
  );
}
