import React from "react";
import LinksSection from "./components/LinksSection";

function App() {
  const links = [
    { url: "https://example.com", label: "公式サイト", description: "外部リンク" },
    { url: "/schedule", label: "スケジュール", description: "日程を確認" },
  ];

  return (
    <div className="min-h-screen bg-luxuryblack text-white">
      <header className="py-6 text-center text-3xl font-extrabold text-pink">
        🌸 MilkPOP Calendar
      </header>
      <main>
        <LinksSection links={links} />
      </main>
    </div>
  );
}

export default App;
