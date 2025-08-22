// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const shareUrl = location.state?.shareUrl || `${window.location.origin}/share/${id}`;

  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);        // Discordログインユーザー
  const [responses, setResponses] = useState({}); // { dateStr: "〇" | "✖" }
  const [username, setUsername] = useState("");   // 未ログイン時の入力ユーザー名

  // ===== ユーザー情報取得（Discordログイン） =====
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
    setResponses({ ...responses, [dateStr]: value });
  };

  // ===== 保存処理 =====
  const handleSave = async () => {
    if (!username) {
      alert("ユーザー名を入力してください");
      return;
    }
    try {
      const res = await fetch(`/api/schedules/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: username,
          responses
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("保存しました！");
        // 即座に反映
        setScheduleData(data.data);
      }
    } catch (err) {
      console.error("❌ 保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">共有ページ</h2>

      {/* 共有リンク表示 */}
      <p>このページの共有リンク:</p>
      <p className="share-link">
        <a href={shareUrl} target="_blank" rel="noopener noreferrer">
          {shareUrl}
        </a>
      </p>

      {/* ユーザー名（Discordログインしていない場合のみ入力） */}
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

      {/* 登録された日程リスト */}
      <h3>登録された日程リスト</h3>
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

                {/* プルダウン（〇/✖） */}
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

      {/* 保存ボタン */}
      {scheduleData && scheduleData.dates?.length > 0 && (
        <button className="fancy-btn" onClick={handleSave}>
          保存
        </button>
      )}
    </div>
  );
};

export default SharePage;
