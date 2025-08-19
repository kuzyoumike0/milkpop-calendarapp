import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

// 開発と本番でURLを切り替え
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://あなたのRailwayドメイン.up.railway.app"
    : "http://localhost:8080";

const socket = io(SOCKET_URL);

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");

  // データ取得
  useEffect(() => {
    axios
      .get(`/api/schedules/${linkId}`)
      .then((res) => {
        setTitle(res.data.title);
        setDates(res.data.dates);
        setResponses(res.data.responses || {});
      })
      .catch((err) => console.error("取得失敗:", err));

    socket.emit("join", linkId);

    socket.on("updateResponses", (data) => {
      setResponses(data);
    });

    return () => {
      socket.off("updateResponses");
    };
  }, [linkId]);

  const handleResponse = async (date, status) => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }

    try {
      await axios.post("/api/response", {
        linkId,
        username,
        date,
        status,
      });
      // 自分はサーバーのSocket更新で反映される
    } catch (err) {
      console.error("保存失敗:", err);
      alert("保存に失敗しました");
    }
  };

  // 登録されている全ユーザーを列ヘッダに出す
  const allUsers = Array.from(
    new Set(
      Object.values(responses)
        .map((r) => Object.keys(r))
        .flat()
    )
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール: {title}</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="名前を入力"
        />
      </div>

      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>日付</th>
            {allUsers.map((u, idx) => (
              <th key={idx}>{u}</th>
            ))}
            {username && !allUsers.includes(username) && <th>{username}</th>}
          </tr>
        </thead>
        <tbody>
          {dates.map((d, idx) => (
            <tr key={idx}>
              <td>{d}</td>
              {allUsers.map((u, i) => (
                <td key={i}>{responses[d]?.[u] || ""}</td>
              ))}
              {username && !allUsers.includes(username) && (
                <td>
                  <select
                    onChange={(e) => handleResponse(d, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -
                    </option>
                    <option value="◯">◯</option>
                    <option value="✕">✕</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "10px" }}>
        ※名前を入力して、各日付に◯か✕を選択してください
      </p>
    </div>
  );
}
