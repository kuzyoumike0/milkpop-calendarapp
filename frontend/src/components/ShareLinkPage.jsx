import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectMode, setSelectMode] = useState("range"); // "range" or "multi"
  const [selectedDates, setSelectedDates] = useState([]);

  const [username, setUsername] = useState("ゲスト");
  const [mode, setMode] = useState("全日");

  // === DBからスケジュール取得 ===
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/shared/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
      setError("予定を取得できませんでした");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  // === カレンダー選択処理 ===
  const handleDateChange = (date) => {
    if (selectMode === "range" && Array.isArray(date)) {
      // 範囲選択
      const [start, end] = date;
      const dates = [];
      const cur = new Date(start);
      while (cur <= end) {
        dates.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDates(dates);
    } else if (selectMode === "multi") {
      // 複数選択
      let newDates = Array.isArray(selectedDates) ? [...selectedDates] : [];
      const exists = newDates.some(
        (d) => new Date(d).toDateString() === new Date(date).toDateString()
      );
      if (exists) {
        newDates = newDates.filter(
          (d) => new Date(d).toDateString() !== new Date(date).toDateString()
        );
      } else {
        newDates.push(date);
      }
      setSelectedDates(newDates);
    } else {
      setSelectedDates([date]);
    }
  };

  // === 保存処理 ===
  const handleSave = async () => {
    if (!username || selectedDates.length === 0) {
      alert("名前と日付を選択してください");
      return;
    }

    try {
      await axios.post(`/api/shared/${linkId}`, {
        username,
        mode,
        dates: selectedDates.map((d) =>
          new Date(d).toISOString().split("T")[0]
        ),
      });

      alert("保存しました！");
      setSelectedDates([]);
      fetchSchedules();
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      <p>リンクID: {linkId}</p>

      {/* === ユーザー名入力 + 時間帯選択 === */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          名前:{" "}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          時間帯:{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="全日">全日</option>
            <option value="朝">朝</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
        </label>
      </div>

      {/* === モード切替ラジオボタン === */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="radio"
            value="range"
            checked={selectMode === "range"}
            onChange={(e) => setSelectMode(e.target.value)}
          />
          範囲選択
        </label>
        <label style={{ marginLeft: "15px" }}>
          <input
            type="radio"
            value="multi"
            checked={selectMode === "multi"}
            onChange={(e) => setSelectMode(e.target.value)}
          />
          複数選択
        </label>
      </div>

      {/* === カレンダー === */}
      <Calendar
        selectRange={selectMode === "range"}
        onChange={handleDateChange}
        value={selectedDates}
      />

      {/* === 保存ボタン === */}
      <div style={{ marginTop: "15px" }}>
        <button onClick={handleSave}>保存する</button>
      </div>

      {/* === 登録済み予定 === */}
      <div style={{ marginTop: "20px" }}>
        <h3>登録済み予定一覧</h3>
        {schedules.length === 0 ? (
          <p>登録された予定はありません。</p>
        ) : (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th>名前</th>
                <th>日付</th>
                <th>時間帯</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, index) => (
                <tr key={index}>
                  <td>{s.username}</td>
                  <td>{s.schedule_date}</td>
                  <td>{s.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
