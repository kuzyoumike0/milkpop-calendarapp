import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ShareLinkPage({ linkId }) {
  const [username, setUsername] = useState("");
  const [date, setDate] = useState("");
  const [timeslot, setTimeslot] = useState("終日");
  const [comment, setComment] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [editId, setEditId] = useState(null);

  // 予定一覧取得
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/shared/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch schedules:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  // 予定登録/更新
  const handleRegister = async () => {
    try {
      if (!username.trim()) {
        alert("名前を入力してください");
        return;
      }

      if (editId) {
        // 更新処理
        const savedTokens = JSON.parse(localStorage.getItem("scheduleTokens") || "{}");
        const token = savedTokens[editId];

        if (!token) {
          alert("❌ この予定のキーが保存されていないため編集できません");
          return;
        }

        await axios.put(`/api/schedule/${editId}`, {
          username,
          date,
          timeslot,
          comment,
          token,
        });
      } else {
        // 新規登録
        const res = await axios.post(`/api/share/${linkId}`, {
          username,
          date,
          timeslot,
          comment,
        });

        const { id: scheduleId, token: newToken } = res.data;

        // localStorage に保存
        const savedTokens = JSON.parse(localStorage.getItem("scheduleTokens") || "{}");
        savedTokens[scheduleId] = newToken;
        localStorage.setItem("scheduleTokens", JSON.stringify(savedTokens));

        // コピー処理
        navigator.clipboard.writeText(newToken).then(() => {
          alert("✅ 予定を登録しました。\nキーは自動保存され、クリップボードにもコピーしました。\n他端末で編集/削除する場合はこのキーを保存してください。");
        });
      }

      setEditId(null);
      setTimeslot("終日");
      setComment("");
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.error || "登録/更新失敗");
    }
  };

  // 編集開始
  const handleEdit = (schedule) => {
    setEditId(schedule.id);
    setUsername(schedule.username);
    setDate(schedule.date);
    setTimeslot(schedule.timeslot);
    setComment(schedule.comment || "");

    // トークンがない場合 → 手動入力
    const savedTokens = JSON.parse(localStorage.getItem("scheduleTokens") || "{}");
    if (!savedTokens[schedule.id]) {
      const inputToken = prompt("この予定の編集キーを入力してください:");
      if (inputToken) {
        savedTokens[schedule.id] = inputToken;
        localStorage.setItem("scheduleTokens", JSON.stringify(savedTokens));
      }
    }
  };

  // 削除
  const handleDelete = async (id) => {
    const savedTokens = JSON.parse(localStorage.getItem("scheduleTokens") || "{}");
    let token = savedTokens[id];

    if (!token) {
      token = prompt("この予定の削除キーを入力してください:");
      if (token) {
        savedTokens[id] = token;
        localStorage.setItem("scheduleTokens", JSON.stringify(savedTokens));
      } else {
        return;
      }
    }

    try {
      await axios.delete(`/api/schedule/${id}`, { params: { token } });
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.error || "削除失敗");
    }
  };

  // 日付ごとにグループ化
  const groupedSchedules = schedules.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">共有スケジュール</h2>

      {/* 入力フォーム */}
      <div className="space-y-2 border p-4 rounded shadow">
        <input
          type="text"
          placeholder="名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option>終日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <input
          type="text"
          placeholder="コメント（任意）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleRegister}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editId ? "更新" : "登録"}
        </button>
      </div>

      {/* スケジュール一覧 */}
      <div className="mt-6 space-y-4">
        {Object.keys(groupedSchedules)
          .sort()
          .map((d) => (
            <div key={d} className="border rounded p-4 shadow">
              <h3 className="font-semibold mb-2">{d}</h3>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">名前</th>
                    <th className="p-2 border">区分</th>
                    <th className="p-2 border">コメント</th>
                    <th className="p-2 border">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSchedules[d].map((s) => (
                    <tr key={s.id}>
                      <td className="p-2 border">{s.username}</td>
                      <td className="p-2 border">{s.timeslot}</td>
                      <td className="p-2 border">{s.comment || "-"}</td>
                      <td className="p-2 border space-x-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}
