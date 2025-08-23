import React, { useState, useEffect } from "react";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [schedules, setSchedules] = useState([]);

  // ===== 登録 =====
  const handleSave = async () => {
    if (!title || !date) {
      alert("タイトルと日付を入力してください");
      return;
    }
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");

      setTitle("");
      setDate("");
      fetchSchedules(); // 更新
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    }
  };

  // ===== 一覧取得（古い順にソート） =====
  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      // 古い順 → 新しい順
      const sorted = data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setSchedules(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  // ===== 削除 =====
  const handleDelete = async (id) => {
    if (!window.confirm("この日程を削除しますか？")) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("削除エラー");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="register-page">
      <div className="banner">📅 日程登録ページ</div>

      <div className="register-layout">
        {/* ===== カレンダーエリア（左7割） ===== */}
        <div className="calendar-section">
          <div className="card">
            <h2>カレンダー</h2>
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                placeholder="タイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button className="save-btn" onClick={handleSave}>
              登録する
            </button>
          </div>
        </div>

        {/* ===== 登録済みリスト（右3割） ===== */}
        <div className="schedule-section">
          <h2>登録済み日程</h2>
          {schedules.length > 0 ? (
            schedules.map((s) => (
              <div key={s.id} className="schedule-card">
                <span className="schedule-title">{s.title}</span>
                <span className="date-tag">
                  {new Date(s.date).toLocaleDateString()}
                </span>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(s.id)}
                >
                  ✖
                </button>
              </div>
            ))
          ) : (
            <p>まだ日程が登録されていません</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
