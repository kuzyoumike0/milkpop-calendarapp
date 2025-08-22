import React, { useState } from "react";
import "../index.css";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectionMode, setSelectionMode] = useState("range");
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);

  const [title, setTitle] = useState("");
  const [responses, setResponses] = useState({});
  const [shareUrl, setShareUrl] = useState("");

  const timeOptions = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // 日付クリック（省略: 前と同じ）
  const handleDateClick = (date) => {
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([date]);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const range = [];
        let d = new Date(start);
        while (d <= end) {
          range.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(range);
        setRangeStart(null);
      }
    } else if (selectionMode === "multiple") {
      const exists = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      if (exists) {
        setSelectedDates(
          selectedDates.filter((d) => d.toDateString() !== date.toDateString())
        );
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  const formatDate = (date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  const handleResponseChange = (dateStr, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [field]: value,
      },
    }));
  };

  // ランダムURL生成
  const generateShareUrl = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/share/${randomId}`;
    setShareUrl(url);
  };

  return (
    <div className="card">
      <h2 className="page-title">日程登録ページ</h2>

      {/* タイトル */}
      <div className="title-input">
        <label>タイトル：</label>
        <input
          type="text"
          placeholder="イベントのタイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 選択モード */}
      <div className="calendar-mode">
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => {
              setSelectionMode("range");
              setSelectedDates([]);
            }}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => {
              setSelectionMode("multiple");
              setSelectedDates([]);
            }}
          />
          複数選択
        </label>
      </div>

      {/* ▼ カレンダー本体は省略（既存と同じ） */}

      {/* 選択日程表示 */}
      {selectedDates.length > 0 && (
        <div className="selected-dates">
          <h3>選択した日程</h3>
          {selectedDates.map((date) => {
            const dateStr = formatDate(date);
            const resp = responses[dateStr] || {};
            return (
              <div key={dateStr} className="date-response">
                <span>{dateStr}</span>
                <select
                  value={resp.type || ""}
                  onChange={(e) =>
                    handleResponseChange(dateStr, "type", e.target.value)
                  }
                >
                  <option value="">選択してください</option>
                  <option value="終日">終日</option>
                  <option value="昼">昼</option>
                  <option value="夜">夜</option>
                  <option value="時刻指定">時刻指定</option>
                </select>
                {resp.type === "時刻指定" && (
                  <>
                    <select
                      value={resp.start || ""}
                      onChange={(e) =>
                        handleResponseChange(dateStr, "start", e.target.value)
                      }
                    >
                      <option value="">開始時刻</option>
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={resp.end || ""}
                      onChange={(e) =>
                        handleResponseChange(dateStr, "end", e.target.value)
                      }
                    >
                      <option value="">終了時刻</option>
                      {timeOptions
                        .filter(
                          (t) =>
                            !resp.start || parseInt(t) > parseInt(resp.start)
                        )
                        .map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                    </select>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 共有リンク生成ボタン */}
      <button onClick={generateShareUrl}>共有リンクを生成</button>
      {shareUrl && (
        <div style={{ marginTop: "12px" }}>
          <strong>共有URL:</strong>{" "}
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
