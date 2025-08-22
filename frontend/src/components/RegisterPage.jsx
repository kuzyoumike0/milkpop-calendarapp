// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ja from "date-fns/locale/ja";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const locales = {
  ja: ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const RegisterPage = () => {
  const [events, setEvents] = useState([]);

  // イベント追加用（仮）
  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt("イベント名を入力してください");
    if (title) {
      setEvents([
        ...events,
        {
          start,
          end,
          title,
        },
      ]);
    }
  };

  const handleSelectEvent = (event) => {
    if (window.confirm(`削除しますか？\n${event.title}`)) {
      setEvents(events.filter((e) => e !== event));
    }
  };

  return (
    <div className="page-card">
      <h2 className="page-title">📅 スケジュール登録</h2>
      <p className="page-subtitle">Googleカレンダー風のUIで予定を管理できます</p>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          popup
          onSelectSlot={handleSelectSlot}   // クリックで追加
          onSelectEvent={handleSelectEvent} // イベントクリックで削除
          messages={{
            next: "次へ",
            previous: "前へ",
            today: "今日",
            month: "月",
            week: "週",
            day: "日",
            agenda: "リスト",
          }}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
