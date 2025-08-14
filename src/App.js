<select
  value={newSchedule.title}
  onChange={e => {
    const title = e.target.value;
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    let start, end;

    if (title === "全日") {
      start = `${today}T10:00`;
      end   = `${today}T23:59`; // 0時前まで
    } else if (title === "昼") {
      start = `${today}T13:00`;
      end   = `${today}T19:00`;
    } else if (title === "夜") {
      start = `${today}T21:00`;
      end   = `${today}T23:59`; // 翌0時まで
    } else {
      start = "";
      end = "";
    }

    setNewSchedule({
      ...newSchedule,
      title,
      start_time: start,
      end_time: end
    });
  }}
>
  <option value="">シフト選択</option>
  <option value="全日">全日 (10:00～0:00)</option>
  <option value="昼">昼 (13:00～19:00)</option>
  <option value="夜">夜 (21:00～0:00)</option>
</select>
