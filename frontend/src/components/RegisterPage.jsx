import React, { useState } from "react";
import "../index.css";
import { v4 as uuidv4 } from "uuid"; // ← 共有リンク用ID生成

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [shareLink, setShareLink] = useState(null);

  const timeOptions = [...Array(24).keys()].map((h) => `${h}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00");

  // ===== 日付をISO文字列に変換 =====
  const formatIso = (date) => date.toISOString().split("T")[0];

  // ===== 複数選択モード =====
  const handleDateClick = (date) => {
    const iso = formatIso(date);
    if (multiDates.includes(iso)) {
      setMultiDates(multiDates.filter((d) => d !== iso));
      const newOptions = { ...dateOptions };
      delete newOptions[iso];
      setDateOptions(newOptions);
    } else {
      setMultiDates([...multiDates, iso]);
      setDateOptions({
        ...dateOptions,
        [iso]: { type: "終日", start: "09:00", end: "18:00" },
      });
    }
  };

  // ===== プルダウン変更 =====
  const handleOptionChange = (date, field, value) => {
    let newValue = value;
    if (field === "start" && dateOptions[date]?.end) {
      if (timeOptions.indexOf(value) >= endTimeOptions.indexOf(dateOptions[date].end)) {
        newValue = dateOptions[date].end;
      }
    }
    if (field === "end" && dateOptions[date]?.start) {
      if (endTimeOptions.indexOf(value) <= timeOptions.indexOf(dateOptions[date].start)) {
        newValue = dateOptions[date].start;
      }
    }
    setDateOptions({
      ...dateOptions,
      [date]: {
        ...dateOptions[date],
        [field]: newValue,
      },
    });
  };

  // ===== 範囲選択を日付リストに展開 =====
  const getRangeDates = () => {
    if (!range[0] || !range[1]) return [];
    const start = new Date(range[0]);
    const end = new Date(range[1]);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(formatIso(new Date(d)));
    }
    return dates;
  };

  // ===== 保存 & 共有リンク発行 =====
  const handleShare = async () => {
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }

    // 日程データを作成
    const dates = (mode === "range" ? getRangeDates() : multiDates).map((date) => ({
      date,
      type: dateOptions[date]?.type || "終日",
      start: dateOptions[date]?.start || "09:00",
      end: dateOptions[date]?.end || "18:00",
    }));

    if (dates.length === 0) {
      alert("日程を選択してください");
      return;
    }

    const shareId = uuidv4();
    const newSchedule = { share_id: shareId, title, dates };

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });

      if (res.ok) {
        const fakeUrl = `${window.location.origin}/share/${shareId}`;
        setShareLink(fakeUrl);
      } else {
        alert("スケジュール保存に失敗しました");
      }
    } catch (err) {
      console.error("保存エラー:", err);
      alert("エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* ===== バナー ===== */}
      <header className="shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="nav">
          <a href="/" className="hover:text-[#FDB9C8]">トップ</a>
          <a href="/register" className="hover:text-[#FDB9C8]">日程登録</a>
          <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
        </nav>
      </header>

      <main>
        {/* ===== タイトル入力 ===== */}
        <div className="mb-6 mt-24">
          <label className="block text-lg mb-2">タイトル</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-black rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 打ち合わせ日程"
          />
        </div>

        {/* ===== モード切替 ===== */}
        <div className="mb-4 flex gap-4">
          <button
            className={`px-4 py-2 rounded-full ${mode === "range" ? "bg-[#FDB9C8] text-black" : "bg-gray-700"}`}
            onClick={() => { setMode("range"); setMultiDates([]); }}
          >
            範囲選択
          </button>
          <button
            className={`px-4 py-2 rounded-full ${mode === "multi" ? "bg-[#FDB9C8] text-black" : "bg-gray-700"}`}
            onClick={() => { setMode("multi"); setRange([null, null]); }}
          >
            複数選択
          </button>
        </div>

        {/* ===== 選択した日程リスト ===== */}
        <div className="schedule-section">
          <h2 className="text-xl font-bold mb-4 text-[#004CA0]">📅 選択した日程</h2>

          {(mode === "range" ? getRangeDates() : multiDates).map((date) => (
            <div key={date} className="schedule-card">
              <span>{date}</span>
              <select
                value={dateOptions[date]?.type || "終日"}
                onChange={(e) => handleOptionChange(date, "type", e.target.value)}
              >
                <option value="終日">終日</option>
                <option value="午前">午前</option>
                <option value="午後">午後</option>
                <option value="時間指定">時間指定</option>
              </select>
              {dateOptions[date]?.type === "時間指定" && (
                <>
                  <select
                    value={dateOptions[date]?.start || "09:00"}
                    onChange={(e) => handleOptionChange(date, "start", e.target.value)}
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span>〜</span>
                  <select
                    value={dateOptions[date]?.end || "18:00"}
                    onChange={(e) => handleOptionChange(date, "end", e.target.value)}
                  >
                    {endTimeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          ))}

          {/* ===== 共有リンク ===== */}
          <div className="mt-6">
            <button onClick={handleShare} className="share-btn">共有リンクを作成</button>
            {shareLink && (
              <div className="mt-3 text-sm text-black bg-white p-3 rounded-lg shadow flex items-center gap-3">
                <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {shareLink}
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert("リンクをコピーしました！");
                  }}
                  className="copy-btn"
                >
                  コピー
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer>
        <p>© 2025 MilkPOP Calendar</p>
      </footer>
    </div>
  );
};

export default RegisterPage;
