import React from "react";
import LinksSection from "./LinksSection.jsx";
function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="py-6 text-center text-3xl font-extrabold text-pink-300">
        🌸 Calendar App
      </header>
      <main>
        <LinksSection />
      </main>
    </div>
  );
}

export default App;
