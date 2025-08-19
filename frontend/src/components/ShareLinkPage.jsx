import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams(); // URLパラメータからlinkId取得
  const [schedules, setSchedules] = useState([]);

  // === DBからスケジュール取得 ===
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      <p>リンクID: {linkId}</p>

      {/* 一覧表示 */}
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>ユーザー</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((s, i) => (
              <tr key={i}>
                <td>{s.date}</td>
                <td>{s.timeslot}</td>
                <td>{s.username}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">まだ登録はありません</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
