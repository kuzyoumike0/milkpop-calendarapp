// frontend/src/components/SharePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import "../share.css";

const socket = io();

// === 個人ページに載せる「回答した共有リンク」用ローカル履歴 ===
const STORAGE_ANSWERED_KEY = "mp_answeredShares";
function recordAnsweredShare({ url, title }) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_ANSWERED_KEY) || "[]");
    const filtered = list.filter((x) => x.url !== url);
    const next = [{ url, title, savedAt: new Date().toISOString() }, ...filtered].slice(0, 200);
    localStorage.setItem(STORAGE_ANSWERED_KEY, JSON.stringify(next));
  } catch {}
}

// === 端末ごとの固定 user_id を保持（DBの自分の回答レコードと1対1で紐づく） ===
const STORAGE_MY_UID = "mp_my_user_id";
function getOrCreateMyUserId() {
  let id = localStorage.getItem(STORAGE_MY_UID);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(STORAGE_MY_UID, id);
  }
  return id;
}

// ==== timeType → 日本語表示 ====
const timeLabel = (t) => {
  if (t === "allday") return "終日";
  if (t === "day") return "午前";
  if (t === "night") return "午後";
  if (t === "custom") return "時間指定";
  return t;
};

// ==== キー生成（同一キーで集計・保存するための正規化文字列） ====
const buildKey = (date, d) => {
  const isoDate = new Date(date).toISOString().split("T")[0];
  if (d.timeType === "custom" && d.startTime && d.endTime) {
    return `${isoDate} (${d.startTime} ~ ${d.endTime})`;
  }
  return `${isoDate} (${timeLabel(d.timeType)})`;
};

// ==== responses のキーを統一（ISO日付 + 日本語スロット） ====
const normalizeResponses = (obj) => {
  const normalized = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    const datePart = k.split(" ")[0];
    const iso = new Date(datePart).toISOString().split("T")[0];
    let rest = k.substring(k.indexOf(" "));

    // 英語表記→日本語
    rest = rest.replace("(allday)", "(終日)");
    rest = rest.replace("(day)", "(午前)");
    rest = rest.replace("(night)", "(午後)");
    rest = rest.replace("(custom)", "(時間指定)");

    normalized[`${iso}${rest}`] = v;
  });
  return normalized;
};

