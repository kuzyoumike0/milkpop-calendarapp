import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      <Header />
      <div className="pt-20 px-4 relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
