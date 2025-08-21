import React from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 text-center text-2xl font-bold">
        MilkPOP Calendar
      </header>
      <main className="p-6">
        <Outlet /> {/* ← これが必須 */}
      </main>
    </div>
  );
}
