import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../share.css";

export default function SharePage() {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [myResponses, setMyResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [filter, setFilter] = useState("all");

  const [editingUser, setEditingUser] = useState(null);
  const [editedResponses, setEditedResponses] = useState({});

  // データ取得
  useEffect(() => {
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) => setSchedule(data))
      .catch(() => alert("スケジュール取得失敗"));

    fetch(`/api/schedules/${token}/responses`)
      .then((res) => res.json())
      .then((data) => setResponses(data))
      .catch(() => alert("回答取得失敗"));
  }, [token]);

  // 自分の回答保存
  const handleSave = async () => {
    try {
      const payload = {
        username,
        responses: schedule.dates.map((d) => ({
          date: d.date,
          response: myResponses[d.date] || "未回答",
        })),
      };

      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setResponses(updated);
      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch {
      alert("保存失敗");
    }
  };

  // 管理者編集保存
  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/schedules/${token}/responses/admin-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedResponses),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setResponses(updated);
      setEditingUser(null);
      setEditedResponses({});
      alert("編集を保存しました");
    } catch {
      alert("編集保存失敗");
    }
  };

  if (!schedule) {
    return <div className="share-container">読み込み中...</div>;
  }

  // 集計
  const aggregate = schedule.dates.map((d) => {
    const counts = { "○": 0, "✕": 0, "△": 0 };
    const users = [];

    responses.forEach((r) => {
      const resp = r.responses.find((res) => res.date === d.date);
      if (resp) {
        counts[resp.response] = (counts[resp.response] || 0) + 1;
        users.push({ username: r.username, response: resp.response });
      }
    });

    return { ...d, counts, users };
  });

  const userList = [...new Set(responses.map((r) => r.username))];

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答 */}
      <div className="my-responses">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="my-responses-list">
          {schedule.dates.map((d, idx) => (
            <div key={idx} className="my-response-item">
              <span className="date-label">
                {new Date(d.date).toLocaleDateString("ja-JP")}{" "}
                {d.timeType === "時間指定"
                  ? `（${d.startTime} ~ ${d.endTime}）`
                  : `（${d.timeType}）`}
              </span>
              <select
                className="fancy-select"
                value={myResponses[d.date] || "未回答"}
                onChange={(e) =>
                  setMyResponses({ ...myResponses, [d.date]: e.target.value })
                }
              >
                <option value="未回答">- 未回答</option>
                <option value="○">{"\u25CB"} 参加</option>
                <option value="✕">{"\u2715"} 不参加</option>
                <option value="△">{"\u25B3"} 未定</option>
              </select>
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleSave}>
          保存する
        </button>
        {saveMessage && <div className="save-message">{saveMessage}</div>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <label>
          フィルタ：
          <select
            className="fancy-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">すべて表示</option>
            <option value="ok">{"\u25CB"} 多い順</option>
            <option value="ng">{"\u2715"} 多い順</option>
            <option value="maybe">{"\u25B3"} 多い順</option>
          </select>
        </label>

        <div className="table-container">
          <table className="responses-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>回答数</th>
                {userList.map((uname, idx) => (
                  <th key={idx}>
                    <span
                      className="editable-username"
                      onClick={() => setEditingUser(uname)}
                    >
                      {uname}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aggregate.map((d, idx) => (
                <tr key={idx}>
                  <td>
                    {new Date(d.date).toLocaleDateString("ja-JP")}{" "}
                    {d.timeType === "時間指定"
                      ? `（${d.startTime} ~ ${d.endTime}）`
                      : `（${d.timeType}）`}
                  </td>
                  <td>
                    <span className="count-ok">
                      {"\u25CB"}
                      {d.counts["○"]}
                    </span>{" "}
                    <span className="count-ng">
                      {"\u2715"}
                      {d.counts["✕"]}
                    </span>{" "}
                    <span className="count-maybe">
                      {"\u25B3"}
                      {d.counts["△"]}
                    </span>
                  </td>
                  {userList.map((uname, uidx) => {
                    const userResponse = d.users.find(
                      (u) => u.username === uname
                    );
                    const current = userResponse?.response || "-";

                    return (
                      <td key={uidx}>
                        {editingUser === uname ? (
                          <select
                            className="fancy-select"
                            value={editedResponses[`${uname}-${d.date}`] || current}
                            onChange={(e) =>
                              setEditedResponses({
                                ...editedResponses,
                                [`${uname}-${d.date}`]: e.target.value,
                              })
                            }
                          >
                            <option value="-">- 未回答</option>
                            <option value="○">{"\u25CB"}</option>
                            <option value="✕">{"\u2715"}</option>
                            <option value="△">{"\u25B3"}</option>
                          </select>
                        ) : (
                          current
                        )}
                      </td>
                    );
                  })}
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
      </div>
    </div>
  );
}