export default function SharePage() {
  const { token } = useParams();

  const [schedule, setSchedule] = useState(null);

  // 全員分の回答（DBから取得）
  const [responses, setResponses] = useState([]);

  // 自分の表示・編集用
  const [myUserId, setMyUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [myResponses, setMyResponses] = useState({});

  // UI
  const [filter, setFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [editedResponses, setEditedResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  // ===== 固定 user_id を確定 =====
  useEffect(() => {
    setMyUserId(getOrCreateMyUserId());
  }, []);

  // ===== スケジュール本体をDBから取得 =====
  useEffect(() => {
    if (!token) return;
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = {
          ...data,
          dates: [...(data.dates || [])].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          ),
        };
        setSchedule(sorted);
      });
  }, [token]);

  // ===== 回答一覧をDBから取得（初期表示 & ソケット更新時） =====
  const fetchResponses = () => {
    return fetch(`/api/schedules/${token}/responses`)
      .then((res) => res.json())
      .then((data) => {
        const fixed = data.map((r) => ({
          ...r,
          responses: normalizeResponses(r.responses),
        }));
        setResponses(fixed);
        return fixed;
      });
  };

  useEffect(() => {
    if (!token) return;
    fetchResponses();

    // ソケット購読
    socket.emit("joinSchedule", token);
    const handler = () => {
      fetchResponses().then((fixed) => {
        // 他端末で更新された自分の回答を同期
        const myId = myUserId || localStorage.getItem(STORAGE_MY_UID);
        if (myId) {
          const mine = fixed.find((r) => r.user_id === myId);
          if (mine) {
            setUsername(mine.username || "");
            setMyResponses(mine.responses || {});
          }
        }
      });
    };
    socket.on("updateResponses", handler);
    return () => socket.off("updateResponses", handler);
  }, [token, myUserId]);

  // ===== responses or myUserId が変わったら「自分の回答」をフォームに復元 =====
  useEffect(() => {
    const myId = myUserId || localStorage.getItem(STORAGE_MY_UID);
    if (!myId || responses.length === 0) return;
    const mine = responses.find((r) => r.user_id === myId);
    if (mine) {
      setUsername(mine.username || "");
      setMyResponses(mine.responses || {});
    } else {
      // DBに自分の回答がまだ無い場合は空初期化
      setMyResponses({});
    }
  }, [responses, myUserId]);

  // ===== 集計 & ソート（schedule が null でもフックは常に呼ぶ） =====
  const summary = useMemo(() => {
    const dates = schedule?.dates || [];
    return dates.map((d) => {
      const key = buildKey(d.date, d);
      const counts = { "◯": 0, "✕": 0, "△": 0 };
      responses.forEach((r) => {
        const val = r.responses?.[key];
        if (val && counts[val] !== undefined) counts[val]++;
      });
      return { ...d, key, counts };
    });
  }, [schedule, responses]);

  const filteredSummary = useMemo(() => {
    const s = [...summary];
    if (filter === "ok") return s.sort((a, b) => b.counts["◯"] - a.counts["◯"]);
    if (filter === "ng") return s.sort((a, b) => b.counts["✕"] - a.counts["✕"]);
    if (filter === "maybe") return s.sort((a, b) => b.counts["△"] - a.counts["△"]);
    return s.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [summary, filter]);

  // ===== 保存（DBへ UPSERT by user_id） =====
  const handleSave = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      const payload = {
        user_id: myUserId || getOrCreateMyUserId(), // 端末固定 → DBでこのIDにUPSERT
        username,
        responses: normalizeResponses(myResponses),
      };

      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST", // サーバ側をUPSERT実装（INSERT or UPDATE by user_id）
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 即時ローカル反映（自分の行を置き換え）
      setResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== payload.user_id);
        return [...others, { user_id: payload.user_id, username, responses: payload.responses }];
      });

      // 共有URLを個人ページに残す（ローカル履歴）
      recordAnsweredShare({
        url: window.location.href,
        title: schedule?.title || "共有日程",
      });

      // 参加者全員へ更新通知
      socket.emit("updateResponses", token);

      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 1800);
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    }
  };

  // ===== 任意ユーザーの編集保存（主催側の想定） =====
  const handleEditSave = async () => {
    try {
      const user = responses.find((r) => r.user_id === editingUser);
      const payload = {
        user_id: editingUser,
        username: user?.username || "未入力",
        responses: normalizeResponses(editedResponses),
      };

      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST", // UPSERT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== editingUser);
        return [...others, { user_id: editingUser, username: payload.username, responses: payload.responses }];
      });

      // 自分本人を編集していたらフォームにも反映
      if (editingUser === myUserId) {
        setMyResponses(payload.responses);
      }

      socket.emit("updateResponses", token);
      setEditingUser(null);
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* ローディング表示（フックは上で全て呼んだのでここは条件分岐OK） */}
      {!schedule ? (
        <div>読み込み中...</div>
      ) : (
        <>
          {/* 自分の回答 */}
          <div className="my-responses">
            <h2>自分の回答</h2>
            <input
              type="text"
              placeholder="あなたの名前"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />
            <div className="my-responses-list">
              {(schedule.dates || []).map((d, idx) => {
                const key = buildKey(d.date, d);
                return (
                  <div key={idx} className="my-response-item">
                    <span className="date-label">{key}</span>
                    <select
                      className="fancy-select"
                      value={myResponses[key] || "-"}
                      onChange={(e) =>
                        setMyResponses({ ...myResponses, [key]: e.target.value })
                      }
                    >
                      <option value="-">- 未回答</option>
                      <option value="◯">◯ 参加</option>
                      <option value="✕">✕ 不参加</option>
                      <option value="△">△ 未定</option>
                    </select>
                  </div>
                );
              })}
            </div>
            <button className="save-btn" onClick={handleSave}>
              保存する
            </button>
            {saveMessage && <div className="save-message">{saveMessage}</div>}
          </div>

          {/* みんなの回答 */}
          <div className="all-responses">
            <h2>みんなの回答</h2>
            <div style={{ marginBottom: "20px" }}>
              フィルタ：
              <select
                className="fancy-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">すべて表示（日付順）</option>
                <option value="ok">◯ 多い順</option>
                <option value="ng">✕ 多い順</option>
                <option value="maybe">△ 多い順</option>
              </select>
            </div>

            <table className="responses-table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>回答数</th>
                  {responses.map((r, idx) => (
                    <th key={idx}>
                      <span
                        className="editable-username"
                        onClick={() => {
                          setEditingUser(r.user_id);
                          setEditedResponses(r.responses);
                        }}
                        title="クリックでこの人の回答を編集"
                      >
                        {r.username && r.username.trim() !== "" ? r.username : "未入力"}
                        {r.user_id === myUserId ? "（自分）" : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.key}</td>
                    <td>
                      <span className="count-ok">◯{d.counts["◯"]}</span>{" "}
                      <span className="count-ng">✕{d.counts["✕"]}</span>{" "}
                      <span className="count-maybe">△{d.counts["△"]}</span>
                    </td>
                    {responses.map((r, uIdx) => (
                      <td key={uIdx}>
                        {editingUser === r.user_id ? (
                          <select
                            className="fancy-select"
                            value={editedResponses[d.key] || "-"}
                            onChange={(e) =>
                              setEditedResponses({
                                ...editedResponses,
                                [d.key]: e.target.value,
                              })
                            }
                          >
                            <option value="-">- 未回答</option>
                            <option value="◯">◯ 参加</option>
                            <option value="✕">✕ 不参加</option>
                            <option value="△">△ 未定</option>
                          </select>
                        ) : (
                          r.responses?.[d.key] || "-"
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {editingUser && (
              <div className="edit-save-bar">
                <button className="username-save-btn" onClick={handleEditSave}>
                  編集を保存
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
