import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./ShareLinkPage.css";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState(null);
  const [timeSlot, setTimeSlot] = useState("全日");
  const [username, setUsername] = useState("");
  const [schedules, setSchedules] = useState([]);

  const timeSlots = ["朝", "昼", "夜", "全日"];

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`/api/schedules/${linkId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchSchedules();
  }, [linkId]);

  const handleDateChange = (d) => {
    if (mode === "single") {
      setDate(d);
      setSelectedDates([formatDate(d)]);
      setRange(null);
    } else if (mode === "multi") {
      const fd = formatDate(d);
      if (selectedDates.includes(fd)) {
        setSelectedDates(selectedDates.filter((x) => x !== fd));
      } else {
        setSelectedDates([...selectedDates, fd]);
      }
      setRange(null);
    } else if (mode === "range") {
      if (!range) {
        setRange([d, d]);
      } else {
        const [start] = range;
        const newRange = d < start ? [d, start] : [start, d];
        const days = [];
        let current = new Date(newRange[0]);
        while (current <= newRange[1]) {
          days.push(formatDate(current));
          current.setDate(current.getDate() + 1);
        }
        setRange(newRange);
        setSelectedDates(days);
      }
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      for (const d of selectedDates) {
        await axios.post("/api/schedule", {
          username,
          date: d,
          timeslot: timeSlot,
          linkId,
        });
      }
      alert("登録しました！");
      setSelectedDates([]);
      setRange(null);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました");
    }
  };

  const handleDelete = async (s) => {
    if (s.username !== username) {
      alert("自分の予定だけ削除できます");
      return;
    }
    if (!window.confirm(`${s.date} [${s.timeslot}] を削除しますか？`)) return;
    try {
      await axios.delete("/api/schedule", {
        data: {
          username: s.username,
          date: s.date,
          timeslot: s.timeslot,
          linkId,
        },
      });
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  };

  const grouped = {};
  schedules.forEach((s) => {
    if (!grouped[s.date]) {
      grouped[s.date] = {};
      timeSlots.forEach((ts) => (grouped[s.date][ts] = []));
    }
    grouped[s.date][s.timeslot].push(s);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      <p>リンクID: {linkId}</p>

      {/* 名前入力 */}
      <div>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* モード選択 */}
      <div>
        <label><input type="radio" value="single" checked={mode==="single"} onChange={()=>setMode("single")}/> 単日</label>
        <label><input type="radio" value="multi" checked={mode==="multi"} onChange={()=>setMode("multi")}/> 複数</label>
        <label><input type="radio" value="range" checked={mode==="range"} onChange={()=>setMode("range")}/> 範囲</label>
      </div>

      {/* カレンダー */}
      <Calendar
        onClickDay={handleDateChange}
        value={date}
        tileClassName={({ date }) => {
          const fd = formatDate(date);
          if (selectedDates.includes(fd)) return "selected-day";
          return null;
        }}
      />

      {/* 時間帯 */}
      <div>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e)=>setTimeSlot(e.target.value)}>
          {timeSlots.map((ts) => <option key={ts} value={ts}>{ts}</option>)}
        </select>
      </div>

      <button onClick={handleSave}>登録</button>

      {/* 一覧 表形式 */}
      <h3>登録済み一覧</h3>
      <div className="schedule-table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>日付</th>
              {timeSlots.map((ts) => <th key={ts}>{ts}</th>)}
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((d) => (
              <tr key={d}>
                <td>{d}</td>
                {timeSlots.map((ts) => (
                  <td key={ts}>
                    {grouped[d][ts].map((s,i)=>(
                      <span key={i} className="user-chip">
                        {s.username}
                        {s.username===username && (
                          <button className="delete-btn" onClick={()=>handleDelete(s)}>×</button>
                        )}
                      </span>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
