import React from "react";
import { Link } from "react-router-dom";

export default function ShareLinkPage({ link }) {
  const shareUrl = `${window.location.origin}/share/${link}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("📋 リンクをコピーしました！");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* バナー */}
      <header className="w-full bg-black/40 backdrop-blur-md shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white drop-shadow">
          MilkPOP Calendar
        </h1>
        <nav className="flex gap-4">
          <Link to="/personal" className="text-white hover:text-[#FDB9C8] transition">
            個人スケジュール
          </Link>
          <Link to="/link" className="text-white hover:text-[#FDB9C8] transition">
            共有スケジュール
          </Link>
        </nav>
      </header>

      {/* メイン */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="backdrop-blur-lg bg-white/20 border border-white/30 
                        rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-6 drop-shadow">
            ✅ 共有リンクが発行されました
          </h2>

          {/* リンク表示エリア */}
          <div className="flex items-center justify-between gap-2 
                          bg-black/30 text-white px-4 py-2 rounded-lg shadow-inner">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate underline hover:text-[#FDB9C8] transition text-sm"
            >
              {shareUrl}
            </a>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs rounded-lg 
                         bg-[#FDB9C8] text-black font-bold shadow 
                         hover:bg-[#fda5b7] transition"
            >
              コピー
            </button>
          </div>

          {/* 補足メッセージ */}
          <p className="mt-4 text-sm text-gray-200">
            このリンクを参加者に共有してください ✨
          </p>
        </div>
      </main>
    </div>
  );
}
