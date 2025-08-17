
import React, { useEffect, useState } from "react";
import axios from "axios";

const SLOT_OPTIONS = ['全日','朝','昼','夜','中締め'];

export default function SharedLinkPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectMode, setSelectMode] = useState("single"); // 'single' | 'multi'
  const [slotSingle, setSlotSingle] = useState('全日');
  const [slotMulti, setSlotMulti] = useState(['全日']);

  const segments = window.location.pathname.split('/').filter(Boolean);
  const shareId = segments[segments.length - 1] || 'demo';

  const fetchEvents = async () => {
    const res = await axios.get(`/api/shared/${shareId}/events`, { params: { date } });
    setEvents(res.data);
  };

  React.useEffect(() => { fetchEvents(); /* eslint-disable-next-line */ }, [date]);

  const toggleMulti = (label) => {
    setSlotMulti(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }
    const payload = {
      eventDate: date,
      title: title.trim(),
      memo: memo || "",
      slots: selectMode === 'single' ? slotSingle : slotMulti
    };
    try {
      await axios.post(`/api/shared/${shareId}/events`, payload);
      setTitle("");
      setMemo("");
      if (selectMode === 'multi') setSlotMulti(['全日']);
      else setSlotSingle('全日');
      await fetchEvents();
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div style={{maxWidth: 720, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"}}>
      <h1>共有スケジュール</h1>

      <label>日付</label><br />
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} />

      <form onSubmit={handleSubmit} style={{marginTop: "1rem"}}>
        <div>
          <label>タイトル（必須）</label><br />
          <input
            type="text"
            value={title}
            onChange={e=>setTitle(e.target.value)}
            placeholder="例：打ち合わせ"
            required
            style={{width: "100%", padding: ".5rem"}}
          />
        </div>

        <div style={{marginTop: ".5rem"}}>
          <label>メモ（任意）</label><br />
          <textarea
            value={memo}
            onChange={e=>setMemo(e.target.value)}
            style={{width: "100%", padding: ".5rem", minHeight: 80}}
          />
        </div>

        <div style={{marginTop: ".75rem"}}>
          <label>選択方式：</label>
          <label style={{marginRight: "1rem"}}>
            <input
              type="radio"
              name="mode"
              value="single"
              checked={selectMode === 'single'}
              onChange={()=>setSelectMode('single')}
            />
            単一（ラジオ）
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="multi"
              checked={selectMode === 'multi'}
              onChange={()=>setSelectMode('multi')}
            />
            複数（チェック）
          </label>
        </div>

        {selectMode === 'single' && (
          <div style={{marginTop: ".5rem"}}>
            {SLOT_OPTIONS.map((label)=>(
              <label key={label} style={{marginRight: "1rem"}}>
                <input
                  type="radio"
                  name="slotSingle"
                  value={label}
                  checked={slotSingle === label}
                  onChange={()=>setSlotSingle(label)}
                />
                {label}
              </label>
            ))}
          </div>
        )}

        {selectMode === 'multi' && (
          <div style={{marginTop: ".5rem"}}>
            {SLOT_OPTIONS.map((label)=>(
              <label key={label} style={{marginRight: "1rem"}}>
                <input
                  type="checkbox"
                  checked={slotMulti.includes(label)}
                  onChange={()=>toggleMulti(label)}
                />
                {label}
              </label>
            ))}
          </div>
        )}

        <button type="submit" style={{marginTop: "1rem", padding: ".6rem 1rem"}}>登録する</button>
      </form>

      <h2 style={{marginTop: "2rem"}}>{date} の予定</h2>
      {events.length === 0 ? (
        <p>登録された予定はありません。</p>
      ) : (
        <ul>
          {events.map(ev => (
            <li key={ev.id} style={{margin: ".25rem 0"}}>
              <strong>{ev.title}</strong>
              <span>（{(ev.slots || ['全日']).join('・')}）</span>
              {ev.memo ? <div style={{fontSize: ".9em", opacity: .8}}>{ev.memo}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
