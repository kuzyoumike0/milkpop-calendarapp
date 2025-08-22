// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const SharePage = () => {
  const { id } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({}); // { dateStr: "〇" | "✖" }
  const [user, setUser] = useState(null);        // Discordログインユーザー
  const [username, setUsername] = useState("");   // 未ログイン時の名前入力

  const shareUrl = `${window.location.origin}/share/${id}`;

  // ===== ユーザー識別ID（Discordログイン時はDiscord ID、未ログイン時はUUID） =====
  useEffect(() => {
    if (!localStorage.getItem("user_id")) {
      localStorage.setItem("user_id", uuidv4()); // 未ログイン用の一意IDを保持
    }
  }, []);

  // ===== ユーザー情報取得（Discordログイン状態保持） =====
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      fetch(`/api/me/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            setUser(data.user);
            setUsername(data.user.username);
          }
        })
        .catch(err => console.error("❌ ユーザー取得エラー:", err));
    }
  }, []);

  // ===== スケジュール取得 =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${id}`);
        const data = await res.json();
        if (data.ok) {
          setScheduleData(data.data);
        }
      } catch (err) {
        console.error("❌ スケジュール取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [id]);

  // ===== プルダウン変更 =====
  const handleResponseChange = (dateStr, value) => {
    setResponses({
      ...responses,
      [dateStr]: value,
    });
  };

  // ===== 保存処理 =====
  const handleSave = async () => {
    const userId = user?.id || localStorage.getItem("user_id"); // 👈 Discord ID or UUID
    if (!username) {
      alert("ユーザー名を入力してください");
      return;
    }
    try {
      const res = await fetch(`/api/schedules/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          username: user?.username || username, // 👈 最新の名前で上書き
          responses,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("保存しました！");
        setScheduleData(data.data); // 最新のレスポンスを反映
        setResponses({});
      }
    } catch (err) {
      console.error("❌ 保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">共有ページ</h2>

      {/* 登録された日程リスト */}
      <h3>登録された日程</h3>
      {loading && <p>読み込み中...</p>}
      {!loading && scheduleData && scheduleData.dates?.length === 0 && (
        <p>登録された日程はありません。</p>
      )}
      {!loading && scheduleData && scheduleData.dates?.length > 0 && (
        <ul className="schedule-list">
          {scheduleData.dates.map((d, i) => {
            const dateStr = new Date(d).toDateString();
            const option = scheduleData.options[dateStr];
            return (
              <li key={i} className="schedule-item">
                <strong>{new Date(d).toLocaleDateString()}</strong>
                <span>（{option?.type || "終日"}）</span>
                {option?.type === "時刻指定" && (
                  <span> {option.start}〜{option.end}</span>
                )}

                {/* プルダウンで出欠選択 */}
                <select
                  value={responses[dateStr] || ""}
                  onChange={(e) => handleResponseChange(dateStr, e.target.value)}
                >
                  <option value="">未選択</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </li>
            );
          })}
        </ul>
      )}

      {/* ユーザー名入力 */}
      {!user && (
        <div className="username-input">
          <label>
            名前：
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>
      )}
      {user && (
        <p>Discordログイン中: <strong>{user.username}</strong></p>
      )}

      {/* 保存ボタン */}
      {scheduleData && scheduleData.dates?.length > 0 && (
        <button className="fancy-btn" onClick={handleSave}>
          保存
        </button>
      )}

      {/* 全員分の出欠一覧 */}
      {scheduleData && scheduleData.responses && (
        <div className="responses-table">
          <h3>みんなの出欠状況</h3>
          <table className="fancy-table">
            <thead>
              <tr>
                <th>ユーザー名</th>
                {scheduleData.dates.map((d, i) => (
                  <th key={i}>{new Date(d).toLocaleDateString()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(scheduleData.responses).map(([name, userResponses], i) => (
                <tr key={i}>
                  <td>{name}</td>
                  {scheduleData.dates.map((d, j) => {
                    const dateStr = new Date(d).toDateString();
                    return <td key={j}>{userResponses[dateStr] || "-"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 下部に共有リンクを表示 */}
      <div className="share-link-section">
        <h3>このページの共有リンク</h3>
        <p className="share-link">
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </p>
      </div>
    </div>
  );
};

export default SharePage;
