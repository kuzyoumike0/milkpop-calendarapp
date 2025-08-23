// frontend/src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";

function App() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/share/:id" element={<SharePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
