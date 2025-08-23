import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterPage from "./pages/RegisterPage";
import TopPage from "./pages/TopPage";
import SharePage from "./pages/SharePage";

function App() {
  return (
    <div className="app">
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
