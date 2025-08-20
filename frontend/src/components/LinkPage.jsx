import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range"); // range or multi
  const [date, setDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timeslot, setTimeslot] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 日付クリック処理
  const handleDateClick = (d) => {
    if (mode === "multi") {
      const exists = selectedDates.find(
        (x) => formatDate(x) === formatDate(d)
      );
      if (exists) {
        setSelectedDates(selectedDates.filter((x) => formatDate(x) !== formatDate(d)));
      } else {
        setSelectedDates([...selectedDates, d]);
      }
    } else if (mode === "range") {
      if (!startDate || (startDate && endDate)) {
        setStartDate(d);
        setEndDate(null);
      } else if (startDate && !endDate) {
        if (d >= startDate) {
          setEndDate(d);
        } else {
          setEndDate(startDate);
          setStartDate(d);
        }
      }
    }
    setDate(d);
  };

  // スケジュール登録
  const handleSubmit = async () => {
    try {
      if (!title) {
        alert("タイトルを入力してください");
        return;
      }

      let sDate = null;
      let eDate = null;

      if (mode === "range") {
        if (!startDate || !endDate) {
          alert("範囲を選択してください");
          return;
        }
        sDate = formatDate(startDate);
        eDate = formatDate(endDate);
      } else if (mode === "multi") {
        if (selectedDates.length === 0) {
          alert("日程を選択してください");
          return;
        }
        // 最小・最大日を保存
        sDate = formatDate(new Date(Math.min(...selectedDates.map(d => d.getTime()))));
        eDate = formatDate(new Date(Math.max(...selectedDates.map(d => d.getTime()))));
      }

      const res = await axios.post("/api/schedule", {
        title,
        start_date: sDate,
        end_date: eDate,
        timeslot,
        range_mode: mode,
      });

      if (res.data.link) {
        setShareUrl(res.data.link);
      }
    } catch (err) {
      console.error(err);
      alert("スケジュール登録に失敗しました");
    }
  };

  // カレンダーの日付スタイル
  const tileClassName = ({ date }) => {
    if (mode === "multi") {
      return selectedDates.some((d) => formatDate(d) === formatDate(date))
        ? "bg-[#FDB9C8] text-black rounded-full"
        : "";
    } else if (mode === "range" && startDate && endDate) {
      if (date >= startDate && date <= endDate) {
        return "bg-[#004CA0] text-white rounded-md";
      }
    }
    return "";
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#111] text-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-[#FDB9C8] mb-6">日程登録ページ</h2>

      {/* タイトル入力 */}
      <input
        type="text"
        className="w-full p-3 mb-6 rounded-lg bg-black border border-[#FDB9C8] focus:outline-none focus:ring-2 focus:ring-[#FDB9C8] text-lg"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* モード切り替え */}
      <div className="mb-6 flex space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={(e) => setMode(e.target.value)}
          />
          <span>範囲選択</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={(e) => setMode(e.target.value)}
          />
          <span>複数選択</span>
        </label>
      </div>

      {/* カレンダー */}
      <div className="mb-6 flex justify-center">
        <Calendar
          onClickDay={handleDateClick}
          value={date}
          tileClassName={tileClassName}
        />
      </div>

      {/* 時間帯プルダウン */}
      <select
        className="w-full p-3 mb-6 rounded-lg bg-black border border-[#004CA0] focus:outline-none focus:ring-2 focus:ring-[#004CA0] text-lg"
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
      >
        <option value="終日">終日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
        <option value="時間指定">時間指定 (1時〜0時)</option>
      </select>

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white rounded-lg text-lg font-bold shadow-lg hover:opacity-90 transition"
      >
        共有リンクを発行
      </button>

      {/* 発行されたリンク表示 */}
      {shareUrl && (
        <div className="mt-6 p-4 bg-black border border-[#FDB9C8] rounded-lg">
          <p className="text-[#FDB9C8] font-semibold">共有リンクが発行されました:</p>
          <a
            href={shareUrl}
            className="text-[#004CA0] underline break-all"
          >
            {window.location.origin}{shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
