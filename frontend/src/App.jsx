import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./TopPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopPage />} />
      </Routes>
    </Router>
  );
}
