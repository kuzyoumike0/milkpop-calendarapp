import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { v4 as uuidv4 } from "uuid";

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [events, setEvents] = useState([]);
  const [linkId, setLinkId] = useState(null);

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // イベント取得
  useEffect(() => {
    const fetchEvents = async () => {
      const formattedDate = formatDate(date);
      try {
        const res = await axios.get(`/api/shared?date=${formattedDate}`);
        setEvents(res.data);
      } catch (err) {
        console.error("予定取得に失敗:", err);
      }
    };
    fetchEvents();
  }, [date]);

  // 日程登録
  const handleRegister = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post("/api/personal", {
        username,
        date: formatDate(date),
        timeslot: timeSlot,
      });
      alert("予定を登録しました");
      setUsername("");
      setTimeSlot("全日");
      const res = await axios.get(`/api/shared?date=${formatDate(date)}`);
      setEvents(res.data);
    } catch (err) {
      console.error("予定登録に失敗:", err);
      alert("予定登録に失敗しました");
    }
  };

  // 共有リンク発行
  const handleCreateShareLink = async () => {
    try {
      const res = await axios.post("/api/share", {});
      setLinkId(res.data.linkId);
    } catch (err) {
      console.error("共有リンク作成に失敗:", err);
      alert("共有リンクの作成に失敗しました");
