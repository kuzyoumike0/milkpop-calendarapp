import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import SharedSetup from "./pages/SharedSetup";
import SharedLink from "./pages/SharedLink";
import PersonalSchedule from "./pages/PersonalSchedule";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="setup" element={<SharedSetup />} />
        <Route path="link/:id" element={<SharedLink />} />
        <Route path="personal" element={<PersonalSchedule />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
