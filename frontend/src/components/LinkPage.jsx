// frontend/src/components/LinkPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LinkPage = () => {
  const [inputUrl, setInputUrl] = useState("");
  const navigate = useNavigate();

  const handleGo = () => {
    if (!inputUrl.trim()) {
      alert("共有リンクを入力してください");
      return;
    }

    try {
      // URLから shareId を抽出
      const urlObj = new URL(inputUrl);
      const parts = urlObj.pathname.split("/");
      const shareId = parts[parts.length - 1];
      if (!shareId) {
        alert("リンクが正しくありません");
        return;
      }
      navigate(`/share/${shareId}`);
    } catch (err) {
      alert("有効なURLを入力してください");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* ===== バナー ===== */}
      <header className="bg-[#004CA0] text-white py-4 shadow-md flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link
            to="/register"
            className="px-3 py-2 rounded-lg bg-[#FDB9C8] text-black font-semibold hover:opacity-80"
          >
            日程登録ページ
          </Link>
          <Link
            to="/personal"
            className="px-3 py-2 rounded-lg bg-[#FDB9C8] text-black font-semibold hover:opacity-80"
          >
            個人スケジュール
          </Link>
        </nav>
      </header>

      {/* ===== 本体 ===== */}
      <main className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold mb-6 text-[#FDB9C8]">共有リンクからアクセス</h2>

        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="共有リンクを入力してください"
          className="w-full p-3 rounded-lg text-black mb-4"
        />
        <button
          onClick={handleGo}
          className="px-6 py-3 rounded-xl bg-[#FDB9C8] text-black font-bold shadow-lg hover:opacity-80"
        >
          開く
        </button>
      </main>
    </div>
  );
};

export default LinkPage;
