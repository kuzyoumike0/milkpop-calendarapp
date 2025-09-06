// frontend/src/components/SharePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import "../share.css";

const socket = io();

const STORAGE_ANSWERED_KEY = "mp_answeredShares";
function recordAnsweredShare({ url, title }) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_ANSWERED_KEY) || "[]");
    const filtered = list.filter((x) => x.url !== url);
    const next = [{ url, title, savedAt: new Date().toISOString() }, ...filtered].slice(0, 200);
    localStorage.setItem(STORAGE_ANSWERED_KEY, JSON.stringify(next));
  } catch {}
}

const STORAGE_MY_UID = "mp_my_user_id";
function getOrCreateMyUserId() {
  let id = localStorage.getItem(STORAGE_MY_UID);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(STORAGE_MY_UID, id);
  }
  return id;
}

const timeLabel = (t) => {
  if (t === "allday") return "終日";
  if (t === "day") return "午前";
  if (t === "night") return "午後";
  if (t === "custom") return "時間指定";
  return t;
};

const youbiJP = ["日", "月", "火", "水", "木", "金", "土"];
const pad = (n) => String(n).padStart(2, "0");
const fmtDateWithYoubi = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const w = youbiJP[d.getDay()];
  return `${y}/${m}/${day}(${w})`;
};

const buildKey = (date, d) => {
  const isoDate = new Date(date).toISOString().split("T")[0];
  if (d.timeType === "custom" && d.startTime && d.endTime) {
    return `${isoDate} (${d.startTime} ~ ${d.endTime})`;
  }
  return `${isoDate} (${timeLabel(d.timeType)})`;
};

const buildDisplay = (date, d) => {
  if (d.timeType === "custom" && d.startTime && d.endTime) {
    return `${fmtDateWithYoubi(date)} ${d.startTime} ~ ${d.endTime}`;
  }
  return `${fmtDateWithYoubi(date)} ${timeLabel(d.timeType)}`;
};

const normalizeResponses = (obj) => {
  const normalized = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    const datePart = k.split(" ")[0];
    const iso = new Date(datePart).toISOString().split("T")[0];
    let rest = k.substring(k.indexOf(" "));
    rest = rest.replace("(allday)", "(終日)")
               .replace("(day)", "(午前)")
               .replace("(night)", "(午後)")
               .replace("(custom)", "(時間指定)");
    normalized[`${iso}${rest}`] = v;
  });
  return normalized;
};

function buildAutoNgMap(scheduleDates) {
  try {
    const personal = JSON.parse(localStorage.getItem("personalEvents") || "[]");
    if (!Array.isArray(personal) || personal.length === 0) return {};
    const ngDateSet = new Set(personal.map((ev) => new Date(ev.date).toISOString().split("T")[0]));
    const map = {};
    for (const d of scheduleDates || []) {
      const iso = new Date(d.date).toISOString().split("T")[0];
      if (ngDateSet.has(iso)) {
        const key = buildKey(d.date, d);
        map[key] = "✕";
      }
    }
    return map;
  } catch {
    return {};
  }
}

