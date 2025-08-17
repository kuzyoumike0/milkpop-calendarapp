import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100">
      <Navbar />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
