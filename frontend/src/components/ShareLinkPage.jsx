import React from "react";

export default function ShareLinkPage({ link }) {
  const shareUrl = `${window.location.origin}/share/${link}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("リンクをコピーしました！");
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-bold text-white mb-4 drop-shadow">
          ✅ 共有リンクが発行されました
        </h2>

        {/* リンク部分 */}
        <div className="flex items-center justify-between gap-2 bg-black/30 text-white px-4 py-2 rounded-lg shadow-inner">
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
            className="px-3 py-1 text-xs rounded-lg bg-[#FDB9C8] text-black font-bold shadow hover:bg-[#fda5b7] transition"
          >
            コピー
          </button>
        </div>

        {/* 補足メッセージ */}
        <p className="mt-3 text-sm text-gray-200">
          このリンクを参加者に共有してください
        </p>
      </div>
    </div>
  );
}
