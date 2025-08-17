import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TopPage from "./pages/TopPage";
import PersonalPage from "./pages/PersonalPage";
import SharedPage from "./pages/SharedPage";

export default function App() {
  return (
    <BrowserRouter>
      <header style={{backgroundColor:"#004CA0", color:"white", padding:"10px", fontSize:"24px", fontWeight:"bold"}}>
        MilkpopCalendar
        <nav style={{marginTop:"5px"}}>
          <Link to="/" style={{marginRight:"15px", color:"white"}}>トップ</Link>
          <Link to="/personal" style={{marginRight:"15px", color:"white"}}>個人スケジュール</Link>
          <Link to="/shared" style={{color:"white"}}>共有スケジュール</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/shared" element={<SharedPage />} />
      </Routes>
    </BrowserRouter>
  );
}
