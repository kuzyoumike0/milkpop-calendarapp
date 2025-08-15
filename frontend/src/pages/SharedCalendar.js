// src/pages/SharedCalendar.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import dayjs from "dayjs";

export default function SharedCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ user: "", time_slot: "全日", title: "" });

  const fetchEvents = () => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    axios.get(`/api/events?date=${formattedDate}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => fetchEvents(), [date]);

  const handleAddEvent = () => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    axios.post("/api/events", { ...newEvent, date: formattedDate })
      .then(() => {
        setNewEvent({ user: "", time_slot: "全日", title: "" });
        fetchEvents();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteEvent = (id) => {
    axios.delete(`/api/events/${id}`).then(() => fetchEvents());
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">共有カレンダー</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左: 日付カレンダー */}
        <div className="md:w-1/3 bg-white rounded-lg shadow p-4">
          <Calendar
            value={date}
            onChange={setDate}
            className="rounded-lg border border-gray-200"
          />
        </div>

        {/* 右: 予定一覧 & 追加 */}
        <div className="md:w-2/3 bg-white rounded-lg shadow p-4 flex flex-col gap-4">
          {/* 追加フォーム */}
          <div className="bg-gray-50 p-4 rounded flex flex-col md:flex-row gap-2 items-center">
            <input
              type="text"
              placeholder="ユーザー名"
              className="border rounded px-2 py-1 flex-1"
              value={newEvent.user}
              onChange={(e) => setNewEvent({ ...newEvent, user: e.target.value })}
            />
            <select
              className="border rounded px-2 py-1"
              value={newEvent.time_slot}
              onChange={(e) => setNewEvent({ ...newEvent, time_slot: e.target.value })}
            >
              <option value="全日">全日</option>
              <option value="昼">昼</option>
              <option value="夜">夜</option>
            </select>
            <input
              type="text"
              placeholder="予定タイトル"
              className="border rounded px-2 py-1 flex-1"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.t
