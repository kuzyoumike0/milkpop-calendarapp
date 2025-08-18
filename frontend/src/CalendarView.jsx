import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import jsHolidays from "japanese-holidays";

function ymd(d){
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CalendarView(){
  const [mode, setMode] = useState("range"); // "range" or "multi"
  const [rangeValue, setRangeValue] = useState([new Date(), new Date()]);
  const [multiDays, setMultiDays] = useState([]);
  const [kind, setKind] = useState("allday"); // "allday" | "time"
  const [slot, setSlot] = useState("終日");
  const [startH, setStartH] = useState("09");
  const [endH, setEndH] = useState("18");
  const [title, setTitle] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const hours = useMemo(() => Array.from({length:24}, (_,i)=>String(i).padStart(2,"0")), []);

  // 範囲 → 日付配列化
  const rangeDates = useMemo(() => {
    if (!Array.isArray(rangeValue)) return [];
    const [s,eRaw] = rangeValue;
    if (!s) return [];
    const e = eRaw || s;
    const list = [];
    const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    while (cur <= end) {
      list.push(ymd(cur));
      cur.setDate(cur.getDate()+1);
    }
    return list;
  }, [rangeValue]);

  const dates = mode==="range" ? rangeDates : multiDays;

  const onClickDay = (date) => {
    if (mode!=="multi") return;
    const key = ymd(date);
    setMultiDays(prev => prev.includes(key) ? prev.filter(d=>d!==key) : [...prev, key]);
  };

  const onShare = async () => {
    if (dates.length === 0){
      alert("日付を選択してください。");
      return;
    }
    try {
      const payload = {
        dates,
        slotmode: kind,
        slot: kind==="allday" ? slot : null,
        start_time: kind==="time" ? startH : null,
        end_time: kind==="time" ? endH : null,
        title
      };
      const res = await axios.post("/api/share-link", payload);
      setShareUrl(res.data.url);
    } catch (err) {
      console.error(err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  // タイル装飾
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const key = ymd(date);
    const cls = [];
    if (mode==="range") {
      const [s,eRaw] = rangeValue;
      if (s) {
        const sKey = ymd(s);
        const eKey = ymd(eRaw||s);
        if (key === sKey) cls.push("range-start");
        else if (key === eKey) cls.push("range-end");
        else if (date > s && date < (eRaw||s)) cls.push("in-range");
      }
    }
    if (mode==="multi" && multiDays.includes(key)) cls.push("selected-day");

    const holiday = jsHolidays.isHoliday(date);
    if (holiday) cls.push("react-calendar__tile--holiday");

    return cls.join(" ");
  };

  return (
    <div className="grid">
      <section className="panel">
        <div className="row" style={{ justifyContent:"space-between", marginBottom:8 }}>
          <div className="row">
            <label className="radio">
              <input type="radio" value="range" checked={mode==="range"} onChange={()=>setMode("range")} />
              範囲選択
            </label>
            <label className="radio">
              <input type="radio" value="multi" checked={mode==="multi"} onChange={()=>setMode("multi")} />
              複数選択
            </label>
          </div>
          <div className="info">
            {mode==="range"
              ? `選択: ${rangeDates[0]||"-"} 〜 ${rangeDates[rangeDates.length-1]||"-"} （${rangeDates.length}日）`
              : `選択: ${multiDays.length}日`}
          </div>
        </div>

        <Calendar
          selectRange={mode==="range"}
          onChange={v=>mode==="range" && setRangeValue(Array.isArray(v)?v:[v,v])}
          onClickDay={onClickDay}
          tileClassName={tileClassName}
        />
      </section>

      <aside className="panel">
        <div className="controls">
          <div className="row">
            <label className="radio">
              <input type="radio" name="kind" value="allday" checked={kind==="allday"} onChange={()=>setKind("allday")} />
              終日・昼・夜
            </label>
            <label className="radio">
              <input type="radio" name="kind" value="time" checked={kind==="time"} onChange={()=>setKind("time")} />
              時間指定
            </label>
          </div>

          {kind==="allday"
            ? <select value={slot} onChange={e=>setSlot(e.target.value)}>
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
              </select>
            : <div className="time-row">
                <select value={startH} onChange={e=>setStartH(e.target.value)}>
                  {hours.map(h=> <option key={h} value={h}>{parseInt(h,10)}:00</option>)}
                </select>
                <span>〜</span>
                <select value={endH} onChange={e=>setEndH(e.target.value)}>
                  {hours.map(h=> <option key={h} value={h}>{parseInt(h,10)}:00</option>)}
                </select>
              </div>
          }

          <input
            type="text"
            placeholder="予定タイトル（任意）"
            value={title}
            onChange={e=>setTitle(e.target.value)}
          />

          <button className="btn" onClick={onShare}>🔗 共有リンクを発行</button>

          {shareUrl &&
            <div className="share">
              <strong>共有リンク:</strong><br />
              <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
            </div>
          }
        </div>
      </aside>
    </div>
  );
}
