import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SharedLinkPage from "./pages/SharedLinkPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shared/:shareId" element={<SharedLinkPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </BrowserRouter>
  );
}