export default function SharePage() {
  const { token } = useParams();

  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [myResponses, setMyResponses] = useState({});
  const [filter, setFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [editedResponses, setEditedResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [autoNgApplied, setAutoNgApplied] = useState(false);

  useEffect(() => { setMyUserId(getOrCreateMyUserId()); }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) =>
        setSchedule({
          ...data,
          dates: [...(data.dates || [])].sort((a, b) => new Date(a.date) - new Date(b.date)),
        })
      );
  }, [token]);

  const fetchResponses = () =>
    fetch(`/api/schedules/${token}/responses`)
      .then((res) => res.json())
      .then((data) => {
        const fixed = data.map((r) => ({ ...r, responses: normalizeResponses(r.responses) }));
        setResponses(fixed);
        return fixed;
      });

  useEffect(() => {
    if (!token) return;
    fetchResponses();
    socket.emit("joinSchedule", token);
    const handler = () => {
      fetchResponses().then((fixed) => {
        const myId = myUserId || localStorage.getItem(STORAGE_MY_UID);
        if (myId) {
          const mine = fixed.find((r) => r.user_id === myId);
          if (mine) {
            setUsername(mine.username || "");
            setMyResponses((prev) => mine.responses || prev);
          }
        }
      });
    };
    socket.on("updateResponses", handler);
    return () => socket.off("updateResponses", handler);
  }, [token, myUserId]);

  useEffect(() => {
    const myId = myUserId || localStorage.getItem(STORAGE_MY_UID);
    if (!myId || responses.length === 0) return;
    const mine = responses.find((r) => r.user_id === myId);
    setUsername(mine?.username || "");
    setMyResponses(mine?.responses || {});
  }, [responses, myUserId]);

  useEffect(() => {
    if (!schedule || autoNgApplied) return;
    const autoNg = buildAutoNgMap(schedule.dates);
    if (Object.keys(autoNg).length === 0) {
      setAutoNgApplied(true);
      return;
    }
    setMyResponses((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(autoNg)) {
        if (next[k] == null || next[k] === "-") next[k] = v;
      }
      return next;
    });
    setAutoNgApplied(true);
  }, [schedule, autoNgApplied]);

  const summary = useMemo(() => {
    const dates = schedule?.dates || [];
    return dates.map((d) => {
      const key = buildKey(d.date, d);
      const display = buildDisplay(d.date, d);
      const counts = { "◯": 0, "✕": 0, "△": 0 };
      responses.forEach((r) => {
        const val = r.responses?.[key];
        if (val && counts[val] !== undefined) counts[val]++;
      });
      return { ...d, key, display, counts };
    });
  }, [schedule, responses]);

  const filteredSummary = useMemo(() => {
    const s = [...summary];
    if (filter === "ok") return s.sort((a, b) => b.counts["◯"] - a.counts["◯"]);
    if (filter === "ng") return s.sort((a, b) => b.counts["✕"] - a.counts["✕"]);
    if (filter === "maybe") return s.sort((a, b) => b.counts["△"] - a.counts["△"]);
    return s.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [summary, filter]);

  const handleSave = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      const payload = {
        user_id: myUserId || getOrCreateMyUserId(),
        username,
        responses: normalizeResponses(myResponses),
      };
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== payload.user_id);
        return [...others, { user_id: payload.user_id, username, responses: payload.responses }];
      });
      recordAnsweredShare({ url: window.location.href, title: schedule?.title || "共有日程" });
      socket.emit("updateResponses", token);
      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 1800);
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    }
  };

  const handleEditSave = async () => {
    try {
      const user = responses.find((r) => r.user_id === editingUser);
      const payload = {
        user_id: editingUser,
        username: user?.username || "未入力",
        responses: normalizeResponses(editedResponses),
      };
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== editingUser);
        return [...others, { user_id: editingUser, username: payload.username, responses: payload.responses }];
      });
      if (editingUser === (myUserId || localStorage.getItem(STORAGE_MY_UID))) {
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

      {!schedule ? (
        <div>読み込み中...</div>
      ) : (
        <>
          <div className="my-responses">
            <h2>自分の回答</h2>
            <input
              type="text"
              placeholder="あなたの名前"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />

            {autoNgApplied && (
              <div className="save-message" style={{ marginTop: 8 }}>
                個人日程で登録済みの日は自動で「✕」に設定しました（必要なら変更できます）。
              </div>
            )}

            {/* 表形式 */}
            <table className="my-responses-table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>あなたの回答</th>
                </tr>
              </thead>
              <tbody>
                {(schedule.dates || []).map((d, idx) => {
                  const key = buildKey(d.date, d);
                  const label = buildDisplay(d.date, d);
                  return (
                    <tr key={idx}>
                      <td>{label}</td>
                      <td>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button className="save-btn" onClick={handleSave}>保存する</button>
            {saveMessage && <div className="save-message">{saveMessage}</div>}
          </div>

          <div className="all-responses">
            <h2>みんなの回答</h2>
            <label>
              フィルタ：
              <select
                className="fancy-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ marginLeft: 8 }}
              >
                <option value="all">すべて表示（日付順）</option>
                <option value="ok">◯ 多い順</option>
                <option value="ng">✕ 多い順</option>
                <option value="maybe">△ 多い順</option>
              </select>
            </label>

            <table className="responses-table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>回答数</th>
                  {responses.map((r, idx) => (
                    <th key={idx}>
                      <span
                        className="editable-username"
                        onClick={() => { setEditingUser(r.user_id); setEditedResponses(r.responses); }}
                        title="クリックでこの人の回答を編集"
                      >
                        {r.username && r.username.trim() !== "" ? r.username : "未入力"}
                        {r.user_id === (myUserId || localStorage.getItem(STORAGE_MY_UID)) ? "（自分）" : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.display}</td>
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
                              setEditedResponses({ ...editedResponses, [d.key]: e.target.value })
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
                <button className="username-save-btn" onClick={handleEditSave}>編集を保存</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
