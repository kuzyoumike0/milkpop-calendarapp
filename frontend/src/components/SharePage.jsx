// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharePage = () => {
  const { id } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);

  const shareUrl = `${window.location.origin}/share/${id}`;

  // ===== スケジュール取得 =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${id}`);
        const data = await res.json();
        if (data.ok) {
          setScheduleData(data.data);
        }
      } catch (err) {
        console.error("❌ スケジュール取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [id]);

  return (
    <div className="page-container">
      <h2 className="page-title">共有ページ</h2>

      {/* 登録された日程リスト */}
      <h3>登録された日程</h3>
      {loading && <p>読み込み中...</p>}
      {!loading && scheduleData && scheduleData.dates?.length === 0 && (
        <p>登録された日程はありません。</p>
      )}
      {!loading && scheduleData && scheduleData.dates?.length > 0 && (
        <ul className="schedule-list">
          {scheduleData.dates.map((d, i) => {
            const dateStr = new Date(d).toDateString();
            const option = scheduleData.options[dateStr];
            return (
              <li key={i} className="schedule-item">
                <strong>{new Date(d).toLocaleDateString()}</strong>
                <span>（{option?.type || "終日"}）</span>
                {option?.type === "時刻指定" && (
                  <span> {option.start}〜{option.end}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* 下部に共有リンクを表示 */}
      <div className="share-link-section">
        <h3>このページの共有リンク</h3>
        <p className="share-link">
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </p>
      </div>
    </div>
  );
};

export default SharePage;
