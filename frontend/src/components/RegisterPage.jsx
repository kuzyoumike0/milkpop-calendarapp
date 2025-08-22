import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [title, setTitle] = useState("");
  const [dateOptions, setDateOptions] = useState({});

  // ===== 日付クリック処理 =====
  const handleDateChange = (value) => {
    if (mode === "range") {
      setRange(value);
    } else {
      setMultiDates(value);
    }
  };

  // 選択済み日付を取得
  const selectedDates =
    mode === "range"
      ? range.filter((d) => d !== null)
      : multiDates;

  return (
    <div className="page-container">
      <main>
        <div className="register-layout">
          {/* ===== 左側：入力とカレンダー ===== */}
          <div className="calendar-section card">
            <h2 className="page-title">📅 日程登録</h2>

            {/* タイトル */}
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                className="input-box"
                placeholder="タイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* モード選択 */}
            <div className="form-group">
              <label>選択モード</label>
              <div className="radio-group">
                <label
                  className={`radio-label ${
                    mode === "range" ? "radio-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="range"
                    checked={mode === "range"}
                    onChange={() => setMode("range")}
                  />
                  範囲選択
                </label>
                <label
                  className={`radio-label ${
                    mode === "multi" ? "radio-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="multi"
                    checked={mode === "multi"}
                    onChange={() => setMode("multi")}
                  />
                  複数選択
                </label>
              </div>
            </div>

            {/* カレンダー */}
            <div className="calendar-wrapper">
              <Calendar
                onChange={handleDateChange}
                value={mode === "range" ? range : multiDates}
                selectRange={mode === "range"}
                className="custom-calendar"
              />
            </div>
          </div>

          {/* ===== 右側：選択日程リスト ===== */}
          <div className="schedule-section card">
            <h3 className="page-title">📝 選択した日程</h3>
            {selectedDates.length === 0 ? (
              <p>まだ日程が選択されていません</p>
            ) : (
              <ul>
                {selectedDates.map((d, i) => {
                  const dateKey = d.toISOString().split("T")[0];
                  return (
                    <li key={i} style={{ marginBottom: "12px" }}>
                      <strong>{d.toLocaleDateString()}</strong>
                      <br />
                      <select
                        className="vote-select"
                        value={dateOptions[dateKey]?.type || ""}
                        onChange={(e) =>
                          setDateOptions((prev) => ({
                            ...prev,
                            [dateKey]: {
                              ...prev[dateKey],
                              type: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="">区分を選択</option>
                        <option value="終日">終日</option>
                        <option value="午前">午前</option>
                        <option value="午後">午後</option>
                        <option value="時間指定">時間指定</option>
                      </select>

                      {/* 時間指定の場合プルダウン表示 */}
                      {dateOptions[dateKey]?.type === "時間指定" && (
                        <div style={{ marginTop: "6px" }}>
                          <select
                            className="vote-select"
                            value={dateOptions[dateKey]?.start || ""}
                            onChange={(e) =>
                              setDateOptions((prev) => ({
                                ...prev,
                                [dateKey]: {
                                  ...prev[dateKey],
                                  start: e.target.value,
                                },
                              }))
                            }
                          >
                            <option value="">開始時刻</option>
                            {Array.from({ length: 24 }, (_, h) => (
                              <option key={h} value={`${h}:00`}>
                                {h}:00
                              </option>
                            ))}
                          </select>
                          <span> ～ </span>
                          <select
                            className="vote-select"
                            value={dateOptions[dateKey]?.end || ""}
                            onChange={(e) =>
                              setDateOptions((prev) => ({
                                ...prev,
                                [dateKey]: {
                                  ...prev[dateKey],
                                  end: e.target.value,
                                },
                              }))
                            }
                          >
                            <option value="">終了時刻</option>
                            {Array.from({ length: 24 }, (_, h) => (
                              <option key={h} value={`${h}:00`}>
                                {h}:00
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="form-actions">
              <button className="submit-btn">保存 & 共有リンク発行</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
