import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io(); // 同一オリジンに接続

export default function ShareLinkPage() {
  const { id } = useParams(); // URLのlinkId
  const [username, setUsername] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);

  // ===== データ取得 =====
  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/link/${id}`);
      setSchedules(res.data.schedules);
      setResponses(res.data.responses);
    } catch (err) {
      console.error("取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchData();
    socket.emit("join", id);

    socket.on("update", (data) => {
      fetchData();
    });

    return () => {
      socket.off("update");
    };
  }, [id]);

  // ===== 保存処理 =====
  const handleSave = async (answer) => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post("/api/respond", {
        linkId: id,
        username,
        answer,
      });
    } catch (err) {
      console.error("登録失敗:", err);
    }
  };

  // ===== 表示用：ある人の回答を取得 =====
  const getAnswer = (uname) => {
    const r = responses.find((r) => r.username === uname);
    return r ? r.answer : "";
  };

  // ===== 表示用：登録済みユーザー一覧 =====
  const uniqueUsers = [...new Set(responses.map((r) => r.username))];

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール回答ページ</h2>
      <p>リンクID: {id}</p>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "5px" }}
        />
      </div>

      <h3>登録された日程</h3>
      {schedules.length === 0 && <p>まだ日程がありません。</p>}
      <ul>
        {schedules.map((s, i) => (
          <li key={i}>
            {s.date} {s.title} [{s.timemode}]
            {s.timemode === "時間指定" && ` ${s.starthour}時〜${s.endhour}時`}
            <div>
              <select
                onChange={(e) => handleSave(e.target.value)}
                defaultValue=""
                style={{ marginTop: "5px" }}
              >
                <option value="" disabled>
                  回答を選択
                </option>
                <option value="〇">〇</option>
                <option value="×">×</option>
              </select>
            </div>
          </li>
        ))}
      </ul>

      <h3>参加者の回答一覧</h3>
      {uniqueUsers.length === 0 && <p>まだ回答がありません。</p>}
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>名前</th>
            <th>回答</th>
          </tr>
        </thead>
        <tbody>
          {uniqueUsers.map((uname, i) => (
            <tr key={i}>
              <td>{uname}</td>
              <td>{getAnswer(uname)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
