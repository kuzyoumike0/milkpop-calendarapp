import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectionType, setSelectionType] = useState("multiple");
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState({ start: null, end: null });
  const [timeType, setTimeType] = useState("allday");
  const [timeRange, setTimeRange] = useState({ start: "09:00", end: "18:00" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const scheduleId = uuidv4();
    const payload =
      selectionType === "multiple"
        ? { id: scheduleId, title, dates: selectedDates, timeType, timeRange }
        : { id: scheduleId, title, range, timeType, timeRange };

    // バックエンドへ保存
    await fetch("https://your-railway-app-url/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 共有リンクへ遷移
    navigate(`/share/${scheduleId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#FDB9C8] to-[#004CA0] text-white">
      <header className="w-full bg-black bg-opacity-70 py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl p-6">
        <div className="bg-black bg-opacity-50 rounded-2xl shadow-xl p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">日程登録</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="タイトルを入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-black"
            />

            <div className="flex space-x-6 items-center">
              <label>
                <input
                  type="radio"
                  value="multiple"
                  checked={selectionType === "multiple"}
                  onChange={(e) => setSelectionType(e.target.value)}
                />
                複数選択
              </label>
              <label>
                <input
                  type="radio"
                  value="range"
                  checked={selectionType === "range"}
                  onChange={(e) => setSelectionType(e.target.value)}
                />
                範囲選択
              </label>
            </div>

            {/* TODO: カレンダーUIを組み込み（前のコードにあったもの） */}

            <div className="bg-white text-black rounded-xl p-4 shadow-md space-y-2">
              <p className="font-semibold">時間帯を選択してください:</p>
              <div className="flex flex-col space-y-1">
                <label>
                  <input
                    type="radio"
                    value="allday"
                    checked={timeType === "allday"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  全日
                </label>
                <label>
                  <input
                    type="radio"
                    value="daytime"
                    checked={timeType === "daytime"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  昼（09:00〜18:00）
                </label>
                <label>
                  <input
                    type="radio"
                    value="night"
                    checked={timeType === "night"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  夜（18:00〜23:59）
                </label>
                <label>
                  <input
                    type="radio"
                    value="custom"
                    checked={timeType === "custom"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  時刻指定
                </label>
              </div>

              {timeType === "custom" && (
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="time"
                    value={timeRange.start}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, start: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                  <span>〜</span>
                  <input
                    type="time"
                    value={timeRange.end}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, end: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#FDB9C8] hover:bg-[#e89cab] text-black font-bold"
            >
              共有リンクを発行
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
