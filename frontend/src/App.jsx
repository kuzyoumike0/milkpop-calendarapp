// frontend/src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/share/:id" element={<SharePage />} />
    </Routes>
  );
}

export default App;
