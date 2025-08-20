import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState(new Date());

  return (
    <div>
      <div className="header">MilkPOP Calendar</div>
      <div className="flex flex-col items-center mt-8">
        <div className="card w-11/12 md:w-2/3">
          <h2 className="text-xl font-bold mb-4">個人スケジュール登録</h2>
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-4 rounded-lg border"
          />
          <textarea
            placeholder="メモを入力"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 mb-4 rounded-lg border"
          />
          <Calendar
            selectRange={true}
            onChange={setDates}
            value={dates}
          />
          <button className="btn-main mt-4">登録する</button>
        </div>
      </div>
    </div>
  );
}
