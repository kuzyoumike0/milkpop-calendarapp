import React from "react";
import { Link } from "react-router-dom";

export default function ShareLinkPage({ link }) {
  if (!link) return null;

  return (
    <div className="flex justify-center mt-10">
      <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-2xl p-6 max-w-lg text-center">
        <h2 className="text-2xl font-bold text-[#004CA0] mb-4">
          ✅ 共有リンクが発行されました
        </h2>
        <p className="text-gray-100 mb-6">
          下のボタンからコピーしたり、そのままページに移動できます。
        </p>

        {/* リンクURLのコピー部分 */}
        <div className="flex items-center justify-between bg-black/30 rounded-xl px-4 py-2 text-sm text-white shadow-inner">
          <span className="truncate">
            {`${window.location.origin}/share/${link}`}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/share/${link}`
              );
              alert("リンクをコピーしました！");
            }}
            className="ml-3 px-3 py-1 rounded-lg bg-[#FDB9C8] hover:bg-[#e39aa8] text-black font-semibold shadow-md transition"
          >
            コピー
          </button>
        </div>

        {/* 移動ボタン */}
        <div className="mt-6">
          <Link
            to={`/share/${link}`}
            className="inline-block px-6 py-3 rounded-xl bg-[#004CA0] text-white font-bold shadow-md hover:bg-[#003380] transition"
          >
            ページへ移動
          </Link>
        </div>
      </div>
    </div>
  );
}
