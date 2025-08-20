import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState(new Date());
  const [url, setUrl] = useState("");

  const handleRegister = () => {
    // 仮実装：リンク発行
    setUrl("https://example.com/share/xxxxxx");
  };

  return (
    <div>
      <div className="header">MilkPOP Calendar</div>
      <div className="flex flex-col items-center mt-8">
        <div className="card w-11/12 md:w-2/3">
          <h2 className="text-xl font-bold mb-4">日程登録</h2>
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-4 rounded-lg border"
          />
          <Calendar
            selectRange={true}
            onChange={setDates}
            value={dates}
          />
          <button onClick={handleRegister} className="btn-main mt-4">
            共有リンク発行
          </button>
          {url && (
            <div className="mt-4">
              <p className="text-sm">共有リンク:</p>
              <a href={url} className="text-blue-700 underline">{url}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
