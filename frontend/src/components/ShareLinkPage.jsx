import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ date: "", category: "allDay", startTime: "01:00", endTime: "00:00" });

  useEffect(() => {
    axios
      .get(`/api/shared/${linkId}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("共有リンク取得失敗:", err));
  }, [linkId]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/shared/${linkId}/${id}`, {
        data: { username },
      });
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      console.error("削除失敗:", err);
      alert("削除できません（本人以外の可能性）");
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setEditData({
      date: event.date,
      category: event.category,
      startTime: event.starttime || "01:00",
      endTime: event.endtime || "00:00",
    });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`/api/shared/${linkId}/${editingId}`, {
        ...editData,
        username,
      });

      setEvents(events.map((e) => (e.id === editingId ? res.data : e)));
      setEditingId(null);
    } catch (err) {
      console.error("編集失敗:", err);
      alert("編集できません（本人以外の可能性）");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有された予定</h2>

      <div>
        <label>あなたの名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="自分の名前を入力"
        />
      </div>

      {events.length === 0 ? (
        <p>予定はありません</p>
      ) : (
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              {editingId === e.id ? (
                <div>
                  📅 <input
                    type="date"
                    value={editData.date}
                    onChange={(ev) => setEditData({ ...editData, date: ev.target.value })}
                  />
                  🏷 <select
                    value={editData.category}
                    onChange={(ev) => setEditData({ ...editData, category: ev.target.value })}
                  >
                    <option value="allDay">終日</option>
                    <option value="day">昼</option>
                    <option value="night">夜</option>
                    <option value="custom">時間帯指定</option>
                  </select>
                  {editData.category === "custom" && (
                    <>
                      <select
                        value={editData.startTime}
                        onChange={(ev) => setEditData({ ...editData, startTime: ev.target.value })}
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                      〜
                      <select
                        value={editData.endTime}
                        onChange={(ev) => setEditData({ ...editData, endTime: ev.target.value })}
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  <button onClick={handleSave}>保存</button>
                  <button onClick={() => setEditingId(null)}>キャンセル</button>
                </div>
              ) : (
                <div>
                  📅 {e.date} — 👤 {e.username} — 🏷 {e.category}
                  {e.category === "custom" && `（${e.starttime}～${e.endtime}）`}
                  {username && e.username === username && (
                    <>
                      <button style={{ marginLeft: "10px" }} onClick={() => handleEdit(e)}>編集</button>
                      <button style={{ marginLeft: "10px", color: "red" }} onClick={() => handleDelete(e.id)}>削除</button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
