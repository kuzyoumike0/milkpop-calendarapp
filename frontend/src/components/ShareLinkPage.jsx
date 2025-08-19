import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [mode, setMode] = useState("");

  useEffect(() => {
    axios
      .get(`/api/schedules/${linkId}`)
      .then((res) => {
        setTitle(res.data.title);
        setDates(res.data.dates);
        setTimeSlot(res.data.timeSlot);
        setMode(res.data.mode);
      })
      .catch((err) => {
        console.error("取得失敗:", err);
      });
  }, [linkId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>

      {title && <h3>📌 タイトル: {title}</h3>}
      {timeSlot && <p>🕒 時間帯: {timeSlot}</p>}
      {mode && <p>📅 モード: {mode === "range" ? "範囲選択" : "複数選択"}</p>}

      <h4>選択された日付</h4>
      {dates.length > 0 ? (
        <ul>
          {dates.map((d, idx) => (
            <li key={idx}>{d}</li>
          ))}
        </ul>
      ) : (
        <p>日付が登録されていません</p>
      )}
    </div>
  );
}
