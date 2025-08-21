import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-pink-500 text-white p-4">
        <h1 className="text-xl font-bold">
          <Link to="/">MilkPOP Calendar</Link>
        </h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 mt-10">
        <p>© 2025 MilkPOP Calendar</p>
      </footer>
    </div>
  );
}
