import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ShareLinkPage.css"; // スタイルを別ファイルで定義

export default function ShareLinkPage() {
  const { linkId } = useParams(); // URLからリンクID取得
  const [username, setUsername] = useState("");
  const [date, setDate] = useState("");
  const [timeslot, setTimeslot] = useState("終日");
  const [schedules, setSchedules] = useState([]);

  // 日付フォーマット補助
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 初期表示：今日の日付をセット
  useEffect(() => {
    setDate(formatDate(new Date()));
  }, []);

  // 予定を取得
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

  // 予定を登録
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
      fetchSchedules(); // 登録後に再取得
    } catch (err) {
      console.error("予定登録に失敗:", err);
      alert("予定登録に失敗しました");
    }
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
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
        >
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
        <div>
          {/* PC表示: テーブル */}
          <table className="schedule-table">
            <thead>
              <tr>
                <th>名前</th>
                <th>日付</th>
                <th>時間帯</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td>{s.username}</td>
                  <td>{s.date}</td>
                  <td>{s.timeslot}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* スマホ表示: カード */}
          <div className="schedule-cards">
            {schedules.map((s) => (
              <div key={s.id} className="schedule-card">
                <p><strong>名前:</strong> {s.username}</p>
                <p><strong>日付:</strong> {s.date}</p>
                <p><strong>時間帯:</strong> {s.timeslot}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
