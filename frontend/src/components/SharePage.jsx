import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";

export default function SharePage() {
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    // 共有スケジュールを取得
    axios.get("/api/shared").then((res) => setSchedules(res.data));
  }, []);

  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    axios.post("/api/shared/responses", { responses }).then(() => {
      alert("保存しました！");
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold mb-6 text-[#FDB9C8]">
          共有スケジュール
        </h2>

        {schedules.length === 0 ? (
          <p>まだ共有された日程はありません。</p>
        ) : (
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[#FDB9C8] text-black">
                <th className="p-2">日付</th>
                <th className="p-2">時間帯</th>
                <th className="p-2">選択</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b border-gray-700">
                  <td className="p-2">{s.date}</td>
                  <td className="p-2">{s.timeslot}</td>
                  <td className="p-2">
                    <select
                      className="px-3 py-1 rounded-lg text-black"
                      value={responses[s.id] || ""}
                      onChange={(e) => handleChange(s.id, e.target.value)}
                    >
                      <option value="">選択してください</option>
                      <option value="〇">〇</option>
                      <option value="✖">✖</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={handleSave}
          className="mt-6 px-6 py-3 bg-[#FDB9C8] text-black rounded-2xl font-semibold shadow hover:bg-[#004CA0] hover:text-white transition"
        >
          保存
        </button>
      </main>

      <Footer />
    </div>
  );
}
