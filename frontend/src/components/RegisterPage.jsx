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

const locales = { ja };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const RegisterPage = () => {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
        const data = await res.json();
        setHolidays(data);
      } catch (err) {
        console.error("祝日の取得に失敗:", err);
      }
    };
    fetchHolidays();
  }, []);

  // ✅ セル背景を変える
  const dayPropGetter = (date) => {
    if (!holidays) return {};

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

  // ✅ 日付セルをラップして祝日名を追加（元クラス保持）
  const CustomDateCellWrapper = ({ value, children }) => {
    const dateStr = value.toISOString().split("T")[0];
    return (
      <div className="rbc-date-cell" style={{ position: "relative" }}>
        {children}
        {holidays && holidays[dateStr] && (
          <div
            style={{
              color: "red",
              fontSize: "0.7em",
              position: "absolute",
              bottom: 2,
              left: 2,
              pointerEvents: "none",
            }}
          >
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
          dateCellWrapper: CustomDateCellWrapper,
        }}
      />
    </div>
  );
};

export default RegisterPage;
