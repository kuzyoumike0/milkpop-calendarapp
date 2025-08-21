import React from "react";
import ReactDOM from "react-dom/client";  // ← ここ大事！
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
