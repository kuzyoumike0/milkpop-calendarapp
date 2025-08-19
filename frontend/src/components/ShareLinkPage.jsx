import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [username, setUsername] = useState("");
  const [date, setDate] = useState("");
  const [timeslot, setTimeslot] = useState("終日");
  const [comment, setComment] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [editId, setEditId] = useState(null); // 編集中の予定ID

  // 今日の日付
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/share/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error("予定取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  const handleRegister = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }

    try {
      if (editId) {
        // 編集モード
        await axios.put(`/api/schedule/${editId}`, {
          username,
          date,
          timeslot,
          comment,
        });
      } else {
        // 新規登録
        await axios.post(`/api/share/${linkId}`, {
          username,
          date,
          timeslot,
          comment,
        });
      }

      // リセット
      setUsername("");
      setTimeslot("終日");
      setComment("");
      setEditId(null);
      fetchSchedules();
    } catch (err) {
      console.error("登録/更新失敗:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("この予定を削除しますか？")) return;
    try {
      await axios.delete(`/api/schedule/${id}`);
      fetchSchedules();
    } catch (err) {
      console.error("削除失敗:", err);
    }
  };

  const handleEdit = (schedule) => {
    setEditId(schedule.id);
    setUsername(schedule.username);
    setDate(schedule.date);
    setTimeslot(schedule.timeslot);
    setComment(schedule.comment || "");
  };

  const formatJapaneseDate = (isoDate) => {
    const d = new Date(isoDate + "T00:00:00");
    const options = { month: "numeric", day: "numeric", weekday: "short" };
    return d.toLocaleDateString("ja-JP", options);
  };

  const grouped = schedules.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  return (
    <div className="p-4 font-sans">
      <h2 className="text-xl font-bold mb-4">共有スケジュール</h2>

      {/* 入力フォーム */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
        <input
          type="text"
          placeholder="コメント (任意)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleRegister}
          className={`${
            editId ? "bg-green-500" : "bg-blue-500"
          } text-white px-4 py-2 rounded`}
        >
          {editId ? "更新" : "登録"}
        </button>
        {editId && (
          <button
            onClick={() => {
              setEditId(null);
              setUsername("");
              setTimeslot("終日");
              setComment("");
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            キャンセル
          </button>
        )}
      </div>

      {/* 一覧 */}
      {Object.keys(grouped).length === 0 ? (
        <p>まだ予定は登録されていません。</p>
      ) : (
        Object.keys(grouped)
          .sort()
          .map((d) => (
            <div key={d} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {formatJapaneseDate(d)}
              </h3>
              <table className="hidden md:table w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">名前</th>
                    <th className="border p-2">時間帯</th>
                    <th className="border p-2">コメント</th>
                    <th className="border p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[d].map((s) => (
                    <tr key={s.id}>
                      <td className="border p-2">{s.username}</td>
                      <td className="border p-2">{s.timeslot}</td>
                      <td className="border p-2">{s.comment || "-"}</td>
                      <td className="border p-2 space-x-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
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

              {/* スマホ用カード */}
              <div className="md:hidden">
                {grouped[d].map((s) => (
                  <div
                    key={s.id}
                    className="border rounded p-3 mb-2 shadow-sm bg-white"
                  >
                    <p>
                      <strong>名前:</strong> {s.username}
                    </p>
                    <p>
                      <strong>時間帯:</strong> {s.timeslot}
                    </p>
                    <p>
                      <strong>コメント:</strong> {s.comment || "-"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
