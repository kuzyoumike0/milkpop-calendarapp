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

  // 編集用の一時データ
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // データ取得
  useEffect(() => {
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) => setSchedule(data))
      .catch((err) => console.error("API取得エラー:", err));

    fetch(`/api/schedules/${token}/responses`)
      .then((res) => res.json())
      .then((data) => setResponses(data))
      .catch((err) => console.error("レスポンス取得エラー:", err));
  }, [token]);

  if (!schedule) return <div>読み込み中...</div>;

  const dates = schedule.dates;

  // 自分の回答保存
  const saveMyResponses = async () => {
    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, responses: myResponses }),
      });
      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);

      const updated = await fetch(`/api/schedules/${token}/responses`);
      const data = await updated.json();
      setResponses(data);
    } catch (err) {
      console.error("保存エラー:", err);
    }
  };

  // 回答集計
  const aggregated = {};
  dates.forEach((d) => {
    aggregated[d.date] = { ok: 0, ng: 0, maybe: 0, users: [] };
  });
  responses.forEach((r) => {
    Object.entries(r.responses).forEach(([date, resp]) => {
      if (!aggregated[date]) return;
      if (resp === "○") aggregated[date].ok++;
      if (resp === "✕") aggregated[date].ng++;
      if (resp === "△") aggregated[date].maybe++;
      aggregated[date].users.push({ user_id: r.user_id, username: r.username, response: resp });
    });
  });

  // 全ユーザリスト
  const userList = [...new Set(responses.map((r) => r.username))];

  // 並び替え
  const getSortedDates = () => {
    return [...dates].sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // 編集モードにする
  const startEditing = () => {
    const temp = {};
    responses.forEach((r) => {
      temp[r.username] = { ...r.responses };
    });
    setEditData(temp);
    setIsEditing(true);
  };

  // 編集保存
  const saveEditedResponses = async () => {
    try {
      for (const uname of Object.keys(editData)) {
        const r = responses.find((res) => res.username === uname);
        if (!r) continue;

        await fetch(`/api/schedules/${token}/responses/${r.user_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: editData[uname] }),
        });
      }
      setIsEditing(false);

      const updated = await fetch(`/api/schedules/${token}/responses`);
      const data = await updated.json();
      setResponses(data);
    } catch (err) {
      console.error("更新エラー:", err);
    }
  };

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答入力 */}
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
          {dates.map((d, i) => (
            <div key={i} className="my-response-item">
              <span className="date-label">
                {new Date(d.date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {d.timeType &&
                  (d.timeType === "時間指定"
                    ? `（時間指定 ${d.startTime} ~ ${d.endTime}）`
                    : `（${d.timeType}）`)}
              </span>
              <select
                className="fancy-select"
                value={myResponses[d.date] || ""}
                onChange={(e) =>
                  setMyResponses({ ...myResponses, [d.date]: e.target.value })
                }
              >
                <option value="">-未回答</option>
                <option value="○">○ 参加</option>
                <option value="✕">✕ 不参加</option>
                <option value="△">△ 未定</option>
              </select>
            </div>
          ))}
        </div>
        <button className="save-btn" onClick={saveMyResponses}>
          保存する
        </button>
        {saveMessage && <div className="save-message">{saveMessage}</div>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <div className="filter-box">
          フィルタ：
          <select
            className="fancy-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">すべて表示</option>
            <option value="ok">○多い順</option>
            <option value="ng">✕多い順</option>
            <option value="maybe">△多い順</option>
          </select>
        </div>

        <div className="table-container">
          <table className="responses-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>回答数</th>
                {userList.map((uname, idx) => (
                  <th key={idx}>{uname}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getSortedDates().map((d, i) => {
                const counts = aggregated[d.date] || {
                  ok: 0,
                  ng: 0,
                  maybe: 0,
                  users: [],
                };
                return (
                  <tr key={i}>
                    <td>
                      {new Date(d.date).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {d.timeType &&
                        (d.timeType === "時間指定"
                          ? `（時間指定 ${d.startTime} ~ ${d.endTime}）`
                          : `（${d.timeType}）`)}
                    </td>
                    <td>
                      <span className="count-ok">○{counts.ok}</span>
                      <span className="count-ng"> ✕{counts.ng}</span>
                      <span className="count-maybe"> △{counts.maybe}</span>
                    </td>
                    {userList.map((uname, idx) => {
                      const r = responses.find((res) => res.username === uname);
                      const current = r?.responses[d.date] || "–";

                      return (
                        <td key={idx}>
                          {isEditing ? (
                            <select
                              value={editData[uname]?.[d.date] || current}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  [uname]: {
                                    ...prev[uname],
                                    [d.date]: e.target.value,
                                  },
                                }))
                              }
                              className="fancy-select"
                            >
                              <option value="">–</option>
                              <option value="○">○</option>
                              <option value="✕">✕</option>
                              <option value="△">△</option>
                            </select>
                          ) : (
                            current
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isEditing ? (
          <button className="save-btn" onClick={startEditing}>
            編集する
          </button>
        ) : (
          <button className="save-btn" onClick={saveEditedResponses}>
            保存する
          </button>
        )}
      </div>
    </div>
  );
}
