import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [username, setUsername] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("range");
  const [timeSlot, setTimeSlot] = useState("終日");
  const [schedules, setSchedules] = useState([]);

  const handleDateChange = (selected) => {
    if (rangeMode === "range") {
      setDates(
        Array.isArray(selected)
          ? [selected[0], selected[1]]
          : [selected]
      );
    } else {
      setDates(Array.isArray(selected) ? selected : [selected]);
    }
  };

  const fetchSchedules = async () => {
    const res = await axios.get("/api/schedules");
    setSchedules(res.data);
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/api/schedules", {
        title,
        memo,
        dates,
        timeslot: timeSlot,
        range_mode: rangeMode,
        username,
      })
