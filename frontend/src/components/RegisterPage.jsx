// src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import ja from "date-fns/locale/ja";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const locales = {
  ja: ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const RegisterPage = () => {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState({});

  // ✅ 日本の祝日APIから自動取得
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
        const data = await res.json();
        setHolidays(data); // { "2025-01-01": "元日", ... }
      } catch (err) {
        console.error("祝日の取得に失敗:", err);
      }
    };
    fetchHolidays();
  }, []);

  // ✅ 祝日セルを赤字＋背景色にする
  const dayPropGetter = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (holidays[dateStr]) {
      return {
        style: {
          backgroundColor: "rgba(255, 182, 193, 0.25)", // 薄ピンク
          color: "red",
          fontWeight: "bold",
        },
      };
    }
    return {};
  };

  // ✅ 日付セルに祝日名を表示
  const CustomDateCell = ({ value }) => {
    const dateStr = value.toISOString().split("T")[0];
    return (
      <div>
        <div>{value.getDate()}</div>
        {holidays[dateStr] && (
          <div style={{ color: "red", fontSize: "0.75em" }}>
            {holidays[dateStr]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="register-page">
      <h2 className="page-title">イベント登録</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, margin: "20px" }}
        dayPropGetter={dayPropGetter}
        components={{
          dateCellWrapper: CustomDateCell,
        }}
      />
    </div>
  );
};

export default RegisterPage;
