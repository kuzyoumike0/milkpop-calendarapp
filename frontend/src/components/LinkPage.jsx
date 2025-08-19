const handleSubmit = async () => {
  try {
    let start_date, end_date, dates = [];

    if (rangeMode === "範囲選択") {
      if (Array.isArray(dateRange)) {
        start_date = dateRange[0];
        end_date = dateRange[1];
      } else {
        start_date = dateRange;
        end_date = dateRange;
      }
    } else {
      // 複数選択
      const sorted = [...dateRange].sort((a, b) => a - b);
      start_date = sorted[0];
      end_date = sorted[sorted.length - 1];
      dates = sorted; // ← 複数日をそのまま渡す
    }

    const res = await axios.post("/api/schedule", {
      title,
      start_date: start_date.toISOString().slice(0, 10),
      end_date: end_date.toISOString().slice(0, 10),
      timeslot,
      range_mode: rangeMode,
      dates: dates.map(d => d.toISOString().slice(0, 10)) // ← ここ追加
    });

    if (res.data && res.data.url) {
      setShareUrl(window.location.origin + res.data.url);
    } else {
      alert("リンク発行に失敗しました");
    }
  } catch (err) {
    console.error(err);
    alert("サーバーエラーが発生しました");
  }
};
