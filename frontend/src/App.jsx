// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="page-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/share" element={<RegisterPage />} />
            <Route path="/personal" element={<PersonalPage />} />
          </Routes>
        </main>
        <Footer /> {/* ← フッターを共通表示 */}
      </div>
    </Router>
  );
}

export default App;
