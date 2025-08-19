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

  // === データ取得 ===
  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, [linkId]);

  // === カレンダー選択処理 ===
  const handleDateChange = (date) => {
    if (selectMode === "range") {
      setSelectedDates(date); // [start, end]
    } else if (selectMode === "multi") {
      if (Array.isArray(selectedDates)) {
        const exists = selectedDates.some(
          (d) => new Date(d).toDateString() === new Date(date).toDateString()
        );
        if (exists) {
          setSelectedDates(selectedDates.filter(
            (d) => new Date(d).toDateString() !== new Date(date).toDateString()
          ));
        } else {
          setSelectedDates([...selectedDates, date]);
        }
      } else {
        setSelectedDates([date]);
      }
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      <p>リンクID: {linkId}</p>

      {/* === カレンダーと選択モード === */}
      <div style={{ marginBottom: "20px" }}>
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

        <Calendar
          selectRange={selectMode === "range"}
          onClickDay={handleDateChange}
          value={selectedDates}
        />
      </div>

      {/* === 選択された日付の表示 === */}
      <div style={{ marginBottom: "20px" }}>
        <h3>選択された日付</h3>
        {Array.isArray(selectedDates) && selectedDates.length > 0 ? (
          <ul>
            {selectedDates.map((d, idx) => (
              <li key={idx}>{new Date(d).toLocaleDateString()}</li>
            ))}
          </ul>
        ) : (
          <p>未選択</p>
        )}
      </div>

      {/* === 登録済み予定一覧 === */}
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
  );
}
