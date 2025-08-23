import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const TopPage = () => {
  return (
    <div className="bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col items-center px-6 pb-20">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-12 text-center space-y-10 mt-20">
          {/* 見出し */}
          <h2 className="text-3xl font-bold text-[#004CA0]">
            予定管理が簡単にできます！
          </h2>

          {/* ロゴ画像 */}
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="MilkPOP Calendar ロゴ"
              className="top-logo rounded-2xl shadow-2xl"
            />
      </main>

      <Footer />
    </div>
  );
};

export default TopPage;
