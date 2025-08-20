import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP"); // 🇯🇵 日本の祝日

export default function SharePage() {
  const { linkId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answer, setAnswer] = useState("◯");

  // === スケジュール取得 ===
  useEffect(() => {
    if (!linkId) return;
    axios
      .get(`/api/schedules/${linkId}`)
      .then((res) => {
        setSchedule(res.data.schedule);
        setResponses(res.data.responses);
      })
      .catch((err) => console.error("共有スケジュール取得失敗:", err));
  }, [linkId]);

  // === 回答送信（同じユーザー名なら更新扱い） ===
  const handleSubmit = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post(`/api/schedules/${linkId}/response`, {
        username,
        answer,
      });
      // 即時反映
      const res = await axios.get(`/api/schedules/${linkId}`);
      setSchedule(res.data.schedule);
      setResponses(res.data.responses);
    } catch (err) {
      console.error("回答送信失敗:", err);
      alert("送信に失敗しました");
    }
  };

  // === カレンダー表示（祝日 + 登録日） ===
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (hd.isHoliday(date)) {
        return "holiday"; // 祝日は赤
      }
      if (
        schedule?.dates.some(
          (d) => new Date(d).toDateString() === date.toDateString()
        )
      ) {
        return "selected-day"; // 登録日を強調
      }
    }
    return null;
  };

  if (!schedule) {
    return <p>読み込み中...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-[#004CA0]">
        共有スケジュール: {schedule.title}
      </h2>

      <Calendar
        tileClassName={tileClassName}
        value={schedule.dates.map((d) => new Date(d))}
      />

      <p className="mt-4 font-semibold">時間帯: {schedule.timeslot}</p>

      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">出欠登録</h3>
        <input
          className="border p-2 mb-2 w-full rounded"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <select
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        >
          <option value="◯">◯ 出席</option>
          <option value="✖">✖ 欠席</option>
          <option value="△">△ 未定</option>
        </select>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-[#FDB9C8] text-black rounded-lg shadow hover:bg-[#e0a5b4]"
        >
          登録 / 更新
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">回答一覧</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">名前</th>
              <th className="border p-2">回答</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => (
              <tr key={i}>
                <td className="border p-2">{r.username}</td>
                <td className="border p-2">{r.answer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
