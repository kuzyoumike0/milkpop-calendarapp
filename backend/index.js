import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [timeSlot, setTimeSlot] = useState("全日");
  const [schedules, setSchedules] = useState([]);
  const [editId, setEditId] = useState(null);

  // 複数日選択
  const toggleDate = (d) => {
    const dateStr = d.toISOString().split("T")[0];
    if (dates.includes(dateStr)) {
      setDates(dates.filter((x) => x !== dateStr));
    } else {
      setDates([...dates, dateStr]);
    }
  };

  const fetchSchedules = async () => {
    const res = await axios.get("/api/personal");
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSave = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }

    if (editId) {
      // 更新
      await axios.put(`/api/personal/${editId}`, {
        title,
        memo,
        dates,
        timeslot: timeSlot,
      });
      setEditId(null);
    } else {
      // 新規
      await axios.post("/api/personal", {
        title,
        memo,
        dates,
        timeslot: timeSlot,
      });
    }

    setTitle("");
    setMemo("");
    setDates([]);
    setTimeSlot("全日");
    fetchSchedules();
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setTitle(s.title);
    setMemo(s.memo || "");
    setDates(s.dates);
    setTimeSlot(s.timeslot);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("本当に削除しますか？")) return;
    await axios.delete(`/api/personal/${id}`);
    fetchSchedules();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="card w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-white">📝 個人スケジュール</h2>

        <input
          type="text"
          placeholder="タイトル"
          className="w-full p-2 mb-2 rounded bg-black/40 text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="メモ"
          className="w-full p-2 mb-2 rounded bg-black/40 text-white"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <Calendar
          onClickDay={toggleDate}
          tileClassName={({ date }) =>
            dates.includes(date.toISOString().split("T")[0])
              ? "bg-[#FDB9C8] text-black rounded-lg"
              : ""
          }
        />

        <div className="mt-3 flex gap-2">
          <select
            className="p-2 rounded bg-black/40 text-white"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-[#FDB9C8] text-black font-bold hover:bg-[#fda5b7] transition"
          >
            {editId ? "更新" : "保存"}
          </button>
        </div>
      </div>

      {/* 一覧表示 */}
      <div className="card w-full max-w-4xl mt-6">
        <h3 className="text-lg font-bold text-white mb-2">📊 登録済みスケジュール</h3>
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-black/40 text-white">
              <th className="p-2 border border-white/20">タイトル</th>
              <th className="p-2 border border-white/20">日付</th>
              <th className="p-2 border border-white/20">時間帯</th>
              <th className="p-2 border border-white/20">メモ</th>
              <th className="p-2 border border-white/20">操作</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="hover:bg-white/10 text-white">
                <td className="p-2 border border-white/20">{s.title}</td>
                <td className="p-2 border border-white/20">{s.dates.join(", ")}</td>
                <td className="p-2 border border-white/20">{s.timeslot}</td>
                <td className="p-2 border border-white/20">{s.memo}</td>
                <td className="p-2 border border-white/20 flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(s)}
                    className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-400 transition"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
