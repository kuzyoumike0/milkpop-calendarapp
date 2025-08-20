import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple"); // "range" or "multiple"
  const [schedules, setSchedules] = useState([]); // ← 初期値を [] に修正
  const navigate = useNavigate();

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 予定一覧取得
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get("/api/schedule");
        // res.data.schedules が配列ならそれを使う
        setSchedules(res.data.schedules || []);
      } catch (err) {
        console.error("予定取得に失敗:", err);
        setSchedules([]);
      }
    };
    fetchSchedules();
  }, []);

  // カレンダー変更
  const handleCalendarChange = (value) => {
    if (rangeMode === "range" && Array.isArray(value)) {
      const [start, end] = value;
      if (start && end) {
        let current = new Date(start);
        const datesArr = [];
        while (current <= end) {
          datesArr.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setDates(datesArr);
      }
    } else if (rangeMode === "multiple") {
      setDates((prev) => {
        const exists = prev.find((d) => d.getTime() === value.getTime());
        if (exists) {
          return prev.filter((d) => d.getTime() !== value.getTime());
        } else {
          return [...prev, value];
        }
      });
    }
  };

  // リンク発行
  const handleCreateLink = async () => {
    if (!title.trim() || dates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }

    try {
      const formattedDates = dates.map((d) => formatDate(d));
      const res = await axios.post("/api/share", {
        title,
        dates: formattedDates,
        range_mode: rangeMode,
      });

      const { linkid } = res.data;
      alert(`共有リンクを作成しました: ${window.location.origin}/share/${linkid}`);
      navigate(`/share/${linkid}`);
    } catch (err) {
      console.error("共有リンク作成失敗:", err);
      alert("共有リンクの作成に失敗しました");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-pink-400">日程登録ページ</h2>

      <div className="mb-4">
        <label className="block mb-1">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 w-full bg-gray-800 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">選択モード:</label>
        <label className="mr-4">
          <input
            type="radio"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />{" "}
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />{" "}
          複数選択
        </label>
      </div>

      <div className="mb-4">
        <Calendar
          onChange={handleCalendarChange}
          selectRange={rangeMode === "range"}
        />
      </div>

      <div className="mb-4">
        <button
          onClick={handleCreateLink}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded"
        >
          共有リンク発行
        </button>
      </div>

      <h3 className="text-xl font-bold mb-2">既存のスケジュール一覧</h3>
      <ul className="bg-gray-800 rounded p-2">
        {Array.isArray(schedules) && schedules.length > 0 ? (
          schedules.map((s, i) => (
            <li key={i} className="border-b border-gray-700 py-1">
              {s.title} ({s.dates?.join(", ")})
            </li>
          ))
        ) : (
          <li className="text-gray-400">スケジュールがありません</li>
        )}
      </ul>
    </div>
  );
}
