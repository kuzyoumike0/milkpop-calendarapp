import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const SharePage = () => {
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    // 仮のデータ（API連携を後で組み込む）
    setSchedule({
      title: "サンプルイベント",
      dates: ["2025-08-23", "2025-08-24"]
    });
  }, []);

  return (
    <div className="page-container">
      <main>
        <h2 className="page-title">共有ページ</h2>
        {schedule ? (
          <>
            <p>イベントタイトル: {schedule.title}</p>
            <Calendar
              value={schedule.dates.map((d) => new Date(d))}
              className="custom-calendar"
              tileClassName={({ date, view }) => {
                if (
                  schedule.dates.find(
                    (d) => new Date(d).toDateString() === date.toDateString()
                  )
                ) {
                  return "react-calendar__tile--active";
                }
                return null;
              }}
            />
          </>
        ) : (
          <p>読み込み中...</p>
        )}
      </main>
    </div>
  );
};

export default SharePage;
