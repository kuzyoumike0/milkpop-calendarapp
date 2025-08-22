import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/share" element={<RegisterPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/sharelink/:id" element={<SharePage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
