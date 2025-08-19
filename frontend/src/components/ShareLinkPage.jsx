import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ShareLinkPage.css";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [username, setUsername] = useState("");
  const [date, setDate] = useState("");
  const [timeslot, setTimeslot] = useState("終日");
  const [schedules, setSchedules] = useState([]);

  // 今日の日付を初期値に設定
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // 予定取得
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/share/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error("予定取得に失敗:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  // 予定登録
  const handleRegister = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${linkId}`, {
        username,
        date,
        timeslot,
      });
      setUsername("");
      setTimeslot("終日");
      fetchSchedules();
    } catch (err) {
      console.error("予定登録に失敗:", err);
      alert("予定登録に失敗しました");
    }
  };

  // 日付ごとにグループ化
  const grouped = schedules.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  // 日付を「M月D日(曜)」に変換
  const formatJapaneseDate = (isoDate) => {
    const d = new Date(isoDate + "T00:00:00");
    const options = { month: "numeric", day: "numeric", weekday: "short" };
    return d.toLocaleDateString("ja-JP", options); // 例: 8/19(火)
  };

  return (
    <div className="share-container">
      <h2>共有スケジュール</h2>

      {/* 入力フォーム */}
      <div className="form-container">
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={timeslot} onChange={(e) => setTimeslot(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
        <button onClick={handleRegister}>登録</button>
      </div>

      {/* 登録済み予定一覧 */}
      <h3>登録済み予定</h3>
      {schedules.length === 0 ? (
        <p>まだ予定は登録されていません。</p>
      ) : (
        Object.keys(grouped)
          .sort()
          .map((d) => (
            <div key={d} className="date-section">
              <h4>{formatJapaneseDate(d)}</h4>

              {/* PC: テーブル */}
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>名前</th>
                    <th>時間帯</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[d].map((s) => (
                    <tr key={s.id}>
                      <td>{s.username}</td>
                      <td>{s.timeslot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* スマホ: カード */}
              <div className="schedule-cards">
                {grouped[d].map((s) => (
                  <div key={s.id} className="schedule-card">
                    <p><strong>名前:</strong> {s.username}</p>
                    <p><strong>時間帯:</strong> {s.timeslot}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
