import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");

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
      setEvents(events.filter((e) => e.id !== id)); // ローカル削除
    } catch (err) {
      console.error("削除失敗:", err);
      alert("削除できません（本人以外の可能性）");
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
          {events.map((e, i) => (
            <li key={i}>
              📅 {e.date} — 👤 {e.username} — 🏷 {e.category}
              {e.category === "custom" &&
                `（${e.starttime}～${e.endtime}）`}
              {username && e.username === username && (
                <button
                  style={{ marginLeft: "10px", color: "red" }}
                  onClick={() => handleDelete(e.id)}
                >
                  削除
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
