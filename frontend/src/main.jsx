import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import PersonalSchedule from "./pages/PersonalSchedule";
import SharedCalendar from "./pages/SharedCalendar";
import ShareLink from "./pages/ShareLink";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/personal" element={<PersonalSchedule />} />
        <Route path="/shared" element={<SharedCalendar />} />
        <Route path="/share" element={<ShareLink />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
