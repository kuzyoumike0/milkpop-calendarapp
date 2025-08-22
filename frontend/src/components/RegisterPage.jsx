import React, { useState } from "react";
import Calendar from "react-calendar";
import "../index.css";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Select,
  useDisclosure,
} from "@chakra-ui/react";

// 日付をキー用にフォーマット
const dateKey = (date) => {
  return date.toISOString().split("T")[0];
};

// 時間リスト（1:00〜24:00）
const hours = Array.from({ length: 24 }, (_, i) => `${i + 1}:00`);

const RegisterPage = () => {
  const [selectionMode, setSelectionMode] = useState("range"); // "range" or "multiple"
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({}); // { "2025-08-22": { time, start, end } }

  // 編集対象
  const [editDate, setEditDate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 日付クリック処理
  const handleDateClick = (date) => {
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([date]);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const days = [];
        let d = new Date(start);
        while (d <= end) {
          days.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(days);
        setRangeStart(null);
      }
    } else {
      // 複数選択
      const exists = selectedDates.some(
        (d) => dateKey(d) === dateKey(date)
      );
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => dateKey(d) !== dateKey(date)));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  // プルダウン変更
  const handleOptionChange = (date, field, value) => {
    const key = dateKey(date);
    setDateOptions((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // 削除ボタン
  const handleDelete = (date) => {
    const key = dateKey(date);
    setSelectedDates(selectedDates.filter((d) => dateKey(d) !== key));
    setDateOptions((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // 編集ボタン（モーダルを開く）
  const handleEdit = (date) => {
    setEditDate(date);
    onOpen();
  };

  // 編集保存
  const handleSaveEdit = () => {
    onClose();
  };

  // 送信処理
  const handleSubmit = async () => {
    const results = selectedDates.map((d) => {
      const key = dateKey(d);
      return { date: key, ...dateOptions[key] };
    });

    // バリデーション
    for (const r of results) {
      if (r.time === "時間指定") {
        if (!r.start || !r.end || r.start >= r.end) {
          alert(`${r.date} の開始・終了時刻が不正です`);
          return;
        }
      }
    }

    try {
      const res = await fetch("http://localhost:5000/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: results }),
      });

      if (!res.ok) throw new Error("送信失敗");

      const data = await res.json();
      alert("送信成功！\n" + JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      alert("サーバーへの送信に失敗しました");
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      {/* 範囲選択・複数選択切替 */}
      <div className="mode-switch">
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          複数選択
        </label>
      </div>

      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={({ date }) =>
              selectedDates.some((d) => dateKey(d) === dateKey(date))
                ? "selected"
                : ""
            }
          />
        </div>

        {/* 日程リスト */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {selectedDates.map((date) => {
            const key = dateKey(date);
            return (
              <div key={key} className="schedule-item">
                <span>{key}</span>

                <select
                  value={dateOptions[key]?.time || ""}
                  onChange={(e) => handleOptionChange(date, "time", e.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="終日">終日</option>
                  <option value="午前">午前</option>
                  <option value="午後">午後</option>
                  <option value="夜">夜</option>
                  <option value="時間指定">時間指定</option>
                </select>

                {dateOptions[key]?.time === "時間指定" && (
                  <>
                    <select
                      value={dateOptions[key]?.start || ""}
                      onChange={(e) => handleOptionChange(date, "start", e.target.value)}
                    >
                      <option value="">開始時刻</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <select
                      value={dateOptions[key]?.end || ""}
                      onChange={(e) => handleOptionChange(date, "end", e.target.value)}
                    >
                      <option value="">終了時刻</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </>
                )}

                <button onClick={() => handleEdit(date)}>✏️</button>
                <button onClick={() => handleDelete(date)}>🗑️</button>
              </div>
            );
          })}

          {selectedDates.length > 0 && (
            <button className="submit-btn" onClick={handleSubmit}>
              送信する
            </button>
          )}
        </div>
      </div>

      {/* 編集モーダル */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editDate ? `${dateKey(editDate)} の編集` : "編集"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editDate && (
              <>
                <Select
                  mb={3}
                  value={dateOptions[dateKey(editDate)]?.time || ""}
                  onChange={(e) =>
                    handleOptionChange(editDate, "time", e.target.value)
                  }
                >
                  <option value="">選択してください</option>
                  <option value="終日">終日</option>
                  <option value="午前">午前</option>
                  <option value="午後">午後</option>
                  <option value="夜">夜</option>
                  <option value="時間指定">時間指定</option>
                </Select>

                {dateOptions[dateKey(editDate)]?.time === "時間指定" && (
                  <>
                    <Select
                      mb={3}
                      value={dateOptions[dateKey(editDate)]?.start || ""}
                      onChange={(e) =>
                        handleOptionChange(editDate, "start", e.target.value)
                      }
                    >
                      <option value="">開始時刻</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </Select>
                    <Select
                      value={dateOptions[dateKey(editDate)]?.end || ""}
                      onChange={(e) =>
                        handleOptionChange(editDate, "end", e.target.value)
                      }
                    >
                      <option value="">終了時刻</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </Select>
                  </>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveEdit}>
              保存
            </Button>
            <Button variant="ghost" onClick={onClose}>
              キャンセル
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RegisterPage;
