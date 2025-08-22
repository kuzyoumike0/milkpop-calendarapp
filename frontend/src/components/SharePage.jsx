// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({}); // { dateStr: "〇" | "✖" }
  const [user, setUser] = useState(null);        // Discordログインユーザー
  const [username, setUsername] = useState("");   // 未ログイン時の名前入力

  const shareUrl = `${window.location.origin}/share/${id}`;

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
        responses: responses, // 👈 ユーザー名＋日付の回答
      }),
    });
    const data = await res.json();
    if (data.ok) {
      alert("保存しました！");
      setScheduleData(data.data); // 最新のレスポンスを反映
      setResponses({});           // 👈 保存後はクリアして再入力可能に
    }
  } catch (err) {
    console.error("❌ 保存エラー:", err);
    alert("保存に失敗しました");
  }
};


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
