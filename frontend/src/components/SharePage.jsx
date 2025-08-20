import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedule(res.data.schedules[0]);
    setResponses(res.data.responses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }

    if (editId) {
      await axios.put(`/api/share/${linkid}/response/${editId}`, {
        username,
        answers,
      });
      setEditId(null);
    } else {
      await axios.post(`/api/share/${linkid}/response`, {
        username,
        answers,
      });
    }
    setUsername("");
    setAnswers({});
    fetchData();
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setUsername(r.username);
    setAnswers(r.answers);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("本当に削除しますか？")) return;
    await axios.delete(`/api/share/${linkid}/response/${id}`);
    fetchData();
  };

  if (!schedule) return <p className="text-white">読み込み中...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="card w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4 text-white">
          📊 {schedule.title} への回答
        </h2>

        <input
          type="text"
          placeholder="あなたの名前"
          className="w-full p-2 mb-2 rounded bg-black/40 text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="mb-3">
          {schedule.dates.map((d) => (
            <div key={d} className="flex items-center gap-2 mb-2">
              <span className="text-white w-32">{d}</span>
              <select
                value={answers[d] || ""}
                onChange={(e) => handleAnswerChange(d, e.target.value)}
                className="p-2 rounded bg-black/40 text-white"
              >
                <option value="">選択してください</option>
                <option value="〇">〇</option>
                <option value="✖">✖</option>
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded bg-[#004CA0] text-white font-bold hover:bg-[#003580] transition"
        >
          {editId ? "更新" : "保存"}
        </button>
      </div>

      {/* 回答一覧 */}
      <div className="card w-full max-w-4xl mt-6">
        <h3 className="text-lg font-bold text-white mb-2">📋 回答一覧</h3>
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-black/40 text-white">
              <th className="p-2 border border-white/20">名前</th>
              {schedule.dates.map((d) => (
                <th key={d} className="p-2 border border-white/20">{d}</th>
              ))}
              <th className="p-2 border border-white/20">操作</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id} className="hover:bg-white/10 text-white">
                <td className="p-2 border border-white/20">{r.username}</td>
                {schedule.dates.map((d) => (
                  <td key={d} className="p-2 border border-white/20">
                    {r.answers[d] || "-"}
                  </td>
                ))}
                <td className="p-2 border border-white/20 flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(r)}
                    className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
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
