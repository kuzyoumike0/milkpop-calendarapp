// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../common.css";
import "../share.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  // DBから日程取得
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        const data = await res.json();
        setSchedule(data);

        // 既存の回答取得
        const res2 = await fetch(`/api/schedules/${token}/responses`);
        const resData = await res2.json();

        const myResp = resData.find((r) => r.username === username);
        if (myResp) setResponses(myResp.responses);
      } catch (err) {
        console.error("共有スケジュール読み込みエラー", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [token]);

  const handleChange = (dateKey, value) => {
    setResponses({ ...responses, [dateKey]: value });
  };

  const handleSave = async () => {
    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Math.random().toString(36).slice(2, 8), // 簡易ID
          username: username || "匿名",
          responses,
        }),
      });
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (!schedule) return <p>共有リンクが無効です。</p>;

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>

      {/* タイトル */}
      <div className="glass-black title-box">{schedule.title}</div>

      {/* 名前入力 */}
      <div className="glass-black name-box">
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* 日程一覧 */}
      <div className="glass-black schedule-list">
        <h3>日程一覧</h3>
        <table>
          <tbody>
            {schedule.dates.map((d, i) => {
              const key = `${d.date} (${d.time})`;
              return (
                <tr key={i}>
                  <td className="date-cell">{d.date}</td>
                  <td className="time-cell">({d.time})</td>
                  <td>
                    <select
                      value={responses[key] || "-"}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="response-dropdown"
                    >
                      <option value="-">-</option>
                      <option value="○">○</option>
                      <option value="✖">✖</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 保存ボタン */}
      <div className="button-area">
        <button onClick={handleSave} className="save-button">保存</button>
      </div>
    </div>
  );
};

export default SharePage;
