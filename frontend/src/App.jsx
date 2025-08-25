import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./TopPage";
import RegisterPage from "./RegisterPage";
import PersonalPage from "./PersonalPage";
import SharePage from "./SharePage";
import Header from "./Header";
import Footer from "./Footer";

/* ✅ CSS のルート修正 */
import "./common.css";  

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share/:token" element={<SharePage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
