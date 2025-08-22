// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../index.css"; // CSSを適用

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
    <div className="page-container">
      {/* ===== ヘッダー ===== */}
      <header>
        <div className="logo">MilkPOP Calendar</div>
        <nav className="nav">
          <Link to="/register">日程登録ページ</Link>
          <Link to="/personal">個人スケジュール</Link>
        </nav>
      </header>

      {/* ===== 本体 ===== */}
      <main className="register-layout">
        {/* 左: カレンダー */}
        <section className="calendar-section">
          <h2 className="page-title">📅 カレンダー</h2>
          {/* ここにカレンダーコンポーネントを後で組み込む */}
          <div className="custom-calendar-placeholder">
            カレンダー表示予定エリア
          </div>
        </section>

        {/* 右: スケジュールリスト */}
        <section className="schedule-section">
          <h2 className="page-title">共有スケジュール</h2>

          {/* 名前入力 */}
          <div className="mb-6">
            <label className="block mb-2">あなたの名前：</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-gray-300"
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
                className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg text-pink-500">
                    {schedule.title || "タイトルなし"}
                  </p>
                  <p className="text-gray-500">
                    {new Date(schedule.date).toLocaleDateString("ja-JP")} (
                    {schedule.type})
                  </p>
                </div>
                <select
                  className="vote-select"
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
            <button onClick={handleSave} className="submit-btn">
              保存
            </button>
          </div>
        </section>
      </main>

      {/* ===== フッター ===== */}
      <footer>
        © 2025 MilkPOP Calendar. All rights reserved.
      </footer>
    </div>
  );
};

export default SharePage;
