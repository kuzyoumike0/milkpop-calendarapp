// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../common.css";

const SharePage = () => {
  const { token } = useParams();
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // 🔹 集計APIを呼ぶ
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/schedules/${token}/aggregate`
      );
      const data = await res.json();

      setTitle(data.title || "");

      // 🔹 日付・ユーザー名・参加状況の配列に変換
      const tableRows = [];
      Object.entries(data).forEach(([dateKey, responses]) => {
        responses.forEach((r) => {
          tableRows.push({
            date: dateKey,
            username: r.username || "（未入力）",
            status: r.status,
          });
        });
      });

      setRows(tableRows);
    };
    fetchData();
  }, [token]);

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>
      {title && <h3>{title}</h3>}

      {rows.length === 0 ? (
        <p>まだ回答がありません。</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>ユーザー名</th>
              <th>参加状況</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.username}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SharePage;
