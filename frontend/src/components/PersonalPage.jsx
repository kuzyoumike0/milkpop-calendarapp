import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../personal.css";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(new Date());
  const [timeType, setTimeType] = useState("allday");
  const [events, setEvents] = useState([]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  // 予定取得
  useEffect(() => {
    fetch("/api/personal-events")
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : [])) // 安全に処理
      .catch((err) => {
        console.error("取得失敗:", err);
        setEvents([]); // 失敗したら空配列
      });
  }, []);

  // 祝日判定
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday && holiday[0]) {
        return <p className="holiday-name">{holiday[0].name}</p>;
