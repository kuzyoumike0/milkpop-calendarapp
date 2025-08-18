import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TopPage from "./TopPage";
import PersonalPage from "./PersonalPage";
import SharePage from "./SharePage";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/personal" element={<PersonalPage />} />
      <Route path="/share/:id" element={<SharePage />} />
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>
);
