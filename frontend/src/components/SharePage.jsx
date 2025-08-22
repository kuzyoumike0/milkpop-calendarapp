// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const SharePage = () => {
  const { shareId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});
  const [userName, setUserName] = useState("");

  // ===== データ取得 =====
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(`/api/share/${shareId}`);
        const data = await res.json();

        // 日付順にソート
        const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSchedules(sorted);
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };
    fetchSchedules();
  }, [shareId]);

  // ===== 参加可否選択 =====
  const handleSelect = (scheduleId, value) => {
    setResponses((prev) => ({
      ...prev,
      [scheduleId]: value,
    }));
  };

  // ===== 保存 =====
  const handleSave = async () => {
    if (!userName.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      await fetch(`/api/share/${shareId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          responses,
        }),
      });

      // 即反映のために再取得
      const res = await fetch(`/api/share/${shareId}`);
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setSchedules(sorted);

      alert("保存しました！");
    } catch (err) {
      console.error("Error saving responses:", err);
      alert("エラーが発生しました");
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
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-6 text-[#FDB9C8]">共有スケジュール</h2>

        {/* 名前入力 */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-300">あなたの名前：</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg text-black"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="例: 山田太郎"
          />
        </div>

        {/* スケジュール一覧 */}
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-[#1a1a1a] rounded-xl shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-lg text-[#FDB9C8]">
                  {schedule.title || "タイトルなし"}
                </p>
                <p className="text-gray-300">
                  {new Date(schedule.date).toLocaleDateString("ja-JP")}{" "}
                  ({schedule.type})
                </p>
              </div>
              <select
                className="p-2 rounded-lg text-black"
                value={responses[schedule.id] || ""}
                onChange={(e) => handleSelect(schedule.id, e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="〇">〇</option>
                <option value="✖">✖</option>
              </select>
            </div>
          ))}
        </div>

        {/* 保存ボタン */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-[#FDB9C8] text-black font-bold shadow-lg hover:opacity-80"
          >
            保存
          </button>
        </div>
      </main>
    </div>
  );
};

export default SharePage;
