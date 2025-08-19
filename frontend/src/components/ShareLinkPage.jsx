import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const socket = io(); // サーバーと同じオリジンに接続

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [myChoices, setMyChoices] = useState({});

  // データ取得
  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/link/${linkId}`);
      setSchedules(res.data.schedules || []);
      setResponses(res.data.responses || []);
    } catch (err) {
      console.error("データ取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchData();
    socket.emit("joinLink", linkId);
    socket.on("responseUpdated", (data) => {
      if (data.linkId === linkId) {
        fetchData();
      }
    });
    return () => {
      socket.off("responseUpdated");
    };
  }, [linkId]);

  // 登録処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const sch of schedules) {
        if (myChoices[sch.id]) {
          await axios.post("/api/respond", {
            linkId,
            date: sch.date,
            timemode: sch.timemode,
            username,
            response: myChoices[sch.id],
          });
        }
      }
      setMyChoices({});
    } catch (err) {
      console.error("登録失敗:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>

      {/* 名前入力 */}
      <div style={{ marginBottom: "15px" }}>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "5px" }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>日付</th>
              <th>タイトル</th>
              <th>時間帯</th>
              <th>あなたの回答</th>
              <th>他の回答</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((sch) => {
              const filtered = responses.filter(
                (r) => r.date === sch.date && r.timemode === sch.timemode
              );
              return (
                <tr key={sch.id}>
                  <td>{new Date(sch.date).toLocaleDateString()}</td>
                  <td>{sch.title}</td>
                  <td>
                    {sch.timemode === "時間指定"
                      ? `${sch.starthour}:00 - ${sch.endhour}:00`
                      : sch.timemode}
                  </td>
                  <td>
                    <select
                      value={myChoices[sch.id] || ""}
                      onChange={(e) =>
                        setMyChoices({ ...myChoices, [sch.id]: e.target.value })
                      }
                    >
                      <option value="">未選択</option>
                      <option value="○">○</option>
                      <option value="✕">✕</option>
                    </select>
                  </td>
                  <td>
                    {filtered.map((r, idx) => (
                      <div key={idx}>
                        {r.username}: {r.response}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          type="submit"
          style={{ marginTop: "15px", padding: "8px 15px", cursor: "pointer" }}
        >
          登録
        </button>
      </form>
    </div>
  );
}
