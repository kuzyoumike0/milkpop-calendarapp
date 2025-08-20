import React, { useState } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  // 日付追加（シンプル例）
  const addDate = () => {
    const today = new Date().toISOString().split("T")[0];
    if (!dates.includes(today)) {
      setDates([...dates, today]);
    }
  };

  // リンク発行
  const generateLink = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/schedules", {
        title,
        memo,
        dates,
      });
      setLink(`${window.location.origin}/share/${res.data.linkid}`);
    } catch (err) {
      alert("リンク発行に失敗しました");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#FDB9C8] mb-6">個人スケジュール登録</h1>

      {/* タイトル入力 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
        />
      </div>

      {/* メモ入力 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8] min-h-[100px]"
        />
      </div>

      {/* 日程追加 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-gray-300 mb-2">候補日</p>
        <button
          onClick={addDate}
          className="bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-2 px-4 rounded-xl transition"
        >
          今日を追加
        </button>
        <div className="mt-3 text-gray-400">
          {dates.length > 0 ? dates.join(", ") : "未選択"}
        </div>
      </div>

      {/* リンク発行ボタン */}
      <button
        onClick={generateLink}
        disabled={loading}
        className="w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-3 px-6 rounded-xl transition"
      >
        {loading ? "発行中..." : "共有リンクを発行"}
      </button>

      {/* 発行されたリンク表示 */}
      {link && (
        <div className="mt-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#FDB9C8] mb-2">発行されたリンク</h2>
          <div className="flex items-center justify-between">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 underline break-all"
            >
              {link}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(link)}
              className="ml-3 bg-[#FDB9C8] text-black font-bold py-2 px-4 rounded-xl hover:bg-[#004CA0] hover:text-white transition"
            >
              コピー
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
