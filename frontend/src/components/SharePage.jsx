// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../common.css";

const SharePage = () => {
  const { token } = useParams();
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);

  // 新規追加用
  const [newDate, setNewDate] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newStatus, setNewStatus] = useState("〇");

  // 編集中
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("〇");

  // ===== データ取得 =====
  const fetchData = async () => {
    const scheduleRes = await fetch(
      `${process.env.REACT_APP_API_URL}/api/schedules/${token}`
    );
    const scheduleData = await scheduleRes.json();
    setTitle(scheduleData.title);

    const options = scheduleData.dates.map((d) => `${d.date} (${d.time})`);
    setDateOptions(options);
    if (options.length > 0) setNewDate(options[0]);

    const aggRes = await fetch(
      `${process.env.REACT_APP_API_URL}/api/schedules/${token}/aggregate`
    );
    const aggData = await aggRes.json();

    const tableRows = [];
    Object.entries(aggData).forEach(([dateKey, responses]) => {
      responses.forEach((r) => {
        tableRows.push({
          date: dateKey,
          username: r.username || "（未入力）",
          status: r.status,
        });
      });
    });
    setRows(tableRows);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // ===== 新規回答保存 =====
  const saveAttendance = async () => {
    if (!newUser) {
      alert("ユーザー名を入力してください");
      return;
    }
    await fetch(`${process.env.REACT_APP_API_URL}/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: newUser,
        username: newUser,
        responses: { [newDate]: newStatus },
      }),
    });
    alert(`${newDate} | ${newUser} さん → ${newStatus} を保存しました`);

    // 🔹 再取得して反映（リロード不要）
    fetchData();
    setNewUser("");
    setNewStatus("〇");
  };

  // ===== 編集保存 =====
  const saveEditRow = async (index) => {
    const r = rows[index];
    const updated = [...rows];
    updated[index].username = editName || "（未入力）";
    updated[index].status = editStatus;
    setRows(updated);
    setEditIndex(null);

    await fetch(`${process.env.REACT_APP_API_URL}/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: editName,
        username: editName,
        responses: { [r.date]: editStatus },
      }),
    });

    alert(`更新しました → ${editName} さん: ${editStatus}`);
    // 🔹 再取得して反映
    fetchData();
  };

  // ===== 集計（〇△✖ の人数） =====
  const getSummary = (date) => {
    const target = rows.filter((r) => r.date === date);
    const summary = { "〇": 0, "△": 0, "✖": 0 };
    target.forEach((r) => {
      if (summary[r.status] !== undefined) summary[r.status]++;
    });
    return summary;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>
      {title && <h3>{title}</h3>}

      {rows.length === 0 ? (
        <p>まだ回答がありません。</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>ユーザー名</th>
              <th>参加状況</th>
            </tr>
          </thead>
          <tbody>
            {dateOptions.map((dateOpt, idx) => {
              const summary = getSummary(dateOpt);
              return (
                <React.Fragment key={idx}>
                  {/* 集計行 */}
                  <tr className="summary-row">
                    <td colSpan={3}>
                      <strong>{dateOpt}</strong> | 〇:{summary["〇"]}人 △:{summary["△"]}人 ✖:{summary["✖"]}人
                    </td>
                  </tr>
                  {/* 回答行 */}
                  {rows
                    .filter((r) => r.date === dateOpt)
                    .map((r, i) => (
                      <tr key={`${dateOpt}-${i}`}>
                        <td>{r.date}</td>
                        <td>
                          {editIndex === `${dateOpt}-${i}` ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            <span
                              className="editable-name"
                              onClick={() => {
                                setEditIndex(`${dateOpt}-${i}`);
                                setEditName(r.username);
                                setEditStatus(r.status);
                              }}
                            >
                              {r.username}
                            </span>
                          )}
                        </td>
                        <td>
                          {editIndex === `${dateOpt}-${i}` ? (
                            <>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                              >
                                <option value="〇">〇</option>
                                <option value="△">△</option>
                                <option value="✖">✖</option>
                              </select>
                              <button onClick={() => saveEditRow(i)}>保存</button>
                            </>
                          ) : (
                            r.status
                          )}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}

            {/* 新規回答行 */}
            <tr>
              <td>
                <select
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                >
                  {dateOptions.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  placeholder="ユーザー名"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                />
              </td>
              <td>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="〇">〇</option>
                  <option value="△">△</option>
                  <option value="✖">✖</option>
                </select>
                <button onClick={saveAttendance}>保存</button>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SharePage;
