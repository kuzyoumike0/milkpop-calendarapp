// frontend/src/components/ShareLinkPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ShareLinkPage = () => {
  const [links, setLinks] = useState([]);

  // ===== 共有リンク取得 =====
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch("/api/share-links");
        const data = await res.json();
        setLinks(data);
      } catch (err) {
        console.error("Error fetching share links:", err);
      }
    };
    fetchLinks();
  }, []);

  // ===== URLコピー =====
  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    alert("URLをコピーしました！");
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
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-6 text-[#FDB9C8]">
          発行された共有リンク一覧
        </h2>

        {links.length === 0 ? (
          <p className="text-gray-400">まだ共有リンクは発行されていません。</p>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-[#1a1a1a] rounded-xl shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg text-[#FDB9C8]">
                    {link.title || "タイトルなし"}
                  </p>
                  <p className="text-gray-300">{link.url}</p>
                </div>
                <button
                  onClick={() => handleCopy(link.url)}
                  className="px-4 py-2 rounded-lg bg-[#FDB9C8] text-black font-bold hover:opacity-80"
                >
                  コピー
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShareLinkPage;
